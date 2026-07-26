from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.db.db import get_session

auth_router = APIRouter()


class CreateUserReq(BaseModel):
    email: str
    password: str


@auth_router.post(
    "/users",
    tags=["auth"],
    summary="Create a user",
)
async def create_user(
        req: CreateUserReq,
        session: AsyncSession = Depends(get_session),
):
    user = User()
    user.email = req.email
    user.password_hash = req.password
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@auth_router.get(
    "/users",
    tags=["auth"],
    summary="List all users",
)
async def all_users(
        session: AsyncSession = Depends(get_session),
):
    users = await session.scalars(select(User))
    return users.all()
