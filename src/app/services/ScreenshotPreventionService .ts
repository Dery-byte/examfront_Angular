// import { Injectable, Renderer2, RendererFactory2, OnDestroy } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { catchError, of } from 'rxjs';

// interface SecurityEvent {
//   type: string;
//   timestamp: string;
//   userId: string;
//   username: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ScreenshotPreventionService implements OnDestroy {
//   private renderer: Renderer2;
//   private listeners: Map<string, () => void> = new Map();
//   private isProtectionEnabled = false;
//   private watermarkElement?: HTMLElement;
//   private fullscreenLockEnabled = false;
//   private focusCheckInterval?: number;
  
//   // Configuration
//   private readonly config = {
//     watermarkOpacity: 0.1,
//     watermarkCount: 20,
//     enableAlerts: true,
//     enableLogging: true,
//     watermarkText: (username: string) => `${username} - ${new Date().toISOString().split('T')[0]}`
//   };

//   constructor(
//     private rendererFactory: RendererFactory2,
//     private http: HttpClient
//   ) {
//     this.renderer = rendererFactory.createRenderer(null, null);
//   }

//   ngOnDestroy(): void {
//     this.disableProtection();
//   }

//   /**
//    * Enable all screenshot protection mechanisms
//    */
//   enableProtection(): void {
//     if (this.isProtectionEnabled) {
//       console.warn('Protection is already enabled');
//       return;
//     }

//     try {
//       this.addWatermarkOverlay();
//       this.preventScreenshotShortcuts();
//       this.enforceFullscreenLock();
//       this.detectWindowBlur();
//       this.applyProtectiveStyles();
//       this.preventContextMenu();
//       this.monitorPrintScreen();
//       this.detectVisibilityChange();
//       this.preventDevTools();
//       this.lockFocus();
      
//       this.isProtectionEnabled = true;
//       console.info('Screenshot protection enabled successfully');
//     } catch (error) {
//       console.error('Failed to enable protection:', error);
//       this.disableProtection(); // Cleanup on failure
//     }
//   }

//   /**
//    * Disable all screenshot protection mechanisms
//    */
//   disableProtection(): void {
//     if (!this.isProtectionEnabled) {
//       return;
//     }

//     // Remove all event listeners
//     this.listeners.forEach((unlisten, key) => {
//       try {
//         unlisten();
//       } catch (error) {
//         console.error(`Failed to remove listener ${key}:`, error);
//       }
//     });
//     this.listeners.clear();

//     // Clear focus check interval
//     if (this.focusCheckInterval) {
//       clearInterval(this.focusCheckInterval);
//       this.focusCheckInterval = undefined;
//     }

//     // Exit fullscreen if active
//     if (this.fullscreenLockEnabled) {
//       this.exitFullscreen();
//     }

//     // Remove watermark
//     this.removeWatermark();

//     // Restore original styles
//     this.restoreStyles();

//     this.isProtectionEnabled = false;
//     console.info('Screenshot protection disabled');
//   }

//   /**
//    * Check if protection is currently enabled
//    */
//   isEnabled(): boolean {
//     return this.isProtectionEnabled;
//   }

//   /**
//    * Update configuration
//    */
//   updateConfig(config: Partial<typeof this.config>): void {
//     Object.assign(this.config, config);
//     if (this.isProtectionEnabled) {
//       // Refresh watermark with new config
//       this.removeWatermark();
//       this.addWatermarkOverlay();
//     }
//   }

//   private addWatermarkOverlay(): void {
//     // Remove existing watermark if any
//     this.removeWatermark();

//     const watermark = this.renderer.createElement('div');
//     this.watermarkElement = watermark;
    
//     this.renderer.setAttribute(watermark, 'id', 'screenshot-watermark');
//     this.renderer.setStyle(watermark, 'position', 'fixed');
//     this.renderer.setStyle(watermark, 'top', '0');
//     this.renderer.setStyle(watermark, 'left', '0');
//     this.renderer.setStyle(watermark, 'width', '100%');
//     this.renderer.setStyle(watermark, 'height', '100%');
//     this.renderer.setStyle(watermark, 'pointer-events', 'none');
//     this.renderer.setStyle(watermark, 'z-index', '9999');
//     this.renderer.setStyle(watermark, 'opacity', String(this.config.watermarkOpacity));
//     this.renderer.setStyle(watermark, 'user-select', 'none');
//     this.renderer.setStyle(watermark, 'background-image', 
//       `repeating-linear-gradient(
//         45deg,
//         transparent,
//         transparent 100px,
//         rgba(255, 0, 0, 0.05) 100px,
//         rgba(255, 0, 0, 0.05) 200px
//       )`
//     );

//     // Add text watermarks
//     const username = this.getUsername();
//     const text = this.config.watermarkText(username);
    
