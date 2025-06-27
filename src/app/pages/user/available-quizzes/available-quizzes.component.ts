import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import { RegCoursesService } from 'src/app/services/reg-courses.service';
import { ReportServiceService } from 'src/app/services/report-service.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-available-quizzes',
  templateUrl: './available-quizzes.component.html',
  styleUrls: ['./available-quizzes.component.css']
})
export class AvailableQuizzesComponent implements OnInit {
  // Dialog control
  productDialog: boolean = false;
  
  // Data variables
  availablequizzes: any[] = [];
  userRecords: any[] = [];
  categories: any;
  reportData: any[] = [];
  
  // ID variables
  pqId: number;
  qId: any;
  u_id: number;

  // Loading states
  isLoadingUserRecords: boolean = true;
  isLoadingCategories: boolean = true;
  isLoadingQuizzes: boolean = false;
  isLoadingReportData: boolean = false;

  constructor(
    private _couseReg: RegCoursesService,
    private _snack: MatSnackBar,
    private _quiz: QuizService,
    private _route: ActivatedRoute,
    private _report: ReportServiceService,
    private login: LoginService
  ) {}

  ngOnInit(): void {
    this.loadRegisteredCourses();
  }

  private loadRegisteredCourses(): void {
    this.isLoadingCategories = true;
    this._couseReg.getRegCourses().subscribe({
      next: (data: any) => {
        this.categories = data;
        this.userRecords = this.checkUserId();
        this.isLoadingCategories = false;
        this.isLoadingUserRecords = false;
      },
      error: (error) => {
        this._snack.open("Your session has expired", "", {
          duration: 3000
        });
        this.login.logout();
        this.isLoadingCategories = false;
        this.isLoadingUserRecords = false;
      }
    });
  }

  checkUserId(): any[] {
    const userDetails = localStorage.getItem('user');
    if (!userDetails) return [];
    
    const user = JSON.parse(userDetails);
    this.u_id = user.id;
    return this.categories.filter(item => item.user.id === this.u_id);
  }

  onQuizOptionSelected(): void {
    if (!this.categories?.cid) return;
    
    this.isLoadingQuizzes = true;
    this._quiz.getActieQuizzesOfCategory(this.categories.cid).subscribe({
      next: (quiz: any) => {
        this.availablequizzes = quiz;
        this.isLoadingQuizzes = false;
      },
      error: (error) => {
        this.isLoadingQuizzes = false;
        this._snack.open("Error loading quizzes", "", {
          duration: 3000
        });
      }
    });
  }

  hideDialog(): void {
    this.productDialog = false;
    this.qId = null;
  }

  openNew(id: number): void {
    this.productDialog = true;
    this.pqId = id;
    this.loadReport();
  }

  loadReport(): void {
    const userDetails = localStorage.getItem('user');
    if (!userDetails || !this.pqId) return;
    
    this.isLoadingReportData = true;
    const user = JSON.parse(userDetails);
    
    this._report.getReport(user.id, this.pqId).subscribe({
      next: (report: any) => {
        this.reportData = report;
        this.isLoadingReportData = false;
      },
      error: (error) => {
        this.isLoadingReportData = false;
        this._snack.open("Error loading report", "", {
          duration: 3000
        });
      }
    });
  }
}