import React from "react";
import { NavLink } from "react-router-dom"; // Use NavLink for active styling

const NavBar = () => {
  return (
    <>
      <style>{`
        /* Hover effects for nav links */
        .nav-link {
          position: relative;
          text-decoration: none; /* Ensure NavLink doesn't have default underline */
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
        .nav-link:hover::after, .nav-link.active::after {
          width: 100%; /* Underline on hover AND when active */
        }
        .nav-link.active {
          color: #FFFFFF; /* Make active link white */
        }

        /* Button hover effects */
        .login-button:hover {
          background-color: rgba(0, 168, 255, 0.2);
        }
        .signup-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px #00A8FF;
        }
      `}</style>

      <header style={styles.header}>
        <NavLink to="/" style={styles.logoLink}>
          <div style={styles.logo}>AUTOMECH</div>
        </NavLink>
        <nav style={styles.nav}>
          <NavLink to="/services" className="nav-link" style={styles.navLink}>
            Services
          </NavLink>
          {/* These can be updated to real routes later */}
          <NavLink to="/explore" className="nav-link" style={styles.navLink}>
            Explore Us
          </NavLink>
          <NavLink to="/booking" className="nav-link" style={styles.navLink}>
            Book Service
          </NavLink>
          <NavLink to="/clients" className="nav-link" style={styles.navLink}>
            Meet Clients
          </NavLink>
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

// --- STYLES FOR NAVBAR ---
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
    zIndex: 1000,
    boxSizing: "border-box",
  },
  logoLink: {
    textDecoration: "none",
    color: "inherit",
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
