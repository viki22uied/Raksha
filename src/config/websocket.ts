import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './env';
import { logger } from '../utils/logger';

let io: SocketIOServer | null = null;

export const initWebSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on('join:admin', () => {
      socket.join('admin');
      logger.debug(`Socket ${socket.id} joined admin room`);
    });

    socket.on('join:responder', (responderId: string) => {
      socket.join(`responder:${responderId}`);
      logger.debug(`Socket ${socket.id} joined responder room: ${responderId}`);
    });

    socket.on('join:tourist', (touristId: string) => {
      socket.join(`tourist:${touristId}`);
      logger.debug(`Socket ${socket.id} joined tourist room: ${touristId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('WebSocket server not initialized. Call initWebSocket first.');
  }
  return io;
};
