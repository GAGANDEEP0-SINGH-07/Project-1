import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  IconButton,
  alpha,
} from "@mui/material";
import { MdClose, MdLocationOn, MdInfo, MdCameraAlt } from "react-icons/md";
import { useThemeContext } from "../context/ThemeContext";
import api from "../services/api";
import { toast } from "react-toastify";
import { IKContext, IKUpload } from "imagekitio-react";
import { useRef } from "react";

const EditProfileModal = ({ open, onClose, user, onUpdate }) => {
  const { mode } = useThemeContext();
  const isDark = mode === "dark";
  const uploadRef = useRef(null);
  const bioRef = useRef(null);

  const publicKey = "public_PkixFWj6Qo2f0hZpp4FrhDTZFYw=";
  const urlEndpoint = "https://ik.imagekit.io/xgnm6rnx1";
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const authenticationEndpoint = `${apiBase}/auth/imagekit-auth`; 
  
  const [formData, setFormData] = useState({
    bio: user?.bio || "",
    location: user?.location || "Global",
    tagline: user?.tagline || "",
    profileImage: user?.profileImage || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || "",
        location: user.location || "Global",
        tagline: user.tagline || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const res = await api.put("/auth/profile", formData);
      toast.success("Profile updated!");
      onUpdate(res.data);
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
      TransitionProps={{
        onEntered: () => {
          bioRef.current?.focus();
        }
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 4,
          bgcolor: isDark ? "#141c26" : "#fff",
          backgroundImage: "none",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, p: 3, 
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
      }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>Edit Profile</Typography>
        <IconButton autoFocus onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          
          {/* Avatar Edit */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={formData.profileImage}
                sx={{
                  width: 100, height: 100,
                  fontSize: "2.5rem", fontWeight: 700,
                  bgcolor: isDark ? "#1e40af" : "#2563eb",
                  border: `4px solid ${isDark ? "#141c26" : "#fff"}`,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.15)"
                }}
              >
                {user?.username[0].toUpperCase()}
              </Avatar>
              <IKContext 
                publicKey={publicKey} 
                urlEndpoint={urlEndpoint} 
                authenticationEndpoint={authenticationEndpoint}
              >
                <IKUpload
                  id="profile-avatar-upload"
                  name="avatar"
                  fileName={`profile_${user?._id}_${Date.now()}.jpg`}
                  folder="/profiles"
                  onSuccess={(res) => {
                    setFormData({ ...formData, profileImage: res.url });
                    toast.success("Image uploaded!");
                  }}
                  onError={(err) => {
                    console.error("Upload error:", err);
                    toast.error("Upload failed");
                  }}
                  style={{ display: "none" }}
                  ref={uploadRef}
                />
                <IconButton
                  onClick={() => uploadRef.current?.click()}
                  sx={{
                    position: "absolute", bottom: 0, right: 0,
                    bgcolor: isDark ? "#1e40af" : "#2563eb",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    "&:hover": { bgcolor: isDark ? "#1d4ed8" : "#1d4ed8" },
                    p: 1,
                    zIndex: 2
                  }}
                >
                  <MdCameraAlt size={18} />
                </IconButton>
              </IKContext>
            </Box>
          </Box>

          {/* Fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              autoFocus
              inputRef={bioRef}
              name="bio"
              label="Biography"
              placeholder="Tell us about yourself..."
              multiline
              rows={4}
              fullWidth
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDark ? "rgba(0,0,0,0.1)" : "#f8fafc",
                  borderRadius: 3,
                }
              }}
            />
            <TextField
              name="location"
              label="Location"
              placeholder="e.g. San Francisco, CA"
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDark ? "rgba(0,0,0,0.1)" : "#f8fafc",
                  borderRadius: 3,
                }
              }}
            />
            <TextField
              name="tagline"
              label="Profession / Tagline"
              placeholder="What do you do?"
              fullWidth
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDark ? "rgba(0,0,0,0.1)" : "#f8fafc",
                  borderRadius: 3,
                }
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
        <Button onClick={onClose} sx={{ color: "text.secondary", fontWeight: 600, textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSaving}
          sx={{
            bgcolor: isDark ? "#1e40af" : "#2563eb",
            color: "#fff",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2.5,
            px: 4,
            "&:hover": { bgcolor: isDark ? "#1d4ed8" : "#1d4ed8" },
            boxShadow: "none"
          }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
