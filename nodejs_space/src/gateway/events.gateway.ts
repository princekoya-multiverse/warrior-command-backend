import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export enum WsEvent {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_COMPLETED = 'task.completed',
  SESSION_STARTED = 'session.started',
  SESSION_CLOSED = 'session.closed',
  SESSION_HANDOFF = 'session.handoff',
  AGENT_SPEAKING = 'agent.speaking',
  AGENT_IDLE = 'agent.idle',
  AGENT_STATUS = 'agent.status',
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<string, { userId?: string; rooms: Set<string> }>();

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, { rooms: new Set() });
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { userId?: string; rooms?: string[] }) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData && data.userId) {
      clientData.userId = data.userId;
      client.join(`user:${data.userId}`);
    }
    if (data.rooms) {
      data.rooms.forEach(room => {
        client.join(room);
        clientData?.rooms.add(room);
      });
    }
    return { event: 'joined', data: { rooms: data.rooms } };
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { rooms: string[] }) {
    data.rooms?.forEach(room => {
      client.leave(room);
      this.connectedClients.get(client.id)?.rooms.delete(room);
    });
    return { event: 'left', data: { rooms: data.rooms } };
  }

  // Emit methods for use by services
  emitToAll(event: WsEvent, data: any) {
    this.server?.emit(event, data);
  }

  emitToUser(userId: string, event: WsEvent, data: any) {
    this.server?.to(`user:${userId}`).emit(event, data);
  }

  emitToRoom(room: string, event: WsEvent, data: any) {
    this.server?.to(room).emit(event, data);
  }

  getConnectedCount(): number {
    return this.connectedClients.size;
  }
}
