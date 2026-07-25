import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';
import { Agent, AgentResponse, AgentSection, ChatModel, StreamAgentEvent } from './types/agents';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function getAgentSections(): Promise<AgentSection[]> {
  const response = await fetch(`${API_BASE_URL}/agents/`);
  if (!response.ok) throw new Error('Unable to load agent sections');
  return response.json();
}

export async function getAgents(): Promise<Agent[]> {
  const response = await fetch(`${API_BASE_URL}/agents/all`);
  if (!response.ok) throw new Error('Unable to load agents');
  return response.json();
}

export async function getChatModels(): Promise<ChatModel[]> {
  const params = new URLSearchParams();
  params.append('model_types', 'chat_completion');
  const response = await fetch(`${API_BASE_URL}/models/?${params.toString()}`);
  if (!response.ok) throw new Error('Unable to load chat models');
  return response.json();
}

export async function getModels(): Promise<ChatModel[]> {
  const response = await fetch(`${API_BASE_URL}/models/`);
  if (!response.ok) throw new Error('Unable to load models');
  return response.json();
}

export async function sendAgentMessage(agent: Agent, message: string, model: string): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE_URL}${agent.endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, model }),
  });
  if (!response.ok) throw new Error('Agent request failed');
  return response.json();
}

export async function streamCalendarAgentMessage(
  message: string,
  model: string,
  onEvent: (event: StreamAgentEvent) => void,
): Promise<void> {
  await fetchEventSource(`${API_BASE_URL}/agents/assistant/calendar`, {
    method: 'POST',
    headers: {
      Accept: EventStreamContentType,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, model }),
    async onopen(response) {
      if (!response.ok) throw new Error('Calendar agent stream failed');

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.startsWith(EventStreamContentType)) {
        throw new Error('Calendar agent did not return an SSE stream');
      }
    },
    onmessage(event) {
      if (!event.event || !event.data) return;
      onEvent({ event: event.event, data: JSON.parse(event.data) });
    },
    onerror(error) {
      throw error;
    },
  });
}
