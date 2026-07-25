from fastapi import APIRouter
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage

from app.chat_model_registry import chat_model_registry
from app.models import AgentChatRequest, AgentChatResponse
from app.personal_assistant.calendar import CALENDAR_AGENT_PROMPT
from app.personal_assistant.email import email_agent
from app.personal_assistant.supervisor import supervisor_agent
from app.personal_assistant.tools import create_calendar_event, get_available_time_slots

assistant_router = APIRouter()


@assistant_router.post("/assistant/calendar",
                       summary="Personal Assistant Calendar",
                       tags=["personal_assistant"]
                       )
async def pa_calendar(query: AgentChatRequest):
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


@assistant_router.post("/assistant/email",
                       summary="Personal Assistant Email",
                       tags=["personal_assistant"]
                       )
async def pa_calendar(query: AgentChatRequest):
    messages = [HumanMessage(content=query.message)]
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
    return AgentChatResponse(messages=result_messages, tool_calls=tool_calls)


@assistant_router.post("/assistant/supervisor",
                       summary="Personal Assistant Supervisor",
                       tags=["personal_assistant"]
                       )
async def pa_supervisor(query: AgentChatRequest):
    messages = [HumanMessage(content=query.message)]
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
    return AgentChatResponse(messages=result_messages, tool_calls=tool_calls)
