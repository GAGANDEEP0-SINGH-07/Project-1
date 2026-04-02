import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import api from "../services/api";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Avatar, 
  IconButton, 
  Tooltip, 
  Badge,
  InputBase,
  alpha,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Popper,
  ClickAwayListener,
  Paper,
  Grow
} from "@mui/material";
import { 
  MdDarkMode,
  MdLightMode,
  MdLogout,
  MdNotifications,
  MdOutlineHexagon,
  MdSearch,
  MdFavorite,
  MdComment,
  MdPersonAdd
} from "react-icons/md";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";


const Navbar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isDark = mode === "dark";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isSearchOpen = Boolean(searchAnchorEl) && (searchResults.users.length > 0 || searchResults.posts.length > 0 || isSearching);

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  // Search Debounce Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], posts: [] });
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/search?q=${searchQuery}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (unreadCount > 0) {
      markAsRead();
    }
  };

  const markAsRead = async () => {
    try {
      await api.put("/notifications/mark-as-read");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleClose = () => setAnchorEl(null);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like": return <MdFavorite style={{ color: "#ef4444" }} />;
      case "comment": return <MdComment style={{ color: "#2563eb" }} />;
      case "follow": return <MdPersonAdd style={{ color: "#10b981" }} />;
      default: return null;
    }
  };

  const getNotificationText = (n) => {
    switch (n.type) {
      case "like": return "liked your post";
      case "comment": return "commented on your post";
      case "follow": return "started following you";
      default: return "";
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: isDark 
          ? "rgba(15, 12, 41, 0.7)" 
          : "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "none",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
        height: 64,
        display: "flex",
        justifyContent: "center",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ 
        maxWidth: 1440, 
        width: "100%", 
        mx: "auto", 
        px: { xs: 2, md: 4 }, 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 3.5 }}>
          <Box 
            onClick={() => navigate("/")}
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1.2, 
              cursor: "pointer",
              "&:hover .logo-icon": { transform: "rotate(45deg) scale(1.1)" }
            }}
          >
            <MdOutlineHexagon 
              className="logo-icon"
              size={34} 
              style={{ 
                color: isDark ? "#63b0ff" : "#2563eb",
                transition: "all 0.4s ease"
              }} 
            />
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 950,
                background: isDark
                  ? "linear-gradient(135deg, #63b0ff 0%, #a78bfa 100%)"
                  : "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-1.2px",
                display: { xs: "none", sm: "block" }
              }}
            >
              PostHive
            </Typography>
          </Box>


        </Box>

        {/* Center: Search */}
        {user && (
          <ClickAwayListener onClickAway={() => setSearchAnchorEl(null)}>
            <Box
              sx={{
                position: "relative",
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                flexGrow: 1,
                maxWidth: 480,
                mx: 4,
                background: isDark ? alpha("#fff", 0.05) : "#f1f5f9",
                borderRadius: "16px",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:focus-within": {
                  background: isDark ? alpha("#fff", 0.08) : "#fff",
                  border: `1px solid ${isDark ? "#63b0ff" : "#2563eb"}50`,
                  boxShadow: `0 8px 24px -8px ${isDark ? "rgba(0,0,0,0.5)" : "rgba(37, 99, 235, 0.15)"}`,
                  maxWidth: 520,
                }
              }}
            >
              <Box sx={{ pl: 2, pr: 1.5, display: "flex", alignItems: "center", color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                <MdSearch size={22} />
              </Box>
              <InputBase
                placeholder="Search community..."
                value={searchQuery}
                onFocus={(e) => setSearchAnchorEl(e.currentTarget)}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{
                  id: "navbar-search",
                  name: "search",
                  "aria-label": "Search community",
                }}
                sx={{
                  width: "100%",
                  color: isDark ? "#fff" : "#1e293b",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  px: 2,
                  "& .MuiInputBase-input": { py: 1.2 }
                }}
              />

              {/* Premium Search Results Dropdown using Popper to avoid focus theft */}
              <Popper
                open={isSearchOpen}
                anchorEl={searchAnchorEl}
                placement="bottom-start"
                transition
                sx={{ zIndex: 1400 }}
              >
                {({ TransitionProps }) => (
                  <Grow {...TransitionProps}>
                    <Paper
                      elevation={0}
                      sx={{
                        width: { xs: "90vw", sm: 400 },
                        maxHeight: 500,
                        mt: 1.5,
                        borderRadius: 4,
                        bgcolor: isDark ? "rgba(20, 28, 38, 0.95)" : "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(24px)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
                        boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.5)" : "0 20px 40px rgba(0, 97, 163, 0.1)",
                        overflowX: "hidden",
                        overflowY: "auto",
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        {isSearching ? (
                          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={24} sx={{ color: isDark ? "#63b0ff" : "#1e40af" }} />
                          </Box>
                        ) : (
                          <>
                            {/* Users Section */}
                            {searchResults.users.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="overline" sx={{ px: 1, fontWeight: 700, color: "text.secondary", letterSpacing: 1 }}>People</Typography>
                                {searchResults.users.map((u) => (
                                  <MenuItem 
                                    key={u._id} 
                                    onClick={() => { setSearchAnchorEl(null); navigate(`/profile/${u._id}`); }}
                                    sx={{ borderRadius: 2, gap: 2, py: 1.5 }}
                                  >
                                    <Avatar src={u.profileImage} sx={{ width: 36, height: 36, bgcolor: isDark ? "#63b0ff" : "#1e40af" }}>
                                      {u.username[0].toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{u.username}</Typography>
                                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{u.bio || "Member"}</Typography>
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Box>
                            )}

                            {/* Posts Section */}
                            {searchResults.posts.length > 0 && (
                              <Box>
                                <Typography variant="overline" sx={{ px: 1, fontWeight: 700, color: "text.secondary", letterSpacing: 1 }}>Posts</Typography>
                                {searchResults.posts.map((p) => (
                                  <MenuItem 
                                    key={p._id} 
                                    onClick={() => { setSearchAnchorEl(null); navigate(`/post/${p._id}`); }}
                                    sx={{ borderRadius: 2, gap: 2, py: 1.5, display: "flex", flexDirection: "column", alignItems: "flex-start" }}
                                  >
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 500, 
                                      display: "-webkit-box", 
                                      WebkitLineClamp: 2, 
                                      WebkitBoxOrient: "vertical", 
                                      overflow: "hidden" 
                                    }}>
                                      {p.text}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>by {p.userId.username}</Typography>
                                  </MenuItem>
                                ))}
                              </Box>
                            )}
                          </>
                        )}
                      </Box>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
          </ClickAwayListener>
        )}

        {/* Right Side: Actions */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 } }}>
            <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
              <IconButton
                onClick={toggleTheme}
                sx={{ 
                  color: isDark ? "#facc15" : "#64748b",
                  background: isDark ? "rgba(250, 204, 21, 0.08)" : "transparent",
                  "&:hover": { background: isDark ? "rgba(250, 204, 21, 0.15)" : "rgba(0,0,0,0.03)" }
                }}
              >
                {isDark ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                onClick={handleNotificationClick}
                sx={{
                  color: isDark ? "rgba(255,255,255,0.6)" : "#64748b",
                  background: anchorEl ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)") : "transparent",
                  "&:hover": { background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }
                }}
              >
                <Badge 
                  badgeContent={unreadCount} 
                  color="error"
                  sx={{ 
                    "& .MuiBadge-badge": { 
                      fontSize: "0.65rem", 
                      height: 16, 
                      minWidth: 16, 
                      boxShadow: isDark ? "0 0 0 2px #0f0c29" : "0 0 0 2px #fff" 
                    } 
                  }}
                >
                  <MdNotifications size={24} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notification Dropdown */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: "20px",
                  background: isDark ? "rgba(20, 18, 50, 0.95)" : "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                  boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(0,0,0,0.1)",
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 24,
                    width: 10,
                    height: 10,
                    bgcolor: isDark ? "rgba(20, 18, 50, 1)" : "#fff",
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
              <Box sx={{ px: 2.5, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem", color: isDark ? "#fff" : "#1e293b" }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 700, cursor: "pointer" }}>
                    New ({unreadCount})
                  </Typography>
                )}
              </Box>

              <Divider sx={{ opacity: 0.1 }} />

              <List sx={{ 
                p: 0, 
                maxHeight: 380, 
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": { 
                  background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  borderRadius: "10px" 
                },
                "&::-webkit-scrollbar-track": { background: "transparent" }
              }}>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <MenuItem 
                      key={n._id} 
                      onClick={handleClose}
                      sx={{ 
                        py: 2, 
                        px: 2.5,
                        whiteSpace: "normal",
                        gap: 1.5,
                        background: n.isRead ? "transparent" : (isDark ? "rgba(99, 176, 255, 0.04)" : "rgba(37, 99, 235, 0.03)"),
                        "&:hover": { background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 52, position: "relative" }}>
                        <Avatar 
                          src={n.sender.profileImage}
                          sx={{ 
                            width: 44, 
                            height: 44, 
                            border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}` 
                          }}
                        >
                          {n.sender.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ 
                          position: "absolute", 
                          bottom: -2, 
                          right: 4, 
                          background: isDark ? "#141232" : "#fff", 
                          borderRadius: "50%", 
                          p: "3px",
                          display: "flex",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          zIndex: 1
                        }}>
                          {getNotificationIcon(n.type)}
                        </Box>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ 
                            color: isDark ? "#fff" : "#1e293b", 
                            fontWeight: n.isRead ? 500 : 600,
                            lineHeight: 1.4,
                            fontSize: "0.875rem"
                          }}>
                            <span style={{ fontWeight: 800, color: isDark ? "#63b0ff" : "#2563eb" }}>{n.sender.username}</span> {getNotificationText(n)}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ 
                            color: isDark ? "rgba(255,255,255,0.4)" : "#64748b", 
                            mt: 0.5, 
                            display: "block",
                            fontSize: "0.75rem",
                            fontWeight: 500
                          }}>
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </Typography>
                        }
                      />
                    </MenuItem>
                  ))
                ) : (
                  <Box sx={{ py: 6, textAlign: "center", opacity: 0.5 }}>
                    <MdNotifications size={40} style={{ marginBottom: 8 }} />
                    <Typography variant="body2">No notifications yet</Typography>
                  </Box>
                )}
              </List>
              
              <Divider sx={{ opacity: 0.1 }} />
              
              <Box sx={{ p: 1.5, textAlign: "center" }}>
                <Button fullWidth size="small" sx={{ 
                  borderRadius: "12px", 
                  textTransform: "none", 
                  fontWeight: 700,
                  color: isDark ? "rgba(255,255,255,0.6)" : "#64748b" 
                }}>
                  View all activity
                </Button>
              </Box>
            </Menu>

            <Box sx={{ width: "1px", height: 24, bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", mx: 1 }} />

            {/* Profile */}
            <Tooltip title="Profile Settings">
              <IconButton
                onClick={() => navigate("/profile")}
                sx={{
                  p: 0.5,
                  border: `2px solid ${isActive("/profile") ? (isDark ? "#63b0ff" : "#2563eb") : "transparent"}`,
                  transition: "all 0.3s ease"
                }}
              >
                <Avatar
                  sx={{
                    width: 34, 
                    height: 34, 
                    fontSize: "0.9rem", 
                    fontWeight: 800,
                    bgcolor: isDark ? "#63b0ff" : "#2563eb",
                    color: isDark ? "#001d36" : "#ffffff",
                    boxShadow: isActive("/profile") ? `0 0 12px ${isDark ? "#63b0ff50" : "#2563eb50"}` : "none"
                  }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Logout */}
            <Tooltip title="Log Out">
              <IconButton
                onClick={handleLogout}
                sx={{
                  color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8",
                  "&:hover": { 
                    background: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)", 
                    color: "#ef4444" 
                  }
                }}
              >
                <MdLogout size={22} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
