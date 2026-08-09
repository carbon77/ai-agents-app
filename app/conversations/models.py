import uuid
from datetime import datetime

from sqlalchemy import Text, DateTime, func, UUID, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.db import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(UUID(), name="conversation_id", primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(Text(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
