import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';
import { QuestionService } from 'src/app/services/question.service';
import { ReportServiceService } from 'src/app/services/report-service.service';
import { UserEligibilityService } from 'src/app/services/user-eligibility.service';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';




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

  timeT
  timerAll
  timeO
  numberOfQuestionsToAnswer



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
    private login: LoginService,
    private _snack:MatSnackBar,
    private _router: Router) { }

  ngOnInit(): void {
    this.qid = this._route.snapshot.params['qid'];
    this.fetchReport();
    this._quiz.getQuiz(this.qid).subscribe((data: any) => {
      console.log(data.title);
      this.quiz = data;

      
     this.timeO = this.quiz.quizTime * 1;
     this.timerAll = this.quiz.quizTime * 1 * 60 ;

    },
      (error) => {

        this._snack.open("You're Session has expired! ", "", {
          duration: 3000,
        });
        this.login.logout();

        // console.log("error !!");
        // alert("Error loading quiz data")
      }
    );


    // Load number of questions to answer
    this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe((data: any) => {
      console.log(data);
      console.log(data[0].totalQuestToAnswer);
      // this.quizTitle =data[0].quiz.title;
      // this.courseTitle = data[0].quiz.category.title;

      this.numberOfQuestionsToAnswer = data[0].totalQuestToAnswer;
      this.timeT = data[0].timeAllowed;
      this.timerAll = (this.timeT + this.timeO) * 60;

      console.log(this.timeT);
      console.log(this.timeO);
console.log(this.timerAll)

    });


  }

  fetchReport() {
    this._questions.getReport().subscribe((data) => {
        this.report = data;
        const userDetails = localStorage.getItem('user');
        const currentUser = JSON.parse(userDetails);
        const currentUserId = currentUser.id;
        const currentQuizId = parseInt(this.qid);
        
        // Initialize flag for eligibility
        let isQuizTaken = true;

        // Check if current user and quiz match any record in the report
        this.report.forEach((entry) => {
            const reportUserId = entry.user.id;
            const reportQuizId = entry.quiz.qId;

            if (reportUserId === currentUserId && reportQuizId === currentQuizId) {
                isQuizTaken = false;
            }
        });

        // Set eligibility based on whether the quiz has been taken
        this.isLegible = !isQuizTaken;

        if (this.isLegible) {
            console.log("You have not taken the quiz yet! You're eligible to take it.");
        } else {
            console.log("Quiz taken already! You're not eligible.");
        }

        // Debugging logs for clarity
        console.log("Current User ID: ", currentUserId);
        console.log("Current Quiz ID: ", currentQuizId);
        console.log("Quiz Eligibility: ", this.isLegible);
    });
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
  getFormmatedTime() {
    // let timeToseconds = this.timerAll * 60
    let hr = Math.floor(this.timerAll / 3600);
    let mm = Math.floor((this.timerAll % 3600) / 60);
    // let ss = this.timerAll % 60;

    let formattedTime = '';
    if (hr > 0) {
      formattedTime += `${hr} hr(s) : `;
    }
    formattedTime += `${mm} min(s)`;
    return formattedTime;
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
