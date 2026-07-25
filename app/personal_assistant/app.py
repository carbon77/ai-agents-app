from __future__ import annotations

import json
from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage

from app.chat_model_registry import chat_model_registry
from app.models import AgentChatRequest, AgentChatResponse
from app.personal_assistant.calendar import CALENDAR_AGENT_PROMPT
from app.personal_assistant.email import create_email_agent
from app.personal_assistant.supervisor import create_supervisor_agent
from app.personal_assistant.tools import create_calendar_event, get_available_time_slots

assistant_router = APIRouter()


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, default=str)}\n\n"


async def _stream_calendar_agent(query: AgentChatRequest) -> AsyncIterator[str]:
    yield _sse("start", {"message": "Calendar assistant connected."})
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
            if kind == "messages":
                token = str(item.text)
                if token:
                    yield _sse("message_token", {"token": token})
                tool_calls = getattr(item, "tool_calls", None)
                if tool_calls:
                    yield _sse("message_tool_calls", {"tool_calls": tool_calls})
            elif kind == "tool_calls":
                call = f"{item.tool_name}({item.input})"
                yield _sse("tool_call_start", {"call": call})
                result = ""
                for delta in item.output_deltas:
                    result += delta
                    yield _sse("tool_call_delta", {"call": call, "delta": delta})
                yield _sse("tool_call_end", {"call": call, "result": result})
        yield _sse("done", {"message": "Calendar assistant response completed."})
    except Exception as exc:
        yield _sse("error", {"message": str(exc)})


@assistant_router.post("/assistant/calendar",
                       summary="Personal Assistant Calendar",
                       tags=["personal_assistant"]
                       )
async def pa_calendar(query: AgentChatRequest):
    return StreamingResponse(
        _stream_calendar_agent(query),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@assistant_router.post("/assistant/email",
                       summary="Personal Assistant Email",
                       tags=["personal_assistant"]
                       )
async def pa_email(query: AgentChatRequest):
    messages = [HumanMessage(content=query.message)]
    agent = create_email_agent(query.model)
    stream = agent.stream_events(
        {"messages": messages},
        version="v3",
    )

    result_messages = []
    tool_calls = []
    for kind, item in stream.interleave("messages", "tool_calls"):
        if kind == "messages":
            message = str(item.text)
            tool_call = str(item.tool_calls)
            result_messages.append({
                "content": message,
                "tool_call": tool_call,
            })
        elif kind == "tool_calls":
            call = f"{item.tool_name}({item.input})"
            result = ""
            for delta in item.output_deltas:
                result += delta
            tool_calls.append({
                "call": call,
                "result": result,
            })
    return AgentChatResponse(messages=result_messages, tool_calls=tool_calls)


@assistant_router.post("/assistant/supervisor",
                       summary="Personal Assistant Supervisor",
                       tags=["personal_assistant"]
                       )
async def pa_supervisor(query: AgentChatRequest):
    messages = [HumanMessage(content=query.message)]
    agent = create_supervisor_agent(query.model)
    stream = agent.stream_events(
        {"messages": messages},
        version="v3",
    )

    result_messages = []
    tool_calls = []
    for kind, item in stream.interleave("messages", "tool_calls"):
        if kind == "messages":
            message = str(item.text)
            tool_call = item.tool_calls.get()
            result_messages.append({
                "content": message,
                "tool_call": tool_call,
            })
        elif kind == "tool_calls":
            call = f"{item.tool_name}({item.input})"
            result = ""
            for delta in item.output_deltas:
                result += delta
            tool_calls.append({
                "call": call,
                "result": result,
            })
    return AgentChatResponse(messages=result_messages, tool_calls=tool_calls)
