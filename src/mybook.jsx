import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import BackgroundWrapper from "./background";
import NavBar from "./navbar";
import LoadingSpinner from "./loading";
import Footer from "./footer";

// --- ICONS for status badges and delete ---
const TickIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
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
const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);
const CrossIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const MyBookings = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRequests = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) console.error("Error fetching user requests:", error);
      else setRequests(data);
      setLoading(false);
    };
    fetchUserRequests();
  }, [navigate]);

  // --- NEW DELETE FUNCTION ---
  const handleDeleteRequest = async (requestId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to cancel this service request?"
    );
    if (!isConfirmed) return;

    const { error } = await supabase
      .from("service_requests")
      .delete()
      .eq("id", requestId);

    if (error) {
      alert("Error cancelling request: " + error.message);
    } else {
      // Instantly remove the request from the UI
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== requestId)
      );
      alert("Your request has been cancelled.");
    }
  };

  const getStatusBadge = (status) => {
    // ... (getStatusBadge function remains the same)
    const style = {
      ...styles.statusBadge,
      ...styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`],
    };
    let icon = null;
    if (status === "confirmed") icon = <TickIcon />;
    if (status === "pending") icon = <ClockIcon />;
    if (status === "rejected") icon = <CrossIcon />;
    return (
      <div style={style}>
        {icon}
        <span>{status}</span>
      </div>
    );
  };

  return (
    <BackgroundWrapper>
      <div style={styles.pageWrapper}>
        <NavBar />
        <div style={styles.pageContainer}>
          {loading ? (
            <LoadingSpinner text="Loading Booking Requests..." />
          ) : (
            <>
              <h1 style={styles.pageTitle}>My Service Bookings</h1>
              {requests.length === 0 ? (
                <div style={styles.noRequestsContainer}>
                  <p style={styles.noRequests}>
                    You haven't booked any services yet.
                  </p>
                  <button
                    onClick={() => navigate("/book-service")}
                    style={styles.bookButton}
                  >
                    Book a Service
                  </button>
                </div>
              ) : (
                <div style={styles.requestsList}>
                  {requests.map((req) => (
                    <div key={req.id} style={styles.card}>
                      <div style={styles.cardMain}>
                        <div style={styles.serviceDetails}>
                          <span style={styles.date}>
                            {new Date(req.preferred_date).toDateString()}
                          </span>
                          <h3 style={styles.vehicleModel}>
                            {req.vehicle_model}
                          </h3>
                          <p style={styles.serviceNames}>
                            {req.selected_services
                              .map((s) => s.name)
                              .join(", ")}
                          </p>
                        </div>
                        <div style={styles.priceAndStatus}>
                          <span style={styles.totalPrice}>
                            ${req.total_price.toFixed(2)}
                          </span>
                          {getStatusBadge(req.status)}
                        </div>
                      </div>
                      {/* --- CONDITIONAL DELETE BUTTON --- */}
                      {req.status === "pending" && (
                        <div style={styles.cardFooter}>
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            style={styles.cancelButton}
                          >
                            <TrashIcon />
                            <span>Cancel Request</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer></Footer>
    </BackgroundWrapper>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Exo 2', sans-serif",
  },
  pageContainer: {
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto",
    padding: "120px 40px 40px",
    color: "#fff",
    flex: "1 0 auto",
  },
  loading: {
    color: "#fff",
    fontSize: "2rem",
    textAlign: "center",
    paddingTop: "40vh",
    minHeight: "100vh",
  },
  pageTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "50px",
  },
  noRequestsContainer: { textAlign: "center", marginTop: "50px" },
  noRequests: { fontSize: "1.2rem", color: "rgba(255,255,255,0.6)" },
  bookButton: {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: "1rem",
    fontWeight: "600",
    padding: "12px 30px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    color: "#FFFFFF",
    marginTop: "20px",
  },
  requestsList: { display: "flex", flexDirection: "column", gap: "20px" },
  card: {
    backgroundColor: "rgba(20, 20, 35, 0.65)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "16px",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  cardMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },
  serviceDetails: { display: "flex", flexDirection: "column", gap: "5px" },
  date: { fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" },
  vehicleModel: { fontSize: "1.4rem", fontWeight: "600", margin: 0 },
  serviceNames: { fontSize: "1rem", color: "rgba(255,255,255,0.8)" },
  priceAndStatus: {
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
  },
  totalPrice: { fontWeight: "700", fontSize: "1.5rem", color: "#00A8FF" },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusConfirmed: {
    backgroundColor: "rgba(40, 167, 69, 0.2)",
    color: "#28a745",
  },
  statusPending: {
    backgroundColor: "rgba(255, 193, 7, 0.2)",
    color: "#ffc107",
  },
  statusRejected: {
    backgroundColor: "rgba(220, 53, 69, 0.2)",
    color: "#dc3545",
  },
  // --- NEW STYLES FOR DELETE BUTTON ---
  cardFooter: {
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "15px",
    display: "flex",
    justifyContent: "flex-end",
  },
  cancelButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(220, 53, 69, 0.2)",
    color: "#dc3545",
    border: "1px solid rgba(220, 53, 69, 0.4)",
    padding: "8px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
  },
};

export default MyBookings;
