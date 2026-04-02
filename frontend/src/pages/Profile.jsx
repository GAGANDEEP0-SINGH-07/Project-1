import { useState, useEffect, useCallback } from "react";
import { 
  Box, Typography, Avatar, CircularProgress, Divider, 
  Button, Tabs, Tab, Paper, Stack 
} from "@mui/material";
import { MdEdit, MdShare, MdLocationOn, MdDateRange } from "react-icons/md";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import api from "../services/api";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import EditProfileModal from "../components/EditProfileModal";
import CreatePost from "../components/CreatePost";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const { mode } = useThemeContext();
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?._id;

  const fetchProfileData = useCallback(async () => {
    try {
      const targetId = userId || currentUser?._id;
      if (!targetId) return;

      // Fetch User Info
      const userRes = await api.get(`/auth/profile/${targetId}`);
      setProfileUser(userRes.data);
    } catch (err) {
      console.error("Failed to fetch profile user:", err);
      toast.error("Failed to load profile");
    }
  }, [userId, currentUser?._id]);

  const fetchTabData = useCallback(async () => {
    try {
      setLoading(true);
      const targetId = userId || currentUser?._id;
      if (!targetId) return;

      let res;
      if (tabValue === 0) {
        res = await api.get(`/posts/user/${targetId}`);
        setUserPosts(res.data);
      } else if (tabValue === 1) {
        res = await api.get(`/posts/replies/${targetId}`);
        setReplies(res.data);
      } else if (tabValue === 2) {
        res = await api.get(`/posts/liked/${targetId}`);
        setLikedPosts(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch tab data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser?._id, tabValue]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  // Sync following state
  useEffect(() => {
    if (profileUser && currentUser) {
      // Logic: profileUser.followers contains the IDs of those following this user
      const isActuallyFollowing = profileUser.followers?.some(fId => 
        (typeof fId === 'string' ? fId : fId._id) === currentUser._id
      );
      setIsFollowing(!!isActuallyFollowing);
    }
  }, [profileUser, currentUser]);

  const handleFollow = async () => {
    if (!profileUser || !currentUser) return;
    try {
      const res = await api.post(`/auth/follow/${profileUser._id}`);
      setIsFollowing(res.data.isFollowing);
      
      // Update local profile user state to reflect new follower count/list
      setProfileUser(prev => ({
        ...prev,
        followers: res.data.isFollowing 
          ? [...(prev.followers || []), currentUser._id]
          : (prev.followers || []).filter(id => (typeof id === 'string' ? id : id._id) !== currentUser._id)
      }));

      // Refresh current user in context to update their "following" list
      refreshUser();
      
      toast.success(res.data.isFollowing ? `Following ${profileUser.username}` : `Unfollowed ${profileUser.username}`);
    } catch (err) {
      console.error("Follow error:", err);
      toast.error("Failed to update follow status");
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setProfileUser(updatedUser);
    refreshUser(); // Sync global auth context
  };

  const handlePostUpdated = (updatedPost) => {
    const updateList = (prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p));
    setUserPosts(updateList);
    setLikedPosts(updateList);
    setReplies(updateList);
  };

  const handlePostDeleted = (postId) => {
    const filterList = (prev) => prev.filter((p) => p._id !== postId);
    setUserPosts(filterList);
    setLikedPosts(filterList);
    setReplies(filterList);
  };

  const joinedDate = profileUser?.createdAt 
    ? new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  const renderPostList = (posts, emptyTitle, emptyDesc) => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress sx={{ color: mode === "dark" ? "#63b0ff" : "#0061a3" }} />
        </Box>
      );
    }

    if (posts.length === 0) {
      return (
        <Box sx={{ textAlign: "center", mt: 6, p: 4, borderRadius: 4, bgcolor: mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}>
            {emptyTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {emptyDesc}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>
      <Navbar />
      
      <EditProfileModal 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={profileUser}
        onUpdate={handleProfileUpdate}
      />

      {/* Banner */}
      <Box 
        sx={{ 
          height: { xs: 150, sm: 220 }, 
          background: mode === "dark" 
          ? "linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%)" 
          : "linear-gradient(135deg, #93c5fd 0%, #c4b5fd 100%)",
          position: "relative",
          zIndex: 0
        }}
      />

      {/* Main Content Area */}
      <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 2, sm: 3 }, mt: { xs: -6, sm: -8 }, position: "relative", zIndex: 1 }}>
        
        {/* Profile Card */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            borderRadius: 4, 
            bgcolor: mode === "dark" ? "rgba(20, 28, 38, 0.85)" : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(24px)",
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
            boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0, 97, 163, 0.08)",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, sm: 4 }, alignItems: { xs: "center", sm: "flex-start" }}}>
            
            {/* Avatar */}
            <Box sx={{ mt: { xs: -8, sm: -10 } }}>
              <Avatar
                src={profileUser?.profileImage}
                sx={{
                  width: { xs: 110, sm: 140 },
                  height: { xs: 110, sm: 140 },
                  border: `4px solid ${mode === "dark" ? "#141c26" : "#ffffff"}`,
                  fontSize: { xs: "3rem", sm: "4rem" },
                  fontWeight: 700,
                  bgcolor: mode === "dark" ? "#63b0ff" : "#0061a3",
                  color: mode === "dark" ? "#001d36" : "#ffffff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                }}
              >
                 {profileUser?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Box>

            {/* Profile Details */}
            <Box sx={{ flex: 1, width: "100%", textAlign: { xs: "center", sm: "left" } }}>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "center", sm: "flex-start" }, gap: 2 }}>
                
                {/* Names and Info */}
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
                    {profileUser?.username}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 600, mb: 1, letterSpacing: "-0.01em" }}>
                    {profileUser?.tagline || "Social Creator"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.disabled", fontWeight: 400, mb: 2 }}>
                    {profileUser?.email}
                  </Typography>
                  
                  {/* Bio */}
                  {profileUser?.bio && (
                    <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 500, mb: 2, maxWidth: 500 }}>
                      {profileUser.bio}
                    </Typography>
                  )}

                  {/* Meta Tags */}
                  <Stack direction="row" spacing={2} justifyContent={{ xs: "center", sm: "flex-start" }} sx={{ mb: { xs: 3, sm: 1 }, color: "text.secondary" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <MdLocationOn size={18} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{profileUser?.location || "Global"}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <MdDateRange size={18} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Joined {profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently"}</Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Actions */}
                <Stack direction="row" spacing={1.5} justifyContent="center">
                  {isOwnProfile ? (
                    <Button 
                      variant="outlined" 
                      startIcon={<MdEdit />}
                      size="small"
                      onClick={() => setIsEditModalOpen(true)}
                      sx={{ 
                        borderRadius: 5, 
                        textTransform: "none", 
                        fontWeight: 600,
                        borderColor: mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                        color: "text.primary",
                        "&:hover": {
                           borderColor: mode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                           bgcolor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button 
                      variant="contained"
                      size="small"
                      onClick={handleFollow}
                      sx={{ 
                        borderRadius: 5, 
                        textTransform: "none", 
                        fontWeight: 700,
                        bgcolor: isFollowing 
                          ? (mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") 
                          : (mode === "dark" ? "#63b0ff" : "#2563eb"),
                        color: isFollowing ? "text.secondary" : "#fff",
                        border: isFollowing ? `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` : "none",
                        px: 3,
                        "&:hover": {
                          bgcolor: isFollowing 
                            ? (mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)") 
                            : (mode === "dark" ? "#44a0ff" : "#1d4ed8"),
                        }
                      }}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                  <Button 
                    variant="contained" 
                    startIcon={<MdShare />}
                    size="small"
                    sx={{ 
                      borderRadius: 5, 
                      textTransform: "none", 
                      fontWeight: 600,
                      bgcolor: mode === "dark" ? "#1758c7" : "#0061a3",
                      color: "#fff",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: mode === "dark" ? "#1e40af" : "#004271",
                      }
                    }}
                  >
                    Share
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* Stats Section - Moved Outside for Global Centering */}
          <Box 
            sx={{ 
              mt: 4, 
              p: 2.5, 
              width: "100%",
              borderRadius: 4, 
              bgcolor: mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              display: "grid", 
              gridTemplateColumns: "1fr auto 1fr auto 1fr",
              alignItems: "center",
              border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
            }}
          >
             {/* Item 1: Posts */}
             <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: mode === "dark" ? "#63b0ff" : "#1e40af", lineHeight: 1.2 }}>
                  {userPosts.length}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                  Posts
                </Typography>
             </Box>

             <Divider orientation="vertical" sx={{ height: 32, borderColor: mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }} />

             {/* Item 2: Followers */}
             <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: mode === "dark" ? "#63b0ff" : "#1e40af", lineHeight: 1.2 }}>
                  {profileUser?.followers?.length || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                  Followers
                </Typography>
             </Box>

             <Divider orientation="vertical" sx={{ height: 32, borderColor: mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }} />

             {/* Item 3: Following */}
             <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: mode === "dark" ? "#63b0ff" : "#1e40af", lineHeight: 1.2 }}>
                  {profileUser?.following?.length || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                  Following
                </Typography>
             </Box>
          </Box>
        </Paper>
        
        {isOwnProfile && (
          <Box sx={{ mb: 4 }}>
            <CreatePost onPostCreated={() => {
              fetchTabData(); // Refresh the posts list below
              refreshUser(); // Sync global stats
            }} />
          </Box>
        )}

        {/* Tabs Section */}
        <Box sx={{ borderBottom: 1, borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newVal) => setTabValue(newVal)}
            sx={{
               "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "1rem", color: "text.secondary" },
               "& .Mui-selected": { color: mode === "dark" ? "#63b0ff !important" : "#0061a3 !important" },
               "& .MuiTabs-indicator": { backgroundColor: mode === "dark" ? "#63b0ff" : "#0061a3", height: 3, borderRadius: "3px 3px 0 0" }
            }}
          >
            <Tab label="Posts" />
            <Tab label="Replies" />
            <Tab label="Likes" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ pb: 8 }}>
          {tabValue === 0 && renderPostList(userPosts, "No posts yet", "When you share posts on your feed, they will show up here.")}
          {tabValue === 1 && renderPostList(replies, "No replies to show", "Replies you make on other posts will appear here.")}
          {tabValue === 2 && renderPostList(likedPosts, "Nothing to see here", "Posts you've liked will be saved here for you.")}
        </Box>

      </Box>
    </Box>
  );
};

export default Profile;
