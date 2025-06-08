export class IPFSService {
  private pinataJwt: string;
  private gatewayUrl: string;

  constructor(pinataJwt: string, gatewayUrl: string = 'https://gateway.pinata.cloud/ipfs/') {
    this.pinataJwt = pinataJwt;
    this.gatewayUrl = gatewayUrl;
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('network', 'public');
      formData.append('name', file.name);

      const response = await fetch('https://uploads.pinata.cloud/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file to IPFS');
      }

      const data = await response.json();
      return this.getIpfsUrl(data.data.cid);
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  async uploadJSON(data: any, name: string): Promise<string> {
    try {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const file = new File([blob], `${name}.json`, { type: 'application/json' });
      return await this.uploadFile(file);
    } catch (error) {
      console.error('JSON upload failed:', error);
      throw error;
    }
  }

  private getIpfsUrl(hash: string): string {
    return `${this.gatewayUrl}${hash}`;
  }
} 