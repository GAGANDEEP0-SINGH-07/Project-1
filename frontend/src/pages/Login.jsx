import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useThemeContext } from "../context/ThemeContext";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { mode } = useThemeContext();
  const navigate = useNavigate();

  const isDark = mode === "dark";


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);
      login(res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark
          ? "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
          : "linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 50%, #d9e0ff 100%)",
        padding: 2,
      }}
    >
      <Paper
        elevation={isDark ? 24 : 12}
        sx={{
          p: 5,
          width: "100%",
          maxWidth: 440,
          borderRadius: 4,
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)"}`,
          boxShadow: isDark 
            ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)" 
            : "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={800}
          textAlign="center"
          sx={{
            mb: 1,
            background: isDark
              ? "linear-gradient(90deg, #60a5fa, #a78bfa)"
              : "linear-gradient(90deg, #1e40af, #7c3aed)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px"
          }}
        >
          Welcome Back
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          sx={{ 
            color: isDark ? "rgba(255,255,255,0.6)" : "#64748b",
            mb: 4,
            fontWeight: 500 
          }}
        >
          Sign in to your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            id="login-email"
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdEmail color="#60a5fa" size={20} />
                </InputAdornment>
              ),
            }}
            slotProps={{
              input: {
                sx: {
                  color: isDark ? "#fff" : "#1e293b",
                  fontWeight: 500,
                  "& fieldset": { 
                    borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0",
                    transition: "border-color 0.2s"
                  },
                  "&:hover fieldset": { 
                    borderColor: isDark ? "rgba(255,255,255,0.4)" : "#cbd5e1" 
                  },
                  "&.Mui-focused fieldset": { 
                    borderColor: isDark ? "#60a5fa" : "#3b82f6" 
                  },
                },
              },
              inputLabel: { 
                sx: { color: isDark ? "rgba(255,255,255,0.5)" : "#94a3b8" } 
              },
            }}
          />

          <TextField
            fullWidth
            id="login-password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 3.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdLock color="#f472b6" size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            slotProps={{
              input: {
                sx: {
                  color: isDark ? "#fff" : "#1e293b",
                  fontWeight: 500,
                  "& fieldset": { 
                    borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0",
                    transition: "border-color 0.2s"
                  },
                  "&:hover fieldset": { 
                    borderColor: isDark ? "rgba(255,255,255,0.4)" : "#cbd5e1" 
                  },
                  "&.Mui-focused fieldset": { 
                    borderColor: isDark ? "#f472b6" : "#db2777" 
                  },
                },
              },
              inputLabel: { 
                sx: { color: isDark ? "rgba(255,255,255,0.5)" : "#94a3b8" } 
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
              background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
              boxShadow: "0 4px 20px rgba(96,165,250,0.4)",
              "&:hover": {
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                boxShadow: "0 6px 28px rgba(96,165,250,0.5)",
              },
            }}
          >
            {loading ? "Signing In..." : "Log In"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ mt: 3, color: isDark ? "rgba(255,255,255,0.6)" : "#64748b", fontWeight: 500 }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: isDark ? "#a78bfa" : "#7c3aed",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Sign Up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
