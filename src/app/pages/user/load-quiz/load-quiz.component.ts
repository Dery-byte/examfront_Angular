import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { PrintQuizComponent } from '../print-quiz/print-quiz.component';
@Component({
  selector: 'app-load-quiz',
  templateUrl: './load-quiz.component.html',
  styleUrls: ['./load-quiz.component.css']
})
export class LoadQuizComponent  implements OnInit {

  catId;
  quizzes;
  constructor( private _route:ActivatedRoute, private _quiz:QuizService,
    // private print_quiz:PrintQuizComponent,
    ){}


  ngOnInit(): void {

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
  hola(){
    // this.print_quiz.printQuiz();
  }
}


