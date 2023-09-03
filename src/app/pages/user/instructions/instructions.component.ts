import { Component, OnInit,OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';
import { QuestionService } from 'src/app/services/question.service';


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
  report:any;
  reportid:number;

  currentQuizId;
  reportQuizId;
  currentUserId;
  isLegible=false;
  idNumberReport:number[]=[];


  quizData={
    title:"",
    description:"",
    maxMarks:"",
    numberOfQuestions:"",
    quizpassword:"",
    attempted:true,
    active:"",
    category:
    {
      cid:""
    },
  }

  constructor(private _route:ActivatedRoute, 
    private _quiz:QuizService, 
    private _questions: QuestionService,
    private _router:Router){}

  ngOnInit(): void {

    this.qid = this._route.snapshot.params['qid'];
    this._quiz.getQuiz(this.qid).subscribe((data:any)=>{
      console.log(data.title);
      this.quiz=data;

      console.log(this.qid);
    },
    (error)=>{
      console.log("error !!");
      alert("Error loading quiz data")
    }
    );


    this.fectchReport();
  }

  fectchReport(){
    this._questions.getReport().subscribe((data)=>{
      this.report=data;
      this.report.forEach((q)=>{
});

const userDetails =localStorage.getItem('user');
const Object = JSON.parse(userDetails);
this.report.forEach((q)=>{
  this.userId = q.user.id;
  this.reportQuizId=q.quiz.qId;
  this.currentQuizId =this.qid;
  this.currentUserId = Object.id;

  if(q.user.id===this.currentUserId){
this.idNumberReport.push(q.user.id);
  }
  console.log(this.idNumberReport[0]);
  console.log(this.currentUserId);
  console.log(this.reportQuizId);
  console.log(this.currentQuizId);
 
});

 this.isLegible = (this.idNumberReport[0]==this.currentUserId && this.reportQuizId==this.currentQuizId);

console.log(this.isLegible);
if(this.isLegible){
  // this.isLegible; // True
  console.log("Quiz Taken Already!!!!!!!");
}
else{
  // this.isLegible; //False
  console.log("You have not taken the quiz yet!!!!");
}

console.log(data);
// console.log(this.isLegible);

  
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



  AddUserIDAndUserID(){
    //Evaluate questions
    // this._questions.evalQuiz(this.qid,this.questions).subscribe((data:any)=>{
      this._questions.addUserIdQuizId(this.qid,this.user).subscribe((data:any)=>{

    // console.log(this.questions);
    // console.log(data);
    // this.marksGot=parseFloat(Number(data.marksGot).toFixed(2));
    // this.correctAnswers = data.correctAnswers;
    // this.attempted = data.attempted;
    // this.maxMarks=data.maxMarks;
    // localStorage.setItem('CorrectAnswer', JSON.stringify(this.correctAnswers));
    // localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
    // localStorage.setItem('Attempted', JSON.stringify(this.attempted));
    // localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks))
    // this.preventBackButton();
    
    
    // this.isSubmit = true;
    },
      (error)=>{
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



  startQuiz()
  {

    // this.checkUserLegibility();
    // Swal.fire({
    //   title:"Are you Ready to start ?",
    //   showCancelButton:true,
    //   confirmButtonText:"Start",
    //   denyButtonText:"Not Ready",
    //   icon:"info",
    // }).then((results)=>{
    //     if(results.isConfirmed){
    //       // const url= './start/' + this.qid;
    //       // this._router.navigate(['./start-quiz/' + this.qid]);
    //       this._router.navigate(['./start/' + this.qid]);
    //       // this.refreshPrevent();
    //     }
    //     else if (results.isDenied){
    //       Swal.fire("Changes are not Saved",'', 'info');
    //     }
    //   });

    Swal.fire({
      title: "Enter Quiz Password!",
      text: "",
      input: 'text',
      // icon: 'success',
      showCancelButton: true    
      
  }).then((result) => {
      if (result.value== this.quiz.quizpassword) {
        this.AddUserIDAndUserID();
// this.checkUserLegibility();
       
        // const userDetails =localStorage.getItem('user');
        // const Object = JSON.parse(userDetails);
    
        // this.report.forEach((q)=>{
        //   this.userId = q.user.id;
        //   this.reportQuizId=q.quiz.qId;
        //   this.currentQuizId =this.qid;
        //   this.currentUserId = Object.id;
        //   console.log(this.userId);
        //   console.log(this.reportQuizId);
        //   console.log(this.currentQuizId);
        //   console.log(this.currentUserId);
        // });
        // if(this.userId==this.currentUserId && this.reportQuizId== this.currentQuizId){
        //   this.isLegible;
        //   console.log("Quiz Taken Already!!!!!!!");
        // }
        // else{
        //   this.isLegible;
        //   console.log("You have not taken the quiz yet!!!!");
        // }


      //   this.report.forEach(q => {
      //     // q.forEach(r=>{
      //     //   console.log(r);
      //     // });
      //     console.log(q[0]);
      //   });

      //  console.log(this.report);
          // console.log("Result: " + this.quiz.quizpassword);
          //  const url= './start/' + this.qid;
                //  this.addQuiz();
          this._router.navigate(['./start/' + this.qid]);
          // this.refreshPrevent();
        }
        else if (result.value!=this.quiz.quizpassword){
          Swal.fire("Incorrect Password",'', 'info');
    //     }
      }
      else if (result.isDenied){
        Swal.fire("Cancelled",'', 'info');
  //     }
    }
  });

  }
}
