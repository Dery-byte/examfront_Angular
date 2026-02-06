import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-lectadd-quiz',
  templateUrl: './lectadd-quiz.component.html',
  styleUrls: ['./lectadd-quiz.component.css']
})
export class LectaddQuizComponent {

  categories = [];

  // quizData = {
  //   title: "",
  //   description: "",
  //   maxMarks: "",
  //   numberOfQuestions: "",
  //   quizpassword: "",
  //   quizTime: "",
  //   startTime: "",
  //   quizDate: "",
  //   attempted: false,
  //   active: true,
  //   category:
  //   {
  //     cid: ""
  //   },
  //   quizType: '',  // 👈 Add this


  //   // ✅ NEW — violation config
  //   violationAction: 'NONE',
  //   violationDelaySeconds: 5,
  //   autoSubmitCountdownSeconds: 10,
  //   maxViolations: 3

  // }




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
    category: {
      cid: ""
    },
    quizType: '',

    // Violation config
    violationAction: 'NONE',
    violationDelaySeconds: 30,
    autoSubmitCountdownSeconds: 5,
    maxViolations: 3,
    delayMultiplier:1.5,


    // Protection toggles
    enableFullscreenLock: true,
    enableWatermark: true,
    enableScreenshotBlocking: true,
    enableDevToolsBlocking: true
  }
  quizFormSubmitted = false;
  hide = true; // default: password hidden

  // quizType is only for controlling UI, not saved
  // quizType: 'theory' | 'obj' | 'both' | '' = '';

  constructor(private _cat: CategoryService,
    private _snackbar: MatSnackBar,
    private _quiz: QuizService) { }

  ngOnInit(): void {


    this._cat.getCategoriesForUser().subscribe((data:any) => {
      this.categories = data;
    },
      (error) => {
        // this.login.logout();

        // alert("error loading Categories");
      }
    );

    // this._cat.getCategories().subscribe(
    //   (data: any) => {
    //     this.categories = data;
    //     // console.log(this.categories);
    //   },
    //   (error) => {
    //     console.log(error);
    //     Swal.fire('Error !!', 'Server Error', 'error');
    //   }
    // )



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

    this._quiz.addUserQuiz(this.quizData).subscribe(
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
          quizType: "",
          category:
          {
            cid: ""
          },
          // ✅ NEW — violation config
          // Violation config
          violationAction: 'NONE',
          violationDelaySeconds: 30,
          autoSubmitCountdownSeconds: 5,
          maxViolations: 3,
          delayMultiplier:1.5,

          // Protection toggles
          enableFullscreenLock: true,
          enableWatermark: true,
          enableScreenshotBlocking: true,
          enableDevToolsBlocking: true
        },
          Swal.fire("Success", "Quiz is added", "success");

      },
      (error) => {
        Swal.fire("Error !! ", "An error occurred while adding quiz", "error");
      }
    );
  }
}
