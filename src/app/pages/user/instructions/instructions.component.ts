import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';
import { QuestionService } from 'src/app/services/question.service';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private _snack: MatSnackBar
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

  startQuiz(): void {
    if (!this.quiz) return;

    Swal.fire({
      title: "Enter Quiz Password",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
      if (result.value === this.quiz.quizpassword) {
        this._router.navigate(['./start/' + this.qid]);
      } else if (result.value) {
        Swal.fire("Incorrect Password", '', 'info');
      } else if (result.isDismissed) {
        Swal.fire("Cancelled", '', 'info');
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
}