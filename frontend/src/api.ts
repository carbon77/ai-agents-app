import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  Agent,
  AgentResponse,
  AgentSection,
  ChatModel,
  StreamingAgentEvent,
} from "./types/agents";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    setAccessToken(null);
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return res;
}

export async function getAgentSections(): Promise<AgentSection[]> {
  const response = await fetch(`${API_BASE_URL}/agents/`);
  if (!response.ok) throw new Error("Unable to load agent sections");
  return response.json();
}

export async function getAgents(): Promise<Agent[]> {
  const response = await fetch(`${API_BASE_URL}/agents/all`);
  response.headers;
  if (!response.ok) throw new Error("Unable to load agents");
  return response.json();
}

export async function getChatModels(): Promise<ChatModel[]> {
  const params = new URLSearchParams();
  params.append("model_types", "chat_completion");
  const response = await fetch(`${API_BASE_URL}/models/?${params.toString()}`);
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
  const response = await fetch(`${API_BASE_URL}${agent.endpoint}`, {
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
