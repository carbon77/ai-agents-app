import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { Agent, getAgents, sendAgentMessage } from './api';

type ChatMessage = { role: 'user' | 'agent'; content: string };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Box minHeight="100vh">
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <SmartToyIcon sx={{ mr: 1 }} />
          <Typography component={RouterLink} to="/" variant="h6" color="inherit" sx={{ textDecoration: 'none' }}>
            AI Agents
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>{children}</Container>
    </Box>
  );
}

function AgentsPage() {
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

function ChatPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => { getAgents().then(setAgents).catch((err) => setError(err.message)); }, []);
  const agent = useMemo(() => agents.find((item) => item.id === agentId), [agents, agentId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!agent || !query.trim()) return;
    const userMessage = query.trim();
    setMessages((items) => [...items, { role: 'user', content: userMessage }]);
    setQuery('');
    setBusy(true);
    setError(undefined);
    try {
      const response = await sendAgentMessage(agent, userMessage);
      const content = response.messages.map((message) => message.content).filter(Boolean).join('\n') || 'No text response returned.';
      setMessages((items) => [...items, { role: 'agent', content }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Agent request failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <Stack spacing={3}>
        <Button onClick={() => navigate('/')} sx={{ alignSelf: 'flex-start' }}>Back to agents</Button>
        <Box>
          <Typography variant="h3" fontWeight={800}>{agent?.name ?? 'Agent chat'}</Typography>
          <Typography color="text.secondary">{agent?.description ?? 'Loading agent details...'}</Typography>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <Paper elevation={0} sx={{ p: 2, minHeight: 420, border: '1px solid', borderColor: 'divider' }}>
          <List>
            {messages.map((message, index) => (
              <ListItem key={`${message.role}-${index}`} sx={{ justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <Paper sx={{ p: 2, maxWidth: '75%', bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100', color: message.role === 'user' ? 'primary.contrastText' : 'text.primary' }}>
                  <Typography whiteSpace="pre-wrap">{message.content}</Typography>
                </Paper>
              </ListItem>
            ))}
          </List>
        </Paper>
        <Box component="form" onSubmit={submit} display="flex" gap={1}>
          <TextField fullWidth label="Message" value={query} onChange={(event) => setQuery(event.target.value)} disabled={busy || !agent} />
          <IconButton type="submit" color="primary" disabled={busy || !query.trim() || !agent}>
            {busy ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Stack>
    </Shell>
  );
}

export default function App() {
  return <Routes><Route path="/" element={<AgentsPage />} /><Route path="/chat/:agentId" element={<ChatPage />} /></Routes>;
}
