export type Agent = {
  id: string;
  name: string;
  description: string;
  endpoint: string;
};

export type AgentResponse = {
  messages: Array<{ content: string; tool_call?: unknown }>;
  tool_calls: Array<{ call: string; result: string }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function getAgents(): Promise<Agent[]> {
  const response = await fetch(`${API_BASE_URL}/agents/`);
  if (!response.ok) throw new Error('Unable to load agents');
  return response.json();
}

export async function sendAgentMessage(agent: Agent, query: string): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE_URL}${agent.endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error('Agent request failed');
  return response.json();
}
