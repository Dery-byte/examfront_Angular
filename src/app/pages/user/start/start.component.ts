import { LocationStrategy } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, } from '@angular/router';
import { Question } from 'src/model testing/model';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizProgressService } from 'src/app/services/quiz-progress.service';
import { QuizAnswerRequest } from 'src/app/services/quiz-progress.service';
import { UserQuizAnswersResponse } from 'src/app/services/quiz-progress.service';
import { interval, Subscription } from 'rxjs';
import { Observable, forkJoin,of } from 'rxjs';
import { catchError } from 'rxjs/operators';



import Swal from 'sweetalert2';
import { ScreenshotPreventionService } from 'src/app/services/ScreenshotPreventionService ';
import { LoginComponent } from '../../login/login.component';

interface QuizAnswers {
  [prefix: string]: {
    [tqId: number]: string  // Answers within each prefix group
  }
}



interface QuestionResponse {
  questionNumber: string;
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



// =========================
interface Category {
  cid: number;
  level: string;
  title: string;
  description: string;
  courseCode: string;
}

interface Quiz {
  qId: number;
  title: string;
  description: string;
  maxMarks: string;
  quizTime: string;
  numberOfQuestions: string;
  active: boolean;
  attempted: boolean;
  quizpassword: string;
  category: Category;
}

// =============================

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  // BEGIN PAGINATION
  private readonly QUIZ_STORAGE_KEY = 'quiz_answers_by_prefix';

  title = "pagination";
  page: number = 1;
  count: number = 0;
  tableSize: number = 3;
  tableSizes: any = [3, 6, 9, 12];
  isLoading: boolean = true;



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
  correct_answer = 0;
  attempted: any;
  isSubmit = false;
  // timer: any;
  isNavigating = false;
  second: number;
  minutes: number;
  count_timer: any;
  timeT: number = 0;
  timerAll: number = 0;
  timeO: number = 0;
  quizTitle
  courseTitle
  quiz
  noOfQuesObject;
  // private countdownKey = 'countdown_timer';
  private intervalId: any;


  //  ============================SUBJECTIVE QUESTIONS=======================================
  questionT: Question[] = [];
  filteredQuestions: Question[] = [];
  itemsPerPage: number = 5;
  groupedQuestions: { [key: string]: Question[] } = {};
  prefixes: string[] = [];
  currentPage: number = 0;
  selectedQuestions: { [key: string]: boolean } = {}; // To track selected prefixes
  selectedPrefix: string;
  selectedQuestionsCount: number = 0;
  numberOfQuestionsToAnswer: number = 0;
  quizForm: FormGroup;
  selectedQuestionsAnswer = [];
  convertedJsonAPIResponsebody: any;



  //  sectionB;

  sectionB: any[] = [];
  question: Question[] = [];
  geminiResponse: any[] = [];
  geminiResponseAI
  sectionBMarks;
  theoryResults = {
    marksB: "",
    quiz: {
      qId: ""
    }
  }


  localStorageKey = 'quiz_answers';


  //  ============================SUBJECTIVE QUESTIONS=======================================

  initForm(): void {
    const formGroupConfig = {};
    this.questionT.forEach(question => {
      formGroupConfig[question.id] = ['', Validators.required];
    });
    this.quizForm = this.fb.group(formGroupConfig);
  }

  // get isSubmitDisabled(): boolean {
  //   return Object.keys(this.selectedQuestions).length !== this.numberOfQuestionsToAnswer;
  // }




  get isSubmitDisabled(): boolean {
    // Count selected groups
    const selectedCount = Object.values(this.selectedQuestions).filter(val => val === true).length;
    // Get compulsory groups
    const compulsoryGroups = this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
    // Check if all compulsory groups are selected
    const allCompulsorySelected = compulsoryGroups.every(prefix => this.selectedQuestions[prefix] === true);
    // Check if total selected equals required (including compulsory)
    const hasCorrectTotal = selectedCount === this.numberOfQuestionsToAnswer;
    // Disable if compulsory groups aren't selected OR wrong total count
    return !allCompulsorySelected || !hasCorrectTotal;
  }
  //  ============================SUBJECTIVE QUESTIONS=======================================






  constructor(private _quiz: QuizService,
    private fb: FormBuilder,
    private login: LoginService,
    private locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _snack: MatSnackBar,
    private _questions: QuestionService,
    private router: Router,
    private quiz_progress: QuizProgressService,
    private screenshotPrevention: ScreenshotPreventionService,

  ) {
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    // Custom code to be executed before the page is unloaded
    this.saveTimerToDatabase();
    // localStorage.setItem(this.countdownKey, JSON.stringify(this.timerAll));
    // console.log('countdownKey:', this.countdownKey);
    console.log('timerAll:', this.timerAll);

    console.log("Helllooooo...")
    // event.preventDefault();
    this.preventBackButton();


    event.returnValue = '' as any; // This is required for some older browsers
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event): void {
    this.preventBackButton();
  }



