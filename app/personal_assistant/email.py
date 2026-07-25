from langchain.agents import create_agent

from app.chat_model_registry import chat_model_registry
from app.personal_assistant.tools import send_email

EMAIL_AGENT_PROMPT = (
    "You are an email assistant. "
    "Compose professional emails based on natural language requests. "
    "Extract recipient information and craft appropriate subject lines and body text. "
    "Use send_email to send the message. "
    "Always confirm what was sent in your final response."
)

email_agent = create_agent(
    chat_model_registry.get("llama-3.1-8b-instant"),
    tools=[send_email],
    system_prompt=EMAIL_AGENT_PROMPT,
)
