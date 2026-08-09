import { Box, List, ListSubheader, Typography } from "@mui/material";
import { Conversation } from "../../types/users";
import { ConversationListItem } from "./ConversationListItem";

export function ConversationList({
  grouped,
  loading,
  onOpen,
  onActionClick,
}: {
  grouped: [string, Conversation[]][];
  loading: boolean;
  onOpen: (id: string) => void;
  onActionClick: (
    event: React.MouseEvent<HTMLElement>,
    conversation: Conversation,
  ) => void;
}) {
  const isEmpty = grouped.every(([, items]) => items.length === 0);

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      <List dense disablePadding>
        {!loading && isEmpty && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 1, py: 1 }}
          >
            No conversations yet
          </Typography>
        )}
        {grouped.map(([label, items]) => (
          <Box key={label || "all"}>
            {label && (
              <ListSubheader
                disableSticky
                sx={{
                  bgcolor: "transparent",
                  color: "text.secondary",
                  lineHeight: "32px",
                  px: 1,
                }}
              >
                {label}
              </ListSubheader>
            )}
            {items.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                onOpen={onOpen}
                onActionClick={onActionClick}
              />
            ))}
          </Box>
        ))}
      </List>
    </Box>
  );
}
