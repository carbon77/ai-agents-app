import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.app import auth_router
from app.conversations.router import conversations_router
from app.db.db import engine, Base
from app.agents.agents import agents_router
from app.agents.ai_models import models_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    await engine.dispose()


tags_metadata = [
    {
        "name": "personal_assistant",
        "description": "Personal Assistant. The agent can schedule calendar event and manage emails",
    },
    {
        "name": "agents",
        "description": "Metadata about available agents",
    },
    {
        "name": "models",
        "description": "Metadata about available models",
    },
    {
        "name": "customer_support",
        "description": "Customer support",
    },
    {
        "name": "auth",
        "description": "Authorization",
    },
    {
        "name": "conversations",
        "description": "User conversations",
    },
]
app = FastAPI(openapi_tags=tags_metadata, lifespan=lifespan)
app.include_router(agents_router)
app.include_router(models_router)
app.include_router(auth_router)
app.include_router(conversations_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
