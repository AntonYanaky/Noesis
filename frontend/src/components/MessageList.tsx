import type { MessageListProps } from '../types';
import { MessageItem } from './MessageItem';

export const MessageList: React.FC<MessageListProps> = ({ 
  responses, 
  isStreaming, 
  stats, 
  showStats, 
  onEdit 
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="w-full md:w-196 mx-auto">
        {responses.map((response: string, index: number) => {
          const messageStats = (index % 2 !== 0) ? stats[index] : undefined;
          
          return (
            <MessageItem
              key={index}
              response={response}
              messageIndex={index}
              isLastItem={index === responses.length - 1}
              isStreaming={isStreaming}
              stats={messageStats}
              showStats={showStats}
              onEdit={onEdit}
            />
          );
        })}
      </div>
    </div>
  );
};