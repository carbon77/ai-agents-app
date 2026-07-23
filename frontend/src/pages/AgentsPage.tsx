import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { getAgents } from '../api';
import { Shell } from '../components/Shell';
import { Agent } from '../types/agents';

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    getAgents().then(setAgents).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  return (
    <Shell>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" fontWeight={800}>Available agents</Typography>
          <Typography color="text.secondary">Choose an agent to start a focused conversation.</Typography>
        </Box>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={3}>
          {agents.map((agent) => (
            <Card key={agent.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Chip label={agent.id} size="small" color="primary" sx={{ mb: 2 }} />
                <Typography variant="h5" fontWeight={700}>{agent.name}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>{agent.description}</Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to={`/chat/${agent.id}`} variant="contained">Chat</Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Stack>
    </Shell>
  );
}
