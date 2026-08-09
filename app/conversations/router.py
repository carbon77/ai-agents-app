from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth.app import get_current_user
from app.auth.models import User
from app.conversations.repository import ConversationRepositoryDepends

conversations_router = APIRouter(
    prefix="/conversations",
)


class CreateConversationRequest(BaseModel):
    title: str


class RenameConversationRequest(BaseModel):
    title: str


@conversations_router.post(
    path="/",
    tags=["conversations"],
)
async def create_conversation(
        conversation_repository: ConversationRepositoryDepends,
        request: CreateConversationRequest,
        current_user: User = Depends(get_current_user),
):
    return await conversation_repository.create(
        user_id=current_user.id,
        title=request.title,
    )


@conversations_router.get(
    path="/me",
    tags=["conversations"],
)
async def get_conversations_by_current_user(
        conversation_repository: ConversationRepositoryDepends,
        current_user: Annotated[User, Depends(get_current_user)],
):
    return await conversation_repository.get_all_by_user_id(current_user.id)


@conversations_router.patch(
    path="/{conversation_id}",
    tags=["conversations"],
)
async def rename_conversation(
        conversation_repository: ConversationRepositoryDepends,
        conversation_id: str,
        request: RenameConversationRequest,
):
    return await conversation_repository.update_title(
        conversation_id,
        request.title,
    )


@conversations_router.delete(
    path="/{conversation_id}",
    tags=["conversations"],
)
async def delete_conversation(
        conversation_repository: ConversationRepositoryDepends,
        conversation_id: str,
):
    await conversation_repository.delete(conversation_id)
    return {"success": True}
