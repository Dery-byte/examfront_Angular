import { LocationStrategy } from '@angular/common';
import { Component , OnInit, Input,HostListener} from '@angular/core';
// import { Component , OnInit, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, Subject, Subscriber, Subscription } from 'rxjs';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { StartComponent } from '../start/start.component';{}
import { Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-print-quiz',
  templateUrl: './print-quiz.component.html',
  styleUrls: ['./print-quiz.component.css']
})
export class PrintQuizComponent implements OnInit {
  questions;
  questionss;
  qid;
  questionWithAnswers;
  marksGot=0;
  maxMarks=0;
  correctAnswers =0;
  attempted=0;
  timer:any;
  isNavigating=false;
  second:number;
  minutes:number;
  count_timer:any;
  username:any;
  
    constructor( private _quiz:QuizService,
       private locationSt:LocationStrategy, 
       private _route: ActivatedRoute, 
       private _questions: QuestionService,
       private router:Router){}
  
  refreshUser = new BehaviorSubject<Boolean>(true)

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    event.preventDefault();
    event.returnValue = '' as any; // This is required for some older browsers
  }
  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event): void {
    this.preventBackButton();
  }
  
    ngOnInit(): void {
      const userDetails =localStorage.getItem('user');
      const Object = JSON.parse(userDetails);
      this.username=Object.username;
      this.qid = this._route.snapshot.params['qid'];
      this.loadResults();
      this.loadQuestionsWithAnswers(); 
      this.loadQuestions();
      this.saveDataInBrowser();
      this.loadQuestionsFromLocalStorage();
      this.evalQuiz();
      // this.printQuiz();
      this.preventBackButton();
    
    }


    removeResults(){
      localStorage.removeItem("MaxMarks");
      localStorage.removeItem("Attempted");
      localStorage.removeItem("CorrectAnswer");
      localStorage.removeItem("MarksGot");
    }
     
    loadQuestionsWithAnswers(){
      this._questions.getQuestionsOfQuiz(this.qid).subscribe((data:any)=>{
        // this._questions.getQuestionsOfQuizForText(this.qid).subscribe((data:any)=>{ // this does the question shuffle on print

        // console.log(data[0].answer);
        this.questionWithAnswers=data;
        console.log(data)
        console.log(this.questionWithAnswers);
        // this.attempted = JSON.parse(localStorage.getItem("Attempted"));
        this.loadResults();

      },
      (error)=>{
        console.log("Error Loading questions");
        Swal.fire("Error","Error loading questions", "error");
      }
      );
      this.preventBackButton();
      // this.refreshOnload();
    }
    loadQuestions(): void{
      this._questions.getQuestionsOfQuizForText(this.qid).subscribe((data:any)=>{
        console.log(data[0].answer);
        console.log(data);
        this.questions=data.map((q, index) =>{
          q.count =index + 1;
          return q;
        });
        console.log(data[0])
        this.timer = this.questions.length * 2 * 60;  
        this.questions.forEach(q => {
          q['givenAnswer']="";
        });
        // this.preventBackButton();
        // this.preventRefresh();

      },
      (error)=>{
        console.log("Error Loading questions");
        Swal.fire("Error","Error loading question", "error");
      }
      );
    }
    ///Custom Functions
    preventBackButton(){
      history.pushState(null,null,location.href);
      this.locationSt.onPopState(()=>{
  history.pushState(null,null,location.href);
      });
    }
  
  
  printQuiz(){
    this.loadResults();
    this.router.navigate(['./print_quiz/' + this.qid]);
    
  }

  loadResults(){
    this.maxMarks = JSON.parse(localStorage.getItem("MaxMarks"));
    this.attempted = JSON.parse(localStorage.getItem("Attempted"));
    this.correctAnswers= JSON.parse(localStorage.getItem("CorrectAnswer"));
    this.marksGot =JSON.parse(localStorage.getItem("MarksGot"));
  }  
  
  evalQuiz(){
  //Evaluate questions
  this._questions.evalQuiz( this.qid,this.questionss).subscribe((data:any)=>{
  console.log(data);
  this.marksGot=parseFloat(Number(data.marksGot).toFixed(2));
  this.correctAnswers = data.correctAnswers;
  this.attempted = data.attempted;
  this.maxMarks=data.maxMarks;
  // this.preventBackButton();

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
  
  
  printPage(){
    document.title= this.username;
    window.print();
    this.removeResults();
    // this.preventBackButton();
  }
  
  saveDataInBrowser(): void{
    this._questions.getQuestionsOfQuizForText(this.qid).subscribe((data:any)=>{
      // console.log(data[0].answer);
      // localStorage.setItem('exams', JSON.stringify(data));;
      // console.log(data)
      // this.timer = this.questions.length * 2 * 60;
      // this.questions.forEach(q => {
      //   q['givenAnswer']="";
      // });
      // // localStorage.setItem('exam', JSON.stringify(data));
      // this.startTimer();
      // this.preventBackButton();
  
    },
    );
  }
  
  loadQuestionsFromLocalStorage(){
  this.questionss = JSON.parse(localStorage.getItem("exam"));
  this.timer = this.questionss.length * 2 * 60;
  this.questions.forEach(q => {
    q['givenAnswer']="";
  });
  // this.preventBackButton();
  // this.startTimer();
    console.log(this.questionss[0]);
  }
  };