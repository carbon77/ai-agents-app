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

function parseSseEvent(rawEvent: string): StreamAgentEvent | undefined {
  const eventName = rawEvent
    .split('\n')
    .find((line) => line.startsWith('event:'))
    ?.replace('event:', '')
    .trim();
  const data = rawEvent
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.replace('data:', '').trim())
    .join('\n');

  if (!eventName || !data) return undefined;
  return { event: eventName, data: JSON.parse(data) };
}

export async function streamCalendarAgentMessage(
  message: string,
  model: string,
  onEvent: (event: StreamAgentEvent) => void,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/agents/assistant/calendar`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, model }),
  });

  if (!response.ok || !response.body) throw new Error('Calendar agent stream failed');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const rawEvent of events) {
      const parsedEvent = parseSseEvent(rawEvent);
      if (parsedEvent) onEvent(parsedEvent);
    }

    if (done) break;
  }

  const parsedEvent = parseSseEvent(buffer);
  if (parsedEvent) onEvent(parsedEvent);
}
