import { useState, useEffect, useCallback, memo } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import CommentSection from "./CommentSection";
import { toast } from "react-toastify";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
} from "@mui/material";

const PostCard = memo(({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const { mode } = useThemeContext();
  const [localPost, setLocalPost] = useState(post);
  const [showComments, setShowComments] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(post.text);
  const [isSaving, setIsSaving] = useState(false);

  const isLiked = localPost.likes?.includes(user?.username);
  const postUserId = localPost.userId?._id || localPost.userId;
  const isOwner = postUserId === user?._id;
  const [isFollowing, setIsFollowing] = useState(user?.following?.includes(postUserId));
  const menuOpen = Boolean(menuAnchor);

  // Sync isFollowing if user updates
  useEffect(() => {
    setIsFollowing(user?.following?.includes(postUserId));
  }, [user, postUserId]);

  const handleFollow = useCallback(async () => {
    try {
      const res = await api.post(`/auth/follow/${postUserId}`);
      setIsFollowing(res.data.isFollowing);
      toast.success(res.data.isFollowing ? `Following ${localPost.username}` : `Unfollowed ${localPost.username}`);
    } catch (err) {
      console.error("Follow error:", err);
      toast.error("Failed to update follow status");
    }
  }, [postUserId, localPost.username]);

  const handleLike = useCallback(async () => {
    try {
      const res = await api.put(`/posts/like/${localPost._id}`);
      setLocalPost(res.data);
      if (onPostUpdated) onPostUpdated(res.data);
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  }, [localPost._id, onPostUpdated]);

  const handleDelete = useCallback(async () => {
    setMenuAnchor(null);
    try {
      await api.delete(`/posts/delete/${localPost._id}`);
      toast.success("Post deleted successfully");
      if (onPostDeleted) onPostDeleted(localPost._id);
    } catch (err) {
      toast.error("Failed to delete post");
      console.error("Failed to delete post:", err);
    }
  }, [localPost._id, onPostDeleted]);

  const handleEditSave = useCallback(async () => {
    if (!editVal.trim() && !localPost.image) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/posts/edit/${localPost._id}`, { text: editVal });
      setLocalPost(res.data);
      setIsEditing(false);
      toast.success("Post updated!");
      if (onPostUpdated) onPostUpdated(res.data);
    } catch (err) {
      toast.error("Failed to update post");
      console.error("Update error:", err);
    } finally {
      setIsSaving(false);
    }
  }, [editVal, localPost._id, localPost.image, onPostUpdated]);

  const handleCommentAdded = useCallback((updatedPost) => {
    setLocalPost(updatedPost);
    if (onPostUpdated) onPostUpdated(updatedPost);
  }, [onPostUpdated]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 5,
        background: mode === "dark" 
          ? "linear-gradient(135deg, rgba(20, 28, 38, 0.8) 0%, rgba(13, 19, 29, 0.9) 100%)" 
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(24px)",
        border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0, 97, 163, 0.08)"}`,
        boxShadow: mode === "dark" 
          ? "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)" 
          : "0 12px 40px rgba(0, 97, 163, 0.08), inset 0 1px 1px rgba(255,255,255,0.8)",
        overflow: "hidden",
        mb: 4,
        p: { xs: 2.5, sm: 3.5 },
        position: "relative",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          boxShadow: mode === "dark" 
            ? "0 20px 50px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.1)" 
            : "0 20px 50px rgba(0, 97, 163, 0.12)",
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                fontWeight: 800,
                fontSize: "1.4rem",
                background: mode === "dark" 
                  ? "linear-gradient(45deg, #1e40af, #3b82f6)" 
                  : "linear-gradient(45deg, #0284c7, #0ea5e9)",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: `2px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "#fff"}`,
              }}
            >
              {localPost.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box 
              sx={{ 
                position: "absolute", bottom: 2, right: 2, 
                width: 14, height: 14, borderRadius: "50%", 
                bgcolor: "#22c55e", border: `2px solid ${mode === "dark" ? "#141c26" : "#fff"}`,
                boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)"
              }} 
            />
          </Box>
          
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="subtitle1" sx={{ color: "text.primary", fontWeight: 800, letterSpacing: "-0.01em", fontSize: "1.05rem" }}>
                {localPost.username}
              </Typography>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#3b82f6", fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, opacity: 0.7, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Expert • {formatDate(localPost.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {!isOwner && user && (
            <Button
              size="small"
              onClick={handleFollow}
              sx={{
                px: 2.5,
                borderRadius: 4,
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.8rem",
                height: 32,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                bgcolor: isFollowing 
                  ? (mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)") 
                  : (mode === "dark" ? "#3b82f6" : "#0ea5e9"),
                color: isFollowing ? "text.secondary" : "#fff",
                border: isFollowing ? `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` : "none",
                "&:hover": {
                   bgcolor: isFollowing 
                    ? (mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)") 
                    : (mode === "dark" ? "#2563eb" : "#0284c7"),
                   transform: "translateY(-1px)",
                   boxShadow: isFollowing ? "none" : "0 4px 12px rgba(59, 130, 246, 0.4)"
                }
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}

          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            size="small"
            sx={{ 
              color: "text.secondary", 
              bgcolor: mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              "&:hover": { bgcolor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" } 
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_vert</span>
          </IconButton>
        </Box>

        {isOwner && (
          <Menu
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={() => setMenuAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 0,
              sx: {
                bgcolor: mode === "dark" ? "#141c26" : "#fff",
                border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                borderRadius: 3,
                minWidth: 180,
                mt: 1,
                overflow: 'visible',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: mode === "dark" ? "#141c26" : "#fff",
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => { setIsEditing(true); setMenuAnchor(null); }}
              sx={{ py: 1.2, color: "text.secondary", "&:hover": { bgcolor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" } }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit_square</span>
              </ListItemIcon>
              <ListItemText primary="Edit content" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 700 }} />
            </MenuItem>
            <MenuItem
              onClick={handleDelete}
              sx={{ py: 1.2, color: "#ef4444", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" } }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#ef4444" }}>delete_sweep</span>
              </ListItemIcon>
              <ListItemText primary="Delete post" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 700 }} />
            </MenuItem>
          </Menu>
        )}
      </Box>

      {/* Body Setup */}
      {isEditing ? (
          <Box sx={{ mb: 3 }}>
            <TextField
              id={`edit-post-${localPost._id}`}
              name="editText"
              fullWidth
              multiline
              minRows={3}
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  bgcolor: mode === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0,0,0,0.02)",
                  color: "text.primary",
                  fontSize: "1rem",
                  borderRadius: 4,
                  px: 2,
                  py: 2,
                  border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                  "& fieldset": { border: "none" },
                  "&.Mui-focused": { borderColor: "#3b82f6", boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)" },
                },
              }}
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                onClick={() => { setIsEditing(false); setEditVal(localPost.text); }}
                disabled={isSaving}
                sx={{ color: "text.secondary", textTransform: "none", fontWeight: 700, borderRadius: 2 }}
              >
                Discard
              </Button>
              <Button
                variant="contained"
                onClick={handleEditSave}
                disabled={isSaving}
                sx={{
                  bgcolor: "#3b82f6",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 3,
                  px: 3,
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  "&:hover": { bgcolor: "#2563eb", boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)" }
                }}
              >
                {isSaving ? "Publishing..." : "Update Post"}
              </Button>
            </Box>
          </Box>
        ) : (
          localPost.text && (
            <Typography
              variant="body1"
              sx={{
                color: "text.primary",
                lineHeight: 1.8,
                mb: localPost.image ? 3 : 1,
                whiteSpace: "pre-wrap",
                fontSize: "1.05rem",
                fontWeight: 500,
                letterSpacing: "0.01em"
              }}
            >
              {localPost.text}
            </Typography>
          )
        )}

      {/* Image body if exists */}
      {localPost.image && localPost.image.trim() !== "" && (
        <Box
          sx={{
            mt: 2,
            mb: 1,
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
            boxShadow: mode === "dark" ? "0 8px 30px rgba(0,0,0,0.4)" : "0 8px 30px rgba(0,0,0,0.04)",
            bgcolor: mode === "dark" ? "#0a1018" : "#f8fafc",
          }}
        >
          <Box
            component="img"
            src={localPost.image}
            alt="Post content"
            onError={(e) => (e.target.style.display = "none")}
            sx={{
              width: "100%",
              maxHeight: 600,
              objectFit: "cover",
              display: "block",
              transition: "transform 0.5s ease",
              "&:hover": { transform: "scale(1.02)" }
            }}
          />
        </Box>
      )}

      {/* Interactions Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 3.5,
          pt: 1.5,
          borderTop: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
        }}
      >
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 } }}>
          <Button
            onClick={handleLike}
            sx={{
              display: "flex", alignItems: "center", gap: 1.2,
              color: isLiked ? "#ef4444" : "text.secondary",
              textTransform: "none", py: 1, px: 2, borderRadius: 4,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              bgcolor: isLiked ? "rgba(239, 68, 68, 0.08)" : "transparent",
              "&:hover": { 
                bgcolor: isLiked ? "rgba(239, 68, 68, 0.12)" : (mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"),
                transform: "scale(1.05)"
              },
            }}
          >
             <span className="material-symbols-outlined" style={{ 
               fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0", 
               fontSize: 22,
               color: isLiked ? "#ef4444" : "inherit"
             }}>favorite</span>
             <Typography sx={{ fontSize: "0.95rem", fontWeight: 800 }}>{localPost.likes?.length || 0}</Typography>
          </Button>

          <Button
            onClick={() => setShowComments(!showComments)}
            sx={{
              display: "flex", alignItems: "center", gap: 1.2,
              color: showComments ? "#3b82f6" : "text.secondary",
              textTransform: "none", py: 1, px: 2, borderRadius: 4,
              bgcolor: showComments ? "rgba(59, 130, 246, 0.08)" : "transparent",
              "&:hover": { 
                bgcolor: showComments ? "rgba(59, 130, 246, 0.12)" : (mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"),
                transform: "scale(1.05)"
              },
            }}
          >
             <span className="material-symbols-outlined" style={{ 
               fontVariationSettings: showComments ? "'FILL' 1" : "'FILL' 0", 
               fontSize: 22 
             }}>chat_bubble</span>
             <Typography sx={{ fontSize: "0.95rem", fontWeight: 800 }}>{localPost.comments?.length || 0}</Typography>
          </Button>

          <IconButton
            sx={{
              color: "text.secondary", p: 1.2,
              "&:hover": { 
                bgcolor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                color: "#22c55e", transform: "rotate(15deg)"
              }
            }}
          >
             <span className="material-symbols-outlined" style={{ fontSize: 22 }}>ios_share</span>
          </IconButton>
        </Box>
        
        <IconButton 
          size="medium" 
          sx={{ 
            color: "text.secondary", 
            "&:hover": { 
              bgcolor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              color: "#eab308"
            } 
          }}
        >
           <span className="material-symbols-outlined" style={{ fontSize: 22 }}>bookmark</span>
        </IconButton>
      </Box>

      {/* Comment Section injection */}
      {showComments && (
        <Box sx={{ 
          pt: 3, mt: 1,
          animation: "fadeInUp 0.3s ease-out",
          "@keyframes fadeInUp": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" }
          }
        }}>
          <CommentSection
            postId={localPost._id}
            postUserId={postUserId}
            comments={localPost.comments || []}
            onCommentAdded={handleCommentAdded}
          />
        </Box>
      )}
    </Paper>
  );
});

export default PostCard;
