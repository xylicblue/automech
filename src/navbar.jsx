import React from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Styles specific to the Navbar's interactive elements */}
      <style>{`
        .nav-link {
          position: relative;
          cursor: pointer; /* Added for better UX on the clickable links */
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
      `}</style>

      <header style={styles.header}>
        <div style={styles.logo}>
          <span
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }} // makes it look clickable
          >
            AUTOMECH
          </span>
        </div>
        <nav style={styles.nav}>
          <a
            className="nav-link"
            style={styles.navLink}
            onClick={() => navigate("/services")}
          >
            Services
          </a>
          <a
            className="nav-link"
            style={styles.navLink}
            onClick={() => navigate("/explore")} // Example navigation
          >
            Explore Us
          </a>
          <a
            className="nav-link"
            style={styles.navLink}
            onClick={() => navigate("/booking")} // Example navigation
          >
            Book Service
          </a>
          <a
            className="nav-link"
            style={styles.navLink}
            onClick={() => navigate("/clients")} // Example navigation
          >
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
    </>
  );
};

// Styles specific to the NavBar component
const styles = {
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
};

export default NavBar;
