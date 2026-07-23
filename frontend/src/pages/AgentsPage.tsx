import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Card, CardActionArea, CardContent, Chip, CircularProgress, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { getAgentSections } from '../api';
import { Shell } from '../components/Shell';
import { Agent, AgentSection } from '../types/agents';

type LayoutMode = 'all' | 'sections';

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardActionArea component={RouterLink} to={`/chat/${agent.id}`} sx={{ height: '100%', alignItems: 'stretch' }}>
        <CardContent>
          <Chip label={agent.id} size="small" color="primary" sx={{ mb: 2 }} />
          <Typography variant="h5" fontWeight={700}>{agent.name}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>{agent.description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function AgentGrid({ agents }: { agents: Agent[] }) {
  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={3}>
      {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
    </Box>
  );
}

export function AgentsPage() {
  const [sections, setSections] = useState<AgentSection[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('sections');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const allAgents = useMemo(() => sections.flatMap((section) => section.agents), [sections]);

  useEffect(() => {
    getAgentSections().then(setSections).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  return (
    <Shell>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h3" fontWeight={800}>Available agents</Typography>
            <Typography color="text.secondary">Choose an agent to start a focused conversation.</Typography>
          </Box>
          <ToggleButtonGroup
            exclusive
            color="primary"
            value={layoutMode}
            onChange={(_, value) => value && setLayoutMode(value)}
            aria-label="Agent layout"
            sx={{ alignSelf: { xs: 'stretch', md: 'center' } }}
          >
            <ToggleButton value="sections">Subsections</ToggleButton>
            <ToggleButton value="all">All agents</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && layoutMode === 'all' && <AgentGrid agents={allAgents} />}
        {!loading && !error && layoutMode === 'sections' && (
          <Stack spacing={4}>
            {sections.map((section) => (
              <Box key={section.id}>
                <Typography variant="h4" fontWeight={700}>{section.name}</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>{section.description}</Typography>
                <AgentGrid agents={section.agents} />
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Shell>
  );
}
