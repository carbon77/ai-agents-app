from langchain_core.tools import tool
from langchain_mcp_adapters.client import MultiServerMCPClient


@tool
async def session_status() -> str:
    """Shows the current status of the session"""
    return "Session is active. Use filesystem tools for working with documents"


@tool
async def end_session(reason: str = "User finished work") -> str:
    """Ends the session"""
    print(f"Ending session: {reason}")
    return f"Session ended. {reason}"

async def get_all_tools():
    """Gets all tools available"""
    custom_tools = [session_status, end_session]

    try:
        mcp_client = MultiServerMCPClient({
            "filesystem": {
                "command": "npx",
                "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
                "transport": "stdio",
            }
        })
        mcp_tools = await mcp_client.get_tools()
        print(f"There are {len(mcp_tools)} filesystem tools available")
        return custom_tools + mcp_tools
    except Exception as e:
        print(f"MCP is unavailable, using only basic tools: {e}")
        return custom_tools