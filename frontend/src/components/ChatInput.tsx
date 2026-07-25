import { FormEvent } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { Box, CircularProgress, IconButton, TextField } from '@mui/material';

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
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        position: 'sticky',
        bottom: 16,
        display: 'flex',
        gap: 1,
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: 6,
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
    </Box>
  );
}
