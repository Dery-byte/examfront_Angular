// import { Injectable, Renderer2, RendererFactory2, OnDestroy } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { catchError, of, Subject, BehaviorSubject } from 'rxjs';

// // ============================================================================
// // TYPES & INTERFACES
// // ============================================================================




// export interface SecurityEvent {
//   type: string;
//   timestamp: string;
//   userId: string;
//   username: string;
//   details?: string;
//   severity: 'low' | 'medium' | 'high' | 'critical';
// }

// export interface ViolationRecord {
//   type: string;
//   timestamp: Date;
//   count: number;
// }

// export type ExamMode = 'casual' | 'standard' | 'proctored';

// /**
//  * Violation Action Types:
//  * - NONE: No action, just log
//  * - DELAY_ONLY: Lock user for delaySeconds on each violation
//  * - AUTOSUBMIT_ONLY: Auto-submit when maxViolations reached
//  * - DELAY_AND_AUTOSUBMIT: Delay on each violation, auto-submit at max
//  */
// export type ViolationAction = 'NONE' | 'DELAY_ONLY' | 'AUTOSUBMIT_ONLY' | 'DELAY_AND_AUTOSUBMIT';

// export interface QuizViolationConfig {
//   action: ViolationAction;
//   maxViolations: number;
//   delaySeconds: number;
//   delayIncrementOnRepeat: boolean;
//   delayMultiplier: number;
//   maxDelaySeconds: number;
//   autoSubmitCountdownSeconds: number;
// }

// export interface ProtectionConfig {
//   examMode: ExamMode;
//   watermarkEnabled: boolean;
//   watermarkOpacity: number;
//   watermarkCount: number;
//   watermarkText?: string;
//   enableAlerts: boolean;
//   enableLogging: boolean;
//   logEndpoint: string;
//   enableFullscreenLock: boolean;
//   fullscreenRetryInterval: number;
//   focusCheckInterval: number;
//   autoSubmitGracePeriodMs: number;
//   enableMobileProtection: boolean;
//   preventZoom: boolean;
//   enableScreenshotBlocking: boolean;
//   enableDevToolsBlocking: boolean;
//   enableWakeLock: boolean;
  
//   // Violation config - this is what gets set from the Quiz settings
//   violationConfig: QuizViolationConfig;
// }

// export interface QuizProtectionState {
//   isActive: boolean;
//   isFullscreen: boolean;
//   violationCount: number;
//   violations: ViolationRecord[];
//   penaltySeconds: number;
//   lastViolation?: Date;
//   autoSubmitTriggered: boolean;
//   autoSubmitCountdown?: number;
//   isDelayActive: boolean;
//   delayRemainingSeconds: number;
//   totalDelayTimeServed: number;
// }

// export interface AutoSubmitEvent {
//   reason: string;
//   violationType: string;
//   violations: ViolationRecord[];
//   totalViolations: number;
//   penaltySeconds: number;
//   totalDelayTimeServed: number;
//   timestamp: Date;
// }

// export type AutoSubmitPayload = AutoSubmitEvent;

// export interface DelayEvent {
//   violationType: string;
//   delayDuration: number;
//   violationCount: number;
//   maxViolations: number;
//   willAutoSubmitNext: boolean;
// }

// // ============================================================================
// // DEFAULT CONFIGS
// // ============================================================================

// const DEFAULT_VIOLATION_CONFIG: QuizViolationConfig = {
//   action: 'DELAY_AND_AUTOSUBMIT',
//   maxViolations: 3,
//   delaySeconds: 30,
//   delayIncrementOnRepeat: true,
//   delayMultiplier: 1.5,
//   maxDelaySeconds: 100000,
//   autoSubmitCountdownSeconds: 5,
// };

// const CASUAL_CONFIG: Partial<ProtectionConfig> = {
//   examMode: 'casual',
//   watermarkEnabled: false,
//   enableFullscreenLock: false,
//   enableScreenshotBlocking: false,
//   enableDevToolsBlocking: false,
//   enableAlerts: false,
//   violationConfig: {
//     action: 'NONE',
//     maxViolations: 999,
//     delaySeconds: 0,
//     delayIncrementOnRepeat: false,
//     delayMultiplier: 1,
//     maxDelaySeconds: 100000,
//     autoSubmitCountdownSeconds: 5,
//   },
// };

// const STANDARD_CONFIG: Partial<ProtectionConfig> = {
//   examMode: 'standard',
//   watermarkEnabled: true,
//   watermarkOpacity: 0.1,
//   enableFullscreenLock: true,
//   enableScreenshotBlocking: true,
//   enableDevToolsBlocking: true,
//   enableAlerts: true,
//   violationConfig: {
//     action: 'DELAY_ONLY',
//     maxViolations: 5,
//     delaySeconds: 30,
//     delayIncrementOnRepeat: true,
//     delayMultiplier: 1.5,
//     maxDelaySeconds: 100000,
//     autoSubmitCountdownSeconds: 5,
//   },
// };

// const PROCTORED_CONFIG: Partial<ProtectionConfig> = {
//   examMode: 'proctored',
//   watermarkEnabled: true,
//   watermarkOpacity: 0.15,
//   watermarkCount: 30,
//   enableFullscreenLock: true,
//   enableScreenshotBlocking: true,
//   enableDevToolsBlocking: true,
//   enableAlerts: true,
//   enableWakeLock: true,
//   violationConfig: {
//     action: 'DELAY_AND_AUTOSUBMIT',
//     maxViolations: 3,
//     delaySeconds: 30,
//     delayIncrementOnRepeat: true,
//     delayMultiplier: 1.5,
//     maxDelaySeconds: 100000,
//     autoSubmitCountdownSeconds: 5,
//   },
// };

// // ============================================================================
// // SERVICE
// // ============================================================================

// @Injectable({ providedIn: 'root' })
// export class QuizProtectionService implements OnDestroy {
//   private renderer: Renderer2;
//   private eventListeners: Map<string, () => void> = new Map();
//   private isActive = false;
  
//   // UI Elements
//   private watermarkElement?: HTMLElement;
//   private warningBannerElement?: HTMLElement;
//   private violationOverlayElement?: HTMLElement;
//   private autoSubmitOverlayElement?: HTMLElement;
//   private delayOverlayElement?: HTMLElement;
  
//   // State
//   private fullscreenActive = false;
//   private focusCheckTimer?: number;
//   private fullscreenRetryTimer?: number;
//   private originalViewportContent = '';
//   private wakeLock: any = null;
  
//   // Violation tracking
//   private violations: ViolationRecord[] = [];
//   private totalViolationCount = 0;
//   private penaltySeconds = 0;
  
//   // Auto-submit state
//   private autoSubmitTriggered = false;
//   private autoSubmitCountdownTimer?: number;
//   private autoSubmitCountdownValue = 0;
//   private isProcessingViolation = false;
  
//   // Delay state
//   private isDelayActive = false;
//   private delayRemainingSeconds = 0;
//   private delayTimer?: number;
//   private totalDelayTimeServed = 0;
//   private currentDelayDuration = 0;
  
//   // PUBLIC EVENTS
//   public readonly onViolation = new Subject<SecurityEvent>();
//   public readonly onAutoSubmit = new Subject<AutoSubmitEvent>();
//   public readonly onAutoSubmitCountdown = new Subject<number>();
//   public readonly onAutoSubmitWarning = new Subject<{ remaining: number; total: number }>();
//   public readonly onAutoSubmitCancelled = new Subject<void>();
//   public readonly onDelayStarted = new Subject<DelayEvent>();
//   public readonly onDelayTick = new Subject<number>();
//   public readonly onDelayEnded = new Subject<void>();
//   public readonly onStateChange = new BehaviorSubject<QuizProtectionState>(this.getState());
  
//   // Configuration
//   private config: ProtectionConfig = {
//     examMode: 'standard',
//     watermarkEnabled: true,
//     watermarkOpacity: 0.12,
//     watermarkCount: 25,
//     enableAlerts: true,
//     enableLogging: true,
//     logEndpoint: '/api/security-events',
//     enableFullscreenLock: true,
//     fullscreenRetryInterval: 2000,
//     focusCheckInterval: 1000,
//     autoSubmitGracePeriodMs: 500,
//     enableMobileProtection: true,
//     preventZoom: true,
//     enableScreenshotBlocking: true,
//     enableDevToolsBlocking: true,
//     enableWakeLock: true,
//     violationConfig: { ...DEFAULT_VIOLATION_CONFIG },
//   };

//   constructor(private rendererFactory: RendererFactory2, private http: HttpClient) {
//     this.renderer = rendererFactory.createRenderer(null, null);
//   }

//   ngOnDestroy(): void { this.disableProtection(); }

//   // ============================================================================
//   // PUBLIC API
//   // ============================================================================

//   enableProtection(mode?: ExamMode): void {
//     if (this.isActive) {
//       console.warn('[Quiz Protection] Already enabled');
//       return;
//     }

//     if (mode) this.setMode(mode);

//     console.info(`[Quiz Protection] Enabling ${this.config.examMode} mode with action: ${this.config.violationConfig.action}`);

//     try {
//       this.resetState();

//       if (this.config.watermarkEnabled) this.createWatermark();
//       this.applySecureStyles();
//       if (this.config.enableScreenshotBlocking) this.blockScreenshotShortcuts();
//       this.blockContextMenu();
//       if (this.config.enableDevToolsBlocking) this.blockDevTools();
//       this.blockNewTabsAndWindows();
//       this.monitorBeforeUnload();
//       this.monitorClipboard();
//       this.monitorWindowFocus();
//       this.monitorPageVisibility();

//       if (this.config.enableMobileProtection && this.config.preventZoom) {
//         this.preventMobileZoom();
//         this.preventMobilePinchZoom();
//       }

//       if (this.config.enableFullscreenLock) this.enableFullscreenLock();
//       if (this.config.enableWakeLock) this.requestWakeLock();

//       this.startFocusEnforcement();

//       this.isActive = true;
//       this.emitStateChange();
//       console.info('[Quiz Protection] Protection enabled successfully');
//     } catch (error) {
//       console.error('[Quiz Protection] Failed to enable:', error);
//       this.disableProtection();
//       throw error;
//     }
//   }

//   disableProtection(): void {
//     if (!this.isActive) return;

//     console.info('[Quiz Protection] Disabling protection...');

//     this.clearAllTimers();

//     this.eventListeners.forEach((cleanup) => { try { cleanup(); } catch (e) {} });
//     this.eventListeners.clear();

//     this.releaseWakeLock();
//     if (this.fullscreenActive) this.exitFullscreen();

//     this.removeWatermark();
//     this.removeWarningBanner();
//     this.removeViolationOverlay();
//     this.removeAutoSubmitOverlay();
//     this.removeDelayOverlay();

//     this.restoreStyles();
//     this.restoreViewport();

//     this.isActive = false;
//     this.emitStateChange();
//     console.info('[Quiz Protection] Protection disabled');
//   }

//   private resetState(): void {
//     this.violations = [];
//     this.totalViolationCount = 0;
//     this.penaltySeconds = 0;
//     this.autoSubmitTriggered = false;
//     this.autoSubmitCountdownValue = 0;
//     this.isProcessingViolation = false;
//     this.isDelayActive = false;
//     this.delayRemainingSeconds = 0;
//     this.totalDelayTimeServed = 0;
//     this.currentDelayDuration = 0;
//     this.clearAllTimers();
//   }

//   private clearAllTimers(): void {
//     if (this.focusCheckTimer) { clearInterval(this.focusCheckTimer); this.focusCheckTimer = undefined; }
//     if (this.fullscreenRetryTimer) { clearInterval(this.fullscreenRetryTimer); this.fullscreenRetryTimer = undefined; }
//     if (this.autoSubmitCountdownTimer) { clearInterval(this.autoSubmitCountdownTimer); this.autoSubmitCountdownTimer = undefined; }
//     if (this.delayTimer) { clearInterval(this.delayTimer); this.delayTimer = undefined; }
//   }

//   setMode(mode: ExamMode): void {
//     const modeConfig = mode === 'casual' ? CASUAL_CONFIG : mode === 'proctored' ? PROCTORED_CONFIG : STANDARD_CONFIG;
//     Object.assign(this.config, modeConfig);
//     console.info(`[Quiz Protection] Mode set to: ${mode}`);
//   }

//   /**
//    * Update the violation config - call this after loading quiz settings from backend
//    */
//   setViolationConfig(cfg: Partial<QuizViolationConfig>): void {
//     Object.assign(this.config.violationConfig, cfg);
//     console.info('[Quiz Protection] Violation config updated:', this.config.violationConfig);
//   }

//   updateConfig(newConfig: Partial<ProtectionConfig>): void {
//     // Handle nested violationConfig
//     if (newConfig.violationConfig) {
//       Object.assign(this.config.violationConfig, newConfig.violationConfig);
//       delete newConfig.violationConfig;
//     }
//     Object.assign(this.config, newConfig);
    
//     if (this.isActive) {
//       this.removeWatermark();
//       if (this.config.watermarkEnabled) this.createWatermark();
//     }
//     this.emitStateChange();
//   }

//   getConfig(): ProtectionConfig { return { ...this.config, violationConfig: { ...this.config.violationConfig } }; }
//   getViolationConfig(): QuizViolationConfig { return { ...this.config.violationConfig }; }
//   isEnabled(): boolean { return this.isActive; }
//   isAutoSubmitTriggered(): boolean { return this.autoSubmitTriggered; }
//   isDelayModeActive(): boolean { return this.isDelayActive; }
//   getPenaltySeconds(): number { return this.penaltySeconds; }
//   getViolationCount(): number { return this.totalViolationCount; }
//   getViolations(): ViolationRecord[] { return [...this.violations]; }
//   getDelayRemaining(): number { return this.delayRemainingSeconds; }
//   getTotalDelayServed(): number { return this.totalDelayTimeServed; }

//   getState(): QuizProtectionState {
//     return {
//       isActive: this.isActive,
//       isFullscreen: this.isInFullscreen(),
//       violationCount: this.totalViolationCount,
//       violations: [...this.violations],
//       penaltySeconds: this.penaltySeconds,
//       lastViolation: this.violations.length > 0 ? this.violations[this.violations.length - 1].timestamp : undefined,
//       autoSubmitTriggered: this.autoSubmitTriggered,
//       autoSubmitCountdown: this.autoSubmitCountdownValue,
//       isDelayActive: this.isDelayActive,
//       delayRemainingSeconds: this.delayRemainingSeconds,
//       totalDelayTimeServed: this.totalDelayTimeServed,
//     };
//   }