//     for (let i = 0; i < this.config.watermarkCount; i++) {
//       const textElement = this.renderer.createElement('div');
//       this.renderer.setProperty(textElement, 'textContent', text);
//       this.renderer.setStyle(textElement, 'position', 'absolute');
//       this.renderer.setStyle(textElement, 'top', `${(i * 5) % 90}%`);
//       this.renderer.setStyle(textElement, 'left', `${(i * 7) % 90}%`);
//       this.renderer.setStyle(textElement, 'color', 'rgba(255, 0, 0, 0.3)');
//       this.renderer.setStyle(textElement, 'font-size', '14px');
//       this.renderer.setStyle(textElement, 'font-weight', 'bold');
//       this.renderer.setStyle(textElement, 'transform', `rotate(-45deg)`);
//       this.renderer.setStyle(textElement, 'white-space', 'nowrap');
//       this.renderer.setStyle(textElement, 'user-select', 'none');
//       this.renderer.appendChild(watermark, textElement);
//     }

//     this.renderer.appendChild(document.body, watermark);
//   }

//   private removeWatermark(): void {
//     if (this.watermarkElement) {
//       this.renderer.removeChild(document.body, this.watermarkElement);
//       this.watermarkElement = undefined;
//     }
//   }

//   private getUsername(): string {
//     try {
//       const userData = localStorage.getItem('user');
//       if (userData) {
//         const user = JSON.parse(userData);
//         return user.username || user.name || 'USER';
//       }
//     } catch (error) {
//       console.error('Error parsing user data:', error);
//     }
//     return 'ANONYMOUS';
//   }

//   private preventScreenshotShortcuts(): void {
//     const listener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
//       let isScreenshotAttempt = false;
//       let message = '';

//       // Print Screen key
//       if (event.key === 'PrintScreen') {
//         isScreenshotAttempt = true;
//         message = 'Print Screen detected';
//       }

//       // Mac screenshots (Cmd+Shift+3/4/5)
//       if (event.metaKey && event.shiftKey && ['3', '4', '5'].includes(event.key)) {
//         isScreenshotAttempt = true;
//         message = 'Mac screenshot shortcut detected';
//       }

//       // Windows Snipping Tool (Win+Shift+S)
//       if ((event.metaKey || event.key === 'Meta') && event.shiftKey && event.key.toLowerCase() === 's') {
//         isScreenshotAttempt = true;
//         message = 'Snipping tool shortcut detected';
//       }

//       if (isScreenshotAttempt) {
//         event.preventDefault();
//         event.stopPropagation();
//         this.handleScreenshotAttempt(message);
        
//         // Clear clipboard
//         this.clearClipboard();
//       }
//     });

//     this.listeners.set('screenshot-shortcuts', listener);
//   }

//   private detectWindowBlur(): void {
//     const listener = this.renderer.listen('window', 'blur', () => {
//       this.logSecurityEvent('window-blur', 'Window lost focus - attempting to refocus');
//       this.showNotification('⚠️ Please stay on the quiz page');
      
//       // Attempt to refocus the window
//       setTimeout(() => {
//         window.focus();
//       }, 100);
//     });

//     this.listeners.set('window-blur', listener);
//   }

//   private applyProtectiveStyles(): void {
//     const body = document.body;
//     // Store original values
//     const originalUserSelect = body.style.userSelect;
    
//     this.renderer.setStyle(body, 'user-select', 'none');
//     this.renderer.setStyle(body, '-webkit-user-select', 'none');
//     this.renderer.setStyle(body, '-moz-user-select', 'none');
//     this.renderer.setStyle(body, '-ms-user-select', 'none');
    
//     // Store for restoration
//     body.dataset['originalUserSelect'] = originalUserSelect;
//   }

//   private restoreStyles(): void {
//     const body = document.body;
//     const originalUserSelect = body.dataset['originalUserSelect'] || '';
    
//     body.style.userSelect = originalUserSelect;
//     (body.style as any).webkitUserSelect = originalUserSelect;
//     (body.style as any).MozUserSelect = originalUserSelect;
//     (body.style as any).msUserSelect = originalUserSelect;
    
//     delete body.dataset['originalUserSelect'];
//   }

//   private preventContextMenu(): void {
//     const listener = this.renderer.listen('document', 'contextmenu', (event: MouseEvent) => {
//       event.preventDefault();
//       this.logSecurityEvent('context-menu', 'Right-click attempted');
//       return false;
//     });

//     this.listeners.set('context-menu', listener);
//   }

//   private monitorPrintScreen(): void {
//     const listener = this.renderer.listen('window', 'keyup', (event: KeyboardEvent) => {
//       if (event.key === 'PrintScreen') {
//         this.clearClipboard();
//         this.logSecurityEvent('print-screen', 'Print Screen key released');
//       }
//     });

//     this.listeners.set('print-screen-monitor', listener);
//   }

//   private detectVisibilityChange(): void {
//     const listener = this.renderer.listen('document', 'visibilitychange', () => {
//       if (document.hidden) {
//         this.logSecurityEvent('visibility-change', 'Page hidden - user switched tab/app');
        
//         // Show warning when they return
//         const returnListener = this.renderer.listen('document', 'visibilitychange', () => {
//           if (!document.hidden) {
//             this.showNotification('⚠️ Switching tabs/apps is not allowed during the quiz');
//             returnListener(); // Remove this one-time listener
//           }
//         });
//       }
//     });

