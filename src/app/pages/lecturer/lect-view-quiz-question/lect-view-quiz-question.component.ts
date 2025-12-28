import { Component, TemplateRef, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as ClassisEditor from '@ckeditor/ckeditor5-build-classic';
import { LoginService } from 'src/app/services/login.service';







import Swal from 'sweetalert2';

@Component({
  selector: 'app-lect-view-quiz-question',
  templateUrl: './lect-view-quiz-question.component.html',
  styleUrls: ['./lect-view-quiz-question.component.css']
})
export class LectViewQuizQuestionComponent {
 public Editor = ClassisEditor;


  qId;
  qTitle;
  Tqid;
  questions = [];
  sectionB: any[] = [];
  theory;
  specificSectionB;
  numberOfquestionsToAnswer;

  specificObjective;
  specificObj;

  //  updatespecificObjective ={
  //   correct_answer:"",
  //   option1:"",
  //   option2:"",
  //   option3:"",
  //   option4:"",
  // 	quiz:
  //   {
  //     qId:""
  //   }
  // }

  updateNumberOfquestionsToAnswer = {
    totalQuestToAnswer: "",
    timeAllowed: "",
    quiz:
    {
      qId: ""
    }
  }
  numberOfquestionsToAnswers;

  constructor(private _route: ActivatedRoute,
    private _question: QuestionService,
    private _snack: MatSnackBar,
    private _router: Router,
    private login: LoginService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.qId = this._route.snapshot.params['qId'];
    this.Tqid = this._route.snapshot.params['tqId'];

    this.qTitle = this._route.snapshot.params['qTitle'];
    this._question.getQuestionsOfQuiz(this.qId).subscribe((data: any) => {
      console.log(data);
      this.questions = data;

    },
      (error) => {
        console.log('error');
      }
    );

    this._question.getSubjective(this.qId).subscribe((theory: any) => {
      console.log(theory);
      this.sectionB = theory;
    },
      (error) => {
        this._snack.open("You're Session has expired! ", "", {
          duration: 3000,
        });
        this.login.logout();
        console.log("Could not load data from server");
      });


    this._question.getNumerOfQuesToAnswer(this.qId).subscribe((data: any) => {
      console.log(data);
      this.numberOfquestionsToAnswers = data;

    },
      (error) => {
        console.log('error');
      }
    );

  }



  dialogRef!: MatDialogRef<any>;

  getPrefixes(): string[] {
    const prefixes = new Set<string>();
    this.sectionB.forEach(question => {
      const prefix = question.quesNo.match(/^Q\d+/)?.[0];
      if (prefix) {
        prefixes.add(prefix);
      }
    });
    return Array.from(prefixes).sort();
  }
  getGroupedQuestions(prefix: string) {
    return this.sectionB.filter(q => q.quesNo.startsWith(prefix));

  }

  getQuesNumberById(questionId: any): any {
    return this._question.getNumerOfQuesToAnswer(questionId);
  }

  //  UPDATING THE SPECIFIC OBJJECTIVE QUESTION
  getQuesObj(objId: any): any {
    return this._question.getSpecificObj(objId);
  }
  openUpdateObjDialog(objId: any, templateRef: TemplateRef<any>): void {
    console.log(objId);
    // Fetch question details based on ID
    this.specificObj = this.getQuesObj(objId).subscribe((data) => {
      console.log(this.specificObj);
      this.specificObjective = data;
      console.log(this.specificObjective);
      this.dialogRef = this.dialog.open(templateRef, {
        width: '850px',
        data: this.specificObjective,
      })
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.specificObjective = result;
      }
    });
  }

  // LOGIC TO UPDATE
  public updateQuestionData() {
    this._question.updateQuestion(this.specificObjective).subscribe((data) => {
      this._snack.open("This question Updated Successfully! ", "", {
        duration: 3000,
      });
      this.dialogRef.close(this.specificObjective);
      this.ngOnInit();
    },
      (error) => {
        this._snack.open("This question couldn't be updated", "", {
          duration: 3000,
        });
      });
  }
  //  UPDATING THE SPECIFIC OBJJECTIVE QUESTION END










  openUpdateNumberDialog(qId: any, templateRef: TemplateRef<any>): void {
    console.log(qId);
    // Fetch question details based on ID
    this._question.getNumerOfQuesToAnswerBy(this.qId).subscribe((data) => {
      this.numberOfquestionsToAnswer = data;
      console.log(this.numberOfquestionsToAnswer);
      console.log(this.numberOfquestionsToAnswer[0].totalQuestToAnswer)
      this.dialogRef = this.dialog.open(templateRef, {
        width: '350px',
        data: this.numberOfquestionsToAnswer,
      })
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.numberOfquestionsToAnswer = result;
      }
    });
  }





  openUpdateDialog(questionId: any, templateRef: TemplateRef<any>): void {
    console.log(questionId);
    // Fetch question details based on ID
    this.specificSectionB = this.getQuestionById(questionId).subscribe((data: any) => {
      console.log(this.specificSectionB);
      this.theory = data;
      console.log(this.theory);
      this.dialogRef = this.dialog.open(templateRef, {
        width: '350px',
        data: this.theory,
      });

      this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.theory = result;
        }
      });
    });
  }


  getQuestionById(questionId: any): any {
    return this._question.getSpecificSubjective(questionId);
  }



  
  // Update Theory Question WORK ON THIS LATER
  updateTheoryQuestion() {
    this._question.updateTheoryQuestions(this.theory).subscribe((data) => {
      this._snack.open("Question Updated Successfully! ", "", {
        duration: 3000,
      });
      this.dialogRef.close(this.theory);
      this.ngOnInit();
    },
      (error) => {
        this._snack.open("Couldn't update Question", "", {
          duration: 3000,
        });
      });
  }


  updateTheoryNumberOfQuesToAnswer() {
    console.log(this.numberOfquestionsToAnswer);
    this._question.updateTheoryNumberOfQuestionsToAnswer(this.numberOfquestionsToAnswer[0]).subscribe((data) => {
      this._snack.open(" Update was Successful! ", "", {
        duration: 3000,
      });
      this.dialogRef.close(this.numberOfquestionsToAnswer[0]);
      this.ngOnInit();
    },
      (error) => {
        this._snack.open("Update was Unsuccesfull ", "", {
          duration: 3000,
        });
      });
  }


  // Delete theory question
  deleteTheoryQuestion(tqId) {
    console.log(this.Tqid);
    Swal.fire({
      icon: "info",
      showCancelButton: true,
      confirmButtonText: 'Delete',
      title: "Are you sure of this action ?",
    }).then((result) => {
      if (result.isConfirmed) {
        this._question.deleteTheoryQuestion(tqId).subscribe(
          (data) => {
            this._snack.open("Question Deleted ", "", {
              duration: 3000,
            });
            this.sectionB = this.sectionB.filter((q) => q.tqId != tqId);
          });
      }
      (error) => {
        this._snack.open("Couldn't delete Question", "", {
          duration: 3000,
        });
        console.log("error");
      }
    });
  }






  //Delete question
  deleteQuestion(qId) {
    Swal.fire({
      icon: "info",
      showCancelButton: true,
      confirmButtonText: 'Delete',
      title: "Are you sure of this action ?",
    }).then((result) => {

      if (result.isConfirmed) {
        this._question.deleteQuestion(qId).subscribe(
          (data) => {
            this._snack.open("Question Deleted ", "", {
              duration: 3000,
            });

            this.questions = this.questions.filter((q) => q.quesId != qId);
          });
      }
      (error) => {
        this._snack.open("Couldn't delete Question", "", {
          duration: 3000,
        });
        console.log("error");
      }
    });
  }
}
