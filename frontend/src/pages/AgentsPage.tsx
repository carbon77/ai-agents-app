import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GridViewIcon from '@mui/icons-material/GridView';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import { Alert, Box, Card, CardActionArea, CardContent, Chip, CircularProgress, IconButton, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { getAgentSections } from '../api';
import { Shell } from '../components/Shell';
import { Agent, AgentSection } from '../types/agents';

type LayoutMode = 'all' | 'sections';

const FAVORITES_STORAGE_KEY = 'ai-agent.favoriteAgents';

function getAgentIcon(agentId: string) {
  if (agentId.includes('calendar')) return <CalendarMonthIcon color="primary" />;
  if (agentId.includes('email')) return <AlternateEmailIcon color="primary" />;
  if (agentId.includes('supervisor')) return <ManageAccountsIcon color="primary" />;
  return <DashboardIcon color="primary" />;
}

function matchesSearch(agent: Agent, searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) return true;
  return [agent.id, agent.name, agent.description].some((value) => value.toLowerCase().includes(normalizedSearch));
}

function sortPinnedFirst(agents: Agent[], favoriteAgentIds: string[]) {
  const favoriteSet = new Set(favoriteAgentIds);
  return [...agents].sort((first, second) => Number(favoriteSet.has(second.id)) - Number(favoriteSet.has(first.id)));
}

function loadFavoriteAgentIds() {
  try {
    const storedFavorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]');
    return Array.isArray(storedFavorites) ? storedFavorites.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function AgentCard({
  agent,
  favorite,
  onToggleFavorite,
}: {
  agent: Agent;
  favorite: boolean;
  onToggleFavorite: (agentId: string) => void;
}) {
  return (
    <Card elevation={0} sx={{ position: 'relative', border: '1px solid', borderColor: favorite ? 'primary.main' : 'divider', height: '100%' }}>
      <Tooltip title={favorite ? 'Unpin favorite' : 'Pin favorite'}>
        <IconButton
          aria-label={favorite ? `Unpin ${agent.name}` : `Pin ${agent.name}`}
          color={favorite ? 'primary' : 'default'}
          onClick={() => onToggleFavorite(agent.id)}
          sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1, bgcolor: 'background.paper', boxShadow: 1 }}
        >
          {favorite ? <StarIcon /> : <StarBorderIcon />}
        </IconButton>
      </Tooltip>
      <CardActionArea component={RouterLink} to={`/chat/${agent.id}`} sx={{ height: '100%', alignItems: 'stretch' }}>
        <CardContent sx={{ pr: 8 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 2, bgcolor: 'action.hover' }}>
              {getAgentIcon(agent.id)}
            </Box>
            <Chip label={agent.id} size="small" color={favorite ? 'primary' : 'default'} />
          </Stack>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>{agent.name}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>{agent.description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function AgentGrid({ agents, favoriteAgentIds, onToggleFavorite }: { agents: Agent[]; favoriteAgentIds: string[]; onToggleFavorite: (agentId: string) => void }) {
  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={3}>
      {sortPinnedFirst(agents, favoriteAgentIds).map((agent) => (
        <AgentCard key={agent.id} agent={agent} favorite={favoriteAgentIds.includes(agent.id)} onToggleFavorite={onToggleFavorite} />
      ))}
    </Box>
  );
}

export function AgentsPage() {
  const [sections, setSections] = useState<AgentSection[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('sections');
  const [favoriteAgentIds, setFavoriteAgentIds] = useState<string[]>(loadFavoriteAgentIds);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const allAgents = useMemo(() => sections.flatMap((section) => section.agents), [sections]);
  const filteredAgents = useMemo(() => allAgents.filter((agent) => matchesSearch(agent, searchTerm)), [allAgents, searchTerm]);
  const filteredSections = useMemo(
    () => sections
      .map((section) => ({ ...section, agents: section.agents.filter((agent) => matchesSearch(agent, searchTerm)) }))
      .filter((section) => section.agents.length > 0),
    [sections, searchTerm],
  );

  useEffect(() => {
    getAgentSections().then(setSections).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteAgentIds));
  }, [favoriteAgentIds]);

  function toggleFavorite(agentId: string) {
    setFavoriteAgentIds((current) => (
      current.includes(agentId) ? current.filter((id) => id !== agentId) : [...current, agentId]
    ));
  }

  return (
    <Shell>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h3" fontWeight={800}>Available agents</Typography>
            <Typography color="text.secondary">Search, pin favorites, and choose an agent to start a focused conversation.</Typography>
          </Box>
          <ToggleButtonGroup
            exclusive
            color="primary"
            value={layoutMode}
            onChange={(_, value) => value && setLayoutMode(value)}
            aria-label="Agent layout"
            sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
          >
            <ToggleButton value="sections" aria-label="Show subsections"><ViewAgendaIcon /></ToggleButton>
            <ToggleButton value="all" aria-label="Show all agents"><GridViewIcon /></ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <TextField
          label="Search agents"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && layoutMode === 'all' && <AgentGrid agents={filteredAgents} favoriteAgentIds={favoriteAgentIds} onToggleFavorite={toggleFavorite} />}
        {!loading && !error && layoutMode === 'sections' && (
          <Stack spacing={4}>
            {filteredSections.map((section) => (
              <Box key={section.id}>
                <Typography variant="h4" fontWeight={700}>{section.name}</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>{section.description}</Typography>
                <AgentGrid agents={section.agents} favoriteAgentIds={favoriteAgentIds} onToggleFavorite={toggleFavorite} />
              </Box>
            ))}
          </Stack>
        )}
        {!loading && !error && filteredAgents.length === 0 && (
          <Alert severity="info">No agents match your search.</Alert>
        )}
      </Stack>
    </Shell>
  );
}
