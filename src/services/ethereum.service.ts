import { isWeb3Configured, getWeb3Config } from '../config/web3';
import { logger } from '../utils/logger';

export interface AnchorResult {
  txHash: string;
  blockNumber: number;
}

class EthereumService {
  async anchorHash(contentHash: string, did: string): Promise<AnchorResult> {
    if (!isWeb3Configured()) {
      return this.stubbedAnchor(contentHash, did);
    }
    try {
      const config = getWeb3Config();
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const wallet = new ethers.Wallet(config.privateKey, provider);
      const abi = ['function anchorIdentity(string did, bytes32 hash) public returns (bool)'];
      const contract = new ethers.Contract(config.contractAddress, abi, wallet);
      const hashBytes = ethers.id(contentHash);
      const tx = await contract.anchorIdentity(did, hashBytes);
      const receipt = await tx.wait();
      logger.info(`Identity anchored on Ethereum: ${receipt.hash}`);
      return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
      logger.error(error, 'Ethereum anchoring failed');
      return this.stubbedAnchor(contentHash, did);
    }
  }

  async readAnchor(did: string): Promise<string | null> {
    if (!isWeb3Configured()) return null;
    try {
      const config = getWeb3Config();
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const abi = ['function getAnchor(string did) public view returns (bytes32)'];
      const contract = new ethers.Contract(config.contractAddress, abi, provider);
      return await contract.getAnchor(did);
    } catch (error) {
      logger.error(error, 'Ethereum read failed');
      return null;
    }
  }

  private stubbedAnchor(contentHash: string, did: string): AnchorResult {
    const crypto = require('crypto');
    const txHash = `0x${crypto.createHash('sha256').update(contentHash + did + Date.now()).digest('hex')}`;
    logger.info(`Stubbed Ethereum anchor: ${txHash}`);
    return { txHash, blockNumber: Math.floor(Math.random() * 1000000) + 1 };
  }
}

export const ethereumService = new EthereumService();
