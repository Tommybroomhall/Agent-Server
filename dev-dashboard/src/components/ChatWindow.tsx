import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatWindow.css';
import { AgentType, Message, AgentInput, AgentOutput } from '../types';
import MessageBubble from './MessageBubble';
import { getMockMessages } from '../chatMocks/mockMessages';

interface ChatWindowProps {
  agentType: AgentType;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ agentType }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load initial messages when agent type changes
  useEffect(() => {
    // Reset messages and load mock messages for the selected agent
    setMessages(getMockMessages(agentType));
  }, [agentType]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedFile) || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      mediaUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      // Prepare the request payload
      const payload: AgentInput = {
        senderId: 'dev-user-123',
        message: inputText,
        timestamp: new Date().toISOString(),
        agentType,
      };

      // Add media URL if a file is selected
      if (selectedFile) {
        // In a real implementation, we would upload the file to a storage service
        // and use the resulting URL. For now, we'll just use a placeholder.
        payload.mediaUrl = 'https://example.com/media/placeholder.jpg';
      }

      // Send the message to the agent server
      const response = await axios.post<{ success: boolean; data: AgentOutput }>(
        `/agent/${agentType}`,
        payload
      );

      if (response.data.success) {
        // Add the agent's response to the messages
        const agentResponse: Message = {
          id: Date.now().toString(),
          text: response.data.data.reply,
          sender: 'agent',
          timestamp: new Date(),
        };

        setMessages(prevMessages => [...prevMessages, agentResponse]);
      } else {
        // Handle error
        console.error('Error from agent server:', response.data);
        
        // Add an error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: 'Sorry, I encountered an error processing your request.',
          sender: 'agent',
          timestamp: new Date(),
        };

        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add an error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, I encountered an error processing your request.',
        sender: 'agent',
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent</h2>
      </div>
      <div className="chat-messages">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        {selectedFile && (
          <div className="selected-file">
            <span>{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)}>×</button>
          </div>
        )}
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept="image/*"
        />
        <button onClick={triggerFileInput} disabled={isLoading}>
          📎
        </button>
        <button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
