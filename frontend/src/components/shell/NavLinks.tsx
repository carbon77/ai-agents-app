import FunctionsIcon from "@mui/icons-material/Functions";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function NavLinks() {
  return (
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
          startIcon={<SmartToyIcon />}
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ justifyContent: "flex-start" }}
        >
          Agents
        </Button>
        <Button
          startIcon={<FunctionsIcon />}
          component={RouterLink}
          to="/models"
          color="inherit"
          sx={{ justifyContent: "flex-start" }}
        >
          Models
        </Button>
      </Stack>
    </Stack>
  );
}
