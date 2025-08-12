# NOESIS - Local LLM Chat Interface

A modern chat interface for interacting with local Large Language Models using FastAPI and React. Features real-time streaming responses, conversation history management, and customizable generation parameters.

## Prerequisites
- Python 3.12+

- Node.js 22.17.0+

- A dedicated GPU (Optional, but performance will be slow on CPU only)

## Instalation
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

4. **Download the model**
    - Create a `models/` directory in the project root
    - Download any `.gguf` llm and place it in the `models/` folder

1. **Install Node.js dependencies**
```bash
npm install
# or
yarn install
```

2. **Install required packages**
```bash
npm install react react-dom typescript @types/react @types/react-dom
```

## Usage

### Starting the Backend

```bash
fastapi dev main.py
```

### Starting the Frontend

```bash
npm run dev
# or
yarn dev
```

## API Endpoints

### POST /message

Streams chat responses using Server-Sent Events.

**Request Body:**

```json
{
  "message": "Your question here",
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
  "temperature": 0.7
}
```

**Response:** Stream of JSON chunks:

```json
{"token": "response_text"}
{"done": true}
```

## Configuration

### Model Parameters

The backend supports various configuration options in `main.py`:

- `MAX_TOKENS`: Maximum context length (default: 16384)
- `n_gpu_layers`: Number of layers to offload to GPU (default: 99)
- `temperature`: Controls randomness (0.0-1.0)
- `top_p`: Nucleus sampling parameter
- `top_k`: Top-k sampling parameter


### Frontend Settings

Users can adjust settings via the sidebar:

- **Temperature**: Controls response creativity (0.0-1.0)