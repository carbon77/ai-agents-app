import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { Alert, Box, List, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAgents, streamAgentResponse } from "../api/agents";
import { ChatInput } from "../components/ChatInput";
import { ChatMessage } from "../components/ChatMessage";
import { ModelSelect } from "../components/ModelSelect";
import { Shell } from "../components/shell/Shell";
import {
  Agent,
  ChatMessage as ChatMessageType,
  ChatModel,
} from "../types/agents";

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const AgentIcon = ({ agentId }: { agentId?: string }) => {
  if (agentId?.includes("calendar"))
    return <CalendarMonthIcon color="primary" fontSize="large" />;
  if (agentId?.includes("email"))
    return <AlternateEmailIcon color="primary" fontSize="large" />;
  if (agentId?.includes("supervisor"))
    return <ManageAccountsIcon color="primary" fontSize="large" />;
  return <DashboardIcon color="primary" fontSize="large" />;
};

export function ChatPage() {
  const { agentId } = useParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [selectedModel, setSelectedModel] = useState<ChatModel | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  function updateMessage(
    messageId: string,
    update: (item: ChatMessageType) => Partial<ChatMessageType>,
  ) {
    setMessages((items) =>
      items.map((item) =>
        item.id === messageId ? { ...item, ...update(item) } : item,
      ),
    );
  }

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch((err) => setError(err.message));
  }, []);

  const agent = useMemo(
    () => agents.find((item) => item.id === agentId),
    [agents, agentId],
  );

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!agent || !selectedModel || !query.trim()) return;
    const userMessage = query.trim();
    const agentMessageId = createMessageId();
    let firstToken = true;

    setMessages((items) => [
      ...items,
      {
        id: createMessageId(),
        role: "user",
        content: userMessage,
        toolCalls: [],
      },
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
        console.log(`${event.type} event`, event.data);
        if (firstToken) {
          updateMessage(agentMessageId, (_) => ({ content: "" }));
          firstToken = false;
        }

        if (event.type === "message_token") {
          updateMessage(agentMessageId, (item) => ({
            content: item.content + event.data.token,
          }));
        } else if (event.type === "error") {
          updateMessage(agentMessageId, (item) => ({
            error: event.data.message,
          }));
        } else if (event.type === "tool_call_start") {
          updateMessage(agentMessageId, (item) => ({
            toolCalls: [
              ...item.toolCalls,
              {
                call: event.data.call,
                name: event.data.name,
                input: event.data.input,
              },
            ],
          }));
        } else if (event.type === "tool_call_end") {
          updateMessage(agentMessageId, (item) => ({
            toolCalls: item.toolCalls?.map((tc) =>
              tc.call === event.data.call
                ? {
                    ...tc,
                    result: event.data.output?.content,
                    error: event.data.error,
                  }
                : tc,
            ),
          }));
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
          <ModelSelect
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            setError={setError}
            busy={busy}
          />
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
              <AgentIcon agentId={agent?.id} />
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
          disabled={!agent || !selectedModel}
          query={query}
          onQueryChange={setQuery}
          onSubmit={submit}
        />
      </Stack>
    </Shell>
  );
}