//   enterFullscreen(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       this.requestFullscreen();
//       setTimeout(() => { this.isInFullscreen() ? resolve() : reject(new Error('Failed')); }, 500);
//     });
//   }

//   // ============================================================================
//   // VIOLATION HANDLING - MAIN LOGIC
//   // ============================================================================

//   private handleViolation(type: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
//     // Don't process if already in delay, auto-submit, or processing another violation
//     if (this.isProcessingViolation || this.autoSubmitTriggered || this.isDelayActive) {
//       console.log('[Quiz Protection] Skipping violation - already processing');
//       return;
//     }

//     this.isProcessingViolation = true;

//     // Record violation
//     const existingViolation = this.violations.find(v => v.type === type);
//     if (existingViolation) {
//       existingViolation.count++;
//       existingViolation.timestamp = new Date();
//     } else {
//       this.violations.push({ type, timestamp: new Date(), count: 1 });
//     }
//     this.totalViolationCount++;

//     const event = this.logEvent(type, details, severity);
//     this.onViolation.next(event);

//     const cfg = this.config.violationConfig;

//     // Check if max violations reached - always auto-submit if action includes auto-submit
//     if (this.totalViolationCount >= cfg.maxViolations && 
//         (cfg.action === 'AUTOSUBMIT_ONLY' || cfg.action === 'DELAY_AND_AUTOSUBMIT')) {
//       this.initiateAutoSubmit(type);
//       this.emitStateChange();
//       setTimeout(() => { this.isProcessingViolation = false; }, 1000);
//       return;
//     }

//     // Handle based on configured action
//     const remaining = cfg.maxViolations - this.totalViolationCount;

//     switch (cfg.action) {
//       case 'NONE':
//         // Just log, no action
//         console.log(`[Quiz Protection] Violation logged: ${type}`);
//         break;

//       case 'DELAY_ONLY':
//         // Delay user without auto-submit
//         this.notify(`⚠️ ${this.getViolationMessage(type)}. Access suspended for ${this.calculateDelayDuration()}s`);
//         this.startDelay(type, false);
//         break;

//       case 'AUTOSUBMIT_ONLY':
//         // Show warnings, will auto-submit at max
//         if (remaining <= 2) {
//           this.onAutoSubmitWarning.next({ remaining, total: cfg.maxViolations });
//           this.showCriticalWarning(type, remaining);
//         } else {
//           this.notify(`🚨 VIOLATION: ${this.getViolationMessage(type)}. ${remaining} warning(s) remaining before auto-submit.`);
//         }
//         break;

//       case 'DELAY_AND_AUTOSUBMIT':
//         // Delay on each violation, auto-submit at max
//         const willAutoSubmitNext = remaining === 1;
//         this.notify(`⚠️ ${this.getViolationMessage(type)}. Access suspended for ${this.calculateDelayDuration()}s`);
//         this.startDelay(type, willAutoSubmitNext);
//         break;
//     }

//     this.emitStateChange();
//     setTimeout(() => { this.isProcessingViolation = false; }, this.config.autoSubmitGracePeriodMs);
//   }

//   private getViolationMessage(type: string): string {
//     const messages: Record<string, string> = {
//       'screenshot-attempt': 'Screenshots are not allowed',
//       'context-menu-block': 'Right-click is not allowed',
//       'devtools-block': 'Developer tools are disabled',
//       'new-tab-block': 'Opening new tabs/windows is not allowed',
//       'focus-lost': 'Please stay on the quiz page',
//       'visibility-hidden': 'Switching tabs/apps is not allowed',
//       'fullscreen-exit': 'Fullscreen mode is required',
//       'clipboard-monitor': 'Clipboard access is restricted',
//       'unload-attempt': 'Leaving the page is not allowed',
//       'locked': 'Quiz access suspended',

//     };
//     return messages[type] || 'Violation detected';
//   }

//   // ============================================================================
//   // DELAY MODE IMPLEMENTATION
//   // ============================================================================

//   private calculateDelayDuration(): number {
//     const cfg = this.config.violationConfig;
//     let duration = cfg.delaySeconds;
//     if (cfg.delayIncrementOnRepeat && this.totalViolationCount > 1) {
//       const multiplier = Math.pow(cfg.delayMultiplier, this.totalViolationCount - 1);
//       duration = Math.min(Math.round(cfg.delaySeconds * multiplier), cfg.maxDelaySeconds);
//     }
//     return duration;
//   }


//   // NO CAP THE DELAY JUST GROWS
// // private calculateDelayDuration(): number {
// //   const cfg = this.config.violationConfig;
// //   let duration = cfg.delaySeconds;
// //   if (cfg.delayIncrementOnRepeat && this.totalViolationCount > 1) {
// //     const multiplier = Math.pow(cfg.delayMultiplier, this.totalViolationCount - 1);
// //     duration = Math.round(cfg.delaySeconds * multiplier);
// //   }
// //   return duration;
// // }




































































































  









//   private startDelay(violationType: string, willAutoSubmitNext: boolean): void {
//     console.log(`[Quiz Protection] Starting delay for violation: ${violationType}`);
//     const duration = this.calculateDelayDuration();
//     this.currentDelayDuration = duration;
//     this.delayRemainingSeconds = duration;
//     this.isDelayActive = true;
//     this.showDelayOverlay(violationType, duration, willAutoSubmitNext);
//     const cfg = this.config.violationConfig;
//     this.onDelayStarted.next({
//       violationType,
//       delayDuration: duration,
//       violationCount: this.totalViolationCount,
//       maxViolations: cfg.maxViolations,
//       willAutoSubmitNext,
//     });
    
//     this.playWarningSound();
    
//     this.delayTimer = window.setInterval(() => {
//       this.delayRemainingSeconds--;
//       this.onDelayTick.next(this.delayRemainingSeconds);
//       this.updateDelayOverlay();
//       this.emitStateChange();
      
//       if (this.delayRemainingSeconds <= 5 && this.delayRemainingSeconds > 0) {
//         this.playBeepSound();
//       }
      
//       if (this.delayRemainingSeconds <= 0) {
//         this.endDelay();
//       }
//     }, 1000);
//   }

//   private endDelay(): void {
//     if (this.delayTimer) {
//       clearInterval(this.delayTimer);
//       this.delayTimer = undefined;
//     }
    
//     this.totalDelayTimeServed += this.currentDelayDuration;
//     this.isDelayActive = false;
//     this.delayRemainingSeconds = 0;
    
//     this.removeDelayOverlay();
//     this.onDelayEnded.next();
//     this.emitStateChange();
    
//     if (this.config.enableFullscreenLock) {
//       setTimeout(() => this.requestFullscreen(), 300);
//     }
    
//     console.log('[Quiz Protection] Delay ended, quiz access restored');
//   }

//   private showDelayOverlay(violationType: string, duration: number, willAutoSubmitNext: boolean): void {
//     this.removeDelayOverlay();
    
//     const overlay = this.renderer.createElement('div');
//     this.delayOverlayElement = overlay;

//     this.renderer.setAttribute(overlay, 'id', 'delay-overlay');
//     this.renderer.setStyle(overlay, 'position', 'fixed');
//     this.renderer.setStyle(overlay, 'top', '0');
//     this.renderer.setStyle(overlay, 'left', '0');
//     this.renderer.setStyle(overlay, 'width', '100vw');
//     this.renderer.setStyle(overlay, 'height', '100vh');
//     this.renderer.setStyle(overlay, 'background', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)');
//     this.renderer.setStyle(overlay, 'display', 'flex');
//     this.renderer.setStyle(overlay, 'align-items', 'center');
//     this.renderer.setStyle(overlay, 'justify-content', 'center');
//     this.renderer.setStyle(overlay, 'z-index', '1000003');
//     this.renderer.setStyle(overlay, 'color', 'white');
//     this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

//     const cfg = this.config.violationConfig;
//     const remaining = cfg.maxViolations - this.totalViolationCount;
//     const warningColor = willAutoSubmitNext ? '#f44336' : '#ff9800';
    
//     let warningText: string;
//     if (cfg.action === 'DELAY_ONLY') {
//       warningText = `Violation ${this.totalViolationCount} recorded`;
//     } else if (willAutoSubmitNext) {
//       warningText = '⚠️ FINAL WARNING: Next violation will AUTO-SUBMIT your quiz!';
//     } else {
//       warningText = `${remaining} violation(s) remaining before auto-submit`;
//     }

//     overlay.innerHTML = `
//       <div style="text-align: center; padding: 40px; max-width: 500px;">
//         <h1 style="font-size: 28px; margin-bottom: 8px; color: #ff9800;">YOU HAVE BEEN SUSPENDED FOR ${this.calculateDelayDuration()} SECONDS</h1>
//         <p style="font-size: 16px; opacity: 0.8; margin-bottom: 16px;">${this.getViolationMessage(violationType)}</p>
        
//         <div style="position: relative; width: 180px; height: 180px; margin: 0 auto 24px;">
//           <svg width="180" height="180" style="transform: rotate(-90deg);">
//             <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="12"/>
//             <circle id="delay-circle" cx="90" cy="90" r="80" fill="none" stroke="#ff9800" stroke-width="12"
//               stroke-dasharray="502" stroke-dashoffset="0" stroke-linecap="round" style="transition: stroke-dashoffset 1s linear;"/>
//           </svg>
//           <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
//             <div id="delay-number" style="font-size: 48px; font-weight: bold; color: #ff9800;">${duration}</div>
//             <div style="font-size: 14px; opacity: 0.7;">seconds</div>
//           </div>
//         </div>
        
//         <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
//           <p style="font-size: 14px; margin: 0; color: ${warningColor};">
//             <strong>Violation ${this.totalViolationCount}</strong>
//           </p>
//           <p style="font-size: 13px; opacity: 0.7; margin: 8px 0 0 0;">${warningText}</p>
//         </div>
        
//         <p id="delay-status" style="font-size: 14px; color: #ff9800;">Quiz will resume in ${duration} seconds...</p>
        
//         <p style="font-size: 12px; opacity: 0.5; margin-top: 16px;">
//           Total time suspended: ${this.formatTime(this.totalDelayTimeServed)}
//         </p>
//       </div>
//     `;

//     this.renderer.appendChild(document.body, overlay);
//   }

//   private updateDelayOverlay(): void {
//     const numberEl = document.getElementById('delay-number');
//     const statusEl = document.getElementById('delay-status');
//     const circleEl = document.getElementById('delay-circle');

//     if (numberEl) {
//       numberEl.textContent = this.delayRemainingSeconds.toString();
//       if (this.delayRemainingSeconds <= 5) {
//         numberEl.style.color = '#f44336';
//       }
//     }

//     if (statusEl) {
//       if (this.delayRemainingSeconds <= 0) {
//         statusEl.textContent = 'Resuming quiz access...';
//         statusEl.style.color = '#4CAF50';
//       } else {
//         statusEl.textContent = `Quiz will resume in ${this.delayRemainingSeconds} second${this.delayRemainingSeconds !== 1 ? 's' : ''}...`;
//       }
//     }

//     if (circleEl) {
//       const circumference = 502;
//       const offset = circumference - (this.delayRemainingSeconds / this.currentDelayDuration) * circumference;
//       circleEl.style.strokeDashoffset = offset.toString();
//     }
//   }

//   private removeDelayOverlay(): void {
//     if (this.delayOverlayElement?.parentNode) {
//       this.renderer.removeChild(document.body, this.delayOverlayElement);
//       this.delayOverlayElement = undefined;
//     }
//   }

//   private formatTime(seconds: number): string {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     if (mins > 0) return `${mins}m ${secs}s`;
//     return `${secs}s`;
//   }

//   // ============================================================================
//   // AUTO-SUBMIT IMPLEMENTATION
//   // ============================================================================

//   private showCriticalWarning(type: string, remaining: number): void {
//     this.removeViolationOverlay();

//     const overlay = this.renderer.createElement('div');
//     this.violationOverlayElement = overlay;

//     this.renderer.setStyle(overlay, 'position', 'fixed');
//     this.renderer.setStyle(overlay, 'top', '0');
//     this.renderer.setStyle(overlay, 'left', '0');
//     this.renderer.setStyle(overlay, 'width', '100vw');
//     this.renderer.setStyle(overlay, 'height', '100vh');
//     this.renderer.setStyle(overlay, 'background', 'rgba(139, 0, 0, 0.95)');
//     this.renderer.setStyle(overlay, 'display', 'flex');
//     this.renderer.setStyle(overlay, 'align-items', 'center');
//     this.renderer.setStyle(overlay, 'justify-content', 'center');
//     this.renderer.setStyle(overlay, 'z-index', '1000002');
//     this.renderer.setStyle(overlay, 'color', 'white');
//     this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

//     const cfg = this.config.violationConfig;
    
//     overlay.innerHTML = `
//       <div style="text-align: center; padding: 40px; max-width: 500px;">
//         <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
//         <h1 style="font-size: 32px; margin-bottom: 16px; color: #ff6b6b;">CRITICAL WARNING</h1>
//         <p style="font-size: 20px; margin-bottom: 12px;">${this.getViolationMessage(type)}</p>
//         <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
//           <p style="font-size: 48px; font-weight: bold; color: #ff6b6b; margin: 0;">${remaining}</p>
//           <p style="font-size: 16px; opacity: 0.9; margin: 8px 0 0 0;">
//             warning${remaining !== 1 ? 's' : ''} remaining before<br><strong>AUTOMATIC SUBMISSION</strong>
//           </p>
//         </div>
//         <p style="font-size: 14px; opacity: 0.7; margin-bottom: 24px;">
//           Total violations: ${this.totalViolationCount} / ${cfg.maxViolations}
//         </p>
//         <button id="critical-warning-btn" style="
//           background: #4CAF50; color: white; border: none; padding: 16px 48px;
//           font-size: 18px; font-weight: 600; border-radius: 8px; cursor: pointer;
//         ">I Understand - Return to Quiz</button>
//       </div>
//     `;

//     this.renderer.appendChild(document.body, overlay);
//     this.playWarningSound();

//     const btn = overlay.querySelector('#critical-warning-btn');
//     if (btn) {
//       btn.addEventListener('click', () => {
//         this.removeViolationOverlay();
//         window.focus();
//         if (this.config.enableFullscreenLock) this.requestFullscreen();
//       });
//     }