  //  ============================SUBJECTIVE QUESTIONS=======================================




  ngOnInit(): void {
    // this.screenshotPrevention.enableProtection();
    this.isLoading = true; // Set loading to true when starting
    this.qid = this._route.snapshot.params['qid'];
    console.log(this.qid)
    // this.qid = this._route.snapshot.params['qid'];
    this._quiz.getQuiz(this.qid).subscribe((data: any) => {
      console.log(data.title);
      this.quiz = data;
      this.courseTitle = this.quiz.category.title;


      console.log(this.quiz);
      console.log(this.quiz.quizTime)


      this.timeO = this.quiz.quizTime * 1;
      this.timerAll = (this.timeT + this.timeO) * 60;

      console.log(this.timerAll);
      console.log(this.timeO * 60);

      // return this.timeO = parseInt(this.quiz.quizTime);
    },
      (error) => {
        this.isLoading = false;
        this._snack.open("You're Session has expired! ", "", {
          duration: 3000,
        });
        this.login.logout();
        console.log("error !!");
        // alert("Error loading quiz data")
      }
    );

    this.loadQuestions();



    this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe((data: any) => {
      this.numberOfQuestionsToAnswer = data[0].totalQuestToAnswer;
      console.log("This is for number of questions to answer", data[0].timeAllowed);
      console.log("Number question to answer ", data[0].totalQuestToAnswer);
      this.quizTitle = data[0].quiz.title;
      this.courseTitle = data[0].quiz.category.title;




      // this.timerAll = (this.timeT + this.timeO) * 60;

      // this.timeT = data[0].timeAllowed;
      // this.timerAll = (this.timeT + this.timeO) * 60;




      console.log("This is time for the theory questions", this.timeT);
      console.log("This is the time for the Objectives", this.timeO);
      console.log(" Both time for theory and objectives", this.timerAll)



      this.loadTheory();
      // this.loadSavedAnswers();
      // this.loadSubjective();

      // this.numberOfQuestionsToAnswer = this.noOfQuesObject[0].totalQuestToAnswer;
      this.timeT = data[0].timeAllowed;
      console.log("This is the number of questions to answer", this.numberOfQuestionsToAnswer);
      console.log("This is the time for the Theory ", this.timeT);


      // let timerString = localStorage.getItem('countdown_timer');
      // const timerNumber = parseInt(timerString, 10);
      // console.log(typeof (timerNumber));

      // if (timerNumber) {
      //   this.timerAll = timerNumber;
      //   console.log("The remaining time is ", this.timerAll);
      //   console.log("The remaining time from the localStorage ", timerString);
      //   console.log("This is remaining Theory timer", this.timeT);
      //   console.log("This is remaining Theory timer", this.timeO);
      //   //Remove value from local storage after accessing it.
      //   localStorage.removeItem("countdown_timer");
      // } else {
      //   // this.timer = this.questions.length * 2 * 60;
      //   // this.timerAll = (this.quiz.quizTime * 60);
      //   this.timerAll = (this.timeT + this.timeO) * 60;
      //   // this.timerAll = (this.questions.length * 2 * 60) + this.timeT;
      //   localStorage.setItem('totalTime', JSON.stringify(this.timerAll));

      // }

      // this.initializeTimer();
      this.startAutoSave(); // Auto-save timer every 10 seconds


    },
      (error) => {
        this.isLoading = false;


      });

    // console.log(this.timerAll);




    // this.loadQuestionsFromLocalStorage();

    // this.startTimer();
    // this.printQuiz();
    // this.startTimer();

    this.initForm();
    this.preventBackButton();


    // this.screenshotPrevention.enableProtection();

  }




  totalTime(): number {
    const timeT = Number(this.timeT) || 0;
    const quizTime = Number(this.quiz.quizTime) || 0;
    return timeT + quizTime;
  }

  // loadNumQuesToAnswer() {
  //   this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe((data: any) => {
  //     console.log(data.totalQuestToAnswer);
  //     this.numberOfQuestionsToAnswer = data;
  //   });
  // }


  //  ============================SUBJECTIVE QUESTIONS=======================================
  loadTheory() {
    this._questions.getSubjective(this.qid).subscribe((theory: any) => {
      console.log(theory);
      // this.sectionB = theory;
      this.groupedQuestions = this.getQuestionsGroupedByPrefix(theory);

      // Sort prefixes: compulsory groups first
      this.prefixes = this.sortPrefixesByCompulsory(this.groupedQuestions);
      this.compulsoryPrefixes = this.getCompulsoryPrefixes();


      // this.prefixes = Object.keys(this.groupedQuestions).sort();

      this.loadQuestionsTheory();

      console.log(this.groupedQuestions);
      // this.startTimer();
      // this.startCountdown();
      // this.initializeTimer();
      this.preventBackButton();


      // Only set loading to false if this is the last API call
      if (!this.isLoading) {
        this.isLoading = false;
      }

    },
      (error) => {
        console.log("Could not load data from server");
        this.isLoading = false;
      });
  }

