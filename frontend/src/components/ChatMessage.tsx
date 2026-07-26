import { Alert, Box, ListItem, Paper, Stack, Typography } from "@mui/material";
import { ChatMessage as ChatMessageType } from "../types/agents";
import { CopyButton } from "./CopyButton";
import { ToolCallMessageCard } from "./ToolCallMessageCard";

export const ChatMessage = ({ message }: { message: ChatMessageType }) => {
  const isUser = message.role === "user";
  const hasToolCalls = !!message.toolCalls?.length;

  return (
    <ListItem
      sx={{ justifyContent: isUser ? "flex-end" : "flex-start", px: 0 }}
    >
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", sm: "auto" },
          maxWidth: { xs: "100%", sm: "78%" },
          "&:hover .message-copy-button, &:focus-within .message-copy-button": {
            opacity: 1,
            pointerEvents: "auto",
          },
        }}
      >
        <Box
          className="message-copy-button"
          sx={{
            position: "absolute",
            top: -18,
            right: isUser ? 8 : "auto",
            left: isUser ? "auto" : 8,
            zIndex: 1,
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 150ms ease-in-out",
            bgcolor: "background.paper",
            borderRadius: 999,
            boxShadow: 2,
          }}
        >
          <CopyButton
            text={message.error ? message.error : message.content}
            label="Copy message"
          />
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: isUser ? "primary.main" : "transparent",
            color: isUser ? "primary.contrastText" : "text.primary",
            border: "1px solid",
            borderColor: isUser ? "primary.dark" : "transparent",
          }}
        >
          {message.error ? (
            <Alert severity="error">{message.error}</Alert>
          ) : (
            <Typography whiteSpace="pre-wrap">{message.content}</Typography>
          )}

          {hasToolCalls && (
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {message.toolCalls.map((toolCall, index) => (
                <ToolCallMessageCard
                  key={`${message.id}-tool-${index}`}
                  toolCall={toolCall}
                />
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </ListItem>
  );
};
