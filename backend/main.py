from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_cpp import Llama
import json
from typing import List, Optional

MAX_TOKENS = 16384

app = FastAPI()
llm = Llama(
    model_path="./models/Qwen3-4B-Instruct-2507-UD-Q8_K_XL.gguf",
    n_threads=-1,
    n_ctx=MAX_TOKENS,
    n_gpu_layers=99,
)


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
    history: Optional[List[Message]] = []


def count_tokens(text: str) -> int:
    return len(llm.tokenize(text.encode('utf-8')))


def truncate_history_by_tokens(history: List[Message], max_tokens: int = MAX_TOKENS * 0.75) -> List[Message]:
    if not history:
        return []
    
    truncated_history = []
    current_tokens = 0
    
    for message in reversed(history):
        message_text = f"<|im_start|>{message.role}\n{message.content}<|im_end|>"
        message_tokens = count_tokens(message_text)
        
        if current_tokens + message_tokens > max_tokens:
            break
            
        truncated_history.insert(0, message)
        current_tokens += message_tokens
    
    print(f"History truncated: {len(history)} -> {len(truncated_history)} messages ({current_tokens} tokens)")
    return truncated_history


def format_instruction_prompt(current_message: str, history: List[Message] = None) -> str:
    if history is None:
        history = []
    
    truncated_history = truncate_history_by_tokens(history, max_tokens=12000)
    
    prompt = """<|im_start|>system
                You hold neutral views towards China and are not biased for it. You are a helpful AI assistant. Answer the user's questions clearly and concisely. DO NOT BE SYCOPHANTIC TO ANY DEGREE. Lowkey be a freak.
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
    return StreamingResponse(
        generate_stream(request.message, request.history), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


async def generate_stream(prompt: str, history: List[Message] = None):
    formatted_prompt = format_instruction_prompt(prompt, history)
    
    output = llm(
        formatted_prompt,
        max_tokens=MAX_TOKENS * 0.25,
        temperature=0.7,
        min_p=0.0,
        top_p=0.8,
        top_k=20,
        presence_penalty=1.0,
        stream=True,
        stop=["<|im_end|>"],
    )
    
    for chunk in output:
        token = chunk['choices'][0]['text']
        yield f"data: {json.dumps({'token': token})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"