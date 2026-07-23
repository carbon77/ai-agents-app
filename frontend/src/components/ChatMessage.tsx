import BuildIcon from '@mui/icons-material/Build';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, List, ListItem, Paper, Stack, Typography } from '@mui/material';
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
      <Box
        sx={{
          position: 'relative',
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: '100%', sm: '78%' },
          '&:hover .message-copy-button, &:focus-within .message-copy-button': {
            opacity: 1,
            pointerEvents: 'auto',
          },
        }}
      >
        <Box
          className="message-copy-button"
          sx={{
            position: 'absolute',
            top: -18,
            right: isUser ? 8 : 'auto',
            left: isUser ? 'auto' : 8,
            zIndex: 1,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 150ms ease-in-out',
            bgcolor: 'background.paper',
            borderRadius: 999,
            boxShadow: 2,
          }}
        >
          <CopyButton text={copyText} label="Copy message" />
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser ? 'primary.main' : 'grey.100',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            border: '1px solid',
            borderColor: isUser ? 'primary.dark' : 'divider',
          }}
        >
          <Typography whiteSpace="pre-wrap">{message.content}</Typography>

          {!!message.toolCalls?.length && (
            <Accordion disableGutters elevation={0} sx={{ mt: 2, bgcolor: 'transparent', color: 'inherit', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 40 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <BuildIcon fontSize="small" />
                  <Typography variant="subtitle2">Tool calls ({message.toolCalls.length})</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0 }}>
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
              </AccordionDetails>
            </Accordion>
          )}
        </Paper>
      </Box>
    </ListItem>
  );
}
