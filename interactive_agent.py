from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_groq import ChatGroq
from langgraph.checkpoint.memory import InMemorySaver

from app.tools import get_all_tools

load_dotenv()

async def create_ai_agent():
    """Create an agent"""
    tools = await get_all_tools()
    model_name = "llama-3.3-70b-versatile"
    model = ChatGroq(
        model_name=model_name,
        temperature=0.0,
    )
    system_prompt = """
You are a professional assistant in creating and editing emails and documents. 

You have full access to the file system via MCP tools:
- read_file, write_file - reading and writing files
- list_directory - viewing directory contents
- create_directory - creating directories
- move_file, copy_file - file operations

WORKING PRINCIPLES:
1. Help the user to create high-quality emails and documents
2. Always save work results to files
3. Suggest improvements and edits
4. Maintain session context - remember created files and documents

ENDING A SESSION:
Use end_session() when:
- The user explicitly requests ending ("end", "exit", "stop")
- The work is completely done and the user is satisfied with the result
- After phrases like "thanks", "done", "everything is fine"

IMPORTANT: Be helpful, friendly and professional!
"""
    checkpointer = InMemorySaver()
    agent = create_agent(
        model=model,
        tools=tools,
        checkpointer=checkpointer,
        system_prompt=SystemMessage(content=system_prompt),
    )
    print("The agent is initialized with persistent memory")
    return agent


async def print_session_stats(agent, config):
    """Print the session stats"""
    try:
        state = await agent.aget_state(config)
        if state and "messages" in state.values:
            messages = state.values["messages"]
            human_messages = [m for m in messages if isinstance(m, HumanMessage)]
            ai_messages = [m for m in messages if isinstance(m, AIMessage)]

            print(f"User messages: {len(human_messages)}")
            print(f"Agent messages: {len(ai_messages)}")
            print(f"Total messages: {len(messages)}")
        else:
            print("The stats is unavailable")
    except Exception as e:
        print(f"Stats fetching failed: {e}")

async def run_interactive_session():
    print("INTERACTIVE ASSISTANT IN CREATING EMAILS")
    print("Commands: 'end', 'exit', 'stop' - for ending")
    print("Just describe what needs to be created or edited")

    agent = await create_ai_agent()
    config = {"configurable": {"thread_id": "document-session"}}

    try:
        while True:
            try:
                user_input = input("\nYour request: ").strip()
                if not user_input:
                    continue

                if user_input.lower() in ['end', 'exit', 'stop']:
                    print("\nGoodbye!")
                    break

                print("\nProcessing the request...")
                user_message = HumanMessage(content=user_input)
                response_printed = False
                session_ended = False

                async for chunk in agent.astream(
                        {"messages": [user_message]},
                    config=config,
                    stream_mode="updates",
                ):
                    if "messages" in chunk and chunk["messages"]:
                        last_msg = chunk["messages"][-1]

                        if isinstance(last_msg, AIMessage) and not response_printed:
                            print(f"\n{last_msg.content}")
                            response_printed = True

                        if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
                            for tool_call in last_msg.tool_calls:
                                if tool_call["name"] == "end_session":
                                    session_ended = True

                if session_ended:
                    print("The agent ended the session")
                    break
            except Exception as e:
                print(f"\nProcessing the request failed: {e}")
    finally:
        print("\n" + "=" * 50)
        print("THE SESSION STATS")
        await print_session_stats(agent, config)
        print("The session ended")

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_interactive_session())