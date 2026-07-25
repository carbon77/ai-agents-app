import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <Box minHeight="100vh" pb={4}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <SmartToyIcon sx={{ mr: 1 }} />
          <Typography component={RouterLink} to="/" variant="h6" color="inherit" sx={{ flexGrow: 1, textDecoration: 'none' }}>
            AI Agents
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/" color="inherit">Agents</Button>
            <Button component={RouterLink} to="/models" color="inherit">Models</Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
