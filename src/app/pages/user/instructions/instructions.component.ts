import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';
import { QuestionService } from 'src/app/services/question.service';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


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














startQuiz(): void {
    if (!this.quiz) return;

    Swal.fire({
      title: "Enter Quiz Password",
      input: 'text',
      inputPlaceholder: 'Enter password to start quiz',
      inputAttributes: {
        autocapitalize: 'off',
        autocomplete: 'off'
      },
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonText: '🚀 Start Quiz',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33'
    }).then((result) => {
      // User clicked cancel
      if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelled",
          text: "Quiz was not started",
          icon: 'info',
          timer: 1500,
          showConfirmButton: false
        });
        return;
      }

      // Check password
      if (result.value === this.quiz.quizpassword) {
        // ✅ PASSWORD CORRECT - Open new browser window
        Swal.fire({
          title: 'Access Granted!',
          // text: 'Opening quiz in new window...',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false,
          timerProgressBar: true
        }).then(() => {
          this.openQuizInNewWindow();
        });
      } 
      else if (result.value) {
        // ❌ WRONG PASSWORD
        Swal.fire({
          title: "Incorrect Password",
          text: 'Please check your password and try again',
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }




















  // startQuiz(): void {
  //   if (!this.quiz) return;

  //   Swal.fire({
  //     title: "Enter Quiz Password",
  //     input: 'text',
  //     showCancelButton: true,
  //      allowOutsideClick: false,   // ⛔ Clicking outside won't close
  //   allowEscapeKey: false       // ⛔ ESC won't close
  //   }).then((result) => {

  //     // Cancel button clicked
  //   if (result.dismiss === Swal.DismissReason.cancel) {
  //     Swal.fire("Cancelled", '', 'info');
  //     return;
  //   }
  //     if (result.value === this.quiz.quizpassword) {

  //        // Open mini browser with quiz content
  //         this.openMiniBrowser(`/start/${this.qid}`);

  //       // this._router.navigate(['./start/' + this.qid]);
  //     } else if (result.value) {
  //       Swal.fire("Incorrect Password", '', 'info');
  //     } else if (result.isDismissed) {
  //       Swal.fire("Cancelled", '', 'info');
  //     }
  //   });
  // }

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

//   closeBrowser(): void {
//   this.showBrowser = false;
// }



//   openQuizInBrowser(): void {
//   // Create the URL to your start component
//   const quizUrl = `/start/${this.qid}`;
  
//   // Sanitize URL for iframe
//   this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(quizUrl);
  
//   // Show browser
//   this.showBrowser = true;
  
//   // Prevent background scrolling
//   document.body.style.overflow = 'hidden';
// }

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



 openQuizInNewWindow(): void {
    // Build the quiz URL
    const quizUrl = `/start/${this.qid}`;
    const fullUrl = window.location.origin + quizUrl;
    
    // Window features - removes toolbar, location bar, etc.
    const windowFeatures = [
      'toolbar=no',           // No back/forward buttons
      'location=no',          // No address bar
      'menubar=no',           // No menu bar
      'scrollbars=yes',       // Allow scrolling
      'resizable=yes',        // Allow resizing
      'width=' + screen.width,      // Full screen width
      'height=' + screen.height,    // Full screen height
      'top=0',                // Position at top
      'left=0',               // Position at left
      'fullscreen=yes'        // Request fullscreen mode

    ].join(',');
    
    // Open new window
    this.quizWindow = window.open(fullUrl, 'QuizWindow', windowFeatures);
    
    // Check if popup was blocked
    if (!this.quizWindow || this.quizWindow.closed || typeof this.quizWindow.closed === 'undefined') {
      Swal.fire({
        title: 'Popup Blocked!',
        html: `
          <p>Please allow popups for this site to start the quiz.</p>
          <p><small>Look for the popup blocker icon in your browser's address bar.</small></p>
        `,
        icon: 'warning',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#667eea'
      }).then((result) => {
        if (result.isConfirmed) {
          this.openQuizInNewWindow();
        }
      });
      return;
    }

    // Focus the new window
    if (this.quizWindow) {
      this.quizWindow.focus();

    
      // Optional: Monitor when window is closed
      const checkWindowClosed = setInterval(() => {
        if (this.quizWindow && this.quizWindow.closed) {
          clearInterval(checkWindowClosed);

          console.log('Quiz window was closed');
          
          // Optional: Show a message when quiz window closes
          Swal.fire({
            title: 'Quiz Window Closed',
            text: 'The quiz window has been closed',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }, 1000);
    }
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