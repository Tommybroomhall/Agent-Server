import React from 'react';
import './MessageBubble.css';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { text, sender, timestamp, mediaUrl } = message;
  const isUser = sender === 'user';
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'agent'}`}>
      {mediaUrl && (
        <div className="message-media">
          <img src={mediaUrl} alt="Media attachment" />
        </div>
      )}
      <div className="message-text">{text}</div>
      <div className="message-timestamp">{formatTime(timestamp)}</div>
    </div>
  );
};

export default MessageBubble;
