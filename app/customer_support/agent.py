from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

from app.init_models import model
from app.customer_support.state import SupportState
from app.customer_support.steps import apply_step_config
from app.customer_support.tools import record_issue_type, record_warranty_status, provide_solution, escalate_to_human

all_tools = [
    record_warranty_status,
    record_issue_type,
    provide_solution,
    escalate_to_human,
]

customer_support_agent = create_agent(
    model,
    tools=all_tools,
    state_schema=SupportState,
    middleware=[apply_step_config],
    checkpointer=InMemorySaver(),
)