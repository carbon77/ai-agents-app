import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, List, Paper, Stack, Typography } from '@mui/material';
import { getAgents, sendAgentMessage } from '../api';
import { ChatInput } from '../components/ChatInput';
import { ChatMessage } from '../components/ChatMessage';
import { Shell } from '../components/Shell';
import { Agent, ChatMessage as ChatMessageType } from '../types/agents';

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ChatPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => { getAgents().then(setAgents).catch((err) => setError(err.message)); }, []);
  const agent = useMemo(() => agents.find((item) => item.id === agentId), [agents, agentId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!agent || !query.trim()) return;
    const userMessage = query.trim();
    setMessages((items) => [...items, { id: createMessageId(), role: 'user', content: userMessage }]);
    setQuery('');
    setBusy(true);
    setError(undefined);
    try {
      const response = await sendAgentMessage(agent, userMessage);
      const content = response.messages.map((message) => message.content).filter(Boolean).join('\n') || 'No text response returned.';
      setMessages((items) => [...items, { id: createMessageId(), role: 'agent', content, toolCalls: response.tool_calls }]);
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
            {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
          </List>
        </Paper>
        <ChatInput busy={busy} disabled={!agent} query={query} onQueryChange={setQuery} onSubmit={submit} />
      </Stack>
    </Shell>
  );
}
