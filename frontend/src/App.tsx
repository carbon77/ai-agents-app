import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { AgentsPage } from "./pages/AgentsPage";
import { ChatPage } from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import { ModelsPage } from "./pages/ModelsPage";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <AuthProvider>
        <CssBaseline />
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <AgentsPage />
              </RequireAuth>
            }
          />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/chat/:agentId"
            element={
              <RequireAuth>
                <ChatPage />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
