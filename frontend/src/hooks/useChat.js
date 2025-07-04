import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { io } from "socket.io-client/dist/socket.io.js";
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import BACKEND_URL from '../config';

export const useChat = (chatType, chatId, currentUser) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);
  const [pendingMessages, setPendingMessages] = useState(new Map());
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const messageCacheRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketInitRef = useRef(false);
  const currentSocketRef = useRef(null);

  // Memoized socket configuration
  const socketConfig = useMemo(() => ({
    auth: { token: null },
    transports: ['websocket', 'polling'],
    upgrade: true,
    rememberUpgrade: true,
    timeout: 20000,
    forceNew: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 10,
    autoConnect: false,
    withCredentials: true
  }), []);

  // Optimized message management
  const addMessageOptimistically = useCallback((newMessage) => {
    setMessages(prev => {
      const existingIndex = prev.findIndex(msg => msg._id === newMessage._id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...newMessage };
        return updated;
      }
      return [...prev, newMessage];
    });
  }, []);

  const cacheMessage = useCallback((message) => {
    messageCacheRef.current.set(message._id, message);
    if (messageCacheRef.current.size > 1000) {
      const firstKey = messageCacheRef.current.keys().next().value;
      messageCacheRef.current.delete(firstKey);
    }
  }, []);

  const getCachedMessage = useCallback((messageId) => {
    return messageCacheRef.current.get(messageId);
  }, []);

  // Socket connection management
  const connectSocket = useCallback(async () => {
    const auth = getAuth();
    // Wait for Firebase Auth to initialize and user to be available
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          console.log('[useChat] No authenticated user found');
          setError('Please log in to use chat');
          unsubscribe();
          resolve(null);
          return;
        }
        try {
          const token = await user.getIdToken(true); // force refresh
          const backendUrl = BACKEND_URL;
          console.log('[useChat] VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
          console.log('[useChat] Connecting to backend at:', backendUrl);
          console.log('[useChat] FIREBASE TOKEN (first 10):', token?.slice(0, 10));
          console.log('[useChat] USER UID:', user.uid, 'EMAIL:', user.email);
          console.log('[useChat] About to create socket.io connection...');
          
          const newSocket = io(backendUrl, {
            transports: ['websocket', 'polling'],
            upgrade: true,
            rememberUpgrade: true,
            timeout: 20000,
            forceNew: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            maxReconnectionAttempts: 10,
            autoConnect: false,
            withCredentials: true,
            auth: { token }
          });
          
          console.log('[useChat] Socket.io instance created, setting up event listeners...');
          
          newSocket.on('connect', () => {
            console.log('[useChat] ✅ Socket connected successfully! ID:', newSocket.id);
            setIsConnected(true);
            setError(null);
            socketInitRef.current = false; // Reset flag on successful connection
            // Clear any connection timeout since we're now connected
            if (window.connectionTimeout) {
              clearTimeout(window.connectionTimeout);
              window.connectionTimeout = null;
            }
            // JOIN THE CHAT ROOM IMMEDIATELY
            if (chatType === 'group') {
              newSocket.emit('join-group-chat', chatId);
            } else if (chatType === 'event') {
              newSocket.emit('join-event-chat', chatId);
            }
          });
          
          newSocket.on('disconnect', (reason) => {
            console.log('[useChat] ❌ Socket disconnected. Reason:', reason);
            setIsConnected(false);
          });
          
          newSocket.on('connect_error', (err) => {
            console.error('[useChat] ❌ Socket connect error:', err);
            console.error('[useChat] Error details:', {
              message: err.message,
              type: err.type,
              description: err.description,
              context: err.context
            });
            setError(`Connection failed: ${err.message}`);
            setIsConnected(false);
          });
          
          newSocket.on('error', (err) => {
            console.error('[useChat] ❌ Socket general error:', err);
          });
          
          newSocket.on('reconnect', (attemptNumber) => {
            console.log('[useChat] 🔄 Socket reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            setError(null);
          });
          
          newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log('[useChat] 🔄 Socket reconnect attempt:', attemptNumber);
            setConnectionAttempts(attemptNumber);
          });
          
          newSocket.on('reconnect_error', (err) => {
            console.error('[useChat] ❌ Socket reconnect error:', err);
          });
          
          newSocket.on('reconnect_failed', () => {
            console.error('[useChat] ❌ Socket reconnect failed after all attempts');
            setError('Failed to reconnect to chat server');
          });
          
          console.log('[useChat] Event listeners set up, attempting to connect...');
          
          // Store socket globally for manual testing
          window.debugSocket = newSocket;
          
          // Explicitly connect the socket
          console.log('[useChat] 🔌 Explicitly calling socket.connect()...');
          newSocket.connect();
          
          // Set up socket event handlers for real-time updates
          console.log('[useChat] 🎧 Setting up socket event handlers...');
          
          // Handle incoming group messages
          newSocket.on('new-group-message', (data) => {
            const realMsg = data.message;
            if (realMsg && data.groupId === chatId) {
              setMessages(prev => {
                // If there's an optimistic message with the same tempId, replace it
                const idx = prev.findIndex(m => m.tempId && realMsg.tempId && m.tempId === realMsg.tempId);
                if (idx !== -1) {
                  const updated = [...prev];
                  updated[idx] = { ...realMsg, isPending: false };
                  return updated;
                }
                // Otherwise, add the new message if it doesn't already exist
                if (!prev.some(m => m._id === realMsg._id)) {
                  return [...prev, realMsg];
                }
                return prev;
              });
              cacheMessage(realMsg);
            }
          });
          
          // Handle incoming event messages
          newSocket.on('new-event-message', (data) => {
            const realMsg = data.message;
            if (realMsg && data.eventId === chatId) {
              setMessages(prev => {
                // If there's an optimistic message with the same tempId, replace it
                const idx = prev.findIndex(m => m.tempId && realMsg.tempId && m.tempId === realMsg.tempId);
                if (idx !== -1) {
                  const updated = [...prev];
                  updated[idx] = { ...realMsg, isPending: false };
                  return updated;
                }
                // Otherwise, add the new message if it doesn't already exist
                if (!prev.some(m => m._id === realMsg._id)) {
                  return [...prev, realMsg];
                }
                return prev;
              });
              cacheMessage(realMsg);
            }
          });
          
          // Handle message confirmation (replace optimistic message with real one)
          newSocket.on('message-sent', (data) => {
            console.log('[useChat] ✅ Message sent confirmation:', data);
            setMessages(prev => 
              prev.map(msg => 
                msg.tempId === data.tempId ? { ...msg, _id: data.messageId, isPending: false } : msg
              )
            );
            setPendingMessages(prev => {
              const newMap = new Map(prev);
              newMap.delete(data.tempId);
              return newMap;
            });
          });
          
          // Handle typing indicators
          newSocket.on('user-typing', (data) => {
            console.log('[useChat] ⌨️ User typing:', data);
            if (data.isTyping) {
              setTypingUsers(prev => {
                const existing = prev.find(u => u.userId === data.userId);
                if (existing) return prev;
                return [...prev, { userId: data.userId, userName: data.userName }];
              });
            } else {
              setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
            }
          });
          
          // Handle message updates (edit, delete, reactions)
          newSocket.on('message-edited', (data) => {
            console.log('[useChat] ✏️ Message edited:', data);
            if (data.message && 
                ((data.chatType === 'group' && data.chatId === chatId) || 
                 (data.chatType === 'event' && data.chatId === chatId))) {
              setMessages(prev => 
                prev.map(msg => 
                  msg._id === data.message._id ? { ...msg, ...data.message } : msg
                )
              );
              cacheMessage(data.message);
            }
          });
          
          // Handle message deletion
          newSocket.on('message-deleted', (data) => {
            console.log('[useChat] 🗑️ Message deleted:', data);
            if ((data.chatType === 'group' && data.chatId === chatId) || 
                (data.chatType === 'event' && data.chatId === chatId)) {
              setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
            }
          });
          
          // Handle message errors
          newSocket.on('message-error', (data) => {
            console.error('[useChat] ❌ Message error:', data);
            setMessages(prev => 
              prev.map(msg => 
                msg.tempId === data.tempId ? { ...msg, isPending: false, error: data.error } : msg
              )
            );
            setPendingMessages(prev => {
              const newMap = new Map(prev);
              newMap.delete(data.tempId);
              return newMap;
            });
          });
          
          // Listen for all events to debug what's being received
          // Note: onAny might not be available in all Socket.IO versions
          // newSocket.onAny((eventName, ...args) => {
          //   console.log('[useChat] 🔍 Received socket event:', eventName, args);
          // });
          
          // Test socket events after a short delay
          setTimeout(() => {
            if (newSocket.connected) {
              console.log('[useChat] 🧪 Testing socket events...');
              // Emit a test event to see if the socket is working
              newSocket.emit('test-event', { message: 'Test from client', timestamp: Date.now() });
            }
          }, 2000);
          
          unsubscribe();
          resolve(newSocket);
        } catch (error) {
          console.error('[useChat] Error connecting to socket:', error);
          setError('Failed to connect to chat server');
          unsubscribe();
          resolve(null);
        }
      });
    });
  }, [chatType, chatId, currentUser, connectionAttempts, messageQueue, cacheMessage, addMessageOptimistically]);

  // Initialize socket connection
  useEffect(() => {
    let newSocket = null;
    let connectionTimeout = null;

    const initSocket = async () => {
      // Prevent multiple socket initializations
      if (socketInitRef.current) {
        console.log('[useChat] ⚠️ Socket initialization already in progress, skipping...');
        return;
      }
      
      // Clean up existing socket if any
      if (currentSocketRef.current) {
        console.log('[useChat] 🧹 Disconnecting existing socket...');
        currentSocketRef.current.disconnect();
        currentSocketRef.current = null;
      }
      
      console.log('[useChat] 🚀 Starting socket initialization...');
      socketInitRef.current = true;
      
      newSocket = await connectSocket();
      if (newSocket) {
        console.log('[useChat] 📡 Socket created, setting in state...');
        currentSocketRef.current = newSocket;
        setSocket(newSocket);
        
        // Set a timeout to detect if socket never connects
        connectionTimeout = setTimeout(() => {
          if (newSocket && !newSocket.connected) {
            console.error('[useChat] ⏰ Socket connection timeout - socket never connected');
            setError('Socket connection timeout. Please refresh the page.');
          }
        }, 15000); // 15 second timeout
        
        // Store timeout globally for cleanup
        window.connectionTimeout = connectionTimeout;
      } else {
        console.error('[useChat] ❌ Failed to create socket');
        setError('Failed to create socket connection');
        socketInitRef.current = false;
      }
    };

    initSocket();

    return () => {
      console.log('[useChat] 🧹 Cleaning up socket initialization...');
      socketInitRef.current = false;
      
      if (newSocket) {
        newSocket.disconnect();
      }
      if (currentSocketRef.current) {
        currentSocketRef.current.disconnect();
        currentSocketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (window.connectionTimeout) {
        clearTimeout(window.connectionTimeout);
        window.connectionTimeout = null;
      }
    };
  }, [connectSocket]);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError('Please log in to load messages');
        setIsLoading(false);
        return;
      }
      
      const token = await user.getIdToken();
      const backendUrl = BACKEND_URL;
      
      console.log('Loading messages from:', `${backendUrl}/api/chat/messages/${chatType}/${chatId}`);
      
      const response = await axios.get(
        `${backendUrl}/api/chat/messages/${chatType}/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const loadedMessages = response.data.messages;
      loadedMessages.forEach(msg => cacheMessage(msg));
      
      setMessages(loadedMessages);
      setHasMore(response.data.currentPage < response.data.totalPages);
      setPage(response.data.currentPage);
      
      // Mark messages as read
      if (loadedMessages.length > 0 && socket && isConnected) {
        const unreadMessages = loadedMessages.filter(msg => 
          msg.sender?._id !== currentUser?._id && 
          !msg.readBy?.some(read => read.user === currentUser?._id)
        );
        
        if (unreadMessages.length > 0) {
          const messageIds = unreadMessages.map(msg => msg._id);
          socket.emit('mark-read', {
            chatType,
            chatId,
            messageIds
          });
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You may not have permission to view this chat.');
      } else if (error.response?.status === 404) {
        setError('Chat not found.');
      } else {
        setError('Failed to load messages. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [chatType, chatId, currentUser, socket, isConnected, cacheMessage]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError('Please log in to load messages');
        setIsLoadingMore(false);
        return;
      }
      
      const token = await user.getIdToken();
      const backendUrl = BACKEND_URL;
      
      const response = await axios.get(
        `${backendUrl}/api/chat/messages/${chatType}/${chatId}?page=${page + 1}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newMessages = response.data.messages;
      newMessages.forEach(msg => cacheMessage(msg));
      
      setMessages(prev => [...newMessages, ...prev]);
      setHasMore(response.data.currentPage < response.data.totalPages);
      setPage(response.data.currentPage);
    } catch (error) {
      console.error('Error loading more messages:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to load more messages. Please try again.');
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatType, chatId, page, hasMore, isLoadingMore, cacheMessage]);

  // Send message
  const sendMessage = useCallback(async (content, messageType = 'text', mediaUrl = null, fileName = null, fileSize = null) => {
    if (!content.trim() && !mediaUrl) {
      console.log('Empty message, not sending');
      return;
    }

    if (!currentUser) {
      console.error('No current user, cannot send message');
      setError('Please log in to send messages');
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const messageData = {
      content: content.trim(),
      messageType,
      mediaUrl,
      fileName,
      fileSize,
      tempId
    };

    if (chatType === 'group') {
      messageData.groupId = chatId;
    } else if (chatType === 'event') {
      messageData.eventId = chatId;
    }

    // Optimistic update
    const optimisticMessage = {
      _id: tempId,
      content: content.trim(),
      messageType,
      mediaUrl,
      fileName,
      fileSize,
      sender: currentUser,
      chatType,
      chatId,
      createdAt: new Date(),
      isPending: true
    };

    addMessageOptimistically(optimisticMessage);
    setPendingMessages(prev => new Map(prev).set(tempId, optimisticMessage));

    // Send message
    if (socket && isConnected) {
      console.log('Sending message via socket:', messageData);
      socket.emit(chatType === 'group' ? 'group-message' : 'event-message', messageData);
    } else {
      console.log('Socket not connected, queuing message:', messageData);
      setMessageQueue(prev => [...prev, messageData]);
      setError('Message queued. Will send when connected.');
    }

    return tempId;
  }, [chatType, chatId, currentUser, socket, isConnected, addMessageOptimistically]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (socket && isConnected && !isTyping) {
      setIsTyping(true);
      socket.emit('typing-start', { chatType, chatId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        if (socket && isConnected) {
          setIsTyping(false);
          socket.emit('typing-stop', { chatType, chatId });
        }
      }, 1000);
    }
  }, [socket, isConnected, isTyping, chatType, chatId]);

  const stopTyping = useCallback(() => {
    if (socket && isConnected && isTyping) {
      setIsTyping(false);
      socket.emit('typing-stop', { chatType, chatId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [socket, isConnected, isTyping, chatType, chatId]);

  // Message actions
  const editMessage = useCallback(async (messageId, content) => {
    if (socket && isConnected) {
      socket.emit('edit-message', {
        messageId,
        content,
        chatType,
        chatId
      });
    }
  }, [socket, isConnected, chatType, chatId]);

  const deleteMessage = useCallback(async (messageId) => {
    if (socket && isConnected) {
      socket.emit('delete-message', {
        messageId,
        chatType,
        chatId
      });
    }
  }, [socket, isConnected, chatType, chatId]);

  const addReaction = useCallback(async (messageId, emoji) => {
    if (socket && isConnected) {
      socket.emit('add-reaction', {
        messageId,
        emoji,
        chatType,
        chatId
      });
    }
  }, [socket, isConnected, chatType, chatId]);

  const removeReaction = useCallback(async (messageId) => {
    if (socket && isConnected) {
      socket.emit('remove-reaction', {
        messageId,
        chatType,
        chatId
      });
    }
  }, [socket, isConnected, chatType, chatId]);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Manual test function for debugging
  const manualTestConnection = useCallback(async () => {
    console.log('[useChat] 🧪 Manual connection test started...');
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('[useChat] ❌ No Firebase user found for manual test');
      return;
    }
    
    try {
      const token = await user.getIdToken(true);
      console.log('[useChat] 🔑 Manual test - Firebase token (first 10):', token?.slice(0, 10));
      
      const backendUrl = BACKEND_URL;
      console.log('[useChat] 🌐 Manual test - Backend URL:', backendUrl);
      
      // Test REST API first
      console.log('[useChat] 🧪 Testing REST API connection...');
      const response = await fetch(`${backendUrl}/api/chat/messages/${chatType}/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        console.log('[useChat] ✅ REST API test successful');
      } else {
        console.error('[useChat] ❌ REST API test failed:', response.status, response.statusText);
      }
      
      // Test Socket.IO connection
      console.log('[useChat] 🧪 Testing Socket.IO connection...');
      const testSocket = io(backendUrl, {
        transports: ['websocket'],
        auth: { token },
        timeout: 10000
      });
      
      testSocket.on('connect', () => {
        console.log('[useChat] ✅ Manual Socket.IO test successful! ID:', testSocket.id);
        
        // Join the chat room
        if (chatType === 'group') {
          testSocket.emit('join-group-chat', chatId);
        } else if (chatType === 'event') {
          testSocket.emit('join-event-chat', chatId);
        }
        
        // Test sending a message
        console.log('[useChat] 🧪 Testing message sending...');
        testSocket.emit(chatType === 'group' ? 'group-message' : 'event-message', {
          content: 'Test message from manual test',
          chatType,
          chatId: chatId,
          tempId: 'test_' + Date.now()
        });
        
        // Listen for the response
        testSocket.on('new-group-message', (data) => {
          console.log('[useChat] ✅ Received new group message:', data);
        });
        
        testSocket.on('new-event-message', (data) => {
          console.log('[useChat] ✅ Received new event message:', data);
        });
        
        testSocket.on('message-sent', (data) => {
          console.log('[useChat] ✅ Message sent confirmation:', data);
        });
        
        // Clean up after 5 seconds
        setTimeout(() => {
          console.log('[useChat] 🧹 Cleaning up manual test socket...');
          testSocket.disconnect();
        }, 5000);
      });
      
      testSocket.on('connect_error', (error) => {
        console.error('[useChat] ❌ Manual Socket.IO test failed:', error);
      });
      
    } catch (error) {
      console.error('[useChat] ❌ Manual test error:', error);
    }
  }, [chatType, chatId]);
  
  // Expose manual test to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.testChatConnection = manualTestConnection;
      console.log('[useChat] 🧪 Manual test function available: window.testChatConnection()');
    }
  }, [manualTestConnection]);

  return {
    messages,
    socket,
    isConnected,
    typingUsers,
    isLoading,
    hasMore,
    isLoadingMore,
    pendingMessages,
    connectionAttempts,
    isTyping,
    error,
    sendMessage,
    loadMoreMessages,
    startTyping,
    stopTyping,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    addMessageOptimistically,
    getCachedMessage,
    manualTestConnection
  };
}; 