//     setTimeout(() => {
//       if (this.violationOverlayElement === overlay) this.removeViolationOverlay();
//     }, 10000);
//   }

//   private initiateAutoSubmit(violationType: string): void {
//     if (this.autoSubmitTriggered) return;

//     console.warn('[Quiz Protection] INITIATING AUTO-SUBMIT');
//     this.autoSubmitTriggered = true;
    
//     const cfg = this.config.violationConfig;
//     this.autoSubmitCountdownValue = cfg.autoSubmitCountdownSeconds;

//     this.showAutoSubmitCountdownOverlay(violationType);

//     this.autoSubmitCountdownTimer = window.setInterval(() => {
//       this.autoSubmitCountdownValue--;
//       this.onAutoSubmitCountdown.next(this.autoSubmitCountdownValue);
//       this.updateAutoSubmitCountdown();
//       this.emitStateChange();

//       if (this.autoSubmitCountdownValue <= 3 && this.autoSubmitCountdownValue > 0) {
//         this.playBeepSound();
//       }

//       if (this.autoSubmitCountdownValue <= 0) {
//         this.executeAutoSubmit(violationType);
//       }
//     }, 1000);
//   }

//   private showAutoSubmitCountdownOverlay(violationType: string): void {
//     this.removeAutoSubmitOverlay();
//     this.removeViolationOverlay();
//     this.removeDelayOverlay();

//     const overlay = this.renderer.createElement('div');
//     this.autoSubmitOverlayElement = overlay;

//     this.renderer.setAttribute(overlay, 'id', 'auto-submit-overlay');
//     this.renderer.setStyle(overlay, 'position', 'fixed');
//     this.renderer.setStyle(overlay, 'top', '0');
//     this.renderer.setStyle(overlay, 'left', '0');
//     this.renderer.setStyle(overlay, 'width', '100vw');
//     this.renderer.setStyle(overlay, 'height', '100vh');
//     this.renderer.setStyle(overlay, 'background', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)');
//     this.renderer.setStyle(overlay, 'display', 'flex');
//     this.renderer.setStyle(overlay, 'align-items', 'center');
//     this.renderer.setStyle(overlay, 'justify-content', 'center');
//     this.renderer.setStyle(overlay, 'z-index', '1000003');
//     this.renderer.setStyle(overlay, 'color', 'white');
//     this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

//     const cfg = this.config.violationConfig;

//     overlay.innerHTML = `
//       <div style="text-align: center; padding: 40px; max-width: 500px;">
//         <div style="font-size: 64px; margin-bottom: 20px;">⛔</div>
//         <h1 style="font-size: 28px; margin-bottom: 8px; color: #f44336;">MAXIMUM VIOLATIONS REACHED</h1>
//         <p style="font-size: 16px; opacity: 0.8; margin-bottom: 24px;">Your quiz will be automatically submitted</p>
        
//         <div style="position: relative; width: 150px; height: 150px; margin: 0 auto 24px;">
//           <svg width="150" height="150" style="transform: rotate(-90deg);">
//             <circle cx="75" cy="75" r="65" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="10"/>
//             <circle id="countdown-circle" cx="75" cy="75" r="65" fill="none" stroke="#f44336" stroke-width="10"
//               stroke-dasharray="408" stroke-dashoffset="0" stroke-linecap="round" style="transition: stroke-dashoffset 1s linear;"/>
//           </svg>
//           <div id="countdown-number" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
//             font-size: 48px; font-weight: bold; color: #f44336;">${this.autoSubmitCountdownValue}</div>
//         </div>
        
//         <p style="font-size: 14px; opacity: 0.6; margin-bottom: 16px;">Violation: ${this.getViolationMessage(violationType)}</p>
        
//         <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
//           <p style="font-size: 13px; opacity: 0.7; margin: 0;">
//             Total Violations: <strong style="color: #f44336;">${this.totalViolationCount}</strong> | 
//             Delay Served: <strong style="color: #ff9800;">${this.formatTime(this.totalDelayTimeServed)}</strong>
//           </p>
//         </div>
        
//         <p id="countdown-status" style="font-size: 14px; color: #ff9800;">Submitting in ${this.autoSubmitCountdownValue} seconds...</p>
//       </div>
//     `;

//     this.renderer.appendChild(document.body, overlay);
//     this.playWarningSound();
//   }

//   private updateAutoSubmitCountdown(): void {
//     const numberEl = document.getElementById('countdown-number');
//     const statusEl = document.getElementById('countdown-status');
//     const circleEl = document.getElementById('countdown-circle');

//     const cfg = this.config.violationConfig;

//     if (numberEl) {
//       numberEl.textContent = this.autoSubmitCountdownValue.toString();
//       if (this.autoSubmitCountdownValue <= 3) {
//         numberEl.style.color = '#ff0000';
//         numberEl.style.fontSize = '56px';
//       }
//     }

//     if (statusEl) {
//       statusEl.textContent = this.autoSubmitCountdownValue <= 0 
//         ? 'Submitting now...' 
//         : `Submitting in ${this.autoSubmitCountdownValue} second${this.autoSubmitCountdownValue !== 1 ? 's' : ''}...`;
//       if (this.autoSubmitCountdownValue <= 0) statusEl.style.color = '#f44336';
//     }

//     if (circleEl) {
//       const circumference = 408;
//       const offset = circumference - (this.autoSubmitCountdownValue / cfg.autoSubmitCountdownSeconds) * circumference;
//       circleEl.style.strokeDashoffset = offset.toString();
//     }
//   }

//   private executeAutoSubmit(violationType: string): void {
//     if (this.autoSubmitCountdownTimer) {
//       clearInterval(this.autoSubmitCountdownTimer);
//       this.autoSubmitCountdownTimer = undefined;
//     }

//     console.warn('[Quiz Protection] EXECUTING AUTO-SUBMIT');

//     const statusEl = document.getElementById('countdown-status');
//     if (statusEl) {
//       statusEl.innerHTML = '<span style="color: #4CAF50;">✓ Submitting your quiz...</span>';
//     }

//     const cfg = this.config.violationConfig;
    
//     const autoSubmitEvent: AutoSubmitEvent = {
//       reason: `Maximum violations reached (${this.totalViolationCount}/${cfg.maxViolations})`,
//       violationType: violationType,
//       violations: [...this.violations],
//       totalViolations: this.totalViolationCount,
//       penaltySeconds: this.penaltySeconds,
//       totalDelayTimeServed: this.totalDelayTimeServed,
//       timestamp: new Date(),
//     };

//     this.logEvent('auto-submit-triggered', JSON.stringify(autoSubmitEvent), 'critical');
//     this.onAutoSubmit.next(autoSubmitEvent);
//     this.emitStateChange();
//   }

//   public showAutoSubmitComplete(message?: string): void {
//     this.removeAutoSubmitOverlay();



//     const overlay = this.renderer.createElement('div');
//     this.autoSubmitOverlayElement = overlay;
//     this.renderer.setStyle(overlay, 'position', 'fixed');
//     this.renderer.setStyle(overlay, 'top', '0');
//     this.renderer.setStyle(overlay, 'left', '0');
//     this.renderer.setStyle(overlay, 'width', '100vw');
//     this.renderer.setStyle(overlay, 'height', '100vh');
//     this.renderer.setStyle(overlay, 'background', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)');
//     this.renderer.setStyle(overlay, 'display', 'flex');
//     this.renderer.setStyle(overlay, 'align-items', 'center');
//     this.renderer.setStyle(overlay, 'justify-content', 'center');
//     this.renderer.setStyle(overlay, 'z-index', '1000003');
//     this.renderer.setStyle(overlay, 'color', 'white');
//     this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

//     overlay.innerHTML = `
//       <div style="text-align: center; padding: 40px;">
//         <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
//         <h1 style="font-size: 28px; margin-bottom: 16px;">Quiz Submitted</h1>
//         <p style="font-size: 16px; opacity: 0.8; margin-bottom: 8px;">
//           ${message || 'Your quiz has been automatically submitted due to security violations.'}
//         </p>
//         <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 20px 0;">
//           <p style="font-size: 14px; opacity: 0.7; margin: 0;">
//             Violations: ${this.totalViolationCount} | Delay Served: ${this.formatTime(this.totalDelayTimeServed)}
//           </p>
//         </div>
//         <p style="font-size: 14px; color: #4CAF50;">Redirecting to dashboard...</p>
//       </div>
//     `;

//     this.renderer.appendChild(document.body, overlay);
//   }

//   // ============================================================================
//   // AUDIO
//   // ============================================================================

//   private playWarningSound(): void {
//     try {
//       const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
//       const osc = ctx.createOscillator();
//       const gain = ctx.createGain();
//       osc.connect(gain);
//       gain.connect(ctx.destination);
//       osc.frequency.value = 440;
//       osc.type = 'sine';
//       gain.gain.setValueAtTime(0.3, ctx.currentTime);
//       gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
//       osc.start(ctx.currentTime);
//       osc.stop(ctx.currentTime + 0.5);
//     } catch (e) {
//       console.warn('[Quiz Protection] Could not play warning sound');
//     }
//   }

//   private playBeepSound(): void {
//     try {
//       const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
//       const osc = ctx.createOscillator();
//       const gain = ctx.createGain();
//       osc.connect(gain);
//       gain.connect(ctx.destination);
//       osc.frequency.value = 880;
//       osc.type = 'sine';
//       gain.gain.setValueAtTime(0.2, ctx.currentTime);
//       gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
//       osc.start(ctx.currentTime);
//       osc.stop(ctx.currentTime + 0.2);
//     } catch (e) {
//       console.warn('[Quiz Protection] Could not play beep sound');
//     }
//   }

//   public playCountdownBeep(): void { this.playBeepSound(); }
//   public playUrgentWarning(): void { this.playWarningSound(); }

//   // ============================================================================
//   // WATERMARK
//   // ============================================================================

//   private createWatermark(): void {
//     this.removeWatermark();
//     const watermark = this.renderer.createElement('div');
//     this.watermarkElement = watermark;
    
//     this.renderer.setAttribute(watermark, 'id', 'quiz-watermark');
//     this.renderer.setStyle(watermark, 'position', 'fixed');
//     this.renderer.setStyle(watermark, 'top', '0');
//     this.renderer.setStyle(watermark, 'left', '0');
//     this.renderer.setStyle(watermark, 'width', '100vw');
//     this.renderer.setStyle(watermark, 'height', '100vh');
//     this.renderer.setStyle(watermark, 'pointer-events', 'none');
//     this.renderer.setStyle(watermark, 'z-index', '999999');
//     this.renderer.setStyle(watermark, 'opacity', String(this.config.watermarkOpacity));
//     this.renderer.setStyle(watermark, 'user-select', 'none');
//     this.renderer.setStyle(watermark, 'overflow', 'hidden');

//     const userInfo = this.getUserInfo();
//     const timestamp = new Date().toISOString().split('T')[0];
//     const watermarkText = this.config.watermarkText || `${userInfo.username} • ${timestamp} • CONFIDENTIAL`;
    
//     for (let i = 0; i < this.config.watermarkCount; i++) {
//       const text = this.renderer.createElement('div');
//       this.renderer.setProperty(text, 'textContent', watermarkText);
//       this.renderer.setStyle(text, 'position', 'absolute');
//       this.renderer.setStyle(text, 'top', `${(i * 12) % 95}%`);
//       this.renderer.setStyle(text, 'left', `${(i * 8) % 95}%`);
//       this.renderer.setStyle(text, 'color', '#ff0000');
//       this.renderer.setStyle(text, 'font-size', '14px');
//       this.renderer.setStyle(text, 'font-weight', 'bold');
//       this.renderer.setStyle(text, 'font-family', 'monospace');
//       this.renderer.setStyle(text, 'transform', 'rotate(-35deg)');
//       this.renderer.setStyle(text, 'white-space', 'nowrap');
//       this.renderer.setStyle(text, 'user-select', 'none');
//       this.renderer.appendChild(watermark, text);
//     }

//     this.renderer.appendChild(document.body, watermark);
//   }

//   private removeWatermark(): void {
//     if (this.watermarkElement?.parentNode) {
//       this.renderer.removeChild(document.body, this.watermarkElement);
//       this.watermarkElement = undefined;
//     }
//   }

//   // ============================================================================
//   // STYLES
//   // ============================================================================

//   private applySecureStyles(): void {
//     const body = document.body;
//     body.dataset['originalUserSelect'] = body.style.userSelect || '';
//     this.renderer.setStyle(body, 'user-select', 'none');
//     this.renderer.setStyle(body, '-webkit-user-select', 'none');
//     this.renderer.setStyle(body, '-webkit-touch-callout', 'none');
//   }

//   private restoreStyles(): void {
//     const body = document.body;
//     const original = body.dataset['originalUserSelect'] || '';
//     body.style.userSelect = original;
//     delete body.dataset['originalUserSelect'];
//   }

//   // ============================================================================
//   // BLOCKING METHODS
//   // ============================================================================

//   private blockScreenshotShortcuts(): void {
//     const handler = this.renderer.listen('document', 'keydown', (e: KeyboardEvent) => {
//       let blocked = false;
//       let reason = '';

//       if (e.key === 'PrintScreen') { blocked = true; reason = 'Print Screen'; }
//       if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) { blocked = true; reason = 'Mac Screenshot'; }
//       if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') { blocked = true; reason = 'Windows Snip'; }
//       if (e.altKey && e.key === 'PrintScreen') { blocked = true; reason = 'Alt+Print Screen'; }

//       if (blocked) {
//         e.preventDefault();
//         e.stopPropagation();
//         e.stopImmediatePropagation();
//         this.clearClipboard();
//         this.handleViolation('screenshot-attempt', `Blocked: ${reason}`, 'high');
//       }
//     });
//     this.eventListeners.set('screenshot-block', handler);
//   }

//   private blockContextMenu(): void {
//     const handler = this.renderer.listen('document', 'contextmenu', (e: MouseEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       this.handleViolation('context-menu-block', 'Right-click blocked', 'low');
//       return false;
//     });
//     this.eventListeners.set('context-menu-block', handler);
//   }

//   private blockDevTools(): void {
//     const handler = this.renderer.listen('document', 'keydown', (e: KeyboardEvent) => {
//       let blocked = false;
//       if (e.key === 'F12') blocked = true;
//       if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'c', 'j'].includes(e.key.toLowerCase())) blocked = true;
//       if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') blocked = true;
//       if (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) blocked = true;

