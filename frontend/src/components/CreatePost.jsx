import { useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import { IKContext, IKUpload } from "imagekitio-react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";

const urlEndpoint = "https://ik.imagekit.io/xgnm6rnx1";
const publicKey = "public_PkixFWj6Qo2f0hZpp4FrhDTZFYw=";

const authenticator = async () => {
  const res = await api.get("/imagekit/auth");
  const { signature, expire, token } = res.data;
  return { signature, expire, token };
};

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const uploadRef = useRef(null);

  const onUploadStart = () => {
    setUploading(true);
    setError("");
  };

  const onUploadSuccess = (res) => {
    setImageUrl(res.url);
    setUploading(false);
  };

  const onUploadError = (err) => {
    setError("Image upload failed. Please try again.");
    setUploading(false);
    console.error("ImageKit upload error:", err);
  };

  const removeImage = () => {
    setImageUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageUrl) return;

    setLoading(true);
  
    try {
      await api.post("/posts/create", {
        text: text.trim(),
        image: imageUrl,
      });
      setText("");
      setImageUrl("");
      if (onPostCreated) onPostCreated();
      refreshUser(); // Update global stats (postCount) instantly
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  const { mode } = useThemeContext();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: mode === "dark" ? "rgba(20, 28, 38, 0.7)" : "rgba(238, 244, 255, 0.5)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0, 97, 163, 0.05)"}`,
        mb: 4,
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ mt: 0.5 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              fontWeight: 700,
              fontSize: "1.25rem",
              bgcolor: mode === "dark" ? "#63b0ff" : "#0061a3",
              color: mode === "dark" ? "#001d36" : "#ffffff",
              boxShadow: mode === "dark" ? "0 0 0 2px rgba(255,255,255,0.1)" : "0 0 0 2px #fff",
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            id="create-post-input"
            name="content"
            aria-label="Write your post content"
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            placeholder="Start a post..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                bgcolor: mode === "dark" ? "rgba(10, 16, 24, 0.6)" : "#ffffff",
                color: mode === "dark" ? "#fff" : "#404751",
                fontSize: "1rem",
                borderRadius: 4,
                px: 2,
                py: 2,
                boxShadow: mode === "dark" ? "inset 0 2px 4px rgba(0,0,0,0.5)" : "inset 0 2px 4px rgba(0,0,0,0.02)",
                "& fieldset": { borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
                "&:hover fieldset": { borderColor: mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" },
                "&.Mui-focused fieldset": { 
                   borderWidth: 2,
                   borderColor: mode === "dark" ? "#63b0ff" : "#63b0ff",
                },
                "&.Mui-focused": {
                   boxShadow: mode === "dark" ? "0 0 0 4px rgba(99, 176, 255, 0.1)" : "0 0 0 4px rgba(99, 176, 255, 0.15)",
                }
              },
            }}
          />

          {/* Image preview */}
          {imageUrl && (
            <Box sx={{ position: "relative", mb: 2 }}>
              <Box
                component="img"
                src={imageUrl}
                alt="Preview"
                sx={{
                  width: "100%",
                  maxHeight: 250,
                  objectFit: "cover",
                  borderRadius: 3,
                  border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                }}
              />
              <IconButton
                onClick={removeImage}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  "&:hover": { background: "rgba(0,0,0,0.8)" },
                }}
                size="small"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </IconButton>
            </Box>
          )}

          {/* Upload progress */}
          {uploading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                background: mode === "dark" ? "rgba(99, 176, 255, 0.1)" : "rgba(0, 97, 163, 0.05)",
              }}
            >
              <CircularProgress size={18} sx={{ color: mode === "dark" ? "#63b0ff" : "#0061a3" }} />
              <Typography variant="body2" sx={{ color: mode === "dark" ? "#63b0ff" : "#0061a3" }}>
                Uploading image...
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pl: 1 }}>
            
            <Box sx={{ display: "flex", gap: 1 }}>
               {/* ImageKit upload button */}
               <IKContext
                 urlEndpoint={urlEndpoint}
                 publicKey={publicKey}
                 authenticator={authenticator}
               >
                 <Box sx={{ position: "relative" }}>
                   <Button
                     variant="text"
                     onClick={() => uploadRef.current?.click()}
                     disabled={uploading}
                     startIcon={<span className="material-symbols-outlined" style={{ color: mode === "dark" ? "#63b0ff" : "#3b82f6" }}>image</span>}
                     sx={{
                       color: "text.secondary",
                       textTransform: "none",
                       fontWeight: 500,
                       borderRadius: 3,
                       px: 2,
                       "&:hover": { bgcolor: mode === "dark" ? "rgba(255,255,255,0.05)" : "#ffffff" },
                     }}
                   >
                     <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: "0.875rem", fontWeight: 600 }}>
                        {imageUrl ? "Change" : "Image"}
                     </Typography>
                   </Button>
                   <IKUpload
                     id="post-image-upload"
                     name="postImage"
                     ref={uploadRef}
                     onUploadStart={onUploadStart}
                     onSuccess={onUploadSuccess}
                     onError={onUploadError}
                     folder="/posthive/posts"
                     style={{ display: "none" }}
                     accept="image/*"
                   />
                 </Box>
               </IKContext>

            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={loading || uploading || (!text.trim() && !imageUrl)}
              sx={{
                borderRadius: 5,
                textTransform: "none",
                fontWeight: 600,
                px: 3.5,
                py: 1,
                bgcolor: mode === "dark" ? "#1758c7" : "#0061a3",
                boxShadow: mode === "dark" ? "0 4px 14px rgba(23, 88, 199, 0.4)" : "0 4px 14px rgba(0, 97, 163, 0.3)",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: mode === "dark" ? "#1e40af" : "#004271",
                  transform: "translateY(-2px)",
                  boxShadow: mode === "dark" ? "0 6px 20px rgba(23, 88, 199, 0.6)" : "0 6px 20px rgba(0, 97, 163, 0.4)",
                },
                "&:disabled": {
                  background: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  color: mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                },
              }}
            >
              {loading ? "Posting..." : "Post"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CreatePost;
