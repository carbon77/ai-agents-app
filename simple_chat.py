from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.constants import START, END
from langgraph.graph import StateGraph

from app.state import ChatState
from app.utils import gen_png_graph

load_dotenv()

model_name = "llama-3.1-8b-instant"
llm = ChatGroq(
    model_name=model_name,
    temperature=.7,
)


def user_input_node(state: ChatState) -> dict:
    user_input = input("You: ")

    if user_input == "quit":
        return {"should_continue": False}

    new_messages = state["messages"] + [HumanMessage(content=user_input)]
    return {"messages": new_messages, "should_continue": True}


def llm_response_node(state: ChatState) -> dict:
    response = llm.invoke(state["messages"])
    msg_content = response.content

    print(f"Agent: {msg_content}")
    new_messages = state["messages"] + [AIMessage(content=msg_content)]
    return {"messages": new_messages}


def should_continue(state: ChatState) -> str:
    return "continue" if state.get("should_continue", True) else "end"


# Creating graph
graph = StateGraph(ChatState)

graph.add_node("user_input", user_input_node)
graph.add_node("llm_response", llm_response_node)

graph.add_edge(START, "user_input")
graph.add_edge("user_input", "llm_response")
graph.add_conditional_edges(
    "llm_response",
    should_continue,
    {
        "continue": "user_input",
        "end": END,
    }
)
app = graph.compile()

if __name__ == "__main__":
    print("Welcome to AI chat!")
    print("For exit type 'quit'")
    print("-" * 50)

    initial_state = {
        "messages": [
            SystemMessage(
                content="You are a friendly assistant. Answer briefly and to the point."
            )
        ],
        "should_continue": True,
    }
    gen_png_graph(app)

    try:
        final_state = app.invoke(initial_state)
        print("-" * 50)
        print("Chat finished. Goodbye!")
        print(f"Humber of messages: {len(final_state['messages'])}")
    except KeyboardInterrupt:
        print("\nChat interrupted by user.")
    except Exception as e:
        print(f"\nSomething went wrong. {e}")
