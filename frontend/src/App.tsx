import { useState } from 'react';

export default function App() {
  const [input, setInput] = useState<string>('');
  const [responses, setResponses] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamMessage = async (message: string) => {
    if (message === "") return;
  
    setResponses(prev => [...prev, input]);
    setInput('');
    setError(null);
    setIsStreaming(true);

    const responseIndex = responses.length + 1;
    setResponses(prev => [...prev, '']);

    const conversationHistory = [];
    for (let i = 0; i < responses.length; i += 2) {
      if (responses[i]) { 
        conversationHistory.push({
          role: "user",
          content: responses[i]
        });
      }
      if (responses[i + 1]) {
        conversationHistory.push({
          role: "assistant", 
          content: responses[i + 1]
        });
      }
    }

    try {
      const response = await fetch('http://localhost:8000/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: message,
          history: conversationHistory
        })
      });

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                setIsStreaming(false);
                return;
              }
              if (data.token) {
                setResponses(prev => {
                const updated = [...prev];
                updated[responseIndex] += data.token;
                return updated;
              });
              }
            } catch (err) {
            }
          }
        }
      }
    } catch (err) {
      setError('Connection failed');
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    streamMessage(input);
  };

  return (
  <div className="h-screen flex flex-col font-mono bg-white">
    <h1 className="text-center text-4xl p-4 font-black uppercase tracking-wider border-b-4 border-black">NOESIS</h1>
    
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="w-196 mx-auto">
        {responses.map((resp, index) => (
          <div key={index} className="mb-4 p-4 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="whitespace-pre-wrap text-black font-mono">
              {resp}
              {/* Show typing indicator for the currently streaming response */}
              {index === responses.length - 1 && isStreaming && (
                <span className="animate-pulse">|</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="border-t-4 border-black bg-white p-4">
      <div className="w-196 mx-auto">
        <form className="relative" onSubmit={handleSubmit}>
          <div className="relative border-4 border-black bg-white">
            <textarea
              placeholder="ENTER TEXT..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && isStreaming === false) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="w-full px-4 py-4 pr-16 bg-white border-none focus:outline-none resize-none overflow-y-auto min-h-[2.5rem] max-h-48 font-mono text-black placeholder-gray-500"
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                const scrollHeight = e.currentTarget.scrollHeight;
                e.currentTarget.style.height = scrollHeight + 'px';
              }}
            />
            <button 
              type="submit"
              disabled={isStreaming}
              className="absolute bottom-2 right-2 w-10 h-10 bg-black text-white font-black text-xl hover:bg-gray-800 disabled:bg-gray-400 border-2 border-black flex items-center justify-center pt-1"
            >
                <span className="translate-y-0.5">{isStreaming ? '...' : '^'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  )
}