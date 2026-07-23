from langchain.agents import create_agent
from langchain_core.messages import HumanMessage

from init_models import model
from personal_assistant.tools import create_calendar_event, get_available_time_slots

CALENDAR_AGENT_PROMPT = (
    "You are a calendar scheduling assistant. "
    "Parse natural language scheduling requests (e.g., 'next Tuesday at 2pm') "
    "into proper ISO datetime formats. "
    "Use get_available_time_slots to check availability when needed. "
    "If there is no suitable time slot, stop and confirm unavailability in your response. "
    "Use create_calendar_event to schedule events. "
    "Always confirm what was scheduled in your final response."
)

calendar_agent = create_agent(
    model,
    tools=[create_calendar_event, get_available_time_slots],
    system_prompt=CALENDAR_AGENT_PROMPT,
)

if __name__ == "__main__":
    query = "Schedule a team meeting next Tuesday"
    stream = calendar_agent.stream_events(
        {"messages": [HumanMessage(content=query)]},
        version="v3",
    )

    for kind, item in stream.interleave("messages", "tool_calls"):
        if kind == "message":
            for token in item.text:
                print(token, end="", flush=True)
        elif kind == "tool_calls":
            print(f"\nTool call: {item.tool_name}({item.input})")
            print(f"Tool result: {item.output}")