  getCompulsoryPrefixes(): string[] {
    return this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
  }





  // Check if current page/group is compulsory
  isCurrentGroupCompulsory(): boolean {
    if (!this.currentQuestions || this.currentQuestions.length === 0) {
      return false;
    }
    return this.currentQuestions.every(q => q.isCompulsory);
  }



  // Check if a specific group is compulsory
  isGroupCompulsory(prefix: string): boolean {
    const questions = this.groupedQuestions[prefix];
    if (!questions || questions.length === 0) {
      return false;
    }
    return questions.every((q: any) => q.isCompulsory);
  }

  sortPrefixesByCompulsory(groupedQuestions: any): string[] {
    const prefixes = Object.keys(groupedQuestions);

    return prefixes.sort((prefixA, prefixB) => {
      const questionsA = groupedQuestions[prefixA];
      const questionsB = groupedQuestions[prefixB];

      // Check if all questions in group A are compulsory
      const isGroupACompulsory = questionsA.every((q: any) => q.isCompulsory);

      // Check if all questions in group B are compulsory
      const isGroupBCompulsory = questionsB.every((q: any) => q.isCompulsory);

      // Compulsory groups come first
      if (isGroupACompulsory && !isGroupBCompulsory) return -1;
      if (!isGroupACompulsory && isGroupBCompulsory) return 1;

      // If both are compulsory or both are not, sort alphabetically/numerically
      return prefixA.localeCompare(prefixB, undefined, { numeric: true });
    });
  }



  getQuestionsGroupedByPrefix(questions) {
    return questions.reduce((acc, question) => {
      const prefix = question.quesNo.match(/^[A-Za-z]+[0-9]+/)[0];
      if (!acc[prefix]) {
        acc[prefix] = [];
      }
      acc[prefix].push(question);
      return acc;
    }, {});
  }





  //  ============================SUBJECTIVE QUESTIONS=======================================
  // get currentQuestions(): Question[] {
  //   return this.groupedQuestions[this.prefixes[this.currentPage]];
  // }


  // get currentQuestions(): Question[] {
  //   const questions = this.groupedQuestions[this.prefixes[this.currentPage]] || [];
  //   return questions.map(question => ({ ...question }));
  // }



  // get currentQuestions(): Question[] {
  //   const key = this.prefixes[this.currentPage];
  //   // this.loadSavedAnswers();
  //   return this.groupedQuestions[key] || [];  // Returns Question[] or empty array
  // }
  public currentQuestions: Question[] = [];
  compulsoryPrefixes: string[] = [];


  loadQuestionsTheory(): void {
    // Auto-select compulsory groups
    this.prefixes.forEach(prefix => {
      if (this.isGroupCompulsory(prefix)) {
        this.selectedQuestions[prefix] = true;
      }
    });
    const key = this.prefixes[this.currentPage];
    this.currentQuestions = this.groupedQuestions[key] || [];
    this.loadAnswers(); // load into currentQuestions
  }








  // Prevent deselection of compulsory groups
  togglePrefixSelection(prefix: string): void {
    // Prevent deselection of compulsory groups
    if (this.isGroupCompulsory(prefix)) {
      this.selectedQuestions[prefix] = true;
      alert(`${prefix} contains compulsory questions and cannot be deselected.`);
      return;
    }
    // Toggle for non-compulsory groups
    this.selectedQuestions[prefix] = !this.selectedQuestions[prefix];
    console.log('After toggle:', this.selectedQuestions);
  }
  // disableOtherSelection(){
  //   Object.keys(this.selectedQuestions).length = this.numberOfQuestionsToAnswer
  // }

  onPrefixChange(prefix: string) {
    this.selectedPrefix = prefix;
  }



  nextPage() {
    this.saveAnswers(); // save answers BEFORE changing the page
    if (this.currentPage < this.prefixes.length - 1) {
      this.currentPage++;
      this.loadQuestionsTheory(); // make sure this sets currentQuestions
    }
  }




