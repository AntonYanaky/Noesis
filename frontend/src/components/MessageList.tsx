import type{ MessageListProps } from '../types';

export const MessageList: React.FC<MessageListProps> = ({ responses, isStreaming }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="w-full md:w-196 mx-auto">
        {responses.map((resp, index) => (
          <div key={index} className="mb-4 p-4 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="break-all text-black font-mono">
              {resp}
              {index === responses.length - 1 && isStreaming && (
                <span className="animate-pulse">|</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};