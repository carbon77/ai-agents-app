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

export type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  toolCalls?: AgentResponse['tool_calls'];
};
