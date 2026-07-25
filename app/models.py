from typing import List

from pydantic import BaseModel


class Query(BaseModel):
    query: str


class AgentResponse(BaseModel):
    messages: List[dict]
    tool_calls: List[dict]
