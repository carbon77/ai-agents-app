import BuildIcon from '@mui/icons-material/Build';
import { Box, Chip, Divider, List, ListItem, Paper, Stack, Typography } from '@mui/material';
import { ChatMessage as ChatMessageType } from '../types/agents';
import { CopyButton } from './CopyButton';

function formatToolCalls(toolCalls: ChatMessageType['toolCalls']) {
  if (!toolCalls?.length) return '';
  return toolCalls.map((toolCall) => `${toolCall.call}\n${toolCall.result}`).join('\n\n');
}

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';
  const copyText = [message.content, formatToolCalls(message.toolCalls)].filter(Boolean).join('\n\n');

  return (
    <ListItem sx={{ justifyContent: isUser ? 'flex-end' : 'flex-start', px: 0 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: '100%', sm: '78%' },
          bgcolor: isUser ? 'primary.main' : 'grey.100',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          border: '1px solid',
          borderColor: isUser ? 'primary.dark' : 'divider',
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Typography whiteSpace="pre-wrap">{message.content}</Typography>
          <Box sx={{ color: isUser ? 'primary.contrastText' : 'text.secondary' }}>
            <CopyButton text={copyText} label="Copy message" />
          </Box>
        </Stack>

        {!!message.toolCalls?.length && (
          <Stack spacing={1.5} mt={2}>
            <Divider />
            <Chip icon={<BuildIcon />} label="Tool calls" size="small" sx={{ alignSelf: 'flex-start' }} />
            <List disablePadding dense>
              {message.toolCalls.map((toolCall, index) => (
                <ListItem key={`${message.id}-tool-${index}`} disableGutters sx={{ display: 'block' }}>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.paper' }}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="subtitle2" whiteSpace="pre-wrap">{toolCall.call}</Typography>
                      <CopyButton text={`${toolCall.call}\n${toolCall.result}`} label="Copy tool call" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap" mt={1}>
                      {toolCall.result || 'No tool output returned.'}
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
            </List>
          </Stack>
        )}
      </Paper>
    </ListItem>
  );
}
