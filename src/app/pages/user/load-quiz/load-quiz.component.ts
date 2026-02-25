import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import { MatDialog } from '@angular/material/dialog';
import { ReportServiceService } from 'src/app/services/report-service.service';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegCoursesService } from 'src/app/services/reg-courses.service';

@Component({
  selector: 'app-load-quiz',
  templateUrl: './load-quiz.component.html',
  styleUrls: ['./load-quiz.component.css']
})
export class LoadQuizComponent implements OnInit {
  // Dialog control
  productDialog: boolean = false;

  // Data variables
  userRecords: any[] = [];
  availablequizzes: any[] = [];
  quizzes: any[] = [];
  reports: any[] = [];
  reportData: any;

//   categories = {
//   cid: null
// };
selectedCategoryId: number | null = null;

  categories: any;

  // ID variables
  catId: any;
  qId: any;
  pqId: any;
  currentQID: any;
  u_id: any;

  // State management
  disabledButtons: { [key: number]: boolean } = {};
  isPrintDisabled: boolean = false;

  // Loading states
  isLoadingCourses: boolean = true;
  isLoadingQuizzes: boolean = false;
  isLoadingReports: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _quiz: QuizService,
    public dialog: MatDialog,
    private router: Router,
    private _report: ReportServiceService,
    private _couseReg: RegCoursesService,
    private login: LoginService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
    this.loadQuizzesBasedOnRoute();
    this.loadRegisteredCourses();
  }



  /**
 * Count quizzes with CLOSED status from the reports array.
 * Used by stats strip and selector footer.
 */
getClosedCount(): number {
  if (!this.reports || this.reports.length === 0) return 0;
  return this.reports.filter((r: any) => r.status === 'CLOSED').length;
}

/**
 * Average score across completed quizzes (0–100%).
 * Returns '—' if nothing is completed yet.
 */
getAvgScore(): string {
  if (!this.reportData || this.reportData.length === 0) return '—';
  const completed = this.reportData.filter((r: any) => r.progress === 'Completed');
  if (completed.length === 0) return '—';
  const avg = completed.reduce((sum: number, r: any) => {
    const got = this.getTotalMarks(r);
    const max = this.getTotalMaxMarks(r);
    return sum + (max > 0 ? (got / max) * 100 : 0);
  }, 0) / completed.length;
  return Math.round(avg) + '%';
}

/**
 * Close dialog when clicking the backdrop (not the box).
 * Bind to (click) on .dlg-backdrop in the template.
 */
