import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth, authenticatedFetch } from "@/hooks/useAuth";
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Heart, Smile, ThumbsUp, ArrowLeft, Users, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/layout/header';

interface Match {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  };
  averageRating: number;
  isOnline: boolean;
}

interface Message {
  id: number;
  matchId: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageType: 'text' | 'image' | 'emoji';
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  };
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  };
  reactions?: Array<{
    id: number;
    userId: string;
    reactionType: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function Messages() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [location, setLocation] = useLocation();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    isConnected, 
    sendMessage, 
    joinRoom, 
    leaveRoom, 
    messages, 
    onlineUsers, 
    typingUsers 
  } = useWebSocket();

  // Get user's matches
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/matches'],
    queryFn: async () => {
      const response = await authenticatedFetch('/api/matches');
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      return response.json();
    },
    enabled: isAuthenticated && !authLoading,
  });

  // Get unread message count
  const { data: unreadCount = { count: 0 } } = useQuery({
    queryKey: ['/api/unread-count'],
    queryFn: async () => {
      const response = await authenticatedFetch('/api/unread-count');
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      return response.json();
    },
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return await authenticatedFetch('/api/messages', messageData);
    },
    onSuccess: (data) => {
      setNewMessage('');
      // WebSocket will handle real-time updates
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest('PUT', `/api/messages/${messageId}/read`, {});
    },
  });

  // Handle match selection
  const handleMatchSelect = (matchId: string) => {
    if (selectedMatch) {
      leaveRoom();
    }
    setSelectedMatch(matchId);
    joinRoom(matchId);
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMatch || !user) return;

    const messageData = {
      matchId: selectedMatch,
      recipientId: matches.find((m: Match) => m.id === selectedMatch)?.user.id,
      content: newMessage.trim(),
      messageType: 'text',
    };

    // Send via WebSocket for real-time delivery
    sendMessage({
      type: 'message',
      data: messageData,
      userId: user.id,
      matchId: selectedMatch,
    });

    // Also send via API as backup
    sendMessageMutation.mutate(messageData);
  };

  // Handle typing indicator
  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!selectedMatch || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      sendMessage({
        type: 'typing',
        data: { isTyping: true },
        userId: user.id,
        matchId: selectedMatch,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendMessage({
        type: 'typing',
        data: { isTyping: false },
        userId: user.id,
        matchId: selectedMatch,
      });
    }, 1000);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (selectedMatch && user) {
      const unreadMessages = messages.filter(msg => 
        msg.recipientId === user.id && !msg.isRead
      );
      
      unreadMessages.forEach(msg => {
        markAsReadMutation.mutate(msg.id);
        sendMessage({
          type: 'read',
          data: { messageId: msg.id },
          userId: user.id,
          matchId: selectedMatch,
        });
      });
    }
  }, [selectedMatch, messages, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (selectedMatch) {
        leaveRoom();
      }
    };
  }, []);

  const selectedMatchData = matches.find((m: Match) => m.id === selectedMatch);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header/>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Matches List */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Messages
                  {unreadCount.count > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount.count}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {matchesLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : matches.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun match pour le moment</p>
                      <Link to="/discover">
                        <Button className="mt-4">
                          Découvrir des profils
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    matches.map((match: Match) => (
                      <div
                        key={match.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b ${
                          selectedMatch === match.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleMatchSelect(match.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={match.user.profileImageUrl} />
                              <AvatarFallback>
                                {match.user.firstName[0]}
                              </AvatarFallback>
                            </Avatar>
                            {onlineUsers.includes(match.user.id) && (
                              <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 fill-current" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {match.user.firstName} {match.user.lastName}
                              </h3>
                              {match.averageRating && (
                                <Badge variant="secondary">
                                  {match.averageRating}/5
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {onlineUsers.includes(match.user.id) ? 'En ligne' : 'Hors ligne'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedMatch ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMatch(null)}
                      className="md:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedMatchData?.user.profileImageUrl} />
                      <AvatarFallback>
                        {selectedMatchData?.user.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {selectedMatchData?.user.firstName} {selectedMatchData?.user.lastName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Circle className={`h-2 w-2 ${onlineUsers.includes(selectedMatchData?.user.id || '') ? 'text-green-500 fill-current' : 'text-gray-400'}`} />
                        {onlineUsers.includes(selectedMatchData?.user.id || '') ? 'En ligne' : 'Hors ligne'}
                        {!isConnected && (
                          <Badge variant="destructive">Déconnecté</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages.map((message: Message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                              <span>
                                {formatDistanceToNow(new Date(message.createdAt), { 
                                  addSuffix: true, 
                                  locale: fr 
                                })}
                              </span>
                              {message.senderId === user?.id && (
                                <span className="ml-2">
                                  {message.isRead ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Typing indicator */}
                      {typingUsers.filter(userId => userId !== user?.id).length > 0 && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-1">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                {selectedMatchData?.user.firstName} tape...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => handleTyping(e.target.value)}
                        placeholder="Tapez votre message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choisissez un match pour commencer à discuter
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
}