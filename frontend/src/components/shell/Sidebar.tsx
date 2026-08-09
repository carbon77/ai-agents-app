import { Box, Stack } from "@mui/material";
import { useAuth } from "../../auth/AuthContext";
import { ConversationsPanel } from "./ConversationsPanel";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./UserMenu";

export const SIDEBAR_WIDTH = 220;

export function Sidebar() {
  const { user } = useAuth();

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        inset: "0 auto 0 0",
        width: SIDEBAR_WIDTH,
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "grey.900",
        px: 2,
        py: 3,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <Stack spacing={3} height="100%">
        <NavLinks />
        <ConversationsPanel enabled={Boolean(user)} />
        <UserMenu />
      </Stack>
    </Box>
  );
}
