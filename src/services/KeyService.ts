import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export class KeyService {
  private keypair: Keypair | null = null;

  setPrivateKey(privateKey: string): void {
    try {
      // Decode the private key from base58
      const decodedKey = bs58.decode(privateKey);
      this.keypair = Keypair.fromSecretKey(decodedKey);
    } catch (error) {
      throw new Error('Invalid private key format');
    }
  }

  getKeypair(): Keypair {
    if (!this.keypair) {
      throw new Error('Private key not set');
    }
    return this.keypair;
  }

  getPublicKey(): string {
    if (!this.keypair) {
      throw new Error('Private key not set');
    }
    return this.keypair.publicKey.toString();
  }

  clearKey(): void {
    this.keypair = null;
  }

  isKeySet(): boolean {
    return this.keypair !== null;
  }
} 