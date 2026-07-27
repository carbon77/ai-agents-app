import os
from datetime import timedelta, datetime, timezone
from typing import Annotated

import jwt
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User, TokenData, Token
from app.db.db import get_session

auth_router = APIRouter(
    prefix="/auth"
)

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_user(
        session: AsyncSession,
        email: str,
) -> User | None:
    statement = select(User).where(User.email == email)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def authenticate_user(
        session: AsyncSession,
        email: str,
        password: str,
) -> User | bool:
    user = await get_user(session, email)
    if not user:
        return False
    if not password_hash.verify(password, user.password_hash):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
        session: Annotated[AsyncSession, Depends(get_session)],
        token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = await get_user(session, token_data.username)
    if user is None:
        raise credentials_exception
    return user


class CreateUserRequest(BaseModel):
    email: str
    password: str


@auth_router.post(
    "/users",
    tags=["auth"],
    summary="Create a new user",
    status_code=204,
)
async def create_user(
        req: CreateUserRequest,
        session: Annotated[AsyncSession, Depends(get_session)],
):
    user = User(email=req.email, password_hash=password_hash.hash(req.password))
    session.add(user)
    await session.commit()


class LoginRequest(BaseModel):
    username: str
    password: str


@auth_router.post(
    "/token",
    tags=["auth"],
    summary="Log in for access token",
)
async def login_for_access_token(
        request: LoginRequest,
        session: Annotated[AsyncSession, Depends(get_session)],
) -> Token:
    user = await authenticate_user(session, request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@auth_router.get(
    "/users/me",
    tags=["auth"],
    summary="Get current authorized user",
)
async def read_users_me(
        current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at,
    }
