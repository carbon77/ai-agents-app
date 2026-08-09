import AddCommentIcon from "@mui/icons-material/AddComment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations } from "../../hooks/useConversations";
import { Conversation } from "../../types/users";
import { ConversationList } from "./ConversationList";
import { GroupBySelector } from "./GroupBySelector";
import { RenameConversationDialog } from "./RenameConversationDialog";

export function ConversationsPanel({ enabled }: { enabled: boolean }) {
  const navigate = useNavigate();
  const { grouped, loading, groupBy, setGroupBy, create, rename, remove } =
    useConversations(enabled);

  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);

  const handleOpen = (id: string) => {
    navigate(`/conversations/${id}`);
  };

  const handleNewChat = async () => {
    const created = await create("New chat");
    navigate(`/conversations/${created.id}`);
  };

  const handleActionClick = (
    event: React.MouseEvent<HTMLElement>,
    conversation: Conversation,
  ) => {
    event.stopPropagation();
    setActiveConversation(conversation);
    setActionAnchorEl(event.currentTarget);
  };
  const handleActionClose = () => setActionAnchorEl(null);

  const handleRenameOpen = () => {
    setRenameOpen(true);
    setActionAnchorEl(null);
  };
  const handleRenameClose = () => {
    setRenameOpen(false);
    setActiveConversation(null);
  };
  const handleRenameSubmit = async (title: string) => {
    if (!activeConversation) return;
    await rename(activeConversation.id, title);
    handleRenameClose();
  };

  const handleDelete = async () => {
    if (!activeConversation) return;
    const id = activeConversation.id;
    setActionAnchorEl(null);
    setActiveConversation(null);
    await remove(id).catch(() => {});
  };

  return (
    <Stack
      spacing={1}
      sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      <Button
        variant="outlined"
        startIcon={<AddCommentIcon />}
        onClick={handleNewChat}
      >
        New chat
      </Button>

      <GroupBySelector value={groupBy} onChange={setGroupBy} />

      <ConversationList
        grouped={grouped}
        loading={loading}
        onOpen={handleOpen}
        onActionClick={handleActionClick}
      />

      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleRenameOpen}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <RenameConversationDialog
        open={renameOpen}
        initialTitle={activeConversation?.title ?? ""}
        onClose={handleRenameClose}
        onSubmit={handleRenameSubmit}
      />
    </Stack>
  );
}
