import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';
import { QuestionService } from 'src/app/services/question.service';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { injectSwalStyles } from '../../utilities/swal-styles';


@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {
  // Quiz data
  qid: string;
  quiz: any;
  isLegible: boolean = false;
  
  // Timing data
  timeT: number;
  timerAll: number;
  timeO: number;
  numberOfQuestionsToAnswer: number;
  
  // User data
  user: any;
  userId: number;
  
  // Report data
  report: any[] = [];
  reportData: any;
  
  // Loading states
  isLoading: boolean = true;
  isLoadingQuiz: boolean = true;
  isLoadingQuestions: boolean = true;
  isLoadingReport: boolean = true;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _quiz: QuizService,
    private _questions: QuestionService,
    private login: LoginService,
    private _snack: MatSnackBar,
    private sanitizer: DomSanitizer,

  ) { }

  ngOnInit(): void {
    this.qid = this._route.snapshot.params['qid'];
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    // Load quiz data
    this.loadQuizData();
    
    // Load questions data
    this.loadQuestionsData();
    
    // Load report data
    this.loadReportData();
  }

  private loadQuizData(): void {
    this.isLoadingQuiz = true;
    this._quiz.getQuiz(this.qid).subscribe({
      next: (data: any) => {
        this.quiz = data;
        this.timeO = this.quiz.quizTime * 1;
        this.timerAll = this.quiz.quizTime * 1 * 60;
        this.isLoadingQuiz = false;
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.handleError("Error loading quiz data");
        this.isLoadingQuiz = false;
        this.checkLoadingComplete();
      }
    });
  }

  private loadQuestionsData(): void {
    this.isLoadingQuestions = true;
    this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe({
      next: (data: any) => {
        this.numberOfQuestionsToAnswer = data[0]?.totalQuestToAnswer || 0;
        this.timeT = data[0]?.timeAllowed || 0;
        this.timerAll = (this.timeT + this.timeO) * 60;
        this.isLoadingQuestions = false;
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.isLoadingQuestions = false;
        this.checkLoadingComplete();
      }
    });
  }

  private loadReportData(): void {
    this.isLoadingReport = true;
    this._questions.getReport().subscribe({
      next: (data:any) => {
        this.report = data;
        this.checkUserEligibility();
        this.isLoadingReport = false;
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.isLoadingReport = false;
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    if (!this.isLoadingQuiz && !this.isLoadingQuestions && !this.isLoadingReport) {
      this.isLoading = false;
    }
  }

  private checkUserEligibility(): void {
    const userDetails = localStorage.getItem('user');
    if (!userDetails) {
      this.handleError("User not logged in");
      return;
    }

    const currentUser = JSON.parse(userDetails);
    const currentUserId = currentUser.id;
    const currentQuizId = parseInt(this.qid);

    this.isLegible = this.report.some(entry => 
      entry.user.id === currentUserId && entry.quiz.qId === currentQuizId
    );
  }

  private handleError(message: string): void {
    this._snack.open(message || "An error occurred", "", {
      duration: 3000,
    });
    this.login.logout();
  }


  allowOutsideClick: false
allowEscapeKey: false
// Import at the top of your component file:
// import { injectSwalStyles } from './swal-styles';

startQuiz(): void {
  if (!this.quiz) return;
  injectSwalStyles();

  // ── 1. PASSWORD ENTRY ─────────────────────────────────────────────────────
  Swal.fire({
    html: `
      <div class="qpw-body">
        <div class="qpw-icon-box accent">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        </div>
        <div class="qpw-badge accent"><span class="qpw-dot"></span>SECURE ACCESS</div>
        <h2 class="qpw-title">Quiz Password</h2>
        <p class="qpw-sub">Enter the password provided by your instructor to unlock this quiz.</p>
        <div class="qpw-field">
          <input id="qpw-input" type="password" placeholder="Enter password"
                 autocomplete="off" autocapitalize="off" spellcheck="false" class="qpw-input"/>
          <button class="qpw-eye" type="button" onclick="
            var i=document.getElementById('qpw-input');
            i.type=i.type==='password'?'text':'password';
            this.innerHTML=i.type==='password'
              ?'<svg width=&quot;14&quot; height=&quot;14&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot;><path d=&quot;M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z&quot;/><circle cx=&quot;12&quot; cy=&quot;12&quot; r=&quot;3&quot;/></svg>'
              :'<svg width=&quot;14&quot; height=&quot;14&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot;><path d=&quot;M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24&quot;/><line x1=&quot;1&quot; y1=&quot;1&quot; x2=&quot;23&quot; y2=&quot;23&quot;/></svg>';
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <div class="qpw-warn">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          This session will be monitored.
        </div>
      </div>
    `,
    title: "",
    showCancelButton: true,
    confirmButtonText: 'Start Quiz',
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: false,
    buttonsStyling: false,
    customClass: {
      popup:         'qpw-popup',
      confirmButton: 'qpw-btn-confirm',
      cancelButton:  'qpw-btn-cancel',
    },
    preConfirm: () => {
      const val = (document.getElementById('qpw-input') as HTMLInputElement)?.value?.trim();
      if (!val) {
        Swal.showValidationMessage('Password cannot be empty');
        return false;
      }
      return val;
    },
  }).then((result) => {

    // ── CANCELLED ─────────────────────────────────────────────────────────────
    if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        html: `
          <div class="qpw-body" style="padding-bottom:4px">
            <div class="qpw-icon-box neutral">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <div class="qpw-badge neutral"><span class="qpw-dot"></span>SESSION ENDED</div>
            <h2 class="qpw-title" style="font-size:19px">Quiz Cancelled</h2>
            <p class="qpw-sub" style="margin-bottom:8px">
              No quiz was started. You can try again whenever you're ready.
            </p>
          </div>
        `,
        title: "",
        timer: 1800,
        showConfirmButton: false,
        timerProgressBar: true,
        buttonsStyling: false,
        customClass: { popup: 'qpw-popup state-cancel' },
      });
      return;
    }

    // ── CORRECT PASSWORD ───────────────────────────────────────────────────────
    if (result.value === this.quiz.quizpassword) {
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
            <div class="qpw-badge success"><span class="qpw-dot"></span>VERIFIED</div>
            <h2 class="qpw-title">Access Granted</h2>
            <p class="qpw-sub" style="margin-bottom:8px">
              Identity confirmed. Opening your quiz now — good luck!
            </p>
          </div>
        `,
        title: "",
        timer: 1400,
        showConfirmButton: false,
        timerProgressBar: true,
        buttonsStyling: false,
        customClass: { popup: 'qpw-popup state-success' },
      }).then(() => {
        this.openQuizInNewWindow();
      });
    }

    // ── WRONG PASSWORD ─────────────────────────────────────────────────────────
    else if (result.value) {
      Swal.fire({
        html: `
          <div class="qpw-body">
            <div class="qpw-icon-box error">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="qpw-badge error"><span class="qpw-dot"></span>ACCESS DENIED</div>
            <h2 class="qpw-title">Wrong Password</h2>
            <p class="qpw-sub" style="margin-bottom:8px">
              That password doesn't match. Please check with your instructor and try again.
            </p>
          </div>
        `,
        title: "",
        confirmButtonText: 'Try Again',
        buttonsStyling: false,
        customClass: {
          popup:         'qpw-popup state-error',
          confirmButton: 'qpw-btn-confirm',
        },
      }).then(() => {
        this.startQuiz();
      });
    }

  });
}





  getFormmatedTime(): string {
    if (!this.timerAll) return '';

    const hr = Math.floor(this.timerAll / 3600);
    const mm = Math.floor((this.timerAll % 3600) / 60);
    
    let formattedTime = '';
    if (hr > 0) {
      formattedTime += `${hr} hr(s) : `;
    }
    formattedTime += `${mm} min(s)`;
    return formattedTime;
  }








 
  
  showBrowser: boolean = false;
  currentUrl: string = '';
  safeUrl: SafeResourceUrl | null = null;

  // IMPLEMENTING THE MINI BROWSER

  openMiniBrowser(url: string): void {
    // You can pass either a relative route or full URL
    this.currentUrl = url;
    
    // If it's a relative route, construct the full URL
    if (url.startsWith('/')) {
      this.currentUrl = window.location.origin + url;
    }
    
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.currentUrl);
    this.showBrowser = true;
  }

  







   closeBrowser(): void {
    this.showBrowser = false;
      document.body.style.overflow = 'auto';
    // Optionally show a confirmation dialog
    Swal.fire({
      title: 'Close Quiz?',
      text: 'Are you sure you want to close the quiz browser?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, close it',
      cancelButtonText: 'No, continue'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showBrowser = false;
      } else {
        this.showBrowser = true;
      }
    });
  }


confirmCloseBrowser(): void {
  Swal.fire({
    title: 'Exit Quiz?',
    html: '<p>Are you sure you want to exit the quiz?</p><p style="color: red; font-weight: bold;">⚠️ Your progress may be lost!</p>',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Exit Quiz',
    cancelButtonText: 'No, Continue',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#667eea',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      this.closeBrowser();
      Swal.fire({
        title: 'Quiz Exited',
        text: 'You have exited the quiz',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}

 // Browser window reference
  private quizWindow: Window | null = null;



//  openQuizInNewWindow(): void {
//     // Build the quiz URL
//     const quizUrl = `/start/${this.qid}`;
//     const fullUrl = window.location.origin + quizUrl;
    
//     // Window features - removes toolbar, location bar, etc.
//     const windowFeatures = [
//       'toolbar=no',           // No back/forward buttons
//       'location=no',          // No address bar
//       'menubar=no',           // No menu bar
//       'scrollbars=yes',       // Allow scrolling
//       'resizable=yes',        // Allow resizing
//       'width=' + screen.width,      // Full screen width
//       'height=' + screen.height,    // Full screen height
//       'top=0',                // Position at top
//       'left=0',               // Position at left
//       'fullscreen=yes'        // Request fullscreen mode

//     ].join(',');
    
//     // Open new window
//     this.quizWindow = window.open(fullUrl, 'QuizWindow', windowFeatures);
    
//     // Check if popup was blocked
//     if (!this.quizWindow || this.quizWindow.closed || typeof this.quizWindow.closed === 'undefined') {
//       Swal.fire({
//         title: 'Popup Blocked!',
//         html: `
//           <p>Please allow popups for this site to start the quiz.</p>
//           <p><small>Look for the popup blocker icon in your browser's address bar.</small></p>
//         `,
//         icon: 'warning',
//         confirmButtonText: 'Try Again',
//         confirmButtonColor: '#667eea'
//       }).then((result) => {
//         if (result.isConfirmed) {
//           this.openQuizInNewWindow();
//         }
//       });
//       return;
//     }

//     // Focus the new window
//     if (this.quizWindow) {
//       this.quizWindow.focus();

    
//       // Optional: Monitor when window is closed
//       const checkWindowClosed = setInterval(() => {
//          window.close();

//             if (window.opener) {
//               window.opener.location.href = '/user-dashboard/0';
//             }
//       }, 1000);
//     }
//   }


// import { injectSwalStyles } from './swal-styles';

openQuizInNewWindow(): void {
  const quizUrl  = `/start/${this.qid}`;
  const fullUrl  = window.location.origin + quizUrl;

  const windowFeatures = [
    'toolbar=no', 'location=no', 'menubar=no',
    'scrollbars=yes', 'resizable=yes',
    'width='  + screen.width,
    'height=' + screen.height,
    'top=0', 'left=0', 'fullscreen=yes',
  ].join(',');

  this.quizWindow = window.open(fullUrl, 'QuizWindow', windowFeatures);

  // ── POPUP BLOCKED ─────────────────────────────────────────────────────────
  if (!this.quizWindow || this.quizWindow.closed || typeof this.quizWindow.closed === 'undefined') {
    injectSwalStyles();

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
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
          </div>

          <!-- Badge -->
          <div class="qpw-badge" style="
            background:rgba(251,191,36,.07);
            border:1px solid rgba(251,191,36,.2);
            color:rgba(251,191,36,.85);
          ">
            <span class="qpw-dot" style="background:rgba(251,191,36,.85)"></span>
            POPUP BLOCKED
          </div>

          <h2 class="qpw-title">Allow Popups</h2>
          <p class="qpw-sub">
            Your browser blocked the quiz window from opening.
            You need to allow popups for this site to start the quiz.
          </p>

          <!-- Step-by-step instructions -->
          <div style="
            width:100%; background:#141414; border:1px solid #262626;
            border-radius:11px; padding:14px 16px;
            text-align:left; box-sizing:border-box; margin-bottom:12px;
          ">
            <div style="
              font-family:'Geist Mono',monospace; font-size:8.5px; font-weight:600;
              letter-spacing:.12em; text-transform:uppercase;
              color:rgba(255,255,255,.25); margin-bottom:10px;
            ">HOW TO ENABLE</div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${[
                'Look for the <strong style="color:rgba(255,255,255,.6)">blocked popup icon</strong> in your address bar (top right)',
                'Click it and select <strong style="color:rgba(255,255,255,.6)">Always allow popups</strong> from this site',
                'Click <strong style="color:rgba(255,255,255,.6)">Allow </strong> below to reopen the quiz',
              ].map((step, i) => `
                <div style="display:flex; align-items:flex-start; gap:10px;">
                  <span style="
                    width:20px; height:20px; border-radius:6px; flex-shrink:0; margin-top:1px;
                    background:rgba(251,191,36,.08); border:1px solid rgba(251,191,36,.2);
                    display:flex; align-items:center; justify-content:center;
                    font-family:'Geist Mono',monospace; font-size:10px; font-weight:700;
                    color:rgba(251,191,36,.75);
                  ">${i + 1}</span>
                  <span style="
                    font-family:'Sora',sans-serif; font-size:12px; font-weight:300;
                    color:rgba(255,255,255,.45); line-height:1.5;
                  ">${step}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Info strip -->
          <div class="qpw-warn" style="
            background:rgba(251,191,36,.04);
            border-color:rgba(251,191,36,.15);
            color:rgba(251,191,36,.5);
          ">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:1px">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            The quiz runs in a separate secure window to enable proctoring features.
          </div>

        </div>
      `,
      title: "",
      confirmButtonText: 'Allow',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      buttonsStyling: false,
      customClass: {
        popup:         'qpw-popup',
        confirmButton: 'qpw-btn-confirm',
        cancelButton:  'qpw-btn-cancel',
      },
      didOpen: () => {
        // Amber timer bar
        const bar = document.querySelector('.qpw-popup .swal2-timer-progress-bar') as HTMLElement;
        if (bar) bar.style.background = 'rgba(251,191,36,.5)';
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.openQuizInNewWindow();
      }
    });

    return;
  }

  // ── WINDOW OPENED SUCCESSFULLY ────────────────────────────────────────────
  this.quizWindow.focus();

  const checkWindowClosed = setInterval(() => {
    window.close();
    if (window.opener) {
      window.opener.location.href = '/user-dashboard/0';
    }
  }, 1000);
}
  // Optional: Method to close the quiz window programmatically
  closeQuizWindow(): void {
    if (this.quizWindow && !this.quizWindow.closed) {
      this.quizWindow.close();
      this.quizWindow = null;
    }
  }

  // Clean up when component is destroyed
  ngOnDestroy(): void {
    this.closeQuizWindow();
  }


}