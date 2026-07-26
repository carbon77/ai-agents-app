import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  List,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAgents, getChatModels, streamAgentResponse } from "../api";
import { ChatInput } from "../components/ChatInput";
import { ChatMessage } from "../components/ChatMessage";
import { Shell } from "../components/Shell";
import {
  Agent,
  ChatMessage as ChatMessageType,
  ChatModel,
} from "../types/agents";

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getAgentIcon(agentId?: string) {
  if (agentId?.includes("calendar"))
    return <CalendarMonthIcon color="primary" fontSize="large" />;
  if (agentId?.includes("email"))
    return <AlternateEmailIcon color="primary" fontSize="large" />;
  if (agentId?.includes("supervisor"))
    return <ManageAccountsIcon color="primary" fontSize="large" />;
  return <DashboardIcon color="primary" fontSize="large" />;
}

function describeChatModel(model: ChatModel) {
  const features =
    model.supported_features.length > 0
      ? model.supported_features
          .map((feature) => feature.replaceAll("_", " "))
          .join(", ")
      : "standard chat";
  return `${model.owner} · ${model.provider} · ${features}`;
}

export function ChatPage() {
  const { agentId } = useParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    getChatModels()
      .then((items) => {
        setModels(items);
        setSelectedModelId((current) => current || items[0]?.model_id || "");
      })
      .catch((err) => setError(err.message));
  }, []);
  const agent = useMemo(
    () => agents.find((item) => item.id === agentId),
    [agents, agentId],
  );
  const selectedModel = useMemo(
    () => models.find((model) => model.model_id === selectedModelId),
    [models, selectedModelId],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!agent || !selectedModelId || !query.trim()) return;
    const userMessage = query.trim();
    const agentMessageId = createMessageId();
    let firstToken = true;
    setMessages((items) => [
      ...items,
      { id: createMessageId(), role: "user", content: userMessage },
      {
        id: agentMessageId,
        role: "agent",
        content: "Getting response...",
        toolCalls: [],
      },
    ]);
    setQuery("");
    setBusy(true);
    setError(undefined);
    try {
      await streamAgentResponse(agent, selectedModel, userMessage, (event) => {
        console.log(`${event.type} event`);
        if (event.type === "message_token") {
          setMessages((items) =>
            items.map((item) =>
              item.id === agentMessageId
                ? {
                    ...item,
                    content:
                      (firstToken ? "" : item.content) + event.data.token,
                  }
                : item,
            ),
          );
        } else if (event.type === "tool_call_start") {
          setMessages((items) =>
            items.map((item) =>
              item.id === agentMessageId
                ? {
                    ...item,
                    content:
                      (firstToken ? "" : item.content) +
                      "\n\n" +
                      event.data.call,
                  }
                : item,
            ),
          );
        } else if (event.type === "tool_call_end") {
          setMessages((items) =>
            items.map((item) =>
              item.id === agentMessageId
                ? {
                    ...item,
                    content:
                      item.content +
                      "\n" +
                      "result: " +
                      event.data.output.content +
                      "\n",
                  }
                : item,
            ),
          );
        }

        if (firstToken) {
          firstToken = false;
        }
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <Stack spacing={3} alignItems="stretch">
        <Stack direction="row" spacing={3} alignItems="center">
          <FormControl disabled={busy || models.length === 0}>
            <InputLabel id="chat-model-label">Chat model</InputLabel>
            <Select
              labelId="chat-model-label"
              label="Chat model"
              value={selectedModelId}
              renderValue={() => selectedModel?.name ?? "Select model"}
              onChange={(event) => setSelectedModelId(event.target.value)}
            >
              {models.map((model, index) => (
                <MenuItem
                  key={`${model.model_id}-${index}`}
                  value={model.model_id}
                >
                  <ListItemText
                    primary={model.name}
                    secondary={describeChatModel(model)}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: "action.hover",
              }}
            >
              {getAgentIcon(agent?.id)}
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                {agent?.name ?? "Agent chat"}
              </Typography>
              <Typography color="text.secondary">
                {agent?.description ?? "Loading agent details..."}
              </Typography>
            </Box>
          </Stack>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ minHeight: 420 }}>
          <List disablePadding>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </List>
        </Box>
        <ChatInput
          busy={busy}
          disabled={!agent || !selectedModelId}
          query={query}
          onQueryChange={setQuery}
          onSubmit={submit}
        />
      </Stack>
    </Shell>
  );
}