  prevPage() {
    this.saveAnswers(); // save before page change
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadQuestionsTheory();
    }
  }


  onQuestionSelect(question: Question) {
    if (question.selected) {
      question.selected = false;
      this.selectedQuestionsCount--;
    } else {
      if (this.selectedQuestionsCount < 2) {
        question.selected = true;
        this.selectedQuestionsCount++;
      } else {
        alert('You can only select 2 questions.');
      }
    }
  }
  //  ============================SUBJECTIVE QUESTIONS=======================================




  loadQuestionsWithAnswers() {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {
      this.questionWithAnswers = data;
      console.log(data)
      console.log(this.questionWithAnswers);
    },
      (error) => {
        console.log("Error Loading questions");
        Swal.fire("Error", "Error loading questions with answers", "error");
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
      title: "Do you want to submit the quiz?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel"
    }).then((e) => {
      if (e.isConfirmed) {

        // Show the loading spinner
        this.clearSavedAnswers();
        Swal.fire({
          title: 'Evaluating...',
          text: `Please wait while we evaluate your quiz for "${this.courseTitle}".`,
          // text: `Your results for "${this.courseTitle}" is available for print on the dashboard.`,

          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Run all your logic after a short delay or immediately
        setTimeout(() => {
          this.evalQuiz();
          this.waitNavigateFunction();
          this.loadQuestionsWithAnswers();
          this.clearProgress()
          // this.evalSubjective();
          this.preventBackButton();

          // Optional: Close the spinner and show success message
          Swal.fire({
            icon: 'success',
            title: 'Evaluated!',
            text: `Your results for "${this.courseTitle}" is available for print on the dashboard.`,
            timer: 1000,        // ⬅ auto-close after 1.2 seconds
            showConfirmButton: false
          });
          setTimeout(() => {
            window.close();
            if (window.opener) {
              window.opener.location.href = '/user-dashboard/0';
            }
          }, 1200); // wait slightly longer than success popup duration

        }, 3000); // You can remove this delay or wait for async logic instead
      }
    });

    // window.close();
  }


  clearProgress() {
    this.quiz_progress.clearQuizAnswers(this.qid).subscribe((data: any) => {
      console.log("Quiz Progress has been cleared!!")
    },
      (error) => {
        console.log("Error clraring quiz progress");
      }
    );
  }


  async submitAllQuiz() {
    Swal.fire({
      title: "Do you want to submit the quiz?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel"
    }).then((e) => {
      if (e.isConfirmed) {
        // Show the loading spinner
        this.clearSavedAnswers();
        Swal.fire({
          title: 'Evaluating...',
          text: `Please wait while we evaluate your quiz for ${this.courseTitle}.`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Run all your logic after a short delay or immediately
        setTimeout(async () => {
          this.evalQuiz();
          this.waitNavigateFunction();
          this.loadQuestionsWithAnswers();
          await this.evalSubjective();            // ✅ Wait here
          this.clearProgress()
          this.preventBackButton();

          // Optional: Close the spinner and show success message
          Swal.fire({
            icon: 'success',
            title: 'Evaluated!',
            text: `Your results for ${this.courseTitle} is available for print on the dashboard.`,
          });
          setTimeout(() => {
            window.close();
            if (window.opener) {
              window.opener.location.href = '/user-dashboard/0';
            }
          }, 1200); // wait slightly longer than success popup duration

        }, 8000); // You can remove this delay or wait for async logic instead
      }
    });

  }

  waitNavigateFunction() {
    setTimeout(() => {
      this.printQuiz();
    }, 3000); // 3000 milliseconds = 3 seconds delay
  }

  printQuiz() {
    this.router.navigate(['./user-dashboard/0']);
  }

  // startTimer() {
  //   this.timerAll = this.totalTime() * 60;
  //   let t = window.setInterval(async () => {
  //     if (this.timerAll <= 0) {
  //       this.evalQuiz();
  //       this.waitNavigateFunction();
  //       this.loadQuestionsWithAnswers();
  //       await this.evalSubjective();
  //       this.preventBackButton();
  //       clearInterval(t);
  //     } else {
  //       this.timerAll--; // ✅ ticks every second
  //     }
  //   }, 1000);
  // }

  
  // DISABLE PASTE


  disablePaste(event: ClipboardEvent): void {
    event.preventDefault();
  }


  getFormmatedTime(): string {
    const hr = Math.floor(this.timerAll / 3600);
    const mm = Math.floor((this.timerAll % 3600) / 60);
    const ss = this.timerAll % 60;

    let formattedTime = '';
    if (hr > 0) {
      formattedTime += `${hr} hr(s) : `;
    }
    formattedTime += `${mm} min : ${ss} sec`;
    return formattedTime;
  }





evalQuiz(): Observable<any> {
  return new Observable(observer => {
    this._questions.evalQuiz(this.qid, this.questions).subscribe({
      next: (data: any) => {
        console.log(this.questions, data);
        this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
        this.correct_answer = data.correct_answer;
        this.attempted = data.attempted;
        this.maxMarks = data.maxMarks;

        localStorage.setItem('CorrectAnswer', JSON.stringify(this.correct_answer));
        localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
        localStorage.setItem('Attempted', JSON.stringify(this.attempted));
        localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks));

        this.clearSavedAnswers();
        this.preventBackButton();
        this.isSubmit = true;

        observer.next(data);
        observer.complete();
      },
      error: (err) => {
        console.error('Evaluation Error', err);
        observer.error(err);
      }
    });
  });
}

  // evalQuiz(){
  //   //Evaluate questions
  //    this._questions.evalQuiz(this.qid, this.questions).subscribe((data: any) => {
  //     console.log(this.questions);
  //     console.log(data);
  //     this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
  //     this.correct_answer = data.correct_answer;
  //     this.attempted = data.attempted;
  //     this.maxMarks = data.maxMarks;
  //     localStorage.setItem('CorrectAnswer', JSON.stringify(this.correct_answer));
  //     localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
  //     localStorage.setItem('Attempted', JSON.stringify(this.attempted));
  //     localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks));
  //     this.clearSavedAnswers();
  //     // this.addSectBMarks();
  //     this.preventBackButton();
  //     // this.evalSubjective();
  //     this.isSubmit = true;
     
  //   },
  //     (error) => {
  //       console.log("Error !")

  //     }

  //   );

  // }








  // async evalSubjective(): Promise<void> {
  //   for (const prefix in this.selectedQuestions) {
  //     this.selectedQuestionsAnswer.push(...this.groupedQuestions[prefix]);
  //   }
  //   if (Object.keys(this.selectedQuestions).length === this.numberOfQuestionsToAnswer) {
  //     localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestions));
  //     this.convertJson();

  //     this._quiz.evalTheory(this.convertedJsonAPIResponsebody).subscribe((data: any) => {
  //       console.log("This is the Original Response from the server and formatted!!!!");

  //       // Store the response only once
  //       this.geminiResponse = data;
  //       localStorage.setItem("answeredAIQuestions" + this.qid, JSON.stringify(this.geminiResponse));

  //       console.log('Stored successfully:', localStorage.getItem("answeredAIQuestions" + this.qid));
  //       console.log(this.geminiResponse);

  //       setTimeout(() => {
  //         this.loadSubjectiveAIEval();
  //       }, 1000);
  //     });

  //     localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestionsAnswer));
  //   }
  //   (error) => {
  //     this._snack.open("Please select exactly 3 sets of questions to submit", "", {
  //       duration: 3000,
  //     });
  //   }
  //   // window.close();

  // }




  evalSubjective(): Observable<any> {
  return new Observable(observer => {
    for (const prefix in this.selectedQuestions) {
      this.selectedQuestionsAnswer.push(...this.groupedQuestions[prefix]);
    }
    if (Object.keys(this.selectedQuestions).length !== this.numberOfQuestionsToAnswer) {
      this._snack.open("Please select exactly 3 sets of questions to submit", "", {
        duration: 3000,
      });
      observer.error('Not enough questions selected');
      return;
    }

    // Save to localStorage
    localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestions));
    this.convertJson();
    this._quiz.evalTheory(this.convertedJsonAPIResponsebody).subscribe({
      next: (data: any) => {
        console.log("Server Response:", data);
        this.geminiResponse = data;
        localStorage.setItem("answeredAIQuestions" + this.qid, JSON.stringify(this.geminiResponse));

        setTimeout(() => {
          this.loadSubjectiveAIEval();
        }, 1000);

        // localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestionsAnswer));

        observer.next(data);
        observer.complete();
      },
      error: (err) => {
        console.error("Subjective evaluation failed", err);
        observer.error(err);
      }
    });
  });
}









  // WORKING ON THE BELOW

  loadSubjectiveAIEval() {
    // const geminiResponse = localStorage.getItem("answeredAIQuestions");
    const geminiResponse = localStorage.getItem("answeredAIQuestions" + this.qid);
    // const data = geminiResponse.trim();
    console.log(geminiResponse);
    // const data = geminiResponse.replace("json\n", "");
    // const data1 = JSON.parse(data);
    this.geminiResponseAI = this.groupByPrefix(this.geminiResponse);
    console.log('This is the geminiResponse groupedByPrefixes', this.geminiResponseAI);
    console.log("CHECKING ...")
    this.getScoresForPrefixes(this.geminiResponseAI);
    this.getGrandTotalMarks();
    // this.triggerAddSectBMarks();
    this.addSectBMarks();
  }



  getTotalMarksForPrefix(questions: any[]): number {
    if (!questions || questions.length === 0) {
      return 0;
    }

    return questions.reduce((total, question) => {
      return total + (question.score || 0);
    }, 0);
  }


  //grouped by prefixDEEPSEEK=========
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
      // Validate the question number exists
      if (!questionResponse.questionNumber) {
        console.warn('Question missing questionNumber:', questionResponse);
        return; // Skip this entry
      }

      // Extract the prefix (e.g., "Q1" from "Q1a" or "Q3ai")
      const prefixMatch = questionResponse.questionNumber.match(/^(Q\d+)/i);
      const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : 'UNCATEGORIZED';

      // Initialize the group if it doesn't exist
      if (!prefixMap[prefix]) {
        prefixMap[prefix] = [];
      }
      // Add the current question to its prefix group
      prefixMap[prefix].push(questionResponse);
    });

    // Convert the map to an array of grouped data
    return Object.entries(prefixMap).map(([prefix, questions]) => ({
      prefix,
      questions
    }));
  }






  // WORKING ON ABOVE
  // Function to calculate the grand total marks across all prefixes
  getGrandTotalMarks(): number {
    this.sectionBMarks = 0;

    if (!this.geminiResponseAI || this.geminiResponseAI.length === 0) {
      return 0;
    }

    this.sectionBMarks = this.geminiResponseAI.reduce((grandTotal, group) => {
      const prefixScores = this.getScoresForPrefixes([group]);
      const groupTotal = prefixScores.reduce((sum, p) => sum + p.totalScore, 0);
      return grandTotal + groupTotal;
    }, 0);

    console.log("Grand Total Marks: ", this.sectionBMarks);
    return this.sectionBMarks;
  }




  addSectBMarks() {
    this.theoryResults = {
      marksB: this.sectionBMarks,
      quiz: {
        qId: this.qid
      }
    }

    console.log(this.theoryResults);

    console.log(this.theoryResults.marksB);
    console.log(this.theoryResults.quiz.qId);

    this._quiz.addSectionBMarks(this.theoryResults).subscribe(
      (data) => {
        console.log("Marks sucessfull");
      },
      (error) => {
        // Swal.fire("Error !! ", "An error occurred while adding quiz", "error");

        console.log("Unsuccessfull");
      }
    );
  }

  getScoresForPrefixes(groupedData: GroupedQuestions[]): PrefixScores[] {
    return groupedData.map(group => {
      const { prefix, questions } = group;

      // Ensure questions is a valid array
      const safeQuestions = Array.isArray(questions) ? questions : [];

      const totalScore = safeQuestions.reduce((sum, q) => sum + q.score, 0);
      const totalMaxMarks = safeQuestions.reduce((sum, q) => sum + q.maxMarks, 0);
      const percentage = totalMaxMarks > 0
        ? Math.round((totalScore / totalMaxMarks) * 100)
        : 0;

      console.log("Total Marks for Prefix: ", totalScore, totalMaxMarks);

      return {
        prefix,
        totalScore,
        totalMaxMarks,
        percentage
      };
    });
  }


  // SECTION B
  getPrefixes(): string[] {
    const prefixes = new Set<string>();
    this.selectedQuestionsAnswer.forEach(question => {
      const prefix = question.quesNo.match(/^Q\d+/)?.[0];
      if (prefix) {
        prefixes.add(prefix);
      }
    });
    return Array.from(prefixes);
  }



  getGroupedQuestions(prefix: string) {
    return this.selectedQuestionsAnswer.filter(q => q.quesNo.startsWith(prefix));
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
  // loadQuestionsFromLocalStorage() {
  //   // // this.questionss = JSON.parse(localStorage.getItem("exam"));
  //   // // this.timeO = parseInt(this.quiz.quizTime) * 60;
  //   // this.timerAll
  //   // // this.timeO = parseInt(this.questionss[0].quiz.category.quizTime) * 1 * 60;
  //   // // this.timer = this.questionss.length * 2 * 60; // THIS WORKS FINE
  //   // // localStorage.setItem('time', JSON.stringify(this.timeO));
  //   // this.questions.forEach(q => {
  //   //   q['givenAnswer'] = "";
  //   // });
  //   // // localStorage.setItem('exam', JSON.stringify(data));
  //   // // this.preventBackButton();
  //   // this.startTimer();
  //   // console.log(this.questionss[0]);
  // }

  //PAGINATION

  onTableDataChange(event: any) {
    this.page = event;
    // this.loadQuestionsFromLocalStorage();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    // this.loadQuestionsFromLocalStorage();
  }

  //CONVERT TO API RESPONSE
  // Method to convert JSON data
  convertJson() {
    this.convertedJsonAPIResponsebody = {
      contents: [
        {
          parts: this.selectedQuestionsAnswer.map(item => {
            // Extract fields from each item

            const quizId = item.quiz.qId;
            const quesId = item.tqId;
            const questionNo = item.quesNo;
            const question = item.question;
            const answer = item.givenAnswer ? item.givenAnswer : ''; // Assume empty if null
            const marks = item.marks ? item.marks.split(' ')[0] : ''; // Extracting the numeric part
            let criteri = '';
            let criteria = 'Evaluate based on clarity, completeness, and accuracy';

            // Create the text format
            const text = `quizId ${quizId}: tqid ${quesId}: Question Number ${questionNo}: ${question}. Answer: ${answer}. Marks: ${marks} Criteria:${criteria}.`;

            return { text: text };
          })
        }
      ]
    };

    console.log(this.convertedJsonAPIResponsebody);
    // console.log(JSON.stringify(this.convertedJsonAPIResponsebody, null, 2));
    return this.convertedJsonAPIResponsebody;
  }


  //END OF CONVERT TO API RESPONSE





































  //PESISTING THEORY EVEN ON PAGE REFRESH



  // Clear all answers for current quiz
  clearSavedAnswers(): void {
    this.quiz_progress.clearAnswers(this.qid).subscribe({
      next: (response) => {
        console.log(response.message);
        // Clear UI
        this.currentQuestions.forEach((q: any) => {
          q.givenAnswer = '';
        })
      },
      error: (error) => {
        console.error('Error clearing answers:', error);
      }
    });
  }




































































  //PESISTING OBJ EVEN ON PAGE REFRESH



  loadQuestions(): void {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe(
      (data: any) => {
        // Get all stored answers from localStorage
        const storedAnswers = JSON.parse(localStorage.getItem('selectedAnswers') || '{}');
        this.loadSavedAnswers();

        this.questions = data.map((q, index) => {
          // Add count property for display purposes
          q.count = index + 1;

          // Restore givenAnswer from localStorage if available
          if (storedAnswers[q.quesId]) {
            q.givenAnswer = [...storedAnswers[q.quesId]]; // Create a fresh copy
          } else {
            q.givenAnswer = []; // Initialize empty array if no saved answers
          }

          // 🔍 Debugging Logs
          console.log(`📥 Question ID: ${q.quesId}, Restored Answers:`, q.givenAnswer);

          return q;
        });

        // Set loading to false when questions are loaded
        this.isLoading = false;
        // 🔍 Final questions array check
        console.log("✅ Final loaded questions:", this.questions);
        // this.startTimer();

        // this.startCountdown();
        this.initializeTimer();
      },
      (error) => {
        console.log("Error Loading questions");
        // Set loading to false when questions are loaded
        this.isLoading = false;
        Swal.fire("Error", "Error loading questions", "error");
      }
    );

    this.preventBackButton();
  }





  updateSelectedAnswers(q: any, option: string, isChecked: boolean) {
    // Update local state immediately for responsive UI
    if (!q.givenAnswer) {
      q.givenAnswer = [];
    }

    if (isChecked) {
      if (!q.givenAnswer.includes(option)) {
        q.givenAnswer.push(option);
      }
    } else {
      const index = q.givenAnswer.indexOf(option);
      if (index !== -1) {
        q.givenAnswer.splice(index, 1);
      }
    }
    // Create a copy to avoid reference issues
    const currentAnswers = [...q.givenAnswer];

    // Save to database
    const request: QuizAnswerRequest = {
      questionId: q.quesId,
      option: option,
      checked: isChecked,
      quizId: this.qid
    };
    this.quiz_progress.updateAnswer(request).subscribe({
      next: (response) => {
        if (response.selectedOptions && Array.isArray(response.selectedOptions)) {
          console.log("Server returned:", response.selectedOptions);
          console.log("Local state:", currentAnswers);
        }
      },
      error: (error) => {
        console.error("❌ Error saving answer:", error);
        // Revert local changes on error
        q.givenAnswer = currentAnswers;
      }
    });

    return q.givenAnswer;
  }



  loadSavedAnswers() {
    // Load all saved answers for this quiz
    this.quiz_progress.getAnswersByQuiz(this.qid).subscribe({
      next: (response: UserQuizAnswersResponse) => {
        console.log("📥 Loaded saved answers:", response);

        // Map saved answers to questions
        this.questions.forEach((q: any) => {
          // Check if this question has saved answers
          if (response.answers && response.answers[q.quesId]) {
            q.givenAnswer = response.answers[q.quesId]; // Get array of selected options
          } else {
            q.givenAnswer = []; // Initialize empty array
          }
        });

        console.log("✅ Questions with answers:", this.questions);
      },
      error: (error) => {
        console.error("❌ Error loading saved answers:", error);
        // Initialize all questions with empty arrays
        this.questions.forEach((q: any) => {
          q.givenAnswer = [];
        });
      }
    });
  }





  // SAVING THE THEORY ANSWERS FOR LATER LOAD

  saveAnswers(): void {
    const answersToSave = this.currentQuestions.map((q: any) => ({
      quesNo: q.quesNo,
      givenAnswer: q.givenAnswer || ''
    }));
    this.quiz_progress.saveAnswers(this.qid, answersToSave).subscribe({
      next: (response) => {
        console.log('Answers saved to backend successfully');
      },
      error: (error) => {
        console.error('Error saving answers:', error);
      }
    });
  }

  // Load answers when component initializes
  loadAnswers(): void {
    this.quiz_progress.loadAnswers(this.qid).subscribe({
      next: (savedAnswers) => {
        // Merge loaded answers with current questions
        this.currentQuestions.forEach((q: any) => {
          const saved = savedAnswers.find((s: any) => s.quesNo === q.quesNo);
          if (saved) {
            q.givenAnswer = saved.givenAnswer;
          }
        });
      },
      error: (error) => {
        console.error('Error loading answers:', error);
      }
    });
  }






  // PREVENT EVERY ACTION ON THE FORM TAG TAG

  preventAction(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Optional: Show a warning message to the user
    this.showWarningMessage('Copy/Paste operations are disabled during the exam');

    return;
  }

  // Optional: Show warning message
  private showWarningMessage(message: string): void {
    // You can use Angular Material Snackbar or a simple alert
    console.warn(message);
    // Or implement a toast/snackbar notification
  }

  // Remove the disablePaste() method from ngModelChange since we're handling it with events


























  // DATABASE TIMER LOGIC

  initializeTimer(): void {
  this.quiz_progress.getQuizTimer(this.qid).subscribe({
    next: (savedTimer) => {
      this.timerAll = (savedTimer?.remainingTime && savedTimer.remainingTime > 0)
        ? savedTimer.remainingTime
        : (this.timeT + this.timeO) * 60;

      if (!savedTimer || savedTimer.remainingTime <= 0) {
        this.saveTimerToDatabase(); // first-time save
      }

      this.isTimerLoaded = true;
      this.startCountdown();
    },
    error: () => {
      // Hard fallback
      this.timerAll = (this.timeT + this.timeO) * 60;
      this.isTimerLoaded = true;
      this.startCountdown();
    }
  });
}

showTimeUpModal = false;
private isExpiredHandled = false;
countdownText = '';
progressPercent = 100;
private audio = new Audio('/assets/beep.mp3'); // short beep sound


private onTimerExpired(): void {
  if (this.isExpiredHandled) return;
  this.isExpiredHandled = true;

  this.timerSubscription?.unsubscribe();
  this.timerAll = 0;
  this.saveTimerToDatabase();
  this.showTimeUpModal = true;

  const total = 5;
  let count = total;
  this.countdownText = count.toString();
  this.progressPercent = 100;

  const interval = setInterval(() => {
    count--;
    this.progressPercent = (count / total) * 100;

    if (count > 0) {
      this.countdownText = count.toString();
      if (count <= 3) {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {});
      }
    } else {
      clearInterval(interval);
      this.countdownText = 'Submitting...';
      this.progressPercent = 0;

    setTimeout(() => {
  // Collect only existing evaluations
  const observables: Observable<any>[] = [];

  if (this.evalQuiz) {
    observables.push(this.evalQuiz());
  }
  if (this.evalSubjective) {
    observables.push(this.evalSubjective());
  }

  if (observables.length === 0) {
    // No evaluations for this quiz, just finish
    this.finishAfterEvaluation();
    return;
  }

  forkJoin(
    observables.map(obs =>
      obs.pipe(
        catchError(err => {
          console.error('One evaluation failed:', err);
          return of(null); // allow forkJoin to continue even if this observable fails
        })
      )
    )
  ).subscribe({
    next: () => {
      console.log('All evaluations (that exist) completed');
      this.finishAfterEvaluation();
    },
    error: (err) => {
      // This block almost never runs now
      console.error('Unexpected error in evaluation', err);
      this.finishAfterEvaluation();
    }
  });
}, 700);

    }
  }, 1000);
}

