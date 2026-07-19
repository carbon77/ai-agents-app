from typing import TypedDict, List

from langchain_core.messages import BaseMessage


class ChatState(TypedDict):
    messages: List[BaseMessage]
    should_continue: bool
