// ChatWindow.js
import React, { useEffect, useRef } from 'react';

const ChatWindow = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'bot' ? 'bot' : 'user'} ${
              message.isError ? 'error' : ''
            }`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              {message.audioUrl && (
                <audio controls src={message.audioUrl} className="message-audio" />
              )}
            </div>
            <span className="timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;