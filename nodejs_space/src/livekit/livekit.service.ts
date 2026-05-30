import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name);
  private readonly livekitUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private isAvailable = false;

  constructor(private readonly config: ConfigService) {
    this.livekitUrl = this.config.get<string>('LIVEKIT_URL') || '';
    this.apiKey = this.config.get<string>('LIVEKIT_API_KEY') || '';
    this.apiSecret = this.config.get<string>('LIVEKIT_API_SECRET') || '';
    this.isAvailable = !!(this.livekitUrl && this.apiKey && this.apiSecret);
    if (!this.isAvailable) {
      this.logger.warn('LiveKit not configured - integration disabled');
    }
  }

  async createRoom(name: string, options?: { emptyTimeout?: number; maxParticipants?: number }) {
    if (!this.isAvailable) {
      return { name, status: 'simulated', message: 'LiveKit not configured' };
    }
    // In production, use livekit-server-sdk to create rooms
    return { name, emptyTimeout: options?.emptyTimeout || 300, maxParticipants: options?.maxParticipants || 10 };
  }

  async generateToken(identity: string, roomName: string, options?: { canPublish?: boolean; canSubscribe?: boolean }) {
    if (!this.isAvailable) {
      return {
        token: 'livekit-not-configured',
        identity,
        roomName,
        message: 'LiveKit not configured - provide LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET',
      };
    }
    // In production, use livekit-server-sdk AccessToken
    return {
      token: `placeholder-token-${identity}-${roomName}`,
      identity,
      roomName,
      url: this.livekitUrl,
    };
  }

  async listRooms() {
    if (!this.isAvailable) return [];
    return [];
  }

  async deleteRoom(name: string) {
    if (!this.isAvailable) return { deleted: false, message: 'LiveKit not configured' };
    return { deleted: true, name };
  }

  getStatus() {
    return {
      available: this.isAvailable,
      url: this.isAvailable ? this.livekitUrl : undefined,
    };
  }
}
