import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { QuestionService } from 'src/app/services/question.service';
import Swal from 'sweetalert2';
import  * as ClassisEditor from '@ckeditor/ckeditor5-build-classic';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-update-question',
  templateUrl: './update-question.component.html',
  styleUrls: ['./update-question.component.css']
})
export class UpdateQuestionComponent implements OnInit{

  

  public Editor = ClassisEditor;

  qTitle;
  quesId;
 questions;

  constructor(private _route:ActivatedRoute, 
              private _question:QuestionService,
              private _router:Router,
              private _snack:MatSnackBar,){  }

  ngOnInit(): void {
    this.qTitle =this._route.snapshot.params['qTitle'];
    this.quesId =this._route.snapshot.params['quesId'];
   this._question.getSpecificQuestion(this.quesId).subscribe((data:any)=>
   {
    console.log(data);
    this.questions=data;
    // alert(this.qTitle)
    // alert(this.quesId)
   },
   (error)=>{
    console.log('error');
   }
   );


  }


  //Update Question
  public updateQuestionData(){

    this._question.updateQuestion(this.questions).subscribe((data)=>
    {
      Swal.fire("Success ", "Question Updated Succesfully","success").then((e)=>
      {
        this._router.navigate(["/admin/quizzes"]);
      });
    },
    (error)=>{
      Swal.fire("Error", "Question Could not be updated", "error");
  
    });
  }


 

}
 
