import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './ChatRoom.css';
import { api } from './api/client';

const ChatRoom = ({ requestId, currentUserEmail }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!requestId) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/api/v1/chat/${requestId}/history`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchHistory();
  }, [requestId]);

  useEffect(() => {
    if (!requestId) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS('http://54.79.113.204:8080/ws', null, {}),
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      client.subscribe(`/topic/chat/${requestId}`, (message) => {
        if (message.body) {
          const parsedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, parsedMessage]);
        }
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('Broker error: ' + frame.headers['message']);
      console.error('Details: ' + frame.body);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [requestId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && stompClientRef.current && isConnected) {
      // Maps targeting parameters straight into variables context destination 
      stompClientRef.current.publish({
        destination: `/app/chat/${requestId}/${currentUserEmail}/send`,
        body: JSON.stringify({ content: inputMessage }),
      });
      setInputMessage('');
    }
  };

  return (
    <div className="chat-container shadow-lg d-flex flex-column">
      <div className="chat-header p-3 text-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-3 chat-avatar">
            <i className="bi bi-airplane-fill"></i>
          </div>
          <div>
            <h5 className="mb-0 fw-bold">Trip Discussion</h5>
            <small className="opacity-75">
              {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
            </small>
          </div>
        </div>
      </div>

      <div className="chat-body p-4 flex-grow-1 overflow-auto">
        {messages.length === 0 ? (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
            <i className="bi bi-chat-dots display-1 mb-3"></i>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine =
              msg.senderName?.trim().toLowerCase() ===
              currentUserEmail?.trim().toLowerCase() || 
              msg.senderId?.toString() === currentUserEmail?.trim().toLowerCase();

            return (
              <div
                key={index}
                className={`message-wrapper d-flex mb-3 ${
                  isMine ? 'justify-content-end' : 'justify-content-start'
                }`}
              >
                <div
                  className={`message-bubble p-3 shadow-sm ${
                    isMine
                      ? 'message-mine bg-primary text-white'
                      : 'message-theirs bg-white'
                  }`}
                >
                  <div className="small fw-bold opacity-75 mb-1">
                    <span>{isMine ? 'You' : msg.senderName}</span>
                  </div>
                  <div className="message-content">{msg.content}</div>
                  <div
                    className={`message-timestamp small mt-1 text-end ${
                      isMine ? 'text-white-50' : 'text-muted'
                    }`}
                  >
                    {new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer p-3 bg-white border-top">
        <form onSubmit={sendMessage} className="input-group">
          <input
            type="text"
            className="form-control rounded-pill bg-light border-0 ps-4 pe-4 py-2 shadow-none"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="btn btn-primary rounded-circle ms-2 send-btn d-flex align-items-center justify-content-center shadow-sm"
            disabled={!isConnected || !inputMessage.trim()}
          >
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;