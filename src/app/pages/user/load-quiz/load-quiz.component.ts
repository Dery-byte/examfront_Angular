import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { PrintQuizComponent } from '../print-quiz/print-quiz.component';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { ResultSummaryComponent } from '../../result-summary/result-summary.component';
import { ReportServiceService } from 'src/app/services/report-service.service';

@Component({
  selector: 'app-load-quiz',
  templateUrl: './load-quiz.component.html',
  styleUrls: ['./load-quiz.component.css']
})
export class LoadQuizComponent  implements OnInit {

  productDialog: boolean;


  catId;
  qId
  quizzes;
  currentQID

  reportData;
  constructor( private _route:ActivatedRoute, private _quiz:QuizService,public dialog: MatDialog, private router:Router, private _report:ReportServiceService
    // private print_quiz:PrintQuizComponent,
    ){}



    OpenSummary(id:number){
      this.dialog.open(ResultSummaryComponent,{
        width:'40%',
        // height:'450px'
      })
      this.currentQID=id;
    }

    iSresultsSummary=false;
  ngOnInit(): void {
    // this.loadReport();
    // this.qId = this.router.navigate(['qid']);
    // this.qId = this._route.paramMap['qId']
    this.qId = this._route.snapshot.params['qid'];

    console.log(this.qId)
   this._route.params.subscribe((params)=>{
    this.catId =params['catId'];
    console.log(this.catId);
    if(this.catId==0){
      this._quiz.actieQuizzes().subscribe((data:any)=>{
        this.quizzes=data;
      }, 
      (error)=>{
        alert("Failed to load quizzes");
      }
      );
    }
    else{
// console.log("Load specific questions");
this._quiz.getActieQuizzesOfCategory(this.catId).subscribe((data:any)=>{
  this.quizzes=data;
  console.log(data);
},
(error)=>{
  alert("Server error");
});
    }
  });
    // console.log("Load all quizzes");
  }

  hideDialog() {
    this.productDialog = false;
}
openNew() {
    this.productDialog  = true;
}


loadReport(){
  const userDetails = localStorage.getItem('user');
  const Object = JSON.parse(userDetails);
this._report.getReport(Object.id,this.qId).subscribe((report)=>{
  this.reportData = report;
console.log(this.reportData);
console.log(report);
});
}


  hola(){
    // this.print_quiz.printQuiz();
  }
}


