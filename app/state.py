from typing import TypedDict, List, Literal

from langchain_core.messages import BaseMessage
from pydantic import BaseModel, Field


class ChatState(TypedDict):
    messages: List[BaseMessage]
    should_continue: bool


class ReviewAnalysis(BaseModel):
    sentiment: Literal["positive", "negative", "neutral"] = Field(
        description="The sentiment of the review: positive, negative or neutral"
    )
    confidence: float = Field(
        description="The confidence of the analysis: from 0.0 to 1.0",
        ge=0.0, le=1.0,
    )
    key_topics: List[str] = Field(
        description="The key topics in the review",
        max_length=5,
    )
    summary: str = Field(
        description="Short summary of the review in one sentence",
        max_length=200,
    )


class MessageClassification(BaseModel):
    message_type: Literal["review", "question"] = Field(
        description="The type of message: review or question",
    )
    confidence: float = Field(
        description="The confidence of the analysis: from 0.0 to 1.0",
        ge=0.0, le=1.0,
    )


class SystemState(TypedDict):
    messages: List[BaseMessage]
    current_user_input: str
    message_type: str
    should_continue: bool
    analysis_results: List[dict]