//     this.listeners.set('visibility-change', listener);
//   }

//   private preventDevTools(): void {
//     const listener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
//       let blocked = false;

//       // F12
//       if (event.key === 'F12') {
//         blocked = true;
//       }

//       // Ctrl+Shift+I (Inspect)
//       if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') {
//         blocked = true;
//       }

//       // Ctrl+Shift+C (Inspect Element)
//       if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
//         blocked = true;
//       }

//       // Ctrl+Shift+J (Console)
//       if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'j') {
//         blocked = true;
//       }

//       // Ctrl+U (View Source)
//       if (event.ctrlKey && event.key.toLowerCase() === 'u') {
//         blocked = true;
//       }

//       // Cmd+Option+I (Mac DevTools)
//       if (event.metaKey && event.altKey && event.key.toLowerCase() === 'i') {
//         blocked = true;
//       }

//       // Cmd+Option+J (Mac Console)
//       if (event.metaKey && event.altKey && event.key.toLowerCase() === 'j') {
//         blocked = true;
//       }

//       if (blocked) {
//         event.preventDefault();
//         event.stopPropagation();
//         this.logSecurityEvent('devtools-attempt', `DevTools shortcut blocked: ${event.key}`);
//         return false;
//       }

//       return true;
//     });

//     this.listeners.set('devtools-prevention', listener);
//   }

//   private handleScreenshotAttempt(message: string): void {
//     this.logSecurityEvent('screenshot-attempt', message);
    
//     if (this.config.enableAlerts) {
//       // Use a more user-friendly notification
//       this.showNotification('Screenshots are disabled for security reasons');
//     }
//   }

//   private showNotification(message: string): void {
//     // Create a custom notification instead of alert
//     const notification = this.renderer.createElement('div');
//     this.renderer.setStyle(notification, 'position', 'fixed');
//     this.renderer.setStyle(notification, 'top', '20px');
//     this.renderer.setStyle(notification, 'left', '50%');
//     this.renderer.setStyle(notification, 'transform', 'translateX(-50%)');
//     this.renderer.setStyle(notification, 'background', 'rgba(220, 53, 69, 0.95)');
//     this.renderer.setStyle(notification, 'color', 'white');
//     this.renderer.setStyle(notification, 'padding', '16px 24px');
//     this.renderer.setStyle(notification, 'border-radius', '8px');
//     this.renderer.setStyle(notification, 'z-index', '10000');
//     this.renderer.setStyle(notification, 'box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
//     this.renderer.setStyle(notification, 'font-size', '14px');
//     this.renderer.setStyle(notification, 'font-weight', '500');
//     this.renderer.setProperty(notification, 'textContent', message);

//     this.renderer.appendChild(document.body, notification);

//     // Remove after 3 seconds
//     setTimeout(() => {
//       this.renderer.removeChild(document.body, notification);
//     }, 3000);
//   }

//   private clearClipboard(): void {
//     try {
//       if (navigator.clipboard && navigator.clipboard.writeText) {
//         navigator.clipboard.writeText('').catch(err => {
//           console.error('Failed to clear clipboard:', err);
//         });
//       }
//     } catch (error) {
//       console.error('Clipboard access error:', error);
//     }
//   }

//   private logSecurityEvent(type: string, message: string): void {
//     if (!this.config.enableLogging) {
//       return;
//     }

//     console.warn(`[Security Event] ${type}: ${message}`);

//     const event: SecurityEvent = {
//       type,
//       timestamp: new Date().toISOString(),
//       userId: this.getUserId(),
//       username: this.getUsername()
//     };

//     // Send to backend (implement based on your API)
//     this.http.post('/api/security-events', event)
//       .pipe(
//         catchError(error => {
//           console.error('Failed to log security event:', error);
//           return of(null);
//         })
//       )
//       .subscribe();
//   }

//   private getUserId(): string {
//     try {
//       const userData = localStorage.getItem('user');
//       if (userData) {
//         const user = JSON.parse(userData);
//         return user.id || user.userId || 'unknown';
//       }
//     } catch (error) {
//       console.error('Error getting user ID:', error);
//     }
//     return 'unknown';
//   }

//   /**
//    * Request and maintain fullscreen mode throughout the quiz
//    */
//   private enforceFullscreenLock(): void {
//     // Request fullscreen
//     this.requestFullscreen();

//     // Prevent exiting fullscreen
//     const fullscreenChangeListener = this.renderer.listen('document', 'fullscreenchange', () => {
//       if (!document.fullscreenElement && this.fullscreenLockEnabled) {
//         this.logSecurityEvent('fullscreen-exit', 'User attempted to exit fullscreen');
//         this.showNotification('⚠️ Fullscreen mode is required for the quiz');
        
//         // Re-request fullscreen after a short delay
//         setTimeout(() => {
//           this.requestFullscreen();
//         }, 500);
//       }
//     });

//     this.listeners.set('fullscreen-change', fullscreenChangeListener);

