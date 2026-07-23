from typing import List

from fastapi import APIRouter
from langchain_core.messages import HumanMessage
from pydantic import BaseModel

from personal_assistant.calendar import calendar_agent
from personal_assistant.email import email_agent
from personal_assistant.supervisor import supervisor_agent


class Query(BaseModel):
    query: str


class AgentResponse(BaseModel):
    messages: List[dict]
    tool_calls: List[dict]


assistant_router = APIRouter()


@assistant_router.post("/assistant/calendar",
                       summary="Personal Assistant Calendar",
                       tags=["personal_assistant"]
                       )
async def pa_calendar(query: Query):
    messages = [HumanMessage(content=query.query)]
    stream = calendar_agent.stream_events(
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
    return AgentResponse(messages=result_messages, tool_calls=tool_calls)


@assistant_router.post("/assistant/email",
                       summary="Personal Assistant Email",
                       tags=["personal_assistant"]
                       )
async def pa_calendar(query: Query):
    messages = [HumanMessage(content=query.query)]
    stream = email_agent.stream_events(
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
    return AgentResponse(messages=result_messages, tool_calls=tool_calls)


@assistant_router.post("/assistant/supervisor",
                       summary="Personal Assistant Supervisor",
                       tags=["personal_assistant"]
                       )
async def pa_supervisor(query: Query):
    messages = [HumanMessage(content=query.query)]
    stream = supervisor_agent.stream_events(
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
    return AgentResponse(messages=result_messages, tool_calls=tool_calls)
