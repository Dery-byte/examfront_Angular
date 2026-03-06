import { LocationStrategy } from '@angular/common';
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, } from '@angular/router';
import { Question } from 'src/model testing/model';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizProgressService } from 'src/app/services/quiz-progress.service';
import { QuizAnswerRequest } from 'src/app/services/quiz-progress.service';
import { UserQuizAnswersResponse } from 'src/app/services/quiz-progress.service';
import { interval, Subscription } from 'rxjs';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ScreenshotPreventionService } from 'src/app/services/ScreenshotPreventionService ';
import { injectSwalStyles } from '../../utilities/swal-styles';

// import { ScreenshotPreventionService } from 'src/app/services/ScreenshotPreventionService ';


import {
  QuizProtectionService,
  QuizProtectionState,
  SecurityEvent,
  AutoSubmitPayload,
  DelayEvent,
  QuizViolationConfig
} from 'src/app/services/QuizProtectionService';
import baseUrl from 'src/app/services/helper';

interface QuizAnswers {
  [prefix: string]: {
    [tqId: number]: string
  }
}

interface QuestionResponse {
  questionNumber: string;
  question: string;
  studentAnswer: string;
  score: number;
  maxMarks: number;
  feedback: string;
  keyMissed: string[];
}

interface GroupedQuestions {
  prefix: string;
  questions: QuestionResponse[];
}

interface PrefixScores {
  prefix: string;
  totalScore: number;
  totalMaxMarks: number;
  percentage: number;
}

interface Category {
  cid: number;
  level: string;
  title: string;
  description: string;
  courseCode: string;
}

interface Quiz {
  qId: number;
  title: string;
  description: string;
  maxMarks: string;
  quizTime: string;
  numberOfQuestions: string;
  active: boolean;
  attempted: boolean;
  quizpassword: string;
  category: Category;

  // =========================================================================
  // QUIZ PROTECTION SETTINGS (from database)
  // =========================================================================

  // Violation Action: 'NONE' | 'DELAY_ONLY' | 'AUTOSUBMIT_ONLY' | 'DELAY_AND_AUTOSUBMIT'
  violationAction?: string;

  // Maximum violations before auto-submit (if action includes auto-submit)
  maxViolations?: number;

  // Delay duration in seconds for each violation
  delaySeconds?: number;

  // Whether to increase delay on repeat violations
  delayIncrementOnRepeat?: boolean;

  // Multiplier for delay increment (e.g., 1.5 = 50% increase each time)
  delayMultiplier?: number;

  // Maximum delay cap in seconds
  maxDelaySeconds?: number;

  // Countdown seconds before auto-submit executes
  autoSubmitCountdownSeconds?: number;

  // Enable/disable watermark overlay
  enableWatermark?: boolean;

  // Enable/disable fullscreen lock
  enableFullscreenLock?: boolean;

  // Enable/disable screenshot blocking
  enableScreenshotBlocking?: boolean;