//       if (blocked) {
//         e.preventDefault();
//         e.stopPropagation();
//         e.stopImmediatePropagation();
//         this.handleViolation('devtools-block', `Blocked: ${e.key}`, 'medium');
//       }
//     });
//     this.eventListeners.set('devtools-block', handler);
//   }

//   private blockNewTabsAndWindows(): void {
//     const keyHandler = this.renderer.listen('document', 'keydown', (e: KeyboardEvent): boolean => {
//       const ctrl = e.ctrlKey || e.metaKey;
//       const key = e.key.toLowerCase();

//       if (ctrl && (key === 'n' || key === 't' || key === 'w')) {
//         e.preventDefault();
//         e.stopPropagation();
//         e.stopImmediatePropagation();
//         this.handleViolation('new-tab-block', `Blocked: Ctrl+${e.key}`, 'medium');
//         return false;
//       }
//       return true;
//     });

//     const clickHandler = (e: MouseEvent): boolean => {
//       if (e.button === 1 || ((e.ctrlKey || e.metaKey) && e.button === 0)) {
//         e.preventDefault();
//         e.stopPropagation();
//         e.stopImmediatePropagation();
//         this.handleViolation('new-tab-block', 'Middle/Ctrl-click blocked', 'medium');
//         return false;
//       }
//       return true;
//     };

//     document.addEventListener('click', clickHandler, { capture: true });
//     this.eventListeners.set('tab-block-key', keyHandler);
//     this.eventListeners.set('tab-block-click', () => document.removeEventListener('click', clickHandler, { capture: true }));
//   }

//   // ============================================================================
//   // MONITORING
//   // ============================================================================

//   private monitorClipboard(): void {
//     const handler = this.renderer.listen('window', 'keyup', (e: KeyboardEvent) => {
//       if (e.key === 'PrintScreen') {
//         this.clearClipboard();
//         this.handleViolation('clipboard-monitor', 'Print Screen - clipboard cleared', 'high');
//       }
//     });
//     this.eventListeners.set('clipboard-monitor', handler);
//   }

//   private monitorWindowFocus(): void {
//     const handler = this.renderer.listen('window', 'blur', () => {
//       if (!this.autoSubmitTriggered && !this.isDelayActive) {
//         this.handleViolation('focus-lost', 'Window lost focus', 'medium');
//       }
//       setTimeout(() => {
//         window.focus();
//         if (this.fullscreenActive && !this.isInFullscreen() && !this.isDelayActive) this.requestFullscreen();
//       }, 100);
//     });
//     this.eventListeners.set('focus-monitor', handler);
//   }

//   private monitorPageVisibility(): void {
//     const handler = this.renderer.listen('document', 'visibilitychange', () => {
//       if (document.hidden && !this.autoSubmitTriggered && !this.isDelayActive) {
//         this.handleViolation('visibility-hidden', 'Tab/app switched', 'high');
//       } else if (!this.isDelayActive) {
//         window.focus();
//         if (this.fullscreenActive && !this.isInFullscreen()) {
//           setTimeout(() => this.requestFullscreen(), 300);
//         }
//       }
//     });
//     this.eventListeners.set('visibility-monitor', handler);
//   }

//   private monitorBeforeUnload(): void {
//     const handler = this.renderer.listen('window', 'beforeunload', (e: BeforeUnloadEvent) => {
//       e.preventDefault();
//       e.returnValue = 'Quiz in progress. Are you sure you want to leave?';
//       this.logEvent('unload-attempt', 'User attempted to leave page', 'high');
//       return e.returnValue;
//     });
//     this.eventListeners.set('unload-monitor', handler);
//   }

//   // ============================================================================
//   // FULLSCREEN
//   // ============================================================================

//   private enableFullscreenLock(): void {
//     this.requestFullscreen();

//     const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
//     events.forEach(eventName => {
//       const handler = this.renderer.listen('document', eventName, () => {
//         const inFullscreen = this.isInFullscreen();
//         if (!inFullscreen && this.fullscreenActive && this.isActive && !this.autoSubmitTriggered && !this.isDelayActive) {
//           this.handleViolation('fullscreen-exit', 'Exited fullscreen', 'high');
//           window.focus();
//           setTimeout(() => this.requestFullscreen(), 300);
//         }
//         this.emitStateChange();
//       });
//       this.eventListeners.set(`fullscreen-${eventName}`, handler);
//     });

//     this.fullscreenRetryTimer = window.setInterval(() => {
//       if (this.isActive && this.fullscreenActive && !this.isInFullscreen() && !this.autoSubmitTriggered && !this.isDelayActive) {
//         this.requestFullscreen();
//       }
//     }, this.config.fullscreenRetryInterval);
//   }

//   private requestFullscreen(): void {
//     const elem = document.documentElement;
//     try {
//       if (elem.requestFullscreen) {
//         elem.requestFullscreen({ navigationUI: 'hide' } as any)
//           .then(() => { this.fullscreenActive = true; this.removeWarningBanner(); this.emitStateChange(); })
//           .catch(() => this.showWarningBanner());
//       } else if ((elem as any).webkitRequestFullscreen) {
//         (elem as any).webkitRequestFullscreen();
//         this.fullscreenActive = true;
//       } else if ((elem as any).mozRequestFullScreen) {
//         (elem as any).mozRequestFullScreen();
//         this.fullscreenActive = true;
//       } else if ((elem as any).msRequestFullscreen) {
//         (elem as any).msRequestFullscreen();
//         this.fullscreenActive = true;
//       } else {
//         this.showWarningBanner();
//       }
//     } catch (error) {
//       this.showWarningBanner();
//     }
//   }

//   private exitFullscreen(): void {
//     try {
//       if (document.exitFullscreen) document.exitFullscreen();
//       else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
//       else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen();
//       else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
//       this.fullscreenActive = false;
//     } catch (error) {}
//   }

//   private isInFullscreen(): boolean {
//     return !!(document.fullscreenElement || (document as any).webkitFullscreenElement || 
//               (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
//   }

//   // ============================================================================
//   // WAKE LOCK
//   // ============================================================================

//   private async requestWakeLock(): Promise<void> {
//     try {
//       if ('wakeLock' in navigator) {
//         this.wakeLock = await (navigator as any).wakeLock.request('screen');
//       }
//     } catch (error) {}
//   }

//   private releaseWakeLock(): void {
//     if (this.wakeLock) { this.wakeLock.release(); this.wakeLock = null; }
//   }

//   // ============================================================================
//   // MOBILE
//   // ============================================================================

//   private preventMobileZoom(): void {
//     const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
//     if (viewport) {
//       this.originalViewportContent = viewport.content;
//       viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
//     }

//     let lastTouchEnd = 0;
//     const doubleTapHandler = (e: TouchEvent) => {
//       const now = Date.now();
//       if (now - lastTouchEnd <= 300) e.preventDefault();
//       lastTouchEnd = now;
//     };
//     document.addEventListener('touchend', doubleTapHandler, { passive: false });
//     this.eventListeners.set('double-tap-block', () => document.removeEventListener('touchend', doubleTapHandler));
//   }

//   private preventMobilePinchZoom(): void {
//     const pinchHandler = (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault(); };
//     document.addEventListener('touchmove', pinchHandler, { passive: false });
//     this.eventListeners.set('pinch-block', () => document.removeEventListener('touchmove', pinchHandler));
//   }

//   private restoreViewport(): void {
//     const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
//     if (viewport && this.originalViewportContent) viewport.content = this.originalViewportContent;
//   }

//   // ============================================================================
//   // FOCUS ENFORCEMENT
//   // ============================================================================

//   private startFocusEnforcement(): void {
//     window.focus();
//     this.focusCheckTimer = window.setInterval(() => {
//       if ((!document.hasFocus() || document.hidden) && !this.autoSubmitTriggered && !this.isDelayActive) {
//         window.focus();
//         if (this.fullscreenActive && !this.isInFullscreen()) this.requestFullscreen();
//       }
//     }, this.config.focusCheckInterval);
//   }

//   // ============================================================================
//   // UI NOTIFICATIONS
//   // ============================================================================

//   private notify(message: string): void {
//     if (!this.config.enableAlerts) return;

//     const notification = this.renderer.createElement('div');
//     this.renderer.setStyle(notification, 'position', 'fixed');
//     this.renderer.setStyle(notification, 'top', '20px');
//     this.renderer.setStyle(notification, 'left', '50%');
//     this.renderer.setStyle(notification, 'transform', 'translateX(-50%)');
//     this.renderer.setStyle(notification, 'background', 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)');
//     this.renderer.setStyle(notification, 'color', 'white');
//     this.renderer.setStyle(notification, 'padding', '16px 32px');
//     this.renderer.setStyle(notification, 'border-radius', '12px');
//     this.renderer.setStyle(notification, 'box-shadow', '0 8px 24px rgba(0,0,0,0.4)');
//     this.renderer.setStyle(notification, 'z-index', '1000000');
//     this.renderer.setStyle(notification, 'font-size', '15px');
//     this.renderer.setStyle(notification, 'font-weight', '600');
//     this.renderer.setStyle(notification, 'font-family', 'system-ui, -apple-system, sans-serif');
//     this.renderer.setStyle(notification, 'max-width', '90vw');
//     this.renderer.setStyle(notification, 'text-align', 'center');
//     this.renderer.setProperty(notification, 'textContent', message);

//     this.renderer.appendChild(document.body, notification);
//     setTimeout(() => { if (notification.parentNode) this.renderer.removeChild(document.body, notification); }, 4000);
//   }

//   private showWarningBanner(): void {
//     if (this.warningBannerElement) return;

//     const banner = this.renderer.createElement('div');
//     this.warningBannerElement = banner;

//     this.renderer.setStyle(banner, 'position', 'fixed');
//     this.renderer.setStyle(banner, 'top', '0');
//     this.renderer.setStyle(banner, 'left', '0');
//     this.renderer.setStyle(banner, 'width', '100%');
//     this.renderer.setStyle(banner, 'background', 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)');
//     this.renderer.setStyle(banner, 'color', 'white');
//     this.renderer.setStyle(banner, 'text-align', 'center');
//     this.renderer.setStyle(banner, 'z-index', '1000001');
//     this.renderer.setStyle(banner, 'font-size', '14px');
//     this.renderer.setStyle(banner, 'font-weight', 'bold');
//     this.renderer.setProperty(banner, 'innerHTML', '⚠️ QUIZ MODE ACTIVE - Stay on this page ⚠️');

//     this.renderer.appendChild(document.body, banner);
//   }

//   private removeWarningBanner(): void {
//     if (this.warningBannerElement?.parentNode) {
//       this.renderer.removeChild(document.body, this.warningBannerElement);
//       this.warningBannerElement = undefined;
//     }
//   }

//   private showViolationOverlay(type: string): void {
//     this.removeViolationOverlay();
//     const overlay = this.renderer.createElement('div');
//     this.violationOverlayElement = overlay;
//     this.renderer.setStyle(overlay, 'position', 'fixed');
//     this.renderer.setStyle(overlay, 'top', '0');
//     this.renderer.setStyle(overlay, 'left', '0');
//     this.renderer.setStyle(overlay, 'width', '100vw');
//     this.renderer.setStyle(overlay, 'height', '100vh');
//     this.renderer.setStyle(overlay, 'background', 'rgba(0, 0, 0, 0.95)');
//     this.renderer.setStyle(overlay, 'display', 'flex');
//     this.renderer.setStyle(overlay, 'align-items', 'center');
//     this.renderer.setStyle(overlay, 'justify-content', 'center');
//     this.renderer.setStyle(overlay, 'z-index', '1000002');
//     this.renderer.setStyle(overlay, 'color', 'white');
//     this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

//     overlay.innerHTML = `
//       <div style="text-align: center; padding: 40px;">
//         <div style="font-size: 64px; margin-bottom: 20px;">🚫</div>
//         <h1 style="font-size: 28px; margin-bottom: 16px;">Navigation Blocked</h1>
//         <p style="font-size: 16px; opacity: 0.8; margin-bottom: 24px;">
//           ${this.getViolationMessage(type)}<br>Please return to the quiz.
//         </p>
//         <button id="return-to-quiz-btn" style="
//           background: #28a745; color: white; border: none; padding: 14px 32px;
//           font-size: 16px; font-weight: 600; border-radius: 8px; cursor: pointer;
//         ">Return to Quiz</button>
//       </div>
//     `;

//     this.renderer.appendChild(document.body, overlay);

//     const btn = overlay.querySelector('#return-to-quiz-btn');
//     if (btn) {
//       btn.addEventListener('click', () => {
//         this.removeViolationOverlay();
//         window.focus();
//         if (this.config.enableFullscreenLock) this.requestFullscreen();
//       });
//     }
//   }

//   private removeViolationOverlay(): void {
//     if (this.violationOverlayElement?.parentNode) {
//       this.renderer.removeChild(document.body, this.violationOverlayElement);
//       this.violationOverlayElement = undefined;
//     }
//   }

//   private removeAutoSubmitOverlay(): void {
//     if (this.autoSubmitOverlayElement?.parentNode) {
//       this.renderer.removeChild(document.body, this.autoSubmitOverlayElement);
//       this.autoSubmitOverlayElement = undefined;
//     }
//   }

//   // ============================================================================
//   // UTILITIES
//   // ============================================================================

//   private clearClipboard(): void {
//     try { navigator.clipboard?.writeText('').catch(() => {}); } catch (e) {}
//   }

//   private getUserInfo(): { username: string; userId: string } {
//     try {
//       const userData = localStorage.getItem('user');
//       if (userData) {
//         const user = JSON.parse(userData);
//         return { username: user.username || user.name || 'USER', userId: user.id || user.userId || 'unknown' };
//       }
//     } catch (error) {}
//     return { username: 'ANONYMOUS', userId: 'unknown' };
//   }

//   private logEvent(type: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): SecurityEvent {
//     const userInfo = this.getUserInfo();
//     const event: SecurityEvent = {
//       type,
//       timestamp: new Date().toISOString(),
//       userId: userInfo.userId,
//       username: userInfo.username,
//       details,
//       severity,
//     };

//     if (this.config.enableLogging) {
//       console.warn(`[Quiz Protection] ${type}:`, details);
//       this.http.post(this.config.logEndpoint, event).pipe(catchError(() => of(null))).subscribe();
//     }

//     return event;
//   }

//   private emitStateChange(): void {
//     this.onStateChange.next(this.getState());
//   }
// }




