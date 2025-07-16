import React, { useState, useEffect } from "react";
// Make sure you have this file and it exports the initialized Supabase client
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

// IMPORTANT: Make sure this path points to your background image.
import bg from "./assets/bg3.jpg";

// --- SVG Icons (No changes) ---
const GoogleIcon = () => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    style={{ width: "24px", height: "24px" }}
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    ></path>
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    ></path>
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    ></path>
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    ></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);
const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);
const PasswordIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
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
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
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
const CarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 16.5V15a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1.5M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2zM6.5 16.5h.01M17.5 16.5h.01"></path>
  </svg>
);

// A simple debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const LoginPage = () => {
  const [view, setView] = useState("login"); // login, signupStep1, signupStep2, checkEmail
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const Navigate = useNavigate();

  const [error, setError] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);

  const debouncedUsername = useDebounce(username, 500);

  // Check username uniqueness
  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        setUsernameMessage("");
        return;
      }
      setIsUsernameLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", debouncedUsername)
        .single();
      if (error && error.code !== "PGRST116") {
        setUsernameMessage("Error checking username");
        setIsUsernameAvailable(false);
      } else if (data) {
        setUsernameMessage("Username is taken");
        setIsUsernameAvailable(false);
      } else {
        setUsernameMessage("Username is available");
        setIsUsernameAvailable(true);
      }
      setIsUsernameLoading(false);
    };
    checkUsername();
  }, [debouncedUsername]);

  const clearState = () => {
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearState();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else {
      Navigate("/");
    }
  };

  const handleGoogleLogin = async () => {
    clearState();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) setError(error.message);
  };

  const handleProceedToStep2 = async (e) => {
    e.preventDefault();
    clearState();
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters long.");

    const { data, error: rpcError } = await supabase.rpc("email_exists", {
      email_to_check: email,
    });
    if (rpcError) return setError("Error checking email. Please try again.");
    if (data)
      return setError("This email is already registered. Please sign in.");

    setView("signupStep2");
  };

  // --- REVISED handleFinalSignUp FUNCTION ---
  const handleFinalSignUp = async (e) => {
    e.preventDefault();
    clearState();
    if (!isUsernameAvailable || !username || username.length < 3)
      return setError("Please choose a valid and available username.");

    // Pass the profile data directly into the signUp options.
    // The new database trigger will handle the rest.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          vehicle_type: vehicleType || null,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setView("checkEmail");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.background}></div>
      <div style={styles.formContainer}>
        {/* The rest of the UI rendering remains the same */}
        {view === "login" && (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Precision Auto</h1>
              <p style={styles.subtitle}>Sign in to your workshop account</p>
            </div>
            {error && <p style={styles.errorMessage}>{error}</p>}
            <form onSubmit={handleLogin} style={{ width: "100%" }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <EmailIcon />
                  </span>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <PasswordIcon />
                  </span>
                  <input
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>
              </div>
              <div style={styles.linksContainer}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    clearState();
                    setView("signupStep1");
                  }}
                  style={styles.link}
                >
                  Don't have an account?{" "}
                  <strong style={{ color: "#fff" }}>Sign up</strong>
                </a>
                <a href="#" style={styles.link}>
                  Forgot your password?
                </a>
              </div>
              <button
                type="submit"
                style={styles.signInButton}
                className="signin-button"
              >
                Sign In
              </button>
            </form>
            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>OR</span>
              <span style={styles.dividerLine}></span>
            </div>
            <button
              style={styles.googleButton}
              className="google-button"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon />
              <span style={styles.googleButtonText}>Sign in with Google</span>
            </button>
          </>
        )}

        {(view === "signupStep1" || view === "signupStep2") && (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Create Your Account</h1>
              <p style={styles.subtitle}>
                {view === "signupStep1"
                  ? "Step 1: Set your credentials."
                  : "Step 2: Complete your profile."}
              </p>
            </div>
            {error && <p style={styles.errorMessage}>{error}</p>}
            <form
              onSubmit={
                view === "signupStep1"
                  ? handleProceedToStep2
                  : handleFinalSignUp
              }
              style={{ width: "100%" }}
            >
              {view === "signupStep1" ? (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email Address</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>
                        <EmailIcon />
                      </span>
                      <input
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.inputField}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Password</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>
                        <PasswordIcon />
                      </span>
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.inputField}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>
                        <PasswordIcon />
                      </span>
                      <input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={styles.inputField}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    style={styles.signInButton}
                    className="signin-button"
                  >
                    Proceed
                  </button>
                </>
              ) : (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Username</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>
                        <UserIcon />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g., john-doe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={styles.inputField}
                        required
                      />
                    </div>
                    <p
                      style={
                        isUsernameAvailable
                          ? styles.usernameAvailable
                          : styles.usernameTaken
                      }
                    >
                      {isUsernameLoading ? "Checking..." : usernameMessage}
                    </p>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Vehicle Type (Optional)</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>
                        <CarIcon />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g., Toyota Camry 2021"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        style={styles.inputField}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    style={styles.signInButton}
                    className="signin-button"
                    disabled={!isUsernameAvailable || isUsernameLoading}
                  >
                    Create Account
                  </button>
                </>
              )}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  clearState();
                  setView("login");
                }}
                style={{
                  ...styles.link,
                  textAlign: "center",
                  display: "block",
                  marginTop: "30px",
                }}
              >
                Already have an account? Sign in
              </a>
            </form>
          </>
        )}

        {view === "checkEmail" && (
          <>
            <div style={{ ...styles.header, textAlign: "center" }}>
              <h1 style={styles.title}>Check your email</h1>
              <p style={styles.subtitle}>
                A confirmation link has been sent to complete your registration.
              </p>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                clearState();
                setView("login");
              }}
              style={{
                ...styles.link,
                textAlign: "center",
                display: "block",
                marginTop: "20px",
                fontSize: "16px",
              }}
            >
              Back to Login
            </a>
          </>
        )}
      </div>
      <style>{`
        html, body { overflow: hidden; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .input-field::placeholder { color: rgba(255, 255, 255, 0.4); }
        .signin-button:hover { background: linear-gradient(145deg, #e0c35a, #c09a34) !important; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); }
        .google-button:hover { background-color: #f7b42c !important; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); transform: translateY(-2px); }
        .signin-button:disabled { background: #555 !important; color: #999 !important; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

// --- STYLES OBJECT ---
const styles = {
  page: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    padding: "0 8%",
  },
  background: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: -1,
  },
  formContainer: {
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: { width: "100%", textAlign: "left", marginBottom: "25px" },
  title: {
    color: "#ffffff",
    fontSize: "42px",
    fontWeight: "700",
    margin: "0",
    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.80)",
    fontSize: "17px",
    marginTop: "10px",
    textShadow: "0 1px 5px rgba(0,0,0,0.3)",
  },
  inputGroup: { marginBottom: "25px", width: "100%" },
  label: {
    display: "block",
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "500",
    marginBottom: "15px",
    fontSize: "14px",
    textAlign: "left",
  },
  inputWrapper: { position: "relative" },
  inputIcon: {
    position: "absolute",
    left: "0px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255, 255, 255, 0.5)",
    pointerEvents: "none",
    zIndex: 1,
  },
  inputField: {
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(255, 255, 255, 0.35)",
    color: "#ffffff",
    borderRadius: "0",
    padding: "10px 10px 12px 40px",
    fontSize: "18px",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
    outline: "none",
  },
  linksContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "-15px",
    marginBottom: "30px",
  },
  link: {
    color: "rgba(255, 255, 255, 0.7)",
    textDecoration: "none",
    fontSize: "14px",
  },
  signInButton: {
    width: "100%",
    background: "linear-gradient(145deg, #c7a242, #b48a28)",
    color: "#111111",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    padding: "16px 0",
    fontSize: "16px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    cursor: "pointer",
  },
  divider: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: "25px",
    marginBottom: "25px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  dividerText: {
    margin: "0 15px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  googleButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    backgroundColor: "#f5a623",
    borderRadius: "50px",
    border: "none",
    color: "#000000",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
  },
  googleButtonText: { marginLeft: "10px" },
  errorMessage: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "rgba(220, 53, 69, 0.2)",
    color: "#f8d7da",
    border: "1px solid rgba(220, 53, 69, 0.4)",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "20px",
  },
  usernameMessage: {
    fontSize: "12px",
    marginTop: "8px",
    height: "14px",
    textAlign: "left",
  },
  usernameAvailable: { color: "#28a745" }, // Green
  usernameTaken: { color: "#dc3545" }, // Red
};

export default LoginPage;
