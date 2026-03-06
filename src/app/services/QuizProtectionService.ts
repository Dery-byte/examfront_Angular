
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



// THIS LOADFROMBACKEND WORKS




// NEW 
// VIOLATIONCOUNT


// Call this after every violation
private saveViolationCountToBackend(count: number): void {
  if (!this.currentQuizId || !this.backendBaseUrl || !this.jwtToken) return;

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.jwtToken}`,
  });

  this.http.post(
    `${this.backendBaseUrl}/quiz-timer/saveViolationCount/${this.currentQuizId}`,
    { totalViolationCount: count },
    { headers }
  ).pipe(catchError(() => of(null))).subscribe();
}

// Call this from loadDelayFromBackend or separately on init
public loadViolationCountFromBackend(quizId: number): void {
  if (!this.backendBaseUrl || !this.jwtToken) return;

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.jwtToken}`,
  });

  this.http.get<{ totalViolationCount: number }>(
    `${this.backendBaseUrl}/quiz-timer/getViolationCount/${quizId}`,
    { headers }
  ).pipe(
    catchError(err => {
      if (err.status === 404) return of(null);
      return of(null);
    })
  ).subscribe(response => {
    const count = response?.totalViolationCount ?? 0;
    if (count > 0) {
      this.totalViolationCount = count;
      console.log('[QuizProtection] Violation count restored:', count);
      this.emitStateChange();
    }
  });
}




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
this.saveViolationCountToBackend(this.totalViolationCount); // ✅ persist immediatel
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
  console.log("CONFIG:", cfg);
  console.log("Total Violations:", this.totalViolationCount);
  let duration = Number(cfg.delaySeconds);
  if (cfg.delayIncrementOnRepeat && this.totalViolationCount > 1) {
    const multiplier = Math.pow(
      Number(cfg.delayMultiplier),
      this.totalViolationCount - 1
    );
    console.log("Multiplier:", multiplier);
    duration = Math.round(duration * multiplier);
  }
  console.log("Final Duration:", duration);
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



  // ============================================================================
  // showDelayOverlay()
  // ============================================================================

  private showDelayOverlay(violationType: string, duration: number, willAutoSubmitNext: boolean): void {
    this.removeDelayOverlay();
    this.injectProtectionStyles();

    const overlay = this.renderer.createElement('div');
    this.delayOverlayElement = overlay;
    this.renderer.setAttribute(overlay, 'id', 'delay-overlay');
    this.renderer.setAttribute(overlay, 'class', 'qps-overlay qps-overlay-bg-dark');
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0'); this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw'); this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'z-index', '1000003');

    const cfg = this.config.violationConfig;
    const remaining = cfg.maxViolations - this.totalViolationCount;
    const isDelayOnly = cfg.action === 'DELAY_ONLY';

    let warningText: string;
    if (isDelayOnly) {
      warningText = `Violation ${this.totalViolationCount} recorded`;
    } else if (willAutoSubmitNext) {
      warningText = 'Next violation will AUTO-SUBMIT your quiz';
    } else {
      warningText = `${remaining} violation(s) remaining before auto-submit`;
    }

    const circumference = 440;

    overlay.innerHTML = `
      <div class="qps-card card-amber" style="padding-top:40px">
        <div class="qps-icon-box amber" style="margin-bottom:18px">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        </div>
        <div class="qps-badge amber"><span class="qps-dot"></span>ACCESS SUSPENDED</div>
        <h2 class="qps-title">Quiz Locked</h2>
        <p class="qps-sub">${this.getViolationMessage(violationType)}. Your access is temporarily suspended.</p>

        <div class="qps-ring-wrap">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="10"/>
            <circle id="delay-circle" cx="80" cy="80" r="70" fill="none" stroke="#fbbf24" stroke-width="10"
              stroke-dasharray="${circumference}" stroke-dashoffset="0" stroke-linecap="round"
              style="transition:stroke-dashoffset 1s linear;"/>
          </svg>
          <div id="delay-number" class="qps-ring-number" style="color:#fbbf24">${duration}</div>
          <div class="qps-ring-label">SECONDS REMAINING</div>
        </div>

        <div class="qps-stats">
          <div class="qps-stat-tile">
            <div class="qps-stat-label">VIOLATION</div>
            <div class="qps-stat-value" style="color:rgba(248,113,113,.8)">${this.totalViolationCount}<span style="font-size:12px;color:rgba(255,255,255,.2)"> / ${cfg.maxViolations}</span></div>
          </div>
          <div class="qps-stat-tile">
            <div class="qps-stat-label">TOTAL SUSPENDED</div>
            <div class="qps-stat-value" style="color:rgba(255,255,255,.45);font-size:14px;padding-top:4px">${this.formatTime(this.totalDelayTimeServed)}</div>
          </div>
        </div>

        <div class="qps-strip ${willAutoSubmitNext ? 'red' : 'amber'}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          ${warningText}
        </div>

        <p id="delay-status" class="qps-countdown-status">Quiz resumes in ${duration} seconds…</p>
      </div>
    `;

    this.renderer.appendChild(document.body, overlay);
  }

  // private showDelayOverlay(violationType: string, duration: number, willAutoSubmitNext: boolean): void {
  //   this.removeDelayOverlay();

  //   const overlay = this.renderer.createElement('div');
  //   this.delayOverlayElement = overlay;

  //   this.renderer.setAttribute(overlay, 'id', 'delay-overlay');
  //   this.renderer.setStyle(overlay, 'position', 'fixed');
  //   this.renderer.setStyle(overlay, 'top', '0');
  //   this.renderer.setStyle(overlay, 'left', '0');
  //   this.renderer.setStyle(overlay, 'width', '100vw');
  //   this.renderer.setStyle(overlay, 'height', '100vh');
  //   this.renderer.setStyle(overlay, 'background', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)');
  //   this.renderer.setStyle(overlay, 'display', 'flex');
  //   this.renderer.setStyle(overlay, 'align-items', 'center');
  //   this.renderer.setStyle(overlay, 'justify-content', 'center');
  //   this.renderer.setStyle(overlay, 'z-index', '1000003');
  //   this.renderer.setStyle(overlay, 'color', 'white');
  //   this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

  //   const cfg = this.config.violationConfig;
  //   const remaining = cfg.maxViolations - this.totalViolationCount;
  //   const warningColor = willAutoSubmitNext ? '#f44336' : '#ff9800';

  //   let warningText: string;
  //   if (cfg.action === 'DELAY_ONLY') {
  //     warningText = `Violation ${this.totalViolationCount} recorded`;
  //   } else if (willAutoSubmitNext) {
  //     warningText = '⚠️ FINAL WARNING: Next violation will AUTO-SUBMIT your quiz!';
  //   } else {
  //     warningText = `${remaining} violation(s) remaining before auto-submit`;
  //   }

  //   overlay.innerHTML = `
  //     <div style="text-align: center; padding: 40px; max-width: 500px;">
  //       <h1 style="font-size: 28px; margin-bottom: 8px; color: #ff9800;">YOU HAVE BEEN SUSPENDED FOR ${this.calculateDelayDuration()} SECONDS</h1>
  //       <p style="font-size: 16px; opacity: 0.8; margin-bottom: 16px;">${this.getViolationMessage(violationType)}</p>

  //       <div style="position: relative; width: 180px; height: 180px; margin: 0 auto 24px;">
  //         <svg width="180" height="180" style="transform: rotate(-90deg);">
  //           <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="12"/>
  //           <circle id="delay-circle" cx="90" cy="90" r="80" fill="none" stroke="#ff9800" stroke-width="12"
  //             stroke-dasharray="502" stroke-dashoffset="0" stroke-linecap="round" style="transition: stroke-dashoffset 1s linear;"/>
  //         </svg>
  //         <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
  //           <div id="delay-number" style="font-size: 48px; font-weight: bold; color: #ff9800;">${duration}</div>
  //           <div style="font-size: 14px; opacity: 0.7;">seconds</div>
  //         </div>
  //       </div>

  //       <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
  //         <p style="font-size: 14px; margin: 0; color: ${warningColor};">
  //           <strong>Violation ${this.totalViolationCount}</strong>
  //         </p>
  //         <p style="font-size: 13px; opacity: 0.7; margin: 8px 0 0 0;">${warningText}</p>
  //       </div>

  //       <p id="delay-status" style="font-size: 14px; color: #ff9800;">Quiz will resume in ${duration} seconds...</p>

  //       <p style="font-size: 12px; opacity: 0.5; margin-top: 16px;">
  //         Total time suspended: ${this.formatTime(this.totalDelayTimeServed)}
  //       </p>
  //     </div>
  //   `;

  //   this.renderer.appendChild(document.body, overlay);
  // }


  
  // ============================================================================
  // updateDelayOverlay()
  // ============================================================================

  private updateDelayOverlay(): void {
    const numberEl = document.getElementById('delay-number');
    const statusEl = document.getElementById('delay-status');
    const circleEl = document.getElementById('delay-circle') as unknown as SVGCircleElement | null;

    if (numberEl) {
      numberEl.textContent = this.delayRemainingSeconds.toString();
      numberEl.style.color = this.delayRemainingSeconds <= 5 ? '#f87171' : '#fbbf24';
      if (this.delayRemainingSeconds <= 5 && this.delayRemainingSeconds > 0) {
        numberEl.style.animation = 'qpsCountdownPop .4s ease';
        setTimeout(() => { if (numberEl) numberEl.style.animation = ''; }, 400);
      }
    }

    if (statusEl) {
      if (this.delayRemainingSeconds <= 0) {
        statusEl.textContent = 'Resuming quiz access…';
        statusEl.style.color = 'rgba(74,222,128,.7)';
      } else {
        statusEl.textContent = `Quiz resumes in ${this.delayRemainingSeconds} second${this.delayRemainingSeconds !== 1 ? 's' : ''}…`;
        statusEl.style.color = 'rgba(255,255,255,.3)';
      }
    }

    if (circleEl) {
      const circumference = 440;
      const offset = circumference - (this.delayRemainingSeconds / this.currentDelayDuration) * circumference;
      circleEl.style.strokeDashoffset = offset.toString();
      if (this.delayRemainingSeconds <= 5) circleEl.style.stroke = '#f87171';
    }
  }
  // private updateDelayOverlay(): void {
  //   const numberEl = document.getElementById('delay-number');
  //   const statusEl = document.getElementById('delay-status');
  //   const circleEl = document.getElementById('delay-circle');

  //   if (numberEl) {
  //     numberEl.textContent = this.delayRemainingSeconds.toString();
  //     if (this.delayRemainingSeconds <= 5) {
  //       numberEl.style.color = '#f44336';
  //     }
  //   }

  //   if (statusEl) {
  //     if (this.delayRemainingSeconds <= 0) {
  //       statusEl.textContent = 'Resuming quiz access...';
  //       statusEl.style.color = '#4CAF50';
  //     } else {
  //       statusEl.textContent = `Quiz will resume in ${this.delayRemainingSeconds} second${this.delayRemainingSeconds !== 1 ? 's' : ''}...`;
  //     }
  //   }

  //   if (circleEl) {
  //     const circumference = 502;
  //     const offset = circumference - (this.delayRemainingSeconds / this.currentDelayDuration) * circumference;
  //     circleEl.style.strokeDashoffset = offset.toString();
  //   }
  // }

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



  // ============================================================================
  // showCriticalWarning()
  // ============================================================================

  private showCriticalWarning(type: string, remaining: number): void {
    this.removeViolationOverlay();
    this.injectProtectionStyles();

    const overlay = this.renderer.createElement('div');
    this.violationOverlayElement = overlay;
    this.renderer.setAttribute(overlay, 'class', 'qps-overlay qps-overlay-bg-red');
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0'); this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw'); this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'z-index', '1000002');

    const cfg = this.config.violationConfig;

    overlay.innerHTML = `
      <div class="qps-card card-red">
        <div class="qps-icon-box red" style="margin-bottom:18px">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="qps-badge red"><span class="qps-dot"></span>CRITICAL WARNING</div>
        <h2 class="qps-title">Final Warning</h2>
        <p class="qps-sub">${this.getViolationMessage(type)}</p>

        <div style="
          width:100%; padding:18px 20px; margin-bottom:14px;
          background:rgba(248,113,113,.06); border:1px solid rgba(248,113,113,.2); border-radius:14px;
          display:flex; align-items:center; justify-content:space-between; box-sizing:border-box;
        ">
          <div style="text-align:left">
            <div style="font-family:'Geist Mono',monospace;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.25);margin-bottom:4px">WARNINGS LEFT</div>
            <div style="font-family:'Geist Mono',monospace;font-size:11px;color:rgba(255,255,255,.4)">before auto-submit</div>
          </div>
          <div style="font-family:'Geist Mono',monospace;font-size:56px;font-weight:800;color:rgba(248,113,113,.9);line-height:1;letter-spacing:-.04em">${remaining}</div>
        </div>

        <div style="
          width:100%; background:#141414; border:1px solid #262626; border-radius:12px;
          padding:14px 16px; text-align:left; box-sizing:border-box; margin-bottom:4px;
        ">
          <div style="font-family:'Geist Mono',monospace;font-size:8.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.22);margin-bottom:10px">DO NOT</div>
          <div style="display:flex;flex-direction:column;gap:7px;">
            ${['Switch browser tabs or applications','Exit fullscreen mode','Use restricted keyboard shortcuts','Right-click on the page'].map(item => `
              <div style="display:flex;align-items:center;gap:9px;">
                <span style="width:18px;height:18px;border-radius:5px;flex-shrink:0;background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.18);display:flex;align-items:center;justify-content:center;">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,.7)" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </span>
                <span style="font-family:'Sora',sans-serif;font-size:12px;color:rgba(255,255,255,.45);line-height:1.4;">${item}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <button id="critical-warning-btn" class="qps-btn green">I Understand — Return to Quiz</button>
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

  // private showCriticalWarning(type: string, remaining: number): void {
  //   this.removeViolationOverlay();

  //   const overlay = this.renderer.createElement('div');
  //   this.violationOverlayElement = overlay;

  //   this.renderer.setStyle(overlay, 'position', 'fixed');
  //   this.renderer.setStyle(overlay, 'top', '0');
  //   this.renderer.setStyle(overlay, 'left', '0');
  //   this.renderer.setStyle(overlay, 'width', '100vw');
  //   this.renderer.setStyle(overlay, 'height', '100vh');
  //   this.renderer.setStyle(overlay, 'background', 'rgba(139, 0, 0, 0.95)');
  //   this.renderer.setStyle(overlay, 'display', 'flex');
  //   this.renderer.setStyle(overlay, 'align-items', 'center');
  //   this.renderer.setStyle(overlay, 'justify-content', 'center');
  //   this.renderer.setStyle(overlay, 'z-index', '1000002');
  //   this.renderer.setStyle(overlay, 'color', 'white');
  //   this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

  //   const cfg = this.config.violationConfig;

  //   overlay.innerHTML = `
  //     <div style="text-align: center; padding: 40px; max-width: 500px;">
  //       <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
  //       <h1 style="font-size: 32px; margin-bottom: 16px; color: #ff6b6b;">CRITICAL WARNING</h1>
  //       <p style="font-size: 20px; margin-bottom: 12px;">${this.getViolationMessage(type)}</p>
  //       <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
  //         <p style="font-size: 48px; font-weight: bold; color: #ff6b6b; margin: 0;">${remaining}</p>
  //         <p style="font-size: 16px; opacity: 0.9; margin: 8px 0 0 0;">
  //           warning${remaining !== 1 ? 's' : ''} remaining before<br><strong>AUTOMATIC SUBMISSION</strong>
  //         </p>
  //       </div>
  //       <p style="font-size: 14px; opacity: 0.7; margin-bottom: 24px;">
  //         Total violations: ${this.totalViolationCount} / ${cfg.maxViolations}
  //       </p>
  //       <button id="critical-warning-btn" style="
  //         background: #4CAF50; color: white; border: none; padding: 16px 48px;
  //         font-size: 18px; font-weight: 600; border-radius: 8px; cursor: pointer;
  //       ">I Understand - Return to Quiz</button>
  //     </div>
  //   `;

  //   this.renderer.appendChild(document.body, overlay);
  //   this.playWarningSound();

  //   const btn = overlay.querySelector('#critical-warning-btn');
  //   if (btn) {
  //     btn.addEventListener('click', () => {
  //       this.removeViolationOverlay();
  //       window.focus();
  //       if (this.config.enableFullscreenLock) this.requestFullscreen();
  //     });
  //   }

  //   setTimeout(() => {
  //     if (this.violationOverlayElement === overlay) this.removeViolationOverlay();
  //   }, 10000);
  // }

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







   // ============================================================================
  // showAutoSubmitCountdownOverlay()
  // ============================================================================

  private showAutoSubmitCountdownOverlay(violationType: string): void {
    this.removeAutoSubmitOverlay();
    this.removeViolationOverlay();
    this.removeDelayOverlay();
    this.injectProtectionStyles();

    const overlay = this.renderer.createElement('div');
    this.autoSubmitOverlayElement = overlay;
    this.renderer.setAttribute(overlay, 'id', 'auto-submit-overlay');
    this.renderer.setAttribute(overlay, 'class', 'qps-overlay qps-overlay-bg-red');
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0'); this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw'); this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'z-index', '1000003');

    const cfg = this.config.violationConfig;
    const circumference = 440;

    overlay.innerHTML = `
      <div class="qps-card card-red">
        <div class="qps-icon-box red" style="margin-bottom:18px">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>
        <div class="qps-badge red"><span class="qps-dot"></span>AUTO-SUBMITTING</div>
        <h2 class="qps-title">Maximum Violations</h2>
        <p class="qps-sub">Your quiz will be automatically submitted. All answers have been saved.</p>

        <div class="qps-ring-wrap">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="10"/>
            <circle id="countdown-circle" cx="80" cy="80" r="70" fill="none" stroke="#f87171" stroke-width="10"
              stroke-dasharray="${circumference}" stroke-dashoffset="0" stroke-linecap="round"
              style="transition:stroke-dashoffset 1s linear;"/>
          </svg>
          <div id="countdown-number" class="qps-ring-number" style="color:#f87171">${this.autoSubmitCountdownValue}</div>
          <div class="qps-ring-label">SUBMITTING IN</div>
        </div>

        <div class="qps-stats">
          <div class="qps-stat-tile">
            <div class="qps-stat-label">VIOLATIONS</div>
            <div class="qps-stat-value" style="color:rgba(248,113,113,.8)">${this.totalViolationCount}<span style="font-size:11px;color:rgba(255,255,255,.2)"> / ${cfg.maxViolations}</span></div>
          </div>
          <div class="qps-stat-tile">
            <div class="qps-stat-label">DELAY SERVED</div>
            <div class="qps-stat-value" style="color:rgba(255,255,255,.4);font-size:15px;padding-top:3px">${this.formatTime(this.totalDelayTimeServed)}</div>
          </div>
        </div>

        <div class="qps-strip red">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Reason: ${this.getViolationMessage(violationType)}
        </div>

        <p id="countdown-status" class="qps-countdown-status">Submitting in ${this.autoSubmitCountdownValue} seconds…</p>
      </div>
    `;

    this.renderer.appendChild(document.body, overlay);
    this.playWarningSound();
  }

  // private showAutoSubmitCountdownOverlay(violationType: string): void {
  //   this.removeAutoSubmitOverlay();
  //   this.removeViolationOverlay();
  //   this.removeDelayOverlay();

  //   const overlay = this.renderer.createElement('div');
  //   this.autoSubmitOverlayElement = overlay;

  //   this.renderer.setAttribute(overlay, 'id', 'auto-submit-overlay');
  //   this.renderer.setStyle(overlay, 'position', 'fixed');
  //   this.renderer.setStyle(overlay, 'top', '0');
  //   this.renderer.setStyle(overlay, 'left', '0');
  //   this.renderer.setStyle(overlay, 'width', '100vw');
  //   this.renderer.setStyle(overlay, 'height', '100vh');
  //   this.renderer.setStyle(overlay, 'background', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)');
  //   this.renderer.setStyle(overlay, 'display', 'flex');
  //   this.renderer.setStyle(overlay, 'align-items', 'center');
  //   this.renderer.setStyle(overlay, 'justify-content', 'center');
  //   this.renderer.setStyle(overlay, 'z-index', '1000003');
  //   this.renderer.setStyle(overlay, 'color', 'white');
  //   this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

  //   overlay.innerHTML = `
  //     <div style="text-align: center; padding: 40px; max-width: 500px;">
  //       <div style="font-size: 64px; margin-bottom: 20px;">⛔</div>
  //       <h1 style="font-size: 28px; margin-bottom: 8px; color: #f44336;">MAXIMUM VIOLATIONS REACHED</h1>
  //       <p style="font-size: 16px; opacity: 0.8; margin-bottom: 24px;">Your quiz will be automatically submitted</p>

  //       <div style="position: relative; width: 150px; height: 150px; margin: 0 auto 24px;">
  //         <svg width="150" height="150" style="transform: rotate(-90deg);">
  //           <circle cx="75" cy="75" r="65" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="10"/>
  //           <circle id="countdown-circle" cx="75" cy="75" r="65" fill="none" stroke="#f44336" stroke-width="10"
  //             stroke-dasharray="408" stroke-dashoffset="0" stroke-linecap="round" style="transition: stroke-dashoffset 1s linear;"/>
  //         </svg>
  //         <div id="countdown-number" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  //           font-size: 48px; font-weight: bold; color: #f44336;">${this.autoSubmitCountdownValue}</div>
  //       </div>

  //       <p style="font-size: 14px; opacity: 0.6; margin-bottom: 16px;">Violation: ${this.getViolationMessage(violationType)}</p>

  //       <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
  //         <p style="font-size: 13px; opacity: 0.7; margin: 0;">
  //           Total Violations: <strong style="color: #f44336;">${this.totalViolationCount}</strong> |
  //           Delay Served: <strong style="color: #ff9800;">${this.formatTime(this.totalDelayTimeServed)}</strong>
  //         </p>
  //       </div>

  //       <p id="countdown-status" style="font-size: 14px; color: #ff9800;">Submitting in ${this.autoSubmitCountdownValue} seconds...</p>
  //     </div>
  //   `;

  //   this.renderer.appendChild(document.body, overlay);
  //   this.playWarningSound();
  // }



