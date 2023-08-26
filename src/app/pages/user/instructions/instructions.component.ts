import { Component, OnInit,OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {
  qid;
  quiz;
  constructor(private _route:ActivatedRoute, private _quiz:QuizService, private _router:Router){}

  ngOnInit(): void {
    this.qid = this._route.snapshot.params['qid'];
    this._quiz.getQuiz(this.qid).subscribe((data:any)=>{
      console.log(data.title);
      this.quiz=data;
    },
    (error)=>{
      console.log("error !!");
      alert("Error loading quiz data")
    }
    );

  }

  
  
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

  startQuiz()
  {

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
          // console.log("Result: " + this.quiz.quizpassword);
          //  const url= './start/' + this.qid;
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