  // Enable/disable developer tools blocking
  enableDevToolsBlocking?: boolean;
}

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit, OnDestroy {

  // ============================================================================
  // QUIZ PROTECTION STATE
  // ============================================================================
  protectionState: QuizProtectionState = {
    isActive: false,
    isFullscreen: false,
    violationCount: 0,
    violations: [],
    penaltySeconds: 0,
    autoSubmitTriggered: false,
    autoSubmitCountdown: undefined,
    isDelayActive: false,
    delayRemainingSeconds: 0,
    totalDelayTimeServed: 0,
  };
  private protectionSubscriptions: Subscription[] = [];


  // ============================================================================
  // PAGINATION
  // ============================================================================
  private readonly QUIZ_STORAGE_KEY = 'quiz_answers_by_prefix';
  title = "pagination";
  page: number = 1;
  count: number = 0;
  tableSize: number = 3;
  tableSizes: any = [3, 6, 9, 12];
  isLoading: boolean = true;
  checked: true;

  // ============================================================================
  // QUIZ DATA
  // ============================================================================
  catId;
  quizzes;
  questions;
  questionss;
  qid;
  questionWithAnswers;
  marksGot = 0;
  maxMarks = 0;
  correct_answer = 0;
  attempted: any;
  isSubmit = false;
  isNavigating = false;
  second: number;
  minutes: number;
  count_timer: any;
  timeT: number = 0;
  timerAll: number = 0;
  timeO: number = 0;
  quizTitle;
  courseTitle;
  quiz;
  noOfQuesObject;
  private intervalId: any;

  // ============================================================================
  // SUBJECTIVE QUESTIONS
  // ============================================================================
  questionT: Question[] = [];
  filteredQuestions: Question[] = [];
  itemsPerPage: number = 5;
  groupedQuestions: { [key: string]: Question[] } = {};
  prefixes: string[] = [];
  currentPage: number = 0;
  selectedQuestions: { [key: string]: boolean } = {};
  selectedPrefix: string;
  selectedQuestionsCount: number = 0;
  numberOfQuestionsToAnswer: number = 0;
  quizForm: FormGroup;
  selectedQuestionsAnswer = [];
  convertedJsonAPIResponsebody: any;
  sectionB: any[] = [];
  question: Question[] = [];
  geminiResponse: any[] = [];
  geminiResponseAI;
  sectionBMarks;
  theoryResults = {
    marksB: "",
    quiz: {
      qId: ""
    }
  }
  localStorageKey = 'quiz_answers';
  public currentQuestions: Question[] = [];
  compulsoryPrefixes: string[] = [];

  // ── UI STATE ──
  activeSection: 'A' | 'B' = 'A';   // ← ADD THIS — defaults to Section A
  isLightTheme: boolean = false;

  // ============================================================================
  // TIMER
  // ============================================================================
  showTimeUpModal = false;
  private isExpiredHandled = false;
  countdownText = '';
  progressPercent = 100;
  private timerSubscription: Subscription;
  private autoSaveSubscription: Subscription;
  private isTimerLoaded: boolean = false;

  constructor(
    private _quiz: QuizService,
    private fb: FormBuilder,
    private login: LoginService,
    private locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _snack: MatSnackBar,
    private _questions: QuestionService,
    private router: Router,
    private quiz_progress: QuizProgressService,
    private screenshotPrevention: ScreenshotPreventionService,
    private quizProtection: QuizProtectionService // <-- INJECT THE PROTECTION SERVICE
  ) { }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnInit(): void {
    this.screenshotPrevention.enableProtection();
    this.isLoading = true;
    this.screenshotPrevention.enableProtection();
    // After enableProtection():


    this.qid = this._route.snapshot.params['qid'];
    console.log(this.qid);
    this.quizProtection.setQuizContext(this.qid, baseUrl, localStorage.getItem('token') || '');

    //  this.quizProtection.setQuizContext(this.qid, baseUrl, localStorage.getItem('token') || '');

    //     // Inside initializeTimer():
    this.quizProtection.loadDelayFromBackend(this.qid);
    // Setup protection subscriptions FIRST
    this.setupProtectionSubscriptions();
    this.startAutoSaveviolationDelay(); // <-- ADD THIS LINE HERE

    this._quiz.getQuiz(this.qid).subscribe(
      (data: any) => {
        console.log(data.title);
        this.quiz = data;
        this.courseTitle = this.quiz.category.title;
        console.log(this.quiz);
        console.log(this.quiz.quizTime);
        this.timeO = this.quiz.quizTime * 1;
        this.timerAll = (this.timeT + this.timeO) * 60;
        console.log(this.timerAll);
        console.log(this.timeO * 60);
        // Enable protection AFTER quiz data is loaded
                this.enableQuizProtection();
        this.enableQuizProtection();

        // ✅ KEEP these too (re-sets context after enableProtection resets state)

        this.quizProtection.setQuizContext(this.qid, baseUrl, localStorage.getItem('token') || '');
        this.quizProtection.loadDelayFromBackend(this.qid);
        this.quizProtection.loadViolationCountFromBackend(this.qid);
      },
      (error) => {
        this.isLoading = false;
        this._snack.open("You're Session has expired! ", "", {
          duration: 3000,
        });
        this.login.logout();
        console.log("error !!");
      }
    );

    this.loadQuestions();

    this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe(
      (data: any) => {
        this.numberOfQuestionsToAnswer = data[0].totalQuestToAnswer;
        console.log("This is for number of questions to answer", data[0].timeAllowed);
        console.log("Number question to answer ", data[0].totalQuestToAnswer);
        this.quizTitle = data[0].quiz.title;
        this.courseTitle = data[0].quiz.category.title;

        this.loadTheory();
        this.timeT = data[0].timeAllowed;
        console.log("This is the number of questions to answer", this.numberOfQuestionsToAnswer);
        console.log("This is the time for the Theory ", this.timeT);

        this.startAutoSave();
      },
      (error) => {
        this.isLoading = false;
      }
    );

    this.initForm();
    this.preventBackButton();




  }

  ngOnDestroy(): void {
    // CRITICAL: Disable protection when leaving the component
    this.disableQuizProtection();

    // Save timer before leaving the page
    if (this.isTimerLoaded && this.timerAll > 0) {
      this.saveTimerToDatabase();
    }

    // Clean up subscriptions
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }

    // Clean up protection subscriptions
    this.protectionSubscriptions.forEach(sub => sub.unsubscribe());
    if (this.autoSaveViolationDelaySubscription) {
      this.autoSaveViolationDelaySubscription.unsubscribe();
    }
  }

  // ============================================================================
  // QUIZ PROTECTION METHODS
  // ============================================================================

  /**
   * Setup subscriptions to protection service events
   */
  private setupProtectionSubscriptions(): void {
    // Subscribe to state changes
    this.protectionSubscriptions.push(
      this.quizProtection.onStateChange.subscribe(state => {
        this.protectionState = state;
        console.log('[Quiz Protection] State updated:', state);
      })
    );

    // Subscribe to violations
    this.protectionSubscriptions.push(
      this.quizProtection.onViolation.subscribe(event => {
        console.log('[Quiz Protection] Violation detected:', event);
        this.handleProtectionViolation(event);
      })
    );

    // Subscribe to auto-submit warning (when getting close to max violations)
    this.protectionSubscriptions.push(
      this.quizProtection.onAutoSubmitWarning.subscribe(({ remaining, total }) => {
        console.warn(`[Quiz Protection] Auto-submit warning: ${remaining}/${total} violations remaining`);
        this.handleAutoSubmitWarning(remaining, total);
      })
    );

    // Subscribe to auto-submit countdown
    this.protectionSubscriptions.push(
      this.quizProtection.onAutoSubmitCountdown.subscribe(countdown => {
        console.log(`[Quiz Protection] Auto-submit countdown: ${countdown}`);
      })
    );

    // Subscribe to auto-submit execution - THIS IS THE MAIN AUTO-SUBMIT HANDLER
    this.protectionSubscriptions.push(
      this.quizProtection.onAutoSubmit.subscribe((payload: AutoSubmitPayload) => {
        console.log('[Quiz Protection] Auto-submit executed:', payload);
        this.executeAutoSubmitFromProtection(payload);
      })
    );

    // Subscribe to auto-submit cancelled (if user somehow cancels)
    this.protectionSubscriptions.push(
      this.quizProtection.onAutoSubmitCancelled.subscribe(() => {
        console.log('[Quiz Protection] Auto-submit was cancelled');
        this._snack.open('Auto-submit cancelled. Please remain on the quiz page.', 'OK', { duration: 3000 });
      })
    );

    // Subscribe to delay started
    this.protectionSubscriptions.push(
      this.quizProtection.onDelayStarted.subscribe((event: DelayEvent) => {
        console.log('[Quiz Protection] Delay started:', event);
        // Optionally show additional UI feedback
        if (event.willAutoSubmitNext) {
          console.warn('[Quiz Protection] FINAL WARNING: Next violation will auto-submit!');
        }
      })
    );

    // Subscribe to delay tick (countdown updates)
    this.protectionSubscriptions.push(
      this.quizProtection.onDelayTick.subscribe(remaining => {
        // Update any UI that shows delay countdown
        console.log(`[Quiz Protection] Delay remaining: ${remaining}s`);
      })
    );

    // Subscribe to delay ended
    this.protectionSubscriptions.push(
      this.quizProtection.onDelayEnded.subscribe(() => {
        console.log('[Quiz Protection] Delay ended, quiz access restored');
        this._snack.open('Quiz access restored. Please continue.', 'OK', { duration: 3000 });
      })
    );
  }

  /**
   * Enable quiz protection with appropriate settings
   * Call this when quiz is ready to start
   */
  private enableQuizProtection(): void {

    const violationConfig = {
      action: (this.quiz.violationAction || 'NONE') as 'NONE' | 'DELAY_ONLY' | 'AUTOSUBMIT_ONLY' | 'DELAY_AND_AUTOSUBMIT',
      maxViolations: this.quiz.maxViolations ?? 3,
      delaySeconds: this.quiz.delaySeconds ?? 30,
      delayIncrementOnRepeat: this.quiz.delayIncrementOnRepeat ?? true,
      delayMultiplier: this.quiz.delayMultiplier ?? 1.5,
      maxDelaySeconds: this.quiz.maxDelaySeconds ?? 120,
      autoSubmitCountdownSeconds: this.quiz.autoSubmitCountdownSeconds ?? 5,
    };

    // Set the violation config from database
    this.quizProtection.setViolationConfig(violationConfig);

    // Configure other protection settings from database
    this.quizProtection.updateConfig({
      examMode: 'proctored',

      // Watermark settings from database
      watermarkEnabled: this.quiz.enableWatermark ?? true,
      watermarkOpacity: 0.12,
      watermarkCount: 25,
      watermarkText: `${this.getUserDisplayName()} • ${this.courseTitle} • ${new Date().toLocaleDateString()}`,

      // Alerts & Logging
      enableAlerts: true,
      enableLogging: true,
      logEndpoint: '/api/security-events',

      // Fullscreen lock from database
      enableFullscreenLock: this.quiz.enableFullscreenLock ?? true,
      fullscreenRetryInterval: 2000,

      // Focus monitoring
      focusCheckInterval: 1000,

      // Grace period
      autoSubmitGracePeriodMs: 1000,

      // Mobile protection
      enableMobileProtection: true,
      preventZoom: true,

      // Screenshot & DevTools blocking from database
      enableScreenshotBlocking: this.quiz.enableScreenshotBlocking ?? true,
      enableDevToolsBlocking: this.quiz.enableDevToolsBlocking ?? true,

      // Wake Lock (keeps screen on)
      enableWakeLock: true,
    });

    // Enable protection
    this.quizProtection.enableProtection();

    console.log('[Quiz Protection] Protection enabled for quiz:', this.qid);
    console.log('[Quiz Protection] Violation Config from DB:', violationConfig);
  }

  /**
   * Disable quiz protection
   * Call this when quiz is submitted or user leaves legitimately
   */
  private disableQuizProtection(): void {
    this.quizProtection.disableProtection();
    console.log('[Quiz Protection] Protection disabled');
  }

  /**
   * Handle violation events from protection service
   */
  private handleProtectionViolation(event: SecurityEvent): void {
    console.warn(`[Quiz Violation] Type: ${event.type}, Details: ${event.details}, Severity: ${event.severity}`);

    // Show violation count in UI when getting concerning
    // if (this.protectionState.violationCount >= 2) {
    //   const remaining = this.quizProtection.getConfig().maxViolations - this.protectionState.violationCount;
    //   if (remaining > 0) {
    //     this._snack.open(
    //       `⚠️ Warning: ${this.protectionState.violationCount} violations. ${remaining} remaining before auto-submit.`,
    //       'OK',
    //       { duration: 4000 }
    //     );
    //   }
    // }
  }

  /**
   * Handle auto-submit warning (approaching max violations)
   */






  // import { injectSwalStyles } from './swal-styles';

  private handleAutoSubmitWarning(remaining: number, total: number): void {

    injectSwalStyles();

    // ── WARNING: 2 violations remaining ──────────────────────────────────────
    if (remaining === 2) {
      Swal.fire({
        html: `
        <div class="qpw-body">

          <!-- Icon -->
          <div class="qpw-icon-box" style="
            background:rgba(251,191,36,.07);
            border:1px solid rgba(251,191,36,.22);
            color:#fbbf24;
          ">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <!-- Badge -->
          <div class="qpw-badge" style="
            background:rgba(251,191,36,.07);
            border:1px solid rgba(251,191,36,.2);
            color:rgba(251,191,36,.85);
          ">
            <span class="qpw-dot" style="background:rgba(251,191,36,.85)"></span>
            SECURITY WARNING
          </div>

          <!-- Title -->
          <h2 class="qpw-title">Suspicious Activity Detected</h2>
          <p class="qpw-sub">
            Your activity indicates behaviour outside the quiz environment.
            Please return your focus to this screen immediately.
          </p>

          <!-- Violations counter -->
          <div style="
            width:100%; padding:14px 18px;
            background:rgba(251,191,36,.05);
            border:1px solid rgba(251,191,36,.18);
            border-radius:11px;
            display:flex; align-items:center; justify-content:space-between;
            margin-bottom:12px; box-sizing:border-box;
          ">
            <span style="
              font-family:'Geist Mono',monospace; font-size:11px;
              color:rgba(255,255,255,.35); letter-spacing:.06em;
            ">VIOLATIONS REMAINING</span>
            <span style="
              font-family:'Geist Mono',monospace; font-size:26px; font-weight:800;
              color:rgba(251,191,36,.9); letter-spacing:-.02em; line-height:1;
            ">${remaining}</span>
          </div>

          <!-- Warning strip -->
          <div class="qpw-warn" style="
            background:rgba(251,191,36,.04);
            border-color:rgba(251,191,36,.15);
            color:rgba(251,191,36,.55);
          ">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:1px">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            One more warning will trigger the final lockout notice. Stay on this page.
          </div>

        </div>
      `,
        title: "",
        timer: 4500,
        showConfirmButton: false,
        timerProgressBar: true,
        allowOutsideClick: false,
        buttonsStyling: false,
        customClass: { popup: 'qpw-popup' },
        didOpen: () => {
          // Override timer bar colour to amber
          const bar = document.querySelector('.qpw-popup .swal2-timer-progress-bar') as HTMLElement;
          if (bar) bar.style.background = 'rgba(251,191,36,.5)';
        }
      });
    }

    // ── FINAL WARNING: 1 violation remaining ─────────────────────────────────
    if (remaining === 1) {
      Swal.fire({
        html: `
        <div class="qpw-body">

          <!-- Icon with pulsing ring -->
          <div class="qpw-icon-box error" style="position:relative">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style="
              position:absolute; inset:-7px; border-radius:22px;
              border:1px solid rgba(248,113,113,.2);
              animation:qpwRing .5s ease both;
            "></span>
          </div>

          <!-- Badge -->
          <div class="qpw-badge error">
            <span class="qpw-dot"></span>FINAL WARNING
          </div>

          <!-- Title -->
          <h2 class="qpw-title">Last Chance</h2>
          <p class="qpw-sub">
            You have reached the maximum allowed violations.
            <strong>One more will automatically submit your quiz.</strong>
          </p>

          <!-- Big red alert chip -->
          <div style="
            width:100%; padding:13px 18px;
            background:rgba(248,113,113,.07);
            border:1px solid rgba(248,113,113,.25);
            border-radius:11px;
            display:flex; align-items:center; gap:12px;
            margin-bottom:12px; box-sizing:border-box;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="rgba(248,113,113,.8)" stroke-width="2" stroke-linecap="round"
                 style="flex-shrink:0">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
            <span style="
              font-family:'Geist Mono',monospace; font-size:11px; font-weight:600;
              color:rgba(248,113,113,.8); letter-spacing:.04em; line-height:1.4;
            ">ONE MORE VIOLATION WILL AUTO-SUBMIT YOUR QUIZ</span>
          </div>

          <!-- Do not list -->
          <div style="
            width:100%; padding:14px 16px;
            background:#141414; border:1px solid #262626; border-radius:11px;
            text-align:left; box-sizing:border-box; margin-bottom:4px;
          ">
            <div style="
              font-family:'Geist Mono',monospace; font-size:8.5px; font-weight:600;
              letter-spacing:.12em; text-transform:uppercase;
              color:rgba(255,255,255,.25); margin-bottom:10px;
            ">DO NOT</div>
            <div style="display:flex; flex-direction:column; gap:7px;">
              ${[
            'Switch browser tabs or applications',
            'Exit fullscreen mode',
            'Use restricted keyboard shortcuts',
            'Right-click on the page',
          ].map(item => `
                <div style="display:flex; align-items:center; gap:9px;">
                  <span style="
                    width:18px; height:18px; border-radius:5px; flex-shrink:0;
                    background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.18);
                    display:flex; align-items:center; justify-content:center;
                  ">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                         stroke="rgba(248,113,113,.7)" stroke-width="3" stroke-linecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                  <span style="
                    font-family:'Sora',sans-serif; font-size:12px; font-weight:400;
                    color:rgba(255,255,255,.5); line-height:1.4;
                  ">${item}</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      `,
        title: "",
        confirmButtonText: 'I Understand — Continue Quiz',
        allowOutsideClick: false,
        allowEscapeKey: false,
        buttonsStyling: false,
        customClass: {
          popup: 'qpw-popup state-error',
          confirmButton: 'qpw-btn-confirm',
        },
      });
    }

  }




  /**
   * Execute auto-submit - called when protection service triggers auto-submit
   */
  private executeAutoSubmitFromProtection(payload: AutoSubmitPayload): void {
    console.log('[Quiz Protection] Executing auto-submit with payload:', payload);

    // Clear any saved draft answers
    this.clearSavedAnswers();

    // Build evaluation list based on quiz type
    const evaluations: Observable<any>[] = [];

    if (this.timeO > 0 && this.questions && this.questions.length > 0) {
      evaluations.push(this.evalQuiz());
    }

    if (this.timeT > 0 && Object.keys(this.selectedQuestions).length > 0) {
      evaluations.push(this.evalSubjective());
    }

    // If no evaluations needed, just finish
    if (evaluations.length === 0) {
      this.finalizeAutoSubmit(payload);
      return;
    }

    // Execute all evaluations
    forkJoin(
      evaluations.map(obs =>
        obs.pipe(
          catchError(err => {
            console.error('[Auto-Submit] Evaluation error:', err);
            return of(null); // Continue even if one fails
          })
        )
      )
    ).subscribe({
      next: (results) => {
        console.log('[Auto-Submit] All evaluations completed:', results);
        this.clearProgress();
        this.finalizeAutoSubmit(payload);
      },
      error: (err) => {
        console.error('[Auto-Submit] Unexpected error:', err);
        this.finalizeAutoSubmit(payload);
      }
    });
  }

  /**
   * Finalize the auto-submit process
   */



  // Import at the top of your component file:
  // import { injectSwalStyles } from './swal-styles';

  private finalizeAutoSubmit(payload: AutoSubmitPayload): void {
    this.disableQuizProtection();
    injectSwalStyles();

    Swal.fire({
      html: `
      <div class="qpw-body">

        <!-- Icon -->
        <div class="qpw-icon-box error" style="position:relative">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <!-- Pulsing ring -->
          <span style="
            position:absolute; inset:-7px; border-radius:22px;
            border:1px solid rgba(248,113,113,.18);
            animation:qpwRing .5s ease both;
          "></span>
        </div>

        <!-- Badge -->
        <div class="qpw-badge error"><span class="qpw-dot"></span>AUTO-SUBMITTED</div>

        <!-- Title -->
        <h2 class="qpw-title">Quiz Submitted</h2>
        <p class="qpw-sub">
          Your quiz was automatically submitted due to a security violation.
          Your answers have been saved.
        </p>

        <!-- Stats grid -->
        <div style="
          width:100%;
          display:grid; grid-template-columns:1fr 1fr;
          gap:8px; margin-bottom:14px;
        ">
          <div style="
            background:#141414; border:1px solid #2a2a2a; border-radius:10px;
            padding:12px 14px; text-align:left;
          ">
            <div style="
              font-family:'Geist Mono',monospace; font-size:8.5px; letter-spacing:.12em;
              text-transform:uppercase; color:rgba(255,255,255,.25); margin-bottom:5px;
            ">REASON</div>
            <div style="
              font-family:'Sora',sans-serif; font-size:12px; font-weight:500;
              color:rgba(248,113,113,.8); line-height:1.4;
            ">${payload.reason}</div>
          </div>

          <div style="
            background:#141414; border:1px solid #2a2a2a; border-radius:10px;
            padding:12px 14px; text-align:left;
          ">
            <div style="
              font-family:'Geist Mono',monospace; font-size:8.5px; letter-spacing:.12em;
              text-transform:uppercase; color:rgba(255,255,255,.25); margin-bottom:5px;
            ">VIOLATIONS</div>
            <div style="
              font-family:'Geist Mono',monospace; font-size:20px; font-weight:700;
              color:rgba(248,113,113,.85);
            ">${payload.totalViolations}</div>
          </div>

          <div style="
            background:#141414; border:1px solid #2a2a2a; border-radius:10px;
            padding:12px 14px; text-align:left;
          ">
            <div style="
              font-family:'Geist Mono',monospace; font-size:8.5px; letter-spacing:.12em;
              text-transform:uppercase; color:rgba(255,255,255,.25); margin-bottom:5px;
            ">TIME PENALTY</div>
            <div style="
              font-family:'Geist Mono',monospace; font-size:18px; font-weight:700;
              color:rgba(255,255,255,.6);
            ">+${payload.penaltySeconds}s</div>
          </div>

          <div style="
            background:#141414; border:1px solid #2a2a2a; border-radius:10px;
            padding:12px 14px; text-align:left;
          ">
            <div style="
              font-family:'Geist Mono',monospace; font-size:8.5px; letter-spacing:.12em;
              text-transform:uppercase; color:rgba(255,255,255,.25); margin-bottom:5px;
            ">DELAY SERVED</div>
            <div style="
              font-family:'Geist Mono',monospace; font-size:18px; font-weight:700;
              color:rgba(255,255,255,.6);
            ">${this.formatDelayTime(payload.totalDelayTimeServed)}</div>
          </div>
        </div>

        <!-- Footer note -->
        <div style="
          display:flex; align-items:flex-start; gap:8px; width:100%;
          padding:10px 14px;
          background:rgba(255,255,255,.03); border:1px solid #222; border-radius:9px;
          font-family:'Geist Mono',monospace; font-size:10px;
          color:rgba(255,255,255,.28); text-align:left; line-height:1.6;
          margin-bottom:4px; box-sizing:border-box;
        ">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:1px;color:rgba(255,255,255,.25)">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Results are available on the dashboard. Contact your instructor if you believe this was an error.
        </div>

      </div>
    `,
      title: "",
      confirmButtonText: 'Go to Dashboard',
      allowOutsideClick: false,
      allowEscapeKey: false,
      buttonsStyling: false,
      customClass: {
        popup: 'qpw-popup state-error',
        confirmButton: 'qpw-btn-confirm',
      },
    }).then(() => {
      if (window.opener) {
        window.opener.location.href = '/user-dashboard/0';
      }
      window.close();
      setTimeout(() => {
        this.router.navigate(['/user-dashboard/0']);
      }, 500);
    });
  }









  /**
   * Format delay time for display
   */
  private formatDelayTime(seconds: number): string {
    if (!seconds || seconds === 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Legacy handler - kept for backwards compatibility
   */
  private handleAutoSubmitFromProtection(reason: string, violations: any[]): void {
    // This is now handled by executeAutoSubmitFromProtection
    console.log('[Quiz Protection] Legacy auto-submit handler called');
  }

  /**
   * Get user display name for watermark
   */
  private getUserDisplayName(): string {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.username || user.name || user.email || 'Student';
      }
    } catch (e) {
      console.error('Error getting user data:', e);
    }
    return 'Student';
  }

  /**
   * Manually trigger fullscreen (e.g., from a button)
   */
  requestFullscreen(): void {
    this.quizProtection.enterFullscreen()
      .then(() => {
        console.log('Fullscreen activated');
      })
      .catch(err => {
        console.warn('Could not enter fullscreen:', err);
        this._snack.open('Please enable fullscreen mode for the quiz', 'OK', { duration: 3000 });
      });
  }

  /**
   * Get current protection state for UI display
   */
  getProtectionState(): QuizProtectionState {
    return this.protectionState;
  }

  // ============================================================================
  // HOST LISTENERS
  // ============================================================================

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    this.saveTimerToDatabase();
    console.log('timerAll:', this.timerAll);
    console.log("Helllooooo...");
    this.preventBackButton();
    event.returnValue = '' as any;
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event): void {
    this.preventBackButton();
  }

  // ============================================================================
  // FORM INITIALIZATION
  // ============================================================================

  initForm(): void {
    const formGroupConfig = {};
    this.questionT.forEach(question => {
      formGroupConfig[question.id] = ['', Validators.required];
    });
    this.quizForm = this.fb.group(formGroupConfig);
  }

  get isSubmitDisabled(): boolean {
    const selectedCount = Object.values(this.selectedQuestions).filter(val => val === true).length;
    const compulsoryGroups = this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
    const allCompulsorySelected = compulsoryGroups.every(prefix => this.selectedQuestions[prefix] === true);
    const hasCorrectTotal = selectedCount === this.numberOfQuestionsToAnswer;
    return !allCompulsorySelected || !hasCorrectTotal;
  }

  // ============================================================================
  // TIMER METHODS
  // ============================================================================

  totalTime(): number {
    const timeT = Number(this.timeT) || 0;
    const quizTime = Number(this.quiz.quizTime) || 0;
    return timeT + quizTime;
  }

  getFormmatedTime(): string {
    const hr = Math.floor(this.timerAll / 3600);
    const mm = Math.floor((this.timerAll % 3600) / 60);
    const ss = this.timerAll % 60;

    let formattedTime = '';
    if (hr > 0) {
      formattedTime += `${hr} hr(s) : `;
    }
    formattedTime += `${mm} min : ${ss} sec`;
    return formattedTime;
  }

  initializeTimer(): void {
    this.quiz_progress.getQuizTimer(this.qid).subscribe({
      next: (savedTimer) => {
        this.timerAll = (savedTimer?.remainingTime && savedTimer.remainingTime > 0)
          ? savedTimer.remainingTime
          : (this.timeT + this.timeO) * 60;

        if (!savedTimer || savedTimer.remainingTime <= 0) {
          this.saveTimerToDatabase();
        }

        this.isTimerLoaded = true;
        this.startCountdown();
      },
      error: () => {
        this.timerAll = (this.timeT + this.timeO) * 60;
        this.isTimerLoaded = true;
        this.startCountdown();
      }
    });
  }

  private startCountdown(): void {
    this.timerSubscription?.unsubscribe();

    this.timerSubscription = interval(1000).subscribe(() => {
      this.timerAll--;

      if (this.timerAll % 10 === 0) {
        this.saveTimerToDatabase();
      }

      if (this.timerAll <= 0) {
        this.onTimerExpired();
      }
    });
  }

  private onTimerExpired(): void {
    if (this.isExpiredHandled) return;
    this.isExpiredHandled = true;

    this.timerSubscription?.unsubscribe();
    this.timerAll = 0;
    this.saveTimerToDatabase();
    this.showTimeUpModal = true;

    const total = 5;
    let count = total;
    this.countdownText = count.toString();
    this.progressPercent = 100;

    // Play initial warning sound
    this.quizProtection.playUrgentWarning();

    const timerInterval = setInterval(() => {
      count--;
      this.progressPercent = (count / total) * 100;

      if (count > 0) {
        this.countdownText = count.toString();
        // Play beep for last 3 seconds using the protection service
        if (count <= 3) {
          this.quizProtection.playCountdownBeep();
        }
      } else {
        clearInterval(timerInterval);
        this.countdownText = 'Submitting...';
        this.progressPercent = 0;
        this.clearSavedAnswers();
        this.clearProgress();

        setTimeout(() => {
          const observables: Observable<any>[] = [];

          if (this.evalQuiz) {
            observables.push(this.evalQuiz());
            this.clearSavedAnswers();
            this.clearProgress();

          }
          if (this.evalSubjective) {
            observables.push(this.evalSubjective());
            this.clearSavedAnswers();
            this.clearProgress();


          }

          if (observables.length === 0) {
            this.finishAfterEvaluation();
            return;
          }

          forkJoin(
            observables.map(obs =>
              obs.pipe(
                catchError(err => {
                  console.error('One evaluation failed:', err);
                  return of(null);
                })
              )
            )
          ).subscribe({
            next: () => {
              console.log('All evaluations completed');
              this.finishAfterEvaluation();
              this.clearSavedAnswers();
              this.clearProgress();


            },
            error: (err) => {
              console.error('Unexpected error in evaluation', err);
              this.finishAfterEvaluation();
            }
          });
        }, 700);
      }
    }, 1000);
  }

  private finishAfterEvaluation(): void {
    this.showTimeUpModal = false;
    this.disableQuizProtection(); // <-- DISABLE PROTECTION
    this.preventBackButton();
    if (window.opener) {
      window.opener.location.href = '/user-dashboard/0';
    }
    window.close();
  }

  private saveTimerToDatabase(): void {
    this.quiz_progress.saveQuizTimer(this.qid, this.timerAll).subscribe({
      next: (response) => {
        console.log('Timer saved successfully:', response);
      },
      error: (error) => {
        console.error('Failed to save timer:', error);
      }
    });
  }

  private startAutoSave(): void {
    this.autoSaveSubscription = interval(10000).subscribe(() => {
      if (this.isTimerLoaded && this.timerAll > 0) {
        this.saveTimerToDatabase();
      }
    });
  }









  // ============================================================================
  // THEORY/SUBJECTIVE QUESTIONS
  // ============================================================================

  loadTheory(): void {
    this._questions.getSubjective(this.qid).subscribe(
      (theory: any) => {
        console.log(theory);
        this.groupedQuestions = this.getQuestionsGroupedByPrefix(theory);
        this.prefixes = this.sortPrefixesByCompulsory(this.groupedQuestions);
        this.compulsoryPrefixes = this.getCompulsoryPrefixes();
        this.loadQuestionsTheory();
        console.log(this.groupedQuestions);
        this.preventBackButton();

        if (!this.isLoading) {
          this.isLoading = false;
        }
      },
      (error) => {
        console.log("Could not load data from server");
        this.isLoading = false;
      }
    );
  }

  getCompulsoryPrefixes(): string[] {
    return this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
  }

  isCurrentGroupCompulsory(): boolean {
    if (!this.currentQuestions || this.currentQuestions.length === 0) {
      return false;
    }
    return this.currentQuestions.every(q => q.isCompulsory);
  }

  isGroupCompulsory(prefix: string): boolean {
    const questions = this.groupedQuestions[prefix];
    if (!questions || questions.length === 0) {
      return false;
    }
    return questions.every((q: any) => q.isCompulsory);
  }

  sortPrefixesByCompulsory(groupedQuestions: any): string[] {
    const prefixes = Object.keys(groupedQuestions);

    return prefixes.sort((prefixA, prefixB) => {
      const questionsA = groupedQuestions[prefixA];
      const questionsB = groupedQuestions[prefixB];
      const isGroupACompulsory = questionsA.every((q: any) => q.isCompulsory);
      const isGroupBCompulsory = questionsB.every((q: any) => q.isCompulsory);

      if (isGroupACompulsory && !isGroupBCompulsory) return -1;
      if (!isGroupACompulsory && isGroupBCompulsory) return 1;
      return prefixA.localeCompare(prefixB, undefined, { numeric: true });
    });
  }

  getQuestionsGroupedByPrefix(questions): any {
    return questions.reduce((acc, question) => {
      const prefix = question.quesNo.match(/^[A-Za-z]+[0-9]+/)[0];
      if (!acc[prefix]) {
        acc[prefix] = [];
      }
      acc[prefix].push(question);
      return acc;
    }, {});
  }

  loadQuestionsTheory(): void {
    this.prefixes.forEach(prefix => {
      if (this.isGroupCompulsory(prefix)) {
        this.selectedQuestions[prefix] = true;
      }
    });
    const key = this.prefixes[this.currentPage];
    this.currentQuestions = this.groupedQuestions[key] || [];
    this.loadAnswers();
  }

  togglePrefixSelection(prefix: string): void {
    if (this.isGroupCompulsory(prefix)) {
      this.selectedQuestions[prefix] = true;
      alert(`${prefix} contains compulsory questions and cannot be deselected.`);
      return;
    }
    this.selectedQuestions[prefix] = !this.selectedQuestions[prefix];
    console.log('After toggle:', this.selectedQuestions);
  }

  onPrefixChange(prefix: string): void {
    this.selectedPrefix = prefix;
  }

  nextPage(): void {
    this.saveAnswers();
    if (this.currentPage < this.prefixes.length - 1) {
      this.currentPage++;
      this.loadQuestionsTheory();
    }
  }

  prevPage(): void {
    this.saveAnswers();
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadQuestionsTheory();
    }
  }

  onQuestionSelect(question: Question): void {
    if (question.selected) {
      question.selected = false;
      this.selectedQuestionsCount--;
    } else {
      if (this.selectedQuestionsCount < 2) {
        question.selected = true;
        this.selectedQuestionsCount++;
      } else {
        alert('You can only select 2 questions.');
      }
    }
  }

  // ============================================================================
  // QUESTIONS LOADING
  // ============================================================================

  loadQuestionsWithAnswers(): void {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe(
      (data: any) => {
        this.questionWithAnswers = data;
        console.log(data);
        console.log(this.questionWithAnswers);
      },
      (error) => {
        console.log("Error Loading questions");
        Swal.fire("Error", "Error loading questions with answers", "error");
      }
    );
    this.preventBackButton();
  }

  loadQuestions(): void {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe(
      (data: any) => {
        const storedAnswers = JSON.parse(localStorage.getItem('selectedAnswers') || '{}');
        this.loadSavedAnswers();

        this.questions = data.map((q, index) => {
          q.count = index + 1;
          if (storedAnswers[q.quesId]) {
            q.givenAnswer = [...storedAnswers[q.quesId]];
          } else {
            q.givenAnswer = [];
          }
          console.log(`📥 Question ID: ${q.quesId}, Restored Answers:`, q.givenAnswer);
          return q;
        });

        this.isLoading = false;
        console.log("✅ Final loaded questions:", this.questions);
        this.initializeTimer();
      },
      (error) => {
        console.log("Error Loading questions");
        this.isLoading = false;
        Swal.fire("Error", "Error loading questions", "error");
      }
    );
    this.preventBackButton();
  }

  // ============================================================================
  // NAVIGATION PREVENTION
  // ============================================================================

  preventBackButton(): void {
    history.pushState(null, null, location.href);
    this.locationSt.onPopState(() => {
      history.pushState(null, null, location.href);
    });
  }

  // ============================================================================
  // QUIZ SUBMISSION
  // ============================================================================

  submitQuiz(): void {
    Swal.fire({
      title: "Do you want to submit the quiz?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel"
    }).then((e) => {
      if (e.isConfirmed) {
        this.clearSavedAnswers();
        this.clearProgress();

        Swal.fire({
          title: 'Evaluating...',
          text: `Please wait while we evaluate your quiz for "${this.courseTitle}".`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        setTimeout(() => {
          this.evalQuiz();
          this.waitNavigateFunction();
          this.loadQuestionsWithAnswers();
          this.clearProgress();
          this.preventBackButton();
          this.disableQuizProtection(); // <-- DISABLE PROTECTION

          Swal.fire({
            icon: 'success',
            title: 'Evaluated!',
            text: `Your results for "${this.courseTitle}" is available for print on the dashboard.`,
            timer: 1000,
            showConfirmButton: false
          });
          setTimeout(() => {
            window.close();
            if (window.opener) {
              window.opener.location.href = '/user-dashboard/0';
            }
          }, 1200);
        }, 3000);
      }
    });
  }







  // Import at the top of your component file:
  // import { injectSwalStyles } from './swal-styles';




  async submitAllQuiz(): Promise<void> {
    injectSwalStyles();

    // ── 1. CONFIRM SUBMISSION ─────────────────────────────────────────────────
    Swal.fire({
      html: `
      <div class="qpw-body">
        <div class="qpw-icon-box accent">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="qpw-badge accent"><span class="qpw-dot"></span>FINAL STEP</div>
        <h2 class="qpw-title">Submit Quiz?</h2>
        <p class="qpw-sub">
          You are about to submit
          <strong>${this.courseTitle}</strong>.
          This action cannot be undone.
        </p>
        <div class="qpw-warn">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Make sure you have answered all required questions before submitting.
        </div>
      </div>
    `,
      title: "",
      showCancelButton: true,
      confirmButtonText: 'Submit Quiz',
      cancelButtonText: 'Keep Working',
      allowOutsideClick: false,
      buttonsStyling: false,
      customClass: {
        popup: 'qpw-popup',
        confirmButton: 'qpw-btn-confirm',
        cancelButton: 'qpw-btn-cancel',
      },
    }).then((e) => {
      if (!e.isConfirmed) return;


      // ── 2. EVALUATING ─────────────────────────────────────────────────────────
      Swal.fire({
        html: `
        <div class="qpw-body" style="padding-bottom:8px">
          <div class="qpw-icon-box accent">
            <svg class="qpw-spin" width="28" height="28" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </div>
          <div class="qpw-badge accent"><span class="qpw-dot"></span>PROCESSING</div>
          <h2 class="qpw-title">Evaluating Quiz</h2>
          <p class="qpw-sub">
            Please wait while we evaluate your answers for
            <strong>${this.courseTitle}</strong>.
            Do not close this window.
          </p>
          <div class="qpw-progress-track">
            <div class="qpw-progress-bar"></div>
          </div>
        </div>
      `,
        title: "",
        allowOutsideClick: false,
        showConfirmButton: false,
        buttonsStyling: false,
        customClass: { popup: 'qpw-popup' },
      });

      const evaluations: Observable<any>[] = [];
      if (this.timeO > 0) evaluations.push(this.evalQuiz());
      if (this.timeT > 0) evaluations.push(this.evalSubjective());

      if (evaluations.length === 0) {
        this.finishAfterEvaluation();
        return;
      }

      forkJoin(evaluations).subscribe({
        next: () => {
          this.waitNavigateFunction();
          this.loadQuestionsWithAnswers();
          this.clearProgress();
          this.clearSavedAnswers();
          this.preventBackButton();
          this.disableQuizProtection();

          // ── 3. SUCCESS ──────────────────────────────────────────────────────
          Swal.fire({
            html: `
            <div class="qpw-body" style="padding-bottom:4px">
              <div class="qpw-icon-box success">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div class="qpw-badge success"><span class="qpw-dot"></span>SUBMITTED</div>
              <h2 class="qpw-title">Quiz Evaluated!</h2>
              <p class="qpw-sub" style="margin-bottom:8px">
                Your results for <strong>${this.courseTitle}</strong>
                are ready. Redirecting to your dashboard…
              </p>
            </div>
          `,
            title: "",
            showConfirmButton: false,
            timer: 1400,
            timerProgressBar: true,
            buttonsStyling: false,
            customClass: { popup: 'qpw-popup state-success' },
          });

          setTimeout(() => {
            if (window.opener) window.opener.location.href = '/user-dashboard/0';
            window.close();
          }, 1200);

          this.clearSavedAnswers();
          this.clearProgress();
        },

        error: (err) => {
          console.error('Evaluation failed', err);
          console.error('Evaluation failed', err);
          console.error('Status:', err?.status);
          console.error('Message:', err?.error || err?.message);

          // ── 4. ERROR ────────────────────────────────────────────────────────
          Swal.fire({
            html: `
            <div class="qpw-body">
              <div class="qpw-icon-box error">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div class="qpw-badge error"><span class="qpw-dot"></span>ERROR</div>
              <h2 class="qpw-title">Submission Failed</h2>
              <p class="qpw-sub" style="margin-bottom:8px">
                Something went wrong while evaluating your quiz.
                Please contact your instructor or support team.
              </p>
            </div>
          `,
            title: "",
            confirmButtonText: 'Close',
            buttonsStyling: false,
            customClass: {
              popup: 'qpw-popup state-error',
              confirmButton: 'qpw-btn-confirm',
            },
          });
        }
      });
    });
  }



  waitNavigateFunction(): void {
    setTimeout(() => {
      this.printQuiz();
    }, 3000);
  }

  printQuiz(): void {
    this.router.navigate(['./user-dashboard/0']);
  }

  // ============================================================================
  // EVALUATION METHODS
  // ============================================================================

  evalQuiz(): Observable<any> {
    return new Observable(observer => {
      this._questions.evalQuiz(this.qid, this.questions).subscribe({
        next: (data: any) => {
          console.log(this.questions, data);
          this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
          this.correct_answer = data.correct_answer;
          this.attempted = data.attempted;
          this.maxMarks = data.maxMarks;

          localStorage.setItem('CorrectAnswer', JSON.stringify(this.correct_answer));
          localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
          localStorage.setItem('Attempted', JSON.stringify(this.attempted));
          localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks));

          this.clearSavedAnswers();

          this.clearProgress();
          this.preventBackButton();
          this.isSubmit = true;

          observer.next(data);
          observer.complete();
        },
        error: (err) => {
          console.error('Evaluation Error', err);
          observer.error(err);
        }
      });
    });
  }

  evalSubjective(): Observable<any> {
    return new Observable(observer => {
      this.selectedQuestionsAnswer = [];

     for (const prefix in this.selectedQuestions) {
  const group = this.groupedQuestions[prefix];
  if (!group) {
    console.warn(`No grouped questions found for prefix: "${prefix}"`);
    continue;
  }
  this.selectedQuestionsAnswer.push(...group);
     }
     console.log('groupedQuestions keys:', Object.keys(this.groupedQuestions));
console.log('selectedQuestions keys:', Object.keys(this.selectedQuestions));

      console.log('selectedQuestions keys:', Object.keys(this.selectedQuestions).length);
      console.log('numberOfQuestionsToAnswer:', this.numberOfQuestionsToAnswer);
      console.log('selectedQuestions:', this.selectedQuestions);
      if (Object.keys(this.selectedQuestions).length !== this.numberOfQuestionsToAnswer) {
        this._snack.open("Please select exactly 3 sets of questions to submit", "", {
          duration: 3000,
        });
        observer.error('Not enough questions selected');
        return;
      }
      localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestions));
      this.convertJson();

      console.log(this.convertedJsonAPIResponsebody);
      this._quiz.evalTheory(this.convertedJsonAPIResponsebody).subscribe({
        next: (data: any) => {
          console.log("Server Response:", data);
          this.geminiResponse = data;
          localStorage.setItem("answeredAIQuestions" + this.qid, JSON.stringify(this.geminiResponse));
          setTimeout(() => {
            this.loadSubjectiveAIEval();
          }, 1000);
          observer.next(data);
          observer.complete();
        },
        error: (err) => {
          console.error("Subjective evaluation failed", err);
          observer.error(err);
        }
      });
    });
  }

  // ============================================================================
  // SUBJECTIVE EVALUATION HELPERS
  // ============================================================================

  loadSubjectiveAIEval(): void {
    const geminiResponse = localStorage.getItem("answeredAIQuestions" + this.qid);
    console.log(geminiResponse);
    this.geminiResponseAI = this.groupByPrefix(this.geminiResponse);
    console.log('This is the geminiResponse groupedByPrefixes', this.geminiResponseAI);
    console.log("CHECKING ...");
    this.getScoresForPrefixes(this.geminiResponseAI);
    this.getGrandTotalMarks();
    this.addSectBMarks();
  }

  getTotalMarksForPrefix(questions: any[]): number {
    if (!questions || questions.length === 0) {
      return 0;
    }
    return questions.reduce((total, question) => {
      return total + (question.score || 0);
    }, 0);
  }

  groupByPrefix(data: QuestionResponse[]): GroupedQuestions[] {
    if (!Array.isArray(data)) {
      throw new Error('Input must be an array');
    }
    if (data.length === 0) {
      return [];
    }

    const prefixMap: Record<string, QuestionResponse[]> = {};

    data.forEach((questionResponse) => {
      if (!questionResponse.questionNumber) {
        console.warn('Question missing questionNumber:', questionResponse);
        return;
      }

      const prefixMatch = questionResponse.questionNumber.match(/^(Q\d+)/i);
      const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : 'UNCATEGORIZED';

      if (!prefixMap[prefix]) {
        prefixMap[prefix] = [];
      }
      prefixMap[prefix].push(questionResponse);
    });

    return Object.entries(prefixMap).map(([prefix, questions]) => ({
      prefix,
      questions
    }));
  }

  getGrandTotalMarks(): number {
    this.sectionBMarks = 0;

    if (!this.geminiResponseAI || this.geminiResponseAI.length === 0) {
      return 0;
    }

    this.sectionBMarks = this.geminiResponseAI.reduce((grandTotal, group) => {
      const prefixScores = this.getScoresForPrefixes([group]);
      const groupTotal = prefixScores.reduce((sum, p) => sum + p.totalScore, 0);
      return grandTotal + groupTotal;
    }, 0);

    console.log("Grand Total Marks: ", this.sectionBMarks);
    return this.sectionBMarks;
  }

  addSectBMarks(): void {
    this.theoryResults = {
      marksB: this.sectionBMarks,
      quiz: {
        qId: this.qid
      }
    };

    console.log(this.theoryResults);
    console.log(this.theoryResults.marksB);
    console.log(this.theoryResults.quiz.qId);

    this._quiz.addSectionBMarks(this.theoryResults).subscribe(
      (data) => {
        console.log("Marks successful");
      },
      (error) => {
        console.log("Unsuccessful");
      }
    );
  }

  getScoresForPrefixes(groupedData: GroupedQuestions[]): PrefixScores[] {
    return groupedData.map(group => {
      const { prefix, questions } = group;
      const safeQuestions = Array.isArray(questions) ? questions : [];
      const totalScore = safeQuestions.reduce((sum, q) => sum + q.score, 0);
      const totalMaxMarks = safeQuestions.reduce((sum, q) => sum + q.maxMarks, 0);
      const percentage = totalMaxMarks > 0
        ? Math.round((totalScore / totalMaxMarks) * 100)
        : 0;

      console.log("Total Marks for Prefix: ", totalScore, totalMaxMarks);

      return {
        prefix,
        totalScore,
        totalMaxMarks,
        percentage
      };
    });
  }

  getPrefixes(): string[] {
    const prefixes = new Set<string>();
    this.selectedQuestionsAnswer.forEach(question => {
      const prefix = question.quesNo.match(/^Q\d+/)?.[0];
      if (prefix) {
        prefixes.add(prefix);
      }
    });
    return Array.from(prefixes);
  }

  getGroupedQuestions(prefix: string): any[] {
    return this.selectedQuestionsAnswer.filter(q => q.quesNo.startsWith(prefix));
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  printPage(): void {
    window.print();
  }

  saveDataInBrowser(): void {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => { });
  }

  disablePaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  preventAction(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showWarningMessage('Copy/Paste operations are disabled during the exam');
    return;
  }

  private showWarningMessage(message: string): void {
    console.warn(message);
  }

  // ============================================================================
  // ANSWER PERSISTENCE
  // ============================================================================

  clearSavedAnswers(): void {
    this.quiz_progress.clearAnswers(this.qid).subscribe({
      next: (response) => {
        console.log(response.message);
        this.currentQuestions.forEach((q: any) => {
          q.givenAnswer = '';
        });
      },
      error: (error) => {
        console.error('Error clearing answers:', error);
      }
    });
  }


  clearProgress() {
    this.quiz_progress.clearQuizAnswers(this.qid).subscribe((data: any) => {
      console.log("Quiz Progress has been cleared!!")
    },
      (error) => {
        console.log("Error clraring quiz progress");
      }
    );
  }





  updateSelectedAnswers(q: any, option: string, isChecked: boolean): string[] {
    if (!q.givenAnswer) {
      q.givenAnswer = [];
    }

    if (isChecked) {
      if (!q.givenAnswer.includes(option)) {
        q.givenAnswer.push(option);
      }
    } else {
      const index = q.givenAnswer.indexOf(option);
      if (index !== -1) {
        q.givenAnswer.splice(index, 1);
      }
    }

    const currentAnswers = [...q.givenAnswer];

    const request: QuizAnswerRequest = {
      questionId: q.quesId,
      option: option,
      checked: isChecked,
      quizId: this.qid
    };

    this.quiz_progress.updateAnswer(request).subscribe({
      next: (response) => {
        if (response.selectedOptions && Array.isArray(response.selectedOptions)) {
          console.log("Server returned:", response.selectedOptions);
          console.log("Local state:", currentAnswers);
        }
      },
      error: (error) => {
        console.error("❌ Error saving answer:", error);
        q.givenAnswer = currentAnswers;
      }
    });

    return q.givenAnswer;
  }

  loadSavedAnswers(): void {
    this.quiz_progress.getAnswersByQuiz(this.qid).subscribe({
      next: (response: UserQuizAnswersResponse) => {
        console.log("📥 Loaded saved answers:", response);

        this.questions.forEach((q: any) => {
          if (response.answers && response.answers[q.quesId]) {
            q.givenAnswer = response.answers[q.quesId];
          } else {
            q.givenAnswer = [];
          }
        });

        console.log("✅ Questions with answers:", this.questions);
      },
      error: (error) => {
        console.error("❌ Error loading saved answers:", error);
        this.questions.forEach((q: any) => {
          q.givenAnswer = [];
        });
      }
    });
  }

  saveAnswers(): void {
    const answersToSave = this.currentQuestions.map((q: any) => ({
      quesNo: q.quesNo,
      givenAnswer: q.givenAnswer || ''
    }));
    this.quiz_progress.saveAnswers(this.qid, answersToSave).subscribe({
      next: (response) => {
        console.log('Answers saved to backend successfully');
      },
      error: (error) => {
        console.error('Error saving answers:', error);
      }
    });
  }

  loadAnswers(): void {
    this.quiz_progress.loadAnswers(this.qid).subscribe({
      next: (savedAnswers) => {
        this.currentQuestions.forEach((q: any) => {
          const saved = savedAnswers.find((s: any) => s.quesNo === q.quesNo);
          if (saved) {
            q.givenAnswer = saved.givenAnswer;
          }
        });
      },
      error: (error) => {
        console.error('Error loading answers:', error);
      }
    });
  }

  // ============================================================================
  // PAGINATION
  // ============================================================================

  onTableDataChange(event: any): void {
    this.page = event;
  }

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
  }

  // ============================================================================
  // JSON CONVERSION FOR API
  // ============================================================================

  convertJson(): any {
    this.convertedJsonAPIResponsebody = {
      contents: [
        {
          parts: this.selectedQuestionsAnswer.map(item => {
            console.log("These are the items ", item);
            const quizId = this.qid;
            console.log("This is teh quiz ID ", quizId)
            const quesId = item.quesId;
            console.log("This  is the Questions Id ", quesId);
            const questionNo = item.quesNo;
            const question = item.question;
            const answer = item.givenAnswer ? item.givenAnswer : '';
            const marks = item.marks ? item.marks.split(' ')[0] : '';
            let criteria = 'Evaluate based on clarity, completeness, and accuracy';
            const text = `quizId ${quizId}: tqid ${quesId}: Question Number ${questionNo}: ${question}. Answer: ${answer}. Marks: ${marks} Criteria:${criteria}.`;
            return { text: text };
          })
        }
      ]
    };

    console.log(this.convertedJsonAPIResponsebody);
    return this.convertedJsonAPIResponsebody;
  }
































































  private saveViolationDelay(): void {
    const delayTime = this.protectionState?.totalDelayTimeServed ?? 0;
    this.quiz_progress.saveViolatioDelay(this.qid, delayTime).subscribe({
      next: (response) => {
        console.log('Violation delay saved successfully:', response);
      },
      error: (error) => {
        console.error('Failed to save violation delay:', error);
      }
    });
  }

  private getViolatioDelay(): void {
    this.quiz_progress.getViolatioDelay(this.qid).subscribe({
      next: (response) => {
        console.log('Timer saved successfully:', response);
      },
      error: (error) => {
        console.error('Failed to save timer:', error);
      }
    });
  }


  private autoSaveViolationDelaySubscription: Subscription;

  private startAutoSaveviolationDelay(): void {
    if (this.autoSaveViolationDelaySubscription) {
      this.autoSaveViolationDelaySubscription.unsubscribe();
    }
    this.autoSaveViolationDelaySubscription = interval(10000).subscribe(() => {
      const delayTime = this.quizProtection.getTotalDelayServed();
      if (delayTime > 0) {
        this.quiz_progress.saveViolatioDelay(this.qid, delayTime).subscribe({
          next: () => console.log('[AutoSave] Violation delay saved:', delayTime),
          error: (err) => console.error('[AutoSave] Failed to save:', err)
        });
      }
    });
  }
}











