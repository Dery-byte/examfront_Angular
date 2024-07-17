import { Component,TemplateRef, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
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
 Tqid;
 questions=[];
 sectionB: any[] = [];
 theory;
 specificSectionB;
 
  constructor(private _route:ActivatedRoute, 
              private _question:QuestionService,
              private _snack:MatSnackBar,
              private _router:Router,
              public dialog: MatDialog){  }

  ngOnInit(): void {
    this.qId =this._route.snapshot.params['qId'];
    this.Tqid =this._route.snapshot.params['tqId'];

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

  openUpdateDialog(questionId: any, templateRef: TemplateRef<any>): void {
    console.log(questionId);
    // Fetch question details based on ID
    this.specificSectionB = this.getQuestionById(questionId).subscribe((data: any)=>{
      console.log(this.specificSectionB);
      this.theory = data;
      console.log(this.theory);
    this.dialogRef = this.dialog.open(templateRef, {
      width: '350px',
      data: this.theory,
    });

      this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.theory=result;
      }
    });
    });
  }
  getQuestionById(questionId: any): any {
   return this._question.getSpecificSubjective(questionId);
  }

  // Update Theory Question WORK ON THIS LATER
  updateTheoryQuestion(){
    this._question.updateTheoryQuestions(this.theory).subscribe((data)=>
      {
        this._snack.open("Question Updated Successfully! ", "",{
          duration:3000,
        });
        this.dialogRef.close(this.theory);
        // this._router.navigate(["/admin/view-quetions/:qId/:qTitle"]);
      },
      (error)=>{
        this._snack.open("Couldn't update Question", "", {
          duration:3000,
        });     
       });
  }


// Delete theory question
  deleteTheoryQuestion(tqId){
    console.log(this.Tqid);
Swal.fire({
  icon:"info",
  showCancelButton:true,
  confirmButtonText:'Delete',
  title:"Are you sure of this action ?",
}).then((result)=>{
  if(result.isConfirmed){
    this._question.deleteTheoryQuestion(tqId).subscribe(
      (data)=>{
this._snack.open("Question Deleted ", "",{
  duration:3000,
});
this.sectionB = this.sectionB.filter((q)=> q.tqId!=tqId);
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
