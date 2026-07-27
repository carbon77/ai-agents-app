from typing import List

from pydantic import BaseModel


class AgentChatRequest(BaseModel):
    model: str = "llama-3.1-8b-instant"
    message: str


class AgentChatResponse(BaseModel):
    messages: List[dict]
    tool_calls: List[dict]
