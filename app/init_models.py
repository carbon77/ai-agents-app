from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

load_dotenv()

model_name = "llama-3.3-70b-versatile"
model_provider = "groq"
model = init_chat_model(f"{model_provider}:{model_name}")