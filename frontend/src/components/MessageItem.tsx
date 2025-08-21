import React, { useState, useMemo, memo } from 'react';
import type { MessageItemProps } from '../types';

const _MessageItem: React.FC<MessageItemProps> = ({ 
  response, 
  isStreaming, 
  isLastItem, 
  stats, 
  showStats,
  messageIndex,
  onEdit
}) => {
  const [isThinkingOpen, setThinkingOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedMessage, setEditedMessage] = useState<string>('');
  
  const isUserMessage = messageIndex % 2 === 0;

  const { displayText, thinkingText } = useMemo(() => {
    const thinkStartTag = '<think>';
    const thinkEndTag = '</think>';
    const startIdx = response.indexOf(thinkStartTag);
    const endIdx = response.indexOf(thinkEndTag);

    if (startIdx === -1) {
      return { displayText: response, thinkingText: null };
    }

    const parsedThinkingText =
      endIdx !== -1
        ? response.substring(startIdx + thinkStartTag.length, endIdx)
        : response.substring(startIdx + thinkStartTag.length);

    const parsedDisplayText =
      endIdx !== -1
        ? response.substring(0, startIdx) + response.substring(endIdx + thinkEndTag.length)
        : response.substring(0, startIdx);

    const thinkingText = parsedThinkingText.trim();
    const displayText = parsedDisplayText.trim();

    return { displayText, thinkingText };
  }, [response]);

  const handleEdit = () => {
    if (!isUserMessage) return;
    setEditedMessage(displayText);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmedMessage = editedMessage.trim();
    
    // Check if there's actually a change
    if (!trimmedMessage || trimmedMessage === displayText) {
      setIsEditing(false);
      return;
    }

    if (onEdit) {
      onEdit(messageIndex, trimmedMessage);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  const toggleThinkBlock = () => {
    setThinkingOpen(prev => !prev);
  };

  const isShortText = displayText.length < 100 && displayText.split('\n').length <= 2;

  return (
    <div className={`mb-4 p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
      isUserMessage ? 'group' : 'bg-white'
    }`}>
      <div className="font-mono text-black">
        {!isUserMessage && thinkingText && thinkingText.length > 0 && (
          <div className="mb-0">
            <button onClick={toggleThinkBlock} className="p-0 mb-2 text-black">
              <span>Thinking </span>
              <span className="ml-1">{isThinkingOpen ? '▲' : '▼'}</span>
            </button>
            {isThinkingOpen && (
              <div className="whitespace-pre-wrap break-words mb-2">{thinkingText}</div>
            )}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                const length = e.target.value.length;
                e.target.setSelectionRange(length, length);
              }}
              className="w-full p-2 border-4 border-black resize-none min-h-[50px] font-mono outline-none focus:outline-none"
              autoFocus
              placeholder="Press Enter to save & regenerate, Shift+Enter for new line"
            />
            <div className="flex space-x-2">
              <button 
                onClick={handleSaveEdit}
                className="px-3 py-1 border-4 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono"
                disabled={!editedMessage.trim()}
              >
                Save & Regenerate
              </button>
              <button 
                onClick={handleCancelEdit}
                className="px-3 py-1 border-4 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={`flex gap-2 ${isShortText ? 'items-center' : 'items-start'}`}>
            <div className="whitespace-pre-wrap break-words flex-1">
              {displayText}
              {isLastItem && isStreaming && <span className="animate-pulse">|</span>}
            </div>
            {isUserMessage && (
              <div className={`${isShortText ? '' : 'sticky top-4'}`}>
                <button 
                  onClick={handleEdit}
                  className="w-12 h-12 bg-black text-white cursor-pointer hover:bg-gray-800 border-4 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  disabled={isStreaming}
                  title="Edit message"
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" 
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {(stats && showStats) && (
          <div className="mt-2 pt-2 border-t border-black text-xs text-black">
            <span>{stats.totalTokens} tokens</span>
            <span className="mx-2">|</span>
            <span>{stats.tokensPerSecond.toFixed(2)} tok/s</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const MessageItem = memo(_MessageItem);