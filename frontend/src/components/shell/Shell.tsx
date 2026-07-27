import { Box, Container } from "@mui/material";
import { ReactNode } from "react";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <Box minHeight="100vh" sx={{ display: "flex", bgcolor: "background.default" }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ ml: `${SIDEBAR_WIDTH}px`, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
