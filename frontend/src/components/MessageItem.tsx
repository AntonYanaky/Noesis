import React, { useState, useMemo, memo } from 'react';
import type { MessageItemProps } from '../types';


const _MessageItem: React.FC<MessageItemProps> = ({ response, isStreaming, isLastItem, stats, showStats }) => {
  const [isThinkingOpen, setThinkingOpen] = useState<boolean>(false);

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

  const toggleThinkBlock = () => {
    setThinkingOpen(prev => !prev);
  };

  return (
    <div className="mb-4 p-4 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="font-mono text-black">
        {thinkingText && thinkingText.length > 0 && (
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
        <div className="whitespace-pre-wrap break-words">
          {displayText}
          {isLastItem && isStreaming && <span className="animate-pulse">|</span>}
        </div>

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