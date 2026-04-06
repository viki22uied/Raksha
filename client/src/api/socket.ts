import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) return this.socket;
    this.socket = io(WS_URL, { transports: ['websocket', 'polling'] });
    this.socket.on('connect', () => console.log('[WS] Connected:', this.socket?.id));
    this.socket.on('disconnect', (reason) => console.log('[WS] Disconnected:', reason));
    return this.socket;
  }

  joinAdmin() { this.socket?.emit('join:admin'); }
  joinResponder(id: string) { this.socket?.emit('join:responder', id); }
  joinTourist(id: string) { this.socket?.emit('join:tourist', id); }

  on(event: string, cb: (data: any) => void) { this.socket?.on(event, cb); }
  off(event: string, cb?: (data: any) => void) { this.socket?.off(event, cb); }

  disconnect() { this.socket?.disconnect(); this.socket = null; }

  get isConnected() { return this.socket?.connected ?? false; }
}

export const socketService = new SocketService();
export default socketService;
