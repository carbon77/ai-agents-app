import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.agents import agents_router
from app.routers.ai_models import models_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

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
]
app = FastAPI(openapi_tags=tags_metadata)
app.include_router(agents_router)
app.include_router(models_router)

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
