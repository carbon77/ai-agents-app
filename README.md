# AI agents examples

This repository has simple examples of apps with AI agents

## Tech stack
- Python
- Groq for LLM provider
- LangGraph and LangChain for building AI agents
- Pydantic for parsing LLM response into JSON objects
- MCP for extra tools

## Apps
### Chat Bot
Simple chat bot that can answers for user's questions

### Analysis System
System that classifies user's input message (review or question) and processes them differently.

### Interactive Agent with Tools
ReAct agent for creating and editing files. The agent uses custom tools and tools provided by `@modelcontextprotocol/server-filesystem`
