import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import BackgroundWrapper from "./background";
import NavBar from "./navbar";
import Chat from "./chat"; // Your existing Chat component
import LoadingSpinner from "./loading";

// --- ICONS ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
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
const PlusIcon = () => (
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
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ConversationsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);

      const { data: convos, error: convoError } = await supabase
        .from("conversations")
        .select("id, participant_ids")
        .contains("participant_ids", [user.id]);
      if (convoError) {
        console.error("Error fetching conversations:", convoError);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(convos.flatMap((c) => c.participant_ids))];
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);
      if (profileError) {
        console.error("Error fetching profiles:", profileError);
        setLoading(false);
        return;
      }

      const conversationsWithProfiles = convos.map((convo) => {
        const participants = convo.participant_ids
          .map((id) => profiles.find((p) => p.id === id))
          .filter(Boolean);
        return { ...convo, participants };
      });

      setConversations(conversationsWithProfiles);

      const params = new URLSearchParams(location.search);
      const convoIdFromUrl = params.get("convo");
      if (convoIdFromUrl) {
        const activeConvo = conversationsWithProfiles.find(
          (c) => c.id === Number(convoIdFromUrl)
        );
        if (activeConvo) setActiveConversation(activeConvo);
      }

      setLoading(false);
    };
    getInitialData();
  }, [navigate, location.search]);

  const getOtherParticipant = (participants) => {
    return participants.find((p) => p.id !== user.id);
  };

  return (
    <>
      {/* --- NEW STYLE TAG FOR SCROLLBARS --- */}
      <style>{`
                /* Target the scrollbar in Webkit browsers (Chrome, Safari, Edge) */
                ::-webkit-scrollbar {
                    width: 8px; /* Slimmer scrollbar */
                }

                /* The track (the background of the scrollbar) */
                ::-webkit-scrollbar-track {
                    background: transparent; /* Make track invisible */
                }

                /* The handle (the part you drag) */
                ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.25); /* Light gray, semi-transparent */
                    border-radius: 10px; /* Rounded corners */
                    border: 2px solid transparent; /* Creates padding around thumb */
                    background-clip: content-box;
                }

                /* The handle on hover */
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.4); /* Slightly more visible on hover */
                }
            `}</style>
      <BackgroundWrapper>
        <div style={styles.pageWrapper}>
          <NavBar />
          <div style={styles.mainLayout}>
            <div style={styles.sidebar}>
              <div style={styles.sidebarHeader}>
                <h2 style={styles.sidebarTitle}>Messages</h2>
                <button
                  onClick={() => navigate("/clients")}
                  style={styles.newChatButton}
                >
                  <PlusIcon />
                </button>
              </div>
              <div style={styles.convoList}>
                {loading ? (
                  <p
                    style={{ padding: "20px", color: "rgba(255,255,255,0.5)" }}
                  >
                    Loading...
                  </p>
                ) : (
                  conversations.map((convo) => {
                    const otherUser = getOtherParticipant(convo.participants);
                    return (
                      <div
                        key={convo.id}
                        style={{
                          ...styles.convoItem,
                          ...(activeConversation?.id === convo.id &&
                            styles.activeConvoItem),
                        }}
                        onClick={() => setActiveConversation(convo)}
                      >
                        {otherUser?.avatar_url ? (
                          <img
                            src={otherUser.avatar_url}
                            style={styles.convoAvatar}
                          />
                        ) : (
                          <div style={styles.convoDefaultAvatar}>
                            <UserIcon />
                          </div>
                        )}
                        <span style={styles.convoName}>
                          {otherUser?.username || "User"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div style={styles.chatWindow}>
              {activeConversation ? (
                <Chat
                  conversationId={activeConversation.id}
                  currentUser={user}
                />
              ) : (
                <div style={styles.placeholder}>
                  Select a conversation to start chatting.
                </div>
              )}
            </div>
          </div>
        </div>
      </BackgroundWrapper>
    </>
  );
};

// --- CORRECTED STYLES ---
const styles = {
  pageWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh", // Take full viewport height
    overflow: "hidden", // <-- KEY FIX: Prevent the whole page from scrolling
    fontFamily: "'Inter', sans-serif",
  },
  mainLayout: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    flexGrow: 1,
    paddingTop: "75px", // Height of NavBar
    // This is important for the child elements to scroll independently
    height: "calc(100vh - 75px)",
  },
  sidebar: {
    backgroundColor: "rgba(20, 20, 35, 0.75)",
    backdropFilter: "blur(15px)",
    borderRight: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // Parent controls overflow
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    flexShrink: 0, // Header should not shrink
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#fff",
  },
  newChatButton: {
    background: "rgba(0,168,255,0.2)",
    border: "1px solid #00A8FF",
    color: "#00A8FF",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  convoList: {
    flexGrow: 1,
    overflowY: "auto", // <-- KEY FIX: This list is now the scrolling container
  },
  convoItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    color: "rgba(255,255,255,0.8)",
    transition: "background-color 0.2s ease",
  },
  activeConvoItem: { backgroundColor: "rgba(0, 168, 255, 0.2)" },
  convoAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },
  convoDefaultAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    flexShrink: 0,
  },
  convoName: {
    fontWeight: "600",
    fontSize: "1rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chatWindow: {
    display: "flex",
    flexDirection: "column",
    background: "rgba(10, 10, 20, 0.5)",
    overflow: "hidden", // The Chat component itself will handle internal scrolling
  },
  placeholder: {
    margin: "auto",
    textAlign: "center",
    color: "rgba(255,255,255,0.5)",
    fontSize: "1.2rem",
  },
};

export default ConversationsPage;
