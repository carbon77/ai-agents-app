from fastapi import FastAPI
from pydantic import BaseModel

from personal_assistant.app import assistant_router


class Agent(BaseModel):
    id: str
    name: str
    description: str
    endpoint: str


class AgentSection(BaseModel):
    id: str
    name: str
    description: str
    agents: list[Agent]


PERSONAL_ASSISTANT_AGENTS = [
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

AGENT_SECTIONS = [
    AgentSection(
        id="personal-assistant",
        name="Personal Assistant",
        description="Agents for calendar scheduling, email workflows, and personal task routing.",
        agents=PERSONAL_ASSISTANT_AGENTS,
    )
]

AVAILABLE_AGENTS = [agent for section in AGENT_SECTIONS for agent in section.agents]

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


@agents.get("/", response_model=list[AgentSection], summary="List agent sections", tags=["agents"])
async def list_agent_sections():
    return AGENT_SECTIONS


@agents.get("/all", response_model=list[Agent], summary="List all agents", tags=["agents"])
async def list_agents():
    return AVAILABLE_AGENTS


agents.include_router(assistant_router)
