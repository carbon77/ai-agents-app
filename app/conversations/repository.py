from typing import Annotated, Sequence

from fastapi import Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.conversations.models import Conversation
from app.db.db import get_session


class ConversationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
            self,
            user_id: int,
            title: str | None = None,
    ) -> Conversation:
        conversation = Conversation(
            title=title,
            user_id=user_id,
        )
        self.session.add(conversation)
        await self.session.commit()
        await self.session.refresh(conversation)
        return conversation

    async def get_all_by_user_id(self, user_id: int) -> Sequence[Conversation]:
        result = await self.session.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.desc())
        )
        return result.scalars().all()

    async def update_title(
            self,
            conversation_id: str,
            title: str,
    ) -> Conversation:
        conversation = await self.session.get(Conversation, conversation_id)
        if conversation is None:
            raise HTTPException(status_code=404, detail="Conversation not found")

        conversation.title = title

        await self.session.commit()
        await self.session.refresh(conversation)
        return conversation

    async def delete(self, conversation_id: str):
        await self.session.execute(
            delete(Conversation).where(Conversation.id == conversation_id)
        )
        await self.session.commit()


def get_conversation_repository(
        session: Annotated[AsyncSession, Depends(get_session)],
) -> ConversationRepository:
    return ConversationRepository(session)


ConversationRepositoryDepends = Annotated[ConversationRepository, Depends(get_conversation_repository)]
