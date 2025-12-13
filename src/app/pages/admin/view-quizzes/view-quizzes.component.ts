import { Component,TemplateRef, OnInit } from '@angular/core';
import { QuizService } from 'src/app/services/quiz.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CategoryService } from 'src/app/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LoginService } from 'src/app/services/login.service';

interface QuizStatusResponse {
  status: string;
}


@Component({
  selector: 'app-view-quizzes',
  templateUrl: './view-quizzes.component.html',
  styleUrls: ['./view-quizzes.component.css']
})
export class ViewQuizzesComponent implements OnInit {


quizzes = [];

specificQuestion;
quizById;
categories;
  constructor(private quizz : QuizService, 
    private _category : CategoryService, 
    private _snack: MatSnackBar,
     public dialog: MatDialog,
    public login:LoginService,
  ){}

  ngOnInit(): void {
    this.quizz.loadQuizzes().subscribe(
      (data:any)=>{
        this.quizzes=data;
        console.log(this.quizzes);

     },
     
     (error)=>{
      console.log(error);
      // Swal.fire("Error !!", "Failed to load data !", "error");
      this._snack.open("You're Session has expired! ", "", {
        duration: 3000,
      });
      this.login.logout();
     });


     this._category.getCategories().subscribe((data)=>
      {
        this.categories = data;
      },
      (error)=>
      {
this.login.logout();

        // alert("error loading Categories");
      }
      );
        }


  dialogRef!: MatDialogRef<any>;



  openUpdateDialog(quizId: any, templateRef: TemplateRef<any>): void {
    console.log(quizId);
    // Fetch question details based on ID
    this.specificQuestion = this.getQuestionById(quizId).subscribe((data: any) => {
      console.log(this.specificQuestion);
      this.quizById = data;
      console.log(this.quizById);
      this.dialogRef = this.dialog.open(templateRef, {
        width: '550px',
        data: this.quizById,
      });

      this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.quizById = result;
        }
      });
    });
  }
  getQuestionById(quizId: any): any {
    return this.quizz.getQuizById(quizId);
  }


  // LOGIC TO UPDATE Quiz
  public updateData(){

    this.quizz.updateQuiz(this.quizById).subscribe((data)=>
    {
      this._snack.open("Quiz Updated Successfully! ", "", {
        duration: 3000,
      });
      this.dialogRef.close(this.quizById);
      this.ngOnInit();
    },
      (error) => {
        this._snack.open("Couldn't update Question", "", {
          duration: 3000,
        });
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







 selectedStatus: string = '';
  updating: boolean = false;



 updateQuizStatus(q: any) {
  Swal.fire({
    title: 'Are you sure?',
    text: `Change quiz status to "${q.selectedStatus}" ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Yes, update it!'
  }).then((result) => {
    if (result.isConfirmed) {
      q.updating = true;
      this.quizz.updateQuizStatus(q.qId, q.selectedStatus).subscribe({
        next: (res: QuizStatusResponse) => {
          q.status = res.status;
          q.updating = false;

            this._snack.open(`Quiz status changed to ${res.status}`, "", {
        duration: 3000,
      });
          // Swal.fire({
          //   icon: 'success',
          //   title: 'Status Updated',
          //   text: `Quiz status changed to ${res.status}`
          // });
        },
        error: (err) => {
          console.error(err);
          q.updating = false;
      this._snack.open("Status update failed. Please try again.", "", {
        duration: 3000,
      });
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Update Failed',
          //   text: 'Failed to update quiz status. Please try again.'
          // });
        }
      });
    }
  });
}



}
