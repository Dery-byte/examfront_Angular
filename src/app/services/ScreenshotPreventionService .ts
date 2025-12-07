// import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class ScreenshotPreventionService {
//   private renderer: Renderer2;
//   private listeners: (() => void)[] = [];
//   private visibilityListener?: () => void;

//   constructor(rendererFactory: RendererFactory2) {
//     this.renderer = rendererFactory.createRenderer(null, null);
//   }

//   enableProtection(): void {
//     // Add watermark overlay
//     this.addWatermarkOverlay();

//     // Prevent common screenshot shortcuts
//     this.preventScreenshotShortcuts();

//     // Detect when window loses focus (possible screenshot)
//     this.detectWindowBlur();

//     // Apply CSS to make content harder to capture
//     this.applyProtectiveStyles();

//     // Prevent right-click context menu
//     this.preventContextMenu();

//     // Monitor for print screen attempts
//     this.monitorPrintScreen();

//     // Detect page visibility changes
//     this.detectVisibilityChange();

//     // Disable developer tools shortcuts
//     this.preventDevTools();
//   }

//   disableProtection(): void {
//     // Remove all event listeners
//     this.listeners.forEach(unlisten => unlisten());
//     this.listeners = [];

//     if (this.visibilityListener) {
//       this.visibilityListener();
//     }

//     // Remove watermark
//     const watermark = document.getElementById('screenshot-watermark');
//     if (watermark) {
//       watermark.remove();
//     }

//     // Remove protective styles
//     document.body.style.userSelect = '';
//     document.body.style.webkitUserSelect = '';
//   }

//   private addWatermarkOverlay(): void {
//     const watermark = this.renderer.createElement('div');
//     this.renderer.setAttribute(watermark, 'id', 'screenshot-watermark');
//     this.renderer.setStyle(watermark, 'position', 'fixed');
//     this.renderer.setStyle(watermark, 'top', '0');
//     this.renderer.setStyle(watermark, 'left', '0');
//     this.renderer.setStyle(watermark, 'width', '100%');
//     this.renderer.setStyle(watermark, 'height', '100%');
//     this.renderer.setStyle(watermark, 'pointer-events', 'none');
//     this.renderer.setStyle(watermark, 'z-index', '9999');
//     this.renderer.setStyle(watermark, 'opacity', '0.1');
//     this.renderer.setStyle(watermark, 'background-image', 
//       `repeating-linear-gradient(
//         45deg,
//         transparent,
//         transparent 100px,
//         rgba(32, 7, 250, 0.1) 100px,
//         rgba(199, 3, 133, 0.1) 200px
//       )`
//     );


    

//     // Add user ID/timestamp to watermark
//     const userId = localStorage.getItem('user') || 'CONFIDENTIAL';

//     const username = this.getUsername();
//     const timestamp = new Date().toISOString();
//     const text = `${username} - ${timestamp}`;
    
//     for (let i = 0; i < 20; i++) {
//       const textElement = this.renderer.createElement('div');
//       this.renderer.setProperty(textElement, 'textContent', text);
//       this.renderer.setStyle(textElement, 'position', 'absolute');
//       this.renderer.setStyle(textElement, 'top', `${Math.random() * 90}%`);
//       this.renderer.setStyle(textElement, 'left', `${Math.random() * 90}%`);
//       this.renderer.setStyle(textElement, 'color', 'red');
//       this.renderer.setStyle(textElement, 'font-size', '12px');
//       this.renderer.setStyle(textElement, 'transform', 'rotate(-45deg)');
//       this.renderer.setStyle(textElement, 'white-space', 'nowrap');
//       this.renderer.appendChild(watermark, textElement);
//     }

//     this.renderer.appendChild(document.body, watermark);
//   }


//   private getUsername(): string {
//     try {
//       const userData = localStorage.getItem('user');
//       if (userData) {
//         const user = JSON.parse(userData);
//         return user.username || 'ANONYMOUS';
//       }
//       return 'ANONYMOUS';
//     } catch (error) {
//       console.error('Error getting username from localStorage:', error);
//       return 'ANONYMOUS';
//     }
//   }

