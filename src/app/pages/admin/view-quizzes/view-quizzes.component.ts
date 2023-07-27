import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-quizzes',
  templateUrl: './view-quizzes.component.html',
  styleUrls: ['./view-quizzes.component.css']
})
export class ViewQuizzesComponent implements OnInit {


quizzes = [];
  constructor(private quizz : QuizService){}

  ngOnInit(): void {
    this.quizz.loadQuizzes().subscribe(
      (data:any)=>{
        this.quizzes=data;
        console.log(this.quizzes);

     },
     
     (error)=>{
      console.log(error);
      Swal.fire("Error !!", "Failed to load data !", "error")
     });
    
    
  }
  deleteQuiz(qId){
   Swal.fire({ 
    icon:"info",
    title:"Are you sure of this ?",
    confirmButtonText:"Delete",
    showCancelButton:true,
   }).then((results)=>{
    if(results.isConfirmed){
 //delete

 this.quizz.deleteQuizs(qId).subscribe(
  (data)=>{
this.quizzes = this.quizzes.filter((quiz)=> quiz.qId != qId);

    Swal.fire("Success", "Quiz Deleted", "success");
  },
  (error)=>
  {
    Swal.fire("Error", "Quiz could not be deleted", "error");

  }
);



    }
   

   })
  }
}
