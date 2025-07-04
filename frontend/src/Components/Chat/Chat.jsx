import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { useChat } from '../../hooks/useChat';
import './Chat.css';
import BACKEND_URL from '../../config';

const Chat = ({ chatType, chatId, chatName, currentUser, groupImage, eventImage, onLeaveGroup }) => {
  const [newMessage, setNewMessage] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [firebaseToken, setFirebaseToken] = useState('');
  const [backendToken, setBackendToken] = useState('');
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get Firebase user directly
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      console.log('[Chat] Firebase user:', user ? { uid: user.uid, email: user.email } : 'null');
      console.log('[Chat] currentUser prop:', currentUser ? { id: currentUser._id, name: currentUser.name } : 'null');
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Use the custom chat hook with Firebase user
  const {
    messages,
    isConnected,
    typingUsers,
    isLoading,
    hasMore,
    isLoadingMore,
    pendingMessages,
    connectionAttempts,
    error,
    sendMessage,
    loadMoreMessages,
    startTyping,
    stopTyping
  } = useChat(chatType, chatId, firebaseUser);

  // Optimized scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  // Save scroll position
  const saveScrollPosition = useCallback(() => {
    if (chatContainerRef.current) {
      setScrollPosition(chatContainerRef.current.scrollTop);
    }
  }, []);

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    if (chatContainerRef.current && scrollPosition > 0) {
      chatContainerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  // Handle scroll for loading more messages
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop } = chatContainerRef.current;
        if (scrollTop === 0 && hasMore && !isLoadingMore) {
          saveScrollPosition();
          loadMoreMessages();
        }
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, isLoadingMore, saveScrollPosition, loadMoreMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage.sender?._id === currentUser?._id;
      const isNearBottom = chatContainerRef.current && 
        (chatContainerRef.current.scrollHeight - chatContainerRef.current.scrollTop - chatContainerRef.current.clientHeight) < 100;
      
      if (isOwnMessage || isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages, currentUser, scrollToBottom]);

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (!isLoadingMore && scrollPosition > 0) {
      restoreScrollPosition();
    }
  }, [isLoadingMore, restoreScrollPosition]);

  useEffect(() => {
    const getTokens = async () => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          setFirebaseToken(token?.slice(0, 10));
        } else {
          setFirebaseToken('');
        }
        const backend = localStorage.getItem('token');
        setBackendToken(backend ? backend.slice(0, 10) : '');
      } catch (error) {
        console.error('[Chat] Error getting tokens:', error);
        setFirebaseToken('ERROR');
        setBackendToken('ERROR');
      }
    };
    getTokens();
  }, [firebaseUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please wait for connection to be established before sending messages.');
      return;
    }
    sendMessage(newMessage);
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (isConnected) {
      startTyping();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      if (!firebaseUser) {
        console.error('No Firebase user available for file upload');
        return;
      }

      const token = await firebaseUser.getIdToken();

      const response = await axios.post(
        `${BACKEND_URL}/api/users/upload-image`,
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

  const handleLeaveChat = async () => {
    setShowLeaveAlert(true);
  };

  const confirmLeaveChat = async () => {
    setIsLeaving(true);
    
    try {
      // Use backend JWT token instead of Firebase token for backend API calls
      const backendToken = localStorage.getItem('token');
      
      if (!backendToken) {
        console.error('No backend token available for leaving chat');
        alert('Authentication error. Please log in again.');
        return;
      }
      
      // Call backend API to leave the chat/group
      if (chatType === 'group') {
        await axios.post(
          `${BACKEND_URL}/api/groups/${chatId}/leave`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${backendToken}`
            }
          }
        );
        
        // Call the callback to update parent component state
        if (onLeaveGroup) {
          onLeaveGroup();
        }
      }

      // Don't navigate away, just close the alert
      setShowLeaveAlert(false);
    } catch (error) {
      console.error('Error leaving chat:', error);
      if (error.response?.status === 403) {
        alert('You are not authorized to leave this group. Please contact the group administrator.');
      } else if (error.response?.status === 404) {
        alert('Group not found. It may have been deleted.');
      } else {
        alert('Failed to leave chat. Please try again.');
      }
    } finally {
      setIsLeaving(false);
    }
  };

  const cancelLeaveChat = () => {
    setShowLeaveAlert(false);
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
    const isOwnMessage = message.sender?._id === currentUser?._id || message.sender?.uid === firebaseUser?.uid;
    const showDate = index === 0 || 
      formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);
    const isPending = message.isPending || pendingMessages.has(message._id);

    return (
      <div key={message._id}>
        {showDate && (
          <div className="date-divider">
            <span>{formatDate(message.createdAt)}</span>
          </div>
        )}
        <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'} ${isPending ? 'pending' : ''}`}>
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
              <div className="message-time">
                {formatTime(message.createdAt)}
                {isPending && <span className="pending-indicator">⏳</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!firebaseUser) {
    return <div className="chat-loading">Please log in to use chat.</div>;
  }

  if (isLoading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container bokeh-bg">
      <div className="chat-header">
        <div className="chat-header-left">
          <img
            src={groupImage || eventImage || '/default-group-avatar.png'}
            alt={chatName || 'Group'}
            className="chat-group-avatar"
            onError={(e) => {
              e.target.src = '/default-group-avatar.png';
            }}
          />
          <div className="chat-group-info">
            <h3 className="chat-group-name">{chatName || 'Chat'}</h3>
            <div className="chat-online-status">
              <span className="online-dot"></span>
              {isConnected ? 'Online' : 'Offline'}
              {connectionAttempts > 0 && !isConnected && (
                <span> (Reconnecting...)</span>
              )}
            </div>
          </div>
        </div>
        
        <button className="leave-chat-btn" onClick={handleLeaveChat}>
          Leave Chat
        </button>
      </div>

      {showLeaveAlert && (
        <div className="alert-overlay">
          <div className="alert-modal">
            <div className="alert-icon">⚠️</div>
            <h3 className="alert-title">Leave Chat</h3>
            <p className="alert-message">
              Are you sure you want to leave this chat? You won't be able to send messages or see updates from this group.
            </p>
            <div className="alert-buttons">
              <button 
                className="alert-btn alert-btn-cancel" 
                onClick={cancelLeaveChat}
                disabled={isLeaving}
              >
                Cancel
              </button>
              <button 
                className="alert-btn alert-btn-confirm" 
                onClick={confirmLeaveChat}
                disabled={isLeaving}
              >
                {isLeaving ? 'Leaving...' : 'Leave Chat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="error-retry"
          >
            Retry
          </button>
        </div>
      )}

      <div className="messages-container" ref={chatContainerRef}>
        {isLoadingMore && (
          <div className="loading-more">Loading more messages...</div>
        )}
        
        {messages.length === 0 && !isLoading && !error && (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
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
          title={!isConnected ? 'Connect to chat to attach files' : 'Attach file'}
        >
          📎
        </button>
        
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder={!isConnected ? "Connecting to chat..." : "Type a message..."}
          className="message-input"
          disabled={!isConnected}
        />
        
        <button 
          type="submit" 
          className="send-button" 
          disabled={!isConnected || !newMessage.trim()}
          title={!isConnected ? 'Connect to chat to send messages' : 'Send message'}
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export default Chat; 