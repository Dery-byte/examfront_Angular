import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-quiz',
  templateUrl: './update-quiz.component.html',
  styleUrls: ['./update-quiz.component.css']
})
export class UpdateQuizComponent implements OnInit  {

  constructor(private _route : ActivatedRoute, 
             private _quizz:QuizService, 
             private _category : CategoryService,
             private _router:Router){}

  qId = 0;
  quiz;
  categories;
  ngOnInit(): void {
    
this.qId = this._route.snapshot.params['qid'];
// alert(this.qId);
this._quizz.getQuiz(this.qId).subscribe((data)=>
{
  this.quiz=data;
  console.log(this.quiz);
},

(error)=>
{
  console.log(error);
});

this._category.getCategories().subscribe((data)=>
{
  this.categories = data;
},
(error)=>
{
  alert("error loading Categories");
}
);
  }

  public updateData(){

    this._quizz.updateQuiz(this.quiz).subscribe((data)=>
    {
      Swal.fire("Success ", "Quiz Updated Succesfully","success").then((e)=>
      {
        this._router.navigate(["/admin/quizzes"]);
      });
    },
    (error)=>{
      Swal.fire("Error", "Quiz Could not be updated", "error");

    });
  }
}
