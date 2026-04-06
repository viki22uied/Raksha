import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/raksha-setu',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  IPFS_API_URL: process.env.IPFS_API_URL || 'http://localhost:5001',
  IPFS_API_KEY: process.env.IPFS_API_KEY || '',
  ETH_RPC_URL: process.env.ETH_RPC_URL || 'http://localhost:8545',
  ETH_PRIVATE_KEY: process.env.ETH_PRIVATE_KEY || '',
  ETH_CONTRACT_ADDRESS: process.env.ETH_CONTRACT_ADDRESS || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  SOS_RATE_LIMIT_WINDOW_MS: parseInt(process.env.SOS_RATE_LIMIT_WINDOW_MS || '60000', 10),
  SOS_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.SOS_RATE_LIMIT_MAX_REQUESTS || '5', 10),
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
