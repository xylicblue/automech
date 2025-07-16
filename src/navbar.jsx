import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import ProfileModal from "./modal";

// --- SVG ICON FOR DEFAULT AVATAR ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LockIcon = () => (
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
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const LoginPromptModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div
        style={{ ...styles.promptModal, ...(isOpen && styles.promptModalOpen) }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.promptIconWrapper}>
          <LockIcon />
        </div>
        <h2 style={styles.promptTitle}>Authentication Required</h2>
        <p style={styles.promptText}>
          Please log in to access this feature and manage your services.
        </p>
        <button style={styles.promptLoginButton} onClick={onLogin}>
          Login to Continue
        </button>
      </div>
    </div>
  );
};

const NavBar = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const modalTimerRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username, avatar_url, role")
          .eq("id", session.user.id)
          .single();
        if (error) {
          console.error("Error fetching navbar profile:", error);
        } else if (profile) {
          setUserProfile(profile);
          if (profile.role === "admin") {
            setIsAdmin(true);
          }
        }
      }
    };
    fetchUserProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUserProfile(null);
        setIsAdmin(false);
      } else {
        fetchUserProfile();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setIsAdmin(false);
    navigate("/");
  };

  const handleMouseEnter = () => {
    clearTimeout(modalTimerRef.current);
    setIsModalOpen(true);
  };

  const handleMouseLeave = () => {
    modalTimerRef.current = setTimeout(() => {
      setIsModalOpen(false);
    }, 200);
  };
  const handleNavClick = (path) => {
    // List of protected routes for guests
    const protectedRoutes = [
      "/booking",
      "/booking-requests",
      "/clients",
      "/my-bookings",
    ];

    if (!userProfile && protectedRoutes.includes(path)) {
      setShowLoginPrompt(true); // Show modal instead of navigating
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <style>{`
        .nav-link { position: relative; cursor: pointer; }
        .nav-link::after { content: ''; position: absolute; width: 0; height: 2px; bottom: -5px; left: 50%; transform: translateX(-50%); background-color: #00A8FF; transition: width 0.3s ease-in-out; }
        .nav-link:hover::after { width: 100%; }
        .login-button:hover { background-color: rgba(0, 168, 255, 0.2); }
        .signup-button:hover, .logout-button:hover { transform: translateY(-2px); box-shadow: 0 0 20px #00A8FF; }
      `}</style>

      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navigate("/")}>
          AUTOMECH
        </div>

        <nav style={styles.nav}>
          <a
            className="nav-link"
            style={styles.navLink}
            onClick={() => handleNavClick("/services")}
          >
            Services
          </a>
          <a
            className="nav-link"
            style={styles.navLink}
            onClick={() => handleNavClick("/explore")}
          >
            Explore Us
          </a>
          {isAdmin ? (
            <a
              onClick={() => handleNavClick("/booking-requests")}
              className="nav-link"
              style={styles.navLink}
            >
              Book Requests
            </a>
          ) : (
            <a
              onClick={() => handleNavClick("/booking")}
              className="nav-link"
              style={styles.navLink}
            >
              Book Service
            </a>
          )}
          <a
            className="nav-link"
            style={styles.navLink}
            onClick={() => handleNavClick("/clients")}
          >
            Meet Clients
          </a>
        </nav>
        <div style={styles.authButtons}>
          {userProfile ? (
            <div style={styles.userSection}>
              <div
                style={styles.profileWrapper}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div style={styles.userDisplayContainer}>
                  {userProfile.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="User Avatar"
                      style={styles.headerAvatar}
                    />
                  ) : (
                    <div style={styles.headerDefaultAvatar}>
                      <UserIcon />
                    </div>
                  )}
                  <div style={styles.usernamePill}>
                    <span style={styles.username}>
                      {userProfile.username.toUpperCase()}
                    </span>
                  </div>
                </div>
                <ProfileModal
                  userProfile={userProfile}
                  isOpen={isModalOpen}
                  onNavigate={() => navigate("/edit-profile")}
                />
              </div>
              <button
                onClick={handleLogout}
                className="logout-button"
                style={{ ...styles.authButton, ...styles.signupButton }}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                className="login-button"
                style={{ ...styles.authButton, ...styles.loginButton }}
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="signup-button"
                style={{ ...styles.authButton, ...styles.signupButton }}
                onClick={() => navigate("/login")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={() => navigate("/login")}
      />
    </>
  );
};

// --- STYLES ---
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
    fontFamily: "'Exo 2', sans-serif",
  },
  logo: {
    fontSize: "2rem",
    fontWeight: "700",
    letterSpacing: "2px",
    cursor: "pointer",
    color: "#FFFFFF", // <-- THE FIX: Explicitly set color to white
    textShadow: "0 0 10px rgba(255, 255, 255, 0.7)", // Adjusted shadow for a cleaner glow
  },
  nav: { display: "flex", gap: "50px" },
  navLink: {
    textDecoration: "none",
    color: "#E0E0E0",
    fontSize: "1rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "color 0.3s ease",
  },
  authButtons: { display: "flex", gap: "15px", alignItems: "center" },
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
  userSection: { display: "flex", alignItems: "center", gap: "20px" },
  profileWrapper: { position: "relative", cursor: "pointer" },
  userDisplayContainer: {
    display: "flex",
    alignItems: "center",
    gap: "-10px",
    backgroundColor: "rgba(30, 30, 45, 0.7)",
    borderRadius: "50px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "background-color 0.2s ease",
  },
  usernamePill: { padding: "8px 18px 8px 25px", borderRadius: "50px" },
  username: { color: "#FFFFFF", fontWeight: "600", fontSize: "1rem" },
  headerAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #00A8FF",
  },
  headerDefaultAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#E0E0E0",
    border: "2px solid rgba(255, 255, 255, 0.2)",
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  promptModal: {
    backgroundColor: "rgba(20, 20, 35, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "450px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    // Animation
    transform: "scale(0.95)",
    opacity: 0,
    transition: "all 0.2s ease-out",
  },
  promptModalOpen: {
    transform: "scale(1)",
    opacity: 1,
  },
  promptIconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 168, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#00A8FF",
    marginBottom: "10px",
  },
  promptTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
  },
  promptText: {
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.7)",
    maxWidth: "350px",
    lineHeight: 1.5,
    margin: "0 0 15px 0",
  },
  promptLoginButton: {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: "1rem",
    fontWeight: "600",
    padding: "12px 30px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    color: "#FFFFFF",
    transition: "all 0.3s ease",
    width: "80%",
  },
};

export default NavBar;