//     // Handle fullscreen errors
//     const fullscreenErrorListener = this.renderer.listen('document', 'fullscreenerror', () => {
//       console.error('Fullscreen request failed');
//       this.showNotification('Please enable fullscreen mode to continue');
//     });

//     this.listeners.set('fullscreen-error', fullscreenErrorListener);

//     // Mobile-specific: prevent page scrolling/zooming
//     document.addEventListener('touchmove', (e: TouchEvent) => {
//       if (e.touches.length > 1) {
//         e.preventDefault(); // Prevent pinch zoom
//       }
//     }, { passive: false });

//     // Store cleanup function
//     const touchMoveCleanup = () => {
//       document.removeEventListener('touchmove', (e: TouchEvent) => {
//         if (e.touches.length > 1) {
//           e.preventDefault();
//         }
//       });
//     };

//     this.listeners.set('touch-move', touchMoveCleanup);
//   }

//   /**
//    * Request fullscreen mode
//    */
//   private requestFullscreen(): void {
//     const elem = document.documentElement;
    
//     try {
//       if (elem.requestFullscreen) {
//         elem.requestFullscreen().then(() => {
//           this.fullscreenLockEnabled = true;
//           console.info('Fullscreen mode activated');
//         }).catch(err => {
//           console.error('Fullscreen request failed:', err);
//           // Don't force if browser doesn't support it
//         });
//       } else if ((elem as any).webkitRequestFullscreen) {
//         (elem as any).webkitRequestFullscreen();
//         this.fullscreenLockEnabled = true;
//       } else if ((elem as any).mozRequestFullScreen) {
//         (elem as any).mozRequestFullScreen();
//         this.fullscreenLockEnabled = true;
//       } else if ((elem as any).msRequestFullscreen) {
//         (elem as any).msRequestFullscreen();
//         this.fullscreenLockEnabled = true;
//       }
//     } catch (error) {
//       console.error('Error requesting fullscreen:', error);
//     }
//   }

//   /**
//    * Exit fullscreen mode
//    */
//   private exitFullscreen(): void {
//     try {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       } else if ((document as any).webkitExitFullscreen) {
//         (document as any).webkitExitFullscreen();
//       } else if ((document as any).mozCancelFullScreen) {
//         (document as any).mozCancelFullScreen();
//       } else if ((document as any).msExitFullscreen) {
//         (document as any).msExitFullscreen();
//       }
//       this.fullscreenLockEnabled = false;
//     } catch (error) {
//       console.error('Error exiting fullscreen:', error);
//     }
//   }

//   /**
//    * Continuously monitor and maintain window focus
//    */
//   private lockFocus(): void {
//     // Ensure window stays focused
//     this.focusCheckInterval = window.setInterval(() => {
//       if (document.hidden || !document.hasFocus()) {
//         window.focus();
//         this.logSecurityEvent('focus-restore', 'Automatically restored focus');
//       }
//     }, 1000);

//     // Immediately focus on enable
//     window.focus();

//     // Prevent opening new windows/tabs
//     const beforeUnloadListener = this.renderer.listen('window', 'beforeunload', (e: BeforeUnloadEvent) => {
//       e.preventDefault();
//       e.returnValue = 'Quiz in progress. Are you sure you want to leave?';
//       return e.returnValue;
//     });

//     this.listeners.set('before-unload', beforeUnloadListener);

//     // Prevent middle-click and Ctrl+click (new tab)
//     const clickHandler = (e: MouseEvent): boolean => {
//       if (e.button === 1 || (e.ctrlKey && e.button === 0) || (e.metaKey && e.button === 0)) {
//         e.preventDefault();
//         e.stopPropagation();
//         this.showNotification('⚠️ Opening new tabs is not allowed');
//         return false;
//       }
//       return true;
//     };
    
//     document.addEventListener('click', clickHandler, { capture: true });
//     const clickCleanup = () => {
//       document.removeEventListener('click', clickHandler, { capture: true });
//     };
//     this.listeners.set('click-prevention', clickCleanup);
//     // Prevent Ctrl+N, Ctrl+T (new window/tab)
//     const newTabListener = this.renderer.listen('document', 'keydown', (e: KeyboardEvent): boolean => {
//       if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 't' || e.key === 'w')) {
//         e.preventDefault();
//         e.stopPropagation();
//         this.showNotification('⚠️ Opening new tabs/windows is not allowed');
//         return false;
//       }
//       return true;
//     });

//     this.listeners.set('new-tab-prevention', newTabListener);
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
  details?: string;
}

