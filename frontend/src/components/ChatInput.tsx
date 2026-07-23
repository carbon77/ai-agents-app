import { FormEvent } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { Box, CircularProgress, IconButton, Paper, TextField } from '@mui/material';

export function ChatInput({
  busy,
  disabled,
  query,
  onQueryChange,
  onSubmit,
}: {
  busy: boolean;
  disabled: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <Paper
      component="form"
      onSubmit={onSubmit}
      elevation={6}
      sx={{
        position: 'sticky',
        bottom: 16,
        display: 'flex',
        gap: 1,
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <TextField
        fullWidth
        label="Message"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        disabled={busy || disabled}
        multiline
        maxRows={4}
      />
      <Box display="flex" alignItems="center">
        <IconButton type="submit" color="primary" disabled={busy || disabled || !query.trim()}>
          {busy ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
}
