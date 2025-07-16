import React from "react";
import BackgroundWrapper from "./background";
import { useNavigate } from "react-router-dom";
import NavBar from "./navbar"; // The smart NavBar
import Footer from "./footer";

const statsData = [
  { number: "1000+", text: "Satisfied Clients" },
  { number: "20+", text: "Years of Experience" },
  { number: "ASE", text: "Certified Technicians" },
  { number: "50-Point", text: "Safety Inspections" },
  { number: "OEM", text: "Quality Parts" },
  { number: "Advanced", text: "Diagnostics" },
];

const Dashboard = () => {
  const Navigate = useNavigate();

  return (
    <>
      <style>{`
                @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                /* You can keep other page-specific hover effects here if needed */
                .cta-button:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 0 30px rgba(0, 168, 255, 0.8); }
            `}</style>
      <BackgroundWrapper style={styles.backgroundWrapper}>
        <div style={styles.auroraGlowContainer}>
          <div style={styles.auroraGlowBlue}></div>
          <div style={styles.auroraGlowPurple}></div>
        </div>

        <div style={styles.pageContainer}>
          {/* NavBar is now completely self-contained */}
          <NavBar />

          <main style={styles.heroSection}>
            <h1 style={styles.headline}>
              Precision Engineering. Peak Performance.
            </h1>
            <p style={styles.subHeadline}>
              State-of-the-art diagnostics and expert technicians dedicated to
              perfecting your vehicle.
            </p>
            <button
              className="cta-button"
              style={styles.ctaButton}
              onClick={() => {
                Navigate("/booking");
              }}
            >
              Schedule Your Service
            </button>
          </main>

          <div style={styles.statsBar}>
            <div style={styles.statsWrapper}>
              {[...statsData, ...statsData].map((stat, index) => (
                <div key={index} style={styles.statItem}>
                  <span style={styles.statNumber}>{stat.number}</span>
                  <span style={styles.statText}>{stat.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </BackgroundWrapper>
    </>
  );
};

// --- STYLES ---
const styles = {
  backgroundWrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  pageContainer: {
    fontFamily: "'Exo 2', sans-serif",
    color: "#FFFFFF",
    flex: "1 0 auto",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 2,
  },
  heroSection: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "120px 5% 50px",
  },
  auroraGlowContainer: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    zIndex: 0,
  },
  auroraGlowBlue: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background:
      "radial-gradient(circle, rgba(0, 168, 255, 0.3) 0%, rgba(0,168,255,0) 60%)",
    borderRadius: "50%",
    top: "-150px",
    left: "-150px",
    filter: "blur(50px)",
  },
  auroraGlowPurple: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background:
      "radial-gradient(circle, rgba(100, 80, 255, 0.2) 0%, rgba(100,80,255,0) 60%)",
    borderRadius: "50%",
    bottom: "-100px",
    right: "-100px",
    filter: "blur(50px)",
  },
  headline: {
    fontSize: "5rem",
    fontWeight: "700",
    letterSpacing: "1px",
    lineHeight: "1.1",
    maxWidth: "900px",
    textShadow: "0 0 20px rgba(0, 168, 255, 0.6)",
  },
  subHeadline: {
    fontSize: "1.2rem",
    maxWidth: "600px",
    margin: "20px 0 40px 0",
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: "1.6",
  },
  ctaButton: {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: "1.2rem",
    fontWeight: "700",
    padding: "18px 40px",
    color: "#FFFFFF",
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
    boxShadow: "0 0 15px rgba(0, 168, 255, 0.5)",
  },
  statsBar: {
    width: "100%",
    padding: "50px 0",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  statsWrapper: {
    display: "inline-block",
    animation: "scroll 30s linear infinite",
  },
  statItem: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "0 40px",
  },
  statNumber: { fontSize: "2rem", fontWeight: "700", color: "#00A8FF" },
  statText: {
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "rgba(255, 255, 255, 0.7)",
  },
};

export default Dashboard;
