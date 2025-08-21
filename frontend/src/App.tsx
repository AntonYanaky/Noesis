import { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { InputForm } from './components/InputForm';
import type { Message, Conversation  } from './types';

export default function App() {
  const [input, setInput] = useState<string>('');
  const [responses, setResponses] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);


  const [temperature, setTemperature] = useState(0.7);
  const [tokenAmount, setTokenAmount] = useState(2000);
  const [min_p, setMin_P] = useState(0.00);
  const [top_p, setTop_P] = useState(0.80);
  const [top_k, setTop_K] = useState(20);
  const [presence_penalty, setPresence_Penalty] = useState(1.0);

  const [stats, setStats] = useState<Record<number, { totalTokens: number; tokensPerSecond: number }>>({});
  const [showStats, setShowStats] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null);


  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await fetch('http://localhost:8000/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch('http://localhost:8000/conversations', {
        method: 'POST',
      });
      const data = await response.json();
      setCurrentConversationId(data.conversation_id);
      setResponses([]);
      setStats({});
      await loadConversations();
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/conversations/${conversationId}/messages`);
      const data = await response.json();
      
      const newResponses: string[] = [];
      data.messages.forEach((msg: Message) => {
        newResponses.push(msg.content);
      });
      
      setCurrentConversationId(conversationId);
      setResponses(newResponses);
      setStats({}); // Reset stats when loading conversation
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await fetch(`http://localhost:8000/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      
      // If we're deleting the current conversation, reset the view
      if (conversationId === currentConversationId) {
        setCurrentConversationId(null);
        setResponses([]);
        setStats({});
      }
      
      await loadConversations();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

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
          conversation_id: currentConversationId,
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
              
              // Handle conversation_id from server
              if (data.conversation_id && !currentConversationId) {
                setCurrentConversationId(data.conversation_id);
                await loadConversations();
              }
              
              if (data.done) {
                setIsStreaming(false);
                if (data.total_tokens !== undefined && data.tokens_per_second !== undefined) {
                  setStats(prev => ({
                    ...prev,
                    [responseIndex]: {
                      totalTokens: data.total_tokens,
                      tokensPerSecond: data.tokens_per_second,
                    }
                  }));
                }
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

 const regenerateResponse = async (message: string, fromIndex: number) => {
    setError(null);
    setIsStreaming(true);
    
    const responseIndex = fromIndex + 1;
    setResponses(prev => [...prev, '']);
    
    const conversationHistory: Message[] = [];
    for (let i = 0; i < fromIndex; i += 2) {
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
                if (data.total_tokens !== undefined && data.tokens_per_second !== undefined) {
                  setStats(prev => ({
                    ...prev,
                    [responseIndex]: {
                      totalTokens: data.total_tokens,
                      tokensPerSecond: data.tokens_per_second,
                    }
                  }));
                }
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

  const handleEditMessage = async (messageIndex: number, newMessage: string) => {
    if (messageIndex % 2 !== 0) return;
    
    const updatedResponses = [...responses];
    updatedResponses[messageIndex] = newMessage;
    
    const truncatedResponses = updatedResponses.slice(0, messageIndex + 1);
    
    setResponses(truncatedResponses);
    
    const updatedStats = { ...stats };
    Object.keys(updatedStats).forEach(key => {
      const index = parseInt(key);
      if (index > messageIndex) {
        delete updatedStats[index];
      }
    });
    setStats(updatedStats);
    
    await regenerateResponse(newMessage, messageIndex);
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
        conversations={conversations}
        currentConversationId={currentConversationId}
        onConversationSelect={loadConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
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
        showStats={showStats}
        setShowStats={setShowStats}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <MessageList 
          responses={responses} 
          isStreaming={isStreaming} 
          stats={stats}
          showStats={showStats}
          onEdit={handleEditMessage}
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
