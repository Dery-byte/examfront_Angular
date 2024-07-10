import { Component,TemplateRef, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-quiz-questions',
  templateUrl: './view-quiz-questions.component.html',
  styleUrls: ['./view-quiz-questions.component.css']
})
export class ViewQuizQuestionsComponent  implements OnInit{

  qId;
 qTitle;
 questions=[];
 sectionB: any[] = [];

  constructor(private _route:ActivatedRoute, 
              private _question:QuestionService,
              private _snack:MatSnackBar,public dialog: MatDialog){  }

  ngOnInit(): void {
    this.qId =this._route.snapshot.params['qId'];
    this.qTitle =this._route.snapshot.params['qTitle'];
   this._question.getQuestionsOfQuiz(this.qId).subscribe((data:any)=>
   {
    console.log(data);
    this.questions=data;

   },
   (error)=>{
    console.log('error');
   }
   );

   this._question.getSubjective(this.qId).subscribe((theory:any)=>{
console.log(theory);
this.sectionB = theory;
   },
  (error)=>{
    console.log("Could not load data from server");
  });
  }

  dialogRef!: MatDialogRef<any>;



  getPrefixes(): string[] {
    const prefixes = new Set<string>();
    this.sectionB.forEach(question => {
      const prefix = question.quesNo.match(/^Q\d+/)?.[0];
      if (prefix) {
        prefixes.add(prefix);
      }
    });
    return Array.from(prefixes);
  }

  getGroupedQuestions(prefix: string) {
    return this.sectionB.filter(q => q.quesNo.startsWith(prefix));
  }


  openUpdateDialog(question:any, templateRef: TemplateRef<any>): void {
    this.dialogRef = this.dialog.open(templateRef, {
      width: '250px',
      data: { question: question.question }
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        question.question = result.question;
        // Handle the update logic here (e.g., make a request to the server)
      }
    });
  }







  //Delete question
  deleteQuestion(qId){
Swal.fire({
  icon:"info",
  showCancelButton:true,
  confirmButtonText:'Delete',
  title:"Are you sure of this action ?",
}).then((result)=>{

  if(result.isConfirmed){
    this._question.deleteQuestion(qId).subscribe(
      (data)=>{
this._snack.open("Question Deleted ", "",{
  duration:3000,
});

this.questions = this.questions.filter((q)=> q.quesId!=qId);
      });
  }
  (error)=>{
    this._snack.open("Couldn't delete Question", "", {
      duration:3000,
    });
    console.log("error");
  }
});
  }

}