//   private preventScreenshotShortcuts(): void {
//     const listener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
//       // Prevent Print Screen
//       if (event.key === 'PrintScreen') {
//         event.preventDefault();
//         alert('Screenshots are disabled during the quiz!');
//         navigator.clipboard.writeText('');
//       }

//       // Prevent Cmd+Shift+3/4/5 (Mac screenshots)
//       if (event.metaKey && event.shiftKey && ['3', '4', '5'].includes(event.key)) {
//         event.preventDefault();
//         alert('Screenshots are disabled during the quiz!');
//       }

//       // Prevent Windows+Shift+S (Windows Snipping Tool)
//       if (event.metaKey && event.shiftKey && event.key === 's') {
//         event.preventDefault();
//         alert('Screenshots are disabled during the quiz!');
//       }

//       // Prevent Ctrl+Print Screen
//       if (event.ctrlKey && event.key === 'PrintScreen') {
//         event.preventDefault();
//         alert('Screenshots are disabled during the quiz!');
//       }
//     });

//     this.listeners.push(listener);
//   }

//   private detectWindowBlur(): void {
//     const listener = this.renderer.listen('window', 'blur', () => {
//       console.warn('Window lost focus - possible screenshot attempt detected');
//       // You can log this event to your backend for monitoring
//       this.logSuspiciousActivity('Window blur detected');
//     });

//     this.listeners.push(listener);
//   }

//   private applyProtectiveStyles(): void {
//     // Disable text selection
//     this.renderer.setStyle(document.body, 'user-select', 'none');
//     this.renderer.setStyle(document.body, '-webkit-user-select', 'none');
//     this.renderer.setStyle(document.body, '-moz-user-select', 'none');
//     this.renderer.setStyle(document.body, '-ms-user-select', 'none');
//   }

//   private preventContextMenu(): void {
//     const listener = this.renderer.listen('document', 'contextmenu', (event: MouseEvent) => {
//       event.preventDefault();
//       return false;
//     });

//     this.listeners.push(listener);
//   }

//   private monitorPrintScreen(): void {
//     // Monitor clipboard for print screen attempts
//     const listener = this.renderer.listen('window', 'keyup', (event: KeyboardEvent) => {
//       if (event.key === 'PrintScreen') {
//         navigator.clipboard.writeText('Screenshot attempt detected and blocked');
//         this.logSuspiciousActivity('Print screen key pressed');
//       }
//     });

//     this.listeners.push(listener);
//   }

//   private logSuspiciousActivity(activity: string): void {
//     // Send to your backend for monitoring
//     console.warn(`Suspicious activity: ${activity}`);
    
//     // Example API call (implement according to your backend)
//     // this.http.post('/api/log-activity', {
//     //   activity: activity,
//     //   timestamp: new Date().toISOString(),
//     //   userId: localStorage.getItem('userId')
//     // }).subscribe();
//   }

//   private detectVisibilityChange(): void {
//     this.visibilityListener = this.renderer.listen('document', 'visibilitychange', () => {
//       if (document.hidden) {
//         this.logSuspiciousActivity('Page hidden - possible screenshot attempt');
//       }
//     });
//   }

//   private preventDevTools(): void {
//     const listener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent): boolean => {
//       // Prevent F12 (Developer Tools)
//       if (event.key === 'F12') {
//         event.preventDefault();
//         return false;
//       }

//       // Prevent Ctrl+Shift+I (Inspect Element)
//       if (event.ctrlKey && event.shiftKey && event.key === 'I') {
//         event.preventDefault();
//         return false;
//       }

//       // Prevent Ctrl+Shift+C (Inspect Element)
//       if (event.ctrlKey && event.shiftKey && event.key === 'C') {
//         event.preventDefault();
//         return false;
//       }

