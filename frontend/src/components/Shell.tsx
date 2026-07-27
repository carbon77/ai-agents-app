import SmartToyIcon from "@mui/icons-material/SmartToy"
import {
  Box,
  Button,
  Container,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material"
import { ReactNode, useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

const menuWidth = 220;

export function Shell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/";

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (user) {
      setAnchorEl(event.currentTarget);
    } else {
      navigate("/login", { replace: true });
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
        <Stack spacing={3} height="100%" justifyContent="space-between">
          <Stack spacing={3}>
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

          <Button loading={loading} onClick={handleClick}>
            {user ? user.email : "Not logged in"}
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem
              onClick={() => {
                logout();
                handleClose();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Stack>
      </Box>
      <Container maxWidth="lg" sx={{ ml: `${menuWidth}px`, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
