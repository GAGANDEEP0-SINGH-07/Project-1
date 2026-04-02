import { useState } from "react";
import api from "../services/api";
import {
  Box,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import { MdSend, MdDeleteOutline } from "react-icons/md";
import { toast } from "react-toastify";

const CommentSection = ({ postId, postUserId, comments, onCommentAdded }) => {
  const { user } = useAuth();
  const { mode } = useThemeContext();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await api.put(`/posts/comment/${postId}`, {
        text: text.trim(),
      });
      setText("");
      if (onCommentAdded) onCommentAdded(res.data);
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await api.delete(`/posts/comment/${postId}/${commentId}`);
      if (onCommentAdded) onCommentAdded(res.data);
      toast.success("Comment deleted");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment");
    }
  };

  const isPostOwner = postUserId === user?._id;

  return (
    <Box sx={{ mt: 1 }}>
      <Divider sx={{ borderColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", mb: 2.5 }} />

      {/* Comment list */}
      {comments.length > 0 ? (
        <Box sx={{ 
          maxHeight: 400, 
          overflowY: "auto", 
          mb: 3,
          pr: 1,
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { 
            borderRadius: "10px",
            bgcolor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" 
          }
        }}>
          {comments.map((c, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                position: "relative",
                transition: "all 0.2s ease",
                "&:hover": { transform: "translateX(4px)" }
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  fontWeight: 800,
                  bgcolor: mode === "dark" ? "#1e293b" : "#f1f5f9",
                  color: mode === "dark" ? "#94a3b8" : "#64748b",
                  border: `1.5px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                }}
              >
                {c.username?.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    py: 1.2,
                    px: 2,
                    borderRadius: "0 16px 16px 16px",
                    background: mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(100, 116, 139, 0.08)"}`,
                    position: "relative",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: mode === "dark" ? "#63b0ff" : "#2563eb", fontWeight: 800, fontSize: "0.75rem" }}
                    >
                      {c.username}
                    </Typography>
                    {(isPostOwner || c.username === user?.username) && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(c._id)}
                        sx={{
                          color: "rgba(239, 68, 68, 0.4)",
                          p: 0.5,
                          "&:hover": { color: "#ef4444", background: "rgba(239, 68, 68, 0.08)" },
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      </IconButton>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: mode === "dark" ? "rgba(255,255,255,0.85)" : "#334155",
                      fontSize: "0.88rem",
                      lineHeight: 1.5,
                      fontWeight: 500
                    }}
                  >
                    {c.text}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", mb: 3, opacity: 0.6, fontStyle: "italic" }}>
          No comments yet. Be the first to join the conversation.
        </Typography>
      )}

      {/* Add comment input */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ 
          display: "flex", 
          gap: 1.5, 
          alignItems: "center",
          bgcolor: mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
          p: 1,
          borderRadius: 4,
          border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
        }}
      >
        <Avatar
          src={user?.profileImage}
          sx={{ width: 32, height: 32, border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}
        />
        <TextField
          id={`comment-input-${postId}`}
          name="comment"
          fullWidth
          size="small"
          placeholder="Share your thoughts..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          variant="standard"
          autoComplete="off"
          InputProps={{
            disableUnderline: true,
            sx: {
              color: mode === "dark" ? "#fff" : "#1e293b",
              fontSize: "0.9rem",
              fontWeight: 500,
              px: 1,
            },
          }}
        />
        <IconButton
          type="submit"
          disabled={loading || !text.trim()}
          sx={{
            bgcolor: text.trim() ? (mode === "dark" ? "#3b82f6" : "#2563eb") : "transparent",
            color: text.trim() ? "#fff" : "text.disabled",
            borderRadius: 3,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": { 
              bgcolor: mode === "dark" ? "#2563eb" : "#1d4ed8",
              transform: text.trim() ? "scale(1.1)" : "none"
            },
            "&:disabled": { color: "text.disabled" },
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
        </IconButton>
      </Box>
    </Box>
  );
};

export default CommentSection;