// Centralized finish logic
private finishAfterEvaluation() {
  this.showTimeUpModal = false;
  this.preventBackButton();
  if (window.opener) {
    window.opener.location.href = '/user-dashboard/0';
  }
  window.close();
}


  private saveTimerToDatabase(): void {
    // const quizId = this.quiz.id;
    this.quiz_progress.saveQuizTimer(this.qid, this.timerAll).subscribe({
      next: (response) => {
        console.log('Timer saved successfully:', response);
      },
      error: (error) => {
        console.error('Failed to save timer:', error);
      }
    });
  }


  private startCountdown(): void {
  // Safety: prevent multiple timers
  this.timerSubscription?.unsubscribe();

  this.timerSubscription = interval(1000).subscribe(() => {
    this.timerAll--;

    // OPTIONAL: persist every 10 seconds
    if (this.timerAll % 10 === 0) {
      this.saveTimerToDatabase();
    }

    if (this.timerAll <= 0) {
      this.onTimerExpired();
    }
  });
}






  private timerSubscription: Subscription;
  private autoSaveSubscription: Subscription;
  private isTimerLoaded: boolean = false;

  ngOnDestroy(): void {
    // Save timer before leaving the page
    if (this.isTimerLoaded && this.timerAll > 0) {
      this.saveTimerToDatabase();
    }

    // Clean up subscriptions
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
  }


  private startAutoSave(): void {
    this.autoSaveSubscription = interval(10000).subscribe(() => {
      if (this.isTimerLoaded && this.timerAll > 0) {
        this.saveTimerToDatabase();
      }
    });
  }

}




















