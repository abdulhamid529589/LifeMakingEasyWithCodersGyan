# 🤖 How ChatGPT Works — LLMs, Tools, Agents & Routing
> **Study notes** from video tutorial (Hindi). Covers how ChatGPT handles different types of requests, what LLMs are, how tool calling works, and the routing/orchestration architecture behind modern AI systems.

---

## Table of Contents

1. [What Is ChatGPT?](#1-what-is-chatgpt)
2. [What Is an LLM?](#2-what-is-an-llm)
3. [The Problem — LLMs Have No Real-Time Data](#3-the-problem--llms-have-no-real-time-data)
4. [The Solution — Tool Calling](#4-the-solution--tool-calling)
5. [AI Agents — LLMs That Decide What to Do](#5-ai-agents--llms-that-decide-what-to-do)
6. [ChatGPT's Architecture — The Router](#6-chatgpts-architecture--the-router)
7. [The Dhaba Analogy](#7-the-dhaba-analogy)
8. [Types of Models Inside ChatGPT](#8-types-of-models-inside-chatgpt)
9. [How to Build Your Own Agent](#9-how-to-build-your-own-agent)
10. [Key Concepts Summary](#10-key-concepts-summary)

---

## 1. What Is ChatGPT?

ChatGPT is an **AI chatbot** — an interface in a browser where you type a question and get a response.

From the outside, it looks simple:
- Type a message → get a text reply
- Ask about weather → get real-time weather data
- Ask for an image → get a generated image

But **behind the scenes, it is not one single AI** doing all of this. Multiple systems work together, and that's what this guide explains.

### Three types of responses ChatGPT can give:

| Input | Output | What's happening |
|-------|--------|-----------------|
| "Hi" | Text greeting | LLM responds directly |
| "What's the weather in Mumbai?" | Real-time weather | LLM calls a web search tool |
| "Create an image of nature" | Generated image | LLM routes to an image generation model |

---

## 2. What Is an LLM?

**LLM = Large Language Model**

An LLM is a neural network trained on massive amounts of publicly available text data:
- Online articles
- Books
- Wikipedia
- Websites and forums

### How it works:

```
Training phase:
  Internet text data → Train neural network → LLM (frozen model)

Inference phase:
  User query → LLM processes → Generates a new text response
```

### Key word: "Generates"

The LLM does **not** copy-paste from its training data. It **generates** new text based on patterns it learned. This is why we call it **Generative AI**.

### Neural Network

An LLM at its core is a **neural network** — a mathematical model inspired by how the brain works. If you're curious, studying neural networks is highly recommended as a foundation for understanding AI.

---

## 3. The Problem — LLMs Have No Real-Time Data

LLMs are trained once and then deployed. After training, they have no access to new information.

```
LLM trained in: [some date]
LLM knows about: everything up to that date
LLM doesn't know: today's weather, stock prices, breaking news, live scores
```

**So how does ChatGPT know today's weather?**

Answer: It doesn't look it up from its training data — it calls an external **tool**.

---

## 4. The Solution — Tool Calling

A **tool** in the context of AI is simply a **function** — a piece of code that the LLM can choose to call.

### Example: Web Search Tool

```
User asks: "What is the weather in Mumbai?"

Without tool:
  LLM → "I don't have real-time weather data" (or hallucinates an answer)

With web search tool:
  LLM → decides to call web_search("weather Mumbai")
       → tool fetches live weather data
       → LLM uses that data to write a response
       → User gets accurate, real-time answer
```

### How Tool Calling Works (Conceptually)

```python
# Define a tool (just a function)
def web_search(query: str) -> str:
    # Calls a search API and returns results
    return search_api_results

# LLM is given access to tools
available_tools = [web_search, image_generator, calculator]

# LLM decides whether to call a tool or respond directly
response = llm.chat(
    user_message="What's the weather in Mumbai?",
    tools=available_tools
)
# LLM decides: I need web_search here
# → calls web_search("weather Mumbai")
# → gets result
# → generates final response
```

### The LLM Decides Autonomously

The most important part: **the LLM itself decides** whether to call a tool or respond directly.

```
"Hi" → LLM thinks: "No tool needed" → responds directly
"Weather in Mumbai?" → LLM thinks: "I need web_search" → calls tool, then responds
"Generate an image" → LLM thinks: "I need image_generator" → calls image tool
```

This autonomous decision-making is what makes it an **agent**.

---

## 5. AI Agents — LLMs That Decide What to Do

An **AI Agent** is an LLM that:
1. Receives a goal or question
2. **Decides autonomously** what steps to take
3. Can call tools to gather information or perform actions
4. Produces a final output

```
                   ┌─────────────────────────┐
User Query ──────→ │       AI Agent (LLM)    │ ──────→ Response
                   │                         │
                   │  Decision making:        │
                   │  • Call tool?            │
                   │  • Which tool?           │
                   │  • Respond directly?     │
                   └──────────┬──────────────┘
                              │ (if tool needed)
                              ↓
                   ┌─────────────────────────┐
                   │   Tools (functions)     │
                   │  • web_search()         │
                   │  • image_generator()    │
                   │  • calculator()         │
                   │  • code_executor()      │
                   └─────────────────────────┘
```

### Agentic AI

ChatGPT as a whole is a large **agentic system**. The LLM doesn't just answer — it orchestrates multiple tools and sub-systems to produce the best response.

---

## 6. ChatGPT's Architecture — The Router

ChatGPT's architecture has two main parts:

### Frontend
- The browser UI you see
- Input box where you type
- Message history display
- Nothing intelligent happens here

### Backend
- Where all the logic lives
- Contains LLMs, routing, tools

### The Real-Time Router

When GPT-5 was released, OpenAI introduced a **unified system** with a **real-time router** that automatically selects the right model.

```
User Input
    ↓
┌─────────────────────────────────────────┐
│           Real-Time Router              │
│   (a model trained to route queries)   │
│                                         │
│  "What model should handle this?"       │
│  • Needs reasoning? → Reasoning model  │
│  • Simple response? → Normal model     │
│  • Image needed?    → Image model      │
│  • Needs web data?  → Tool calling     │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       ↓                ↓         ↓
  Normal LLM    Reasoning LLM   Image Model
  (fast, cheap) (slower, deep   (DALL-E or similar)
                 thinking)
```

**Before GPT-5:** Users had to manually select which model to use (GPT-3.5, GPT-4, GPT-4o).
**After GPT-5:** The router handles this automatically.

### What Is the Router?

The router is **not a hardcoded if-else system** — it is itself a model, trained specifically to:
- Understand user intent
- Decide which downstream model or tool should handle the request
- Route efficiently for speed and quality

---

## 7. The Dhaba Analogy

This analogy makes the whole system intuitive:

### The Setup

```
Customer (You) → visits Prakash's Dhaba
Prakash → the smart orchestrator (like the Router)
Maharaj → the chef (like the Normal LLM)
Chotu → the tandoor operator (like the Image Model)
Tamdu → the juice person (like a tool)
Kanchan → errand runner (like web search tool)
```

### The Order Flow

```
Customer: "Palak Paneer, Butter Naan, Apple Juice please"

Prakash (Router):
  → Tells Maharaj: "One Palak Paneer!"        [routes to Normal LLM]
  → Tells Chotu: "Two Butter Naan!"           [routes to another model]
  → Asks Tamdu: "Do you have Apple Juice?"    [calls a tool to check]
  → Tamdu: "No, we're out"
  → Tells Kanchan: "Go get Apple Juice from   [calls external tool/API]
                    the shop next door"

Customer: just relaxes and waits for everything to arrive
```

### The Mapping

| Dhaba | ChatGPT |
|-------|---------|
| Customer | User |
| Prakash (owner) | Router |
| Maharaj (chef) | Normal LLM |
| Chotu (tandoor) | Specialized model (image, code, etc.) |
| Tamdu (juice) | Internal tool |
| Kanchan (errand runner) | External API / web search tool |

**Key insight:** Prakash (Router) takes in one request and delegates to the right person. The customer never needs to coordinate with Maharaj, Chotu, Tamdu, or Kanchan directly — Prakash handles all of that.

ChatGPT works the same way.

---

## 8. Types of Models Inside ChatGPT

### Normal LLM
- Handles everyday conversations and knowledge questions
- Fast and cost-efficient
- Used for: greetings, factual Q&A, writing, summaries

### Reasoning Model
- Used for complex tasks requiring step-by-step thinking
- Slower but more accurate on hard problems
- Used for: math problems, logic puzzles, complex code, multi-step reasoning

### Image Generation Model
- Generates images from text descriptions
- (OpenAI uses DALL-E internally)
- Used for: "Create an image of..."

### How the Router Decides

```
"Hi" → simple greeting → Normal LLM
"Solve this differential equation" → complex math → Reasoning Model
"Draw me a cat in space" → image request → Image Model
"What's the weather in Delhi?" → real-time data → Tool calling → Normal LLM (with result)
```

---

## 9. How to Build Your Own Agent

### Minimal Agent (Conceptual)

```python
from openai import OpenAI

client = OpenAI()

# Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for current information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                }
            }
        }
    }
]

# The agent loop
def run_agent(user_message):
    messages = [{"role": "user", "content": user_message}]
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        tools=tools
    )
    
    # Check if LLM wants to call a tool
    if response.choices[0].message.tool_calls:
        # Execute the tool
        tool_result = execute_tool(response.choices[0].message.tool_calls[0])
        
        # Give result back to LLM for final response
        messages.append({"role": "tool", "content": tool_result})
        final_response = client.chat.completions.create(
            model="gpt-4",
            messages=messages
        )
        return final_response.choices[0].message.content
    else:
        # LLM responded directly (no tool needed)
        return response.choices[0].message.content
```

### Router Pattern (for multi-model systems)

```python
def router(user_message):
    # Ask a small LLM to classify the intent
    intent = classify_intent(user_message)
    
    if intent == "image_generation":
        return image_model.generate(user_message)
    elif intent == "complex_reasoning":
        return reasoning_model.chat(user_message)
    elif intent == "real_time_data":
        data = web_search_tool(user_message)
        return normal_model.chat(f"{user_message}\n\nContext: {data}")
    else:
        return normal_model.chat(user_message)
```

---

## 10. Key Concepts Summary

| Concept | Definition |
|---------|-----------|
| **LLM** | Large Language Model — neural network trained on internet text to generate new text |
| **Generative AI** | AI that generates new content (text, images) rather than just classifying or searching |
| **Tool** | A function the LLM can call to get real-time data or perform actions |
| **Tool Calling** | LLM autonomously deciding to call a function to help answer a query |
| **AI Agent** | An LLM that can make decisions, call tools, and work towards a goal autonomously |
| **Agentic AI** | Systems where AI takes multiple steps and decisions to complete complex tasks |
| **Router** | A model or component that decides which downstream model/tool should handle a request |
| **Router Pattern** | Architectural pattern: one entry point classifies intent and delegates to specialists |
| **Reasoning Model** | LLM specialized for complex thinking — slower but deeper reasoning |
| **Normal Model** | General-purpose LLM for everyday tasks — fast and efficient |
| **Real-time data** | Information that changes constantly (weather, prices) — LLMs need tools to access this |
| **Neural Network** | The mathematical architecture underlying LLMs, loosely inspired by the human brain |
| **Knowledge cutoff** | The date after which an LLM has no training data; needs tools to get newer info |

### Architecture Diagram

```
User Input
    ↓
Frontend (Browser UI)
    ↓ (HTTP request)
Backend
    ↓
Router (LLM-based)
    ↓ decides
    ├──→ Normal LLM ──→ Direct response
    ├──→ Reasoning LLM ──→ Step-by-step response
    ├──→ Image Model ──→ Generated image
    └──→ Tool Calling
              ↓
         ├──→ Web Search API
         ├──→ Code Executor
         └──→ Other External APIs
              ↓
         Result fed back to LLM
              ↓
         Final Response → User
```

---

*Notes compiled for educational purposes. Content based on video tutorial (Hindi).*