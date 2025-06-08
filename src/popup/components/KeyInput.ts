import { KeyService } from '../../services/KeyService';

export class KeyInput {
  private element: HTMLElement;
  private keyService: KeyService;
  private onKeySet: (publicKey: string) => void;

  constructor(element: HTMLElement, keyService: KeyService, onKeySet: (publicKey: string) => void) {
    this.element = element;
    this.keyService = keyService;
    this.onKeySet = onKeySet;
    this.render();
    this.attachEventListeners();
  }

  private render() {
    const isKeySet = this.keyService.isKeySet();
    
    this.element.innerHTML = `
      <div class="key-input">
        <div class="key-status">
          Status: <span class="status">${isKeySet ? 'Key Set' : 'No Key Set'}</span>
        </div>
        ${isKeySet ? `
          <div class="key-info">
            Public Key: <span class="public-key">${this.keyService.getPublicKey()}</span>
          </div>
          <button class="clear-key-button">Clear Key</button>
        ` : `
          <div class="key-form">
            <input type="password" class="private-key-input" placeholder="Enter your private key">
            <button class="set-key-button">Set Key</button>
          </div>
        `}
      </div>
    `;
  }

  private attachEventListeners() {
    const setKeyButton = this.element.querySelector('.set-key-button');
    const clearKeyButton = this.element.querySelector('.clear-key-button');
    const privateKeyInput = this.element.querySelector('.private-key-input') as HTMLInputElement;

    if (setKeyButton && privateKeyInput) {
      setKeyButton.addEventListener('click', () => {
        try {
          const privateKey = privateKeyInput.value.trim();
          if (!privateKey) {
            throw new Error('Please enter a private key');
          }
          
          this.keyService.setPrivateKey(privateKey);
          privateKeyInput.value = '';
          this.render();
          this.attachEventListeners();
          this.onKeySet(this.keyService.getPublicKey());
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Failed to set private key');
        }
      });
    }

    if (clearKeyButton) {
      clearKeyButton.addEventListener('click', () => {
        this.keyService.clearKey();
        this.render();
        this.attachEventListeners();
      });
    }
  }

  public updateStatus() {
    this.render();
    this.attachEventListeners();
  }
} 