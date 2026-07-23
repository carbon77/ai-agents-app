from fastapi import FastAPI
from pydantic import BaseModel

from personal_assistant.app import assistant_router


class Agent(BaseModel):
    id: str
    name: str
    description: str
    endpoint: str


AVAILABLE_AGENTS = [
    Agent(
        id="calendar",
        name="Calendar Assistant",
        description="Schedule calendar events and answer questions about the calendar.",
        endpoint="/agents/assistant/calendar",
    ),
    Agent(
        id="email",
        name="Email Assistant",
        description="Draft, inspect, and manage emails.",
        endpoint="/agents/assistant/email",
    ),
    Agent(
        id="supervisor",
        name="Personal Assistant Supervisor",
        description="Route requests to the right personal assistant capability.",
        endpoint="/agents/assistant/supervisor",
    ),
]

tags_metadata = [
    {
        "name": "personal_assistant",
        "description": "Personal Assistant. The agent can schedule calendar event and manage emails",
    },
    {
        "name": "agents",
        "description": "Metadata about agents available in this API",
    },
]
agents = FastAPI(openapi_tags=tags_metadata)


@agents.get("/", response_model=list[Agent], summary="List agents", tags=["agents"])
async def list_agents():
    return AVAILABLE_AGENTS


agents.include_router(assistant_router)
