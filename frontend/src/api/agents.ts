import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  Agent,
  AgentResponse,
  AgentSection,
  ChatModel,
  StreamingAgentEvent,
} from "../types/agents";
import { API_BASE_URL, apiFetch } from "./api";

export async function getAgentSections(): Promise<AgentSection[]> {
  const response = await apiFetch(`/agents/`);
  if (!response.ok) throw new Error("Unable to load agent sections");
  return response.json();
}

export async function getAgents(): Promise<Agent[]> {
  const response = await apiFetch(`/agents/all`);
  if (!response.ok) throw new Error("Unable to load agents");
  return response.json();
}

export async function getChatModels(): Promise<ChatModel[]> {
  const params = new URLSearchParams();
  params.append("model_types", "chat_completion");
  const response = await apiFetch(`/models/?${params.toString()}`);
  if (!response.ok) throw new Error("Unable to load chat models");
  return response.json();
}

export async function getModels(): Promise<ChatModel[]> {
  const response = await apiFetch(`/models/`);
  if (!response.ok) throw new Error("Unable to load models");
  return response.json();
}

export async function sendAgentMessage(
  agent: Agent,
  message: string,
  model: string,
): Promise<AgentResponse> {
  const response = await apiFetch(`${agent.endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, model }),
  });
  if (!response.ok) throw new Error("Agent request failed");
  return response.json();
}

export async function streamAgentResponse(
  agent: Agent,
  model: ChatModel,
  message: string,
  onMessage: (event: StreamingAgentEvent) => void,
): Promise<void> {
  await fetchEventSource(`${API_BASE_URL}${agent.endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, model: model.model_id }),
    onmessage(event) {
      if (!event.event || !event.data) return;
      onMessage({
        type: event.event,
        data: JSON.parse(event.data),
      });
    },
  });
}
