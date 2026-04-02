import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Avatar, 
  alpha 
} from "@mui/material";
import { 
  MdHome, 
  MdMail, 
  MdBookmark, 
  MdSettings,
} from "react-icons/md";

const LeftSidebar = memo(({ user, mode }) => {
  const isDark = mode === "dark";
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Feed", icon: <MdHome size={24} />, path: "/" },
    { label: "Messages", icon: <MdMail size={24} />, path: "/messages" },
    { label: "Saved", icon: <MdBookmark size={24} />, path: "/saved" },
    { label: "Settings", icon: <MdSettings size={24} />, path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, position: "sticky", top: 88 }}>
      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          background: isDark 
            ? "rgba(15, 12, 41, 0.6)" 
            : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(24px) saturate(180%)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
          boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(31, 38, 135, 0.07)",
          transition: "transform 0.3s ease",
          "&:hover": { transform: "translateY(-4px)" }
        }}
      >
        <Box 
          sx={{ 
            height: 80, 
            background: isDark 
              ? "linear-gradient(135deg, #1e3a8a 0%, #7e22ce 100%)" 
              : "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
            opacity: isDark ? 0.8 : 1,
            position: "relative"
          }} 
        />

        <Box sx={{ p: 4, pt: 0, textAlign: "center", position: "relative" }}>
          <Box sx={{ mt: -5, mb: 1.5, display: "inline-block" }}>
            <Avatar
              sx={{
                width: 90, 
                height: 90, 
                fontSize: "2.2rem", 
                fontWeight: 900, 
                margin: "auto",
                bgcolor: isDark ? "#63b0ff" : "#1e40af",
                color: "#fff",
                border: `4px solid ${isDark ? "rgba(15, 12, 41, 1)" : "#fff"}`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                cursor: "pointer",
                transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                "&:hover": { transform: "scale(1.08)" }
              }}
              onClick={() => navigate(`/profile/${user?._id}`)}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? "#fff" : "#1e293b", letterSpacing: "-0.5px" }}>
            {user?.username}
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b", fontWeight: 500 }}>
            {user?.tagline || "Social Creator"}
          </Typography>
          
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            mt: 4, 
            p: 2, 
            borderRadius: 4,
            background: isDark ? alpha("#fff", 0.03) : alpha("#000", 0.02),
            border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}`
          }}>
             <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontSize: "1.1rem", 
                  fontWeight: 800,
                  color: isDark ? "#63b0ff" : "#2563eb",
                  mb: 0.2
                }}>{user?.followersCount || 0}</Typography>
                <Typography variant="caption" sx={{ 
                  color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8", 
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.65rem"
                }}>Followers</Typography>
             </Box>
             <Box sx={{ width: 1, height: 30, my: "auto", borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, mx: 1 }} />
             <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontSize: "1.1rem", 
                  fontWeight: 800,
                  color: isDark ? "#63b0ff" : "#2563eb",
                  mb: 0.2
                }}>{user?.postCount || 0}</Typography>
                <Typography variant="caption" sx={{ 
                  color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8", 
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.65rem"
                }}>Posts</Typography>
             </Box>
          </Box>
        </Box>
      </Card>

      <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1 }}>
         {menuItems.map((item) => (
           <Box
             key={item.label}
             onClick={() => navigate(item.path)}
             sx={{
               display: "flex",
               alignItems: "center",
               gap: 2.2,
               px: 2.5,
               py: 1.8,
               borderRadius: 4,
               cursor: "pointer",
               transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
               position: "relative",
               color: isActive(item.path) ? (isDark ? "#fff" : "#1e40af") : (isDark ? "rgba(255,255,255,0.6)" : "#64748b"),
               background: isActive(item.path) 
                 ? (isDark ? "linear-gradient(90deg, rgba(99, 176, 255, 0.15) 0%, transparent 100%)" : "linear-gradient(90deg, rgba(37, 99, 235, 0.08) 0%, transparent 100%)")
                 : "transparent",
               "& .menu-icon": {
                 color: isActive(item.path) ? (isDark ? "#63b0ff" : "#2563eb") : "inherit",
                 transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
               },
               "&:hover": { 
                 background: isDark ? alpha("#fff", 0.04) : alpha("#000", 0.03),
                 transform: "translateX(6px)",
                 color: isDark ? "#fff" : "#1e293b",
                 "& .menu-icon": { color: isDark ? "#63b0ff" : "#2563eb" }
               }
             }}
           >
             {isActive(item.path) && (
               <Box 
                 sx={{ 
                   position: "absolute", 
                   left: 0, 
                   width: 4, 
                   height: "60%", 
                   borderRadius: "0 4px 4px 0",
                   background: isDark ? "#63b0ff" : "#2563eb",
                   boxShadow: `4px 0 12px ${isDark ? "rgba(99, 176, 255, 0.4)" : "rgba(37, 99, 235, 0.3)"}`
                 }} 
               />
             )}
             <Box className="menu-icon" sx={{ display: "flex" }}>
               {item.icon}
             </Box>
             <Typography sx={{ 
               fontWeight: isActive(item.path) ? 700 : 500, 
               fontSize: "1rem",
               letterSpacing: "-0.2px"
             }}>
                {item.label}
             </Typography>
           </Box>
         ))}
      </Box>
    </Box>
  );
});

const RightSidebar = memo(({ mode }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    {/* Trending Card */}
    <Card
      sx={{
        borderRadius: 4,
        background: mode === "dark" ? "rgba(20, 28, 38, 0.7)" : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(16px)",
        boxShadow: mode === "dark" ? "none" : "0 4px 20px rgba(0, 97, 163, 0.05)",
        border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,1)"}`,
        p: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <span className="material-symbols-outlined" style={{ color: mode === "dark" ?"#facc15":"#eab308" }}>trending_up</span>
        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700 }}>Trending Topics</Typography>
      </Box>

      {["#TechInnovation2024", "#DesignSystems", "#AIinFrontend", "#FutureOfWork", "#CleanCode"].map((topic, i) => (
        <Box key={topic} sx={{ mb: i === 4 ? 0 : 2, cursor: "pointer", "&:hover p": { color: mode === "dark"?"#63b0ff":"#0061a3" } }}>
           <Typography variant="body2" fontWeight={600} sx={{ transition: "color 0.2s" }}>{topic}</Typography>
           <Typography variant="caption" color="text.secondary">{(12.5 - i * 2.1).toFixed(1)}K posts</Typography>
        </Box>
      ))}
    </Card>
  </Box>
));

