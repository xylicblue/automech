import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "./supabase";
import BackgroundWrapper from "./background";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) =>
    /\S+@\S+\.\S+/.test(String(email).toLowerCase());

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email))
      return setError("Please enter a valid email address.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters long.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    setIsLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      alert(
        "Sign up successful! Please check your email to verify your account."
      );
      navigate("/login");
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) setError(error.message);
    setIsLoading(false);
  };

  return (
    <>
      {/* Style tag now includes the separator fix */}
      <style>{`
            /* General Styles */
            .auth-button { font-family: 'Exo 2', sans-serif; font-size: 1rem; font-weight: 600; padding: 15px 30px; border: none; border-radius: 50px; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; }
            .signup-form-button { background: linear-gradient(90deg, #00A8FF, #007BFF); color: #FFF; margin-top: 20px; width: 100%; }
            .signup-form-button:hover { transform: translateY(-2px); box-shadow: 0 0 20px #00A8FF; }
            .google-signin-button { background: transparent; border: 1px solid #4285F4; color: #FFF; margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;}
            .google-signin-button:hover { background: rgba(66, 133, 244, 0.2); }
            .google-icon { fill: #FFF; }

            /* Separator Line FIX */
            .separator { margin: 30px 0; color: rgba(255, 255, 255, 0.3); display: flex; align-items: center; text-align: center; width: 100%; }
            .separator::before, .separator::after { content: ''; flex: 1; border-bottom: 1px solid rgba(255, 255, 255, 0.2); }
            .separator:not(:empty)::before { margin-right: .25em; }
            .separator:not(:empty)::after { margin-left: .25em; }
            
            /* Error & Loader */
            .auth-error { color: #ff6b6b; font-size: 0.9rem; margin-top: 10px; text-align: center; }
            .auth-loader { color: #00A8FF; font-size: 1rem; text-align: center; margin-top: 15px; }
      `}</style>
      <BackgroundWrapper>
        <div style={styles.authPageContainer}>
          <div style={styles.authFormWrapper}>
            <h2 style={styles.authTitle}>Create Your Account</h2>
            <p style={styles.authSubtitle}>
              Join us and experience premium service.
            </p>

            {error && <p className="auth-error">{error}</p>}
            {isLoading && <p className="auth-loader">Creating account...</p>}

            <form onSubmit={handleSignup} style={{ width: "100%" }}>
              <div style={styles.inputGroup}>
                <svg
                  style={styles.inputIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                  <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                </svg>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.authInput}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <svg
                  style={styles.inputIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm-3.75 5.25a3.75 3.75 0 1 0 7.5 0v3a3 3 0 0 0-3 3v-3a3.75 3.75 0 0 0-4.5-3.75v-3Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.authInput}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <svg
                  style={styles.inputIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm-3.75 5.25a3.75 3.75 0 1 0 7.5 0v3a3 3 0 0 0-3 3v-3a3.75 3.75 0 0 0-4.5-3.75v-3Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.authInput}
                  required
                />
              </div>
              <button
                type="submit"
                className="signup-form-button auth-button"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </form>

            <div className="separator">or</div>

            <button
              onClick={handleGoogleSignIn}
              className="google-signin-button auth-button"
              disabled={isLoading}
            >
              <svg
                className="google-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.5605 12.25C22.5605 11.4005 22.4905 10.5505 22.3505 9.7005H12.0005V14.4505H18.2305C18.0405 15.5305 17.4205 16.4805 16.5605 17.1705V20.1205H20.4805C22.4505 18.2605 22.5605 15.2705 22.5605 12.25Z"
                  fill="#4285F4"
                />
                <path
                  d="M12.0005 22.4905C14.7405 22.4905 17.0405 21.5105 18.7105 20.0005L14.9805 17.5105C14.2205 17.9505 13.2105 18.2505 12.0005 18.2505C9.5105 18.2505 7.5705 16.6905 6.7205 14.5805H2.7605V17.5105C4.3705 19.8505 8.0005 22.4905 12.0005 22.4905Z"
                  fill="#34A853"
                />
                <path
                  d="M6.7205 14.5805C6.4905 13.9505 6.3505 13.2405 6.3505 12.5005C6.3505 11.7605 6.4905 11.0505 6.7205 10.4205V7.4905H2.7605C2.0905 8.9405 1.7105 10.3905 1.7105 12.5005C1.7105 14.6105 2.0905 16.0605 2.7605 17.5105L6.7205 14.5805Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0005 5.7505C13.4605 5.7505 14.7905 6.2505 15.8305 7.2105L19.7505 3.7405C17.6405 1.9505 14.9105 1.0005 12.0005 1.0005C8.0005 1.0005 4.3705 3.6405 2.7605 6.9605L6.7205 9.4205C7.5705 7.3105 9.5105 5.7505 12.0005 5.7505Z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
            <p style={styles.switchAuthText}>
              Already have an account?{" "}
              <Link to="/login" style={styles.switchAuthLink}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </BackgroundWrapper>
    </>
  );
};

// These styles are now identical to LoginPage.jsx for consistency
const styles = {
  authPageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    boxSizing: "border-box",
  },
  authFormWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "450px",
    backgroundColor: "rgba(10, 10, 20, 0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "40px",
    boxSizing: "border-box",
    boxShadow: "0 15px 40px rgba(0, 168, 255, 0.2)",
  },
  authTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#00A8FF",
    marginBottom: "10px",
    textShadow: "0 0 15px rgba(0, 168, 255, 0.5)",
  },
  authSubtitle: {
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: "30px",
    textAlign: "center",
  },
  inputGroup: { position: "relative", width: "100%", marginBottom: "20px" },
  inputIcon: {
    position: "absolute",
    top: "50%",
    left: "15px",
    transform: "translateY(-50%)",
    width: "20px",
    height: "20px",
    color: "rgba(255, 255, 255, 0.4)",
  },
  authInput: {
    fontFamily: "inherit",
    fontSize: "1rem",
    color: "#FFF",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid transparent",
    borderRadius: "10px",
    width: "100%",
    padding: "15px 15px 15px 50px",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)), 
                        linear-gradient(to right, #00A8FF, #8A2BE2)`,
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  },
  switchAuthText: {
    marginTop: "25px",
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.8)",
  },
  switchAuthLink: {
    color: "#00A8FF",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default SignupPage;
