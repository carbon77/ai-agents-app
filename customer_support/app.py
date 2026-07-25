from fastapi import APIRouter
from langchain_core.messages import HumanMessage
from langchain_core.utils.uuid import uuid7

from app.models import Query, AgentResponse
from customer_support.agent import customer_support_agent

customer_support_router = APIRouter()

@customer_support_router.post(
    "/customer_support",
    summary="Customer support",
    tags=["customer_support"],
)
def customer_support(query: Query):
    thread_id = str(uuid7())
    config = {"configurable": {"thread_id": thread_id }}
    messages = [HumanMessage(content=query.query)]
    stream = customer_support_agent.stream_events(
        {"messages": messages},
        version="v3",
        config=config,
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
