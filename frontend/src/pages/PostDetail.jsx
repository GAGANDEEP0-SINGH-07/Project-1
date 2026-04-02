import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import { 
  Box, 
  Container, 
  CircularProgress, 
  Typography, 
  IconButton,
  Tooltip,
  alpha,
  Button
} from "@mui/material";
import { MdArrowBack, MdExplore } from "react-icons/md";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = mode === "dark";

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posts/${postId}`);
      setPost(res.data);
    } catch (err) {
      console.error("Failed to fetch post:", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handlePostUpdated = (updatedPost) => {
    setPost(updatedPost);
  };

  const handlePostDeleted = () => {
    navigate("/");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>
      <Navbar />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Back">
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ 
                bgcolor: isDark ? alpha("#fff", 0.05) : alpha("#000", 0.03),
                "&:hover": { bgcolor: isDark ? alpha("#fff", 0.1) : alpha("#000", 0.06) }
              }}
            >
              <MdArrowBack />
            </IconButton>
          </Tooltip>
          <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? "#fff" : "#1e293b" }}>
            Post Details
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress sx={{ color: isDark ? "#63b0ff" : "#2563eb" }} />
          </Box>
        ) : !post ? (
          <Box sx={{ textAlign: "center", mt: 10, p: 6, borderRadius: 4, bgcolor: isDark ? alpha("#fff", 0.02) : alpha("#000", 0.01) }}>
             <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
               Post not found or has been deleted.
             </Typography>
             <Button 
               variant="contained" 
               startIcon={<MdExplore />}
               onClick={() => navigate("/")}
               sx={{ 
                 borderRadius: "12px", 
                 textTransform: "none", 
                 fontWeight: 700,
                 px: 3
               }}
             >
               Go to Feed
             </Button>
          </Box>
        ) : (
          <PostCard 
            post={post} 
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        )}
      </Container>
    </Box>
  );
};

export default PostDetail;
