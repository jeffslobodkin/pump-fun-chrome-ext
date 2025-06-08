import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { CreateTokenParams, TokenCreationResult, PumpFunConfig } from '../types/pumpfun';
import { MetadataService } from './MetadataService';
import deployTx from './DeployTx';

export class PumpFunClient {
  private connection: Connection;
  private config: PumpFunConfig;
  private metadataService: MetadataService;

  constructor(config: PumpFunConfig) {
    this.config = config;
    this.connection = new Connection(config.rpcEndpoint);
    this.metadataService = new MetadataService(config.pinataJwt);
  }

  async createToken(params: CreateTokenParams): Promise<TokenCreationResult> {
    try {
      // Validate metadata
      const validation = this.metadataService.validateMetadata(params.metadata);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Upload image first
      let imageUri: string;
      try {
        imageUri = await this.metadataService.uploadImage(params.image);
        params.metadata.image = imageUri;
      } catch (error) {
        return {
          success: false,
          error: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      // Upload metadata
      let metadataUri: string;
      try {
        metadataUri = await this.metadataService.uploadMetadata(params.metadata);
      } catch (error) {
        return {
          success: false,
          error: `Failed to upload metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      //print uri
      console.log('metadataUri', metadataUri);

      //deploy tx
      const mint = deployTx(params.keypair, params.name, params.symbol, metadataUri);

      // Return success with metadata URI
      return {
        success: true,
        tokenAddress: mint.toString(),
        metadataUri,
        imageUri
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 