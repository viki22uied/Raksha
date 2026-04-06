import { getIPFSConfig, isIPFSConfigured } from '../config/ipfs';
import { logger } from '../utils/logger';

export interface IPFSUploadResult {
  cid: string;
  url: string;
  size: number;
}

class IPFSService {
  async uploadBuffer(buffer: Buffer, filename: string): Promise<IPFSUploadResult> {
    if (!isIPFSConfigured()) {
      return this.stubbedUpload(buffer, filename);
    }
    try {
      const config = getIPFSConfig();
      const formData = new FormData();
      formData.append('file', new Blob([buffer]), filename);
      const headers: Record<string, string> = {};
      if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;
      const response = await fetch(`${config.apiUrl}/api/v0/add`, { method: 'POST', headers, body: formData });
      if (!response.ok) throw new Error(`IPFS upload failed: ${response.statusText}`);
      const result = await response.json() as any;
      logger.info(`File uploaded to IPFS: ${result.Hash}`);
      return { cid: result.Hash, url: `${config.apiUrl}/ipfs/${result.Hash}`, size: buffer.length };
    } catch (error) {
      logger.error(error, 'IPFS upload failed');
      return this.stubbedUpload(buffer, filename);
    }
  }

  async fetchByCid(cid: string): Promise<Buffer | null> {
    if (!isIPFSConfigured()) return null;
    try {
      const config = getIPFSConfig();
      const response = await fetch(`${config.apiUrl}/ipfs/${cid}`);
      if (!response.ok) throw new Error(`IPFS fetch failed`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      logger.error(error, `Failed to fetch IPFS file ${cid}`);
      return null;
    }
  }

  private stubbedUpload(buffer: Buffer, filename: string): IPFSUploadResult {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const cid = `Qm${hash.slice(0, 44)}`;
    logger.info(`Stubbed IPFS upload for ${filename}: ${cid}`);
    return { cid, url: `ipfs://${cid}`, size: buffer.length };
  }
}

export const ipfsService = new IPFSService();
