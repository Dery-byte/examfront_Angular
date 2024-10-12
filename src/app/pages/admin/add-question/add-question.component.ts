import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import Swal from 'sweetalert2';
import * as ClassisEditor from '@ckeditor/ckeditor5-build-classic';
import { QuizService } from 'src/app/services/quiz.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent implements OnInit {
  selectedFile: File | null = null;

  public Editor = ClassisEditor;

  theoryQuesToAnswer = {
    totalQuestToAnswer: "",
    timeAllowed:"",
   quiz: {
      qId:""
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
    private _snack:MatSnackBar,
  private _quiz: QuizService) { }


  ngOnInit(): void {
    this.qId = this._route.snapshot.params['qId'];
    this.qTitle = this._route.snapshot.params['title'];
    this.question.quiz['qId'] = this.qId;
    this.theoryQuesToAnswer.quiz['qId'] = this.qId;

    console.log(this.theoryQuesToAnswer)

  }

  // THIS FUNCTION SUBMIT THE NUMBER OF QUESTIONS TO ANSWER
  addNumberOfTheoryToAnswer() {
    if (this.theoryQuesToAnswer.totalQuestToAnswer.trim() == '' || this.theoryQuesToAnswer.totalQuestToAnswer == null) {
      return;
    }
    // forms submit
    this._quiz.addNumberOfTheoryQuestions(this.theoryQuesToAnswer).subscribe(
      (data: any) => {

        Swal.fire("Success", "Theory Questions uploaded successfully", "success"); // This is display when theory added succefully
      },
      (error) => {
        Swal.fire("Error", "Couldn't add question Number", "error");
      }
    )

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
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }


  uploadQuiz(): void {
    if (!this.selectedFile) {
      Swal.fire("Error", "No file selected.", "error");
      console.error('No file selected.');
      return;
    }    else if(this.selectedFile){
      this._question.uploadQuestions(this.qId, this.selectedFile).subscribe(
        response => {
          Swal.fire("Error", "Error uploading questions", "error");
          console.log("Done");
        },
        
        (error) => {
          Swal.fire('Success', "Questions uploaded successfully", "success");
          this._router.navigate(["/admin/quizzes"]);
          console.log(" Not Done!!!");
          // this._router.navigate(["/admin/view-questions"/{this.qId}]);
        }
      );
    }
    // const formData = new FormData();
    // formData.append('file', this.selectedFile);

   
  }




  uploadTheoryQuestionss(): void {
    if (!this.selectedFile && (this.theoryQuesToAnswer.totalQuestToAnswer == "")) {

      this._snack.open("Selected a file and specify No. of questions to answer! ", "",{
        duration:3000,
      });
      // Swal.fire("Error", "Selected a file and specify No. of questions to answer.", "error");
      console.error('No file selected.');
      return;
    } this._question.uploadTheoryQuestions(this.qId, this.selectedFile).subscribe(
      response => {

        console.log(this.qId);
        console.log(this.selectedFile);
        Swal.fire("Error", "Error uploading questions", "error");
      }, (error) => {
        this.addNumberOfTheoryToAnswer();
        // Swal.fire('Success', "Theory Questions uploaded successfully", "success");
        this._router.navigate(["/admin/quizzes"]);
      }
    );
  }





}

