import { useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { InputForm } from './components/InputForm';
import type { Message } from './types';

export default function App() {
  const [input, setInput] = useState<string>('');
  const [responses, setResponses] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [tokenAmount, setTokenAmount] = useState(2000);
  const [min_p, setMin_P] = useState(0.00);
  const [top_p, setTop_P] = useState(0.80);
  const [top_k, setTop_K] = useState(20);
  const [presence_penalty, setPresence_Penalty] = useState(1.0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const streamMessage = async (message: string) => {
    if (message === "") return;
  
    setResponses(prev => [...prev, input]);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setError(null);
    setIsStreaming(true);

    const responseIndex = responses.length + 1;
    setResponses(prev => [...prev, '']);

    const conversationHistory: Message[] = [];
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
          history: conversationHistory,
          temperature: temperature,
          max_tokens: tokenAmount,
          min_p: min_p,
          max_p: top_p,
          top_k: top_k,
          presence_penalty: presence_penalty,
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
            } catch (err) {}
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
    <div className="h-screen flex font-mono bg-white relative overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        temperature={temperature}
        setTemperature={setTemperature}
        tokenAmount={tokenAmount}
        setTokenAmount={setTokenAmount}
        min_p={min_p}
        setMin_P={setMin_P}
        top_p={top_p}
        setTop_P={setTop_P}
        top_k={top_k}
        setTop_K={setTop_K}
        presence_penalty={presence_penalty}
        setPresence_Penalty={setPresence_Penalty}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <MessageList 
          responses={responses} 
          isStreaming={isStreaming} 
        />
        
        <InputForm
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          isStreaming={isStreaming}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
}
