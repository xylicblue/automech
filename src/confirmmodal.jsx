import React from "react";

// --- ICONS ---
const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={{ ...styles.modal, ...(isOpen && styles.modalOpen) }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.iconWrapper}>
          <WarningIcon />
        </div>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.cancelButton }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{ ...styles.button, ...styles.confirmButton }}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000, // Ensure it's on top of everything
  },
  modal: {
    backgroundColor: "rgba(20, 20, 35, 0.95)",
    border: "1px solid rgba(220, 53, 69, 0.4)",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "480px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    transform: "scale(0.95)",
    opacity: 0,
    transition: "all 0.2s ease-out",
  },
  modalOpen: {
    transform: "scale(1)",
    opacity: 1,
  },
  iconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "rgba(220, 53, 69, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#dc3545",
    marginBottom: "10px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
  },
  message: {
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.7)",
    maxWidth: "380px",
    lineHeight: 1.5,
    margin: "0 0 15px 0",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    width: "100%",
    marginTop: "15px",
  },
  button: {
    flex: 1,
    fontFamily: "'Inter', sans-serif",
    fontSize: "1rem",
    fontWeight: "600",
    padding: "12px 30px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  cancelButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
  },
  confirmButton: {
    background: "#dc3545",
    color: "#FFFFFF",
  },
};

export default ConfirmModal;