import { Injectable, Renderer2, RendererFactory2, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of, Subject, BehaviorSubject } from 'rxjs';
import baseUrl from './helper';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SecurityEvent {
  type: string;
  timestamp: string;
  userId: string;
  username: string;
  details?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ViolationRecord {
  type: string;
  timestamp: Date;
  count: number;
}

export type ExamMode = 'casual' | 'standard' | 'proctored';

/**
 * Violation Action Types:
 * - NONE: No action, just log
 * - DELAY_ONLY: Lock user for delaySeconds on each violation
 * - AUTOSUBMIT_ONLY: Auto-submit when maxViolations reached
 * - DELAY_AND_AUTOSUBMIT: Delay on each violation, auto-submit at max
 */
export type ViolationAction = 'NONE' | 'DELAY_ONLY' | 'AUTOSUBMIT_ONLY' | 'DELAY_AND_AUTOSUBMIT';

export interface QuizViolationConfig {
  action: ViolationAction;
  maxViolations: number;
  delaySeconds: number;
  delayIncrementOnRepeat: boolean;
  delayMultiplier: number;
  maxDelaySeconds: number;
  autoSubmitCountdownSeconds: number;
}

export interface ProtectionConfig {
  examMode: ExamMode;
  watermarkEnabled: boolean;
  watermarkOpacity: number;
  watermarkCount: number;
  watermarkText?: string;
  enableAlerts: boolean;
  enableLogging: boolean;
  logEndpoint: string;
  enableFullscreenLock: boolean;
  fullscreenRetryInterval: number;
  focusCheckInterval: number;
  autoSubmitGracePeriodMs: number;
  enableMobileProtection: boolean;
  preventZoom: boolean;
  enableScreenshotBlocking: boolean;
  enableDevToolsBlocking: boolean;
  enableWakeLock: boolean;

  // Violation config - this is what gets set from the Quiz settings
  violationConfig: QuizViolationConfig;
}

export interface QuizProtectionState {
  isActive: boolean;
  isFullscreen: boolean;
  violationCount: number;
  violations: ViolationRecord[];
  penaltySeconds: number;
  lastViolation?: Date;
  autoSubmitTriggered: boolean;
  autoSubmitCountdown?: number;
  isDelayActive: boolean;
  delayRemainingSeconds: number;
  totalDelayTimeServed: number;
}

export interface AutoSubmitEvent {
  reason: string;
  violationType: string;
  violations: ViolationRecord[];
  totalViolations: number;
  penaltySeconds: number;
  totalDelayTimeServed: number;
  timestamp: Date;
}

export type AutoSubmitPayload = AutoSubmitEvent;

export interface DelayEvent {
  violationType: string;
  delayDuration: number;
  violationCount: number;
  maxViolations: number;
  willAutoSubmitNext: boolean;
}

// ============================================================================
// DEFAULT CONFIGS
// ============================================================================

const DEFAULT_VIOLATION_CONFIG: QuizViolationConfig = {
  action: 'DELAY_AND_AUTOSUBMIT',
  maxViolations: 3,
  delaySeconds: 30,
  delayIncrementOnRepeat: true,
  delayMultiplier: 1.5,
  maxDelaySeconds: 100000,
  autoSubmitCountdownSeconds: 5,
};

const CASUAL_CONFIG: Partial<ProtectionConfig> = {
  examMode: 'casual',
  watermarkEnabled: false,
  enableFullscreenLock: false,
  enableScreenshotBlocking: false,
  enableDevToolsBlocking: false,
  enableAlerts: false,
  violationConfig: {
    action: 'NONE',
    maxViolations: 999,
    delaySeconds: 0,
    delayIncrementOnRepeat: false,
    delayMultiplier: 1,
    maxDelaySeconds: 100000,
    autoSubmitCountdownSeconds: 5,
  },
};

const STANDARD_CONFIG: Partial<ProtectionConfig> = {
  examMode: 'standard',
  watermarkEnabled: true,
  watermarkOpacity: 0.1,
  enableFullscreenLock: true,
  enableScreenshotBlocking: true,
  enableDevToolsBlocking: true,
  enableAlerts: true,
  violationConfig: {
    action: 'DELAY_ONLY',
    maxViolations: 5,
    delaySeconds: 30,
    delayIncrementOnRepeat: true,
    delayMultiplier: 1.5,
    maxDelaySeconds: 100000,
    autoSubmitCountdownSeconds: 5,
  },
};

const PROCTORED_CONFIG: Partial<ProtectionConfig> = {
  examMode: 'proctored',
  watermarkEnabled: true,
  watermarkOpacity: 0.15,
  watermarkCount: 30,
  enableFullscreenLock: true,
  enableScreenshotBlocking: true,
  enableDevToolsBlocking: true,
  enableAlerts: true,
  enableWakeLock: true,
  violationConfig: {
    action: 'DELAY_AND_AUTOSUBMIT',
    maxViolations: 3,
    delaySeconds: 30,
    delayIncrementOnRepeat: true,
    delayMultiplier: 1.5,
    maxDelaySeconds: 100000,
    autoSubmitCountdownSeconds: 5,
  },
};

// ============================================================================
// SERVICE
// ============================================================================

@Injectable({ providedIn: 'root' })
export class QuizProtectionService implements OnDestroy {
  private renderer: Renderer2;
  private eventListeners: Map<string, () => void> = new Map();
  private isActive = false;

  // UI Elements
  private watermarkElement?: HTMLElement;
  private warningBannerElement?: HTMLElement;
  private violationOverlayElement?: HTMLElement;
  private autoSubmitOverlayElement?: HTMLElement;
  private delayOverlayElement?: HTMLElement;

  // State
  private fullscreenActive = false;
  private focusCheckTimer?: number;
  private fullscreenRetryTimer?: number;
  private originalViewportContent = '';
  private wakeLock: any = null;

  // Violation tracking
  private violations: ViolationRecord[] = [];
  private totalViolationCount = 0;
  private penaltySeconds = 0;

  // Auto-submit state
  private autoSubmitTriggered = false;
  private autoSubmitCountdownTimer?: number;
  private autoSubmitCountdownValue = 0;
  private isProcessingViolation = false;

  // Delay state
  private isDelayActive = false;
  private delayRemainingSeconds = 0;
  private delayTimer?: number;
  private totalDelayTimeServed = 0;
  private currentDelayDuration = 0;

  // ============================================================================
  // BACKEND PERSISTENCE - Quiz context for saving/loading delay
  // ============================================================================
  private currentQuizId: number | null = null;
  private authToken: string = '';
  private backendBaseUrl: string = '';

  // PUBLIC EVENTS
  public readonly onViolation = new Subject<SecurityEvent>();
  public readonly onAutoSubmit = new Subject<AutoSubmitEvent>();
  public readonly onAutoSubmitCountdown = new Subject<number>();
  public readonly onAutoSubmitWarning = new Subject<{ remaining: number; total: number }>();
  public readonly onAutoSubmitCancelled = new Subject<void>();
  public readonly onDelayStarted = new Subject<DelayEvent>();
  public readonly onDelayTick = new Subject<number>();
  public readonly onDelayEnded = new Subject<void>();
  public readonly onStateChange = new BehaviorSubject<QuizProtectionState>(this.getState());

  // Configuration
  private config: ProtectionConfig = {
    examMode: 'standard',
    watermarkEnabled: true,
    watermarkOpacity: 0.12,
    watermarkCount: 25,
    enableAlerts: true,
    enableLogging: true,
    logEndpoint: '/api/security-events',
    enableFullscreenLock: true,
    fullscreenRetryInterval: 2000,
    focusCheckInterval: 1000,
    autoSubmitGracePeriodMs: 500,
    enableMobileProtection: true,
    preventZoom: true,
    enableScreenshotBlocking: true,
    enableDevToolsBlocking: true,
    enableWakeLock: true,
    violationConfig: { ...DEFAULT_VIOLATION_CONFIG },
  };

  constructor(private rendererFactory: RendererFactory2, private http: HttpClient) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  ngOnDestroy(): void { this.disableProtection(); }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  enableProtection(mode?: ExamMode): void {
    if (this.isActive) {
      console.warn('[Quiz Protection] Already enabled');
      return;
    }

    if (mode) this.setMode(mode);

    console.info(`[Quiz Protection] Enabling ${this.config.examMode} mode with action: ${this.config.violationConfig.action}`);

    try {
      this.resetState();

      if (this.config.watermarkEnabled) this.createWatermark();
      this.applySecureStyles();
      if (this.config.enableScreenshotBlocking) this.blockScreenshotShortcuts();
      this.blockContextMenu();
      if (this.config.enableDevToolsBlocking) this.blockDevTools();
      this.blockNewTabsAndWindows();
      this.monitorBeforeUnload();
      this.monitorClipboard();
      this.monitorWindowFocus();
      this.monitorPageVisibility();

      if (this.config.enableMobileProtection && this.config.preventZoom) {
        this.preventMobileZoom();
        this.preventMobilePinchZoom();
      }

      if (this.config.enableFullscreenLock) this.enableFullscreenLock();
      if (this.config.enableWakeLock) this.requestWakeLock();

      this.startFocusEnforcement();

      this.isActive = true;
      this.emitStateChange();
      console.info('[Quiz Protection] Protection enabled successfully');
    } catch (error) {
      console.error('[Quiz Protection] Failed to enable:', error);
      this.disableProtection();
      throw error;
    }
  }

  disableProtection(): void {
    if (!this.isActive) return;

    console.info('[Quiz Protection] Disabling protection...');

    this.clearAllTimers();

    this.eventListeners.forEach((cleanup) => { try { cleanup(); } catch (e) {} });
    this.eventListeners.clear();

    this.releaseWakeLock();
    if (this.fullscreenActive) this.exitFullscreen();

    this.removeWatermark();
    this.removeWarningBanner();
    this.removeViolationOverlay();
    this.removeAutoSubmitOverlay();
    this.removeDelayOverlay();

    this.restoreStyles();
    this.restoreViewport();

    this.isActive = false;
    this.emitStateChange();
    console.info('[Quiz Protection] Protection disabled');
  }

  private resetState(): void {
    this.violations = [];
    this.totalViolationCount = 0;
    this.penaltySeconds = 0;
    this.autoSubmitTriggered = false;
    this.autoSubmitCountdownValue = 0;
    this.isProcessingViolation = false;
    this.isDelayActive = false;
    this.delayRemainingSeconds = 0;
    this.totalDelayTimeServed = 0;
    this.currentDelayDuration = 0;
    this.clearAllTimers();
  }

  private clearAllTimers(): void {
    if (this.focusCheckTimer) { clearInterval(this.focusCheckTimer); this.focusCheckTimer = undefined; }
    if (this.fullscreenRetryTimer) { clearInterval(this.fullscreenRetryTimer); this.fullscreenRetryTimer = undefined; }
    if (this.autoSubmitCountdownTimer) { clearInterval(this.autoSubmitCountdownTimer); this.autoSubmitCountdownTimer = undefined; }
    if (this.delayTimer) { clearInterval(this.delayTimer); this.delayTimer = undefined; }
  }

  setMode(mode: ExamMode): void {
    const modeConfig = mode === 'casual' ? CASUAL_CONFIG : mode === 'proctored' ? PROCTORED_CONFIG : STANDARD_CONFIG;
    Object.assign(this.config, modeConfig);
    console.info(`[Quiz Protection] Mode set to: ${mode}`);
  }

  /**
   * Update the violation config - call this after loading quiz settings from backend
   */
  setViolationConfig(cfg: Partial<QuizViolationConfig>): void {
    Object.assign(this.config.violationConfig, cfg);
    console.info('[Quiz Protection] Violation config updated:', this.config.violationConfig);
  }

  updateConfig(newConfig: Partial<ProtectionConfig>): void {
    if (newConfig.violationConfig) {
      Object.assign(this.config.violationConfig, newConfig.violationConfig);
      delete newConfig.violationConfig;
    }
    Object.assign(this.config, newConfig);

    if (this.isActive) {
      this.removeWatermark();
      if (this.config.watermarkEnabled) this.createWatermark();
    }
    this.emitStateChange();
  }

  getConfig(): ProtectionConfig { return { ...this.config, violationConfig: { ...this.config.violationConfig } }; }
  getViolationConfig(): QuizViolationConfig { return { ...this.config.violationConfig }; }
  isEnabled(): boolean { return this.isActive; }
  isAutoSubmitTriggered(): boolean { return this.autoSubmitTriggered; }
  isDelayModeActive(): boolean { return this.isDelayActive; }
  getPenaltySeconds(): number { return this.penaltySeconds; }
  getViolationCount(): number { return this.totalViolationCount; }
  getViolations(): ViolationRecord[] { return [...this.violations]; }
  getDelayRemaining(): number { return this.delayRemainingSeconds; }
  getTotalDelayServed(): number { return this.totalDelayTimeServed; }

  getState(): QuizProtectionState {
    return {
      isActive: this.isActive,
      isFullscreen: this.isInFullscreen(),
      violationCount: this.totalViolationCount,
      violations: [...this.violations],
      penaltySeconds: this.penaltySeconds,
      lastViolation: this.violations.length > 0 ? this.violations[this.violations.length - 1].timestamp : undefined,
      autoSubmitTriggered: this.autoSubmitTriggered,
      autoSubmitCountdown: this.autoSubmitCountdownValue,
      isDelayActive: this.isDelayActive,
      delayRemainingSeconds: this.delayRemainingSeconds,
      totalDelayTimeServed: this.totalDelayTimeServed,
    };
  }

  enterFullscreen(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.requestFullscreen();
      setTimeout(() => { this.isInFullscreen() ? resolve() : reject(new Error('Failed')); }, 500);
    });
  }

  // ============================================================================
  // BACKEND PERSISTENCE - Public methods called from component
  // ============================================================================
// private jwtToken = localStorage.getItem('token')
  /**
   * 
   * 
   * 
   * Call this from the component after enableProtection() to wire up backend persistence.
   * Example:
   *   this.quizProtection.enableProtection();
   *   this.quizProtection.setQuizContext(this.qid, environment.apiUrl, localStorage.getItem('token') || '');
   */


  // REPLACE with a getter so it's always fresh:
