

import React, { useEffect, useRef } from 'react';
import { Message, Persona } from '../../types';
import MessageBubble from './MessageBubble';
import SummaryBubble from '../common/SummaryBubble';

interface MessageAreaProps {
  messages: Message[];
  persona: Persona;
  onRetry: (messageId: string) => void;
  onQuotePost: (message: Message) => void;
  onDeleteMessage: (message: Message) => Promise<void>;
  onEditPost: (messageId: string, newText: string) => void;
  onLikePost: (messageId: string) => Promise<void>;
  summary: string | null;
  onDismissSummary: () => void;
}

const MessageArea: React.FC<MessageAreaProps> = ({ messages, persona, onRetry, onQuotePost, onDeleteMessage, onEditPost, onLikePost, summary, onDismissSummary }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, summary]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-adire-pattern">
      {summary && <SummaryBubble summaryText={summary} onDismiss={onDismissSummary} />}
      {messages.map((msg) => (
        <MessageBubble 
            key={msg.id} 
            message={msg} 
            persona={persona} 
            onRetry={onRetry} 
            onQuotePost={onQuotePost}
            onDeleteMessage={onDeleteMessage}
            onEditPost={onEditPost}
            onLikePost={onLikePost}
        />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageArea;