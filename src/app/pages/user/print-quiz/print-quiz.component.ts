import { LocationStrategy } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
// import { Component , OnInit, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, Subject, Subscriber, Subscription } from 'rxjs';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { StartComponent } from '../start/start.component'; { }
import { Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import Swal from 'sweetalert2';
import { ReportServiceService } from 'src/app/services/report-service.service';
import { ChangeDetectorRef } from '@angular/core';
import { AnswerService } from 'src/app/services/answer.service';
interface QuestionResponse {
  quesO: string;
  question: string;
  studentAnswer: string;
  score: number;
  maxMarks: number;
  feedback: string;
  keyMissed: string[];
}
interface GroupedQuestions {
  prefix: string;
  questions: QuestionResponse[];
}

interface PrefixScores {
  prefix: string;
  totalScore: number;
  totalMaxMarks: number;
  percentage: number;
}


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
  marksGot = 0;
  maxMarks = 0;
  correct_answer = 0;
  attempted = 0;
  timer: any;
  isNavigating = false;
  showWatermark: boolean = false;
  second: number;
  minutes: number;
  count_timer: any;
  username: any;
  quiz
  reportData;
  sectionB: any[] = [];
  answeredQuestions: any[] = [];
  geminiResponse;
  groupedQuestions
  objectKeys = Object.keys;
  transformedData: any[];
  theoryAnswer: any[];
  value
  qId
  timeAllowed
   report;




  loadTimeFromLocalStorage() {
    const quizTimes = localStorage.getItem('totalTime');
    this.timeAllowed = quizTimes ? JSON.parse(quizTimes) : 0;
    this.cdr.detectChanges(); // Force UI update
  }

  constructor(private _quiz: QuizService,
    private cdr: ChangeDetectorRef,
    private locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _questions: QuestionService,
    private router: Router,
    private _report: ReportServiceService,
    private _answer: AnswerService
  ) { }

  refreshUser = new BehaviorSubject<Boolean>(true)

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
  }
  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event): void {
    this.preventBackButton();
  }

  ngOnInit(): void {
    this.qid = this._route.snapshot.params['qid'];
     this.getReportById();
    const userDetails = localStorage.getItem('user');
    const Object = JSON.parse(userDetails);
    this.username = Object.username;


    const quizTimes = localStorage.getItem('totalTime');
    this.timeAllowed = (JSON.parse(quizTimes)) * 1 / 60;
    // this.timeAllowed = Object.username;
    console.log(typeof (this.timeAllowed));
    console.log(localStorage.getItem('totalTime'));
    console.log(this.timeAllowed);
    this.loadTheoryAnswers();
    console.log(this.qid);

    this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {
      this.questionWithAnswers = data;
      console.log(data)
      console.log(this.questionWithAnswers);
      this.loadReport();
    },
      (error) => {
        console.log("Error Loading questions");
        Swal.fire("Error", "Error loading questionsssssaaa", "error");
      }
    );
    this.loadSubjective();
    // this.loadReport();


    console.log(this.qid);


    // this.refreshPage();
    this.refreshContent();
    this.loadQuestionsWithAnswers();

    // this.loadResults();
    this.loadQuestions();


    this.saveDataInBrowser();

    this.loadQuestionsFromLocalStorage();

    this.evalQuiz();
    // this.printQuiz();
    this.preventBackButton();

    // this.qid = this._route.snapshot.params['qid'];
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



  // LOAD ONLY SUBJECTIVE REPORTS
  getReportById(): void {
    this._report.getReportsByUserAndId(this.qid).subscribe({
      next: (data: any) => {
        this.report = data;
        console.log("This is the theory results ", this.report);
      },
      error: (error) => {
        console.error('Error loading reports:', error);

      }
    });
  }




  loadTheoryAnswers() {
    this._answer.getTheoryReport(this.qid).subscribe((answers: any) => {
      this.theoryAnswer = this.groupByPrefix(answers);

      // console.log("The total for each prefix is :", this.getTotalMarksByPrefix(this.theoryAnswer));

      // console.log("Grand score : ", this.getGrandTotalMarks());
      // console.log("helllllllllllllllllllllllllllll");
      // console.log(answers);
      // console.log(this.qid);
    })
  }


  loadSubjective() {
    const questions = localStorage.getItem(this.qid + "answeredQuestions");
    this.answeredQuestions = JSON.parse(questions);
    // console.log(this.answeredQuestions);
    // console.log(this.qid);
  }

  groupByPrefix(data: QuestionResponse[]): GroupedQuestions[] {
  // Handle edge cases
  if (!Array.isArray(data)) {
    throw new Error('Input must be an array');
  }
  if (data.length === 0) {
    return [];
  }

  // Initialize a map to group questions by prefix
  const prefixMap: Record<string, QuestionResponse[]> = {};

  // Iterate over each question response
  data.forEach((questionResponse) => {
    // Validate quesO exists
    if (!questionResponse.quesO) {
      console.warn('Question missing quesO:', questionResponse);
      return; // Skip this entry
    }

    // Extract prefix (e.g., "Q1" from "Q1a" or "Q3ai")
    const prefixMatch = questionResponse.quesO.match(/^(Q\d+)/i);
    const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : 'UNCATEGORIZED';

    // Initialize the group if it doesn't exist
    if (!prefixMap[prefix]) {
      prefixMap[prefix] = [];
    }

    // Add current question to its prefix group
    prefixMap[prefix].push(questionResponse);
  });

  // Convert map to array of grouped data
  return Object.entries(prefixMap).map(([prefix, questions]) => ({
    prefix,
    questions
  }));
}

getGrandTotalMarks(): number {
  if (!this.theoryAnswer || this.theoryAnswer.length === 0) {
    return 0;
  }
  return this.theoryAnswer.reduce((grandTotal, group) => {
    if (!group.questions || group.questions.length === 0) {
      return grandTotal;
    }
    // Sum scores for this group
    const groupTotal = group.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    return grandTotal + groupTotal;
  }, 0);
}




// getTotalMarksByPrefix(groupedData: { prefix: string; questions: QuestionResponse[] }[]): number {
//   if (!Array.isArray(groupedData) || groupedData.length === 0) {
//     return 0;
//   }
//   return groupedData.reduce((total, group) => {
//     if (!group.prefix || !Array.isArray(group.questions)) {
//       return total; // skip invalid groups
//     }
//     // Sum scores in this group and add to total
//     const groupTotal = group.questions.reduce((sum, q) => sum + (q.score || 0), 0);
//     return total + groupTotal;
//   }, 0);
// }


getTotalMarksForGroup(group: { prefix: string; questions: QuestionResponse[] }): number {
  if (!group || !Array.isArray(group.questions)) return 0;
  return group.questions.reduce((sum, q) => sum + (q.score || 0), 0);
}



  // SECTION B
  loadReport() {
    const userDetails = localStorage.getItem('user');
    const Object = JSON.parse(userDetails);
    this._report.getReport(Object.id, this.qid).subscribe((report) => {
      this.reportData = report;
      console.log(this.reportData[0].marks);
      console.log(this.reportData[0].progress);
      console.log(this.reportData[0].quiz.title);
      console.log(this.reportData[0].user.lastname);
      console.log(report);
    });
  }
  refreshContent() {
    // Use HttpClient to fetch updated content
    const userDetails = localStorage.getItem('user');
    const Object = JSON.parse(userDetails);
    this._report.getReport(Object.id, this.qid)
      .subscribe(
        (data: any) => {
          // Update the content of the element with the new data
          document.getElementById('marks').innerHTML = data;
        },
        error => console.error('Error fetching data:', error)
      );
  }

  removeResults() {
    localStorage.removeItem("MaxMarks");
    localStorage.removeItem("Attempted");
    localStorage.removeItem("CorrectAnswer");
    localStorage.removeItem("MarksGot");
  }



  loadQuestionsWithAnswers() {
    this.preventBackButton();
    // this.refreshOnload();
  }



  loadQuestions(): void {
    this.loadReport();
    this._questions.getQuestionsOfQuizForText(this.qid).subscribe((data: any) => {
      console.log(data[0].answer);
      console.log(data);
      this.questions = data.map((q, index) => {
        q.count = index + 1;
        return q;
      });
      console.log(data[0])
      this.timer = this.questions.length * 2 * 60;
      this.questions.forEach(q => {
        q['givenAnswer'] = "";
      });
      // this.preventBackButton();
      // this.preventRefresh();

    },
      (error) => {
        console.log("Error Loading questions");
        Swal.fire("Error", "Error loading questionwwwww", "error");
      }
    );
  }



  ///Custom Functions
  preventBackButton() {
    history.pushState(null, null, location.href);
    this.locationSt.onPopState(() => {
      history.pushState(null, null, location.href);
    });
  }


  printQuiz() {
    // this.loadResults();
    // this.loadReport();
    // this.router.navigate(['./print_quiz/' + this.qid]);

  }

  loadResults() {
    this.maxMarks = JSON.parse(localStorage.getItem("MaxMarks"));
    this.attempted = JSON.parse(localStorage.getItem("Attempted"));
    this.correct_answer = JSON.parse(localStorage.getItem("CorrectAnswer"));
    this.marksGot = JSON.parse(localStorage.getItem("MarksGot"));
    // this.page();
  }
  evalQuiz() {
    //Evaluate questions
    this._questions.evalQuiz(this.qid, this.questionss).subscribe((data: any) => {
      console.log(data);
      // this.result=data;
      this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
      this.correct_answer = data.correct_answer;
      this.attempted = data.attempted;
      this.maxMarks = data.maxMarks;
      // this.preventBackButton();
    },
      (error) => {
        console.log("Error !")
      }
    );
  }
  printPage() {
    document.title = this.username;
    window.print();
    // localStorage.removeItem(this.qid + "answeredQuestions");
    // localStorage.removeItem("answeredAIQuestions" + this.qid);
  }

  saveDataInBrowser(): void {
    this._questions.getQuestionsOfQuizForText(this.qid).subscribe((data: any) => {
    },
    );
  }

  loadQuestionsFromLocalStorage() {
    this.loadReport();
    this.loadResults();
    this.questionss = JSON.parse(localStorage.getItem("exam"));
    this.timer = this.questionss.length * 2 * 60;

    // this.timer = this.questionss.length * 2 * 60;

    this.questions.forEach(q => {
      q['givenAnswer'] = "";
    });
    // this.preventBackButton();
    // this.startTimer();
    console.log(this.questionss[0]);

  }
};