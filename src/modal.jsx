import React from "react";
import { useNavigate } from "react-router-dom";

// --- Default Profile Picture Icon ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(255, 255, 255, 0.7)" // Brighter stroke for better visibility
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const ProfileModal = ({ userProfile, isOpen, onNavigate }) => {
  const navigate = useNavigate();

  if (!userProfile) return null;

  return (
    <div
      style={{ ...styles.modalContainer, ...(isOpen ? styles.modalOpen : {}) }}
    >
      <div style={styles.profileHeader}>
        {userProfile.avatar_url ? (
          <img
            src={userProfile.avatar_url}
            alt="Profile"
            style={styles.avatar}
          />
        ) : (
          <div style={styles.defaultAvatar}>
            <UserIcon />
          </div>
        )}
        <h3 style={styles.profileName}>{userProfile.username || "New User"}</h3>
      </div>

      <button
        onClick={() => navigate("/my-bookings")}
        style={styles.bookingsButton}
      >
        My Bookings
      </button>

      <div style={styles.divider}></div>

      <div style={styles.profileBody}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Bio</span>
          <p style={styles.infoText}>{userProfile.bio || "No bio yet."}</p>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Car Owned</span>
          <p style={styles.infoText}>
            {userProfile.vehicle_type || "Not specified"}
          </p>
        </div>
      </div>

      <button onClick={onNavigate} style={styles.editButton}>
        Edit Profile
      </button>
    </div>
  );
};

const styles = {
  modalContainer: {
    position: "absolute",
    top: "calc(100% + 15px)",
    right: 0,
    width: "320px",
    // --- UPDATED FOR HIGH CONTRAST & READABILITY ---
    backgroundColor: "#111524", // A solid, very dark blue
    border: "1px solid rgba(100, 120, 255, 0.3)", // A subtle border
    borderRadius: "16px",
    padding: "25px",
    zIndex: 200,
    color: "#fff",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
    // Animation styles remain the same
    opacity: 0,
    transform: "translateY(-10px) scale(0.98)",
    transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
    pointerEvents: "none",
  },
  modalOpen: {
    opacity: 1,
    transform: "translateY(0) scale(1)",
    pointerEvents: "auto",
  },
  profileHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #00A8FF",
  },
  defaultAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "2px solid rgba(255, 255, 255, 0.2)",
  },
  profileName: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0,
    color: "#FFFFFF", // Ensure pure white for max contrast
  },
  bookingsButton: {
    width: "100%",
    textAlign: "center",
    padding: "10px",
    marginTop: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    color: "#E0E0E0",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    margin: "20px 0",
  },
  profileBody: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  infoRow: {
    textAlign: "left",
  },
  infoLabel: {
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "rgba(255, 255, 255, 0.7)", // Brighter label color
  },
  infoText: {
    fontSize: "1rem",
    margin: "4px 0 0 0",
    fontWeight: "500",
    color: "#FFFFFF", // Ensure pure white for max contrast
  },
  editButton: {
    width: "100%",
    marginTop: "25px",
    padding: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "rgba(0, 168, 255, 0.25)",
    border: "1px solid #00A8FF",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};

export default ProfileModal;
