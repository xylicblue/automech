import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import BackgroundWrapper from "./background";

// --- ICONS ---
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
const BioIcon = () => (
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
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);
const DefaultAvatarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(255,255,255,0.6)"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// A simple debounce hook for real-time validation without excessive API calls
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

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Form state
  const [username, setUsername] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Username validation state
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const debouncedUsername = useDebounce(username, 500);

  // Fetch user and profile data on page load
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        console.error("Error fetching profile", error);
      } else {
        setProfile(profileData);
        setUsername(profileData.username || "");
        setVehicleType(profileData.vehicle_type || "");
        setBio(profileData.bio || "");
        setAvatarPreview(profileData.avatar_url || null);
      }
      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  // Check username uniqueness when the user stops typing
  useEffect(() => {
    if (!debouncedUsername || debouncedUsername === profile?.username) {
      setUsernameMessage("");
      setIsUsernameAvailable(true);
      return;
    }
    setIsUsernameLoading(true);
    const checkUsername = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", debouncedUsername)
        .single();
      if (data) {
        setUsernameMessage("Username is taken");
        setIsUsernameAvailable(false);
      } else {
        setUsernameMessage("Username is available");
        setIsUsernameAvailable(true);
      }
      setIsUsernameLoading(false);
    };
    checkUsername();
  }, [debouncedUsername, profile?.username]);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!isUsernameAvailable && username !== profile.username) {
      alert("Please choose an available username.");
      setLoading(false);
      return;
    }

    let avatarUrl = profile.avatar_url;

    // Upload new avatar if one has been selected
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, {
          cacheControl: "3600",
          upsert: true, // Overwrite existing file if any
        });

      if (uploadError) {
        alert("Error uploading avatar: " + uploadError.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);
      avatarUrl = publicUrl;
    }

    // Update the user's profile in the database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: username,
        vehicle_type: vehicleType,
        bio: bio,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      })
      .eq("id", user.id);

    if (updateError) {
      alert("Error updating profile: " + updateError.message);
    } else {
      alert("Profile updated successfully!");
      navigate("/");
    }
    setLoading(false);
  };

  // Show a loading screen while fetching initial data
  if (loading && !profile) {
    return (
      <BackgroundWrapper>
        <div style={styles.loading}>Loading Profile...</div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div style={styles.pageContainer}>
        <div style={styles.card}>
          <h1 style={styles.title}>Edit Your Profile</h1>
          <p style={styles.subtitle}>Keep your workshop details up to date.</p>

          <form onSubmit={handleUpdateProfile} style={styles.form}>
            {/* Avatar Upload Section */}
            <div style={styles.avatarSection}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" style={styles.avatar} />
              ) : (
                <div style={styles.defaultAvatar}>
                  <DefaultAvatarIcon />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{ display: "none" }}
                accept="image/png, image/jpeg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                style={styles.changeAvatarButton}
              >
                Change Picture
              </button>
            </div>

            {/* Disabled Email Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <input
                  type="email"
                  value={user?.email || ""}
                  style={{ ...styles.inputField, ...styles.disabledInput }}
                  readOnly
                />
              </div>
            </div>

            {/* Username Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <UserIcon />
                </span>
                <input
                  type="text"
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

            {/* Vehicle Type Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Vehicle Type</label>
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

            {/* Bio Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Your Bio</label>
              <div style={styles.inputWrapper}>
                <span style={{ ...styles.inputIcon, top: "20px" }}>
                  <BioIcon />
                </span>
                <textarea
                  placeholder="Tell us a bit about yourself or your car..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ ...styles.inputField, ...styles.textarea }}
                  rows="4"
                ></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                style={{ ...styles.actionButton, ...styles.cancelButton }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.actionButton}
                disabled={
                  loading ||
                  (!isUsernameAvailable && username !== profile.username)
                }
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

const styles = {
  pageContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily: "'Inter', sans-serif",
  },
  loading: { color: "#fff", fontSize: "2rem" },
  card: {
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "rgba(20, 20, 35, 0.65)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "24px",
    padding: "40px 50px",
    color: "#fff",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
  },
  title: {
    textAlign: "center",
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 10px 0",
  },
  subtitle: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "1.1rem",
    margin: "0 0 40px 0",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    marginBottom: "20px",
  },
  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #00A8FF",
  },
  defaultAvatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "2px dashed rgba(255, 255, 255, 0.2)",
  },
  changeAvatarButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    padding: "10px 20px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  inputGroup: { width: "100%" },
  label: {
    display: "block",
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginBottom: "10px",
    fontSize: "1rem",
  },
  inputWrapper: { position: "relative" },
  inputIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255, 255, 255, 0.4)",
    pointerEvents: "none",
    zIndex: 1,
  },
  inputField: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "14px 16px 14px 50px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    outline: "none",
  },
  disabledInput: {
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "rgba(255,255,255,0.5)",
    cursor: "not-allowed",
    filter: "blur(0.5px)",
  },
  textarea: {
    padding: "16px 16px 16px 50px",
    resize: "vertical",
    minHeight: "100px",
  },
  usernameMessage: {
    fontSize: "12px",
    marginTop: "8px",
    height: "14px",
    textAlign: "left",
  },
  usernameAvailable: { color: "#28a745" },
  usernameTaken: { color: "#dc3545" },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    marginTop: "30px",
  },
  actionButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1rem",
    fontWeight: "600",
    padding: "12px 30px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    color: "#FFFFFF",
  },
  cancelButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
};

export default EditProfile;
