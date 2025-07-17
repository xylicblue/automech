import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import BackgroundWrapper from "./background";
import NavBar from "./navbar";
import LoadingSpinner from "./loading";
import Footer from "./footer";
import { FaCar, FaUser } from "react-icons/fa";

// --- ICONS ---
const MessageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const AdminShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="#00A8FF"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);
const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const FilterIcon = () => (
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
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);
const CarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 16.5V15a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1.5M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2zM6.5 16.5h.01M17.5 16.5h.01"></path>
  </svg>
);
const BioIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- USER PROFILE CARD COMPONENT ---
const UserProfileCard = ({ profile, onMessage }) => {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            style={styles.avatar}
          />
        ) : (
          <div style={styles.defaultAvatar}>
            <UserIcon />
          </div>
        )}
      </div>
      <div style={styles.cardBody}>
        <div style={styles.nameContainer}>
          <h3 style={styles.username}>{profile.username}</h3>
          {profile.role === "admin" && <AdminShieldIcon />}
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>
            <FaCar />
          </span>
          <p style={styles.vehicle}>
            {profile.vehicle_type || "Vehicle not specified"}
          </p>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>
            <FaUser />
          </span>
          <p style={styles.bio}>{profile.bio || "No bio available."}</p>
        </div>
      </div>
      <div style={styles.cardFooter}>
        <button
          style={styles.messageButton}
          onClick={() => onMessage(profile.id)}
        >
          <MessageIcon /> Message
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const MeetClientsPage = () => {
  const navigate = useNavigate();
  const [allProfiles, setAllProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Effect to close the filter modal when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setFilterModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchContainerRef]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUser(user);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user?.id)
        .order("username");
      if (error) console.error("Error fetching profiles:", error);
      else setAllProfiles(data);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((profile) => {
      const matchesSearch = profile.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesVehicle = profile.vehicle_type
        ? profile.vehicle_type
            .toLowerCase()
            .includes(vehicleFilter.toLowerCase())
        : vehicleFilter === "";
      return matchesSearch && matchesVehicle;
    });
  }, [allProfiles, searchTerm, vehicleFilter]);

  const handleStartConversation = async (otherUserId) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    const participants = [currentUser.id, otherUserId].sort();
    let { data: existingConvo } = await supabase
      .from("conversations")
      .select("id")
      .contains("participant_ids", participants)
      .single();
    if (existingConvo) {
      navigate(`/messages?convo=${existingConvo.id}`);
    } else {
      const { data: newConvo } = await supabase
        .from("conversations")
        .insert({ participant_ids: participants })
        .select("id")
        .single();
      if (newConvo) navigate(`/messages?convo=${newConvo.id}`);
    }
  };

  return (
    <BackgroundWrapper>
      <div style={styles.pageWrapper}>
        <NavBar />
        <div style={styles.pageContainer}>
          <div style={styles.titleContainer}>
            <h1 style={styles.pageTitle}>Meet Our Community</h1>
          </div>

          <div style={styles.searchContainer} ref={searchContainerRef}>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}>
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by username..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                style={styles.filterButton}
                onClick={() => setFilterModalOpen(!isFilterModalOpen)}
              >
                <FilterIcon />
              </button>
            </div>
            {isFilterModalOpen && (
              <div style={styles.filterModal}>
                <div style={styles.filterHeader}>
                  <label style={styles.filterLabel}>Filter by Vehicle</label>
                  <button
                    style={styles.closeFilterButton}
                    onClick={() => setFilterModalOpen(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g., Toyota, Camry..."
                  style={styles.filterInput}
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                />
              </div>
            )}
          </div>

          {loading ? (
            <LoadingSpinner text="Loading Profiles..." />
          ) : (
            <div style={styles.grid}>
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => (
                  <UserProfileCard
                    key={profile.id}
                    profile={profile}
                    onMessage={handleStartConversation}
                  />
                ))
              ) : (
                <p style={styles.noResultsText}>
                  No clients found matching your criteria.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer></Footer>
    </BackgroundWrapper>
  );
};

const styles = {
  // --- Page Layout ---
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif",
  },
  pageContainer: {
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    padding: "120px 40px 40px",
    color: "#fff",
    flex: "1 0 auto",
  },
  titleContainer: {
    textAlign: "center",
    marginBottom: "40px",
  },
  pageTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    margin: 0,
  },

  // --- Search & Filter ---
  searchContainer: {
    position: "relative",
    maxWidth: "600px",
    margin: "0 auto 60px auto",
  },
  searchWrapper: {
    position: "relative",
    width: "100%",
  },
  searchInput: {
    width: "100%",
    padding: "15px 60px 15px 50px",
    fontSize: "1.1rem",
    backgroundColor: "rgba(30, 30, 45, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "50px",
    color: "#fff",
    outline: "none",
    transition: "all 0.3s ease",
  },
  searchIcon: {
    position: "absolute",
    top: "50%",
    left: "20px",
    transform: "translateY(-50%)",
    color: "rgba(255, 255, 255, 0.5)",
  },
  filterButton: {
    position: "absolute",
    top: "50%",
    right: "10px",
    transform: "translateY(-50%)",
    background: "rgba(0, 168, 255, 0.2)",
    border: "none",
    color: "#00A8FF",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  filterModal: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    width: "320px",
    backgroundColor: "#111524",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "16px",
    padding: "20px",
    zIndex: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  filterLabel: {
    fontWeight: "600",
    fontSize: "1rem",
  },
  closeFilterButton: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    padding: "5px",
  },
  filterInput: {
    width: "100%",
    padding: "10px 2px",
    fontSize: "1rem",
    backgroundColor: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    color: "#fff",
  },

  // --- Profile Grid & Cards ---
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "30px",
  },
  noResultsText: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "rgba(255,255,255,0.6)",
    gridColumn: "1 / -1",
  },
  card: {
    background:
      "linear-gradient(145deg, rgba(25, 29, 49, 0.8), rgba(20, 20, 35, 0.8))",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "18px",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Center content horizontally
    textAlign: "center",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  },
  cardHeader: {
    marginBottom: "15px",
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #00A8FF",
  },
  defaultAvatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "3px solid rgba(255, 255, 255, 0.2)",
  },
  cardBody: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Center content
    gap: "10px",
  },
  nameContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "5px",
  },
  username: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: 0,
    color: "#fff",
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "rgba(255, 255, 255, 0.7)",
  },
  detailIcon: {
    display: "flex",
    alignItems: "center",
  },
  vehicle: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#00A8FF",
    margin: 0,
  },
  bio: {
    fontSize: "0.95rem",
    lineHeight: 1.6,
    margin: 0,
    color: "rgba(255, 255, 255, 0.7)",
  },
  cardFooter: {
    marginTop: "25px",
    width: "100%",
  },
  messageButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "rgba(0, 168, 255, 0.2)",
    border: "1px solid #00A8FF",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};
