import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  IconButton,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import { Conversation } from "../../types/users";

export function ConversationListItem({
  conversation,
  onOpen,
  onActionClick,
}: {
  conversation: Conversation;
  onOpen: (id: string) => void;
  onActionClick: (
    event: React.MouseEvent<HTMLElement>,
    conversation: Conversation,
  ) => void;
}) {
  return (
    <ListItemButton
      onClick={() => onOpen(conversation.id)}
      sx={{ pr: 5, borderRadius: 1 }}
    >
      <ListItemText
        primary={conversation.title}
        primaryTypographyProps={{ noWrap: true }}
      />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          size="small"
          onClick={(event) => onActionClick(event, conversation)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItemButton>
  );
}