const Feed = () => {
  const { mode } = useThemeContext();
  const { user, refreshUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get("/posts/feed");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    refreshUser(); // Get real stats on mount
  }, [fetchPosts, refreshUser]);

  const handlePostUpdated = useCallback((updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  }, []);

  const handlePostDeleted = useCallback((postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>
      <Navbar />

      <Box sx={{ maxWidth: 1600, width: "100%", mx: "auto", px: { xs: 2, md: 4, lg: 6 }, py: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ lg: 3 }} sx={{ display: { xs: "none", lg: "block" } }}>
            <LeftSidebar user={user} mode={mode} />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <CreatePost onPostCreated={fetchPosts} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
              {loading ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {[1, 2, 3].map((n) => <PostSkeleton key={n} />)}
                </Box>
              ) : posts.length === 0 ? (
                <Box sx={{ textAlign: "center", mt: 8 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "text.secondary", fontWeight: 500 }}
                  >
                    No posts yet. Be the first to share something! ✨
                  </Typography>
                </Box>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostUpdated={handlePostUpdated}
                    onPostDeleted={handlePostDeleted}
                  />
                ))
              )}
            </Box>
          </Grid>

          <Grid size={{ lg: 3 }} sx={{ display: { xs: "none", lg: "block" } }}>
             <RightSidebar mode={mode} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Feed;