// // --- STYLES ---
// const styles = {
//   pageWrapper: {
//     minHeight: "100vh",
//     width: "100%",
//     display: "flex",
//     flexDirection: "column",
//     fontFamily: "'Inter', sans-serif",
//   },
//   pageContainer: {
//     maxWidth: "1400px",
//     width: "100%",
//     margin: "0 auto",
//     padding: "120px 40px 40px",
//     color: "#fff",
//     flex: "1 0 auto",
//   },
//   pageTitle: {
//     fontSize: "3rem",
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: "10px",
//   },
//   pageSubtitle: {
//     textAlign: "center",
//     fontSize: "1.2rem",
//     maxWidth: "700px",
//     margin: "0 auto 60px auto",
//     color: "rgba(255, 255, 255, 0.7)",
//     lineHeight: "1.6",
//   },
//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
//     gap: "30px",
//   },
//   card: {
//     background:
//       "linear-gradient(145deg, rgba(25, 29, 49, 0.7), rgba(20, 20, 35, 0.7))",
//     backdropFilter: "blur(10px)",
//     border: "1px solid rgba(255, 255, 255, 0.1)",
//     borderRadius: "18px",
//     padding: "25px",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     textAlign: "center",
//     boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
//   },
//   cardHeader: { marginBottom: "15px" },
//   avatar: {
//     width: "120px",
//     height: "120px",
//     borderRadius: "50%",
//     objectFit: "cover",
//     border: "3px solid #00A8FF",
//   },
//   defaultAvatar: {
//     width: "120px",
//     height: "120px",
//     borderRadius: "50%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255, 255, 255, 0.05)",
//     border: "3px solid rgba(255, 255, 255, 0.2)",
//   },
//   cardBody: { flexGrow: 1 },
//   username: { fontSize: "1.5rem", fontWeight: "600", margin: 0, color: "#fff" },
//   vehicle: {
//     fontSize: "1rem",
//     color: "#00A8FF",
//     fontWeight: "500",
//     margin: "5px 0 15px 0",
//   },
//   bio: {
//     fontSize: "0.95rem",
//     color: "rgba(255, 255, 255, 0.7)",
//     lineHeight: 1.6,
//     margin: 0,
//   },
//   cardFooter: { marginTop: "25px", width: "100%" },
//   messageButton: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "10px",
//     width: "100%",
//     padding: "12px",
//     fontSize: "1rem",
//     fontWeight: "600",
//     color: "#fff",
//     backgroundColor: "rgba(0, 168, 255, 0.2)",
//     border: "1px solid #00A8FF",
//     borderRadius: "10px",
//     cursor: "pointer",
//     transition: "background-color 0.2s ease",
//   },
//   searchContainer: {
//     position: "relative",
//     maxWidth: "600px",
//     margin: "0 auto 60px auto",
//   },
//   searchWrapper: {
//     position: "relative",
//     width: "100%",
//   },
//   searchInput: {
//     width: "100%",
//     padding: "15px 20px 15px 50px",
//     fontSize: "1.1rem",
//     backgroundColor: "rgba(30, 30, 45, 0.7)",
//     border: "1px solid rgba(255, 255, 255, 0.15)",
//     borderRadius: "50px",
//     color: "#fff",
//     outline: "none",
//     transition: "all 0.3s ease",
//   },
//   searchIcon: {
//     position: "absolute",
//     top: "50%",
//     left: "20px",
//     transform: "translateY(-50%)",
//     color: "rgba(255, 255, 255, 0.5)",
//   },
//   filterButton: {
//     position: "absolute",
//     top: "50%",
//     right: "10px",
//     transform: "translateY(-50%)",
//     background: "rgba(0, 168, 255, 0.2)",
//     border: "none",
//     color: "#00A8FF",
//     borderRadius: "50%",
//     width: "36px",
//     height: "36px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     cursor: "pointer",
//   },
//   filterModal: {
//     position: "absolute",
//     top: "calc(100% + 10px)",
//     right: 0,
//     width: "300px",
//     backgroundColor: "#111524",
//     border: "1px solid rgba(255, 255, 255, 0.2)",
//     borderRadius: "16px",
//     padding: "20px",
//     zIndex: 10,
//     boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
//   },
//   filterLabel: {
//     display: "block",
//     marginBottom: "10px",
//     fontWeight: "600",
//   },
//   filterInput: {
//     width: "100%",
//     padding: "10px 15px",
//     fontSize: "1rem",
//     backgroundColor: "rgba(0,0,0,0.25)",
//     border: "1px solid rgba(255, 255, 255, 0.2)",
//     borderRadius: "8px",
//     color: "#fff",
//   },

//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
//     gap: "30px",
//   },
//   noResultsText: {
//     textAlign: "center",
//     fontSize: "1.2rem",
//     color: "rgba(255,255,255,0.6)",
//     gridColumn: "1 / -1",
//   },
// };

export default MeetClientsPage;
