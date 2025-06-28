import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import './Chat.css';

const Chat = ({ chatType, chatId, chatName, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return;

    // Get JWT token
    user.getIdToken().then(token => {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        
        // Join the specific chat room
        if (chatType === 'group') {
          newSocket.emit('join-group-chat', chatId);
        } else if (chatType === 'event') {
          newSocket.emit('join-event-chat', chatId);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
      });

      newSocket.on('new-group-message', (data) => {
        if (data.groupId === chatId) {
          setMessages(prev => [...prev, data.message]);
          scrollToBottom();
        }
      });

      newSocket.on('new-event-message', (data) => {
        if (data.eventId === chatId) {
          setMessages(prev => [...prev, data.message]);
          scrollToBottom();
        }
      });

      newSocket.on('user-typing', (data) => {
        if (data.userId !== currentUser?.uid) {
          setTypingUsers(prev => {
            const filtered = prev.filter(user => user.userId !== data.userId);
            if (data.isTyping) {
              return [...filtered, { userId: data.userId, userName: data.userName }];
            }
            return filtered;
          });
        }
      });

      newSocket.on('messages-read', (data) => {
        // Update read status for messages
        setMessages(prev => prev.map(msg => {
          if (data.messageIds.includes(msg._id)) {
            const readBy = msg.readBy || [];
            if (!readBy.find(read => read.user === data.userId)) {
              return {
                ...msg,
                readBy: [...readBy, { user: data.userId, readAt: new Date() }]
              };
            }
          }
          return msg;
        }));
      });

      newSocket.on('message-error', (data) => {
        console.error('Message error:', data.error);
        // You can show a toast notification here
      });

      setSocket(newSocket);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [chatId, chatType, currentUser]);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [chatId, chatType]);

  // Load more messages when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop } = chatContainerRef.current;
        if (scrollTop === 0 && hasMore && !isLoadingMore) {
          loadMoreMessages();
        }
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, isLoadingMore]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/chat/messages/${chatType}/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages(response.data.messages);
      setHasMore(response.data.currentPage < response.data.totalPages);
      setPage(response.data.currentPage);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/chat/messages/${chatType}/${chatId}?page=${page + 1}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages(prev => [...response.data.messages, ...prev]);
      setHasMore(response.data.currentPage < response.data.totalPages);
      setPage(response.data.currentPage);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const sendMessage = async (content, messageType = 'text', mediaUrl = null, fileName = null, fileSize = null) => {
    if (!content.trim() && !mediaUrl) return;

    try {
      const messageData = {
        content: content.trim(),
        messageType,
        mediaUrl,
        fileName,
        fileSize
      };

      if (chatType === 'group') {
        messageData.groupId = chatId;
        socket.emit('group-message', messageData);
      } else if (chatType === 'event') {
        messageData.eventId = chatId;
        socket.emit('event-message', messageData);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Emit typing start
    if (socket && isConnected) {
      socket.emit('typing-start', { chatType, chatId });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (socket && isConnected) {
          socket.emit('typing-stop', { chatType, chatId });
        }
      }, 1000);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/users/upload-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      sendMessage('', messageType, response.data.imageUrl, file.name, file.size);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const renderMessage = (message, index) => {
    const isOwnMessage = message.sender?._id === currentUser?.uid || message.sender?.uid === currentUser?.uid;
    const showDate = index === 0 || 
      formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);

    return (
      <div key={message._id}>
        {showDate && (
          <div className="date-divider">
            <span>{formatDate(message.createdAt)}</span>
          </div>
        )}
        <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
          {!isOwnMessage && (
            <div className="message-avatar">
              <img 
                src={message.sender?.profileImage || '/default-avatar.png'} 
                alt={message.sender?.name}
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
          )}
          <div className="message-content">
            {!isOwnMessage && (
              <div className="message-sender">{message.sender?.name}</div>
            )}
            <div className="message-bubble">
              {message.messageType === 'image' ? (
                <img src={message.mediaUrl} alt="Shared image" className="message-image" />
              ) : message.messageType === 'file' ? (
                <div className="message-file">
                  <div className="file-icon">📎</div>
                  <div className="file-info">
                    <div className="file-name">{message.fileName}</div>
                    <div className="file-size">{(message.fileSize / 1024).toFixed(1)} KB</div>
                  </div>
                  <a href={message.mediaUrl} download className="file-download">⬇</a>
                </div>
              ) : (
                <div className="message-text">
                  {message.content}
                  {message.isEdited && <span className="edited-indicator"> (edited)</span>}
                </div>
              )}
              <div className="message-time">{formatTime(message.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{chatName}</h3>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="messages-container" ref={chatContainerRef}>
        {isLoadingMore && (
          <div className="loading-more">Loading more messages...</div>
        )}
        
        {messages.map((message, index) => renderMessage(message, index))}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.map(user => user.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-input-container">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.txt"
          style={{ display: 'none' }}
        />
        
        <button
          type="button"
          className="attach-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!isConnected}
        >
          📎
        </button>
        
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="message-input"
          disabled={!isConnected}
        />
        
        <button type="submit" className="send-button" disabled={!isConnected || !newMessage.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default Chat; 