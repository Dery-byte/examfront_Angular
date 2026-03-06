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
  enableBlurOnHidden: boolean;

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
    enableAlerts: false,
    enableLogging: true,
    enableFullscreenLock: true,
    fullscreenRetryInterval: 2000,
    focusCheckInterval: 1000,
    enableBlurOnHidden: true
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
      // this.createWatermark();
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
      // this.monitorBeforeUnload();

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


 private monitorPageVisibility(): void {
  const handler = this.renderer.listen('document', 'visibilitychange', () => {

    if (document.hidden) {

      // Log violation
      this.logEvent('visibility-hidden', 'Page hidden - tab/app switched');

      // Blur screen if enabled
      if (this.config.enableBlurOnHidden) {
        document.body.style.transition = 'filter 0.3s ease';
        document.body.style.filter = 'blur(20px)';
      }

    } else {

      // Remove blur
      document.body.style.filter = '';

      // Log return
      this.logEvent('visibility-visible', 'Page visible - user returned');

      // Notify user
      this.notify('⚠️ Switching tabs/apps is not allowed during the quiz');

      // Force focus
      window.focus();

      // Restore fullscreen if required
      if (this.fullscreenActive && !this.isInFullscreen()) {
        setTimeout(() => this.requestFullscreen(), 300);
      }
    }

  });

  this.eventListeners.set('visibility-monitor', handler);
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
        // this.showWarningBanner();
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
            // this.showWarningBanner();
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
        // this.showWarningBanner();
      }
    } catch (error) {
      console.error('[Screenshot Protection] Fullscreen error:', error);
      // this.showWarningBanner();
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

    // Inject font if not already loaded
    if (!document.getElementById('qpw-font-link')) {
      const link = document.createElement('link');
      link.id = 'qpw-font-link';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@500;600&display=swap';
      document.head.appendChild(link);
    }

    // Inject keyframes once
    if (!document.getElementById('sps-notify-style')) {
      const style = document.createElement('style');
      style.id = 'sps-notify-style';
      style.textContent = `
        @keyframes spsSlideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-14px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spsFadeOut {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to   { opacity: 0; transform: translateX(-50%) translateY(-8px); }
        }
      `;
      document.head.appendChild(style);
    }

    const notification = this.renderer.createElement('div');

    // Shell
    this.renderer.setStyle(notification, 'position', 'fixed');
    this.renderer.setStyle(notification, 'top', '18px');
    this.renderer.setStyle(notification, 'left', '50%');
    this.renderer.setStyle(notification, 'transform', 'translateX(-50%)');
    this.renderer.setStyle(notification, 'z-index', '1000000');
    this.renderer.setStyle(notification, 'animation', 'spsSlideDown .28s cubic-bezier(.16,1,.3,1) both');

    // Card styling — matches exam shell dark theme
    this.renderer.setStyle(notification, 'display', 'flex');
    this.renderer.setStyle(notification, 'align-items', 'center');
    this.renderer.setStyle(notification, 'gap', '10px');
    this.renderer.setStyle(notification, 'padding', '11px 18px 11px 14px');
    this.renderer.setStyle(notification, 'background', '#0e0e0e');
    this.renderer.setStyle(notification, 'border', '1px solid rgba(248,113,113,.28)');
    this.renderer.setStyle(notification, 'border-radius', '12px');
    this.renderer.setStyle(notification, 'box-shadow',
      '0 0 0 1px rgba(248,113,113,.08) inset, 0 12px 36px rgba(0,0,0,.7)');
    this.renderer.setStyle(notification, 'backdrop-filter', 'blur(12px)');
    this.renderer.setStyle(notification, 'max-width', '420px');
    this.renderer.setStyle(notification, 'white-space', 'nowrap');

    // Left accent bar
    const bar = this.renderer.createElement('span');
    this.renderer.setStyle(bar, 'flex-shrink', '0');
    this.renderer.setStyle(bar, 'width', '3px');
    this.renderer.setStyle(bar, 'height', '32px');
    this.renderer.setStyle(bar, 'border-radius', '2px');
    this.renderer.setStyle(bar, 'background', 'rgba(248,113,113,.8)');
    this.renderer.appendChild(notification, bar);

    // Icon
    const icon = this.renderer.createElement('span');
    this.renderer.setStyle(icon, 'flex-shrink', '0');
    this.renderer.setStyle(icon, 'width', '28px');
    this.renderer.setStyle(icon, 'height', '28px');
    this.renderer.setStyle(icon, 'border-radius', '7px');
    this.renderer.setStyle(icon, 'background', 'rgba(248,113,113,.08)');
    this.renderer.setStyle(icon, 'border', '1px solid rgba(248,113,113,.2)');
    this.renderer.setStyle(icon, 'display', 'flex');
    this.renderer.setStyle(icon, 'align-items', 'center');
    this.renderer.setStyle(icon, 'justify-content', 'center');
    this.renderer.setStyle(icon, 'color', 'rgba(248,113,113,.9)');
    this.renderer.setProperty(icon, 'innerHTML', `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0
                 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    `);
    this.renderer.appendChild(notification, icon);

    // Text block
    const textWrap = this.renderer.createElement('span');
    this.renderer.setStyle(textWrap, 'display', 'flex');
    this.renderer.setStyle(textWrap, 'flex-direction', 'column');
    this.renderer.setStyle(textWrap, 'gap', '1px');

    const label = this.renderer.createElement('span');
    this.renderer.setStyle(label, 'font-family', "'Geist Mono', monospace");
    this.renderer.setStyle(label, 'font-size', '8.5px');
    this.renderer.setStyle(label, 'font-weight', '600');
    this.renderer.setStyle(label, 'letter-spacing', '.12em');
    this.renderer.setStyle(label, 'text-transform', 'uppercase');
    this.renderer.setStyle(label, 'color', 'rgba(248,113,113,.55)');
    this.renderer.setProperty(label, 'textContent', 'Security Alert');
    this.renderer.appendChild(textWrap, label);

    // Strip emoji from message for cleaner display
    const cleanMsg = message.replace(/[\u{1F300}-\u{1FFFF}]|[\u2600-\u27BF]|⚠️|📸/gu, '').trim();
    const msgEl = this.renderer.createElement('span');
    this.renderer.setStyle(msgEl, 'font-family', "'Sora', sans-serif");
    this.renderer.setStyle(msgEl, 'font-size', '12.5px');
    this.renderer.setStyle(msgEl, 'font-weight', '500');
    this.renderer.setStyle(msgEl, 'color', 'rgba(255,255,255,.75)');
    this.renderer.setProperty(msgEl, 'textContent', cleanMsg);
    this.renderer.appendChild(textWrap, msgEl);

    this.renderer.appendChild(notification, textWrap);
    this.renderer.appendChild(document.body, notification);

    // Fade out then remove
    setTimeout(() => {
      this.renderer.setStyle(notification, 'animation', 'spsFadeOut .22s ease both');
      setTimeout(() => {
        if (notification.parentNode) {
          this.renderer.removeChild(document.body, notification);
        }
      }, 220);
    }, 3280);
  }


  // private notify(message: string): void {
  //   if (!this.config.enableAlerts) return;

  //   const notification = this.renderer.createElement('div');
  //   this.renderer.setStyle(notification, 'position', 'fixed');
  //   this.renderer.setStyle(notification, 'top', '20px');
  //   this.renderer.setStyle(notification, 'left', '50%');
  //   this.renderer.setStyle(notification, 'transform', 'translateX(-50%)');
  //   this.renderer.setStyle(notification, 'background', 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)');
  //   this.renderer.setStyle(notification, 'color', 'white');
  //   this.renderer.setStyle(notification, 'padding', '16px 32px');
  //   this.renderer.setStyle(notification, 'border-radius', '12px');
  //   this.renderer.setStyle(notification, 'box-shadow', '0 8px 24px rgba(0,0,0,0.4)');
  //   this.renderer.setStyle(notification, 'z-index', '1000000');
  //   this.renderer.setStyle(notification, 'font-size', '15px');
  //   this.renderer.setStyle(notification, 'font-weight', '600');
  //   this.renderer.setStyle(notification, 'font-family', 'system-ui, -apple-system, sans-serif');
  //   this.renderer.setStyle(notification, 'animation', 'slideDown 0.3s ease-out');
  //   this.renderer.setProperty(notification, 'textContent', message);

  //   this.renderer.appendChild(document.body, notification);

  //   setTimeout(() => {
  //     if (notification.parentNode) {
  //       this.renderer.removeChild(document.body, notification);
  //     }
  //   }, 3500);
  // }






  
  private showWarningBanner(): void {
    if (this.warningBannerElement) return;

    // Inject keyframe once
    if (!document.getElementById('sps-banner-style')) {
      const style = document.createElement('style');
      style.id = 'sps-banner-style';
      style.textContent = `
        @keyframes spsBannerIn {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spsDotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.25; transform:scale(.45); }
        }
      `;
      document.head.appendChild(style);
    }

    const banner = this.renderer.createElement('div');
    this.warningBannerElement = banner;

    this.renderer.setAttribute(banner, 'id', 'quiz-warning-banner');

    // Layout
    this.renderer.setStyle(banner, 'position', 'fixed');
    this.renderer.setStyle(banner, 'top', '0');
    this.renderer.setStyle(banner, 'left', '0');
    this.renderer.setStyle(banner, 'width', '100%');
    this.renderer.setStyle(banner, 'z-index', '1000001');
    this.renderer.setStyle(banner, 'display', 'flex');
    this.renderer.setStyle(banner, 'align-items', 'center');
    this.renderer.setStyle(banner, 'justify-content', 'center');
    this.renderer.setStyle(banner, 'gap', '10px');
    this.renderer.setStyle(banner, 'padding', '9px 20px');
    this.renderer.setStyle(banner, 'animation', 'spsBannerIn .3s cubic-bezier(.16,1,.3,1) both');

    // Background — dark with red tint top border
    this.renderer.setStyle(banner, 'background', '#0a0a0a');
    this.renderer.setStyle(banner, 'border-bottom', '1px solid rgba(248,113,113,.2)');
    this.renderer.setStyle(banner, 'box-shadow', '0 4px 20px rgba(0,0,0,.6)');

    // Top accent line via outline trick (border-top)
    this.renderer.setStyle(banner, 'border-top', '2px solid rgba(248,113,113,.6)');

    // Pulsing dot
    const dot = this.renderer.createElement('span');
    this.renderer.setStyle(dot, 'width', '6px');
    this.renderer.setStyle(dot, 'height', '6px');
    this.renderer.setStyle(dot, 'border-radius', '50%');
    this.renderer.setStyle(dot, 'background', 'rgba(248,113,113,.85)');
    this.renderer.setStyle(dot, 'flex-shrink', '0');
    this.renderer.setStyle(dot, 'animation', 'spsDotPulse 1.4s infinite');
    this.renderer.appendChild(banner, dot);

    // Badge
    const badge = this.renderer.createElement('span');
    this.renderer.setStyle(badge, 'font-family', "'Geist Mono', monospace");
    this.renderer.setStyle(badge, 'font-size', '8.5px');
    this.renderer.setStyle(badge, 'font-weight', '600');
    this.renderer.setStyle(badge, 'letter-spacing', '.13em');
    this.renderer.setStyle(badge, 'text-transform', 'uppercase');
    this.renderer.setStyle(badge, 'color', 'rgba(248,113,113,.65)');
    this.renderer.setStyle(badge, 'padding', '2px 9px');
    this.renderer.setStyle(badge, 'border', '1px solid rgba(248,113,113,.18)');
    this.renderer.setStyle(badge, 'border-radius', '100px');
    this.renderer.setStyle(badge, 'background', 'rgba(248,113,113,.06)');
    this.renderer.setProperty(badge, 'textContent', 'QUIZ MODE ACTIVE');
    this.renderer.appendChild(banner, badge);

    // Separator
    const sep = this.renderer.createElement('span');
    this.renderer.setStyle(sep, 'width', '1px');
    this.renderer.setStyle(sep, 'height', '14px');
    this.renderer.setStyle(sep, 'background', 'rgba(255,255,255,.08)');
    this.renderer.setStyle(sep, 'flex-shrink', '0');
    this.renderer.appendChild(banner, sep);

    // Message
    const msg = this.renderer.createElement('span');
    this.renderer.setStyle(msg, 'font-family', "'Sora', sans-serif");
    this.renderer.setStyle(msg, 'font-size', '12px');
    this.renderer.setStyle(msg, 'font-weight', '400');
    this.renderer.setStyle(msg, 'color', 'rgba(255,255,255,.4)');
    this.renderer.setStyle(msg, 'letter-spacing', '.01em');
    this.renderer.setProperty(msg, 'textContent',
      'Stay on this page — Do not switch tabs or applications');
    this.renderer.appendChild(banner, msg);

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





