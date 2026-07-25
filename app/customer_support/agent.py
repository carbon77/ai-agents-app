from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

from app.customer_support.state import SupportState
from app.customer_support.steps import apply_step_config
from app.customer_support.tools import record_issue_type, record_warranty_status, provide_solution, escalate_to_human
from app.chat_model_registry import chat_model_registry

all_tools = [
    record_warranty_status,
    record_issue_type,
    provide_solution,
    escalate_to_human,
]

customer_support_agent = create_agent(
    chat_model_registry.get("llama-3.1-8b-instant"),
    tools=all_tools,
    state_schema=SupportState,
    middleware=[apply_step_config],
    checkpointer=InMemorySaver(),
)
