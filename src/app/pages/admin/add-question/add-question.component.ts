import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import Swal from 'sweetalert2';
import * as ClassisEditor from '@ckeditor/ckeditor5-build-classic';
import { QuizService } from 'src/app/services/quiz.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, tap } from 'rxjs/operators';


@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent implements OnInit {
  selectedFile: File | null = null;
  selectedFileTheory: File | null = null;


  specificQuiz: any;
  public Editor = ClassisEditor;

  theoryQuesToAnswer = {
    totalQuestToAnswer: "",
    timeAllowed: "",
    quiz: {
      qId: ""
    }
  };

  qId;
  qTitle;
  question = {
    quiz: {

    },
    content: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_answer: [],
  };
  constructor(private _route: ActivatedRoute,
    private _router: Router,
    private _question: QuestionService,
    private _snack: MatSnackBar,
    private _quiz: QuizService) { }


  ngOnInit(): void {
    this.qId = this._route.snapshot.params['qId'];
    this.qTitle = this._route.snapshot.params['title'];
    this.question.quiz['qId'] = this.qId;
    this.theoryQuesToAnswer.quiz['qId'] = this.qId;
    console.log(this.theoryQuesToAnswer)

    this.getQuizById();

  }

  // FETCH THE ENTIRE QUIZ

  getQuizById() {
    this._quiz.getQuiz(this.qId).subscribe(
      (quiz: any) => {
        this.specificQuiz = quiz; // now you have the entire quiz object
        // this.theoryQuesToAnswer.quiz = quiz;
        this.qTitle = quiz.title; // if you still want to display title
        console.log("Full Quiz Object:", quiz);
      },
      (error) => {
        console.error("Error fetching quiz:", error);
        this._snack.open("Could not load quiz", "", { duration: 3000 });
      }
    );
  }



  addQuestion() {
    if (this.question.content.trim() == '' || this.question.content == null) {
      return;
    }
    if (this.question.option1.trim() == '' || this.question.option1 == null) {
      return;
    }
    if (this.question.option2.trim() == '' || this.question.option2 == null) {
      return;
    }

    if (this.question.correct_answer == null) {
      return;
    }


    // forms submit
    this._question.addQuestion(this.question).subscribe(
      (data: any) => {
        // this.question = data;
        Swal.fire('Success', "Question Added", "success");
        this.question.content = ""
        this.question.option1 = ""
        this.question.option2 = ""
        this.question.option3 = ""
        this.question.option4 = ""
        this.question.correct_answer = [];

      },
      (error) => {
        Swal.fire("Error", "Couldn't add question", "error");
      }
    )
  }


  // upload file
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }



    onFileSelectedTheory(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileTheory = input.files[0];
    } else {
      this.selectedFileTheory = null;
    }
  }
  // onFileSelected(event: any): void {
  //   this.selectedFile = event.target.files[0];
  // }


  uploadQuiz(): void {
    if (!this.selectedFile) {
      Swal.fire("Error", "No file selected.", "error");
      console.error('No file selected.');
      return;
    } else if (this.selectedFile) {
      this._question.uploadQuestions(this.qId, this.selectedFile).subscribe(
        response => {
          Swal.fire("Error", "Error uploading questions", "error");
          console.log("Done");
        },

        (error) => {
          Swal.fire('Success', "Questions uploaded successfully", "success");
          this.clearSelectedFile();
          // this._router.navigate(["/admin/quizzes"]);
          console.log(" Not Done!!!");
          // this._router.navigate(["/admin/view-questions"/{this.qId}]);
        }
      );
    }
  }


  uploadTheoryQuestionss(): void {
    if (!this.selectedFileTheory || !this.theoryQuesToAnswer.totalQuestToAnswer) {
      this._snack.open(
        "Select a file and specify No. of questions to answer!",
        "",
        { duration: 3000 }
      );
      // console.error("File or number of questions missing.");
      return;
    }

    // console.log("Starting upload process...");
    // console.log("Theory questions data:", this.theoryQuesToAnswer);
    // console.log("Quiz ID:", this.qId);
    // console.log("Selected file:", this.selectedFile);

    this._quiz.addNumberOfTheoryQuestions(this.theoryQuesToAnswer)
      .pipe(
        tap(response => {
          // console.log("First API response (addNumberOfTheoryQuestions):", response);
        }),
        switchMap((data: any) => {
          // console.log("Starting file upload...");
          return this._question.uploadTheoryQuestions(this.qId, this.selectedFileTheory);
        }),
        tap(response => {
          // console.log("Second API response (uploadTheoryQuestions):", response);
        })
      )
      .subscribe(
        response => {
          console.log("Final success response:", response);
          Swal.fire("Success", "Theory Questions uploaded successfully", "success");
          this.clearSelectedFileTheory();
          this.theoryQuesToAnswer.totalQuestToAnswer = "";
          this.theoryQuesToAnswer.timeAllowed = "";
        },
        error => {
          // console.error("Full error object:", error);
          // console.error("Error status:", error.status);
          // console.error("Error message:", error.message);
          // console.error("Error response body:", error.error);

          // Check if it's actually a success but with wrong status code
          if (error.status === 200 || error.status === 201) {
            Swal.fire("Success", "Theory Questions uploaded successfully", "success");
          } else {
            Swal.fire("Error", "Error uploading questions", "error");
          }
        }
      );
  }
  clearSelectedFile(): void {
    this.selectedFile = null;
  }

  
    clearSelectedFileTheory(): void {
    this.selectedFileTheory = null;
  }


}

