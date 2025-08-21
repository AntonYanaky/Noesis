# NOESIS - Local LLM Chat Interface

A modern chat interface for interacting with local Large Language Models using FastAPI and React. Features real-time streaming responses, conversation history management, and customizable generation parameters.

![Chat Interface](images/chat.png)
![Settings Menu](images/menu.png)

## Prerequisites
- Python 3.12+

- Node.js 22.17.0+

- A dedicated GPU (Optional, but performance will be slow on CPU only)

## Instalation

### Database Setup

1. **Install and start PostgreSQL**
2. **Create a database for the application**

```

CREATE DATABASE chatdb;

```

3. **Set up environment variables**
Create a `.env` file in the backend directory:
```

DATABASE_URL=postgresql://username:password@localhost:5432/chatdb

```


### Backend Setup

1. **Clone the repository**
```bash
git clone <repo-url>
cd <repo-name>
```

2. **Create and activate virtual environment**
```bash
python -m venv .venv
source .venv/bin/activate
```

3. **Install Python dependencies**
```bash
pip install fastapi uvicorn llama-cpp-python pydantic
```

4. **Download a model**
   - Create a `models/` directory in the backend root
   - Download any `.gguf` LLM model and place it in the `models/` folder
   - Update the `model_path` in `main.py` to point to your model file

1. **Install dependencies**
```bash
npm install
# or
yarn install
```

## Usage

### Starting the Backend

```bash
fastapi dev main.py
```

The backend will start on `http://localhost:8000` and automatically:
- Initialize the PostgreSQL database tables
- Load your specified LLM model
- Set up CORS for frontend communication


### Starting the Frontend

```bash
npm run dev
# or
yarn dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### POST /message

Streams chat responses using Server-Sent Events with conversation persistence.

**Request Body:**
```

{
"message": "Your question here",
"conversation_id": "optional-uuid-for-existing-conversation",
"history": [
{
"role": "user",
"content": "Previous user message"
},
{
"role": "assistant",
"content": "Previous assistant response"
}
],
"temperature": 0.7,
"max_tokens": 2000,
"min_p": 0.0,
"top_p": 0.8,
"top_k": 20,
"presence_penalty": 1.0
}

```

**Response Stream:**
```

{"conversation_id": "uuid-of-conversation"}
{"token": "response_text"}
{"done": true, "total_tokens": 150, "tokens_per_second": 25.5}

```

### GET /conversations

Returns list of all conversations ordered by last updated.

**Response:**
```

[
{
"id": "conversation-uuid",
"title": "Generated conversation title",
"created_at": "2025-01-01T12:00:00",
"updated_at": "2025-01-01T12:30:00"
}
]

```

### GET /conversations/{conversation_id}/messages

Returns all messages for a specific conversation.

**Response:**
```

{
"messages": [
{
"role": "user",
"content": "User message"
},
{
"role": "assistant",
"content": "Assistant response with <think>thinking process</think> visible text"
}
]
}

```

### POST /conversations

Creates a new conversation.

**Response:**
```

{"conversation_id": "new-uuid"}

```

### DELETE /conversations/{conversation_id}

Deletes a conversation and all its messages.

**Response:**
```

{"success": true}

```

## Configuration

### Model Parameters

Configure your model in `main.py`:

```

llm = Llama(
model_path="./models/your-model.gguf",  \# Update this path
n_threads=-1,
n_ctx=16384,        \# Maximum context length
n_gpu_layers=99,    \# Number of layers to offload to GPU
)

```

### Generation Parameters

All parameters can be adjusted via the frontend sidebar:

- **Temperature**: Controls response creativity (0.0-1.0)
- **Max Tokens**: Maximum tokens to generate per response
- **Min P**: Minimum probability threshold for token selection
- **Top P**: Nucleus sampling parameter (0.0-1.0)
- **Top K**: Top-k sampling parameter (1-100)
- **Presence Penalty**: Reduces repetition (-2.0 to 2.0)

### Database Configuration

The application uses PostgreSQL. The database schema includes:

- `conversations` table for conversation metadata
- `message_store` table for individual messages (managed by LangChain)

## Features in Detail

### Thinking Process Visualization

Models that output `<think>...</think>` tags will have their thinking process displayed in collapsible sections, allowing users to see the AI's reasoning process.

### Message Editing

Users can edit any of their messages, which will:
1. Truncate the conversation at that point
2. Regenerate the assistant's response
3. Update the conversation history

### Performance Metrics

When enabled, the interface shows:
- Total tokens generated
- Generation speed (tokens/second)

### Conversation Management

- Automatic conversation creation on first message
- Auto-generated conversation titles from first message
- Persistent conversation switching
- Conversation deletion with confirmation