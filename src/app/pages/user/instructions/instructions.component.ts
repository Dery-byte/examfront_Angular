import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';
import { QuestionService } from 'src/app/services/question.service';
import { ReportServiceService } from 'src/app/services/report-service.service';
import { UserEligibilityService } from 'src/app/services/user-eligibility.service';




@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {
  qid;
  quiz;
  user;
  userId;
  report: any;
  reportid: number;
  reportData;

  currentQuizId: number;
  reportQuizId;
  currentUserId;
  isLegible = false;
  idNumberReport: number[] = [];
  QuizIdsInReport: number[] = [];



  quizData = {
    title: "",
    description: "",
    maxMarks: "",
    numberOfQuestions: "",
    quizpassword: "",
    attempted: true,
    active: "",
    category:
    {
      cid: ""
    },
  }

  constructor(private _route: ActivatedRoute,
    private _report: ReportServiceService,
    private _quiz: QuizService,
    private _questions: QuestionService,
    private _userEligibilityService: UserEligibilityService,
    private _router: Router) { }

  ngOnInit(): void {
    this.qid = this._route.snapshot.params['qid'];
    this.fectchReport();
    this._quiz.getQuiz(this.qid).subscribe((data: any) => {
      console.log(data.title);
      this.quiz = data;
    },
      (error) => {
        console.log("error !!");
        alert("Error loading quiz data")
      }
    );

  }

  fectchReport() {
    this._questions.getReport().subscribe((data) => {
      this.report = data;
      this.report.forEach((q) => {
      });

      const userDetails = localStorage.getItem('user');
      const Object = JSON.parse(userDetails);
      let foundMatchingUser = false; // Flag to track if a matching user is found
      this.idNumberReport = [];

      this.report.forEach((q) => {
        this.userId = q.user.id;
        this.reportQuizId = q.quiz.qId;
        this.currentQuizId = this.qid;
        this.currentUserId = Object.id;
        this.QuizIdsInReport = this.report.map(item => item.quiz.qId); // Fetch ALLthe quizIDs in the report and store them in an array

        console.log(this.QuizIdsInReport);

        if (q.user.id === this.currentUserId) {
          this.idNumberReport.push(q.user.id);
          foundMatchingUser = true; // Set the flag if a matching user is found
        }
        // console.log(this.idNumberReport[0]);
        // console.log(this.currentUserId);
        // console.log(this.reportQuizId); // 2=> Check this if it is actually in the array ReportQuizId array
        // console.log(this.currentQuizId); // 1=> Software Enginerring
        // console.log(this.idNumberReport);

        const isPresent = this.isQIPresent(parseInt(this.qid));
        console.log("current quiz ID : ",typeof(parseInt(this.qid)));

        console.log(isPresent);

      });

      if (foundMatchingUser) {
        // Compare IDs here
        this.isLegible = ((this.idNumberReport[0] == this.currentUserId) && (this.isQIPresent(parseInt(this.qid))));

      } else {
        this.isLegible = false;
      }
      console.log(this.idNumberReport[0] == this.currentUserId);

      // console.log( this.currentQuizId===this.reportQuizId.toString()); // 1 != 2: False
      console.log(this.isQIPresent(parseInt(this.qid)));
      console.log(this.isLegible);

      console.log("current quiz ID",this.currentQuizId);
      console.log("Quiz IDs in the report",this.QuizIdsInReport);
      console.log("current user ID",this.currentUserId);
      console.log("User ID in report",this.idNumberReport);


      if (this.isLegible) {
        // this.isLegible; // True
        console.log("Quiz Taken Already!!!!!!!");
      }
      else {
        // this.isLegible; //False
        console.log("You have not taken the quiz yet!!!!");
      }

      console.log(data);
      console.log(this.report);
    });
  }

  isQIPresent(qId: number): boolean {
    return this.QuizIdsInReport.includes(qId);
  }




  // addQuiz(){

  //   //validation...
  //   this._quiz.addQuiz(this.quizData).subscribe(
  //     (data)=>{
  //       this.quizData={
  //         title:"",
  //         description:"",
  //         maxMarks:"",
  //         quizpassword:"",
  //         numberOfQuestions:"",
  //         attempted:true,
  //         active:"",
  //        category:
  //         {
  //           cid:""
  //         }
  //     }  });
  // }

  // openPopup(){
  //   // const url= './start/' + this.qid;
  //   // // const url= 'index.html/' + this.qid;
  //   // window.open(url, "popup, rel=opener");
  //   // window.focus();
  //   this.refreshPrevent();
  // }

  // focusPopup(){
  // }

  // prevent refresh

  // refreshPrevent(){
  //   window.addEventListener("beforeunload", function (e) {
  //     var confirmationMessage = "YOUR QUIZ WILL BE SUBMITTED";
  //     console.log("cond");
  //     e.returnValue = confirmationMessage;  
  //     return confirmationMessage;              
  // });
  // }



  AddUserIDAndUserID() {
    //Evaluate questions
    // this._questions.evalQuiz(this.qid,this.questions).subscribe((data:any)=>{
    this._questions.addUserIdQuizId(this.qid, this.user).subscribe((data: any) => {
      // this.isSubmit = true;
    },
      (error) => {
        console.log("Error !")

      }
    );
    // this.questions.forEach((q)=>
    // {
    //   if(q.givenAnswer == q.answer){
    //     this.correctAnswers++;
    //     var marksSingle = this.questions[0].quiz.maxMarks/this.questions.length;
    //     this.marksGot += marksSingle;
    //   }
    //   if(q.givenAnswer.trim() !=""){
    //     this.attempted++;
    //   }
    // });
  }



  startQuiz() {
    Swal.fire({
      title: "Enter Quiz Password!",
      text: "",
      input: 'text',
      // input: 'password',
      // icon: 'success',
      showCancelButton: true

    }).then((result) => {
      if (result.value == this.quiz.quizpassword) {
        this.AddUserIDAndUserID();

        this._router.navigate(['./start/' + this.qid]);
        // this.refreshPrevent();
      }
      else if (result.value != this.quiz.quizpassword) {
        Swal.fire("Incorrect Password", '', 'info');
        //     }
      }
      else if (result.isDenied) {
        Swal.fire("Cancelled", '', 'info');
        //     }
      }
    });

  }


  // So nice all it

  //   Swal.fire({
  //     title: 'Submit your Github username',
  //     input: 'text',
  //     inputAttributes: {
  //       autocapitalize: 'off'
  //     },
  //     showCancelButton: true,
  //     confirmButtonText: 'Look up',
  //     showLoaderOnConfirm: true,
  //     preConfirm: (login) => {
  //       return fetch(`//api.github.com/users/${login}`)
  //         .then(response => {
  //           if (!response.ok) {
  //             throw new Error(response.statusText)
  //           }
  //           return response.json()
  //         })
  //         .catch(error => {
  //           Swal.showValidationMessage(
  //             `Request failed: ${error}`
  //           )
  //         })
  //     },
  //     allowOutsideClick: () => !Swal.isLoading()
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       Swal.fire({
  //         title: `${result.value.login}'s avatar`,
  //         imageUrl: result.value.avatar_url
  //       })
  //     }
  //   })
}
