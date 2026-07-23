import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <Box minHeight="100vh" pb={4}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <SmartToyIcon sx={{ mr: 1 }} />
          <Typography component={RouterLink} to="/" variant="h6" color="inherit" sx={{ textDecoration: 'none' }}>
            AI Agents
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
