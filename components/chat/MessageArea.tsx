

import React, { useEffect, useRef } from 'react';
import { Message, Persona } from '../../types';
import MessageBubble from './MessageBubble';

interface MessageAreaProps {
  messages: Message[];
  persona: Persona;
  onRetry: (messageId: string) => void;
  onQuotePost: (message: Message) => void;
  onDeleteMessage: (message: Message) => Promise<void>;
  onEditPost: (messageId: string, newText: string) => void;
  onLikePost: (messageId: string) => Promise<void>;
}

const MessageArea: React.FC<MessageAreaProps> = ({ messages, persona, onRetry, onQuotePost, onDeleteMessage, onEditPost, onLikePost }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-adire-pattern">
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