export class StatusDisplay {
  private element: HTMLElement;
  private message: string = '';
  private type: 'success' | 'error' | 'info' = 'info';

  constructor(element: HTMLElement) {
    this.element = element;
    this.render();
  }

  private render() {
    this.element.innerHTML = `
      <div class="status-display ${this.type}">
        <div class="status-message">${this.message}</div>
      </div>
    `;
  }

  public showSuccess(message: string) {
    this.message = message;
    this.type = 'success';
    this.render();
  }

  public showError(message: string) {
    this.message = message;
    this.type = 'error';
    this.render();
  }

  public showInfo(message: string) {
    this.message = message;
    this.type = 'info';
    this.render();
  }

  public clear() {
    this.message = '';
    this.type = 'info';
    this.render();
  }
} 