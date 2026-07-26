export type Agent = {
  id: string;
  name: string;
  description: string;
  endpoint: string;
};

export type AgentSection = {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
};

export type ChatModel = {
  model_id: string;
  name: string;
  owner: string;
  provider: string;
  context_window: number;
  max_completion_tokens: number;
  supported_features: string[];
  model_type: "chat_completion" | "speech_to_text" | "text_to_speech";
};

export type AgentResponse = {
  messages: Array<{ content: string; tool_call?: unknown }>;
  tool_calls: Array<{ name: string; result: string }>;
};

export type ToolCall = {
  call: string;
  name: string;
  input: Record<string, unknown>;
  delta?: any;
  result?: string;
  error?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "agent";
  content: string;
  error?: string;
  toolCalls: ToolCall[];
};

export type StreamingAgentEvent = {
  type: string;
  payload: Record<string, unknown>;
};
