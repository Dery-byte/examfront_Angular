import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-quiz',
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.css']
})
export class AddQuizComponent implements OnInit {

  categories = [];

  quizData = {
    title: "",
    description: "",
    maxMarks: "",
    numberOfQuestions: "",
    quizpassword: "",
    quizTime: "",
    startTime: "",
    quizDate: "",
    attempted: false,
    active: true,
    category:
    {
      cid: ""
    },
      quizType: ''   // 👈 Add this

  }
quizFormSubmitted = false;

    // quizType is only for controlling UI, not saved
  // quizType: 'theory' | 'obj' | 'both' | '' = '';

  constructor(private _cat: CategoryService,
    private _snackbar: MatSnackBar,
    private _quiz: QuizService) { }

  ngOnInit(): void {
    this._cat.getCategories().subscribe(
      (data: any) => {
        this.categories = data;
        // console.log(this.categories);
      },
      (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Server Error', 'error');
      }
    )
  }
  addQuiz() {
      this.quizFormSubmitted = true;
    if (this.quizData.title.trim() == '' || this.quizData.title == null) {
      this._snackbar.open("Title is required !!", "", {
        duration: 3000,
      })
      return;
    }

      if (!this.quizData.quizType) {
          this._snackbar.open("Select Quiz Type !!", "", {
        duration: 3000,
      })
    return; // stop submission until user selects quizType
  }

    console.log(this.quizData);
    //validation...

    this._quiz.addQuiz(this.quizData).subscribe(
      (data) => {
        this.quizData = {
          title: "",
          description: "",
          maxMarks: "",
          quizpassword: "",
          numberOfQuestions: "",
          quizTime: "",
          startTime: "",
          quizDate: "",
          attempted: false,
          active: true,
          quizType:"",
          category:
          {
            cid: ""
          }
        },
          Swal.fire("Success", "Quiz is added", "success");

      },
      (error) => {
        Swal.fire("Error !! ", "An error occurred while adding quiz", "error");
      }
    );
  }


}
