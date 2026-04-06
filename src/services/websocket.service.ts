import { getIO } from '../config/websocket';
import { logger } from '../utils/logger';

class WebSocketService {
  /**
   * Emit event to all admins.
   */
  emitToAdmin(event: string, data: any): void {
    try {
      const io = getIO();
      io.to('admin').emit(event, data);
    } catch (error) {
      logger.debug(`WebSocket not initialized yet, skipping emit: ${event}`);
    }
  }

  /**
   * Emit event to a specific responder.
   */
  emitToResponder(responderId: string, event: string, data: any): void {
    try {
      const io = getIO();
      io.to(`responder:${responderId}`).emit(event, data);
    } catch (error) {
      logger.debug(`WebSocket not initialized yet, skipping emit: ${event}`);
    }
  }

  /**
   * Emit event to a specific tourist.
   */
  emitToTourist(touristId: string, event: string, data: any): void {
    try {
      const io = getIO();
      io.to(`tourist:${touristId}`).emit(event, data);
    } catch (error) {
      logger.debug(`WebSocket not initialized yet, skipping emit: ${event}`);
    }
  }

  /**
   * Broadcast event to all connected clients.
   */
  broadcast(event: string, data: any): void {
    try {
      const io = getIO();
      io.emit(event, data);
    } catch (error) {
      logger.debug(`WebSocket not initialized yet, skipping broadcast: ${event}`);
    }
  }

  /**
   * Emit to a specific room.
   */
  emitToRoom(room: string, event: string, data: any): void {
    try {
      const io = getIO();
      io.to(room).emit(event, data);
    } catch (error) {
      logger.debug(`WebSocket not initialized yet, skipping emit to room: ${room}`);
    }
  }

  /**
   * Get count of connected clients.
   */
  async getConnectedCount(): Promise<number> {
    try {
      const io = getIO();
      const sockets = await io.fetchSockets();
      return sockets.length;
    } catch {
      return 0;
    }
  }
}

export const websocketService = new WebSocketService();
