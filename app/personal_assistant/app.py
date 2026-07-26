import logging
from typing import AsyncIterable

from fastapi import APIRouter
from fastapi.sse import EventSourceResponse, ServerSentEvent
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage

from app.chat_model_registry import chat_model_registry
from app.models import AgentChatRequest
from app.personal_assistant.calendar import CALENDAR_AGENT_PROMPT
from app.personal_assistant.email import create_email_agent
from app.personal_assistant.supervisor import create_supervisor_agent
from app.personal_assistant.tools import create_calendar_event, get_available_time_slots
from app.sse import stream_agent_event, sse_event

assistant_router = APIRouter()

logger = logging.getLogger(__name__)


@assistant_router.post(
    "/assistant/calendar",
    summary="Personal Assistant Calendar",
    tags=["personal_assistant"],
    response_class=EventSourceResponse,
)
async def pa_calendar(query: AgentChatRequest) -> AsyncIterable[ServerSentEvent]:
    yield sse_event("start", {"message": "Connected"})
    try:
        messages = [HumanMessage(content=query.message)]
        agent = create_agent(
            chat_model_registry.get(query.model),
            tools=[create_calendar_event, get_available_time_slots],
            system_prompt=CALENDAR_AGENT_PROMPT,
        )
        stream = agent.stream_events(
            {"messages": messages},
            version="v3",
        )

        for kind, item in stream.interleave("messages", "tool_calls"):
            async for event in stream_agent_event(kind, item):
                yield event
        yield sse_event("end", {"message": "Done"})
    except Exception as e:
        logger.error(e)
        yield sse_event("error", {"message": str(e)})


@assistant_router.post(
    "/assistant/email",
    summary="Personal Assistant Email",
    tags=["personal_assistant"],
    response_class=EventSourceResponse,
)
async def pa_calendar(query: AgentChatRequest) -> AsyncIterable[ServerSentEvent]:
    try:
        messages = [HumanMessage(content=query.message)]
        agent = create_email_agent(query.model)
        stream = agent.stream_events(
            {"messages": messages},
            version="v3",
        )

        for kind, item in stream.interleave("messages", "tool_calls"):
            async for event in stream_agent_event(kind, item):
                yield event
        yield sse_event("end", {"message": "Done"})
    except Exception as e:
        logger.error(e)
        yield sse_event("error", {"message": str(e)})


@assistant_router.post(
    "/assistant/supervisor",
    summary="Personal Assistant Supervisor",
    tags=["personal_assistant"],
    response_class=EventSourceResponse,
)
async def pa_supervisor(query: AgentChatRequest) -> AsyncIterable[ServerSentEvent]:
    try:
        messages = [HumanMessage(content=query.message)]
        agent = create_supervisor_agent(query.model)
        stream = agent.stream_events(
            {"messages": messages},
            version="v3",
        )

        for kind, item in stream.interleave("messages", "tool_calls"):
            async for event in stream_agent_event(kind, item):
                yield event
        yield sse_event("end", {"message": "Done"})
    except Exception as e:
        logger.error(e)
        yield sse_event("error", {"message": str(e)})
