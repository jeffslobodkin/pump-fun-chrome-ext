import './popup.css';
import { KeyService } from '../services/KeyService';
import { PumpFunClient } from '../services/PumpFunClient';
import { KeyInput } from './components/KeyInput';
import { MetadataForm } from './components/MetadataForm';
import { StatusDisplay } from './components/StatusDisplay';
import { MetadataService } from '../services/MetadataService';
import { PublicKey } from '@solana/web3.js';

// Initialize services
const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlMmY3YmFkZC0xNWY2LTQ5ZDMtYWRhMC1iYmQ0Mjc1NDM0YmEiLCJlbWFpbCI6Im5mdHByb2plY3QxMzJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjA3N2IyMjRlZjRiY2JjZGJhNGVmIiwic2NvcGVkS2V5U2VjcmV0IjoiZTgyNGVjODY5ZGUxMDNmMWQ2NDg2MDEyZTNkZWYxODg0ZjI5MmJkM2IxODcwMGY5MGZhNjBjMGVlYTEwYTQyNyIsImV4cCI6MTc3OTY2MzA3NH0.uhafc-O71LSPu-80l5HEvZhjRRyPMUqENps6ykFV1Dk';

const keyService = new KeyService();
const metadataService = new MetadataService(PINATA_JWT);
const pumpFunClient = new PumpFunClient({
  programId: new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'),
  network: 'devnet',
  rpcEndpoint: RPC_ENDPOINT,
  pinataJwt: PINATA_JWT
});

document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  const keyInputElement = document.getElementById('key-input');
  const metadataFormElement = document.getElementById('metadata-form');
  const statusDisplayElement = document.getElementById('status-display');

  if (!keyInputElement || !metadataFormElement || !statusDisplayElement) {
    console.error('Required elements not found');
    return;
  }

  const keyInput = new KeyInput(keyInputElement, keyService, (publicKey) => {
    statusDisplay.showInfo(`Key set for address: ${publicKey}`);
  });

  const metadataForm = new MetadataForm(metadataFormElement, metadataService, async (metadata, imageFile) => {
    try {
      if (!keyService.isKeySet()) {
        throw new Error('Please set your private key first');
      }

      // Create token with metadata
      const result = await pumpFunClient.createToken({
        name: metadata.name,
        symbol: metadata.symbol,
        metadata,
        image: imageFile,
        keypair: keyService.getKeypair()
      });

      if (result.success) {
        statusDisplay.showSuccess(`Token created successfully! Address: ${result.tokenAddress}`);
        metadataForm.reset();
      } else {
        statusDisplay.showError(`Failed to create token: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating token:', error);
      statusDisplay.showError(error instanceof Error ? error.message : 'Failed to create token');
    }
  });

  const statusDisplay = new StatusDisplay(statusDisplayElement);

  // Initial status
  statusDisplay.showInfo('Enter your private key to start');
}); 