private get jwtToken(): string {
  return localStorage.getItem('access_token') || '';
}


  // public setQuizContext(quizId: number, baseUrl: string, token: string): void {
  //   this.currentQuizId = quizId;
  //   this.backendBaseUrl = baseUrl;
  //   this.authToken = token;
  //   console.info('[Quiz Protection] Quiz context set for quiz:', quizId);
  // }





  public setQuizContext(quizId: number, baseUrl: string, token: string): void {
  this.currentQuizId = quizId;
  this.backendBaseUrl = baseUrl;
  this.authToken = token;
  console.log('[QuizProtection] setQuizContext called:', {
    quizId,
    baseUrl,
    tokenProvided: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'NULL',
    jwtTokenFromGetter: this.jwtToken ? this.jwtToken.substring(0, 20) + '...' : 'NULL'
  });
}
  /**
   * Call this from initializeTimer() in the component on page/quiz load.
   * Restores the persisted totalDelayTimeServed from the backend.
   * Example:
   *   this.quizProtection.loadDelayFromBackend(this.qid);
   */

// public loadDelayFromBackend(quizId: number): void {
//   if (!this.backendBaseUrl || !this.jwtToken) {  // ← was: if (!baseUrl || !this.authToken)
//     console.warn('[Quiz Protection] loadDelayFromBackend called before setQuizContext');
//     return;
//   }
//   this.currentQuizId = quizId;
//   const headers = new HttpHeaders({
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${this.jwtToken}`,
//   });
//   this.http.get<{ violationDelayTime: number }>(
//     `${this.backendBaseUrl}/quiz-timer/getViolation-delay/${quizId}`,  // ← was: baseUrl/...
//     { headers }
//   ).pipe(
//     catchError(err => {
//       if (err.status === 404) return of(null);
//       console.error('[Quiz Protection] Error loading delay:', err);
//       return of(null);
//     })
//   ).subscribe(response => {
//     if (response?.violationDelayTime && response.violationDelayTime > 0) {
//       this.totalDelayTimeServed = response.violationDelayTime;
//       console.log('[Quiz Protection] Delay restored:', this.totalDelayTimeServed);
//       this.emitStateChange();
//     }
//   });
// }






// THIS LOADFROMBACKEND WORKS

// public loadDelayFromBackend(quizId: number): void {
//   console.log('[QuizProtection] loadDelayFromBackend called:', {
//     quizId,
//     backendBaseUrl: this.backendBaseUrl,
//     hasToken: !!this.jwtToken,
//     tokenPreview: this.jwtToken ? this.jwtToken.substring(0, 20) + '...' : 'NULL'
//   });
//   if (!this.backendBaseUrl || !this.jwtToken) {
//     console.warn('[QuizProtection] loadDelayFromBackend ABORTED - missing:', {
//       backendBaseUrl: this.backendBaseUrl,
//       jwtToken: this.jwtToken ? 'present' : 'MISSING'
//     });
//     return;
//   }
//   this.currentQuizId = quizId;
//   const url = `${this.backendBaseUrl}/quiz-timer/getViolation-delay/${quizId}`;
//   console.log('[QuizProtection] Sending GET to:', url);
//   const headers = new HttpHeaders({
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${this.jwtToken}`,
//   });
//   this.http.get<{ violationDelayTime: number }>(url, { headers }).pipe(
//     catchError(err => {
//       if (err.status === 404) {
//         console.log('[QuizProtection] loadDelayFromBackend 404 - no saved delay, starting fresh');
//         return of(null);
//       }
//       console.error('[QuizProtection] loadDelayFromBackend FAILED:', {
//         status: err.status,
//         message: err.message,
//         url
//       });
//       return of(null);
//     })
//   ).subscribe(response => {
//     console.log('[QuizProtection] loadDelayFromBackend response:', response);
//     if (response?.violationDelayTime && response.violationDelayTime > 0) {
//       this.totalDelayTimeServed = response.violationDelayTime;
//       console.log('[QuizProtection] Delay restored:', this.totalDelayTimeServed);
//       this.emitStateChange();
//     } else {
//       console.log('[QuizProtection] No delay to restore (response empty or zero)');
//     }
//   });
 
// }




// NEW 




public loadDelayFromBackend(quizId: number): void {
  console.log('[QuizProtection] loadDelayFromBackend called:', {
    quizId,
    backendBaseUrl: this.backendBaseUrl,
    hasToken: !!this.jwtToken,
    tokenPreview: this.jwtToken ? this.jwtToken.substring(0, 20) + '...' : 'NULL'
  });
  if (!this.backendBaseUrl || !this.jwtToken) {
    console.warn('[QuizProtection] loadDelayFromBackend ABORTED - missing:', {
      backendBaseUrl: this.backendBaseUrl,
      jwtToken: this.jwtToken ? 'present' : 'MISSING'
    });
    return;
  }
  this.currentQuizId = quizId;
  const url = `${this.backendBaseUrl}/quiz-timer/getViolation-delay/${quizId}`;
  console.log('[QuizProtection] Sending GET to:', url);
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.jwtToken}`,
  });
  this.http.get<{ violationDelayTime: number }>(url, { headers }).pipe(
    catchError(err => {
      if (err.status === 404) {
        console.log('[QuizProtection] loadDelayFromBackend 404 - no saved delay, starting fresh');
        return of(null);
      }
      console.error('[QuizProtection] loadDelayFromBackend FAILED:', {
        status: err.status,
        message: err.message,
        url
      });
      return of(null);
    })
  ).subscribe(response => {
    console.log('[QuizProtection] loadDelayFromBackend response:', response);
    
    const remaining = response?.violationDelayTime ?? 0;

    if (remaining > 0) {
      console.log('[QuizProtection] Resuming unfinished delay:', remaining, 'seconds left');
      
      this.currentDelayDuration = remaining;
      this.delayRemainingSeconds = remaining;
      this.isDelayActive = true;
      this.showDelayOverlay('locked', remaining, false);
      this.playWarningSound();

      this.delayTimer = window.setInterval(() => {
        this.delayRemainingSeconds--;
        this.onDelayTick.next(this.delayRemainingSeconds);
        this.updateDelayOverlay();
        this.emitStateChange();
        this.saveDelayToBackend(this.delayRemainingSeconds);

        if (this.delayRemainingSeconds <= 5 && this.delayRemainingSeconds > 0) {
          this.playBeepSound();
        }

        if (this.delayRemainingSeconds <= 0) {
          this.endDelay();
        }
      }, 1000);

    } else {
      console.log('[QuizProtection] No pending delay (0 or null), starting fresh');
    }
  });
 
}






























  // public loadDelayFromBackend(quizId: number): void {
  //   if (!baseUrl || !this.authToken) {
  //     console.warn('[Quiz Protection] loadDelayFromBackend called before setQuizContext');
  //     return;
  //   }

  //   this.currentQuizId = quizId;

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${this.jwtToken}`,
  //   });

  //   this.http.get<{ violationDelayTime: number }>(
  //     `${baseUrl}/quiz-progress/getViolation-delay/${quizId}`,
  //     { headers }
  //   ).pipe(
  //     catchError(err => {
  //       if (err.status === 404) {
  //         console.log('[Quiz Protection] No saved delay found (404), starting fresh');
  //         return of(null);
  //       }
  //       console.error('[Quiz Protection] Error loading delay from backend:', err);
  //       return of(null);
  //     })
  //   ).subscribe(response => {
  //     if (response?.violationDelayTime) {
  //       this.totalDelayTimeServed = response.violationDelayTime;
  //       console.log('[Quiz Protection] Delay restored from backend:', this.totalDelayTimeServed, 'seconds');
  //       this.emitStateChange();
  //     }
  //   });
  // }

  /**
   * Saves the current cumulative delay to backend.
   * Called automatically on every tick and on delay end — no need to call manually.
   */


//   private saveDelayToBackend(totalDelayServed: number): void {
//   if (!this.currentQuizId || !this.backendBaseUrl || !this.jwtToken) return;  // ← was: !baseUrl

