from dotenv import load_dotenv
from fastapi import FastAPI

from agents_app import agents

load_dotenv()

app = FastAPI()

app.mount("/agents", agents)
