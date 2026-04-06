import { env } from './env';
import { logger } from '../utils/logger';

export interface IPFSConfig {
  apiUrl: string;
  apiKey: string;
}

export const getIPFSConfig = (): IPFSConfig => {
  return {
    apiUrl: env.IPFS_API_URL,
    apiKey: env.IPFS_API_KEY,
  };
};

export const isIPFSConfigured = (): boolean => {
  const configured = !!env.IPFS_API_URL;
  if (!configured) {
    logger.warn('IPFS is not configured — document storage will be limited');
  }
  return configured;
};
