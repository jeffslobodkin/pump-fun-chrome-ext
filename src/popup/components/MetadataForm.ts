import { TokenMetadata, MetadataService } from '../../services/MetadataService';

export class MetadataForm {
  private element: HTMLElement;
  private metadataService: MetadataService;
  private onMetadataSubmit: (metadata: TokenMetadata, imageFile: File) => void;
  private selectedImage: File | null = null;
  private imagePreviewUrl: string | null = null;

  constructor(
    element: HTMLElement,
    metadataService: MetadataService,
    onMetadataSubmit: (metadata: TokenMetadata, imageFile: File) => void
  ) {
    this.element = element;
    this.metadataService = metadataService;
    this.onMetadataSubmit = onMetadataSubmit;
    this.render();
    this.attachEventListeners();
  }

  private render() {
    this.element.innerHTML = `
      <div class="metadata-form">
        <h2>Token Metadata</h2>
        
        <div class="form-group">
          <label for="token-name">Name *</label>
          <input type="text" id="token-name" required placeholder="Enter token name">
        </div>

        <div class="form-group">
          <label for="token-symbol">Symbol *</label>
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
          <input type="url" id="token-twitter" placeholder="https://x.com/your-handle">
        </div>

        <div class="form-group">
          <label for="token-telegram">Telegram</label>
          <input type="url" id="token-telegram" placeholder="https://t.me/your-channel">
        </div>

        <button class="submit-button" id="submit-metadata">Create Token</button>
      </div>
    `;
  }

  private attachEventListeners() {
    const imageInput = this.element.querySelector('#token-image') as HTMLInputElement;
    const submitButton = this.element.querySelector('#submit-metadata') as HTMLButtonElement;

    if (imageInput) {
      imageInput.addEventListener('change', (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          this.handleImageSelect(file);
        }
      });
    }

    if (submitButton) {
      submitButton.addEventListener('click', async () => {
        await this.handleSubmit();
      });
    }
  }

  private handleImageSelect(file: File) {
    this.selectedImage = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrl = e.target?.result as string;
      const previewElement = this.element.querySelector('#image-preview');
      if (previewElement) {
        previewElement.innerHTML = `<img src="${this.imagePreviewUrl}" alt="Preview">`;
      }
    };
    reader.readAsDataURL(file);
  }

  private async handleSubmit() {
    try {
      // Get form values
      const name = (this.element.querySelector('#token-name') as HTMLInputElement).value.trim();
      const symbol = (this.element.querySelector('#token-symbol') as HTMLInputElement).value.trim();
      const description = (this.element.querySelector('#token-description') as HTMLTextAreaElement).value.trim();
      const website = (this.element.querySelector('#token-website') as HTMLInputElement).value.trim();
      const twitter = (this.element.querySelector('#token-twitter') as HTMLInputElement).value.trim();
      const telegram = (this.element.querySelector('#token-telegram') as HTMLInputElement).value.trim();

      // Validate required fields
      if (!name || !symbol || !this.selectedImage) {
        alert('Please fill in all required fields');
        return;
      }

      // Create metadata object
      const metadata: TokenMetadata = {
        name,
        symbol,
        description: description || undefined,
        website: website || undefined,
        twitter: twitter || undefined,
        telegram: telegram || undefined,
      };

      // Validate metadata
      const validation = this.metadataService.validateMetadata(metadata);
      if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return;
      }

      // Upload image first
      const imageUri = await this.metadataService.uploadImage(this.selectedImage);
      metadata.image = imageUri;

      // Upload metadata
      const metadataUri = await this.metadataService.uploadMetadata(metadata);

      // Call the submit callback
      this.onMetadataSubmit(metadata, this.selectedImage!);
    } catch (error) {
      console.error('Error submitting metadata:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit metadata');
    }
  }

  public reset() {
    this.selectedImage = null;
    this.imagePreviewUrl = null;
    this.render();
    this.attachEventListeners();
  }
} 