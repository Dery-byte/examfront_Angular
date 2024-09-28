import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { PrintQuizComponent } from '../print-quiz/print-quiz.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
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

  productDialog: boolean;
  userRecords: any[];
  public availablequizzes: any = [];
  catId;
  qId
  pqId
  quizzes;
  currentQID
  reportData;
  categories;
  RegCourse
  u_id
  disabledButtons: { [key: number]: boolean } = {};  // Track the disabled state by unique ID
  reports


  // AiAnsweredQuestions: any=[];
  // reportData;
  // pqId
  // qId;





  constructor(private _route: ActivatedRoute,
    private _quiz: QuizService,
    public dialog: MatDialog,
    private router: Router,
    private _report: ReportServiceService,
    private _couseReg: RegCoursesService,

    private login: LoginService,
    private snack: MatSnackBar,
    // private print_quiz:PrintQuizComponent,
  ) { }




  ngOnInit(): void {

    const userDetails = localStorage.getItem('user');
    const Object = JSON.parse(userDetails);
    this.u_id = Object.id;

    this._report.getReportsByUserID(this.u_id).subscribe((data)=>{

      this.reports=data;
      console.log(data);
    })

    this.getButtonState();



    // this.getAIAnsweredQuestions();
    // this.loadReport();
    // this.qId = this.router.navigate(['qid']);
    // this.qId = this._route.paramMap['qId']
    this.qId = this._route.snapshot.params['qid'];
    console.log(this.qId)
    this._route.params.subscribe((params) => {
      this.catId = params['catId'];
      console.log(this.catId);
      if (this.catId == 0) {
        this._quiz.actieQuizzes().subscribe((data: any) => {
          this.quizzes = data;
        },
          (error) => {

            this.snack.open("You're Session has expired! ", "", {
              duration: 3000,
            });
            this.login.logout();
            // alert("Failed to load quizzes");
          }
        );
      }
      else {
        // console.log("Load specific questions");
        this._quiz.getActieQuizzesOfCategory(this.catId).subscribe((data: any) => {
          this.quizzes = data;
          console.log(data);
        },
          (error) => {
            alert("Server error");
          });
      }
    });
    // console.log("Load all quizzes");






    this.qId = this._route.paramMap['qId']
    console.log(this.qId)
    this._couseReg.getRegCourses().subscribe((data: any) => {
      this.categories = data;
      // this.userRecords = this.checkUserId();

    },
      (error) => {
        this.snack.open("You'er Session has expired", "", {
          duration: 3000
        });
        this.login
      });
  }


  // getAIAnsweredQuestions(){
  //   const theory = localStorage.getItem('answeredQuestions');
  //   this.AiAnsweredQuestions = JSON.parse(theory);
  //   console.log(this.AiAnsweredQuestions);
  // }

  checkUserId(): any[] {
    // Filter the records associated with user id 6
    const userDetails = localStorage.getItem('user');
    const Object = JSON.parse(userDetails);
    this.u_id = Object.id;
    return this.categories.filter(item => item.user.id === this.u_id);
    // return this.RegCourse.filter(item => item.user.id === 6);

  }

// ================================================================
  onQuizOptionSelected() {
    this._quiz.getActieQuizzesOfCategory(this.categories.cid).subscribe((quiz: any) => {
      this.availablequizzes = quiz;
      console.log(this.availablequizzes);
    })
  }





  hideDialog() {
    this.productDialog = false;
    this.qId = null;
  }
  openNew(id: number) {
    this.productDialog = true;
    this.pqId = id;
    console.log(id)
    this.loadReport();
    this.pqId = null;
  }


  getButtonState() {
    const storedDisabledButtons = localStorage.getItem('disabledButtons');
    if (storedDisabledButtons) {
      this.disabledButtons = JSON.parse(storedDisabledButtons);
    }
  }



  onPrintClick(event: MouseEvent, qId: number) {
    console.log(`Button clicked with ID: ${qId}`);
    console.log(`Button disabled state before click: ${this.disabledButtons[qId]}`);

    if (this.disabledButtons[qId]) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.disabledButtons[qId] = true;
    console.log(`Button disabled state after click: ${this.disabledButtons[qId]}`);
    // Save the updated state to localStorage
    localStorage.setItem('disabledButtons', JSON.stringify(this.disabledButtons));
    this.router.navigate(['/print_quiz/', qId]);
  }


  loadReport() {
    const userDetails = localStorage.getItem('user');
    const Object = JSON.parse(userDetails);
    this._report.getReport(Object.id, this.pqId).subscribe((report) => {
      this.reportData = report;
      console.log(this.reportData);
      console.log(this.reportData[0].marksB)
      console.log(this.reportData[0].marks);
      console.log(this.reportData[0].progress);
      console.log(this.reportData[0].quiz.title);
      console.log(this.reportData[0].user.lastname);



      console.log(report);
    });
  }





  hola() {
    // this.print_quiz.printQuiz();
  }
}


