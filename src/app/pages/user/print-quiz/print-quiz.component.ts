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
  isPrintDisabled = false;
  geminiResponse;
  groupedQuestions
  objectKeys = Object.keys;
  transformedData: any[];

  value


  qId

  constructor(private _quiz: QuizService,
    private locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _questions: QuestionService,
    private router: Router,
    private _report: ReportServiceService
  ) { }

  refreshUser = new BehaviorSubject<Boolean>(true)

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    // this.loadResults();
    // event.preventDefault();
    // event.returnValue = '' as any; // This is required for some older browsers
  }
  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event): void {
    this.preventBackButton();
  }

  ngOnInit(): void {
    this.qid = this._route.snapshot.params['qid'];
   const userDetails = localStorage.getItem('user');
    const Object = JSON.parse(userDetails);
    this.username = Object.username;

    console.log(this.qid);

    this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {
      // this._questions.getQuestionsOfQuizForText(this.qid).subscribe((data:any)=>{ // this does the question shuffle on print
      // console.log(data[0].answer);
      // this.loadResults();
      this.questionWithAnswers = data;
      console.log(data)
      console.log(this.questionWithAnswers);
      this.loadReport();
      // this.attempted = JSON.parse(localStorage.getItem("Attempted"));
      // this.loadResults();

    },
      (error) => {
        console.log("Error Loading questions");
        Swal.fire("Error", "Error loading questionsssssaaa", "error");
      }
    );
    // this.qId =this._route.snapshot.params['qId'];
    // this.loadSubjective();
    this.loadSubjective();
    this.loadSubjectiveAIEval();
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

  // loadSubjective(){
  //   this._questions.getSubjective(this.qid).subscribe((theory:any)=>{
  //     console.log(theory);
  //     this.sectionB = theory;
  //        },
  //       (error)=>{
  //         console.log("Could not loading subjective from server");
  //       });

  loadSubjective() {
    const questions = localStorage.getItem( this.qid + "answeredQuestions");
    this.answeredQuestions = JSON.parse(questions);
    console.log(this.answeredQuestions);
    console.log(this.qid);
  }



  loadSubjectiveAIEval() {
    // const geminiResponse = localStorage.getItem("answeredAIQuestions");
    const geminiResponse = localStorage.getItem("answeredAIQuestions" + this.qid);
    // const data = geminiResponse.trim();
    console.log(geminiResponse);
    // const data = geminiResponse.replace("json\n", "");
    const data1 = JSON.parse(geminiResponse);
    this.geminiResponse = this.groupByPrefix(data1);
    this.transformedData = this.transformData(this.geminiResponse);

    // this.value = this.geminiResponse[0].questions


    this.value = this.transformedData[0].questions[0].key

    console.log('This is the geminiResponse groupedByPrefixes', this.geminiResponse);
    console.log("CHECKING ...")
  }

 

  groupByPrefix(data: string[]): { prefix: string, questions: string[] }[] {
    // Initialize a map to group questions by prefix
    const tempMap: { [prefix: string]: string[] } = {};
    // Iterate over the data array
    data.forEach((item) => {
        // Extract the prefix (e.g., "Q3" from "Q3a", "Q3ai", etc.)
        const prefixMatch = item.match(/Q\d+/);
        const prefix = prefixMatch ? prefixMatch[0] : 'Uncategorized';
        // Initialize the group if it doesn't exist
        if (!tempMap[prefix]) {
            tempMap[prefix] = [];
        }
        // Add the current item to the corresponding prefix group
        tempMap[prefix].push(item);
    });
    // Convert the tempMap to an array of grouped data
    const groupedData: { prefix: string, questions: string[] }[] = [];
    for (const [prefix, questions] of Object.entries(tempMap)) {
        groupedData.push({ prefix, questions });
    }
    return groupedData;
}



  // Function to calculate the grand total marks across all prefixes
  getGrandTotalMarks(): number {
    if (!this.transformedData || this.geminiResponse.length === 0) {
      return 0;
    }
    return this.geminiResponse.reduce((grandTotal, group) => {
      return grandTotal + this.getTotalMarksForPrefix(group.questions);
    }, 0);
  }

  // Function to calculate total marks for a given prefix (group)
  getTotalMarksForPrefix(questions: string[]): number {
    if (!questions || questions.length === 0) {
        return 0;
    }
    // Define a regex to extract marks in the format X/Y
    const marksRegex = /Marks:\s*(\d+)\/\d+/;
    // Reduce the questions array to calculate total marks
    return questions.reduce((total, question) => {
        // Attempt to match the regex to extract marks
        const match = question.match(marksRegex);
        if (match) {
            const marks = parseInt(match[1], 10); // Extract X as a number
            return total + marks; // Add to total
        }
        return total; // If no match, return current total
    }, 0);
}


getTotalMarksForPrefixs(questions: { key: string, question: string, Answer: string, Marks: string }[]): number {
  if (!questions || questions.length === 0) {
      return 0;
  }

  // Calculate the total marks
  return questions.reduce((total, question) => {
      // Extract the marks part (e.g., "1/3")
      const marksParts = question.Marks.split('/');
      if (marksParts.length === 2) {
          const marks = parseInt(marksParts[0], 10); // Extract the numerator as a number
          return total + marks; // Add to the total
      }
      return total; // If invalid marks format, return current total
  }, 0);
}















// TRANSFORM THE DATA BEFORE POPULATING IN THE HTML element
transformData(data: any[]): any[] {
  return data.map(group => ({
    prefix: group.prefix,
    questions: group.questions.map(questionText => {
      // Extract key and question text
      const questionMatch = questionText.match(/^(Q\d+[a-z]*(?:i{1,3})?):\s(.+?)\*\*,\sAnswer:\s"(.+?)"/);
      const key = questionMatch ? questionMatch[1] : 'Unknown';
      const question = questionMatch ? questionMatch[2] : 'Unknown';
      // Extract answer text
      const answerMatch = questionText.match(/Answer:\s"(.*?)"/);
      const answer = answerMatch ? answerMatch[1] : 'Unknown';
      // Extract marks
      const marksMatch = questionText.match(/Marks:\s(\d+\/\d+)/);
      const marks = marksMatch ? marksMatch[1] : 'Unknown';
      return {
        key,
        question,
        Answer: answer,
        Marks: marks
      };
    })
  }));
}







  // SECTION B
  getPrefixes(): string[] {
    const prefixes = new Set<string>();
    this.answeredQuestions.forEach(question => {
      const prefix = question.quesNo.match(/^Q\d+/)?.[0];
      if (prefix) {
        prefixes.add(prefix);
      }
    });
    return Array.from(prefixes);
  }


  getGroupedQuestions(prefix: string) {
    return this.answeredQuestions.filter(q => q.quesNo.startsWith(prefix));
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
    // this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {
    //   // this._questions.getQuestionsOfQuizForText(this.qid).subscribe((data:any)=>{ // this does the question shuffle on print
    //   // console.log(data[0].answer);
    //   // this.loadResults();
    //   this.questionWithAnswers = data;
    //   console.log(data)
    //   console.log(this.questionWithAnswers);
    //   // this.attempted = JSON.parse(localStorage.getItem("Attempted"));
    //   // this.loadResults();

    // },
    //   (error) => {
    //     console.log("Error Loading questions");
    //     Swal.fire("Error", "Error loading questionsssssaaa", "error");
    //   }
    // );
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
    localStorage.removeItem(this.qid + "answeredQuestions");
    localStorage.removeItem("answeredAIQuestions" + this.qid);

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