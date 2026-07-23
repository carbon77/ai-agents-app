from fastapi import FastAPI

from personal_assistant.app import assistant_router

tags_metadata = [
    {
        "name": "personal_assistant",
        "description": "Personal Assistant. The agent can schedule calendar event and manage emails",
    }
]
agents = FastAPI(openapi_tags=tags_metadata)
agents.include_router(assistant_router)