interface ProtectionConfig {
  watermarkOpacity: number;
  watermarkCount: number;
  enableAlerts: boolean;
  enableLogging: boolean;
  enableFullscreenLock: boolean;
  fullscreenRetryInterval: number;
  focusCheckInterval: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScreenshotPreventionService implements OnDestroy {
  private renderer: Renderer2;
  private eventListeners: Map<string, () => void> = new Map();
  private isActive = false;
  private watermarkElement?: HTMLElement;
  private warningBannerElement?: HTMLElement;
  private fullscreenActive = false;
  private focusCheckTimer?: number;
  private fullscreenRetryTimer?: number;
  private originalViewportContent = '';
  
  private config: ProtectionConfig = {
    watermarkOpacity: 0.15,
    watermarkCount: 25,
    enableAlerts: true,
    enableLogging: true,
    enableFullscreenLock: true,
    fullscreenRetryInterval: 2000,
    focusCheckInterval: 1000
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
   * Enable all protection mechanisms
   */
  enableProtection(): void {
    if (this.isActive) {
      console.warn('[Screenshot Protection] Already enabled');
      return;
    }

    console.info('[Screenshot Protection] Enabling protection...');

    try {
      // Visual protections
      this.createWatermark();
      this.applySecureStyles();

      // Event blocking
      this.blockScreenshotShortcuts();
      this.blockContextMenu();
      this.blockDevTools();
      this.blockNewTabsAndWindows();

      // Monitoring
      this.monitorClipboard();
      this.monitorWindowFocus();
      this.monitorPageVisibility();
      this.monitorBeforeUnload();

      // Mobile specific
      this.preventMobileZoom();
      this.preventMobilePinchZoom();

      // Fullscreen lock
      if (this.config.enableFullscreenLock) {
        this.enableFullscreenLock();
      }

      // Continuous focus enforcement
      this.startFocusEnforcement();

      this.isActive = true;
      console.info('[Screenshot Protection] Protection enabled successfully');
    } catch (error) {
      console.error('[Screenshot Protection] Failed to enable:', error);
      this.disableProtection();
      throw error;
    }
  }

  /**
   * Disable all protection mechanisms
   */
  disableProtection(): void {
    if (!this.isActive) {
      return;
    }

    console.info('[Screenshot Protection] Disabling protection...');

    // Clear all timers
    if (this.focusCheckTimer) {
      clearInterval(this.focusCheckTimer);
      this.focusCheckTimer = undefined;
    }

    if (this.fullscreenRetryTimer) {
      clearInterval(this.fullscreenRetryTimer);
      this.fullscreenRetryTimer = undefined;
    }

    // Remove all event listeners
    this.eventListeners.forEach((cleanup, key) => {
      try {
        cleanup();
      } catch (error) {
        console.error(`[Screenshot Protection] Failed to remove listener ${key}:`, error);
      }
    });
    this.eventListeners.clear();

    // Exit fullscreen
    if (this.fullscreenActive) {
      this.exitFullscreen();
    }

    // Remove UI elements
    this.removeWatermark();
    this.removeWarningBanner();

    // Restore styles
    this.restoreStyles();
    this.restoreViewport();

    this.isActive = false;
    console.info('[Screenshot Protection] Protection disabled');
  }

  /**
   * Check if protection is active
   */
  isEnabled(): boolean {
    return this.isActive;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ProtectionConfig>): void {
    Object.assign(this.config, newConfig);
    
    if (this.isActive) {
      // Refresh watermark
      this.removeWatermark();
      this.createWatermark();
    }
  }

  // ============================================================================
  // WATERMARK
  // ============================================================================

  private createWatermark(): void {
    this.removeWatermark();

    const watermark = this.renderer.createElement('div');
    this.watermarkElement = watermark;
    
    this.renderer.setAttribute(watermark, 'id', 'quiz-watermark');
    this.renderer.setStyle(watermark, 'position', 'fixed');
    this.renderer.setStyle(watermark, 'top', '0');
    this.renderer.setStyle(watermark, 'left', '0');
    this.renderer.setStyle(watermark, 'width', '100vw');
    this.renderer.setStyle(watermark, 'height', '100vh');
    this.renderer.setStyle(watermark, 'pointer-events', 'none');
    this.renderer.setStyle(watermark, 'z-index', '999999');
    this.renderer.setStyle(watermark, 'opacity', String(this.config.watermarkOpacity));
    this.renderer.setStyle(watermark, 'user-select', 'none');
    this.renderer.setStyle(watermark, 'overflow', 'hidden');

    const username = this.getUserInfo().username;
    const timestamp = new Date().toISOString().split('T')[0];
    const watermarkText = `${username} • ${timestamp} • CONFIDENTIAL`;
    
    // Create multiple watermark instances
    for (let i = 0; i < this.config.watermarkCount; i++) {
      const text = this.renderer.createElement('div');
      this.renderer.setProperty(text, 'textContent', watermarkText);
      this.renderer.setStyle(text, 'position', 'absolute');
      this.renderer.setStyle(text, 'top', `${(i * 12) % 95}%`);
      this.renderer.setStyle(text, 'left', `${(i * 8) % 95}%`);
      this.renderer.setStyle(text, 'color', '#ff0000');
      this.renderer.setStyle(text, 'font-size', '16px');
      this.renderer.setStyle(text, 'font-weight', 'bold');
      this.renderer.setStyle(text, 'font-family', 'monospace');
      this.renderer.setStyle(text, 'transform', 'rotate(-35deg)');
      this.renderer.setStyle(text, 'white-space', 'nowrap');
      this.renderer.setStyle(text, 'user-select', 'none');
      this.renderer.setStyle(text, 'text-shadow', '2px 2px 4px rgba(0,0,0,0.3)');
      this.renderer.appendChild(watermark, text);
    }

    this.renderer.appendChild(document.body, watermark);
  }

  private removeWatermark(): void {
    if (this.watermarkElement && this.watermarkElement.parentNode) {
      this.renderer.removeChild(document.body, this.watermarkElement);
      this.watermarkElement = undefined;
    }
  }

  // ============================================================================
  // STYLES
  // ============================================================================

  private applySecureStyles(): void {
    const body = document.body;
    
    // Store original values
    body.dataset['originalUserSelect'] = body.style.userSelect || '';
    
    // Apply protection styles
    this.renderer.setStyle(body, 'user-select', 'none');
    this.renderer.setStyle(body, '-webkit-user-select', 'none');
    this.renderer.setStyle(body, '-moz-user-select', 'none');
    this.renderer.setStyle(body, '-ms-user-select', 'none');
    this.renderer.setStyle(body, '-webkit-touch-callout', 'none');
  }

  private restoreStyles(): void {
    const body = document.body;
    const original = body.dataset['originalUserSelect'] || '';
    
    body.style.userSelect = original;
    (body.style as any).webkitUserSelect = original;
    (body.style as any).MozUserSelect = original;
    (body.style as any).msUserSelect = original;
    (body.style as any).webkitTouchCallout = original;
    
    delete body.dataset['originalUserSelect'];
  }

  // ============================================================================
  // SCREENSHOT BLOCKING
  // ============================================================================

  private blockScreenshotShortcuts(): void {
    const handler = this.renderer.listen('document', 'keydown', (e: KeyboardEvent) => {
      let blocked = false;
      let reason = '';

      // Print Screen
      if (e.key === 'PrintScreen') {
        blocked = true;
        reason = 'Print Screen';
      }

      // Mac: Cmd+Shift+3/4/5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        blocked = true;
        reason = 'Mac Screenshot';
      }

      // Windows: Win+Shift+S
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') {
        blocked = true;
        reason = 'Windows Snip';
      }

      // Alt+Print Screen
      if (e.altKey && e.key === 'PrintScreen') {
        blocked = true;
        reason = 'Alt+Print Screen';
      }

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.clearClipboard();
        this.logEvent('screenshot-attempt', `Blocked: ${reason}`);
        this.notify('📸 Screenshots are not allowed during the quiz');
      }
    });

