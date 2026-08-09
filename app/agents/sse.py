import asyncio
import logging
from typing import AsyncIterable

from fastapi.sse import ServerSentEvent

logger = logging.getLogger(__name__)


def sse_event(
        event: str,
        data: dict,
) -> ServerSentEvent:
    return ServerSentEvent(
        event=event,
        data=data,
    )


async def stream_agent_event(kind: str, item: any) -> AsyncIterable[ServerSentEvent]:
    try:
        if kind == "messages":
            for token in item.text:
                await asyncio.sleep(0.05)
                yield sse_event("message_token", {"token": token})
        elif kind == "tool_calls":
            call = f"{item.tool_name}({item.input})"
            yield sse_event("tool_call_start", {
                "call": call,
                "name": item.tool_name,
                "input": item.input,
            })
            await asyncio.sleep(2)
            for delta in item.output_deltas:
                yield sse_event("tool_call_delta", {
                    "call": call,
                    "name": item.tool_name,
                    "delta": delta,
                })
            yield sse_event("tool_call_end", {
                "call": call,
                "name": item.tool_name,
                "output": item.output,
                "error": item.error,
            })
    except Exception as err:
        logger.error(err)
        yield sse_event("error", {"error": err})
