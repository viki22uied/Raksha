import { env } from './env';
import { logger } from '../utils/logger';

export interface Web3Config {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
}

export const getWeb3Config = (): Web3Config => {
  return {
    rpcUrl: env.ETH_RPC_URL,
    privateKey: env.ETH_PRIVATE_KEY,
    contractAddress: env.ETH_CONTRACT_ADDRESS,
  };
};

export const isWeb3Configured = (): boolean => {
  const configured = !!(env.ETH_RPC_URL && env.ETH_PRIVATE_KEY && env.ETH_CONTRACT_ADDRESS);
  if (!configured) {
    logger.warn('Ethereum/Web3 is not fully configured — blockchain anchoring will be stubbed');
  }
  return configured;
};
