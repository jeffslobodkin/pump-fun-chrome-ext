import { PublicKey, Keypair } from '@solana/web3.js';
import { TokenMetadata } from '../services/MetadataService';

export interface PumpFunConfig {
  programId: PublicKey;
  network: string;
  rpcEndpoint: string;
  pinataJwt: string;
}

export interface CreateTokenParams {
  name: string;
  symbol: string;
  metadata: TokenMetadata;
  image: File;
  keypair: Keypair;
}

export interface TokenCreationResult {
  success: boolean;
  tokenAddress?: string;
  metadataUri?: string;
  imageUri?: string;
  error?: string;
} 

export interface DeployData {
  name: string;
  symbol: string;
  uri: string;
  creator: PublicKey;
}