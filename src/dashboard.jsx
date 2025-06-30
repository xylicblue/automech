import React from "react";
import BackgroundWrapper from "./background";
import { useNavigate } from "react-router-dom";
import NavBar from "./navbar";

// Data for our scrolling stats bar
const statsData = [
  { number: "1000+", text: "Satisfied Clients" },
  { number: "20+", text: "Years of Experience" },
  { number: "ASE", text: "Certified Technicians" },
  { number: "50-Point", text: "Safety Inspections" },
  { number: "OEM", text: "Quality Parts" },
  { number: "Advanced", text: "Diagnostics" }, // Added one more for better spacing
];

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #00A8FF;
          transition: width 0.3s ease-in-out;
        }
        .nav-link:hover::after {
          width: 100%;
        }

        .login-button:hover {
          background-color: rgba(0, 168, 255, 0.2);
        }
        .signup-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px #00A8FF;
        }
        .cta-button:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 0 30px rgba(0, 168, 255, 0.8);
        }
      `}</style>

      <BackgroundWrapper>
        <div style={styles.auroraGlowContainer}>
          <div style={styles.auroraGlowBlue}></div>
          <div style={styles.auroraGlowPurple}></div>
        </div>

        <div style={styles.pageContainer}>
          <NavBar />
          <header style={styles.header}>
            <div style={styles.logo}>AUTOMECH</div>
            <nav style={styles.nav}>
              <a
                // href="#services"
                className="nav-link"
                style={styles.navLink}
                onClick={() => {
                  navigate("/services");
                }}
              >
                Services
              </a>
              <a href="#explore" className="nav-link" style={styles.navLink}>
                Explore Us
              </a>
              <a href="#booking" className="nav-link" style={styles.navLink}>
                Book Service
              </a>
              <a href="#clients" className="nav-link" style={styles.navLink}>
                Meet Clients
              </a>
            </nav>
            <div style={styles.authButtons}>
              <button
                className="login-button"
                style={{ ...styles.authButton, ...styles.loginButton }}
              >
                Login
              </button>
              <button
                className="signup-button"
                style={{ ...styles.authButton, ...styles.signupButton }}
              >
                Sign Up
              </button>
            </div>
          </header>

          <main style={styles.heroSection}>
            <h1 style={styles.headline}>
              Precision Engineering. Peak Performance.
            </h1>
            <p style={styles.subHeadline}>
              State-of-the-art diagnostics and expert technicians dedicated to
              perfecting your vehicle.
            </p>
            <button className="cta-button" style={styles.ctaButton}>
              Schedule Your Service
            </button>
          </main>

          {/* SCROLLING STATS BAR */}
          <footer style={styles.statsBar}>
            <div style={styles.statsWrapper}>
              {[...statsData, ...statsData].map((stat, index) => (
                <div key={index} style={styles.statItem}>
                  <span style={styles.statNumber}>{stat.number}</span>
                  <span style={styles.statText}>{stat.text}</span>
                </div>
              ))}
            </div>
          </footer>
        </div>
      </BackgroundWrapper>
    </>
  );
};

// --- STYLES ---

const styles = {
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
  pageContainer: {
    fontFamily: "'Exo 2', sans-serif",
    color: "#FFFFFF",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 2,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 5%",
    backgroundColor: "rgba(10, 10, 20, 0.5)",
    backdropFilter: "blur(15px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    width: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 100,
    boxSizing: "border-box",
  },
  logo: {
    fontSize: "2rem",
    fontWeight: "700",
    letterSpacing: "2px",
    cursor: "pointer",
    textShadow: "0 0 5px rgba(255, 255, 255, 0.5)",
  },
  nav: {
    display: "flex",
    gap: "50px",
  },
  navLink: {
    textDecoration: "none",
    color: "#E0E0E0",
    fontSize: "1rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "color 0.3s ease",
  },
  authButtons: {
    display: "flex",
    gap: "15px",
  },
  authButton: {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: "0.9rem",
    fontWeight: "600",
    padding: "12px 25px",
    border: "1px solid #00A8FF",
    borderRadius: "50px",
    cursor: "pointer",
    background: "transparent",
    color: "#FFF",
    transition: "all 0.3s ease",
  },
  signupButton: {
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    border: "none",
    color: "#FFFFFF",
    textShadow: "0 0 5px rgba(0,0,0,0.2)",
  },
  heroSection: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "80px 5% 0",
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

  // --- MODIFIED STATS BAR ---
  statsBar: {
    width: "100%",
    padding: "50px 0", // Increased vertical padding for the fade effect
    overflow: "hidden",
    whiteSpace: "nowrap",
    // The Magic: This mask creates the fade effect at the top and bottom
    maskImage:
      "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
    WebkitMaskImage:
      "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)", // For Safari/older browsers
  },
  statsWrapper: {
    display: "inline-block",
    animation: "scroll 30s linear infinite", // Slightly slower for a more premium feel
  },
  statItem: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "0 40px",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#00A8FF",
  },
  statText: {
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "rgba(255, 255, 255, 0.7)",
  },
};

export default Dashboard;
