import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScreenshotPreventionService {
  private renderer: Renderer2;
  private listeners: (() => void)[] = [];
  private visibilityListener?: () => void;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  enableProtection(): void {
    // Add watermark overlay
    this.addWatermarkOverlay();

    // Prevent common screenshot shortcuts
    this.preventScreenshotShortcuts();

    // Detect when window loses focus (possible screenshot)
    this.detectWindowBlur();

    // Apply CSS to make content harder to capture
    this.applyProtectiveStyles();

    // Prevent right-click context menu
    this.preventContextMenu();

    // Monitor for print screen attempts
    this.monitorPrintScreen();

    // Detect page visibility changes
    this.detectVisibilityChange();

    // Disable developer tools shortcuts
    this.preventDevTools();
  }

  disableProtection(): void {
    // Remove all event listeners
    this.listeners.forEach(unlisten => unlisten());
    this.listeners = [];

    if (this.visibilityListener) {
      this.visibilityListener();
    }

    // Remove watermark
    const watermark = document.getElementById('screenshot-watermark');
    if (watermark) {
      watermark.remove();
    }

    // Remove protective styles
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }

  private addWatermarkOverlay(): void {
    const watermark = this.renderer.createElement('div');
    this.renderer.setAttribute(watermark, 'id', 'screenshot-watermark');
    this.renderer.setStyle(watermark, 'position', 'fixed');
    this.renderer.setStyle(watermark, 'top', '0');
    this.renderer.setStyle(watermark, 'left', '0');
    this.renderer.setStyle(watermark, 'width', '100%');
    this.renderer.setStyle(watermark, 'height', '100%');
    this.renderer.setStyle(watermark, 'pointer-events', 'none');
    this.renderer.setStyle(watermark, 'z-index', '9999');
    this.renderer.setStyle(watermark, 'opacity', '0.1');
    this.renderer.setStyle(watermark, 'background-image', 
      `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 100px,
        rgba(32, 7, 250, 0.1) 100px,
        rgba(199, 3, 133, 0.1) 200px
      )`
    );


    

    // Add user ID/timestamp to watermark
    const userId = localStorage.getItem('user') || 'CONFIDENTIAL';

    const username = this.getUsername();
    const timestamp = new Date().toISOString();
    const text = `${username} - ${timestamp}`;
    
    for (let i = 0; i < 20; i++) {
      const textElement = this.renderer.createElement('div');
      this.renderer.setProperty(textElement, 'textContent', text);
      this.renderer.setStyle(textElement, 'position', 'absolute');
      this.renderer.setStyle(textElement, 'top', `${Math.random() * 90}%`);
      this.renderer.setStyle(textElement, 'left', `${Math.random() * 90}%`);
      this.renderer.setStyle(textElement, 'color', 'red');
      this.renderer.setStyle(textElement, 'font-size', '12px');
      this.renderer.setStyle(textElement, 'transform', 'rotate(-45deg)');
      this.renderer.setStyle(textElement, 'white-space', 'nowrap');
      this.renderer.appendChild(watermark, textElement);
    }

    this.renderer.appendChild(document.body, watermark);
  }


  private getUsername(): string {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.username || 'ANONYMOUS';
      }
      return 'ANONYMOUS';
    } catch (error) {
      console.error('Error getting username from localStorage:', error);
      return 'ANONYMOUS';
    }
  }

  private preventScreenshotShortcuts(): void {
    const listener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      // Prevent Print Screen
      if (event.key === 'PrintScreen') {
        event.preventDefault();
        alert('Screenshots are disabled during the quiz!');
        navigator.clipboard.writeText('');
      }

      // Prevent Cmd+Shift+3/4/5 (Mac screenshots)
      if (event.metaKey && event.shiftKey && ['3', '4', '5'].includes(event.key)) {
        event.preventDefault();
        alert('Screenshots are disabled during the quiz!');
      }

      // Prevent Windows+Shift+S (Windows Snipping Tool)
      if (event.metaKey && event.shiftKey && event.key === 's') {
        event.preventDefault();
        alert('Screenshots are disabled during the quiz!');
      }

      // Prevent Ctrl+Print Screen
      if (event.ctrlKey && event.key === 'PrintScreen') {
        event.preventDefault();
        alert('Screenshots are disabled during the quiz!');
      }
    });

    this.listeners.push(listener);
  }

  private detectWindowBlur(): void {
    const listener = this.renderer.listen('window', 'blur', () => {
      console.warn('Window lost focus - possible screenshot attempt detected');
      // You can log this event to your backend for monitoring
      this.logSuspiciousActivity('Window blur detected');
    });

    this.listeners.push(listener);
  }

  private applyProtectiveStyles(): void {
    // Disable text selection
    this.renderer.setStyle(document.body, 'user-select', 'none');
    this.renderer.setStyle(document.body, '-webkit-user-select', 'none');
    this.renderer.setStyle(document.body, '-moz-user-select', 'none');
    this.renderer.setStyle(document.body, '-ms-user-select', 'none');
  }

  private preventContextMenu(): void {
    const listener = this.renderer.listen('document', 'contextmenu', (event: MouseEvent) => {
      event.preventDefault();
      return false;
    });

    this.listeners.push(listener);
  }

  private monitorPrintScreen(): void {
    // Monitor clipboard for print screen attempts
    const listener = this.renderer.listen('window', 'keyup', (event: KeyboardEvent) => {
      if (event.key === 'PrintScreen') {
        navigator.clipboard.writeText('Screenshot attempt detected and blocked');
        this.logSuspiciousActivity('Print screen key pressed');
      }
    });

    this.listeners.push(listener);
  }

  private logSuspiciousActivity(activity: string): void {
    // Send to your backend for monitoring
    console.warn(`Suspicious activity: ${activity}`);
    
    // Example API call (implement according to your backend)
    // this.http.post('/api/log-activity', {
    //   activity: activity,
    //   timestamp: new Date().toISOString(),
    //   userId: localStorage.getItem('userId')
    // }).subscribe();
  }

  private detectVisibilityChange(): void {
    this.visibilityListener = this.renderer.listen('document', 'visibilitychange', () => {
      if (document.hidden) {
        this.logSuspiciousActivity('Page hidden - possible screenshot attempt');
      }
    });
  }

  private preventDevTools(): void {
    const listener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent): boolean => {
      // Prevent F12 (Developer Tools)
      if (event.key === 'F12') {
        event.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+I (Inspect Element)
      if (event.ctrlKey && event.shiftKey && event.key === 'I') {
        event.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+C (Inspect Element)
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+J (Console)
      if (event.ctrlKey && event.shiftKey && event.key === 'J') {
        event.preventDefault();
        return false;
      }

      // Prevent Ctrl+U (View Source)
      if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
        return false;
      }

      return true;
    });

    this.listeners.push(listener);
  }
}