    this.eventListeners.set('screenshot-block', handler);
  }

  // ============================================================================
  // CONTEXT MENU & DEV TOOLS
  // ============================================================================

  private blockContextMenu(): void {
    const handler = this.renderer.listen('document', 'contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.logEvent('context-menu-block', 'Right-click blocked');
      return false;
    });

    this.eventListeners.set('context-menu-block', handler);
  }

  private blockDevTools(): void {
    const handler = this.renderer.listen('document', 'keydown', (e: KeyboardEvent) => {
      let blocked = false;

      // F12
      if (e.key === 'F12') blocked = true;

      // Ctrl/Cmd+Shift+I (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') blocked = true;

      // Ctrl/Cmd+Shift+C (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') blocked = true;

      // Ctrl/Cmd+Shift+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') blocked = true;

      // Ctrl/Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') blocked = true;

      // Cmd+Option+I (Mac DevTools)
      if (e.metaKey && e.altKey && e.key.toLowerCase() === 'i') blocked = true;

      // Cmd+Option+J (Mac Console)
      if (e.metaKey && e.altKey && e.key.toLowerCase() === 'j') blocked = true;

      // Cmd+Option+C (Mac Inspect)
      if (e.metaKey && e.altKey && e.key.toLowerCase() === 'c') blocked = true;

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.logEvent('devtools-block', `Blocked: ${e.key}`);
      }
    });

    this.eventListeners.set('devtools-block', handler);
  }

  // ============================================================================
  // TAB & WINDOW BLOCKING
  // ============================================================================

  private blockNewTabsAndWindows(): void {
    // Block keyboard shortcuts
    const keyHandler = this.renderer.listen('document', 'keydown', (e: KeyboardEvent): boolean => {
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (ctrl && (key === 'n' || key === 't' || key === 'w')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.notify('⚠️ Opening new tabs/windows is not allowed');
        this.logEvent('new-tab-block', `Blocked: ${e.key}`);
        return false;
      }
      return true;
    });

    // Block middle-click and Ctrl+Click
    const clickHandler = (e: MouseEvent): boolean => {
      if (e.button === 1 || ((e.ctrlKey || e.metaKey) && e.button === 0)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.notify('⚠️ Opening new tabs is not allowed');
        this.logEvent('new-tab-click-block', 'Middle/Ctrl-click blocked');
        return false;
      }
      return true;
    };

    document.addEventListener('click', clickHandler, { capture: true });

    this.eventListeners.set('tab-block-key', keyHandler);
    this.eventListeners.set('tab-block-click', () => {
      document.removeEventListener('click', clickHandler, { capture: true });
    });
  }

  // ============================================================================
  // MONITORING
  // ============================================================================

  private monitorClipboard(): void {
    const handler = this.renderer.listen('window', 'keyup', (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        this.clearClipboard();
        this.logEvent('clipboard-monitor', 'Print Screen released - clipboard cleared');
      }
    });

    this.eventListeners.set('clipboard-monitor', handler);
  }

  private monitorWindowFocus(): void {
    const handler = this.renderer.listen('window', 'blur', () => {
      this.logEvent('focus-lost', 'Window lost focus');
      this.notify('⚠️ Please stay on the quiz page');
      
      // Attempt to restore focus and fullscreen
      setTimeout(() => {
        window.focus();
        if (this.fullscreenActive && !this.isInFullscreen()) {
          this.requestFullscreen();
        }
      }, 100);
    });

    this.eventListeners.set('focus-monitor', handler);
  }

  private monitorPageVisibility(): void {
    const handler = this.renderer.listen('document', 'visibilitychange', () => {
      if (document.hidden) {
        this.logEvent('visibility-hidden', 'Page hidden - tab/app switched');
      } else {
        this.logEvent('visibility-visible', 'Page visible - user returned');
        this.notify('⚠️ Switching tabs/apps is not allowed during the quiz');
        
        // Force focus and restore fullscreen
        window.focus();
        if (this.fullscreenActive && !this.isInFullscreen()) {
          setTimeout(() => this.requestFullscreen(), 300);
        }
      }
    });

    this.eventListeners.set('visibility-monitor', handler);
  }

  private monitorBeforeUnload(): void {
    const handler = this.renderer.listen('window', 'beforeunload', (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Quiz in progress. Are you sure you want to leave?';
      this.logEvent('unload-attempt', 'User attempted to leave page');
      return e.returnValue;
    });

    this.eventListeners.set('unload-monitor', handler);
  }

  // ============================================================================
  // FULLSCREEN
  // ============================================================================

  private enableFullscreenLock(): void {
    // Initial fullscreen request
    this.requestFullscreen();

    // Monitor all fullscreen change events (cross-browser)
    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    
    events.forEach(eventName => {
      const handler = this.renderer.listen('document', eventName, () => {
        const inFullscreen = this.isInFullscreen();
        
        if (!inFullscreen && this.fullscreenActive && this.isActive) {
          this.logEvent('fullscreen-exit', 'User exited fullscreen');
          this.notify('⚠️ Fullscreen mode is required for the quiz');
          
          // Force back to fullscreen
          window.focus();
          setTimeout(() => this.requestFullscreen(), 300);
        }
      });

      this.eventListeners.set(`fullscreen-${eventName}`, handler);
    });

    // Handle errors
    const errorEvents = ['fullscreenerror', 'webkitfullscreenerror', 'mozfullscreenerror', 'MSFullscreenError'];
    
    errorEvents.forEach(eventName => {
      const handler = this.renderer.listen('document', eventName, () => {
        console.error('[Screenshot Protection] Fullscreen error');
        this.showWarningBanner();
      });

      this.eventListeners.set(`fullscreen-error-${eventName}`, handler);
    });

    // Retry mechanism for browsers that don't support fullscreen
    this.fullscreenRetryTimer = window.setInterval(() => {
      if (this.isActive && this.fullscreenActive && !this.isInFullscreen()) {
        this.requestFullscreen();
      }
    }, this.config.fullscreenRetryInterval);
  }

  private requestFullscreen(): void {
    const elem = document.documentElement;

    try {
      if (elem.requestFullscreen) {
        elem.requestFullscreen({ navigationUI: 'hide' } as any)
          .then(() => {
            this.fullscreenActive = true;
            this.removeWarningBanner();
            console.info('[Screenshot Protection] Fullscreen activated');
          })
          .catch(err => {
            console.warn('[Screenshot Protection] Fullscreen request failed:', err);
            this.showWarningBanner();
          });
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
        this.fullscreenActive = true;
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
        this.fullscreenActive = true;
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
        this.fullscreenActive = true;
      } else {
        // Fullscreen not supported
        console.warn('[Screenshot Protection] Fullscreen API not supported');
        this.showWarningBanner();
      }
    } catch (error) {
      console.error('[Screenshot Protection] Fullscreen error:', error);
      this.showWarningBanner();
    }
  }

  private exitFullscreen(): void {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      this.fullscreenActive = false;
    } catch (error) {
      console.error('[Screenshot Protection] Exit fullscreen error:', error);
    }
  }

  private isInFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  // ============================================================================
  // MOBILE SPECIFIC
  // ============================================================================

  private preventMobileZoom(): void {
    const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
    
    if (viewport) {
      this.originalViewportContent = viewport.content;
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    } else {
      const meta = this.renderer.createElement('meta');
      this.renderer.setAttribute(meta, 'name', 'viewport');
      this.renderer.setAttribute(meta, 'content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      this.renderer.appendChild(document.head, meta);
    }

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const doubleTapHandler = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', doubleTapHandler, { passive: false });

    this.eventListeners.set('double-tap-block', () => {
      document.removeEventListener('touchend', doubleTapHandler);
    });
  }

  private preventMobilePinchZoom(): void {
    const pinchHandler = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', pinchHandler, { passive: false });

    this.eventListeners.set('pinch-block', () => {
      document.removeEventListener('touchmove', pinchHandler);
    });
  }

  private restoreViewport(): void {
    const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
    if (viewport && this.originalViewportContent) {
      viewport.content = this.originalViewportContent;
    }
  }

  // ============================================================================
  // FOCUS ENFORCEMENT
  // ============================================================================

  private startFocusEnforcement(): void {
    window.focus();

    this.focusCheckTimer = window.setInterval(() => {
      if (!document.hasFocus() || document.hidden) {
        window.focus();
        
        if (this.fullscreenActive && !this.isInFullscreen()) {
          this.requestFullscreen();
        }
      }
    }, this.config.focusCheckInterval);
  }

  // ============================================================================
  // UI NOTIFICATIONS
  // ============================================================================

  private notify(message: string): void {
    if (!this.config.enableAlerts) return;

    const notification = this.renderer.createElement('div');
    this.renderer.setStyle(notification, 'position', 'fixed');
    this.renderer.setStyle(notification, 'top', '20px');
    this.renderer.setStyle(notification, 'left', '50%');
    this.renderer.setStyle(notification, 'transform', 'translateX(-50%)');
    this.renderer.setStyle(notification, 'background', 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)');
    this.renderer.setStyle(notification, 'color', 'white');
    this.renderer.setStyle(notification, 'padding', '16px 32px');
    this.renderer.setStyle(notification, 'border-radius', '12px');
    this.renderer.setStyle(notification, 'box-shadow', '0 8px 24px rgba(0,0,0,0.4)');
    this.renderer.setStyle(notification, 'z-index', '1000000');
    this.renderer.setStyle(notification, 'font-size', '15px');
    this.renderer.setStyle(notification, 'font-weight', '600');
    this.renderer.setStyle(notification, 'font-family', 'system-ui, -apple-system, sans-serif');
    this.renderer.setStyle(notification, 'animation', 'slideDown 0.3s ease-out');
    this.renderer.setProperty(notification, 'textContent', message);

    this.renderer.appendChild(document.body, notification);

    setTimeout(() => {
      if (notification.parentNode) {
        this.renderer.removeChild(document.body, notification);
      }
    }, 3500);
  }

  private showWarningBanner(): void {
    if (this.warningBannerElement) return;

    const banner = this.renderer.createElement('div');
    this.warningBannerElement = banner;

    this.renderer.setAttribute(banner, 'id', 'quiz-warning-banner');
    this.renderer.setStyle(banner, 'position', 'fixed');
    this.renderer.setStyle(banner, 'top', '0');
    this.renderer.setStyle(banner, 'left', '0');
    this.renderer.setStyle(banner, 'width', '100%');
    this.renderer.setStyle(banner, 'background', 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)');
    this.renderer.setStyle(banner, 'color', 'white');
    this.renderer.setStyle(banner, 'padding', '12px');
    this.renderer.setStyle(banner, 'text-align', 'center');
    this.renderer.setStyle(banner, 'z-index', '1000001');
    this.renderer.setStyle(banner, 'font-size', '14px');
    this.renderer.setStyle(banner, 'font-weight', 'bold');
    this.renderer.setStyle(banner, 'font-family', 'system-ui, -apple-system, sans-serif');
    this.renderer.setStyle(banner, 'box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
    this.renderer.setProperty(banner, 'innerHTML', '⚠️ QUIZ MODE ACTIVE - Stay on this page - Do not switch tabs or apps ⚠️');

    this.renderer.appendChild(document.body, banner);
  }

  private removeWarningBanner(): void {
    if (this.warningBannerElement && this.warningBannerElement.parentNode) {
      this.renderer.removeChild(document.body, this.warningBannerElement);
      this.warningBannerElement = undefined;
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private clearClipboard(): void {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText('').catch(() => {
          // Silently fail
        });
      }
    } catch (error) {
      // Clipboard access may be restricted
    }
  }

  private getUserInfo(): { username: string; userId: string } {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          username: user.username || user.name || 'USER',
          userId: user.id || user.userId || 'unknown'
        };
      }
    } catch (error) {
      console.error('[Screenshot Protection] Error reading user data:', error);
    }
    return { username: 'ANONYMOUS', userId: 'unknown' };
  }

  private logEvent(type: string, details: string): void {
    if (!this.config.enableLogging) return;

    const userInfo = this.getUserInfo();
    const event: SecurityEvent = {
      type,
      timestamp: new Date().toISOString(),
      userId: userInfo.userId,
      username: userInfo.username,
      details
    };

    console.warn(`[Screenshot Protection] ${type}:`, details);

    // Send to backend
    this.http.post('/api/security-events', event)
      .pipe(
        catchError(error => {
          console.error('[Screenshot Protection] Failed to log event:', error);
          return of(null);
        })
      )
      .subscribe();
  }
}