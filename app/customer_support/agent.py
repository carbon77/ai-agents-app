from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

from app.customer_support.state import SupportState
from app.customer_support.steps import apply_step_config
from app.customer_support.tools import record_issue_type, record_warranty_status, provide_solution, escalate_to_human
from app.agents.registry import chat_model_registry

all_tools = [
    record_warranty_status,
    record_issue_type,
    provide_solution,
    escalate_to_human,
]

def create_customer_support_agent(model_id: str):
    return create_agent(
        chat_model_registry.get(model_id),
        tools=all_tools,
        state_schema=SupportState,
        middleware=[apply_step_config],
        checkpointer=InMemorySaver(),
    )


customer_support_agent = create_customer_support_agent("llama-3.1-8b-instant")