// ============================================================================
  // updateAutoSubmitCountdown()
  // ============================================================================

  private updateAutoSubmitCountdown(): void {
    const numberEl  = document.getElementById('countdown-number');
    const statusEl  = document.getElementById('countdown-status');
    const circleEl  = document.getElementById('countdown-circle') as unknown as SVGCircleElement | null;
    const cfg = this.config.violationConfig;

    if (numberEl) {
      numberEl.textContent = this.autoSubmitCountdownValue.toString();
      if (this.autoSubmitCountdownValue <= 3) {
        numberEl.style.animation = 'qpsCountdownPop .35s ease';
        setTimeout(() => { if (numberEl) numberEl.style.animation = ''; }, 350);
      }
    }

    if (statusEl) {
      statusEl.textContent = this.autoSubmitCountdownValue <= 0
        ? 'Submitting now…'
        : `Submitting in ${this.autoSubmitCountdownValue} second${this.autoSubmitCountdownValue !== 1 ? 's' : ''}…`;
      if (this.autoSubmitCountdownValue <= 0) statusEl.style.color = 'rgba(74,222,128,.7)';
    }

    if (circleEl) {
      const circumference = 440;
      const offset = circumference - (this.autoSubmitCountdownValue / cfg.autoSubmitCountdownSeconds) * circumference;
      circleEl.style.strokeDashoffset = offset.toString();
    }
  }

  // private updateAutoSubmitCountdown(): void {
  //   const numberEl = document.getElementById('countdown-number');
  //   const statusEl = document.getElementById('countdown-status');
  //   const circleEl = document.getElementById('countdown-circle');
  //   const cfg = this.config.violationConfig;

  //   if (numberEl) {
  //     numberEl.textContent = this.autoSubmitCountdownValue.toString();
  //     if (this.autoSubmitCountdownValue <= 3) {
  //       numberEl.style.color = '#ff0000';
  //       numberEl.style.fontSize = '56px';
  //     }
  //   }

  //   if (statusEl) {
  //     statusEl.textContent = this.autoSubmitCountdownValue <= 0
  //       ? 'Submitting now...'
  //       : `Submitting in ${this.autoSubmitCountdownValue} second${this.autoSubmitCountdownValue !== 1 ? 's' : ''}...`;
  //     if (this.autoSubmitCountdownValue <= 0) statusEl.style.color = '#f44336';
  //   }

  //   if (circleEl) {
  //     const circumference = 408;
  //     const offset = circumference - (this.autoSubmitCountdownValue / cfg.autoSubmitCountdownSeconds) * circumference;
  //     circleEl.style.strokeDashoffset = offset.toString();
  //   }
  // }

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






 // ============================================================================
  // showAutoSubmitComplete()
  // ============================================================================

  public showAutoSubmitComplete(message?: string): void {
    this.removeAutoSubmitOverlay();
    this.injectProtectionStyles();

    const overlay = this.renderer.createElement('div');
    this.autoSubmitOverlayElement = overlay;
    this.renderer.setAttribute(overlay, 'class', 'qps-overlay qps-overlay-bg-dark');
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0'); this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw'); this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'z-index', '1000003');

    overlay.innerHTML = `
      <div class="qps-card card-green">
        <div class="qps-icon-box green" style="margin-bottom:18px">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="qps-badge green"><span class="qps-dot"></span>SUBMITTED</div>
        <h2 class="qps-title">Quiz Submitted</h2>
        <p class="qps-sub">${message || 'Your quiz has been automatically submitted due to security violations. All answers have been saved.'}</p>

        <div class="qps-stats">
          <div class="qps-stat-tile">
            <div class="qps-stat-label">VIOLATIONS</div>
            <div class="qps-stat-value" style="color:rgba(248,113,113,.7)">${this.totalViolationCount}</div>
          </div>
          <div class="qps-stat-tile">
            <div class="qps-stat-label">DELAY SERVED</div>
            <div class="qps-stat-value" style="color:rgba(255,255,255,.45);font-size:15px;padding-top:3px">${this.formatTime(this.totalDelayTimeServed)}</div>
          </div>
        </div>

        <div class="qps-strip neutral">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Results are available on the dashboard. Contact your instructor if you believe this was an error.
        </div>

        <p style="font-family:'Geist Mono',monospace;font-size:10px;color:rgba(74,222,128,.55);margin-top:16px;letter-spacing:.06em">
          Redirecting to dashboard…
        </p>
      </div>
    `;

    this.renderer.appendChild(document.body, overlay);
  }
  // public showAutoSubmitComplete(message?: string): void {
  //   this.removeAutoSubmitOverlay();

  //   const overlay = this.renderer.createElement('div');
  //   this.autoSubmitOverlayElement = overlay;
  //   this.renderer.setStyle(overlay, 'position', 'fixed');
  //   this.renderer.setStyle(overlay, 'top', '0');
  //   this.renderer.setStyle(overlay, 'left', '0');
  //   this.renderer.setStyle(overlay, 'width', '100vw');
  //   this.renderer.setStyle(overlay, 'height', '100vh');
  //   this.renderer.setStyle(overlay, 'background', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)');
  //   this.renderer.setStyle(overlay, 'display', 'flex');
  //   this.renderer.setStyle(overlay, 'align-items', 'center');
  //   this.renderer.setStyle(overlay, 'justify-content', 'center');
  //   this.renderer.setStyle(overlay, 'z-index', '1000003');
  //   this.renderer.setStyle(overlay, 'color', 'white');
  //   this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

  //   overlay.innerHTML = `
  //     <div style="text-align: center; padding: 40px;">
  //       <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
  //       <h1 style="font-size: 28px; margin-bottom: 16px;">Quiz Submitted</h1>
  //       <p style="font-size: 16px; opacity: 0.8; margin-bottom: 8px;">
  //         ${message || 'Your quiz has been automatically submitted due to security violations.'}
  //       </p>
  //       <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 20px 0;">
  //         <p style="font-size: 14px; opacity: 0.7; margin: 0;">
  //           Violations: ${this.totalViolationCount} | Delay Served: ${this.formatTime(this.totalDelayTimeServed)}
  //         </p>
  //       </div>
  //       <p style="font-size: 14px; color: #4CAF50;">Redirecting to dashboard...</p>
  //     </div>
  //   `;

  //   this.renderer.appendChild(document.body, overlay);
  // }

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
        // this.showWarningBanner();
      }
    } catch (error) {
      // this.showWarningBanner();
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



   // ============================================================================
  // notify()
  // ============================================================================

  private notify(message: string): void {
    if (!this.config.enableAlerts) return;
    this.injectProtectionStyles();

    const notification = this.renderer.createElement('div');
    this.renderer.setStyle(notification, 'position', 'fixed');
    this.renderer.setStyle(notification, 'top', '18px');
    this.renderer.setStyle(notification, 'left', '50%');
    this.renderer.setStyle(notification, 'transform', 'translateX(-50%)');
    this.renderer.setStyle(notification, 'z-index', '1000000');
    this.renderer.setStyle(notification, 'animation', 'qpsSlideDown .28s cubic-bezier(.16,1,.3,1) both');
    this.renderer.setStyle(notification, 'display', 'flex');
    this.renderer.setStyle(notification, 'align-items', 'center');
    this.renderer.setStyle(notification, 'gap', '10px');
    this.renderer.setStyle(notification, 'padding', '11px 18px 11px 14px');
    this.renderer.setStyle(notification, 'background', '#0e0e0e');
    this.renderer.setStyle(notification, 'border', '1px solid rgba(248,113,113,.28)');
    this.renderer.setStyle(notification, 'border-radius', '12px');
    this.renderer.setStyle(notification, 'box-shadow', '0 0 0 1px rgba(248,113,113,.08) inset, 0 12px 36px rgba(0,0,0,.7)');
    this.renderer.setStyle(notification, 'max-width', '440px');
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
    this.renderer.setStyle(icon, 'width', '28px'); this.renderer.setStyle(icon, 'height', '28px');
    this.renderer.setStyle(icon, 'border-radius', '7px');
    this.renderer.setStyle(icon, 'background', 'rgba(248,113,113,.08)');
    this.renderer.setStyle(icon, 'border', '1px solid rgba(248,113,113,.2)');
    this.renderer.setStyle(icon, 'display', 'flex');
    this.renderer.setStyle(icon, 'align-items', 'center');
    this.renderer.setStyle(icon, 'justify-content', 'center');
    this.renderer.setStyle(icon, 'color', 'rgba(248,113,113,.9)');
    this.renderer.setProperty(icon, 'innerHTML', `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`);
    this.renderer.appendChild(notification, icon);

    // Text
    const textWrap = this.renderer.createElement('span');
    this.renderer.setStyle(textWrap, 'display', 'flex');
    this.renderer.setStyle(textWrap, 'flex-direction', 'column');
    this.renderer.setStyle(textWrap, 'gap', '2px');

    const label = this.renderer.createElement('span');
    this.renderer.setStyle(label, 'font-family', "'Geist Mono', monospace");
    this.renderer.setStyle(label, 'font-size', '8.5px');
    this.renderer.setStyle(label, 'font-weight', '600');
    this.renderer.setStyle(label, 'letter-spacing', '.12em');
    this.renderer.setStyle(label, 'text-transform', 'uppercase');
    this.renderer.setStyle(label, 'color', 'rgba(248,113,113,.55)');
    this.renderer.setProperty(label, 'textContent', 'Security Alert');
    this.renderer.appendChild(textWrap, label);

    const cleanMsg = message.replace(/[\u{1F300}-\u{1FFFF}]|[\u2600-\u27BF]|⚠️|📸|🚨/gu, '').trim();
    const msgEl = this.renderer.createElement('span');
    this.renderer.setStyle(msgEl, 'font-family', "'Sora', sans-serif");
    this.renderer.setStyle(msgEl, 'font-size', '12.5px');
    this.renderer.setStyle(msgEl, 'font-weight', '500');
    this.renderer.setStyle(msgEl, 'color', 'rgba(255,255,255,.75)');
    this.renderer.setProperty(msgEl, 'textContent', cleanMsg);
    this.renderer.appendChild(textWrap, msgEl);

    this.renderer.appendChild(notification, textWrap);
    this.renderer.appendChild(document.body, notification);

    setTimeout(() => {
      this.renderer.setStyle(notification, 'animation', 'qpsFadeOut .22s ease both');
      setTimeout(() => { if (notification.parentNode) this.renderer.removeChild(document.body, notification); }, 220);
    }, 3780);
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
  //   this.renderer.setStyle(notification, 'max-width', '90vw');
  //   this.renderer.setStyle(notification, 'text-align', 'center');
  //   this.renderer.setProperty(notification, 'textContent', message);

  //   this.renderer.appendChild(document.body, notification);
  //   setTimeout(() => { if (notification.parentNode) this.renderer.removeChild(document.body, notification); }, 4000);
  // }





   // ============================================================================
  // showWarningBanner()
  // ============================================================================

  private showWarningBanner(): void {
    if (this.warningBannerElement) return;
    this.injectProtectionStyles();

    // const banner = this.renderer.createElement('div');
    // this.warningBannerElement = banner;

    // this.renderer.setAttribute(banner, 'id', 'quiz-warning-banner');
    // this.renderer.setStyle(banner, 'position', 'fixed');
    // this.renderer.setStyle(banner, 'top', '0');
    // this.renderer.setStyle(banner, 'left', '0');
    // this.renderer.setStyle(banner, 'width', '100%');
    // this.renderer.setStyle(banner, 'z-index', '1000001');
    // this.renderer.setStyle(banner, 'display', 'flex');
    // this.renderer.setStyle(banner, 'align-items', 'center');
    // this.renderer.setStyle(banner, 'justify-content', 'center');
    // this.renderer.setStyle(banner, 'gap', '10px');
    // this.renderer.setStyle(banner, 'padding', '9px 20px');
    // this.renderer.setStyle(banner, 'background', '#0a0a0a');
    // this.renderer.setStyle(banner, 'border-top', '2px solid rgba(248,113,113,.6)');
    // this.renderer.setStyle(banner, 'border-bottom', '1px solid rgba(248,113,113,.15)');
    // this.renderer.setStyle(banner, 'box-shadow', '0 4px 20px rgba(0,0,0,.6)');
    // this.renderer.setStyle(banner, 'animation', 'qpsBannerIn .3s cubic-bezier(.16,1,.3,1) both');

    // const dot = this.renderer.createElement('span');
    // this.renderer.setStyle(dot, 'width', '6px'); this.renderer.setStyle(dot, 'height', '6px');
    // this.renderer.setStyle(dot, 'border-radius', '50%');
    // this.renderer.setStyle(dot, 'background', 'rgba(248,113,113,.85)');
    // this.renderer.setStyle(dot, 'flex-shrink', '0');
    // this.renderer.setStyle(dot, 'animation', 'qpsDotPulse 1.4s infinite');
    // this.renderer.appendChild(banner, dot);

    // const badge = this.renderer.createElement('span');
    // this.renderer.setStyle(badge, 'font-family', "'Geist Mono', monospace");
    // this.renderer.setStyle(badge, 'font-size', '8.5px');
    // this.renderer.setStyle(badge, 'font-weight', '600');
    // this.renderer.setStyle(badge, 'letter-spacing', '.13em');
    // this.renderer.setStyle(badge, 'text-transform', 'uppercase');
    // this.renderer.setStyle(badge, 'color', 'rgba(248,113,113,.65)');
    // this.renderer.setStyle(badge, 'padding', '2px 9px');
    // this.renderer.setStyle(badge, 'border', '1px solid rgba(248,113,113,.18)');
    // this.renderer.setStyle(badge, 'border-radius', '100px');
    // this.renderer.setStyle(badge, 'background', 'rgba(248,113,113,.06)');
    // this.renderer.setProperty(badge, 'textContent', 'QUIZ MODE ACTIVE');
    // this.renderer.appendChild(banner, badge);

    // const sep = this.renderer.createElement('span');
    // this.renderer.setStyle(sep, 'width', '1px'); this.renderer.setStyle(sep, 'height', '14px');
    // this.renderer.setStyle(sep, 'background', 'rgba(255,255,255,.08)');
    // this.renderer.setStyle(sep, 'flex-shrink', '0');
    // this.renderer.appendChild(banner, sep);

    // const msg = this.renderer.createElement('span');
    // this.renderer.setStyle(msg, 'font-family', "'Sora', sans-serif");
    // this.renderer.setStyle(msg, 'font-size', '12px');
    // this.renderer.setStyle(msg, 'color', 'rgba(255,255,255,.38)');
    // this.renderer.setProperty(msg, 'textContent', 'Stay on this page — Do not switch tabs or applications');
    // this.renderer.appendChild(banner, msg);

    // this.renderer.appendChild(document.body, banner);
  }





  // private showWarningBanner(): void {
  //   if (this.warningBannerElement) return;

  //   // const banner = this.renderer.createElement('div');
  //   // this.warningBannerElement = banner;

  //   // this.renderer.setStyle(banner, 'position', 'fixed');
  //   // this.renderer.setStyle(banner, 'top', '0');
  //   // this.renderer.setStyle(banner, 'left', '0');
  //   // this.renderer.setStyle(banner, 'width', '100%');
  //   // this.renderer.setStyle(banner, 'background', 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)');
  //   // this.renderer.setStyle(banner, 'color', 'white');
  //   // this.renderer.setStyle(banner, 'text-align', 'center');
  //   // this.renderer.setStyle(banner, 'z-index', '1000001');
  //   // this.renderer.setStyle(banner, 'font-size', '14px');
  //   // this.renderer.setStyle(banner, 'font-weight', 'bold');
  //   // this.renderer.setProperty(banner, 'innerHTML', '⚠️ QUIZ MODE ACTIVE - Stay on this page ⚠️');
  //   // this.renderer.appendChild(document.body, banner);
  // }

  private removeWarningBanner(): void {
    if (this.warningBannerElement?.parentNode) {
      this.renderer.removeChild(document.body, this.warningBannerElement);
      this.warningBannerElement = undefined;
    }
  }





  // private showViolationOverlay(type: string): void {
  //   this.removeViolationOverlay();
  //   const overlay = this.renderer.createElement('div');
  //   this.violationOverlayElement = overlay;
  //   this.renderer.setStyle(overlay, 'position', 'fixed');
  //   this.renderer.setStyle(overlay, 'top', '0');
  //   this.renderer.setStyle(overlay, 'left', '0');
  //   this.renderer.setStyle(overlay, 'width', '100vw');
  //   this.renderer.setStyle(overlay, 'height', '100vh');
  //   this.renderer.setStyle(overlay, 'background', 'rgba(0, 0, 0, 0.95)');
  //   this.renderer.setStyle(overlay, 'display', 'flex');
  //   this.renderer.setStyle(overlay, 'align-items', 'center');
  //   this.renderer.setStyle(overlay, 'justify-content', 'center');
  //   this.renderer.setStyle(overlay, 'z-index', '1000002');
  //   this.renderer.setStyle(overlay, 'color', 'white');
  //   this.renderer.setStyle(overlay, 'font-family', 'system-ui, -apple-system, sans-serif');

  //   overlay.innerHTML = `
  //     <div style="text-align: center; padding: 40px;">
  //       <div style="font-size: 64px; margin-bottom: 20px;">🚫</div>
  //       <h1 style="font-size: 28px; margin-bottom: 16px;">Navigation Blocked</h1>
  //       <p style="font-size: 16px; opacity: 0.8; margin-bottom: 24px;">
  //         ${this.getViolationMessage(type)}<br>Please return to the quiz.
  //       </p>
  //       <button id="return-to-quiz-btn" style="
  //         background: #28a745; color: white; border: none; padding: 14px 32px;
  //         font-size: 16px; font-weight: 600; border-radius: 8px; cursor: pointer;
  //       ">Return to Quiz</button>
  //     </div>
  //   `;

  //   this.renderer.appendChild(document.body, overlay);

  //   const btn = overlay.querySelector('#return-to-quiz-btn');
  //   if (btn) {
  //     btn.addEventListener('click', () => {
  //       this.removeViolationOverlay();
  //       window.focus();
  //       if (this.config.enableFullscreenLock) this.requestFullscreen();
  //     });
  //   }
  // }



   // ============================================================================
  // showViolationOverlay()
  // ============================================================================

  private showViolationOverlay(type: string): void {
    this.removeViolationOverlay();
    this.injectProtectionStyles();

    const overlay = this.renderer.createElement('div');
    this.violationOverlayElement = overlay;
    this.renderer.setAttribute(overlay, 'class', 'qps-overlay qps-overlay-bg-dark');
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0'); this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw'); this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'z-index', '1000002');

    overlay.innerHTML = `
      <div class="qps-card card-amber">
        <div class="qps-icon-box amber" style="margin-bottom:18px">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>
        <div class="qps-badge amber"><span class="qps-dot"></span>NAVIGATION BLOCKED</div>
        <h2 class="qps-title">Access Restricted</h2>
        <p class="qps-sub">${this.getViolationMessage(type)}<br>Please return to the quiz to continue.</p>

        <div class="qps-strip amber">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Further violations may result in automatic submission of your quiz.
        </div>

        <button id="return-to-quiz-btn" class="qps-btn amber">Return to Quiz</button>
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



















  
  private injectProtectionStyles(): void {
    if (document.getElementById('qps-style')) return;
    const style = document.createElement('style');
    style.id = 'qps-style';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Geist+Mono:wght@400;500;600;700&display=swap');

      @keyframes qpsSlideDown {
        from { opacity:0; transform:translateX(-50%) translateY(-14px); }
        to   { opacity:1; transform:translateX(-50%) translateY(0); }
      }
      @keyframes qpsFadeOut {
        from { opacity:1; transform:translateX(-50%) translateY(0); }
        to   { opacity:0; transform:translateX(-50%) translateY(-8px); }
      }
      @keyframes qpsBannerIn {
        from { opacity:0; transform:translateY(-100%); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes qpsDotPulse {
        0%,100% { opacity:1; transform:scale(1); }
        50%     { opacity:.2; transform:scale(.45); }
      }
      @keyframes qpsOverlayIn {
        from { opacity:0; }
        to   { opacity:1; }
      }
      @keyframes qpsCardIn {
        from { opacity:0; transform:translateY(24px) scale(.97); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes qpsRingPulse {
        0%,100% { transform:scale(1);   opacity:.35; }
        50%     { transform:scale(1.08); opacity:.12; }
      }
      @keyframes qpsCountdownPop {
        0%   { transform:scale(1); }
        50%  { transform:scale(1.12); }
        100% { transform:scale(1); }
      }

      /* ── Overlay shell ── */
      .qps-overlay {
        position:fixed; top:0; left:0;
        width:100vw; height:100vh;
        display:flex; align-items:center; justify-content:center;
        animation:qpsOverlayIn .3s ease both;
        font-family:'Sora', sans-serif;
      }
      .qps-overlay-bg-dark  { background:rgba(4,4,4,.97); }
      .qps-overlay-bg-amber { background:rgba(6,5,2,.97); }
      .qps-overlay-bg-red   { background:rgba(6,2,2,.97); }

      /* ── Card ── */
      .qps-card {
        text-align:center;
        padding:44px 40px 36px;
        max-width:500px; width:90vw;
        background:#0e0e0e;
        border:1px solid #262626;
        border-radius:24px;
        box-shadow:0 48px 120px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.04);
        animation:qpsCardIn .35s cubic-bezier(.16,1,.3,1) both;
        position:relative; overflow:hidden;
      }
      .qps-card::before {
        content:''; display:block;
        position:absolute; top:0; left:0; right:0; height:1px;
      }
      .qps-card.card-amber::before { background:linear-gradient(90deg,transparent,rgba(251,191,36,.45),transparent); }
      .qps-card.card-red::before   { background:linear-gradient(90deg,transparent,rgba(248,113,113,.45),transparent); }
      .qps-card.card-green::before { background:linear-gradient(90deg,transparent,rgba(74,222,128,.45),transparent); }
      .qps-card.card-neutral::before { background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent); }

      /* ── Icon box ── */
      .qps-icon-box {
        width:64px; height:64px; border-radius:17px;
        display:flex; align-items:center; justify-content:center;
        margin:0 auto 22px; position:relative;
      }
      .qps-icon-box.amber  { background:rgba(251,191,36,.07); border:1px solid rgba(251,191,36,.22); color:#fbbf24; }
      .qps-icon-box.red    { background:rgba(248,113,113,.07); border:1px solid rgba(248,113,113,.22); color:#f87171; }
      .qps-icon-box.green  { background:rgba(74,222,128,.07);  border:1px solid rgba(74,222,128,.22);  color:#4ade80; }
      .qps-icon-box.neutral{ background:rgba(255,255,255,.04); border:1px solid #2a2a2a; color:rgba(255,255,255,.3); }

      .qps-icon-box::after {
        content:''; position:absolute; inset:-8px; border-radius:24px;
        border:1px solid currentColor; opacity:.15;
        animation:qpsRingPulse 2.5s ease-in-out infinite;
      }

      /* ── Badge ── */
      .qps-badge {
        display:inline-flex; align-items:center; gap:6px;
        padding:3px 12px; border-radius:100px;
        font-family:'Geist Mono', monospace;
        font-size:9px; font-weight:600; letter-spacing:.13em; text-transform:uppercase;
        margin-bottom:14px;
      }
      .qps-badge.amber  { background:rgba(251,191,36,.07); border:1px solid rgba(251,191,36,.2);  color:rgba(251,191,36,.85); }
      .qps-badge.red    { background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.2); color:rgba(248,113,113,.85); }
      .qps-badge.green  { background:rgba(74,222,128,.07); border:1px solid rgba(74,222,128,.2);  color:rgba(74,222,128,.85); }
      .qps-badge.neutral{ background:rgba(255,255,255,.04);border:1px solid #2a2a2a; color:rgba(255,255,255,.25); }
      .qps-dot { width:5px;height:5px;border-radius:50%;background:currentColor;animation:qpsDotPulse 2s infinite; }

      /* ── Typography ── */
      .qps-title {
        font-size:24px; font-weight:700; letter-spacing:-.025em; line-height:1.2;
        color:rgba(255,255,255,.9); margin:0 0 10px;
      }
      .qps-sub {
        font-size:13px; font-weight:300; color:rgba(255,255,255,.35);
        line-height:1.65; margin:0 0 24px; max-width:340px; margin-left:auto; margin-right:auto;
      }
      .qps-sub strong { color:rgba(255,255,255,.6); font-weight:600; }

      /* ── Countdown ring ── */
      .qps-ring-wrap {
        position:relative; width:160px; height:160px;
        margin:0 auto 28px;
      }
      .qps-ring-wrap svg { transform:rotate(-90deg); }
      .qps-ring-number {
        position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
        font-family:'Geist Mono', monospace;
        font-size:52px; font-weight:800; line-height:1;
        letter-spacing:-.04em;
      }
      .qps-ring-label {
        position:absolute; bottom:22px; left:50%; transform:translateX(-50%);
        font-family:'Geist Mono', monospace; font-size:9px; letter-spacing:.12em;
        text-transform:uppercase; color:rgba(255,255,255,.22);
        white-space:nowrap;
      }

      /* ── Stats row ── */
      .qps-stats {
        display:grid; grid-template-columns:1fr 1fr; gap:8px;
        margin-bottom:14px; width:100%;
      }
      .qps-stat-tile {
        background:#141414; border:1px solid #262626; border-radius:11px;
        padding:12px 14px; text-align:left;
      }
      .qps-stat-label {
        font-family:'Geist Mono', monospace; font-size:8px; font-weight:600;
        letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.22);
        margin-bottom:5px;
      }
      .qps-stat-value {
        font-family:'Geist Mono', monospace; font-size:20px; font-weight:700;
        line-height:1;
      }

      /* ── Info strip ── */
      .qps-strip {
        display:flex; align-items:flex-start; gap:8px; width:100%;
        padding:10px 14px; border-radius:9px;
        font-family:'Geist Mono', monospace; font-size:10px;
        text-align:left; line-height:1.6; box-sizing:border-box;
        margin-bottom:4px;
      }
      .qps-strip.amber { background:rgba(251,191,36,.04); border:1px solid rgba(251,191,36,.15); color:rgba(251,191,36,.55); }
      .qps-strip.red   { background:rgba(248,113,113,.05);border:1px solid rgba(248,113,113,.15);color:rgba(248,113,113,.6); }
      .qps-strip.neutral{ background:rgba(255,255,255,.03);border:1px solid #222; color:rgba(255,255,255,.28); }
      .qps-strip svg   { flex-shrink:0; margin-top:1px; }

      /* ── Button ── */
      .qps-btn {
        display:inline-flex; align-items:center; justify-content:center;
        height:50px; padding:0 32px;
        border:none; border-radius:13px; cursor:pointer;
        font-family:'Sora', sans-serif; font-size:14px; font-weight:700;
        letter-spacing:-.01em; transition:all .18s; position:relative; overflow:hidden;
        margin-top:20px; width:100%;
      }
      .qps-btn.amber {
        background:#fbbf24; color:#000;
        box-shadow:0 0 0 1px rgba(251,191,36,.2), 0 6px 20px rgba(251,191,36,.2);
      }
      .qps-btn.amber:hover { background:#fcd34d; transform:translateY(-1px); }
      .qps-btn.green {
        background:#4ade80; color:#000;
        box-shadow:0 0 0 1px rgba(74,222,128,.2), 0 6px 20px rgba(74,222,128,.2);
      }
      .qps-btn.green:hover { background:#6ee79a; transform:translateY(-1px); }
      .qps-btn::after {
        content:''; position:absolute; top:0; left:-100%; width:55%; height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
        transform:skewX(-18deg); animation:qpsShimmer 2.5s infinite;
      }
      @keyframes qpsShimmer { 0%{left:-100%} 100%{left:160%} }

      /* ── Progress bar (delay) ── */
      .qps-countdown-status {
        font-family:'Geist Mono', monospace; font-size:11px;
        color:rgba(255,255,255,.3); margin-top:8px; letter-spacing:.04em;
        min-height:18px;
      }
    `;
    document.head.appendChild(style);
  }


}