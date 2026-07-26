from typing import List, Literal, Annotated

from fastapi import APIRouter, Query
from pydantic import BaseModel

ModelType = Literal["chat_completion", "speech_to_text", "text_to_speech"]


class ModelMetadata(BaseModel):
    model_id: str
    name: str
    owner: str
    provider: str
    context_window: int
    max_completion_tokens: int
    supported_features: List[str]
    model_type: ModelType


AI_MODELS = [
    ModelMetadata(
        model_id="GigaChat-2",
        name="GigaChat-2 Lite",
        owner="Sber",
        provider="gigachat",
        context_window=128000,
        max_completion_tokens=32760,
        model_type="chat_completion",
        supported_features=["tools"],
    ),
    ModelMetadata(
        model_id="GigaChat-2-Max",
        name="GigaChat-2 Max",
        owner="Sber",
        provider="gigachat",
        context_window=128000,
        max_completion_tokens=32760,
        model_type="chat_completion",
        supported_features=["tools"],
    ),
    ModelMetadata(
        model_id="llama-3.3-70b-versatile",
        name="Llama 3.3 70B",
        owner="Meta",
        provider="groq",
        context_window=131072,
        max_completion_tokens=32760,
        model_type="chat_completion",
        supported_features=["tools", "json_mode"],
    ),
    ModelMetadata(
        model_id="llama-3.1-8b-instant",
        name="Llama 3.1 8B",
        owner="Meta",
        provider="groq",
        context_window=131072,
        max_completion_tokens=131072,
        model_type="chat_completion",
        supported_features=["tools", "json_mode"],
    ),
    ModelMetadata(
        model_id="qwen/qwen3.6-27b",
        name="Qwen 3.6 27B",
        owner="Alibaba Cloud",
        provider="groq",
        context_window=131072,
        max_completion_tokens=16384,
        model_type="chat_completion",
        supported_features=["tools", "json_mode", "reasoning"],
    ),
    ModelMetadata(
        model_id="openai/gpt-oss-20b",
        name="GPT OSS 20B",
        owner="OpenAI",
        provider="groq",
        context_window=131072,
        max_completion_tokens=65536,
        model_type="chat_completion",
        supported_features=["tools", "json_mode", "reasoning", "structured_outputs"],
    ),
    ModelMetadata(
        model_id="whisper-large-v3",
        name="Whisper",
        owner="OpenAI",
        provider="groq",
        context_window=448,
        max_completion_tokens=448,
        model_type="speech_to_text",
        supported_features=[],
    ),
    ModelMetadata(
        model_id="canopylabs/orpheus-v1-english",
        name="Canopy Labs Orpheus V1 English",
        owner="Canopy Labs",
        provider="groq",
        context_window=4000,
        max_completion_tokens=50000,
        model_type="text_to_speech",
        supported_features=[],
    ),
]

models_router = APIRouter(
    prefix="/models"
)


@models_router.get(
    path="/",
    response_model=List[ModelMetadata],
    summary="List of available models",
    tags=["models"],
)
def get_models(
        model_types: Annotated[
            List[ModelType],
            Query(title="Model types to search")
        ] = ["chat_completion", "speech_to_text", "text_to_speech"]
):
    return [model for model in AI_MODELS if model.model_type in model_types]