//   const headers = new HttpHeaders({
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${this.jwtToken}`,
//   });
//   this.http.post(
//     `${this.backendBaseUrl}/quiz-timer/saveViolation-delay/${this.currentQuizId}`,  // ← was: baseUrl/...
//     { violationDelayTime: totalDelayServed },
//     { headers }
//   ).pipe(catchError(() => of(null))).subscribe();
// }


private saveDelayToBackend(duration: number): void {
  console.log('[QuizProtection] saveDelayToBackend called:', {
    currentQuizId: this.currentQuizId,
    backendBaseUrl: this.backendBaseUrl,
    hasToken: !!this.jwtToken,
    tokenPreview: this.jwtToken ? this.jwtToken.substring(0, 20) + '...' : 'NULL',
    duration
  });

  if (!this.currentQuizId || !this.backendBaseUrl || !this.jwtToken) {
    console.warn('[QuizProtection] saveDelayToBackend ABORTED - missing:', {
      currentQuizId: this.currentQuizId,
      backendBaseUrl: this.backendBaseUrl,
      jwtToken: this.jwtToken ? 'present' : 'MISSING'
    });
    return;
  }

  const url = `${this.backendBaseUrl}/quiz-timer/saveViolation-delay/${this.currentQuizId}`;
  const payload = { violationDelayTime: duration };
  console.log('[QuizProtection] Sending POST to:', url, 'payload:', payload);

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.jwtToken}`,
  });

  this.http.post(url, payload, { headers }).pipe(
    catchError(err => {
      console.error('[QuizProtection] saveDelayToBackend FAILED:', {
        status: err.status,
        message: err.message,
        url
      });
      return of(null);
    })
  ).subscribe(response => {
    console.log('[QuizProtection] saveDelayToBackend SUCCESS:', response);
  });
}
  

  // private saveDelayToBackend(totalDelayServed: number): void {
  //   if (!this.currentQuizId || !baseUrl || !this.jwtToken) return;

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${this.jwtToken}`,
  //   });

  //   this.http.post(
  //     `${baseUrl}/quiz-progress/saveViolation-delay/${this.currentQuizId}`,
  //     { remainingDelayTime: totalDelayServed },
  //     { headers }
  //   ).pipe(catchError(() => of(null))).subscribe({
  //     next: () => console.log('[Quiz Protection] Delay saved to backend:', totalDelayServed),
  //     error: (err) => console.error('[Quiz Protection] Failed to save delay:', err),
  //   });
  // }

  // ============================================================================
  // VIOLATION HANDLING - MAIN LOGIC
  // ============================================================================

  private handleViolation(type: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    if (this.isProcessingViolation || this.autoSubmitTriggered || this.isDelayActive) {
      console.log('[Quiz Protection] Skipping violation - already processing');
      return;
    }

    this.isProcessingViolation = true;

    const existingViolation = this.violations.find(v => v.type === type);
    if (existingViolation) {
      existingViolation.count++;
      existingViolation.timestamp = new Date();
    } else {
      this.violations.push({ type, timestamp: new Date(), count: 1 });
    }
    this.totalViolationCount++;

    const event = this.logEvent(type, details, severity);
    this.onViolation.next(event);

    const cfg = this.config.violationConfig;

    if (this.totalViolationCount >= cfg.maxViolations &&
      (cfg.action === 'AUTOSUBMIT_ONLY' || cfg.action === 'DELAY_AND_AUTOSUBMIT')) {
      this.initiateAutoSubmit(type);
      this.emitStateChange();
      setTimeout(() => { this.isProcessingViolation = false; }, 1000);
      return;
    }

    const remaining = cfg.maxViolations - this.totalViolationCount;

    switch (cfg.action) {
      case 'NONE':
        console.log(`[Quiz Protection] Violation logged: ${type}`);
        break;

      case 'DELAY_ONLY':
        this.notify(`⚠️ ${this.getViolationMessage(type)}. Access suspended for ${this.calculateDelayDuration()}s`);
        this.startDelay(type, false);
        break;

      case 'AUTOSUBMIT_ONLY':
        if (remaining <= 2) {
          this.onAutoSubmitWarning.next({ remaining, total: cfg.maxViolations });
          this.showCriticalWarning(type, remaining);
        } else {
          this.notify(`🚨 VIOLATION: ${this.getViolationMessage(type)}. ${remaining} warning(s) remaining before auto-submit.`);
        }
        break;

      case 'DELAY_AND_AUTOSUBMIT':
        const willAutoSubmitNext = remaining === 1;
        this.notify(`⚠️ ${this.getViolationMessage(type)}. Access suspended for ${this.calculateDelayDuration()}s`);
        this.startDelay(type, willAutoSubmitNext);
        break;
    }

    this.emitStateChange();
    setTimeout(() => { this.isProcessingViolation = false; }, this.config.autoSubmitGracePeriodMs);
  }

  private getViolationMessage(type: string): string {
    const messages: Record<string, string> = {
      'screenshot-attempt': 'Screenshots are not allowed',
      'context-menu-block': 'Right-click is not allowed',
      'devtools-block': 'Developer tools are disabled',
      'new-tab-block': 'Opening new tabs/windows is not allowed',
      'focus-lost': 'Please stay on the quiz page',
      'visibility-hidden': 'Switching tabs/apps is not allowed',
      'fullscreen-exit': 'Fullscreen mode is required',
      'clipboard-monitor': 'Clipboard access is restricted',
      'unload-attempt': 'Leaving the page is not allowed',
      'locked': 'Quiz access suspended',
    };
    return messages[type] || 'Violation detected';
  }

  // ============================================================================
  // DELAY MODE IMPLEMENTATION
  // ============================================================================

  private calculateDelayDuration(): number {
    const cfg = this.config.violationConfig;
    let duration = cfg.delaySeconds;
    if (cfg.delayIncrementOnRepeat && this.totalViolationCount > 1) {
      const multiplier = Math.pow(cfg.delayMultiplier, this.totalViolationCount - 1);
      duration = Math.min(Math.round(cfg.delaySeconds * multiplier), cfg.maxDelaySeconds);
    }
    return duration;
  }

  private startDelay(violationType: string, willAutoSubmitNext: boolean): void {
    console.log(`[Quiz Protection] Starting delay for violation: ${violationType}`);

    const duration = this.calculateDelayDuration();
    this.currentDelayDuration = duration;
    this.delayRemainingSeconds = duration;
    this.isDelayActive = true;

    this.showDelayOverlay(violationType, duration, willAutoSubmitNext);

    const cfg = this.config.violationConfig;
    this.onDelayStarted.next({
      violationType,
      delayDuration: duration,
      violationCount: this.totalViolationCount,
      maxViolations: cfg.maxViolations,
      willAutoSubmitNext,
    });

    this.playWarningSound();
    this.delayTimer = window.setInterval(() => {
  this.delayRemainingSeconds--;
  this.onDelayTick.next(this.delayRemainingSeconds);
  this.updateDelayOverlay();
  this.emitStateChange();

  // ✅ Save remaining seconds (counts DOWN: 200 → 199 → 198...)
  this.saveDelayToBackend(this.delayRemainingSeconds);

  if (this.delayRemainingSeconds <= 5 && this.delayRemainingSeconds > 0) {
    this.playBeepSound();
  }

  if (this.delayRemainingSeconds <= 0) {
    this.endDelay();
  }
}, 1000);

    // this.delayTimer = window.setInterval(() => {
    //   this.delayRemainingSeconds--;
    //   this.onDelayTick.next(this.delayRemainingSeconds);
    //   this.updateDelayOverlay();
    //   this.emitStateChange();

    //   // Save running total on every tick so reload always has the latest value
    //   const runningTotal = this.totalDelayTimeServed + (this.currentDelayDuration - this.delayRemainingSeconds);
    //   this.saveDelayToBackend(this.delayRemainingSeconds);

    //   if (this.delayRemainingSeconds <= 5 && this.delayRemainingSeconds > 0) {
    //     this.playBeepSound();
    //   }

    //   if (this.delayRemainingSeconds <= 0) {
    //     this.endDelay();
    //   }
    // }, 1000);





  }


  private endDelay(): void {
  if (this.delayTimer) {
    clearInterval(this.delayTimer);
    this.delayTimer = undefined;
  }

  this.totalDelayTimeServed += this.currentDelayDuration;
  this.isDelayActive = false;
  this.delayRemainingSeconds = 0;

  // ✅ Save 0 = delay fully completed
  this.saveDelayToBackend(0);

  this.removeDelayOverlay();
  this.onDelayEnded.next();
  this.emitStateChange();

  if (this.config.enableFullscreenLock) {
    setTimeout(() => this.requestFullscreen(), 300);
  }
}
  // private endDelay(): void {
  //   if (this.delayTimer) {
  //     clearInterval(this.delayTimer);
  //     this.delayTimer = undefined;
  //   }

  //   this.totalDelayTimeServed += this.currentDelayDuration;
  //   this.isDelayActive = false;
  //   this.delayRemainingSeconds = 0;

  //   // Save final confirmed total on delay end
  //   this.saveDelayToBackend(this.totalDelayTimeServed);

  //   this.removeDelayOverlay();
  //   this.onDelayEnded.next();
  //   this.emitStateChange();

  //   if (this.config.enableFullscreenLock) {
  //     setTimeout(() => this.requestFullscreen(), 300);
  //   }

  //   console.log('[Quiz Protection] Delay ended, quiz access restored');
  // }

  private showDelayOverlay(violationType: string, duration: number, willAutoSubmitNext: boolean): void {
    this.removeDelayOverlay();

    const overlay = this.renderer.createElement('div');
    this.delayOverlayElement = overlay;

    this.renderer.setAttribute(overlay, 'id', 'delay-overlay');
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw');
    this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'background', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)');
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'align-items', 'center');
    this.renderer.setStyle(overlay, 'justify-content', 'center');
    this.renderer.setStyle(overlay, 'z-index', '1000003');
    this.renderer.setStyle(overlay, 'color', 'white');
    this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

    const cfg = this.config.violationConfig;
    const remaining = cfg.maxViolations - this.totalViolationCount;
    const warningColor = willAutoSubmitNext ? '#f44336' : '#ff9800';

    let warningText: string;
    if (cfg.action === 'DELAY_ONLY') {
      warningText = `Violation ${this.totalViolationCount} recorded`;
    } else if (willAutoSubmitNext) {
      warningText = '⚠️ FINAL WARNING: Next violation will AUTO-SUBMIT your quiz!';
    } else {
      warningText = `${remaining} violation(s) remaining before auto-submit`;
    }

    overlay.innerHTML = `
      <div style="text-align: center; padding: 40px; max-width: 500px;">
        <h1 style="font-size: 28px; margin-bottom: 8px; color: #ff9800;">YOU HAVE BEEN SUSPENDED FOR ${this.calculateDelayDuration()} SECONDS</h1>
        <p style="font-size: 16px; opacity: 0.8; margin-bottom: 16px;">${this.getViolationMessage(violationType)}</p>

        <div style="position: relative; width: 180px; height: 180px; margin: 0 auto 24px;">
          <svg width="180" height="180" style="transform: rotate(-90deg);">
            <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="12"/>
            <circle id="delay-circle" cx="90" cy="90" r="80" fill="none" stroke="#ff9800" stroke-width="12"
              stroke-dasharray="502" stroke-dashoffset="0" stroke-linecap="round" style="transition: stroke-dashoffset 1s linear;"/>
          </svg>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
            <div id="delay-number" style="font-size: 48px; font-weight: bold; color: #ff9800;">${duration}</div>
            <div style="font-size: 14px; opacity: 0.7;">seconds</div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-size: 14px; margin: 0; color: ${warningColor};">
            <strong>Violation ${this.totalViolationCount}</strong>
          </p>
          <p style="font-size: 13px; opacity: 0.7; margin: 8px 0 0 0;">${warningText}</p>
        </div>

        <p id="delay-status" style="font-size: 14px; color: #ff9800;">Quiz will resume in ${duration} seconds...</p>

        <p style="font-size: 12px; opacity: 0.5; margin-top: 16px;">
          Total time suspended: ${this.formatTime(this.totalDelayTimeServed)}
        </p>
      </div>
    `;

    this.renderer.appendChild(document.body, overlay);
  }

  private updateDelayOverlay(): void {
    const numberEl = document.getElementById('delay-number');
    const statusEl = document.getElementById('delay-status');
    const circleEl = document.getElementById('delay-circle');

    if (numberEl) {
      numberEl.textContent = this.delayRemainingSeconds.toString();
      if (this.delayRemainingSeconds <= 5) {
        numberEl.style.color = '#f44336';
      }
    }

    if (statusEl) {
      if (this.delayRemainingSeconds <= 0) {
        statusEl.textContent = 'Resuming quiz access...';
        statusEl.style.color = '#4CAF50';
      } else {
        statusEl.textContent = `Quiz will resume in ${this.delayRemainingSeconds} second${this.delayRemainingSeconds !== 1 ? 's' : ''}...`;
      }
    }

    if (circleEl) {
      const circumference = 502;
      const offset = circumference - (this.delayRemainingSeconds / this.currentDelayDuration) * circumference;
      circleEl.style.strokeDashoffset = offset.toString();
    }
  }

  private removeDelayOverlay(): void {
    if (this.delayOverlayElement?.parentNode) {
      this.renderer.removeChild(document.body, this.delayOverlayElement);
      this.delayOverlayElement = undefined;
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  // ============================================================================
  // AUTO-SUBMIT IMPLEMENTATION
  // ============================================================================

  private showCriticalWarning(type: string, remaining: number): void {
    this.removeViolationOverlay();

    const overlay = this.renderer.createElement('div');
    this.violationOverlayElement = overlay;

    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw');
    this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'background', 'rgba(139, 0, 0, 0.95)');
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'align-items', 'center');
    this.renderer.setStyle(overlay, 'justify-content', 'center');
    this.renderer.setStyle(overlay, 'z-index', '1000002');
    this.renderer.setStyle(overlay, 'color', 'white');
    this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

    const cfg = this.config.violationConfig;

    overlay.innerHTML = `
      <div style="text-align: center; padding: 40px; max-width: 500px;">
        <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
        <h1 style="font-size: 32px; margin-bottom: 16px; color: #ff6b6b;">CRITICAL WARNING</h1>
        <p style="font-size: 20px; margin-bottom: 12px;">${this.getViolationMessage(type)}</p>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="font-size: 48px; font-weight: bold; color: #ff6b6b; margin: 0;">${remaining}</p>
          <p style="font-size: 16px; opacity: 0.9; margin: 8px 0 0 0;">
            warning${remaining !== 1 ? 's' : ''} remaining before<br><strong>AUTOMATIC SUBMISSION</strong>
          </p>
        </div>
        <p style="font-size: 14px; opacity: 0.7; margin-bottom: 24px;">
          Total violations: ${this.totalViolationCount} / ${cfg.maxViolations}
        </p>
        <button id="critical-warning-btn" style="
          background: #4CAF50; color: white; border: none; padding: 16px 48px;
          font-size: 18px; font-weight: 600; border-radius: 8px; cursor: pointer;
        ">I Understand - Return to Quiz</button>
      </div>
    `;

    this.renderer.appendChild(document.body, overlay);
    this.playWarningSound();

    const btn = overlay.querySelector('#critical-warning-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.removeViolationOverlay();
        window.focus();
        if (this.config.enableFullscreenLock) this.requestFullscreen();
      });
    }

    setTimeout(() => {
      if (this.violationOverlayElement === overlay) this.removeViolationOverlay();
    }, 10000);
  }

  private initiateAutoSubmit(violationType: string): void {
    if (this.autoSubmitTriggered) return;

    console.warn('[Quiz Protection] INITIATING AUTO-SUBMIT');
    this.autoSubmitTriggered = true;

    const cfg = this.config.violationConfig;
    this.autoSubmitCountdownValue = cfg.autoSubmitCountdownSeconds;

    this.showAutoSubmitCountdownOverlay(violationType);

    this.autoSubmitCountdownTimer = window.setInterval(() => {
      this.autoSubmitCountdownValue--;
      this.onAutoSubmitCountdown.next(this.autoSubmitCountdownValue);
      this.updateAutoSubmitCountdown();
      this.emitStateChange();

      if (this.autoSubmitCountdownValue <= 3 && this.autoSubmitCountdownValue > 0) {
        this.playBeepSound();
      }

      if (this.autoSubmitCountdownValue <= 0) {
        this.executeAutoSubmit(violationType);
      }
    }, 1000);
  }

  private showAutoSubmitCountdownOverlay(violationType: string): void {
    this.removeAutoSubmitOverlay();
    this.removeViolationOverlay();
    this.removeDelayOverlay();

    const overlay = this.renderer.createElement('div');
    this.autoSubmitOverlayElement = overlay;

    this.renderer.setAttribute(overlay, 'id', 'auto-submit-overlay');
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw');
    this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'background', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)');
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'align-items', 'center');
    this.renderer.setStyle(overlay, 'justify-content', 'center');
    this.renderer.setStyle(overlay, 'z-index', '1000003');
    this.renderer.setStyle(overlay, 'color', 'white');
    this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

    overlay.innerHTML = `
      <div style="text-align: center; padding: 40px; max-width: 500px;">
        <div style="font-size: 64px; margin-bottom: 20px;">⛔</div>
        <h1 style="font-size: 28px; margin-bottom: 8px; color: #f44336;">MAXIMUM VIOLATIONS REACHED</h1>
        <p style="font-size: 16px; opacity: 0.8; margin-bottom: 24px;">Your quiz will be automatically submitted</p>

        <div style="position: relative; width: 150px; height: 150px; margin: 0 auto 24px;">
          <svg width="150" height="150" style="transform: rotate(-90deg);">
            <circle cx="75" cy="75" r="65" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="10"/>
            <circle id="countdown-circle" cx="75" cy="75" r="65" fill="none" stroke="#f44336" stroke-width="10"
              stroke-dasharray="408" stroke-dashoffset="0" stroke-linecap="round" style="transition: stroke-dashoffset 1s linear;"/>
          </svg>
          <div id="countdown-number" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-size: 48px; font-weight: bold; color: #f44336;">${this.autoSubmitCountdownValue}</div>
        </div>

        <p style="font-size: 14px; opacity: 0.6; margin-bottom: 16px;">Violation: ${this.getViolationMessage(violationType)}</p>

        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-size: 13px; opacity: 0.7; margin: 0;">
            Total Violations: <strong style="color: #f44336;">${this.totalViolationCount}</strong> |
            Delay Served: <strong style="color: #ff9800;">${this.formatTime(this.totalDelayTimeServed)}</strong>
          </p>
        </div>

        <p id="countdown-status" style="font-size: 14px; color: #ff9800;">Submitting in ${this.autoSubmitCountdownValue} seconds...</p>
      </div>
    `;

    this.renderer.appendChild(document.body, overlay);
    this.playWarningSound();
  }

  private updateAutoSubmitCountdown(): void {
    const numberEl = document.getElementById('countdown-number');
    const statusEl = document.getElementById('countdown-status');
    const circleEl = document.getElementById('countdown-circle');
    const cfg = this.config.violationConfig;

    if (numberEl) {
      numberEl.textContent = this.autoSubmitCountdownValue.toString();
      if (this.autoSubmitCountdownValue <= 3) {
        numberEl.style.color = '#ff0000';
        numberEl.style.fontSize = '56px';
      }
    }

    if (statusEl) {
      statusEl.textContent = this.autoSubmitCountdownValue <= 0
        ? 'Submitting now...'
        : `Submitting in ${this.autoSubmitCountdownValue} second${this.autoSubmitCountdownValue !== 1 ? 's' : ''}...`;
      if (this.autoSubmitCountdownValue <= 0) statusEl.style.color = '#f44336';
    }

    if (circleEl) {
      const circumference = 408;
      const offset = circumference - (this.autoSubmitCountdownValue / cfg.autoSubmitCountdownSeconds) * circumference;
      circleEl.style.strokeDashoffset = offset.toString();
    }
  }

  private executeAutoSubmit(violationType: string): void {
    if (this.autoSubmitCountdownTimer) {
      clearInterval(this.autoSubmitCountdownTimer);
      this.autoSubmitCountdownTimer = undefined;
    }

    console.warn('[Quiz Protection] EXECUTING AUTO-SUBMIT');

    const statusEl = document.getElementById('countdown-status');
    if (statusEl) {
      statusEl.innerHTML = '<span style="color: #4CAF50;">✓ Submitting your quiz...</span>';
    }

    const cfg = this.config.violationConfig;

    const autoSubmitEvent: AutoSubmitEvent = {
      reason: `Maximum violations reached (${this.totalViolationCount}/${cfg.maxViolations})`,
      violationType: violationType,
      violations: [...this.violations],
      totalViolations: this.totalViolationCount,
      penaltySeconds: this.penaltySeconds,
      totalDelayTimeServed: this.totalDelayTimeServed,
      timestamp: new Date(),
    };

    this.logEvent('auto-submit-triggered', JSON.stringify(autoSubmitEvent), 'critical');
    this.onAutoSubmit.next(autoSubmitEvent);
    this.emitStateChange();
  }

  public showAutoSubmitComplete(message?: string): void {
    this.removeAutoSubmitOverlay();

    const overlay = this.renderer.createElement('div');
    this.autoSubmitOverlayElement = overlay;
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw');
    this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'background', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)');
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'align-items', 'center');
    this.renderer.setStyle(overlay, 'justify-content', 'center');
    this.renderer.setStyle(overlay, 'z-index', '1000003');
    this.renderer.setStyle(overlay, 'color', 'white');
    this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

    overlay.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
        <h1 style="font-size: 28px; margin-bottom: 16px;">Quiz Submitted</h1>
        <p style="font-size: 16px; opacity: 0.8; margin-bottom: 8px;">
          ${message || 'Your quiz has been automatically submitted due to security violations.'}
        </p>
        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 14px; opacity: 0.7; margin: 0;">
            Violations: ${this.totalViolationCount} | Delay Served: ${this.formatTime(this.totalDelayTimeServed)}
          </p>
        </div>
        <p style="font-size: 14px; color: #4CAF50;">Redirecting to dashboard...</p>
      </div>
    `;

    this.renderer.appendChild(document.body, overlay);
  }

  // ============================================================================
  // AUDIO
  // ============================================================================

  private playWarningSound(): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('[Quiz Protection] Could not play warning sound');
    }
  }

  private playBeepSound(): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('[Quiz Protection] Could not play beep sound');
    }
  }

  public playCountdownBeep(): void { this.playBeepSound(); }
  public playUrgentWarning(): void { this.playWarningSound(); }

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

    const userInfo = this.getUserInfo();
    const timestamp = new Date().toISOString().split('T')[0];
    const watermarkText = this.config.watermarkText || `${userInfo.username} • ${timestamp} • CONFIDENTIAL`;

    for (let i = 0; i < this.config.watermarkCount; i++) {
      const text = this.renderer.createElement('div');
      this.renderer.setProperty(text, 'textContent', watermarkText);
      this.renderer.setStyle(text, 'position', 'absolute');
      this.renderer.setStyle(text, 'top', `${(i * 12) % 95}%`);
      this.renderer.setStyle(text, 'left', `${(i * 8) % 95}%`);
      this.renderer.setStyle(text, 'color', '#ff0000');
      this.renderer.setStyle(text, 'font-size', '14px');
      this.renderer.setStyle(text, 'font-weight', 'bold');
      this.renderer.setStyle(text, 'font-family', 'monospace');
      this.renderer.setStyle(text, 'transform', 'rotate(-35deg)');
      this.renderer.setStyle(text, 'white-space', 'nowrap');
      this.renderer.setStyle(text, 'user-select', 'none');
      this.renderer.appendChild(watermark, text);
    }

    this.renderer.appendChild(document.body, watermark);
  }

  private removeWatermark(): void {
    if (this.watermarkElement?.parentNode) {
      this.renderer.removeChild(document.body, this.watermarkElement);
      this.watermarkElement = undefined;
    }
  }

  // ============================================================================
  // STYLES
  // ============================================================================

  private applySecureStyles(): void {
    const body = document.body;
    body.dataset['originalUserSelect'] = body.style.userSelect || '';
    this.renderer.setStyle(body, 'user-select', 'none');
    this.renderer.setStyle(body, '-webkit-user-select', 'none');
    this.renderer.setStyle(body, '-webkit-touch-callout', 'none');
  }

  private restoreStyles(): void {
    const body = document.body;
    const original = body.dataset['originalUserSelect'] || '';
    body.style.userSelect = original;
    delete body.dataset['originalUserSelect'];
  }

  // ============================================================================
  // BLOCKING METHODS
  // ============================================================================

  private blockScreenshotShortcuts(): void {
    const handler = this.renderer.listen('document', 'keydown', (e: KeyboardEvent) => {
      let blocked = false;
      let reason = '';

      if (e.key === 'PrintScreen') { blocked = true; reason = 'Print Screen'; }
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) { blocked = true; reason = 'Mac Screenshot'; }
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') { blocked = true; reason = 'Windows Snip'; }
      if (e.altKey && e.key === 'PrintScreen') { blocked = true; reason = 'Alt+Print Screen'; }

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.clearClipboard();
        this.handleViolation('screenshot-attempt', `Blocked: ${reason}`, 'high');
      }
    });
    this.eventListeners.set('screenshot-block', handler);
  }

  private blockContextMenu(): void {
    const handler = this.renderer.listen('document', 'contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleViolation('context-menu-block', 'Right-click blocked', 'low');
      return false;
    });
    this.eventListeners.set('context-menu-block', handler);
  }

  private blockDevTools(): void {
    const handler = this.renderer.listen('document', 'keydown', (e: KeyboardEvent) => {
      let blocked = false;
      if (e.key === 'F12') blocked = true;
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'c', 'j'].includes(e.key.toLowerCase())) blocked = true;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') blocked = true;
      if (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) blocked = true;

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.handleViolation('devtools-block', `Blocked: ${e.key}`, 'medium');
      }
    });
    this.eventListeners.set('devtools-block', handler);
  }

  private blockNewTabsAndWindows(): void {
    const keyHandler = this.renderer.listen('document', 'keydown', (e: KeyboardEvent): boolean => {
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (ctrl && (key === 'n' || key === 't' || key === 'w')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.handleViolation('new-tab-block', `Blocked: Ctrl+${e.key}`, 'medium');
        return false;
      }
      return true;
    });

    const clickHandler = (e: MouseEvent): boolean => {
      if (e.button === 1 || ((e.ctrlKey || e.metaKey) && e.button === 0)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.handleViolation('new-tab-block', 'Middle/Ctrl-click blocked', 'medium');
        return false;
      }
      return true;
    };

    document.addEventListener('click', clickHandler, { capture: true });
    this.eventListeners.set('tab-block-key', keyHandler);
    this.eventListeners.set('tab-block-click', () => document.removeEventListener('click', clickHandler, { capture: true }));
  }

  // ============================================================================
  // MONITORING
  // ============================================================================

  private monitorClipboard(): void {
    const handler = this.renderer.listen('window', 'keyup', (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        this.clearClipboard();
        this.handleViolation('clipboard-monitor', 'Print Screen - clipboard cleared', 'high');
      }
    });
    this.eventListeners.set('clipboard-monitor', handler);
  }

  private monitorWindowFocus(): void {
    const handler = this.renderer.listen('window', 'blur', () => {
      if (!this.autoSubmitTriggered && !this.isDelayActive) {
        this.handleViolation('focus-lost', 'Window lost focus', 'medium');
      }
      setTimeout(() => {
        window.focus();
        if (this.fullscreenActive && !this.isInFullscreen() && !this.isDelayActive) this.requestFullscreen();
      }, 100);
    });
    this.eventListeners.set('focus-monitor', handler);
  }

  private monitorPageVisibility(): void {
    const handler = this.renderer.listen('document', 'visibilitychange', () => {
      if (document.hidden && !this.autoSubmitTriggered && !this.isDelayActive) {
        this.handleViolation('visibility-hidden', 'Tab/app switched', 'high');
      } else if (!this.isDelayActive) {
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
      this.logEvent('unload-attempt', 'User attempted to leave page', 'high');
      return e.returnValue;
    });
    this.eventListeners.set('unload-monitor', handler);
  }

  // ============================================================================
  // FULLSCREEN
  // ============================================================================

  private enableFullscreenLock(): void {
    this.requestFullscreen();

    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach(eventName => {
      const handler = this.renderer.listen('document', eventName, () => {
        const inFullscreen = this.isInFullscreen();
        if (!inFullscreen && this.fullscreenActive && this.isActive && !this.autoSubmitTriggered && !this.isDelayActive) {
          this.handleViolation('fullscreen-exit', 'Exited fullscreen', 'high');
          window.focus();
          setTimeout(() => this.requestFullscreen(), 300);
        }
        this.emitStateChange();
      });
      this.eventListeners.set(`fullscreen-${eventName}`, handler);
    });

    this.fullscreenRetryTimer = window.setInterval(() => {
      if (this.isActive && this.fullscreenActive && !this.isInFullscreen() && !this.autoSubmitTriggered && !this.isDelayActive) {
        this.requestFullscreen();
      }
    }, this.config.fullscreenRetryInterval);
  }

  private requestFullscreen(): void {
    const elem = document.documentElement;
    try {
      if (elem.requestFullscreen) {
        elem.requestFullscreen({ navigationUI: 'hide' } as any)
          .then(() => { this.fullscreenActive = true; this.removeWarningBanner(); this.emitStateChange(); })
          .catch(() => this.showWarningBanner());
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
        this.showWarningBanner();
      }
    } catch (error) {
      this.showWarningBanner();
    }
  }

  private exitFullscreen(): void {
    try {
      if (document.exitFullscreen) document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen();
      else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
      this.fullscreenActive = false;
    } catch (error) {}
  }

  private isInFullscreen(): boolean {
    return !!(document.fullscreenElement || (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
  }

  // ============================================================================
  // WAKE LOCK
  // ============================================================================

  private async requestWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
      }
    } catch (error) {}
  }

  private releaseWakeLock(): void {
    if (this.wakeLock) { this.wakeLock.release(); this.wakeLock = null; }
  }

  // ============================================================================
  // MOBILE
  // ============================================================================

  private preventMobileZoom(): void {
    const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
    if (viewport) {
      this.originalViewportContent = viewport.content;
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }

    let lastTouchEnd = 0;
    const doubleTapHandler = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };
    document.addEventListener('touchend', doubleTapHandler, { passive: false });
    this.eventListeners.set('double-tap-block', () => document.removeEventListener('touchend', doubleTapHandler));
  }

  private preventMobilePinchZoom(): void {
    const pinchHandler = (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault(); };
    document.addEventListener('touchmove', pinchHandler, { passive: false });
    this.eventListeners.set('pinch-block', () => document.removeEventListener('touchmove', pinchHandler));
  }

  private restoreViewport(): void {
    const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
    if (viewport && this.originalViewportContent) viewport.content = this.originalViewportContent;
  }

  // ============================================================================
  // FOCUS ENFORCEMENT
  // ============================================================================

  private startFocusEnforcement(): void {
    window.focus();
    this.focusCheckTimer = window.setInterval(() => {
      if ((!document.hasFocus() || document.hidden) && !this.autoSubmitTriggered && !this.isDelayActive) {
        window.focus();
        if (this.fullscreenActive && !this.isInFullscreen()) this.requestFullscreen();
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
    this.renderer.setStyle(notification, 'max-width', '90vw');
    this.renderer.setStyle(notification, 'text-align', 'center');
    this.renderer.setProperty(notification, 'textContent', message);

    this.renderer.appendChild(document.body, notification);
    setTimeout(() => { if (notification.parentNode) this.renderer.removeChild(document.body, notification); }, 4000);
  }

  private showWarningBanner(): void {
    if (this.warningBannerElement) return;

    const banner = this.renderer.createElement('div');
    this.warningBannerElement = banner;

    this.renderer.setStyle(banner, 'position', 'fixed');
    this.renderer.setStyle(banner, 'top', '0');
    this.renderer.setStyle(banner, 'left', '0');
    this.renderer.setStyle(banner, 'width', '100%');
    this.renderer.setStyle(banner, 'background', 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)');
    this.renderer.setStyle(banner, 'color', 'white');
    this.renderer.setStyle(banner, 'text-align', 'center');
    this.renderer.setStyle(banner, 'z-index', '1000001');
    this.renderer.setStyle(banner, 'font-size', '14px');
    this.renderer.setStyle(banner, 'font-weight', 'bold');
    this.renderer.setProperty(banner, 'innerHTML', '⚠️ QUIZ MODE ACTIVE - Stay on this page ⚠️');

    this.renderer.appendChild(document.body, banner);
  }

  private removeWarningBanner(): void {
    if (this.warningBannerElement?.parentNode) {
      this.renderer.removeChild(document.body, this.warningBannerElement);
      this.warningBannerElement = undefined;
    }
  }

  private showViolationOverlay(type: string): void {
    this.removeViolationOverlay();
    const overlay = this.renderer.createElement('div');
    this.violationOverlayElement = overlay;
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw');
    this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'background', 'rgba(0, 0, 0, 0.95)');
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'align-items', 'center');
    this.renderer.setStyle(overlay, 'justify-content', 'center');
    this.renderer.setStyle(overlay, 'z-index', '1000002');
    this.renderer.setStyle(overlay, 'color', 'white');
    this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

    overlay.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">🚫</div>
        <h1 style="font-size: 28px; margin-bottom: 16px;">Navigation Blocked</h1>
        <p style="font-size: 16px; opacity: 0.8; margin-bottom: 24px;">
          ${this.getViolationMessage(type)}<br>Please return to the quiz.
        </p>
        <button id="return-to-quiz-btn" style="
          background: #28a745; color: white; border: none; padding: 14px 32px;
          font-size: 16px; font-weight: 600; border-radius: 8px; cursor: pointer;
        ">Return to Quiz</button>
      </div>
    `;

    this.renderer.appendChild(document.body, overlay);

    const btn = overlay.querySelector('#return-to-quiz-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.removeViolationOverlay();
        window.focus();
        if (this.config.enableFullscreenLock) this.requestFullscreen();
      });
    }
  }

  private removeViolationOverlay(): void {
    if (this.violationOverlayElement?.parentNode) {
      this.renderer.removeChild(document.body, this.violationOverlayElement);
      this.violationOverlayElement = undefined;
    }
  }

  private removeAutoSubmitOverlay(): void {
    if (this.autoSubmitOverlayElement?.parentNode) {
      this.renderer.removeChild(document.body, this.autoSubmitOverlayElement);
      this.autoSubmitOverlayElement = undefined;
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private clearClipboard(): void {
    try { navigator.clipboard?.writeText('').catch(() => {}); } catch (e) {}
  }

  private getUserInfo(): { username: string; userId: string } {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return { username: user.username || user.name || 'USER', userId: user.id || user.userId || 'unknown' };
      }
    } catch (error) {}
    return { username: 'ANONYMOUS', userId: 'unknown' };
  }

  private logEvent(type: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): SecurityEvent {
    const userInfo = this.getUserInfo();
    const event: SecurityEvent = {
      type,
      timestamp: new Date().toISOString(),
      userId: userInfo.userId,
      username: userInfo.username,
      details,
      severity,
    };

    if (this.config.enableLogging) {
      console.warn(`[Quiz Protection] ${type}:`, details);
      this.http.post(this.config.logEndpoint, event).pipe(catchError(() => of(null))).subscribe();
    }

    return event;
  }

  private emitStateChange(): void {
    this.onStateChange.next(this.getState());
  }
}