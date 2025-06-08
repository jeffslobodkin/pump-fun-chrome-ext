import { IPFSService } from './IPFSService';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

export class MetadataService {
  private ipfsService: IPFSService;

  constructor(pinataJwt: string) {
    this.ipfsService = new IPFSService(pinataJwt);
  }

  async uploadImage(imageFile: File): Promise<string> {
    try {
      return await this.ipfsService.uploadFile(imageFile);
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  async uploadMetadata(metadata: TokenMetadata): Promise<string> {
    try {
      // Remove optional fields if blank
      ['description', 'website', 'twitter', 'telegram'].forEach((field) => {
        if (!metadata[field as keyof TokenMetadata] || 
            (metadata[field as keyof TokenMetadata] as string).trim() === '') {
          delete metadata[field as keyof TokenMetadata];
        }
      });

      return await this.ipfsService.uploadJSON(metadata, `${metadata.name}-metadata`);
    } catch (error) {
      console.error('Metadata upload failed:', error);
      throw error;
    }
  }

  validateMetadata(metadata: TokenMetadata): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!metadata.name || metadata.name.trim() === '') {
      errors.push('Name is required');
    }

    if (!metadata.symbol || metadata.symbol.trim() === '') {
      errors.push('Symbol is required');
    }

    // Validate social links if provided
    if (metadata.website && !this.isValidUrl(metadata.website)) {
      errors.push('Invalid website URL');
    }

    if (metadata.twitter && !this.isValidTwitterUrl(metadata.twitter)) {
      errors.push('Invalid Twitter URL');
    }

    if (metadata.telegram && !this.isValidTelegramUrl(metadata.telegram)) {
      errors.push('Invalid Telegram URL');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidTwitterUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'twitter.com' || urlObj.hostname === 'x.com';
    } catch {
      return false;
    }
  }

  private isValidTelegramUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 't.me' || urlObj.hostname === 'telegram.me';
    } catch {
      return false;
    }
  }
} 