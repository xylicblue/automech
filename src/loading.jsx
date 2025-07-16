import React from "react";
import BackgroundWrapper from "./background"; // For a consistent background

const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <BackgroundWrapper>
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>
          <div style={styles.innerSpinner}></div>
        </div>
        <p style={styles.loadingText}>{text}</p>
      </div>

      <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(0, 168, 255, 0.7); }
                    70% { box-shadow: 0 0 0 20px rgba(0, 168, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 168, 255, 0); }
                }
            `}</style>
    </BackgroundWrapper>
  );
};

const styles = {
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    color: "#fff",
    fontFamily: "'Exo 2', sans-serif",
  },
  spinner: {
    width: "80px",
    height: "80px",
    border: "5px solid rgba(0, 168, 255, 0.2)",
    borderTopColor: "#00A8FF",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    position: "relative",
    boxShadow: "0 0 20px rgba(0, 168, 255, 0.3)",
  },
  innerSpinner: {
    position: "absolute",
    top: "10px",
    left: "10px",
    width: "50px",
    height: "50px",
    border: "5px solid transparent",
    borderBottomColor: "#00A8FF",
    borderRadius: "50%",
    animation: "spin 1.5s linear infinite reverse",
  },
  loadingText: {
    marginTop: "25px",
    fontSize: "1.2rem",
    letterSpacing: "2px",
    textTransform: "uppercase",
    animation: "pulse 2s infinite",
  },
};

export default LoadingSpinner;