handleDlgBackdrop(event: MouseEvent): void {
  const backdrop = event.currentTarget as HTMLElement;
  const box = backdrop.querySelector('.dlg-box') as HTMLElement;
  if (box && !box.contains(event.target as Node)) {
    this.productDialog = false;
  }
}

  // private loadInitialData(): void {
  //   this.isLoadingCourses=true;
  //   const userDetails = localStorage.getItem('user');
  //   if (userDetails) {
  //     const userObject = JSON.parse(userDetails);
  //     this.u_id = userObject.id;

  //     this.isLoadingReports = true;
  //     this._report.getReportsByUserID(this.u_id).subscribe({
  //       next: (data:any) => {
  //         this.reports = data;
  //         this.isLoadingReports = false;
  //       },
  //       error: (error) => {
  //         console.error('Error loading reports:', error);
  //         this.isLoadingReports = false;
  //       }
  //     });
  //   }

  //   this.getButtonState();
  // }




  uniqueCategories;



  
  private loadInitialData(): void {
    this.isLoadingCourses = true;
    const userDetails = localStorage.getItem('user');
    if (userDetails) {
      const userObject = JSON.parse(userDetails);
      this.u_id = userObject.id;

      this.isLoadingReports = true;

      this._report.getReportsByUserID(this.u_id).subscribe({
        next: (data: any) => {
          this.reports = data;
          console.log("This is the report ", this.reports);
          console.log("This is the reportData ", this.reportData);
          // ✅ Extract unique categories based on cid
          this.uniqueCategories = [
            ...new Map(
              this.reports.map((item: any) => [
                item.quiz.category.cid,
                item.quiz.category
              ])
            ).values()
          ];

          this.isLoadingReports = false;
        },

        error: (error) => {
          console.error('Error loading reports:', error);
          this.isLoadingReports = false;
        }
      });
    }

    this.getButtonState();
  }



  private loadQuizzesBasedOnRoute(): void {
    this._route.params.subscribe((params) => {
      this.catId = params['catId'];

      if (this.catId == 0) {
        this._quiz.actieQuizzes().subscribe({
          next: (data: any) => {
            this.quizzes = data;
          },
          error: (error) => {
            this.snack.open("Your session has expired!", "", {
              duration: 3000,
            });
            this.login.logout();
          }
        });
      } else {
        this._quiz.getActieQuizzesOfCategory(this.catId).subscribe({
          next: (data: any) => {
            this.quizzes = data;
          },
          error: (error) => {
            this.snack.open("Error loading quizzes", "", {
              duration: 3000,
            });
          }
        });
      }
    });
  }

  private loadRegisteredCourses(): void {
    this.isLoadingCourses = true;
    this._couseReg.getRegCourses().subscribe({
      next: (data: any) => {
        this.categories = data;
        this.isLoadingCourses = false;
      },
      error: (error) => {
        this.snack.open("Your session has expired", "", {
          duration: 3000
        });
        this.login.logout();
        this.isLoadingCourses = false;
      }
    });
  }

  checkUserId(): any[] {
    const userDetails = localStorage.getItem('user');
    if (userDetails) {
      const userObject = JSON.parse(userDetails);
      this.u_id = userObject.id;
      return this.categories.filter((item: any) => item.user.id === this.u_id);
    }
    return [];
  }
















  // onQuizOptionSelected(): void {
  //   if (!this.categories?.cid) return;

  //   this.isLoadingQuizzes = true;
  //   // this._quiz.getActieQuizzesOfCategory(this.categories.cid).subscribe({
  //   this._quiz.getTakenQuizzesOfCategoryByUser(this.categories.cid).subscribe({
  //     next: (quiz: any) => {
  //       this.availablequizzes = quiz;
  //       this.isLoadingQuizzes = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading quizzes:', error);
  //       this.isLoadingQuizzes = false;
  //     }
  //   });
  // }



  onQuizOptionSelected(): void {
  if (!this.selectedCategoryId) return;

  this.isLoadingQuizzes = true;

  this._quiz
    .getTakenQuizzesOfCategoryByUser(this.selectedCategoryId)
    .subscribe({
      next: (quiz:any) => {
        this.availablequizzes = quiz;
        this.isLoadingQuizzes = false;
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
        this.isLoadingQuizzes = false;
      }
    });
}


  showObjectiveColumn(): boolean {
    // Show Objective column if ANY quiz has type OBJ or BOTH
    return this.reportData?.some(r => r.quiz.quizType === 'OBJ' || r.quiz.quizType === 'BOTH') || false;
  }
  showTheoryColumn(): boolean {
    // Show Theory column if ANY quiz has type THEORY or BOTH
    return this.reportData?.some(r => r.quiz.quizType === 'THEORY' || r.quiz.quizType === 'BOTH') || false;
  }


getTotalMarks(r: any): number {
  return (Number(r.marks) || 0) + (Number(r.marksB) || 0);
}

getTotalMaxMarks(r: any): number {
  return (Number(r.quiz?.maxMarks) || 0) + (Number(r.maxScoreSectionB) || 0);
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

  getButtonState(): void {
    const storedDisabledButtons = localStorage.getItem('disabledButtons');
    if (storedDisabledButtons) {
      this.disabledButtons = JSON.parse(storedDisabledButtons);
    }
  }

  onPrintClick(event: MouseEvent, qId: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/print_quiz/', qId]);
  }

  loadReport(): void {
    const userDetails = localStorage.getItem('user');
    if (!userDetails || !this.pqId) return;

    const userObject = JSON.parse(userDetails);
    this._report.getReport(userObject.id, this.pqId).subscribe({
      next: (report) => {
        this.reportData = report;
      },
      error: (error) => {
        console.error('Error loading report:', error);
      }
    });
  }
}