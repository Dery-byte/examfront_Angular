import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import Swal from 'sweetalert2';
import * as ClassisEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent implements OnInit {
  selectedFile: File | null = null;

  public Editor = ClassisEditor;

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
    answer: "",
  };
  constructor(private _route: ActivatedRoute, private _question: QuestionService) { }


  ngOnInit(): void {
    this.qId = this._route.snapshot.params['qId'];
    this.qTitle = this._route.snapshot.params['title'];
    this.question.quiz['qId'] = this.qId;
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

    if (this.question.answer.trim() == '' || this.question.answer == null) {
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
        this.question.answer = ""

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
      console.error('No file selected.');
      return;
    }
    // const formData = new FormData();
    // formData.append('file', this.selectedFile);

    this._question.uploadQuestions(this.qId, this.selectedFile).subscribe(
      response => {
        // console.log('Quiz uploaded successfully:', response);
        Swal.fire('Success', "Questions uploaded successfully", "success");

        // Handle success, e.g., show a success message
      },
      (error) => {
        // console.error('Error uploading questions:', error);
        Swal.fire("Error", "Error uploading questions", "error");
        // Handle error, e.g., show an error message
      }
    );
  }


}

