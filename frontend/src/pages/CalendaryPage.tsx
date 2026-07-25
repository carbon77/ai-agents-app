import { FormEvent, useEffect, useMemo, useState } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Alert, Box, FormControl, InputLabel, List, ListItemText, MenuItem, Select, Stack, Typography } from '@mui/material';
import { getAgents, getChatModels, streamCalendarAgentMessage } from '../api';
import { ChatInput } from '../components/ChatInput';
import { ChatMessage } from '../components/ChatMessage';
import { Shell } from '../components/Shell';
import { Agent, ChatMessage as ChatMessageType, ChatModel } from '../types/agents';

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function describeChatModel(model: ChatModel) {
  const features = model.supported_features.length > 0 ? model.supported_features.map((feature) => feature.replaceAll('_', ' ')).join(', ') : 'standard chat';
  return `${model.owner} · ${model.provider} · ${features}`;
}

export function CalendaryPage() {
  const [agent, setAgent] = useState<Agent>();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const selectedModel = useMemo(() => models.find((model) => model.model_id === selectedModelId), [models, selectedModelId]);

  useEffect(() => {
    getAgents()
      .then((items) => setAgent(items.find((item) => item.id === 'calendar')))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    getChatModels()
      .then((items) => {
        setModels(items);
        setSelectedModelId((current) => current || items[0]?.model_id || '');
      })
      .catch((err) => setError(err.message));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selectedModelId || !query.trim()) return;

    const userMessage = query.trim();
    const agentMessageId = createMessageId();
    setMessages((items) => [
      ...items,
      { id: createMessageId(), role: 'user', content: userMessage },
      { id: agentMessageId, role: 'agent', content: '' },
    ]);
    setQuery('');
    setBusy(true);
    setError(undefined);

    try {
      await streamCalendarAgentMessage(userMessage, selectedModelId, ({ event: eventName, data }) => {
        if (eventName === 'message_token') {
          const token = typeof data.token === 'string' ? data.token : '';
          setMessages((items) => items.map((message) => (
            message.id === agentMessageId ? { ...message, content: `${message.content}${token}` } : message
          )));
        }

        if (eventName === 'tool_call_end') {
          const call = typeof data.call === 'string' ? data.call : 'Tool call';
          const result = typeof data.result === 'string' ? data.result : '';
          setMessages((items) => items.map((message) => (
            message.id === agentMessageId
              ? { ...message, toolCalls: [...(message.toolCalls ?? []), { call, result }] }
              : message
          )));
        }

        if (eventName === 'error') {
          setError(typeof data.message === 'string' ? data.message : 'Calendar stream failed');
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calendar stream failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <Stack spacing={3}>
        <FormControl disabled={busy || models.length === 0} sx={{ width: { xs: '100%', sm: 360 }, alignSelf: 'flex-start' }}>
          <InputLabel id="calendar-model-label">Chat model</InputLabel>
          <Select
            labelId="calendar-model-label"
            label="Chat model"
            value={selectedModelId}
            renderValue={() => selectedModel?.name ?? 'Select model'}
            onChange={(event) => setSelectedModelId(event.target.value)}
          >
            {models.map((model, index) => (
              <MenuItem key={`${model.model_id}-${index}`} value={model.model_id}>
                <ListItemText primary={model.name} secondary={describeChatModel(model)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ display: 'grid', placeItems: 'center', width: 56, height: 56, borderRadius: 3, bgcolor: 'action.hover' }}>
            <CalendarMonthIcon color="primary" fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h3" fontWeight={800}>{agent?.name ?? 'Calendar Assistant'}</Typography>
            <Typography color="text.secondary">{agent?.description ?? 'Schedule events and ask about available calendar time.'}</Typography>
          </Box>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ minHeight: 420 }}>
          <List disablePadding>
            {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
          </List>
        </Box>
        <ChatInput busy={busy} disabled={!selectedModelId} query={query} onQueryChange={setQuery} onSubmit={submit} />
      </Stack>
    </Shell>
  );
}
