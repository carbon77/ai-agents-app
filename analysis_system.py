# Creating parser
import json

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langgraph.constants import START, END
from langgraph.graph import StateGraph

from app.state import SystemState, MessageClassification, ReviewAnalysis
from app.utils import gen_png_graph

load_dotenv()


def user_input_node(state: SystemState) -> dict:
    user_input = input("You: ").strip()

    if user_input.lower() == "quit":
        return {"should_continue": False}

    if user_input.lower() in ["results"]:
        analysis_results = state.get("analysis_results", [])
        if analysis_results:
            print(f"\n Number of analysed reviews: {len(analysis_results)}")
            sentiments = [r["analysis"]["sentiment"] for r in analysis_results]
            pos = sentiments.count("positive")
            neg = sentiments.count("negative")
            neu = sentiments.count("neutral")
            print(f"Positive: {pos}, Negative: {neg}, Neutral: {neu}")
        else:
            print("There are no analysed reviews")
        return {"should_continue": True}
    return {
        "current_user_input": user_input,
        "should_continue": True,
    }


# Creating LLM
model_name = "llama-3.1-8b-instant"
llm = ChatGroq(
    model_name=model_name,
    temperature=.7,
)

# Creating parser and prompt for classification
classification_parser = JsonOutputParser(pydantic_object=MessageClassification)
classification_prompt = PromptTemplate(
    template="""Determine, is this message a review about some product/service or a regular question?
    
REVIEW is an opinion about a product, service, user experience, etc.
QUESTION is a information request, conversation, asking for help

Message: {user_input}

{format_instruction}

Return ONLY JSON!
""",
    input_variables=["user_input"],
    partial_variables={
        "format_instruction": classification_parser.get_format_instructions(),
    }
)


def classify_message_node(state: SystemState) -> dict:
    user_input = state["current_user_input"]

    try:
        print("Determining message type...")
        classification_chain = classification_prompt | llm | classification_parser
        result = classification_chain.invoke({"user_input": user_input})

        message_type = result["message_type"]
        confidence = result["confidence"]

        print(f"Type: {message_type} (confidence: {confidence:.2f})")
        return {"message_type": message_type}
    except Exception as e:
        print(f"Classification failed: {e}")
        return {"message_type": "question"}


# Parser and prompt for analysis
review_parser = JsonOutputParser(pydantic_object=ReviewAnalysis)
review_prompt = PromptTemplate(
    template="""Analyze this review

Review: {review}

{format_instruction}

Return ONLY JSON without comments!""",
    input_variables=["review"],
    partial_variables={
        "format_instruction": review_parser.get_format_instructions(),
    }
)


def analyze_review_node(state: SystemState) -> dict:
    user_input = state["current_user_input"]

    try:
        print("Analyzing review...")
        review_chain = review_prompt | llm | review_parser
        result = review_chain.invoke({"review": user_input})

        full_result = {
            "original_review": user_input,
            "analysis": result,
        }
        analysis_results = state.get("analysis_results", [])
        new_analysis_results = analysis_results + [full_result]

        print("\n" + "=" * 50)
        print("REVIEW ANALYSIS:")
        print("=" * 50)
        print(json.dumps(full_result, indent=2))
        print("=" * 50)

        messages = state["messages"]
        new_messages = messages + [
            HumanMessage(content=user_input),
            AIMessage(
                content=f"The review has been analyzed: {result['sentiment']} sentiment with confidence: {result['confidence']}"),
        ]
        return {
            "messages": new_messages,
            "analysis_results": new_analysis_results,
        }
    except Exception as e:
        print(f'Review analysis failed: {e}')
        messages = state.get("messages", [])
        new_messages = messages + [
            HumanMessage(content=user_input),
            AIMessage(content="I'm sorry, the review analysis failed."),
        ]
        return {"messages": new_messages}


def answer_question_node(state: SystemState) -> dict:
    user_input = state["current_user_input"]

    try:
        print("Answering question...")

        messages = state["messages"] + [HumanMessage(content=user_input)]
        response = llm.invoke(messages)
        ai_response = response.content
        print(f'Agent: {ai_response}')

        new_messages = messages + [AIMessage(content=ai_response)]
        return {"messages": new_messages}
    except Exception as e:
        print(f'Answering question failed: {e}')
        messages = state.get("messages", []) + [
            HumanMessage(content=user_input),
            AIMessage(content="I'm sorry, the question answering failed."),
        ]
        return {"messages": messages}


# Route rules
def route_after_input(state: SystemState) -> str:
    if not state.get("should_continue", True):
        return "end"

    if state.get("current_user_input"):
        return "classify"
    return "get_input"


def route_after_classification(state: SystemState) -> str:
    message_type = state.get("message_type", "question")
    if message_type == "review":
        return "analyze_review"
    return "answer_question"


def route_continue(state: SystemState) -> str:
    return "get_input" if state.get("should_continue", True) else "end"


# Creating graph
graph = StateGraph(SystemState)

graph.add_node("get_input", user_input_node)
graph.add_node("classify", classify_message_node)
graph.add_node("analyze_review", analyze_review_node)
graph.add_node("answer_question", answer_question_node)

graph.add_edge(START, "get_input")
graph.add_conditional_edges(
    "get_input",
    route_after_input,
    {
        "end": END,
        "classify": "classify",
        "get_input": "get_input",
    }
)
graph.add_conditional_edges(
    "classify",
    route_after_classification,
    {
        "analyze_review": "analyze_review",
        "answer_question": "answer_question",
    }
)
graph.add_conditional_edges(
    "analyze_review",
    route_continue,
    {
        "get_input": "get_input",
        "end": END,
    }
)
graph.add_conditional_edges(
    "answer_question",
    route_continue,
    {
        "get_input": "get_input",
        "end": END,
    }
)
app = graph.compile()
gen_png_graph(app)

if __name__ == "__main__":
    print("Smart system: review analysis + chat bot")
    print("Type review - you'll get the JSON analysis")
    print("Type question - you'll get the answer")
    print("Commands: 'results' - analysis results, 'quit' - end chat")
    print("=" * 50)

    initial_state = {
        "messages": [
            SystemMessage(content="You are friendly assistant. Answer briefly and to the point to the questions"),
        ],
        "current_user_input": "",
        "message_type": "",
        "should_continue": True,
        "analysis_results": [],
    }

    try:
        final_state = app.invoke(initial_state)
        print("\nChat finished!")
        print(f"Number of messages: {len(final_state["messages"])}")
        print(f"Number of analysed reviews: {len(final_state["analysis_results"])}")
    except Exception as e:
        print(f"\nSystem failed: {e}")
