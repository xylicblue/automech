import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import BackgroundWrapper from "./background";
import NavBar from "./navbar";
import LoadingSpinner from "./loading";
import ConfirmModal from "./confirmmodal";
import Footer from "./footer";

// --- ICONS ---
const PlusIcon = () => (
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
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const ImageIcon = () => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);
const HeartIcon = ({ isLiked }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={isLiked ? "#00A8FF" : "none"}
    stroke={isLiked ? "#00A8FF" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);
const MessageSquareIcon = () => (
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
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);
const ShareIcon = () => (
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
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
    <polyline points="16 6 12 2 8 6"></polyline>
    <line x1="12" y1="2" x2="12" y2="15"></line>
  </svg>
);
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
const MoreHorizontalIcon = () => (
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
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);
const TrashIcon = () => (
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
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
const AdminShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
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

// --- HELPER for calculating time ago ---
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

// --- POST CARD COMPONENT with Like Functionality ---
const PostCard = ({ post, currentUser, onDeletePost, onUpdateComments }) => {
  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role;
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(
    post.likes.some((like) => like.user_id === currentUserId)
  );
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [shareText, setShareText] = useState("Share");
  const [commentCount, setCommentCount] = useState(post.comments.length);
  const canDeletePost =
    currentUserRole === "admin" || post.user_id === currentUserId;

  const handleLike = async () => {
    if (!currentUserId) {
      alert("Please log in to like posts.");
      return;
    }

    if (isLiked) {
      // Optimistically update UI
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
      // Update database
      await supabase
        .from("likes")
        .delete()
        .match({ post_id: post.id, user_id: currentUserId });
    } else {
      // Optimistically update UI
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      // Update database
      await supabase
        .from("likes")
        .insert({ post_id: post.id, user_id: currentUserId });
    }
  };
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;
    const tempComment = {
      id: Date.now(),
      content: newComment,
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      profiles: {
        username: currentUser.username,
        avatar_url: currentUser.avatar_url,
        role: currentUser.role,
      },
    };
    const originalComments = comments;
    setComments((prev) => [tempComment, ...prev]);
    setNewComment("");
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, user_id: currentUserId, content: newComment })
      .select("*, profiles(*)")
      .single();
    if (error) {
      alert("Error posting comment: " + error.message);
      setComments(originalComments); // Revert on error
    } else {
      // Replace temporary comment with real one from DB
      setComments((prev) =>
        prev.map((c) => (c.id === tempComment.id ? data : c))
      );
      onUpdateComments(post.id, data, "add");
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) {
      alert("Error deleting comment: " + error.message);
    } else {
      const updatedComments = comments.filter((c) => c.id !== commentId);
      setComments(updatedComments);
      onUpdateComments(post.id, commentId, "delete");
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`; // Assuming a future route for single posts
    navigator.clipboard.writeText(postUrl);
    setShareText("Link Copied!");
    setTimeout(() => setShareText("Share"), 2000); // Revert text after 2 seconds
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.headerLeft}>
          {post.profiles?.avatar_url ? (
            <img
              src={post.profiles.avatar_url}
              alt="avatar"
              style={styles.avatar}
            />
          ) : (
            <div style={styles.defaultAvatar}>
              <UserIcon />
            </div>
          )}
          <div style={styles.headerText}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h4 style={styles.username}>
                {post.profiles?.username || "Anonymous"}
              </h4>
              {post.profiles?.role === "admin" && <AdminShieldIcon />}
            </div>
            <p style={styles.postTime}>{timeAgo(post.created_at)}</p>
          </div>
        </div>
        {canDeletePost && (
          <button
            onClick={() => onDeletePost(post.id)}
            style={styles.deleteButton}
          >
            <TrashIcon />
          </button>
        )}
      </div>
      {post.content && <p style={styles.postContent}>{post.content}</p>}
      {post.image_url && (
        <img src={post.image_url} alt="post content" style={styles.postImage} />
      )}
      <div style={styles.cardActions}>
        <button
          style={{
            ...styles.actionButton,
            color: isLiked ? "#00A8FF" : "rgba(255,255,255,0.7)",
          }}
          onClick={handleLike}
        >
          <HeartIcon isLiked={isLiked} /> <span>{likeCount}</span>
        </button>
        <button
          style={styles.actionButton}
          onClick={() => setShowComments(!showComments)}
        >
          <MessageSquareIcon /> <span>{comments.length}</span>
        </button>
        <button style={styles.actionButton} onClick={handleShare}>
          <ShareIcon /> <span>{shareText}</span>
        </button>
      </div>
      {showComments && (
        <div style={styles.commentsSection}>
          <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={styles.commentInput}
            />
            <button type="submit" style={styles.commentSubmitButton}>
              Post
            </button>
          </form>
          <div style={styles.commentsList}>
            {comments.map((comment) => (
              <div key={comment.id} style={styles.comment}>
                <div style={styles.commentAvatar}>
                  {comment.profiles?.avatar_url ? (
                    <img
                      src={comment.profiles.avatar_url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <UserIcon />
                  )}
                </div>
                <div style={styles.commentBody}>
                  <p style={styles.commentUsername}>
                    {comment.profiles?.username}{" "}
                    {comment.profiles?.role === "admin" && <AdminShieldIcon />}
                  </p>
                  <p style={styles.commentContent}>{comment.content}</p>
                </div>
                {(currentUserRole === "admin" ||
                  comment.user_id === currentUserId) && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    style={styles.deleteCommentButton}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- CREATE POST MODAL COMPONENT ---
const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleClose = () => {
    setContent("");
    setImageFile(null);
    setImagePreview("");
    onClose();
  };

  if (!isOpen) return null;

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !imageFile) {
      alert("Please write something or upload an image.");
      return;
    }
    setIsSubmitting(true);

    let imageUrl = null;
    if (imageFile) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      // Use 'posts' bucket
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, imageFile);
      if (uploadError) {
        alert("Error uploading image: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }
      const { data } = supabase.storage.from("posts").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { error: postError } = await supabase
      .from("posts")
      .insert({ content, image_url: imageUrl });

    if (postError) alert("Error creating post: " + postError.message);
    else {
      onPostCreated();
      handleClose();
    }
    setIsSubmitting(false);
  };

  return (
    <div style={modalStyles.backdrop} onClick={handleClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={modalStyles.title}>Create a New Post</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            style={modalStyles.textarea}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={modalStyles.imagePreview}
            />
          )}
          <div style={modalStyles.actions}>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              style={modalStyles.iconButton}
            >
              <ImageIcon />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: "none" }}
            />
            <button
              type="submit"
              style={modalStyles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExplorePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  //   const fetchPosts = useCallback(async () => {
  //     setLoading(true);
  //     const { data, error } = await supabase
  //       .from("posts")
  //       .select(
  //         `*, profiles!inner(*), likes(user_id), comments!left(*, profiles!inner(*))`
  //       )
  //       .order("created_at", { ascending: false });
  //     if (error) console.error("Error fetching posts:", error);
  //     else setPosts(data);
  //     setLoading(false);
  //   }, []);
  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`*, profiles(*), likes(user_id), comments(*, profiles(*))`)
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching posts:", error);
    else setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(profile);
      }
    };
    getSessionAndProfile();
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = (postId) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Post?",
      message:
        "Are you sure you want to delete this post? This action cannot be undone.",
      onConfirm: async () => {
        const { error } = await supabase
          .from("posts")
          .delete()
          .eq("id", postId);
        if (error) {
          alert("Error deleting post: " + error.message);
        } else {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        }
        setConfirmModal({ isOpen: false }); // Close modal after action
      },
    });
  };
  const handleUpdateComments = (postId, newCommentData, action) => {
    setPosts((currentPosts) =>
      currentPosts.map((p) => {
        if (p.id === postId) {
          const updatedComments =
            action === "add"
              ? [
                  newCommentData,
                  ...p.comments.filter((c) => c.id !== newCommentData.id),
                ]
              : p.comments.filter((c) => c.id !== newCommentData);
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );
  };
  const handleDeleteComment = (commentId, postId) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Comment?",
      message: "Are you sure you want to delete this comment?",
      onConfirm: async () => {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("id", commentId);
        if (error) {
          alert("Error deleting comment: " + error.message);
        } else {
          // This function now needs to be passed down and called to update the parent state
          onUpdateComments(postId, commentId, "delete");
        }
        setConfirmModal({ isOpen: false });
      },
    });
  };
  return (
    <BackgroundWrapper>
      <div style={styles.pageWrapper}>
        <NavBar />
        <div style={styles.pageContainer}>
          <div style={styles.feedHeader}>
            <h1 style={styles.pageTitle}>Community Feed</h1>
            <button
              style={styles.createPostButton}
              onClick={() =>
                user ? setCreateModalOpen(true) : navigate("/login")
              }
            >
              <PlusIcon />
              <span>Create Post</span>
            </button>
          </div>
          {loading ? (
            <LoadingSpinner text="Loading Feed..." />
          ) : (
            <div style={styles.feedGrid}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onDeletePost={handleDeletePost}
                  onUpdateComments={handleUpdateComments}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onPostCreated={fetchPosts}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
      <Footer></Footer>
    </BackgroundWrapper>
  );
};
// --- Main ExplorePage Component ---
// const ExplorePage = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isCreateModalOpen, setCreateModalOpen] = useState(false);

//   const fetchPosts = useCallback(async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("posts")
//       .select(
//         `*, profiles (username, avatar_url), likes (user_id), comments (*, profiles(username, avatar_url))`
//       )
//       .order("created_at", { ascending: false });
//     if (error) console.error("Error fetching posts:", error);
//     else setPosts(data);
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     const getSession = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       setUser(session?.user || null);
//     };
//     getSession();
//     fetchPosts();
//   }, [fetchPosts]);

//   return (
//     <BackgroundWrapper>
//       <div style={styles.pageWrapper}>
//         <NavBar />
//         <div style={styles.pageContainer}>
//           <div style={styles.feedHeader}>
//             <h1 style={styles.pageTitle}>Community Feed</h1>
//             <button
//               style={styles.createPostButton}
//               onClick={() =>
//                 user ? setCreateModalOpen(true) : navigate("/login")
//               }
//             >
//               <PlusIcon /> <span>Create Post</span>
//             </button>
//           </div>
//           {loading ? (
//             <LoadingSpinner text="Loading Feed..." />
//           ) : (
//             <div style={styles.feedGrid}>
//               {posts.map((post) => (
//                 <PostCard
//                   key={post.id}
//                   post={post}
//                   currentUserId={user?.id}
//                   currentUserRole={user?.role}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       {/* CreatePostModal is unchanged */}
//       <CreatePostModal
//         isOpen={isCreateModalOpen}
//         onClose={() => setCreateModalOpen(false)}
//         onPostCreated={fetchPosts}
//       />
//     </BackgroundWrapper>
//   );
// };

// --- STYLES ---
const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif",
  },
  pageContainer: {
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto",
    padding: "120px 40px 40px",
    color: "#fff",
    flex: "1 0 auto",
  },
  feedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  pageTitle: { fontSize: "3rem", fontWeight: "700" },
  createPostButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 25px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  feedGrid: { display: "flex", flexDirection: "column", gap: "40px" },
  card: {
    background:
      "linear-gradient(145deg, rgba(25, 29, 49, 0.7), rgba(20, 20, 35, 0.7))",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "18px",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: "15px" },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  defaultAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerText: { display: "flex", flexDirection: "column" },
  username: { fontSize: "1.1rem", fontWeight: "600", margin: 0 },
  postTime: { fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", margin: 0 },
  postContent: {
    fontSize: "1rem",
    lineHeight: 1.6,
    margin: "15px 0",
    color: "rgba(255,255,255,0.95)",
    whiteSpace: "pre-wrap",
  },
  postImage: { width: "100%", borderRadius: "12px", marginTop: "5px" },
  cardActions: {
    display: "flex",
    justifyContent: "space-around",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "15px",
    marginTop: "15px",
  },
  actionButton: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "background-color 0.2s ease, color 0.2s ease",
    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
  },
  // --- NEW COMMENT SECTION STYLES ---
  commentsSection: {
    marginTop: "15px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "15px",
  },
  commentForm: { display: "flex", gap: "10px", marginBottom: "15px" },
  commentInput: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#fff",
    borderRadius: "50px",
    padding: "10px 15px",
    fontSize: "0.95rem",
    outline: "none",
  },
  commentSubmitButton: {
    padding: "10px 20px",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#fff",
    background: "#00A8FF",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
  },
  commentsList: { display: "flex", flexDirection: "column", gap: "15px" },
  comment: { display: "flex", gap: "10px", alignItems: "flex-start" },
  commentAvatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  commentBody: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "8px 12px",
    borderRadius: "12px",
    width: "100%",
  },
  commentUsername: {
    fontSize: "0.9rem",
    fontWeight: "600",
    margin: "0 0 4px 0",
  },
  commentContent: {
    fontSize: "0.95rem",
    margin: 0,
    color: "rgba(255,255,255,0.85)",
  },

  cardHeader: { display: "flex", alignItems: "center", gap: "15px" },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  defaultAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerText: { display: "flex", flexDirection: "column" },
  username: { fontSize: "1.1rem", fontWeight: "600", margin: 0 },
  postTime: { fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", margin: 0 },
  postContent: {
    fontSize: "1rem",
    lineHeight: 1.6,
    margin: 0,
    color: "rgba(255,255,255,0.9)",
  },
  imageContainer: { position: "relative", marginTop: "10px" },
  postImage: { width: "100%", borderRadius: "12px", display: "block" },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "80px",
    background: "linear-gradient(to top, rgba(10,10,20,1), transparent)",
    borderRadius: "0 0 12px 12px",
  },
  cardActions: {
    display: "flex",
    justifyContent: "space-around",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "15px",
    marginTop: "10px",
  },
  actionButton: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    padding: "8px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  },
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif",
  },
  pageContainer: {
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto",
    padding: "120px 40px 40px",
    color: "#fff",
    flex: "1 0 auto",
  },
  feedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  pageTitle: { fontSize: "3rem", fontWeight: "700" },
  createPostButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 25px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  feedGrid: { display: "flex", flexDirection: "column", gap: "40px" },
  card: {
    background:
      "linear-gradient(145deg, rgba(25, 29, 49, 0.9), rgba(20, 20, 35, 0.9))",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px", // Added gap for spacing between sections
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "15px" },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  defaultAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerText: { display: "flex", flexDirection: "column" },
  username: { fontSize: "1.1rem", fontWeight: "600", margin: 0 },
  postTime: { fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", margin: 0 },
  postContent: {
    fontSize: "1rem",
    lineHeight: 1.6,
    margin: 0,
    color: "rgba(255,255,255,0.95)",
    whiteSpace: "pre-wrap",
  },
  postImage: { width: "100%", borderRadius: "12px", marginTop: "5px" },
  cardActions: {
    display: "flex",
    justifyContent: "space-around",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "15px",
  },
  actionButton: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
  },
  deleteButton: {
    background: "rgba(255,255,255,0.05)",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },
  commentsSection: {
    marginTop: "10px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "20px",
  },
  commentForm: { display: "flex", gap: "10px", marginBottom: "20px" },
  commentInput: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#fff",
    borderRadius: "50px",
    padding: "10px 15px",
    fontSize: "0.95rem",
    outline: "none",
  },
  commentSubmitButton: {
    padding: "10px 20px",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#fff",
    background: "#00A8FF",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
  },
  commentsList: { display: "flex", flexDirection: "column", gap: "15px" },
  comment: { display: "flex", gap: "12px", alignItems: "flex-start" },
  commentAvatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  commentBody: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "10px 14px",
    borderRadius: "12px",
    width: "100%",
    position: "relative",
  },
  commentUsername: {
    fontSize: "0.9rem",
    fontWeight: "600",
    margin: "0 0 5px 0",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  commentContent: {
    fontSize: "0.95rem",
    margin: 0,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 1.5,
  },
  deleteCommentButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.3)",
    cursor: "pointer",
    fontSize: "1.2rem",
    padding: "5px",
    borderRadius: "50%",
    transition: "color 0.2s ease",
    "&:hover": { color: "#dc3545" },
  },
};

const modalStyles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
  },
  modal: {
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#111524",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#fff",
    margin: "0 0 20px 0",
    textAlign: "center",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    backgroundColor: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    borderRadius: "10px",
    padding: "15px",
    fontSize: "1rem",
    resize: "none",
    boxSizing: "border-box",
  },
  imagePreview: {
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "10px",
    marginTop: "15px",
    objectFit: "cover",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
  },
  iconButton: {
    background: "none",
    border: "none",
    color: "#00A8FF",
    cursor: "pointer",
    padding: "10px",
  },
  submitButton: {
    padding: "10px 30px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
  },
  card: {
    background:
      "linear-gradient(145deg, rgba(25, 29, 49, 0.9), rgba(20, 20, 35, 0.9))",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "18px",
    padding: "25px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "15px" },
  deleteButton: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
  },
  deleteCommentButton: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: "1.2rem",
    padding: "5px",
  },
};

export default ExplorePage;
