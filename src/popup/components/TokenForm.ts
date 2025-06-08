import { PumpFunClient } from '../../services/PumpFunClient';
import { CreateTokenParams } from '../../types/pumpfun';
import { TokenMetadata } from '../../services/MetadataService';
import { Keypair } from '@solana/web3.js';

export class TokenForm {
  private element: HTMLElement;
  private pumpFunClient: PumpFunClient;
  private keypair: Keypair;
  private onSubmitCallback: ((result: { success: boolean; tokenAddress?: string; error?: string }) => void) | null = null;
  private selectedImage: File | null = null;

  constructor(element: HTMLElement, pumpFunClient: PumpFunClient, keypair: Keypair) {
    this.element = element;
    this.pumpFunClient = pumpFunClient;
    this.keypair = keypair;
    this.render();
    this.attachEventListeners();
  }

  private render() {
    this.element.innerHTML = `
      <form class="token-form">
        <div class="form-group">
          <label for="token-name">Token Name *</label>
          <input type="text" id="token-name" required placeholder="Enter token name">
        </div>
        <div class="form-group">
          <label for="token-symbol">Token Symbol *</label>
          <input type="text" id="token-symbol" required placeholder="Enter token symbol">
        </div>
        <div class="form-group">
          <label for="token-description">Description</label>
          <textarea id="token-description" placeholder="Enter token description (optional)"></textarea>
        </div>
        <div class="form-group">
          <label for="token-image">Image *</label>
          <div class="image-upload">
            <input type="file" id="token-image" accept="image/*" required>
            <div class="image-preview" id="image-preview"></div>
          </div>
        </div>
        <div class="form-group">
          <label for="token-website">Website</label>
          <input type="url" id="token-website" placeholder="https://your-website.com">
        </div>
        <div class="form-group">
          <label for="token-twitter">Twitter</label>
          <input type="url" id="token-twitter" placeholder="https://twitter.com/your-handle">
        </div>
        <div class="form-group">
          <label for="token-telegram">Telegram</label>
          <input type="url" id="token-telegram" placeholder="https://t.me/your-channel">
        </div>
        <button type="submit" class="create-button">Create Token</button>
      </form>
    `;
  }

  private attachEventListeners() {
    const form = this.element.querySelector('form');
    const imageInput = this.element.querySelector('#token-image') as HTMLInputElement;

    if (!form || !imageInput) return;

    imageInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handleImageSelect(file);
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const nameInput = this.element.querySelector('#token-name') as HTMLInputElement;
      const symbolInput = this.element.querySelector('#token-symbol') as HTMLInputElement;
      const descriptionInput = this.element.querySelector('#token-description') as HTMLTextAreaElement;
      const websiteInput = this.element.querySelector('#token-website') as HTMLInputElement;
      const twitterInput = this.element.querySelector('#token-twitter') as HTMLInputElement;
      const telegramInput = this.element.querySelector('#token-telegram') as HTMLInputElement;

      if (!nameInput || !symbolInput || !this.selectedImage) {
        alert('Please fill in all required fields');
        return;
      }

      const metadata: TokenMetadata = {
        name: nameInput.value.trim(),
        symbol: symbolInput.value.trim(),
        description: descriptionInput.value.trim() || undefined,
        website: websiteInput.value.trim() || undefined,
        twitter: twitterInput.value.trim() || undefined,
        telegram: telegramInput.value.trim() || undefined
      };

      const params: CreateTokenParams = {
        name: metadata.name,
        symbol: metadata.symbol,
        metadata,
        image: this.selectedImage,
        keypair: this.keypair
      };

      try {
        const result = await this.pumpFunClient.createToken(params);
        if (this.onSubmitCallback) {
          this.onSubmitCallback({
            success: result.success,
            tokenAddress: result.tokenAddress,
            error: result.error
          });
        }
      } catch (error) {
        if (this.onSubmitCallback) {
          this.onSubmitCallback({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create token'
          });
        }
      }
    });
  }

  private handleImageSelect(file: File) {
    this.selectedImage = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewElement = this.element.querySelector('#image-preview');
      if (previewElement) {
        previewElement.innerHTML = `<img src="${e.target?.result}" alt="Preview">`;
      }
    };
    reader.readAsDataURL(file);
  }

  public setOnSubmit(callback: (result: { success: boolean; tokenAddress?: string; error?: string }) => void) {
    this.onSubmitCallback = callback;
  }

  public reset() {
    this.selectedImage = null;
    this.render();
    this.attachEventListeners();
  }
} 