import { createContext, useState, useContext, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("dark");

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#0061a3",
        light: "#63b0ff",
        dark: "#004271",
      },
      secondary: {
        main: "#1758c7",
      },
      background: {
        default: mode === "light" ? "#f8f9ff" : "#101c2c",
        paper: mode === "light" ? "#ffffff" : "#141c26",
      },
      text: {
        primary: mode === "light" ? "#141c26" : "#ffffff",
        secondary: mode === "light" ? "#404751" : "#bbc7dc",
      }
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
      h2: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
      h3: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
      h4: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
      h5: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
      h6: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
      subtitle1: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
      subtitle2: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
