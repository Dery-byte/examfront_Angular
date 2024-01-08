import { LocationStrategy } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, } from '@angular/router';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  // BEGIN PAGINATION

  title = "pagination";
  page: number = 1;
  count: number = 0;
  tableSize: number = 3;
  tableSizes: any = [3, 6, 9, 12];


  checked: true;
  //END PAGINATION
  catId;
  quizzes;

  // for the quizzes questions
  questions;
  questionss;
  qid;
  questionWithAnswers;
  marksGot = 0;
  maxMarks = 0;
  correctAnswers = 0;
  attempted: any;
  isSubmit = false;
  timer: any;
  isNavigating = false;
  second: number;
  minutes: number;
  count_timer: any;

  quiz
  private countdownKey = 'expiration_timer';
  private intervalId: any;

  constructor(private _quiz: QuizService,
    private locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _questions: QuestionService,
    private router: Router) {
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    // Custom code to be executed before the page is unloaded
    localStorage.setItem(this.countdownKey, JSON.stringify(this.timer));

    // event.preventDefault();
    // this.preventBackButton();

    // event.returnValue = '' as any; // This is required for some older browsers
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event): void {
    // this.preventBackButton();
  }




  ngOnInit(): void {
    this.qid = this._route.snapshot.params['qid'];
    this.qid = this._route.snapshot.params['qid'];
    this._quiz.getQuiz(this.qid).subscribe((data: any) => {
      console.log(data.title);
      this.quiz = data;

      console.log(this.quiz);
      console.log(this.quiz.quizTime)
    },
      (error) => {
        console.log("error !!");
        alert("Error loading quiz data")
      }
    );
    // this.printQuiz();
    this.loadQuestions();
    this.startTimer();
    this.loadQuestionsFromLocalStorage();
    // this.preventBackButton();
  }


  loadQuestions(): void {
    // this._questions.getQuestionsOfQuiz(this.qid).subscribe((data:any)=>{
    this._questions.getQuestionsOfQuizForText(this.qid).subscribe((data: any) => {  // this does the question shuffle on start of quiz

      // console.log(data[0].answer);
      // console.log(data);
      // localStorage.setItem('GivenAndAnswers', JSON.stringify(data));
      //save to local storage
      this.questions = data.map((q, index) => {
        q.count = index + 1;
        return q;
      });


      // console.log(data[0])  
      // BECAREFULL ABOUT HERE
      let timerString = localStorage.getItem('countdown_timer');
      // Converting the string to a number using parseInt()
      const timerNumber = parseInt(timerString, 10);
      console.log(typeof (timerNumber));
      if (timerNumber) {
        this.timer = timerNumber;
        //Remove value from local storage after accessing it.
        localStorage.removeItem("countdown_timer");
      } else {
        // this.timer = this.questions.length * 2 * 60;
        this.timer = this.quiz.quizTime * 60;
      }
      this.questions.forEach(q => {
        q['givenAnswer'] = "";
      });
    },
      (error) => {
        console.log("Error Loading questions");
        Swal.fire("Error", "Error loading questions", "error");
      }
    );
    this.preventBackButton();
  }

  loadQuestionsWithAnswers() {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {
      this.questionWithAnswers = data;
      console.log(data)
      console.log(this.questionWithAnswers);
    },
      (error) => {
        console.log("Error Loading questions");
        Swal.fire("Error", "Error loading questions", "error");
      }
    );
    this.preventBackButton();
  }
  ///Custom Functions
  preventBackButton() {
    history.pushState(null, null, location.href);
    this.locationSt.onPopState(() => {
      history.pushState(null, null, location.href);
    });
  }


  submitQuiz() {
    Swal.fire({
      title: "Do you want to submit the quiz ?",
      showCancelButton: true,
      confirmButtonText: "Submit",
      icon: "info",
    }).then((e) => {
      if (e.isConfirmed) {
        this.evalQuiz();
        //Make calculation
        // this.saveGivenAndAnswer();
        this.printQuiz();
        //  this.evalQuiz();
        this.loadQuestionsWithAnswers();
        this.preventBackButton();
      };
    });
  }
  printQuiz() {

    this.router.navigate(['./print_quiz/' + this.qid]);
    // this.router.navigate(['./start/' + this.qid]);
  }
  // startTimer(){
  //   let t = window.setInterval(()=>{

  //     if(localStorage.getItem("countdown_timer")){
  //       // this.timer=122;
  //       this.timer=this.questions.length * 2 * 60;

  //       console.log(this.timer);
  //       console.log(23);
  //       }
  //       else{
  //         // this.timer=this.questions.length * 2 * 60;
  //       }
  //  //Code
  //  if(this.timer<=0){
  //    // this.submitQuiz();
  //    this.printQuiz();
  //    this.evalQuiz();
  //    clearInterval(t);
  //    // localStorage.removeItem("exam");
  //    this.preventBackButton();
  //  }
  //  else{
  //    this.timer--;
  //  }
  //    },1000);
  //  }


  startTimer() {
    let t = window.setInterval(() => {
      //Code
      if (this.timer <= 0) {
        // this.submitQuiz();
        this.printQuiz();
        this.evalQuiz();
        clearInterval(t);
        // localStorage.removeItem("exam");
        // this.preventBackButton();
      }
      else {
        this.timer--;
      }
    }, 1000);
  }
  getFormmatedTime() {
    let mm = Math.floor(this.timer / 60);
    let ss = this.timer - mm * 60;
    return `${mm} min : ${ss} sec`
  }


  evalQuiz() {
    //Evaluate questions
    this._questions.evalQuiz(this.qid, this.questions).subscribe((data: any) => {
      console.log(this.questions);
      console.log(data);
      this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
      this.correctAnswers = data.correctAnswers;
      this.attempted = data.attempted;

      this.maxMarks = data.maxMarks;
      localStorage.setItem('CorrectAnswer', JSON.stringify(this.correctAnswers));
      localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
      localStorage.setItem('Attempted', JSON.stringify(this.attempted));
      localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks))
      this.preventBackButton();


      this.isSubmit = true;
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
  printPage() {
    window.print();
    // this.preventBackButton();  
  }
  saveDataInBrowser(): void {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {
      // this.preventBackButton();
    },
    );
  }
  loadQuestionsFromLocalStorage() {
    // this.questionss = JSON.parse(localStorage.getItem("exam"));
    this.timer = this.questionss.length * 2 * 60;
    localStorage.setItem('time', JSON.stringify(this.timer));

    this.questions.forEach(q => {
      q['givenAnswer'] = "";
    });
    // localStorage.setItem('exam', JSON.stringify(data));
    // this.preventBackButton();
    this.startTimer();
    console.log(this.questionss[0]);
  }

  //PAGINATION

  onTableDataChange(event: any) {
    this.page = event;
    this.loadQuestionsFromLocalStorage();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.loadQuestionsFromLocalStorage();
  }




};

