import { Box, Paper, Skeleton } from "@mui/material";
import { useThemeContext } from "../context/ThemeContext";

const PostSkeleton = () => {
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 5,
        background: isDark 
          ? "rgba(20, 28, 38, 0.4)" 
          : "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(24px)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"}`,
        overflow: "hidden",
        mb: 4,
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2.5, gap: 2 }}>
        <Skeleton variant="circular" width={52} height={52} animation="wave" />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={24} animation="wave" />
          <Skeleton variant="text" width="60%" height={16} animation="wave" />
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Skeleton variant="rounded" width="100%" height={20} animation="wave" sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width="90%" height={20} animation="wave" sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width="70%" height={20} animation="wave" />
      </Box>

      <Skeleton 
        variant="rounded" 
        width="100%" 
        height={320} 
        animation="wave" 
        sx={{ borderRadius: 4, mb: 3 }} 
      />

      <Box sx={{ display: "flex", gap: 3, pt: 1, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}` }}>
        <Skeleton variant="circular" width={32} height={32} animation="wave" />
        <Skeleton variant="circular" width={32} height={32} animation="wave" />
        <Skeleton variant="circular" width={32} height={32} animation="wave" />
      </Box>
    </Paper>
  );
};

export default PostSkeleton;
