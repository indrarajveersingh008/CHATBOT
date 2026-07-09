from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()
print("API KEY:", os.getenv("OPENROUTER_API_KEY"))
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

app = FastAPI(title="AI Nexus")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

SYSTEM_PROMPT = """
You are AI Nexus, an intelligent AI assistant created by Rajveer Singh.

Be friendly, professional, and helpful.

Never say you are Gemini unless the user specifically asks.

Help with:
- Programming
- AI
- Web Development
- SQL
- Python
- Java
- College studies
- General knowledge
"""

@app.get("/")
def home():
    return {
        "status": "Running",
        "application": "AI Nexus"
    }

@app.post("/chat")
def chat(request: ChatRequest):

    try:

        completion = client.chat.completions.create(
            model="deepseek/deepseek-chat-v3-0324",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ]
        )

        # Print full response to logs
        print(completion.model_dump())

        if not completion.choices:
            return {
                "reply": "⚠️ No response from AI.",
                "debug": completion.model_dump()
            }

        message = completion.choices[0].message

        if message is None:
            return {
                "reply": "⚠️ AI returned an empty message.",
                "debug": completion.model_dump()
            }

        return {
            "reply": message.content
        }

    except Exception as e:
        import traceback
        traceback.print_exc()

        return {
            "reply": "⚠️ Sorry, I couldn't process your request.",
            "error": str(e)
        }