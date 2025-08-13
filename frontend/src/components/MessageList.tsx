// MessageList.tsx
import type { MessageListProps } from '../types';
import { MessageItem } from './MessageItem';

export const MessageList: React.FC<MessageListProps> = ({ responses, isStreaming }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="w-full md:w-196 mx-auto">
        {responses.map((response, index) => (
          <MessageItem
            key={index}
            response={response}
            isLastItem={index === responses.length - 1}
            isStreaming={isStreaming}
          />
        ))}
      </div>
    </div>
  );
};