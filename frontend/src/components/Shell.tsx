import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

const menuWidth = 220;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <Box
      minHeight="100vh"
      sx={{ display: "flex", bgcolor: "background.default" }}
    >
      <Box
        component="nav"
        sx={{
          position: "fixed",
          inset: "0 auto 0 0",
          width: menuWidth,
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.900",
          px: 2,
          py: 3,
        }}
      >
        <Stack spacing={3} height="100%">
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            component={RouterLink}
            to="/"
            sx={{ color: "inherit", textDecoration: "none" }}
          >
            <SmartToyIcon color="primary" />
            <Typography variant="h6" fontWeight={800}>
              AI Agents
            </Typography>
          </Stack>
          <Stack spacing={1}>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{ justifyContent: "flex-start" }}
            >
              Agents
            </Button>
            <Button
              component={RouterLink}
              to="/models"
              color="inherit"
              sx={{ justifyContent: "flex-start" }}
            >
              Models
            </Button>
          </Stack>
        </Stack>
      </Box>
      <Container maxWidth="lg" sx={{ ml: `${menuWidth}px`, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
