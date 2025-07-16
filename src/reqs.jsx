import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import BackgroundWrapper from "./background";
import NavBar from "./navbar";
import LoadingSpinner from "./loading";

// --- ICONS ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const TickIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const BookingRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        alert("Access Denied: You must be an admin to view this page.");
        navigate("/dashboard");
        return;
      }

      const { data: requestData, error } = await supabase
        .from("service_requests")
        .select(`*, profiles (*)`)
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) console.error("Error fetching requests:", error);
      else
        setRequests(
          requestData.map((r) => ({ ...r, visualStatus: "pending" }))
        ); // Add visual status
      setLoading(false);
    };
    fetchRequests();
  }, [navigate]);

  const handleUpdateRequest = async (requestId, newStatus) => {
    setUpdatingId(requestId);

    // First, update the visual state of the card immediately
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, visualStatus: newStatus } : req
      )
    );

    const { error } = await supabase
      .from("service_requests")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (error) {
      alert(`Error updating request: ${error.message}`);
      // Revert visual state on error
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, visualStatus: "pending" } : req
        )
      );
    } else {
      // If successful, wait a moment then remove the card from the UI
      setTimeout(() => {
        setRequests((prevRequests) =>
          prevRequests.filter((req) => req.id !== requestId)
        );
      }, 1500); // Wait 1.5 seconds before removing
    }
    // Note: We don't reset updatingId here so the buttons stay disabled
  };

  if (loading) {
    return <LoadingSpinner text="Loading Booking Requests..." />;
  }

  return (
    <BackgroundWrapper>
      <div style={styles.pageContainer}>
        <NavBar></NavBar>
        <h1 style={styles.pageTitle}>Pending Service Requests</h1>
        {requests.length === 0 ? (
          <p style={styles.noRequests}>
            There are no pending requests at this time.
          </p>
        ) : (
          <div style={styles.grid}>
            {requests.map((req) => (
              <div
                key={req.id}
                style={{
                  ...styles.card,
                  ...(req.visualStatus !== "pending" && styles.cardFading),
                }}
              >
                <div style={styles.cardHeader}>
                  {req.profiles.avatar_url ? (
                    <img
                      src={req.profiles.avatar_url}
                      alt="user avatar"
                      style={styles.avatar}
                    />
                  ) : (
                    <div style={styles.defaultAvatar}>
                      <UserIcon />
                    </div>
                  )}
                  <div style={styles.headerText}>
                    <h3 style={styles.username}>{req.profiles.username}</h3>
                    <p style={styles.vehicleModel}>{req.vehicle_model}</p>
                  </div>
                </div>
                <div style={styles.serviceList}>
                  {req.selected_services.map((service) => (
                    <div key={service.id} style={styles.serviceItem}>
                      <span>{service.name}</span>
                      <span>${service.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={styles.detailsRow}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Preferred Date</span>
                    <span style={styles.detailValue}>
                      {new Date(req.preferred_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ ...styles.detailItem, alignItems: "flex-end" }}>
                    <span style={styles.detailLabel}>Total Price</span>
                    <span style={styles.totalPrice}>
                      ${req.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* --- DYNAMIC ACTION BUTTONS / STATUS --- */}
                {req.visualStatus === "pending" ? (
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => handleUpdateRequest(req.id, "rejected")}
                      style={{ ...styles.button, ...styles.rejectButton }}
                      disabled={updatingId === req.id}
                    >
                      {updatingId === req.id ? "..." : "Reject"}
                    </button>
                    <button
                      onClick={() => handleUpdateRequest(req.id, "confirmed")}
                      style={{ ...styles.button, ...styles.acceptButton }}
                      disabled={updatingId === req.id}
                    >
                      {updatingId === req.id ? "..." : "Accept"}
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      ...styles.statusBadge,
                      ...(req.visualStatus === "confirmed"
                        ? styles.statusConfirmed
                        : styles.statusRejected),
                    }}
                  >
                    <TickIcon />
                    <span>
                      {req.visualStatus === "confirmed"
                        ? "Accepted"
                        : "Rejected"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BackgroundWrapper>
  );
};

// --- STYLES ---
const styles = {
  // ... all other styles are the same, just add cardFading and status badges ...
  pageContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "120px 40px 40px",
    fontFamily: "'Inter', sans-serif",
    color: "#fff",
  },
  loading: {
    color: "#fff",
    fontSize: "2rem",
    textAlign: "center",
    paddingTop: "20vh",
  },
  pageTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "50px",
  },
  noRequests: {
    fontSize: "1.2rem",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "30px",
  },
  card: {
    backgroundColor: "rgba(20, 20, 35, 0.65)",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "16px",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    transition: "opacity 0.5s ease",
  },
  cardFading: { opacity: 0.5 },
  cardHeader: { display: "flex", alignItems: "center", gap: "15px" },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  defaultAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerText: { display: "flex", flexDirection: "column" },
  username: { fontSize: "1.2rem", fontWeight: "600" },
  vehicleModel: { fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" },
  serviceList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    padding: "15px 0",
  },
  serviceItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.95rem",
  },
  detailsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailItem: { display: "flex", flexDirection: "column", gap: "2px" },
  detailLabel: {
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
  },
  detailValue: { fontWeight: "500" },
  totalPrice: { fontWeight: "700", fontSize: "1.5rem", color: "#00A8FF" },
  actionButtons: { display: "flex", gap: "15px", marginTop: "10px" },
  button: {
    flex: 1,
    padding: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  acceptButton: {
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    color: "#fff",
  },
  rejectButton: { backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    marginTop: "10px",
  },
  statusConfirmed: {
    backgroundColor: "rgba(40, 167, 69, 0.25)",
    color: "#28a745",
  },
  statusRejected: {
    backgroundColor: "rgba(220, 53, 69, 0.2)",
    color: "#dc3545",
  },
};

export default BookingRequests;
