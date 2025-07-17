import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import ConfirmModal from "./confirmmodal"; // Ensure this component exists and is imported

// --- ICONS ---
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
const MoreVerticalIcon = () => (
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
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

// Helper function to format time
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- NEW MESSAGE COMPONENT ---
// Breaking the message into its own component helps manage its complex state
const Message = ({ msg, isOwn, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);

  const handleEditSave = async () => {
    if (editText.trim() === "" || editText === msg.content) {
      setIsEditing(false);
      return;
    }
    await onUpdate(msg.id, editText);
    setIsEditing(false);
  };

  if (msg.is_deleted) {
    return (
      <div
        style={{
          ...styles.messageRow,
          justifyContent: isOwn ? "flex-end" : "flex-start",
        }}
      >
        <div style={{ ...styles.messageBubble, ...styles.deletedMessage }}>
          Message deleted
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.messageRow,
        justifyContent: isOwn ? "flex-end" : "flex-start",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMenuOpen(false);
      }}
    >
      {/* Action Menu for "their" messages is not needed, but can be added if needed */}
      <div
        style={{
          ...styles.messageBubble,
          ...(isOwn ? styles.myMessage : styles.theirMessage),
        }}
      >
        {isEditing ? (
          <div style={styles.editContainer}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={styles.editInput}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEditSave();
                }
              }}
            />
            <div style={styles.editActions}>
              <button
                onClick={() => setIsEditing(false)}
                style={styles.editCancelButton}
              >
                Cancel
              </button>
              <button onClick={handleEditSave} style={styles.editSaveButton}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <span style={styles.messageContent}>{msg.content}</span>
            <span style={styles.messageTimestamp}>
              {msg.updated_at > msg.created_at && (
                <div
                  style={{
                    ...styles.editedIndicatorRow,
                    justifyContent: isOwn ? "flex-end" : "flex-start",
                  }}
                >
                  <span style={styles.editedText}>(edited)</span>
                </div>
              )}
              {formatTime(msg.created_at)}
            </span>
          </>
        )}
        {/* The action button is now INSIDE the bubble but positioned absolutely */}
        {isOwn && !isEditing && (
          <div
            style={{
              ...styles.actionsMenuWrapper,
              opacity: isHovered || isMenuOpen ? 1 : 0,
            }}
          >
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              style={styles.menuButton}
            >
              <MoreVerticalIcon />
            </button>
            {isMenuOpen && (
              <div style={styles.dropdownMenu}>
                <button
                  style={styles.dropdownMenuButton}
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                >
                  Edit
                </button>
                <button
                  style={{ ...styles.dropdownMenuButton, color: "#dc3545" }}
                  onClick={() => {
                    onDelete(msg.id);
                    setMenuOpen(false);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN CHAT COMPONENT ---
const Chat = ({ conversationId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    onConfirm: () => {},
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, profiles(username, avatar_url)")
        .eq("conversation_id", conversationId)
        .order("created_at");
      if (error) console.error("Error fetching messages:", error);
      else {
        setMessages(
          data.map((m) => ({ ...m, is_deleted: m.content === null }))
        );
        setTimeout(scrollToBottom, 0);
      }
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data: newMessageWithProfile } = await supabase
              .from("messages")
              .select("*, profiles(username, avatar_url)")
              .eq("id", payload.new.id)
              .single();
            if (newMessageWithProfile)
              setMessages((existing) => [...existing, newMessageWithProfile]);
          }
          if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === payload.new.id
                  ? {
                      ...m,
                      content: payload.new.content,
                      updated_at: payload.new.updated_at,
                    }
                  : m
              )
            );
          }
          if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    const { error } = await supabase.from("messages").insert({
      content: newMessage,
      sender_id: currentUser.id,
      conversation_id: conversationId,
    });
    if (error) alert("Error sending message: " + error.message);
    else setNewMessage("");
  };

  const handleUpdateMessage = async (messageId, newContent) => {
    const { error } = await supabase
      .from("messages")
      .update({ content: newContent, updated_at: new Date().toISOString() })
      .eq("id", messageId);
    if (error) alert("Error updating message: " + error.message);
  };

  const handleDeleteMessage = (messageId) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Message?",
      message: "Are you sure you want to permanently delete this message?",
      onConfirm: async () => {
        const { error } = await supabase
          .from("messages")
          .delete()
          .eq("id", messageId);
        if (error) alert("Error deleting message: " + error.message);
        setConfirmModal({ isOpen: false });
      },
    });
  };

  return (
    <div style={styles.chatContainer}>
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
      <div style={styles.messagesList}>
        {messages.map((msg) => (
          <Message
            key={msg.id}
            msg={msg}
            isOwn={msg.sender_id === currentUser.id}
            onUpdate={handleUpdateMessage}
            onDelete={handleDeleteMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={styles.inputArea}>
        <form onSubmit={handleSendMessage} style={styles.inputForm}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={styles.inputField}
          />
          <button type="submit" style={styles.sendButton}>
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "rgba(10, 10, 20, 0.7)",
  },
  messagesList: {
    flexGrow: 1,
    padding: "20px 20px 0 20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  messageRow: {
    display: "flex",
    marginBottom: "10px",
    width: "100%",
    position: "relative",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: "10px 15px",
    borderRadius: "18px",
    lineHeight: 1.5,
    fontSize: "1rem",
    position: "relative",
    wordWrap: "break-word",
  },
  myMessage: {
    backgroundColor: "#00A8FF",
    color: "#fff",
    borderBottomRightRadius: "4px",
    marginLeft: "auto",
  },
  theirMessage: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    borderBottomLeftRadius: "4px",
    marginRight: "auto",
  },
  messageContent: { paddingRight: "60px" },
  messageTimestamp: {
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.6)",
    position: "absolute",
    bottom: "8px",
    right: "15px",
  },
  deletedMessage: {
    fontStyle: "italic",
    color: "rgba(255,255,255,0.4)",
    backgroundColor: "transparent",
    border: "1px dashed rgba(255,255,255,0.2)",
  },
  inputArea: {
    padding: "20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(10, 10, 20, 0.5)",
  },
  inputForm: { display: "flex", gap: "10px" },
  inputField: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    borderRadius: "50px",
    padding: "12px 20px",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  sendButton: {
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    border: "none",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    flexShrink: 0,
  },
  actionsMenuWrapper: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    right: "calc(100% + 5px)",
    opacity: 0,
    transition: "opacity 0.2s ease",
  },
  menuButton: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    padding: "5px",
  },
  dropdownMenu: {
    position: "absolute",
    bottom: "calc(100% + 5px)",
    right: 0,
    backgroundColor: "#181c34",
    borderRadius: "8px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    zIndex: 10,
    overflow: "hidden",
    width: "120px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  dropdownMenuButton: {
    background: "none",
    border: "none",
    color: "#fff",
    padding: "10px 15px",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    "&:hover": { backgroundColor: "rgba(0,168,255,0.2)" },
  },
  editContainer: { display: "flex", flexDirection: "column", gap: "10px" },
  editInput: {
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "#fff",
    border: "1px solid #00A8FF",
    borderRadius: "8px",
    padding: "10px",
    resize: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
  },
  editActions: { display: "flex", gap: "10px", justifyContent: "flex-end" },
  editSaveButton: {
    background: "#00A8FF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  editCancelButton: {
    background: "transparent",
    color: "rgba(255,255,255,0.7)",
    border: "none",
    cursor: "pointer",
  },
  messageRow: {
    display: "flex",
    marginBottom: "10px",
    width: "100%",
    position: "relative", // The row is now the hover target
  },
  messageBubble: {
    maxWidth: "75%",
    minWidth: "120px", // Prevents timestamp from breaking layout on very short messages
    padding: "10px 15px",
    borderRadius: "18px",
    lineHeight: 1.5,
    fontSize: "1rem",
    wordWrap: "break-word",
    position: "relative", // Crucial for positioning the action button
  },
  myMessage: {
    backgroundColor: "#00A8FF",
    color: "#fff",
    borderBottomRightRadius: "4px",
    marginLeft: "auto",
  },
  theirMessage: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    borderBottomLeftRadius: "4px",
    marginRight: "auto",
  },
  messageContent: {
    paddingRight: "60px", // Make space for the timestamp
  },
  messageTimestamp: {
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.6)",
    position: "absolute",
    bottom: "8px",
    right: "15px",
  },
  deletedMessage: {
    fontStyle: "italic",
    color: "rgba(255,255,255,0.4)",
    backgroundColor: "transparent",
    border: "1px dashed rgba(255,255,255,0.2)",
  },

  // --- CORRECTED ACTION MENU STYLES ---
  actionsMenuWrapper: {
    position: "absolute",
    top: "50%",
    // Position it just outside the bubble
    right: "calc(100% + 5px)",
    transform: "translateY(-50%)",
    opacity: 0,
    transition: "opacity 0.2s ease",
    zIndex: 5,
  },
  menuButton: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    padding: "5px",
    display: "flex",
    alignItems: "center",
  },
  dropdownMenu: {
    position: "absolute",
    bottom: "100%",
    right: "0",
    backgroundColor: "#181c34",
    borderRadius: "8px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    zIndex: 10,
    overflow: "hidden",
    width: "120px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  dropdownMenuButton: {
    background: "none",
    border: "none",
    color: "#fff",
    padding: "10px 15px",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
};

export default Chat;