//       // Prevent Ctrl+Shift+J (Console)
//       if (event.ctrlKey && event.shiftKey && event.key === 'J') {
//         event.preventDefault();
//         return false;
//       }

//       // Prevent Ctrl+U (View Source)
//       if (event.ctrlKey && event.key === 'u') {
//         event.preventDefault();
//         return false;
//       }

//       return true;
//     });

//     this.listeners.push(listener);
//   }
// }



import { Injectable, Renderer2, RendererFactory2, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

interface SecurityEvent {
  type: string;
  timestamp: string;
  userId: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScreenshotPreventionService implements OnDestroy {
  private renderer: Renderer2;
  private listeners: Map<string, () => void> = new Map();
  private isProtectionEnabled = false;
  private watermarkElement?: HTMLElement;
  
  // Configuration
  private readonly config = {
    watermarkOpacity: 0.1,
    watermarkCount: 20,
    enableAlerts: true,
    enableLogging: true,
    watermarkText: (username: string) => `${username} - ${new Date().toISOString().split('T')[0]}`
  };

  constructor(
    private rendererFactory: RendererFactory2,
    private http: HttpClient
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  ngOnDestroy(): void {
    this.disableProtection();
  }

  /**
   * Enable all screenshot protection mechanisms
   */
  enableProtection(): void {
    if (this.isProtectionEnabled) {
      console.warn('Protection is already enabled');
      return;
    }

    try {
      this.addWatermarkOverlay();
      this.preventScreenshotShortcuts();
      this.detectWindowBlur();
      this.applyProtectiveStyles();
      this.preventContextMenu();
      this.monitorPrintScreen();
      this.detectVisibilityChange();
      this.preventDevTools();
      
      this.isProtectionEnabled = true;
      console.info('Screenshot protection enabled successfully');
    } catch (error) {
      console.error('Failed to enable protection:', error);
      this.disableProtection(); // Cleanup on failure
    }
  }

  /**
   * Disable all screenshot protection mechanisms
   */
  disableProtection(): void {
    if (!this.isProtectionEnabled) {
      return;
    }

    // Remove all event listeners
    this.listeners.forEach((unlisten, key) => {
      try {
        unlisten();
      } catch (error) {
        console.error(`Failed to remove listener ${key}:`, error);
      }
    });
    this.listeners.clear();

    // Remove watermark
    this.removeWatermark();

    // Restore original styles
    this.restoreStyles();

    this.isProtectionEnabled = false;
    console.info('Screenshot protection disabled');
  }

  /**
   * Check if protection is currently enabled
   */
  isEnabled(): boolean {
    return this.isProtectionEnabled;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<typeof this.config>): void {
    Object.assign(this.config, config);
    if (this.isProtectionEnabled) {
      // Refresh watermark with new config
      this.removeWatermark();
      this.addWatermarkOverlay();
    }
  }

  private addWatermarkOverlay(): void {
    // Remove existing watermark if any
    this.removeWatermark();

    const watermark = this.renderer.createElement('div');
    this.watermarkElement = watermark;
    
    this.renderer.setAttribute(watermark, 'id', 'screenshot-watermark');
    this.renderer.setStyle(watermark, 'position', 'fixed');
    this.renderer.setStyle(watermark, 'top', '0');
    this.renderer.setStyle(watermark, 'left', '0');
    this.renderer.setStyle(watermark, 'width', '100%');
    this.renderer.setStyle(watermark, 'height', '100%');
    this.renderer.setStyle(watermark, 'pointer-events', 'none');
    this.renderer.setStyle(watermark, 'z-index', '9999');
    this.renderer.setStyle(watermark, 'opacity', String(this.config.watermarkOpacity));
    this.renderer.setStyle(watermark, 'user-select', 'none');
    this.renderer.setStyle(watermark, 'background-image', 
      `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 100px,
        rgba(255, 0, 0, 0.05) 100px,
        rgba(255, 0, 0, 0.05) 200px
      )`
    );

    // Add text watermarks
    const username = this.getUsername();
    const text = this.config.watermarkText(username);
    
    for (let i = 0; i < this.config.watermarkCount; i++) {
      const textElement = this.renderer.createElement('div');
      this.renderer.setProperty(textElement, 'textContent', text);
      this.renderer.setStyle(textElement, 'position', 'absolute');
      this.renderer.setStyle(textElement, 'top', `${(i * 5) % 90}%`);
      this.renderer.setStyle(textElement, 'left', `${(i * 7) % 90}%`);
      this.renderer.setStyle(textElement, 'color', 'rgba(255, 0, 0, 0.3)');
      this.renderer.setStyle(textElement, 'font-size', '14px');
      this.renderer.setStyle(textElement, 'font-weight', 'bold');
      this.renderer.setStyle(textElement, 'transform', `rotate(-45deg)`);
      this.renderer.setStyle(textElement, 'white-space', 'nowrap');
      this.renderer.setStyle(textElement, 'user-select', 'none');
      this.renderer.appendChild(watermark, textElement);
    }

    this.renderer.appendChild(document.body, watermark);
  }

  private removeWatermark(): void {
    if (this.watermarkElement) {
      this.renderer.removeChild(document.body, this.watermarkElement);
      this.watermarkElement = undefined;
    }
  }

  private getUsername(): string {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.username || user.name || 'USER';
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return 'ANONYMOUS';
  }

  private preventScreenshotShortcuts(): void {
    const listener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      let isScreenshotAttempt = false;
      let message = '';

      // Print Screen key
      if (event.key === 'PrintScreen') {
        isScreenshotAttempt = true;
        message = 'Print Screen detected';
      }

      // Mac screenshots (Cmd+Shift+3/4/5)
      if (event.metaKey && event.shiftKey && ['3', '4', '5'].includes(event.key)) {
        isScreenshotAttempt = true;
        message = 'Mac screenshot shortcut detected';
      }

      // Windows Snipping Tool (Win+Shift+S)
      if ((event.metaKey || event.key === 'Meta') && event.shiftKey && event.key.toLowerCase() === 's') {
        isScreenshotAttempt = true;
        message = 'Snipping tool shortcut detected';
      }

      if (isScreenshotAttempt) {
        event.preventDefault();
        event.stopPropagation();
        this.handleScreenshotAttempt(message);
        
        // Clear clipboard
        this.clearClipboard();
      }
    });

    this.listeners.set('screenshot-shortcuts', listener);
  }

  private detectWindowBlur(): void {
    const listener = this.renderer.listen('window', 'blur', () => {
      this.logSecurityEvent('window-blur', 'Window lost focus');
    });

    this.listeners.set('window-blur', listener);
  }

  private applyProtectiveStyles(): void {
    const body = document.body;
    // Store original values
    const originalUserSelect = body.style.userSelect;
    
    this.renderer.setStyle(body, 'user-select', 'none');
    this.renderer.setStyle(body, '-webkit-user-select', 'none');
    this.renderer.setStyle(body, '-moz-user-select', 'none');
    this.renderer.setStyle(body, '-ms-user-select', 'none');
    
    // Store for restoration
    body.dataset['originalUserSelect'] = originalUserSelect;
  }

  private restoreStyles(): void {
    const body = document.body;
    const originalUserSelect = body.dataset['originalUserSelect'] || '';
    
    body.style.userSelect = originalUserSelect;
    (body.style as any).webkitUserSelect = originalUserSelect;
    (body.style as any).MozUserSelect = originalUserSelect;
    (body.style as any).msUserSelect = originalUserSelect;
    
    delete body.dataset['originalUserSelect'];
  }

  private preventContextMenu(): void {
    const listener = this.renderer.listen('document', 'contextmenu', (event: MouseEvent) => {
      event.preventDefault();
      this.logSecurityEvent('context-menu', 'Right-click attempted');
      return false;
    });

    this.listeners.set('context-menu', listener);
  }

  private monitorPrintScreen(): void {
    const listener = this.renderer.listen('window', 'keyup', (event: KeyboardEvent) => {
      if (event.key === 'PrintScreen') {
        this.clearClipboard();
        this.logSecurityEvent('print-screen', 'Print Screen key released');
      }
    });

    this.listeners.set('print-screen-monitor', listener);
  }

  private detectVisibilityChange(): void {
    const listener = this.renderer.listen('document', 'visibilitychange', () => {
      if (document.hidden) {
        this.logSecurityEvent('visibility-change', 'Page hidden');
      }
    });

    this.listeners.set('visibility-change', listener);
  }

  private preventDevTools(): void {
    const listener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      let blocked = false;

      // F12
      if (event.key === 'F12') {
        blocked = true;
      }

      // Ctrl+Shift+I (Inspect)
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') {
        blocked = true;
      }

      // Ctrl+Shift+C (Inspect Element)
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
        blocked = true;
      }

      // Ctrl+Shift+J (Console)
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'j') {
        blocked = true;
      }

      // Ctrl+U (View Source)
      if (event.ctrlKey && event.key.toLowerCase() === 'u') {
        blocked = true;
      }

      // Cmd+Option+I (Mac DevTools)
      if (event.metaKey && event.altKey && event.key.toLowerCase() === 'i') {
        blocked = true;
      }

      // Cmd+Option+J (Mac Console)
      if (event.metaKey && event.altKey && event.key.toLowerCase() === 'j') {
        blocked = true;
      }

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
        this.logSecurityEvent('devtools-attempt', `DevTools shortcut blocked: ${event.key}`);
        return false;
      }

      return true;
    });

    this.listeners.set('devtools-prevention', listener);
  }

  private handleScreenshotAttempt(message: string): void {
    this.logSecurityEvent('screenshot-attempt', message);
    
    if (this.config.enableAlerts) {
      // Use a more user-friendly notification
      this.showNotification('Screenshots are disabled for security reasons');
    }
  }

  private showNotification(message: string): void {
    // Create a custom notification instead of alert
    const notification = this.renderer.createElement('div');
    this.renderer.setStyle(notification, 'position', 'fixed');
    this.renderer.setStyle(notification, 'top', '20px');
    this.renderer.setStyle(notification, 'left', '50%');
    this.renderer.setStyle(notification, 'transform', 'translateX(-50%)');
    this.renderer.setStyle(notification, 'background', 'rgba(220, 53, 69, 0.95)');
    this.renderer.setStyle(notification, 'color', 'white');
    this.renderer.setStyle(notification, 'padding', '16px 24px');
    this.renderer.setStyle(notification, 'border-radius', '8px');
    this.renderer.setStyle(notification, 'z-index', '10000');
    this.renderer.setStyle(notification, 'box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
    this.renderer.setStyle(notification, 'font-size', '14px');
    this.renderer.setStyle(notification, 'font-weight', '500');
    this.renderer.setProperty(notification, 'textContent', message);

    this.renderer.appendChild(document.body, notification);

    // Remove after 3 seconds
    setTimeout(() => {
      this.renderer.removeChild(document.body, notification);
    }, 3000);
  }

  private clearClipboard(): void {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('').catch(err => {
          console.error('Failed to clear clipboard:', err);
        });
      }
    } catch (error) {
      console.error('Clipboard access error:', error);
    }
  }

  private logSecurityEvent(type: string, message: string): void {
    if (!this.config.enableLogging) {
      return;
    }

    console.warn(`[Security Event] ${type}: ${message}`);

    const event: SecurityEvent = {
      type,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      username: this.getUsername()
    };

    // Send to backend (implement based on your API)
    this.http.post('/api/security-events', event)
      .pipe(
        catchError(error => {
          console.error('Failed to log security event:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  private getUserId(): string {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user.userId || 'unknown';
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return 'unknown';
  }
}