from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_cpp import Llama
import json
from typing import List, Optional
import time
import uuid
from dotenv import load_dotenv
import os
import psycopg
from langchain_postgres import PostgresChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage

MAX_TOKENS = 16384

load_dotenv()

app = FastAPI()
llm = Llama(
    model_path="./models/Qwen3-4B-Thinking-2507-UD-Q8_K_XL.gguf",
    n_threads=-1,
    n_ctx=MAX_TOKENS,
    n_gpu_layers=99,
)

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    return psycopg.connect(DATABASE_URL)

def init_db():
    with get_db_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id UUID PRIMARY KEY,
                title TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        PostgresChatMessageHistory.create_tables(conn, "message_store")
        conn.commit()

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class MessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    history: Optional[List[Message]] = []
    temperature: float
    max_tokens: int
    min_p: float
    max_p: float
    top_k: int
    presence_penalty: float

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str

def count_tokens(text: str) -> int:
    return len(llm.tokenize(text.encode('utf-8')))

def get_session_history(conversation_id: str):
    connection = get_db_connection()
    return PostgresChatMessageHistory(
        "message_store",
        conversation_id,
        sync_connection=connection
    )

def create_conversation(title: str = None) -> str:
    conversation_id = str(uuid.uuid4())
    
    if not title:
        title = f"Chat {conversation_id[:8]}"
    
    with get_db_connection() as conn:
        conn.execute(
            "INSERT INTO conversations (id, title) VALUES (%s, %s)",
            (conversation_id, title)
        )
        conn.commit()
    
    return conversation_id

def update_conversation_timestamp(conversation_id: str):
    with get_db_connection() as conn:
        conn.execute(
            "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (conversation_id,)
        )
        conn.commit()

def generate_conversation_title(message: str) -> str:
    title = message.strip()[:50]
    if len(message) > 50:
        title += "..."
    return title

@app.post("/conversations")
async def create_new_conversation():
    conversation_id = create_conversation()
    return {"conversation_id": conversation_id}

@app.get("/conversations")
async def get_conversations():
    with get_db_connection() as conn:
        result = conn.execute("""
            SELECT id, title, created_at, updated_at 
            FROM conversations 
            ORDER BY updated_at DESC
        """).fetchall()
        
        conversations = []
        for row in result:
            conversations.append({
                "id": str(row[0]),
                "title": row[1],
                "created_at": row[2].isoformat(),
                "updated_at": row[3].isoformat()
            })
        
        return conversations

@app.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str):
    history = get_session_history(conversation_id)
    messages = []
    
    for msg in history.messages:
        messages.append({
            "role": "user" if msg.__class__.__name__ == "HumanMessage" else "assistant",
            "content": msg.content
        })
    
    return {"messages": messages}

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    history = get_session_history(conversation_id)
    history.clear()
    
    with get_db_connection() as conn:
        conn.execute("DELETE FROM conversations WHERE id = %s", (conversation_id,))
        conn.commit()
    
    return {"success": True}

def truncate_history_by_tokens(messages, max_tokens: int = MAX_TOKENS * 0.75) -> List:
    if not messages:
        return []
    
    truncated_history = []
    current_tokens = 0
    
    for message in reversed(messages):
        message_text = f"<|im_start|>{message.role}\n{message.content}<|im_end|>"
        message_tokens = count_tokens(message_text)
        
        if current_tokens + message_tokens > max_tokens:
            break
            
        truncated_history.insert(0, message)
        current_tokens += message_tokens
    
    print(f"History truncated: {len(messages)} -> {len(truncated_history)} messages ({current_tokens} tokens)")
    return truncated_history

def format_instruction_prompt(current_message: str, messages=None) -> str:
    if messages is None:
        messages = []
    
    truncated_history = truncate_history_by_tokens(messages, max_tokens=12000)
    
    prompt = """<|im_start|>system
                You are a helpful AI assistant. Answer the user's questions clearly and concisely. 
                DO NOT BE SYCOPHANTIC TO ANY DEGREE.
                You must conclude your response before reaching the end of your allowed token budget. 
                Always finish your current thought or sentence before stopping.
                <|im_end|>"""
    
    for msg in truncated_history:
        if msg.role == "user":
            prompt += f"\n<|im_start|>user\n{msg.content}<|im_end|>"
        elif msg.role == "assistant":
            prompt += f"\n<|im_start|>assistant\n{msg.content}<|im_end|>"
    
    prompt += f"\n<|im_start|>user\n{current_message}<|im_end|>"
    prompt += f"\n<|im_start|>assistant\n"
    
    final_tokens = count_tokens(prompt)
    print(f"Final prompt tokens: {final_tokens}")
    
    return prompt

@app.post("/message")
async def stream_message(request: MessageRequest):
    if not request.conversation_id:
        title = generate_conversation_title(request.message)
        conversation_id = create_conversation(title)
    else:
        conversation_id = request.conversation_id
        update_conversation_timestamp(conversation_id)
    
    return StreamingResponse(
        generate_stream(
            request.message, 
            conversation_id,
            request.temperature, 
            request.max_tokens, 
            request.min_p, 
            request.max_p, 
            request.top_k, 
            request.presence_penalty
        ), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

async def generate_stream(prompt: str, conversation_id: str, temperature: float = 0.7, max_tokens: int = 2000, min_p: float = 0.0, max_p: float = 0.8, top_k: int = 20, presence_penalty: float = 1.0):
    history = get_session_history(conversation_id)
    
    history_messages = []
    for msg in history.messages:
        role = "user" if msg.__class__.__name__ == "HumanMessage" else "assistant"
        history_messages.append(Message(role=role, content=msg.content))
    
    formatted_prompt = format_instruction_prompt(prompt, history_messages)
    num = count_tokens(formatted_prompt)

    available_tokens = MAX_TOKENS - num - 100
    final_max_tokens = min(max_tokens, available_tokens)
    
    if final_max_tokens <= 0:
        raise ValueError(f"Prompt too long ({num} tokens), no room for response")
    
    history.add_message(HumanMessage(content=prompt))
    
    output = llm(
        formatted_prompt,
        max_tokens=final_max_tokens,
        temperature=temperature,
        min_p=min_p,
        top_p=max_p,
        top_k=top_k,
        presence_penalty=presence_penalty,
        stream=True,
        stop=["<|im_end|>"],
    )
    
    start_time = time.time()
    total_tokens = 0
    response_content = ""

    yield f"data: {json.dumps({'conversation_id': conversation_id})}\n\n"

    for chunk in output:
        token = chunk['choices'][0]['text']
        response_content += token
        total_tokens += 1
        yield f"data: {json.dumps({'token': token})}\n\n"

    history.add_message(AIMessage(content=response_content))

    end_time = time.time()
    elapsed_time = end_time - start_time
    
    tokens_per_second = total_tokens / elapsed_time if elapsed_time > 0 else 0
    
    final_stats = {
        'done': True,
        'total_tokens': total_tokens,
        'tokens_per_second': round(tokens_per_second, 2),
        'conversation_id': conversation_id
    }
    
    yield f"data: {json.dumps(final_stats)}\n\n"