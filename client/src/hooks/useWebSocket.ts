import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'reaction' | 'join_room' | 'leave_room';
  data: any;
  userId: string;
  matchId?: string;
}

interface WebSocketHook {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  joinRoom: (matchId: string) => void;
  leaveRoom: () => void;
  messages: any[];
  onlineUsers: string[];
  typingUsers: string[];
}

export function useWebSocket(): WebSocketHook {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const currentRoomRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Re-join room if we were in one
        if (currentRoomRef.current) {
          joinRoom(currentRoomRef.current);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [isAuthenticated, user]);

  const handleMessage = (data: any) => {
    switch (data.type) {
      case 'message_history':
        setMessages(data.data);
        break;
      
      case 'new_message':
        setMessages(prev => [data.data, ...prev]);
        break;
      
      case 'user_joined':
        setOnlineUsers(prev => [...prev, data.data.userId]);
        break;
      
      case 'user_left':
        setOnlineUsers(prev => prev.filter(id => id !== data.data.userId));
        break;
      
      case 'typing':
        const { userId, isTyping } = data.data;
        setTypingUsers(prev => 
          isTyping 
            ? [...prev.filter(id => id !== userId), userId]
            : prev.filter(id => id !== userId)
        );
        break;
      
      case 'message_read':
        setMessages(prev => prev.map(msg => 
          msg.id === data.data.messageId 
            ? { ...msg, isRead: true, readAt: new Date() }
            : msg
        ));
        break;
      
      case 'reaction_updated':
        setMessages(prev => prev.map(msg => 
          msg.id === data.data.messageId 
            ? { ...msg, reactions: data.data.reactions }
            : msg
        ));
        break;
      
      case 'error':
        console.error('WebSocket error:', data.message);
        break;
      
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const joinRoom = useCallback((matchId: string) => {
    if (!user) return;
    
    currentRoomRef.current = matchId;
    sendMessage({
      type: 'join_room',
      data: { matchId },
      userId: user.id,
      matchId
    });
  }, [user, sendMessage]);

  const leaveRoom = useCallback(() => {
    if (!user || !currentRoomRef.current) return;
    
    sendMessage({
      type: 'leave_room',
      data: {},
      userId: user.id,
      matchId: currentRoomRef.current
    });
    
    currentRoomRef.current = null;
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
  }, [user, sendMessage]);

  useEffect(() => {
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
    messages,
    onlineUsers,
    typingUsers
  };
}