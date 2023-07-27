import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
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

  constructor(private _route:ActivatedRoute, 
              private _question:QuestionService,
              private _snack:MatSnackBar,){  }

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
