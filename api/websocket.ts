import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { insertMessageSchema } from '@shared/schema';
import { z } from 'zod';

interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'reaction' | 'join_room' | 'leave_room';
  data: any;
  userId: string;
  matchId?: string;
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  matchId?: string;
}

export class MessagingWebSocket {
  private wss: WebSocketServer;
  private clients: Map<string, ConnectedClient> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection');
      
      ws.on('message', async (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(ws);
      });
    });
  }

  private async handleMessage(ws: WebSocket, message: WebSocketMessage) {
    const { type, data, userId, matchId } = message;

    switch (type) {
      case 'join_room':
        await this.handleJoinRoom(ws, userId, matchId!);
        break;

      case 'leave_room':
        this.handleLeaveRoom(ws, userId);
        break;

      case 'message':
        await this.handleSendMessage(ws, data, userId, matchId!);
        break;

      case 'typing':
        this.handleTyping(userId, matchId!, data.isTyping);
        break;

      case 'read':
        await this.handleMarkAsRead(data.messageId, userId);
        break;

      case 'reaction':
        await this.handleReaction(data, userId);
        break;

      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Unknown message type' 
        }));
    }
  }

  private async handleJoinRoom(ws: WebSocket, userId: string, matchId: string) {
    // Store client connection
    this.clients.set(userId, { ws, userId, matchId });
    
    // Send recent messages to the user
    try {
      const messages = await storage.getMessages(matchId, 20);
      ws.send(JSON.stringify({
        type: 'message_history',
        data: messages
      }));

      // Notify other users in the room that user joined
      this.broadcastToRoom(matchId, {
        type: 'user_joined',
        data: { userId }
      }, userId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }

  private handleLeaveRoom(ws: WebSocket, userId: string) {
    const client = this.clients.get(userId);
    if (client && client.matchId) {
      this.broadcastToRoom(client.matchId, {
        type: 'user_left',
        data: { userId }
      }, userId);
    }
    this.clients.delete(userId);
  }

  private async handleSendMessage(ws: WebSocket, messageData: any, userId: string, matchId: string) {
    try {
      // Validate message data
      const validatedData = insertMessageSchema.parse({
        ...messageData,
        senderId: userId,
        matchId
      });

      // Save message to database
      const savedMessage = await storage.sendMessage(validatedData);
      
      // Get full message with user data
      const messages = await storage.getMessages(matchId, 1);
      const fullMessage = messages[0];

      // Broadcast to all users in the room
      this.broadcastToRoom(matchId, {
        type: 'new_message',
        data: fullMessage
      });

    } catch (error) {
      console.error('Error sending message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to send message'
      }));
    }
  }

  private handleTyping(userId: string, matchId: string, isTyping: boolean) {
    this.broadcastToRoom(matchId, {
      type: 'typing',
      data: { userId, isTyping }
    }, userId);
  }

  private async handleMarkAsRead(messageId: number, userId: string) {
    try {
      await storage.markMessageAsRead(messageId, userId);
      
      // Notify sender that message was read
      const client = this.clients.get(userId);
      if (client && client.matchId) {
        this.broadcastToRoom(client.matchId, {
          type: 'message_read',
          data: { messageId, userId }
        }, userId);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  private async handleReaction(reactionData: any, userId: string) {
    try {
      const { messageId, reactionType } = reactionData;
      
      if (reactionType) {
        // Add reaction
        await storage.addMessageReaction({
          messageId,
          userId,
          reactionType
        });
      } else {
        // Remove reaction
        await storage.removeMessageReaction(messageId, userId);
      }

      // Get updated reactions
      const reactions = await storage.getMessageReactions(messageId);
      
      // Broadcast updated reactions
      const client = this.clients.get(userId);
      if (client && client.matchId) {
        this.broadcastToRoom(client.matchId, {
          type: 'reaction_updated',
          data: { messageId, reactions }
        });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  }

  private handleDisconnect(ws: WebSocket) {
    // Find and remove client
    for (const [userId, client] of this.clients.entries()) {
      if (client.ws === ws) {
        if (client.matchId) {
          this.broadcastToRoom(client.matchId, {
            type: 'user_left',
            data: { userId }
          }, userId);
        }
        this.clients.delete(userId);
        break;
      }
    }
  }

  private broadcastToRoom(matchId: string, message: any, excludeUserId?: string) {
    for (const [userId, client] of this.clients.entries()) {
      if (client.matchId === matchId && 
          userId !== excludeUserId && 
          client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  }

  // Helper method to get online users in a room
  public getOnlineUsersInRoom(matchId: string): string[] {
    const users: string[] = [];
    for (const [userId, client] of this.clients.entries()) {
      if (client.matchId === matchId) {
        users.push(userId);
      }
    }
    return users;
  }

  // Helper method to send direct message to a specific user
  public sendToUser(userId: string, message: any): boolean {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
}