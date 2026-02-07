// import { LocationStrategy } from '@angular/common';
// import { Component, OnInit, HostListener } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { QuestionService } from 'src/app/services/question.service';
// import { QuizService } from 'src/app/services/quiz.service';
// import { Router, } from '@angular/router';
// import { Question } from 'src/model testing/model';
// import { FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { LoginService } from 'src/app/services/login.service';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { QuizProgressService } from 'src/app/services/quiz-progress.service';
// import { QuizAnswerRequest } from 'src/app/services/quiz-progress.service';
// import { UserQuizAnswersResponse } from 'src/app/services/quiz-progress.service';
// import { interval, Subscription } from 'rxjs';
// import { Observable, forkJoin, of } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import Swal from 'sweetalert2';
// import { ScreenshotPreventionService } from 'src/app/services/ScreenshotPreventionService ';
// import { LoginComponent } from '../../login/login.component';

// import { QuizProtectionService,ViolationAction,ExamMode,QuizProtectionState } from 'src/app/services/QuizProtectionService ';

// interface QuizAnswers {
//   [prefix: string]: {
//     [tqId: number]: string  // Answers within each prefix group
//   }
// }



// interface QuestionResponse {
//   questionNumber: string;
//   question: string;
//   studentAnswer: string;
//   score: number;
//   maxMarks: number;
//   feedback: string;
//   keyMissed: string[];
// }
// interface GroupedQuestions {
//   prefix: string;
//   questions: QuestionResponse[];
// }

// interface PrefixScores {
//   prefix: string;
//   totalScore: number;
//   totalMaxMarks: number;
//   percentage: number;
// }



// // =========================
// interface Category {
//   cid: number;
//   level: string;
//   title: string;
//   description: string;
//   courseCode: string;
// }

// interface Quiz {
//   qId: number;
//   title: string;
//   description: string;
//   maxMarks: string;
//   quizTime: string;
//   numberOfQuestions: string;
//   active: boolean;
//   attempted: boolean;
//   quizpassword: string;
//   category: Category;
// }

// // =============================

// @Component({
//   selector: 'app-start',
//   templateUrl: './start.component.html',
//   styleUrls: ['./start.component.css']
// })
// export class StartComponent implements OnInit {

//   // BEGIN PAGINATION
//   private readonly QUIZ_STORAGE_KEY = 'quiz_answers_by_prefix';

//   title = "pagination";
//   page: number = 1;
//   count: number = 0;
//   tableSize: number = 3;
//   tableSizes: any = [3, 6, 9, 12];
//   isLoading: boolean = true;



//   checked: true;
//   //END PAGINATION
//   catId;
//   quizzes;

//   // for the quizzes questions
//   questions;
//   questionss;
//   qid;
//   questionWithAnswers;
//   marksGot = 0;
//   maxMarks = 0;
//   correct_answer = 0;
//   attempted: any;
//   isSubmit = false;
//   // timer: any;
//   isNavigating = false;
//   second: number;
//   minutes: number;
//   count_timer: any;
//   timeT: number = 0;
//   timerAll: number = 0;
//   timeO: number = 0;
//   quizTitle
//   courseTitle
//   quiz
//   noOfQuesObject;
//   // private countdownKey = 'countdown_timer';
//   private intervalId: any;


//   //  ============================SUBJECTIVE QUESTIONS=======================================
//   questionT: Question[] = [];
//   filteredQuestions: Question[] = [];
//   itemsPerPage: number = 5;
//   groupedQuestions: { [key: string]: Question[] } = {};
//   prefixes: string[] = [];
//   currentPage: number = 0;
//   selectedQuestions: { [key: string]: boolean } = {}; // To track selected prefixes
//   selectedPrefix: string;
//   selectedQuestionsCount: number = 0;
//   numberOfQuestionsToAnswer: number = 0;
//   quizForm: FormGroup;
//   selectedQuestionsAnswer = [];
//   convertedJsonAPIResponsebody: any;



//   //  sectionB;

//   sectionB: any[] = [];
//   question: Question[] = [];
//   geminiResponse: any[] = [];
//   geminiResponseAI
//   sectionBMarks;
//   theoryResults = {
//     marksB: "",
//     quiz: {
//       qId: ""
//     }
//   }


//   localStorageKey = 'quiz_answers';


//   //  ============================SUBJECTIVE QUESTIONS=======================================

//   initForm(): void {
//     const formGroupConfig = {};
//     this.questionT.forEach(question => {
//       formGroupConfig[question.id] = ['', Validators.required];
//     });
//     this.quizForm = this.fb.group(formGroupConfig);
//   }

//   // get isSubmitDisabled(): boolean {
//   //   return Object.keys(this.selectedQuestions).length !== this.numberOfQuestionsToAnswer;
//   // }




//   get isSubmitDisabled(): boolean {
//     // Count selected groups
//     const selectedCount = Object.values(this.selectedQuestions).filter(val => val === true).length;
//     // Get compulsory groups
//     const compulsoryGroups = this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
//     // Check if all compulsory groups are selected
//     const allCompulsorySelected = compulsoryGroups.every(prefix => this.selectedQuestions[prefix] === true);
//     // Check if total selected equals required (including compulsory)
//     const hasCorrectTotal = selectedCount === this.numberOfQuestionsToAnswer;
//     // Disable if compulsory groups aren't selected OR wrong total count
//     return !allCompulsorySelected || !hasCorrectTotal;
//   }
//   //  ============================SUBJECTIVE QUESTIONS=======================================






//   constructor(private _quiz: QuizService,
//     private fb: FormBuilder,
//     private login: LoginService,
//     private locationSt: LocationStrategy,
//     private _route: ActivatedRoute,
//     private _snack: MatSnackBar,
//     private _questions: QuestionService,
//     private router: Router,
//     private quiz_progress: QuizProgressService,
//     private screenshotPrevention: ScreenshotPreventionService,

//   ) {
//   }

//   @HostListener('window:beforeunload', ['$event'])
//   beforeUnloadHandler(event: Event): void {
//     // Custom code to be executed before the page is unloaded
//     this.saveTimerToDatabase();
//     // localStorage.setItem(this.countdownKey, JSON.stringify(this.timerAll));
//     // console.log('countdownKey:', this.countdownKey);
//     console.log('timerAll:', this.timerAll);

//     console.log("Helllooooo...")
//     // event.preventDefault();
//     this.preventBackButton();


//     event.returnValue = '' as any; // This is required for some older browsers
//   }

//   @HostListener('window:unload', ['$event'])
//   unloadHandler(event: Event): void {
//     this.preventBackButton();
//   }



//   //  ============================SUBJECTIVE QUESTIONS=======================================




//   ngOnInit(): void {
//     // this.screenshotPrevention.enableProtection();
//     this.isLoading = true; // Set loading to true when starting
//     this.qid = this._route.snapshot.params['qid'];
//     console.log(this.qid)
//     // this.qid = this._route.snapshot.params['qid'];
//     this._quiz.getQuiz(this.qid).subscribe((data: any) => {
//       console.log(data.title);
//       this.quiz = data;
//       this.courseTitle = this.quiz.category.title;


//       console.log(this.quiz);
//       console.log(this.quiz.quizTime)


//       this.timeO = this.quiz.quizTime * 1;
//       this.timerAll = (this.timeT + this.timeO) * 60;

//       console.log(this.timerAll);
//       console.log(this.timeO * 60);

//       // return this.timeO = parseInt(this.quiz.quizTime);
//     },
//       (error) => {
//         this.isLoading = false;
//         this._snack.open("You're Session has expired! ", "", {
//           duration: 3000,
//         });
//         this.login.logout();
//         console.log("error !!");
//         // alert("Error loading quiz data")
//       }
//     );

//     this.loadQuestions();



//     this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe((data: any) => {
//       this.numberOfQuestionsToAnswer = data[0].totalQuestToAnswer;
//       console.log("This is for number of questions to answer", data[0].timeAllowed);
//       console.log("Number question to answer ", data[0].totalQuestToAnswer);
//       this.quizTitle = data[0].quiz.title;
//       this.courseTitle = data[0].quiz.category.title;




//       // this.timerAll = (this.timeT + this.timeO) * 60;

//       // this.timeT = data[0].timeAllowed;
//       // this.timerAll = (this.timeT + this.timeO) * 60;




//       console.log("This is time for the theory questions", this.timeT);
//       console.log("This is the time for the Objectives", this.timeO);
//       console.log(" Both time for theory and objectives", this.timerAll)



//       this.loadTheory();
//       // this.loadSavedAnswers();
//       // this.loadSubjective();

//       // this.numberOfQuestionsToAnswer = this.noOfQuesObject[0].totalQuestToAnswer;
//       this.timeT = data[0].timeAllowed;
//       console.log("This is the number of questions to answer", this.numberOfQuestionsToAnswer);
//       console.log("This is the time for the Theory ", this.timeT);


//       // let timerString = localStorage.getItem('countdown_timer');
//       // const timerNumber = parseInt(timerString, 10);
//       // console.log(typeof (timerNumber));

//       // if (timerNumber) {
//       //   this.timerAll = timerNumber;
//       //   console.log("The remaining time is ", this.timerAll);
//       //   console.log("The remaining time from the localStorage ", timerString);
//       //   console.log("This is remaining Theory timer", this.timeT);
//       //   console.log("This is remaining Theory timer", this.timeO);
//       //   //Remove value from local storage after accessing it.
//       //   localStorage.removeItem("countdown_timer");
//       // } else {
//       //   // this.timer = this.questions.length * 2 * 60;
//       //   // this.timerAll = (this.quiz.quizTime * 60);
//       //   this.timerAll = (this.timeT + this.timeO) * 60;
//       //   // this.timerAll = (this.questions.length * 2 * 60) + this.timeT;
//       //   localStorage.setItem('totalTime', JSON.stringify(this.timerAll));

//       // }

//       // this.initializeTimer();
//       this.startAutoSave(); // Auto-save timer every 10 seconds


//     },
//       (error) => {
//         this.isLoading = false;


//       });

//     // console.log(this.timerAll);




//     // this.loadQuestionsFromLocalStorage();

//     // this.startTimer();
//     // this.printQuiz();
//     // this.startTimer();

//     this.initForm();
//     this.preventBackButton();


//     // this.screenshotPrevention.enableProtection();

//   }




//   totalTime(): number {
//     const timeT = Number(this.timeT) || 0;
//     const quizTime = Number(this.quiz.quizTime) || 0;
//     return timeT + quizTime;
//   }

//   // loadNumQuesToAnswer() {
//   //   this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe((data: any) => {
//   //     console.log(data.totalQuestToAnswer);
//   //     this.numberOfQuestionsToAnswer = data;
//   //   });
//   // }


//   //  ============================SUBJECTIVE QUESTIONS=======================================
//   loadTheory() {
//     this._questions.getSubjective(this.qid).subscribe((theory: any) => {
//       console.log(theory);
//       // this.sectionB = theory;
//       this.groupedQuestions = this.getQuestionsGroupedByPrefix(theory);

//       // Sort prefixes: compulsory groups first
//       this.prefixes = this.sortPrefixesByCompulsory(this.groupedQuestions);
//       this.compulsoryPrefixes = this.getCompulsoryPrefixes();


//       // this.prefixes = Object.keys(this.groupedQuestions).sort();

//       this.loadQuestionsTheory();

//       console.log(this.groupedQuestions);
//       // this.startTimer();
//       // this.startCountdown();
//       // this.initializeTimer();
//       this.preventBackButton();


//       // Only set loading to false if this is the last API call
//       if (!this.isLoading) {
//         this.isLoading = false;
//       }

//     },
//       (error) => {
//         console.log("Could not load data from server");
//         this.isLoading = false;
//       });
//   }

//   getCompulsoryPrefixes(): string[] {
//     return this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
//   }





//   // Check if current page/group is compulsory
//   isCurrentGroupCompulsory(): boolean {
//     if (!this.currentQuestions || this.currentQuestions.length === 0) {
//       return false;
//     }
//     return this.currentQuestions.every(q => q.isCompulsory);
//   }



//   // Check if a specific group is compulsory
//   isGroupCompulsory(prefix: string): boolean {
//     const questions = this.groupedQuestions[prefix];
//     if (!questions || questions.length === 0) {
//       return false;
//     }
//     return questions.every((q: any) => q.isCompulsory);
//   }

//   sortPrefixesByCompulsory(groupedQuestions: any): string[] {
//     const prefixes = Object.keys(groupedQuestions);

//     return prefixes.sort((prefixA, prefixB) => {
//       const questionsA = groupedQuestions[prefixA];
//       const questionsB = groupedQuestions[prefixB];

//       // Check if all questions in group A are compulsory
//       const isGroupACompulsory = questionsA.every((q: any) => q.isCompulsory);

//       // Check if all questions in group B are compulsory
//       const isGroupBCompulsory = questionsB.every((q: any) => q.isCompulsory);

//       // Compulsory groups come first
//       if (isGroupACompulsory && !isGroupBCompulsory) return -1;
//       if (!isGroupACompulsory && isGroupBCompulsory) return 1;

//       // If both are compulsory or both are not, sort alphabetically/numerically
//       return prefixA.localeCompare(prefixB, undefined, { numeric: true });
//     });
//   }



//   getQuestionsGroupedByPrefix(questions) {
//     return questions.reduce((acc, question) => {
//       const prefix = question.quesNo.match(/^[A-Za-z]+[0-9]+/)[0];
//       if (!acc[prefix]) {
//         acc[prefix] = [];
//       }
//       acc[prefix].push(question);
//       return acc;
//     }, {});
//   }





//   //  ============================SUBJECTIVE QUESTIONS=======================================
//   // get currentQuestions(): Question[] {
//   //   return this.groupedQuestions[this.prefixes[this.currentPage]];
//   // }


//   // get currentQuestions(): Question[] {
//   //   const questions = this.groupedQuestions[this.prefixes[this.currentPage]] || [];
//   //   return questions.map(question => ({ ...question }));
//   // }



//   // get currentQuestions(): Question[] {
//   //   const key = this.prefixes[this.currentPage];
//   //   // this.loadSavedAnswers();
//   //   return this.groupedQuestions[key] || [];  // Returns Question[] or empty array
//   // }
//   public currentQuestions: Question[] = [];
//   compulsoryPrefixes: string[] = [];


//   loadQuestionsTheory(): void {
//     // Auto-select compulsory groups
//     this.prefixes.forEach(prefix => {
//       if (this.isGroupCompulsory(prefix)) {
//         this.selectedQuestions[prefix] = true;
//       }
//     });
//     const key = this.prefixes[this.currentPage];
//     this.currentQuestions = this.groupedQuestions[key] || [];
//     this.loadAnswers(); // load into currentQuestions
//   }








//   // Prevent deselection of compulsory groups
//   togglePrefixSelection(prefix: string): void {
//     // Prevent deselection of compulsory groups
//     if (this.isGroupCompulsory(prefix)) {
//       this.selectedQuestions[prefix] = true;
//       alert(`${prefix} contains compulsory questions and cannot be deselected.`);
//       return;
//     }
//     // Toggle for non-compulsory groups
//     this.selectedQuestions[prefix] = !this.selectedQuestions[prefix];
//     console.log('After toggle:', this.selectedQuestions);
//   }
//   // disableOtherSelection(){
//   //   Object.keys(this.selectedQuestions).length = this.numberOfQuestionsToAnswer
//   // }

//   onPrefixChange(prefix: string) {
//     this.selectedPrefix = prefix;
//   }



//   nextPage() {
//     this.saveAnswers(); // save answers BEFORE changing the page
//     if (this.currentPage < this.prefixes.length - 1) {
//       this.currentPage++;
//       this.loadQuestionsTheory(); // make sure this sets currentQuestions
//     }
//   }




//   prevPage() {
//     this.saveAnswers(); // save before page change
//     if (this.currentPage > 0) {
//       this.currentPage--;
//       this.loadQuestionsTheory();
//     }
//   }


//   onQuestionSelect(question: Question) {
//     if (question.selected) {
//       question.selected = false;
//       this.selectedQuestionsCount--;
//     } else {
//       if (this.selectedQuestionsCount < 2) {
//         question.selected = true;
//         this.selectedQuestionsCount++;
//       } else {
//         alert('You can only select 2 questions.');
//       }
//     }
//   }
//   //  ============================SUBJECTIVE QUESTIONS=======================================




//   loadQuestionsWithAnswers() {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {
//       this.questionWithAnswers = data;
//       console.log(data)
//       console.log(this.questionWithAnswers);
//     },
//       (error) => {
//         console.log("Error Loading questions");
//         Swal.fire("Error", "Error loading questions with answers", "error");
//       }
//     );
//     this.preventBackButton();
//   }

//   ///Custom Functions
//   preventBackButton() {
//     history.pushState(null, null, location.href);
//     this.locationSt.onPopState(() => {
//       history.pushState(null, null, location.href);
//     });
//   }





































































//   submitQuiz() {
//     Swal.fire({
//       title: "Do you want to submit the quiz?",
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Submit",
//       cancelButtonText: "Cancel"
//     }).then((e) => {
//       if (e.isConfirmed) {

//         // Show the loading spinner
//         this.clearSavedAnswers();
//         Swal.fire({
//           title: 'Evaluating...',
//           text: `Please wait while we evaluate your quiz for "${this.courseTitle}".`,
//           // text: `Your results for "${this.courseTitle}" is available for print on the dashboard.`,

//           allowOutsideClick: false,
//           didOpen: () => {
//             Swal.showLoading();
//           }
//         });

//         // Run all your logic after a short delay or immediately
//         setTimeout(() => {
//           this.evalQuiz();
//           this.waitNavigateFunction();
//           this.loadQuestionsWithAnswers();
//           this.clearProgress()
//           // this.evalSubjective();
//           this.preventBackButton();

//           // Optional: Close the spinner and show success message
//           Swal.fire({
//             icon: 'success',
//             title: 'Evaluated!',
//             text: `Your results for "${this.courseTitle}" is available for print on the dashboard.`,
//             timer: 1000,        // ⬅ auto-close after 1.2 seconds
//             showConfirmButton: false
//           });
//           setTimeout(() => {
//             window.close();
//             if (window.opener) {
//               window.opener.location.href = '/user-dashboard/0';
//             }
//           }, 1200); // wait slightly longer than success popup duration

//         }, 3000); // You can remove this delay or wait for async logic instead
//       }
//     });

//     // window.close();
//   }
























































































//   clearProgress() {
//     this.quiz_progress.clearQuizAnswers(this.qid).subscribe((data: any) => {
//       console.log("Quiz Progress has been cleared!!")
//     },
//       (error) => {
//         console.log("Error clraring quiz progress");
//       }
//     );
//   }





//   // async submitAllQuiz() {
//   //   Swal.fire({
//   //     title: "Do you want to submit the quiz?",
//   //     icon: "info",
//   //     showCancelButton: true,
//   //     confirmButtonText: "Submit",
//   //     cancelButtonText: "Cancel"
//   //   }).then((e) => {
//   //     if (e.isConfirmed) {
//   //       // Show the loading spinner
//   //       this.clearSavedAnswers();
//   //       Swal.fire({
//   //         title: 'Evaluating...',
//   //         text: `Please wait while we evaluate your quiz for ${this.courseTitle}.`,
//   //         allowOutsideClick: false,
//   //         didOpen: () => {
//   //           Swal.showLoading();
//   //         }
//   //       });

//   //       // Run all your logic after a short delay or immediately
//   //       setTimeout(async () => {
//   //         this.evalQuiz();
//   //         this.waitNavigateFunction();
//   //         this.loadQuestionsWithAnswers();
//   //         await this.evalSubjective();            // ✅ Wait here
//   //         this.clearProgress()
//   //         this.preventBackButton();

//   //         // Optional: Close the spinner and show success message
//   //         Swal.fire({
//   //           icon: 'success',
//   //           title: 'Evaluated!',
//   //           text: `Your results for ${this.courseTitle} is available for print on the dashboard.`,
//   //         });
//   //         setTimeout(() => {
//   //           window.close();
//   //           if (window.opener) {
//   //             window.opener.location.href = '/user-dashboard/0';
//   //           }
//   //         }, 1200); // wait slightly longer than success popup duration

//   //       }, 8000); // You can remove this delay or wait for async logic instead
//   //     }
//   //   });

//   // }



//   async submitAllQuiz() {

//     Swal.fire({
//       title: "Do you want to submit the quiz?",
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Submit",
//       cancelButtonText: "Cancel"
//     }).then((e) => {
//       if (!e.isConfirmed) return;

//       this.clearSavedAnswers();

//       Swal.fire({
//         title: 'Evaluating...',
//         text: `Please wait while we evaluate your quiz for ${this.courseTitle}.`,
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         }
//       });

//       // 🔑 Build evaluation list based on quiz type
//       const evaluations: Observable<any>[] = [];


//       if (this.timeO > 0) {
//         evaluations.push(this.evalQuiz());
//       }

//       if (this.timeT > 0) {
//         evaluations.push(this.evalSubjective());
//       }


//       // Safety: nothing to evaluate
//       if (evaluations.length === 0) {
//         this.finishAfterEvaluation();
//         return;
//       }

//       // ✅ WAIT for backend
//       forkJoin(evaluations).subscribe({
//         next: () => {
//           this.waitNavigateFunction();
//           this.loadQuestionsWithAnswers();
//           this.clearProgress();
//           this.preventBackButton();

//           Swal.fire({
//             icon: 'success',
//             title: 'Evaluated!',
//             text: `Your results for ${this.courseTitle} are available on the dashboard.`,
//           });

//           setTimeout(() => {
//             if (window.opener) {
//               window.opener.location.href = '/user-dashboard/0';
//             }
//             window.close();
//           }, 1200);
//         },
//         error: (err) => {
//           console.error('Evaluation failed', err);
//           Swal.fire({
//             icon: 'error',
//             title: 'Evaluation failed',
//             text: 'Please contact support.',
//           });
//         }
//       });
//     });


//   }





//   waitNavigateFunction() {
//     setTimeout(() => {
//       this.printQuiz();
//     }, 3000); // 3000 milliseconds = 3 seconds delay
//   }

//   printQuiz() {
//     this.router.navigate(['./user-dashboard/0']);
//   }

//   // startTimer() {
//   //   this.timerAll = this.totalTime() * 60;
//   //   let t = window.setInterval(async () => {
//   //     if (this.timerAll <= 0) {
//   //       this.evalQuiz();
//   //       this.waitNavigateFunction();
//   //       this.loadQuestionsWithAnswers();
//   //       await this.evalSubjective();
//   //       this.preventBackButton();
//   //       clearInterval(t);
//   //     } else {
//   //       this.timerAll--; // ✅ ticks every second
//   //     }
//   //   }, 1000);
//   // }


//   // DISABLE PASTE


//   disablePaste(event: ClipboardEvent): void {
//     event.preventDefault();
//   }


//   getFormmatedTime(): string {
//     const hr = Math.floor(this.timerAll / 3600);
//     const mm = Math.floor((this.timerAll % 3600) / 60);
//     const ss = this.timerAll % 60;

//     let formattedTime = '';
//     if (hr > 0) {
//       formattedTime += `${hr} hr(s) : `;
//     }
//     formattedTime += `${mm} min : ${ss} sec`;
//     return formattedTime;
//   }





//   evalQuiz(): Observable<any> {
//     return new Observable(observer => {
//       this._questions.evalQuiz(this.qid, this.questions).subscribe({
//         next: (data: any) => {
//           console.log(this.questions, data);
//           this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
//           this.correct_answer = data.correct_answer;
//           this.attempted = data.attempted;
//           this.maxMarks = data.maxMarks;

//           localStorage.setItem('CorrectAnswer', JSON.stringify(this.correct_answer));
//           localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
//           localStorage.setItem('Attempted', JSON.stringify(this.attempted));
//           localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks));

//           this.clearSavedAnswers();
//           this.preventBackButton();
//           this.isSubmit = true;

//           observer.next(data);
//           observer.complete();
//         },
//         error: (err) => {
//           console.error('Evaluation Error', err);
//           observer.error(err);
//         }
//       });
//     });
//   }

//   // evalQuiz(){
//   //   //Evaluate questions
//   //    this._questions.evalQuiz(this.qid, this.questions).subscribe((data: any) => {
//   //     console.log(this.questions);
//   //     console.log(data);
//   //     this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
//   //     this.correct_answer = data.correct_answer;
//   //     this.attempted = data.attempted;
//   //     this.maxMarks = data.maxMarks;
//   //     localStorage.setItem('CorrectAnswer', JSON.stringify(this.correct_answer));
//   //     localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
//   //     localStorage.setItem('Attempted', JSON.stringify(this.attempted));
//   //     localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks));
//   //     this.clearSavedAnswers();
//   //     // this.addSectBMarks();
//   //     this.preventBackButton();
//   //     // this.evalSubjective();
//   //     this.isSubmit = true;

//   //   },
//   //     (error) => {
//   //       console.log("Error !")

//   //     }

//   //   );

//   // }








//   // async evalSubjective(): Promise<void> {
//   //   for (const prefix in this.selectedQuestions) {
//   //     this.selectedQuestionsAnswer.push(...this.groupedQuestions[prefix]);
//   //   }
//   //   if (Object.keys(this.selectedQuestions).length === this.numberOfQuestionsToAnswer) {
//   //     localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestions));
//   //     this.convertJson();

//   //     this._quiz.evalTheory(this.convertedJsonAPIResponsebody).subscribe((data: any) => {
//   //       console.log("This is the Original Response from the server and formatted!!!!");

//   //       // Store the response only once
//   //       this.geminiResponse = data;
//   //       localStorage.setItem("answeredAIQuestions" + this.qid, JSON.stringify(this.geminiResponse));

//   //       console.log('Stored successfully:', localStorage.getItem("answeredAIQuestions" + this.qid));
//   //       console.log(this.geminiResponse);

//   //       setTimeout(() => {
//   //         this.loadSubjectiveAIEval();
//   //       }, 1000);
//   //     });

//   //     localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestionsAnswer));
//   //   }
//   //   (error) => {
//   //     this._snack.open("Please select exactly 3 sets of questions to submit", "", {
//   //       duration: 3000,
//   //     });
//   //   }
//   //   // window.close();

//   // }




//   evalSubjective(): Observable<any> {
//     return new Observable(observer => {
//       for (const prefix in this.selectedQuestions) {
//         this.selectedQuestionsAnswer.push(...this.groupedQuestions[prefix]);
//       }
//       if (Object.keys(this.selectedQuestions).length !== this.numberOfQuestionsToAnswer) {
//         this._snack.open("Please select exactly 3 sets of questions to submit", "", {
//           duration: 3000,
//         });
//         observer.error('Not enough questions selected');
//         return;
//       }

//       // Save to localStorage
//       localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestions));
//       this.convertJson();
//       this._quiz.evalTheory(this.convertedJsonAPIResponsebody).subscribe({
//         next: (data: any) => {
//           console.log("Server Response:", data);
//           this.geminiResponse = data;
//           localStorage.setItem("answeredAIQuestions" + this.qid, JSON.stringify(this.geminiResponse));

//           setTimeout(() => {
//             this.loadSubjectiveAIEval();
//           }, 1000);

//           // localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestionsAnswer));

//           observer.next(data);
//           observer.complete();
//         },
//         error: (err) => {
//           console.error("Subjective evaluation failed", err);
//           observer.error(err);
//         }
//       });
//     });
//   }









//   // WORKING ON THE BELOW

//   loadSubjectiveAIEval() {
//     // const geminiResponse = localStorage.getItem("answeredAIQuestions");
//     const geminiResponse = localStorage.getItem("answeredAIQuestions" + this.qid);
//     // const data = geminiResponse.trim();
//     console.log(geminiResponse);
//     // const data = geminiResponse.replace("json\n", "");
//     // const data1 = JSON.parse(data);
//     this.geminiResponseAI = this.groupByPrefix(this.geminiResponse);
//     console.log('This is the geminiResponse groupedByPrefixes', this.geminiResponseAI);
//     console.log("CHECKING ...")
//     this.getScoresForPrefixes(this.geminiResponseAI);
//     this.getGrandTotalMarks();
//     // this.triggerAddSectBMarks();
//     this.addSectBMarks();
//   }



//   getTotalMarksForPrefix(questions: any[]): number {
//     if (!questions || questions.length === 0) {
//       return 0;
//     }

//     return questions.reduce((total, question) => {
//       return total + (question.score || 0);
//     }, 0);
//   }


//   //grouped by prefixDEEPSEEK=========
//   groupByPrefix(data: QuestionResponse[]): GroupedQuestions[] {
//     // Handle edge cases
//     if (!Array.isArray(data)) {
//       throw new Error('Input must be an array');
//     }
//     if (data.length === 0) {
//       return [];
//     }

//     // Initialize a map to group questions by prefix
//     const prefixMap: Record<string, QuestionResponse[]> = {};

//     // Iterate over each question response
//     data.forEach((questionResponse) => {
//       // Validate the question number exists
//       if (!questionResponse.questionNumber) {
//         console.warn('Question missing questionNumber:', questionResponse);
//         return; // Skip this entry
//       }

//       // Extract the prefix (e.g., "Q1" from "Q1a" or "Q3ai")
//       const prefixMatch = questionResponse.questionNumber.match(/^(Q\d+)/i);
//       const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : 'UNCATEGORIZED';

//       // Initialize the group if it doesn't exist
//       if (!prefixMap[prefix]) {
//         prefixMap[prefix] = [];
//       }
//       // Add the current question to its prefix group
//       prefixMap[prefix].push(questionResponse);
//     });

//     // Convert the map to an array of grouped data
//     return Object.entries(prefixMap).map(([prefix, questions]) => ({
//       prefix,
//       questions
//     }));
//   }






//   // WORKING ON ABOVE
//   // Function to calculate the grand total marks across all prefixes
//   getGrandTotalMarks(): number {
//     this.sectionBMarks = 0;

//     if (!this.geminiResponseAI || this.geminiResponseAI.length === 0) {
//       return 0;
//     }

//     this.sectionBMarks = this.geminiResponseAI.reduce((grandTotal, group) => {
//       const prefixScores = this.getScoresForPrefixes([group]);
//       const groupTotal = prefixScores.reduce((sum, p) => sum + p.totalScore, 0);
//       return grandTotal + groupTotal;
//     }, 0);

//     console.log("Grand Total Marks: ", this.sectionBMarks);
//     return this.sectionBMarks;
//   }




//   addSectBMarks() {
//     this.theoryResults = {
//       marksB: this.sectionBMarks,
//       quiz: {
//         qId: this.qid
//       }
//     }

//     console.log(this.theoryResults);

//     console.log(this.theoryResults.marksB);
//     console.log(this.theoryResults.quiz.qId);

//     this._quiz.addSectionBMarks(this.theoryResults).subscribe(
//       (data) => {
//         console.log("Marks sucessfull");
//       },
//       (error) => {
//         // Swal.fire("Error !! ", "An error occurred while adding quiz", "error");

//         console.log("Unsuccessfull");
//       }
//     );
//   }

//   getScoresForPrefixes(groupedData: GroupedQuestions[]): PrefixScores[] {
//     return groupedData.map(group => {
//       const { prefix, questions } = group;

//       // Ensure questions is a valid array
//       const safeQuestions = Array.isArray(questions) ? questions : [];

//       const totalScore = safeQuestions.reduce((sum, q) => sum + q.score, 0);
//       const totalMaxMarks = safeQuestions.reduce((sum, q) => sum + q.maxMarks, 0);
//       const percentage = totalMaxMarks > 0
//         ? Math.round((totalScore / totalMaxMarks) * 100)
//         : 0;

//       console.log("Total Marks for Prefix: ", totalScore, totalMaxMarks);

//       return {
//         prefix,
//         totalScore,
//         totalMaxMarks,
//         percentage
//       };
//     });
//   }


//   // SECTION B
//   getPrefixes(): string[] {
//     const prefixes = new Set<string>();
//     this.selectedQuestionsAnswer.forEach(question => {
//       const prefix = question.quesNo.match(/^Q\d+/)?.[0];
//       if (prefix) {
//         prefixes.add(prefix);
//       }
//     });
//     return Array.from(prefixes);
//   }



//   getGroupedQuestions(prefix: string) {
//     return this.selectedQuestionsAnswer.filter(q => q.quesNo.startsWith(prefix));
//   }





//   printPage() {
//     window.print();
//     // this.preventBackButton();  
//   }
//   saveDataInBrowser(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {
//       // this.preventBackButton();
//     },
//     );
//   }
//   // loadQuestionsFromLocalStorage() {
//   //   // // this.questionss = JSON.parse(localStorage.getItem("exam"));
//   //   // // this.timeO = parseInt(this.quiz.quizTime) * 60;
//   //   // this.timerAll
//   //   // // this.timeO = parseInt(this.questionss[0].quiz.category.quizTime) * 1 * 60;
//   //   // // this.timer = this.questionss.length * 2 * 60; // THIS WORKS FINE
//   //   // // localStorage.setItem('time', JSON.stringify(this.timeO));
//   //   // this.questions.forEach(q => {
//   //   //   q['givenAnswer'] = "";
//   //   // });
//   //   // // localStorage.setItem('exam', JSON.stringify(data));
//   //   // // this.preventBackButton();
//   //   // this.startTimer();
//   //   // console.log(this.questionss[0]);
//   // }

//   //PAGINATION

//   onTableDataChange(event: any) {
//     this.page = event;
//     // this.loadQuestionsFromLocalStorage();
//   }
//   onTableSizeChange(event: any): void {
//     this.tableSize = event.target.value;
//     this.page = 1;
//     // this.loadQuestionsFromLocalStorage();
//   }

//   //CONVERT TO API RESPONSE
//   // Method to convert JSON data
//   convertJson() {
//     this.convertedJsonAPIResponsebody = {
//       contents: [
//         {
//           parts: this.selectedQuestionsAnswer.map(item => {
//             // Extract fields from each item

//             const quizId = item.quiz.qId;
//             const quesId = item.tqId;
//             const questionNo = item.quesNo;
//             const question = item.question;
//             const answer = item.givenAnswer ? item.givenAnswer : ''; // Assume empty if null
//             const marks = item.marks ? item.marks.split(' ')[0] : ''; // Extracting the numeric part
//             let criteri = '';
//             let criteria = 'Evaluate based on clarity, completeness, and accuracy';

//             // Create the text format
//             const text = `quizId ${quizId}: tqid ${quesId}: Question Number ${questionNo}: ${question}. Answer: ${answer}. Marks: ${marks} Criteria:${criteria}.`;

//             return { text: text };
//           })
//         }
//       ]
//     };

//     console.log(this.convertedJsonAPIResponsebody);
//     // console.log(JSON.stringify(this.convertedJsonAPIResponsebody, null, 2));
//     return this.convertedJsonAPIResponsebody;
//   }


//   //END OF CONVERT TO API RESPONSE





































//   //PESISTING THEORY EVEN ON PAGE REFRESH



//   // Clear all answers for current quiz
//   clearSavedAnswers(): void {
//     this.quiz_progress.clearAnswers(this.qid).subscribe({
//       next: (response) => {
//         console.log(response.message);
//         // Clear UI
//         this.currentQuestions.forEach((q: any) => {
//           q.givenAnswer = '';
//         })
//       },
//       error: (error) => {
//         console.error('Error clearing answers:', error);
//       }
//     });
//   }




































































//   //PESISTING OBJ EVEN ON PAGE REFRESH



//   loadQuestions(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe(
//       (data: any) => {
//         // Get all stored answers from localStorage
//         const storedAnswers = JSON.parse(localStorage.getItem('selectedAnswers') || '{}');
//         this.loadSavedAnswers();

//         this.questions = data.map((q, index) => {
//           // Add count property for display purposes
//           q.count = index + 1;

//           // Restore givenAnswer from localStorage if available
//           if (storedAnswers[q.quesId]) {
//             q.givenAnswer = [...storedAnswers[q.quesId]]; // Create a fresh copy
//           } else {
//             q.givenAnswer = []; // Initialize empty array if no saved answers
//           }

//           // 🔍 Debugging Logs
//           console.log(`📥 Question ID: ${q.quesId}, Restored Answers:`, q.givenAnswer);

//           return q;
//         });

//         // Set loading to false when questions are loaded
//         this.isLoading = false;
//         // 🔍 Final questions array check
//         console.log("✅ Final loaded questions:", this.questions);
//         // this.startTimer();

//         // this.startCountdown();
//         this.initializeTimer();
//       },
//       (error) => {
//         console.log("Error Loading questions");
//         // Set loading to false when questions are loaded
//         this.isLoading = false;
//         Swal.fire("Error", "Error loading questions", "error");
//       }
//     );

//     this.preventBackButton();
//   }





//   updateSelectedAnswers(q: any, option: string, isChecked: boolean) {
//     // Update local state immediately for responsive UI
//     if (!q.givenAnswer) {
//       q.givenAnswer = [];
//     }

//     if (isChecked) {
//       if (!q.givenAnswer.includes(option)) {
//         q.givenAnswer.push(option);
//       }
//     } else {
//       const index = q.givenAnswer.indexOf(option);
//       if (index !== -1) {
//         q.givenAnswer.splice(index, 1);
//       }
//     }
//     // Create a copy to avoid reference issues
//     const currentAnswers = [...q.givenAnswer];

//     // Save to database
//     const request: QuizAnswerRequest = {
//       questionId: q.quesId,
//       option: option,
//       checked: isChecked,
//       quizId: this.qid
//     };
//     this.quiz_progress.updateAnswer(request).subscribe({
//       next: (response) => {
//         if (response.selectedOptions && Array.isArray(response.selectedOptions)) {
//           console.log("Server returned:", response.selectedOptions);
//           console.log("Local state:", currentAnswers);
//         }
//       },
//       error: (error) => {
//         console.error("❌ Error saving answer:", error);
//         // Revert local changes on error
//         q.givenAnswer = currentAnswers;
//       }
//     });

//     return q.givenAnswer;
//   }



//   loadSavedAnswers() {
//     // Load all saved answers for this quiz
//     this.quiz_progress.getAnswersByQuiz(this.qid).subscribe({
//       next: (response: UserQuizAnswersResponse) => {
//         console.log("📥 Loaded saved answers:", response);

//         // Map saved answers to questions
//         this.questions.forEach((q: any) => {
//           // Check if this question has saved answers
//           if (response.answers && response.answers[q.quesId]) {
//             q.givenAnswer = response.answers[q.quesId]; // Get array of selected options
//           } else {
//             q.givenAnswer = []; // Initialize empty array
//           }
//         });

//         console.log("✅ Questions with answers:", this.questions);
//       },
//       error: (error) => {
//         console.error("❌ Error loading saved answers:", error);
//         // Initialize all questions with empty arrays
//         this.questions.forEach((q: any) => {
//           q.givenAnswer = [];
//         });
//       }
//     });
//   }





//   // SAVING THE THEORY ANSWERS FOR LATER LOAD

//   saveAnswers(): void {
//     const answersToSave = this.currentQuestions.map((q: any) => ({
//       quesNo: q.quesNo,
//       givenAnswer: q.givenAnswer || ''
//     }));
//     this.quiz_progress.saveAnswers(this.qid, answersToSave).subscribe({
//       next: (response) => {
//         console.log('Answers saved to backend successfully');
//       },
//       error: (error) => {
//         console.error('Error saving answers:', error);
//       }
//     });
//   }

//   // Load answers when component initializes
//   loadAnswers(): void {
//     this.quiz_progress.loadAnswers(this.qid).subscribe({
//       next: (savedAnswers) => {
//         // Merge loaded answers with current questions
//         this.currentQuestions.forEach((q: any) => {
//           const saved = savedAnswers.find((s: any) => s.quesNo === q.quesNo);
//           if (saved) {
//             q.givenAnswer = saved.givenAnswer;
//           }
//         });
//       },
//       error: (error) => {
//         console.error('Error loading answers:', error);
//       }
//     });
//   }






//   // PREVENT EVERY ACTION ON THE FORM TAG TAG

//   preventAction(event: Event): void {
//     event.preventDefault();
//     event.stopPropagation();

//     // Optional: Show a warning message to the user
//     this.showWarningMessage('Copy/Paste operations are disabled during the exam');

//     return;
//   }

//   // Optional: Show warning message
//   private showWarningMessage(message: string): void {
//     // You can use Angular Material Snackbar or a simple alert
//     console.warn(message);
//     // Or implement a toast/snackbar notification
//   }

//   // Remove the disablePaste() method from ngModelChange since we're handling it with events


























//   // DATABASE TIMER LOGIC

//   initializeTimer(): void {
//     this.quiz_progress.getQuizTimer(this.qid).subscribe({
//       next: (savedTimer) => {
//         this.timerAll = (savedTimer?.remainingTime && savedTimer.remainingTime > 0)
//           ? savedTimer.remainingTime
//           : (this.timeT + this.timeO) * 60;

//         if (!savedTimer || savedTimer.remainingTime <= 0) {
//           this.saveTimerToDatabase(); // first-time save
//         }

//         this.isTimerLoaded = true;
//         this.startCountdown();
//       },
//       error: () => {
//         // Hard fallback
//         this.timerAll = (this.timeT + this.timeO) * 60;
//         this.isTimerLoaded = true;
//         this.startCountdown();
//       }
//     });
//   }

//   showTimeUpModal = false;
//   private isExpiredHandled = false;
//   countdownText = '';
//   progressPercent = 100;
//   private audio = new Audio('/assets/beep.mp3'); // short beep sound


//   private onTimerExpired(): void {
//     if (this.isExpiredHandled) return;
//     this.isExpiredHandled = true;

//     this.timerSubscription?.unsubscribe();
//     this.timerAll = 0;
//     this.saveTimerToDatabase();
//     this.showTimeUpModal = true;

//     const total = 5;
//     let count = total;
//     this.countdownText = count.toString();
//     this.progressPercent = 100;

//     const interval = setInterval(() => {
//       count--;
//       this.progressPercent = (count / total) * 100;

//       if (count > 0) {
//         this.countdownText = count.toString();
//         if (count <= 3) {
//           this.audio.currentTime = 0;
//           this.audio.play().catch(() => { });
//         }
//       } else {
//         clearInterval(interval);
//         this.countdownText = 'Submitting...';
//         this.progressPercent = 0;

//         setTimeout(() => {
//           // Collect only existing evaluations
//           const observables: Observable<any>[] = [];

//           if (this.evalQuiz) {
//             observables.push(this.evalQuiz());
//           }
//           if (this.evalSubjective) {
//             observables.push(this.evalSubjective());
//           }

//           if (observables.length === 0) {
//             // No evaluations for this quiz, just finish
//             this.finishAfterEvaluation();
//             return;
//           }

//           forkJoin(
//             observables.map(obs =>
//               obs.pipe(
//                 catchError(err => {
//                   console.error('One evaluation failed:', err);
//                   return of(null); // allow forkJoin to continue even if this observable fails
//                 })
//               )
//             )
//           ).subscribe({
//             next: () => {
//               console.log('All evaluations (that exist) completed');
//               this.finishAfterEvaluation();
//             },
//             error: (err) => {
//               // This block almost never runs now
//               console.error('Unexpected error in evaluation', err);
//               this.finishAfterEvaluation();
//             }
//           });
//         }, 700);

//       }
//     }, 1000);
//   }

//   // Centralized finish logic
//   private finishAfterEvaluation() {
//     this.showTimeUpModal = false;
//     this.preventBackButton();
//     if (window.opener) {
//       window.opener.location.href = '/user-dashboard/0';
//     }
//     window.close();
//   }


//   private saveTimerToDatabase(): void {
//     // const quizId = this.quiz.id;
//     this.quiz_progress.saveQuizTimer(this.qid, this.timerAll).subscribe({
//       next: (response) => {
//         console.log('Timer saved successfully:', response);
//       },
//       error: (error) => {
//         console.error('Failed to save timer:', error);
//       }
//     });
//   }


//   private startCountdown(): void {
//     // Safety: prevent multiple timers
//     this.timerSubscription?.unsubscribe();

//     this.timerSubscription = interval(1000).subscribe(() => {
//       this.timerAll--;

//       // OPTIONAL: persist every 10 seconds
//       if (this.timerAll % 10 === 0) {
//         this.saveTimerToDatabase();
//       }

//       if (this.timerAll <= 0) {
//         this.onTimerExpired();
//       }
//     });
//   }






//   private timerSubscription: Subscription;
//   private autoSaveSubscription: Subscription;
//   private isTimerLoaded: boolean = false;

//   ngOnDestroy(): void {
//     // Save timer before leaving the page
//     if (this.isTimerLoaded && this.timerAll > 0) {
//       this.saveTimerToDatabase();
//     }

//     // Clean up subscriptions
//     if (this.timerSubscription) {
//       this.timerSubscription.unsubscribe();
//     }
//     if (this.autoSaveSubscription) {
//       this.autoSaveSubscription.unsubscribe();
//     }
//   }


//   private startAutoSave(): void {
//     this.autoSaveSubscription = interval(10000).subscribe(() => {
//       if (this.isTimerLoaded && this.timerAll > 0) {
//         this.saveTimerToDatabase();
//       }
//     });
//   }

// }




// NEW IMPLEMENTATION

// import { LocationStrategy } from '@angular/common';
// import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { QuestionService } from 'src/app/services/question.service';
// import { QuizService } from 'src/app/services/quiz.service';
// import { Router, } from '@angular/router';
// import { Question } from 'src/model testing/model';
// import { FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { LoginService } from 'src/app/services/login.service';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { QuizProgressService } from 'src/app/services/quiz-progress.service';
// import { QuizAnswerRequest } from 'src/app/services/quiz-progress.service';
// import { UserQuizAnswersResponse } from 'src/app/services/quiz-progress.service';
// import { interval, Subscription } from 'rxjs';
// import { Observable, forkJoin, of } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import Swal from 'sweetalert2';
// import { ScreenshotPreventionService } from 'src/app/services/ScreenshotPreventionService ';

// import { 
//   QuizProtectionService,
//   ViolationAction,
//   ExamMode,
//   QuizProtectionState,
//   SecurityEvent 
// } from 'src/app/services/QuizProtectionService';

// interface QuizAnswers {
//   [prefix: string]: {
//     [tqId: number]: string
//   }
// }

// interface QuestionResponse {
//   questionNumber: string;
//   question: string;
//   studentAnswer: string;
//   score: number;
//   maxMarks: number;
//   feedback: string;
//   keyMissed: string[];
// }

// interface GroupedQuestions {
//   prefix: string;
//   questions: QuestionResponse[];
// }

// interface PrefixScores {
//   prefix: string;
//   totalScore: number;
//   totalMaxMarks: number;
//   percentage: number;
// }

// interface Category {
//   cid: number;
//   level: string;
//   title: string;
//   description: string;
//   courseCode: string;
// }

// interface Quiz {
//   qId: number;
//   title: string;
//   description: string;
//   maxMarks: string;
//   quizTime: string;
//   numberOfQuestions: string;
//   active: boolean;
//   attempted: boolean;
//   quizpassword: string;
//   category: Category;
// }

// @Component({
//   selector: 'app-start',
//   templateUrl: './start.component.html',
//   styleUrls: ['./start.component.css']
// })
// export class StartComponent implements OnInit, OnDestroy {

//   // ============================================================================
//   // QUIZ PROTECTION STATE
//   // ============================================================================
//   protectionState: QuizProtectionState = {
//     isActive: false,
//     isFullscreen: false,
//     violationCount: 0,
//     violations: [],
//     penaltySeconds: 0,
//   };
//   private protectionSubscriptions: Subscription[] = [];

//   // ============================================================================
//   // PAGINATION
//   // ============================================================================
//   private readonly QUIZ_STORAGE_KEY = 'quiz_answers_by_prefix';
//   title = "pagination";
//   page: number = 1;
//   count: number = 0;
//   tableSize: number = 3;
//   tableSizes: any = [3, 6, 9, 12];
//   isLoading: boolean = true;
//   checked: true;

//   // ============================================================================
//   // QUIZ DATA
//   // ============================================================================
//   catId;
//   quizzes;
//   questions;
//   questionss;
//   qid;
//   questionWithAnswers;
//   marksGot = 0;
//   maxMarks = 0;
//   correct_answer = 0;
//   attempted: any;
//   isSubmit = false;
//   isNavigating = false;
//   second: number;
//   minutes: number;
//   count_timer: any;
//   timeT: number = 0;
//   timerAll: number = 0;
//   timeO: number = 0;
//   quizTitle;
//   courseTitle;
//   quiz;
//   noOfQuesObject;
//   private intervalId: any;

//   // ============================================================================
//   // SUBJECTIVE QUESTIONS
//   // ============================================================================
//   questionT: Question[] = [];
//   filteredQuestions: Question[] = [];
//   itemsPerPage: number = 5;
//   groupedQuestions: { [key: string]: Question[] } = {};
//   prefixes: string[] = [];
//   currentPage: number = 0;
//   selectedQuestions: { [key: string]: boolean } = {};
//   selectedPrefix: string;
//   selectedQuestionsCount: number = 0;
//   numberOfQuestionsToAnswer: number = 0;
//   quizForm: FormGroup;
//   selectedQuestionsAnswer = [];
//   convertedJsonAPIResponsebody: any;
//   sectionB: any[] = [];
//   question: Question[] = [];
//   geminiResponse: any[] = [];
//   geminiResponseAI;
//   sectionBMarks;
//   theoryResults = {
//     marksB: "",
//     quiz: {
//       qId: ""
//     }
//   }
//   localStorageKey = 'quiz_answers';
//   public currentQuestions: Question[] = [];
//   compulsoryPrefixes: string[] = [];

//   // ============================================================================
//   // TIMER
//   // ============================================================================
//   showTimeUpModal = false;
//   private isExpiredHandled = false;
//   countdownText = '';
//   progressPercent = 100;
//   private audio = new Audio('/assets/beep.mp3');
//   private timerSubscription: Subscription;
//   private autoSaveSubscription: Subscription;
//   private isTimerLoaded: boolean = false;

//   constructor(
//     private _quiz: QuizService,
//     private fb: FormBuilder,
//     private login: LoginService,
//     private locationSt: LocationStrategy,
//     private _route: ActivatedRoute,
//     private _snack: MatSnackBar,
//     private _questions: QuestionService,
//     private router: Router,
//     private quiz_progress: QuizProgressService,
//     private screenshotPrevention: ScreenshotPreventionService,
//     private quizProtection: QuizProtectionService // <-- INJECT THE PROTECTION SERVICE
//   ) {}

//   // ============================================================================
//   // LIFECYCLE HOOKS
//   // ============================================================================

//   ngOnInit(): void {
//     this.isLoading = true;
//     this.qid = this._route.snapshot.params['qid'];
//     console.log(this.qid);

//     // Setup protection subscriptions FIRST
//     this.setupProtectionSubscriptions();

//     this._quiz.getQuiz(this.qid).subscribe(
//       (data: any) => {
//         console.log(data.title);
//         this.quiz = data;
//         this.courseTitle = this.quiz.category.title;
//         console.log(this.quiz);
//         console.log(this.quiz.quizTime);

//         this.timeO = this.quiz.quizTime * 1;
//         this.timerAll = (this.timeT + this.timeO) * 60;

//         console.log(this.timerAll);
//         console.log(this.timeO * 60);

//         // Enable protection AFTER quiz data is loaded
//         this.enableQuizProtection();
//       },
//       (error) => {
//         this.isLoading = false;
//         this._snack.open("You're Session has expired! ", "", {
//           duration: 3000,
//         });
//         this.login.logout();
//         console.log("error !!");
//       }
//     );

//     this.loadQuestions();

//     this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe(
//       (data: any) => {
//         this.numberOfQuestionsToAnswer = data[0].totalQuestToAnswer;
//         console.log("This is for number of questions to answer", data[0].timeAllowed);
//         console.log("Number question to answer ", data[0].totalQuestToAnswer);
//         this.quizTitle = data[0].quiz.title;
//         this.courseTitle = data[0].quiz.category.title;

//         this.loadTheory();
//         this.timeT = data[0].timeAllowed;
//         console.log("This is the number of questions to answer", this.numberOfQuestionsToAnswer);
//         console.log("This is the time for the Theory ", this.timeT);

//         this.startAutoSave();
//       },
//       (error) => {
//         this.isLoading = false;
//       }
//     );

//     this.initForm();
//     this.preventBackButton();
//   }

//   ngOnDestroy(): void {
//     // CRITICAL: Disable protection when leaving the component
//     this.disableQuizProtection();

//     // Save timer before leaving the page
//     if (this.isTimerLoaded && this.timerAll > 0) {
//       this.saveTimerToDatabase();
//     }

//     // Clean up subscriptions
//     if (this.timerSubscription) {
//       this.timerSubscription.unsubscribe();
//     }
//     if (this.autoSaveSubscription) {
//       this.autoSaveSubscription.unsubscribe();
//     }

//     // Clean up protection subscriptions
//     this.protectionSubscriptions.forEach(sub => sub.unsubscribe());
//   }

//   // ============================================================================
//   // QUIZ PROTECTION METHODS
//   // ============================================================================

//   /**
//    * Setup subscriptions to protection service events
//    */
//   private setupProtectionSubscriptions(): void {
//     // Subscribe to state changes
//     this.protectionSubscriptions.push(
//       this.quizProtection.onStateChange.subscribe(state => {
//         this.protectionState = state;
//         console.log('[Quiz Protection] State updated:', state);
//       })
//     );

//     // Subscribe to violations
//     this.protectionSubscriptions.push(
//       this.quizProtection.onViolation.subscribe(event => {
//         console.log('[Quiz Protection] Violation detected:', event);
//         this.handleProtectionViolation(event);
//       })
//     );

//     // Subscribe to auto-submit events
//     this.protectionSubscriptions.push(
//       this.quizProtection.onAutoSubmit.subscribe(({ reason, violations }) => {
//         console.log('[Quiz Protection] Auto-submit triggered:', reason, violations);
//         this.handleAutoSubmitFromProtection(reason, violations);
//       })
//     );
//   }

//   /**
//    * Enable quiz protection with appropriate settings
//    * Call this when quiz is ready to start
//    */
//   private enableQuizProtection(): void {
//     // Configure protection based on your quiz requirements
//     // You can make this dynamic based on quiz settings from backend

//     this.quizProtection.updateConfig({
//       // Mode: 'casual' | 'standard' | 'proctored'
//       examMode: 'standard',

//       // Watermark settings
//       watermarkEnabled: true,
//       watermarkOpacity: 0.12,
//       watermarkCount: 25,
//       watermarkText: `${this.getUserDisplayName()} • ${this.courseTitle} • ${new Date().toLocaleDateString()}`,

//       // Alerts & Logging
//       enableAlerts: true,
//       enableLogging: true,
//       logEndpoint: '/api/security-events',

//       // Fullscreen lock
//       enableFullscreenLock: true,
//       fullscreenRetryInterval: 2000,

//       // Focus monitoring
//       focusCheckInterval: 1000,

//       // Violation handling - Choose one:
//       // 'warn' - Show warning, continue
//       // 'warn-penalty' - Show warning + apply time/score penalty
//       // 'log-only' - Silent logging, continue
//       // 'block' - Block navigation entirely
//       // 'auto-submit' - Auto-submit after max violations
//       violationAction: 'warn-penalty',
//       maxViolations: 5,
//       violationPenaltySeconds: 30,

//       // Mobile protection
//       enableMobileProtection: true,
//       preventZoom: true,

//       // Screenshot & DevTools blocking
//       enableScreenshotBlocking: true,
//       enableDevToolsBlocking: true,

//       // Wake Lock (keeps screen on)
//       enableWakeLock: true,
//     });

//     // Enable protection
//     this.quizProtection.enableProtection();

//     console.log('[Quiz Protection] Protection enabled for quiz:', this.qid);
//   }

//   /**
//    * Disable quiz protection
//    * Call this when quiz is submitted or user leaves legitimately
//    */
//   private disableQuizProtection(): void {
//     this.quizProtection.disableProtection();
//     console.log('[Quiz Protection] Protection disabled');
//   }

//   /**
//    * Handle violation events from protection service
//    */
//   private handleProtectionViolation(event: SecurityEvent): void {
//     // Log violation to your backend if needed
//     console.warn(`[Quiz Violation] Type: ${event.type}, Details: ${event.details}, Severity: ${event.severity}`);

//     // You can add custom handling here, like:
//     // - Showing additional warnings
//     // - Updating UI to show violation count
//     // - Notifying proctors in real-time

//     // Example: Show violation count in UI
//     if (this.protectionState.violationCount >= 3) {
//       this._snack.open(
//         `Warning: ${this.protectionState.violationCount} violations detected. ${5 - this.protectionState.violationCount} remaining before auto-submit.`,
//         'OK',
//         { duration: 5000 }
//       );
//     }
//   }

//   /**
//    * Handle auto-submit triggered by protection service
//    */
//   private handleAutoSubmitFromProtection(reason: string, violations: any[]): void {
//     console.log('[Quiz Protection] Auto-submitting due to:', reason);

//     // Show a final warning
//     Swal.fire({
//       icon: 'error',
//       title: 'Quiz Auto-Submitted',
//       text: `Your quiz has been automatically submitted due to: ${reason}`,
//       allowOutsideClick: false,
//       confirmButtonText: 'OK'
//     }).then(() => {
//       // Perform the auto-submit
//       this.performAutoSubmit(reason, violations);
//     });
//   }

//   /**
//    * Perform the actual auto-submit
//    */
//   private performAutoSubmit(reason: string, violations: any[]): void {
//     // Clear saved answers
//     this.clearSavedAnswers();

//     // Show loading
//     Swal.fire({
//       title: 'Submitting...',
//       text: 'Please wait while we submit your quiz.',
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading();
//       }
//     });

//     // Build evaluation list
//     const evaluations: Observable<any>[] = [];

//     if (this.timeO > 0) {
//       evaluations.push(this.evalQuiz());
//     }

//     if (this.timeT > 0) {
//       evaluations.push(this.evalSubjective());
//     }

//     if (evaluations.length === 0) {
//       this.finishAfterEvaluation();
//       return;
//     }

//     // Execute evaluations
//     forkJoin(evaluations).subscribe({
//       next: () => {
//         this.clearProgress();
//         this.disableQuizProtection();

//         Swal.fire({
//           icon: 'warning',
//           title: 'Quiz Submitted',
//           html: `
//             <p>Your quiz was auto-submitted due to security violations.</p>
//             <p><strong>Reason:</strong> ${reason}</p>
//             <p><strong>Violations:</strong> ${violations.length}</p>
//             <p><strong>Penalty Time:</strong> +${this.protectionState.penaltySeconds}s</p>
//           `,
//           timer: 5000,
//           showConfirmButton: true
//         });

//         setTimeout(() => {
//           if (window.opener) {
//             window.opener.location.href = '/user-dashboard/0';
//           }
//           window.close();
//         }, 5000);
//       },
//       error: (err) => {
//         console.error('Auto-submit evaluation failed', err);
//         Swal.fire({
//           icon: 'error',
//           title: 'Submission Error',
//           text: 'There was an error submitting your quiz. Please contact support.',
//         });
//       }
//     });
//   }

//   /**
//    * Get user display name for watermark
//    */
//   private getUserDisplayName(): string {
//     try {
//       const userData = localStorage.getItem('user');
//       if (userData) {
//         const user = JSON.parse(userData);
//         return user.username || user.name || user.email || 'Student';
//       }
//     } catch (e) {
//       console.error('Error getting user data:', e);
//     }
//     return 'Student';
//   }

//   /**
//    * Manually trigger fullscreen (e.g., from a button)
//    */
//   requestFullscreen(): void {
//     this.quizProtection.enterFullscreen()
//       .then(() => {
//         console.log('Fullscreen activated');
//       })
//       .catch(err => {
//         console.warn('Could not enter fullscreen:', err);
//         this._snack.open('Please enable fullscreen mode for the quiz', 'OK', { duration: 3000 });
//       });
//   }

//   /**
//    * Get current protection state for UI display
//    */
//   getProtectionState(): QuizProtectionState {
//     return this.protectionState;
//   }

//   // ============================================================================
//   // HOST LISTENERS
//   // ============================================================================

//   @HostListener('window:beforeunload', ['$event'])
//   beforeUnloadHandler(event: Event): void {
//     this.saveTimerToDatabase();
//     console.log('timerAll:', this.timerAll);
//     console.log("Helllooooo...");
//     this.preventBackButton();
//     event.returnValue = '' as any;
//   }

//   @HostListener('window:unload', ['$event'])
//   unloadHandler(event: Event): void {
//     this.preventBackButton();
//   }

//   // ============================================================================
//   // FORM INITIALIZATION
//   // ============================================================================

//   initForm(): void {
//     const formGroupConfig = {};
//     this.questionT.forEach(question => {
//       formGroupConfig[question.id] = ['', Validators.required];
//     });
//     this.quizForm = this.fb.group(formGroupConfig);
//   }

//   get isSubmitDisabled(): boolean {
//     const selectedCount = Object.values(this.selectedQuestions).filter(val => val === true).length;
//     const compulsoryGroups = this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
//     const allCompulsorySelected = compulsoryGroups.every(prefix => this.selectedQuestions[prefix] === true);
//     const hasCorrectTotal = selectedCount === this.numberOfQuestionsToAnswer;
//     return !allCompulsorySelected || !hasCorrectTotal;
//   }

//   // ============================================================================
//   // TIMER METHODS
//   // ============================================================================

//   totalTime(): number {
//     const timeT = Number(this.timeT) || 0;
//     const quizTime = Number(this.quiz.quizTime) || 0;
//     return timeT + quizTime;
//   }

//   getFormmatedTime(): string {
//     const hr = Math.floor(this.timerAll / 3600);
//     const mm = Math.floor((this.timerAll % 3600) / 60);
//     const ss = this.timerAll % 60;

//     let formattedTime = '';
//     if (hr > 0) {
//       formattedTime += `${hr} hr(s) : `;
//     }
//     formattedTime += `${mm} min : ${ss} sec`;
//     return formattedTime;
//   }

//   initializeTimer(): void {
//     this.quiz_progress.getQuizTimer(this.qid).subscribe({
//       next: (savedTimer) => {
//         this.timerAll = (savedTimer?.remainingTime && savedTimer.remainingTime > 0)
//           ? savedTimer.remainingTime
//           : (this.timeT + this.timeO) * 60;

//         if (!savedTimer || savedTimer.remainingTime <= 0) {
//           this.saveTimerToDatabase();
//         }

//         this.isTimerLoaded = true;
//         this.startCountdown();
//       },
//       error: () => {
//         this.timerAll = (this.timeT + this.timeO) * 60;
//         this.isTimerLoaded = true;
//         this.startCountdown();
//       }
//     });
//   }

//   private startCountdown(): void {
//     this.timerSubscription?.unsubscribe();

//     this.timerSubscription = interval(1000).subscribe(() => {
//       this.timerAll--;

//       if (this.timerAll % 10 === 0) {
//         this.saveTimerToDatabase();
//       }

//       if (this.timerAll <= 0) {
//         this.onTimerExpired();
//       }
//     });
//   }

//   private onTimerExpired(): void {
//     if (this.isExpiredHandled) return;
//     this.isExpiredHandled = true;

//     this.timerSubscription?.unsubscribe();
//     this.timerAll = 0;
//     this.saveTimerToDatabase();
//     this.showTimeUpModal = true;

//     const total = 5;
//     let count = total;
//     this.countdownText = count.toString();
//     this.progressPercent = 100;

//     const timerInterval = setInterval(() => {
//       count--;
//       this.progressPercent = (count / total) * 100;

//       if (count > 0) {
//         this.countdownText = count.toString();
//         if (count <= 3) {
//           this.audio.currentTime = 0;
//           this.audio.play().catch(() => {});
//         }
//       } else {
//         clearInterval(timerInterval);
//         this.countdownText = 'Submitting...';
//         this.progressPercent = 0;

//         setTimeout(() => {
//           const observables: Observable<any>[] = [];

//           if (this.evalQuiz) {
//             observables.push(this.evalQuiz());
//           }
//           if (this.evalSubjective) {
//             observables.push(this.evalSubjective());
//           }

//           if (observables.length === 0) {
//             this.finishAfterEvaluation();
//             return;
//           }

//           forkJoin(
//             observables.map(obs =>
//               obs.pipe(
//                 catchError(err => {
//                   console.error('One evaluation failed:', err);
//                   return of(null);
//                 })
//               )
//             )
//           ).subscribe({
//             next: () => {
//               console.log('All evaluations completed');
//               this.finishAfterEvaluation();
//             },
//             error: (err) => {
//               console.error('Unexpected error in evaluation', err);
//               this.finishAfterEvaluation();
//             }
//           });
//         }, 700);
//       }
//     }, 1000);
//   }

//   private finishAfterEvaluation(): void {
//     this.showTimeUpModal = false;
//     this.disableQuizProtection(); // <-- DISABLE PROTECTION
//     this.preventBackButton();
//     if (window.opener) {
//       window.opener.location.href = '/user-dashboard/0';
//     }
//     window.close();
//   }
//   private saveTimerToDatabase(): void {
//     this.quiz_progress.saveQuizTimer(this.qid, this.timerAll).subscribe({
//       next: (response) => {
//         console.log('Timer saved successfully:', response);
//       },
//       error: (error) => {
//         console.error('Failed to save timer:', error);
//       }
//     });
//   }
//   private startAutoSave(): void {
//     this.autoSaveSubscription = interval(10000).subscribe(() => {
//       if (this.isTimerLoaded && this.timerAll > 0) {
//         this.saveTimerToDatabase();
//       }
//     });
//   }
//   // ============================================================================
//   // THEORY/SUBJECTIVE QUESTIONS
//   // ============================================================================
//   loadTheory(): void {
//     this._questions.getSubjective(this.qid).subscribe(
//       (theory: any) => {
//         console.log(theory);
//         this.groupedQuestions = this.getQuestionsGroupedByPrefix(theory);
//         this.prefixes = this.sortPrefixesByCompulsory(this.groupedQuestions);
//         this.compulsoryPrefixes = this.getCompulsoryPrefixes();
//         this.loadQuestionsTheory();
//         console.log(this.groupedQuestions);
//         this.preventBackButton();

//         if (!this.isLoading) {
//           this.isLoading = false;
//         }
//       },
//       (error) => {
//         console.log("Could not load data from server");
//         this.isLoading = false;
//       }
//     );
//   }
//   getCompulsoryPrefixes(): string[] {
//     return this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
//   }
//   isCurrentGroupCompulsory(): boolean {
//     if (!this.currentQuestions || this.currentQuestions.length === 0) {
//       return false;
//     }
//     return this.currentQuestions.every(q => q.isCompulsory);
//   }
//   isGroupCompulsory(prefix: string): boolean {
//     const questions = this.groupedQuestions[prefix];
//     if (!questions || questions.length === 0) {
//       return false;
//     }
//     return questions.every((q: any) => q.isCompulsory);
//   }
//   sortPrefixesByCompulsory(groupedQuestions: any): string[] {
//     const prefixes = Object.keys(groupedQuestions);
//     return prefixes.sort((prefixA, prefixB) => {
//       const questionsA = groupedQuestions[prefixA];
//       const questionsB = groupedQuestions[prefixB];
//       const isGroupACompulsory = questionsA.every((q: any) => q.isCompulsory);
//       const isGroupBCompulsory = questionsB.every((q: any) => q.isCompulsory);

//       if (isGroupACompulsory && !isGroupBCompulsory) return -1;
//       if (!isGroupACompulsory && isGroupBCompulsory) return 1;
//       return prefixA.localeCompare(prefixB, undefined, { numeric: true });
//     });
//   }
//   getQuestionsGroupedByPrefix(questions): any {
//     return questions.reduce((acc, question) => {
//       const prefix = question.quesNo.match(/^[A-Za-z]+[0-9]+/)[0];
//       if (!acc[prefix]) {
//         acc[prefix] = [];
//       }
//       acc[prefix].push(question);
//       return acc;
//     }, {});
//   }
//   loadQuestionsTheory(): void {
//     this.prefixes.forEach(prefix => {
//       if (this.isGroupCompulsory(prefix)) {
//         this.selectedQuestions[prefix] = true;
//       }
//     });
//     const key = this.prefixes[this.currentPage];
//     this.currentQuestions = this.groupedQuestions[key] || [];
//     this.loadAnswers();
//   }
//   togglePrefixSelection(prefix: string): void {
//     if (this.isGroupCompulsory(prefix)) {
//       this.selectedQuestions[prefix] = true;
//       alert(`${prefix} contains compulsory questions and cannot be deselected.`);
//       return;
//     }
//     this.selectedQuestions[prefix] = !this.selectedQuestions[prefix];
//     console.log('After toggle:', this.selectedQuestions);
//   }
//   onPrefixChange(prefix: string): void {
//     this.selectedPrefix = prefix;
//   }
//   nextPage(): void {
//     this.saveAnswers();
//     if (this.currentPage < this.prefixes.length - 1) {
//       this.currentPage++;
//       this.loadQuestionsTheory();
//     }
//   }

//   prevPage(): void {
//     this.saveAnswers();
//     if (this.currentPage > 0) {
//       this.currentPage--;
//       this.loadQuestionsTheory();
//     }
//   }

//   onQuestionSelect(question: Question): void {
//     if (question.selected) {
//       question.selected = false;
//       this.selectedQuestionsCount--;
//     } else {
//       if (this.selectedQuestionsCount < 2) {
//         question.selected = true;
//         this.selectedQuestionsCount++;
//       } else {
//         alert('You can only select 2 questions.');
//       }
//     }
//   }

//   // ============================================================================
//   // QUESTIONS LOADING
//   // ============================================================================

//   loadQuestionsWithAnswers(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe(
//       (data: any) => {
//         this.questionWithAnswers = data;
//         console.log(data);
//         console.log(this.questionWithAnswers);
//       },
//       (error) => {
//         console.log("Error Loading questions");
//         Swal.fire("Error", "Error loading questions with answers", "error");
//       }
//     );
//     this.preventBackButton();
//   }

//   loadQuestions(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe(
//       (data: any) => {
//         const storedAnswers = JSON.parse(localStorage.getItem('selectedAnswers') || '{}');
//         this.loadSavedAnswers();

//         this.questions = data.map((q, index) => {
//           q.count = index + 1;
//           if (storedAnswers[q.quesId]) {
//             q.givenAnswer = [...storedAnswers[q.quesId]];
//           } else {
//             q.givenAnswer = [];
//           }
//           console.log(`📥 Question ID: ${q.quesId}, Restored Answers:`, q.givenAnswer);
//           return q;
//         });

//         this.isLoading = false;
//         console.log("✅ Final loaded questions:", this.questions);
//         this.initializeTimer();
//       },
//       (error) => {
//         console.log("Error Loading questions");
//         this.isLoading = false;
//         Swal.fire("Error", "Error loading questions", "error");
//       }
//     );
//     this.preventBackButton();
//   }

//   // ============================================================================
//   // NAVIGATION PREVENTION
//   // ============================================================================

//   preventBackButton(): void {
//     history.pushState(null, null, location.href);
//     this.locationSt.onPopState(() => {
//       history.pushState(null, null, location.href);
//     });
//   }

//   // ============================================================================
//   // QUIZ SUBMISSION
//   // ============================================================================

//   submitQuiz(): void {
//     Swal.fire({
//       title: "Do you want to submit the quiz?",
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Submit",
//       cancelButtonText: "Cancel"
//     }).then((e) => {
//       if (e.isConfirmed) {
//         this.clearSavedAnswers();
//         Swal.fire({
//           title: 'Evaluating...',
//           text: `Please wait while we evaluate your quiz for "${this.courseTitle}".`,
//           allowOutsideClick: false,
//           didOpen: () => {
//             Swal.showLoading();
//           }
//         });

//         setTimeout(() => {
//           this.evalQuiz();
//           this.waitNavigateFunction();
//           this.loadQuestionsWithAnswers();
//           this.clearProgress();
//           this.preventBackButton();
//           this.disableQuizProtection(); // <-- DISABLE PROTECTION

//           Swal.fire({
//             icon: 'success',
//             title: 'Evaluated!',
//             text: `Your results for "${this.courseTitle}" is available for print on the dashboard.`,
//             timer: 1000,
//             showConfirmButton: false
//           });
//           setTimeout(() => {
//             window.close();
//             if (window.opener) {
//               window.opener.location.href = '/user-dashboard/0';
//             }
//           }, 1200);
//         }, 3000);
//       }
//     });
//   }

//   async submitAllQuiz(): Promise<void> {
//     Swal.fire({
//       title: "Do you want to submit the quiz?",
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Submit",
//       cancelButtonText: "Cancel"
//     }).then((e) => {
//       if (!e.isConfirmed) return;

//       this.clearSavedAnswers();

//       Swal.fire({
//         title: 'Evaluating...',
//         text: `Please wait while we evaluate your quiz for ${this.courseTitle}.`,
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         }
//       });

//       const evaluations: Observable<any>[] = [];

//       if (this.timeO > 0) {
//         evaluations.push(this.evalQuiz());
//       }

//       if (this.timeT > 0) {
//         evaluations.push(this.evalSubjective());
//       }

//       if (evaluations.length === 0) {
//         this.finishAfterEvaluation();
//         return;
//       }

//       forkJoin(evaluations).subscribe({
//         next: () => {
//           this.waitNavigateFunction();
//           this.loadQuestionsWithAnswers();
//           this.clearProgress();
//           this.preventBackButton();
//           this.disableQuizProtection(); // <-- DISABLE PROTECTION

//           Swal.fire({
//             icon: 'success',
//             title: 'Evaluated!',
//             text: `Your results for ${this.courseTitle} are available on the dashboard.`,
//           });

//           setTimeout(() => {
//             if (window.opener) {
//               window.opener.location.href = '/user-dashboard/0';
//             }
//             window.close();
//           }, 1200);
//         },
//         error: (err) => {
//           console.error('Evaluation failed', err);
//           Swal.fire({
//             icon: 'error',
//             title: 'Evaluation failed',
//             text: 'Please contact support.',
//           });
//         }
//       });
//     });
//   }

//   clearProgress(): void {
//     this.quiz_progress.clearQuizAnswers(this.qid).subscribe(
//       (data: any) => {
//         console.log("Quiz Progress has been cleared!!");
//       },
//       (error) => {
//         console.log("Error clearing quiz progress");
//       }
//     );
//   }

//   waitNavigateFunction(): void {
//     setTimeout(() => {
//       this.printQuiz();
//     }, 3000);
//   }

//   printQuiz(): void {
//     this.router.navigate(['./user-dashboard/0']);
//   }

//   // ============================================================================
//   // EVALUATION METHODS
//   // ============================================================================

//   evalQuiz(): Observable<any> {
//     return new Observable(observer => {
//       this._questions.evalQuiz(this.qid, this.questions).subscribe({
//         next: (data: any) => {
//           console.log(this.questions, data);
//           this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
//           this.correct_answer = data.correct_answer;
//           this.attempted = data.attempted;
//           this.maxMarks = data.maxMarks;

//           localStorage.setItem('CorrectAnswer', JSON.stringify(this.correct_answer));
//           localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
//           localStorage.setItem('Attempted', JSON.stringify(this.attempted));
//           localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks));

//           this.clearSavedAnswers();
//           this.preventBackButton();
//           this.isSubmit = true;

//           observer.next(data);
//           observer.complete();
//         },
//         error: (err) => {
//           console.error('Evaluation Error', err);
//           observer.error(err);
//         }
//       });
//     });
//   }

//   evalSubjective(): Observable<any> {
//     return new Observable(observer => {
//       for (const prefix in this.selectedQuestions) {
//         this.selectedQuestionsAnswer.push(...this.groupedQuestions[prefix]);
//       }
//       if (Object.keys(this.selectedQuestions).length !== this.numberOfQuestionsToAnswer) {
//         this._snack.open("Please select exactly 3 sets of questions to submit", "", {
//           duration: 3000,
//         });
//         observer.error('Not enough questions selected');
//         return;
//       }

//       localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestions));
//       this.convertJson();
//       this._quiz.evalTheory(this.convertedJsonAPIResponsebody).subscribe({
//         next: (data: any) => {
//           console.log("Server Response:", data);
//           this.geminiResponse = data;
//           localStorage.setItem("answeredAIQuestions" + this.qid, JSON.stringify(this.geminiResponse));

//           setTimeout(() => {
//             this.loadSubjectiveAIEval();
//           }, 1000);

//           observer.next(data);
//           observer.complete();
//         },
//         error: (err) => {
//           console.error("Subjective evaluation failed", err);
//           observer.error(err);
//         }
//       });
//     });
//   }

//   // ============================================================================
//   // SUBJECTIVE EVALUATION HELPERS
//   // ============================================================================

//   loadSubjectiveAIEval(): void {
//     const geminiResponse = localStorage.getItem("answeredAIQuestions" + this.qid);
//     console.log(geminiResponse);
//     this.geminiResponseAI = this.groupByPrefix(this.geminiResponse);
//     console.log('This is the geminiResponse groupedByPrefixes', this.geminiResponseAI);
//     console.log("CHECKING ...");
//     this.getScoresForPrefixes(this.geminiResponseAI);
//     this.getGrandTotalMarks();
//     this.addSectBMarks();
//   }

//   getTotalMarksForPrefix(questions: any[]): number {
//     if (!questions || questions.length === 0) {
//       return 0;
//     }
//     return questions.reduce((total, question) => {
//       return total + (question.score || 0);
//     }, 0);
//   }

//   groupByPrefix(data: QuestionResponse[]): GroupedQuestions[] {
//     if (!Array.isArray(data)) {
//       throw new Error('Input must be an array');
//     }
//     if (data.length === 0) {
//       return [];
//     }

//     const prefixMap: Record<string, QuestionResponse[]> = {};

//     data.forEach((questionResponse) => {
//       if (!questionResponse.questionNumber) {
//         console.warn('Question missing questionNumber:', questionResponse);
//         return;
//       }

//       const prefixMatch = questionResponse.questionNumber.match(/^(Q\d+)/i);
//       const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : 'UNCATEGORIZED';

//       if (!prefixMap[prefix]) {
//         prefixMap[prefix] = [];
//       }
//       prefixMap[prefix].push(questionResponse);
//     });

//     return Object.entries(prefixMap).map(([prefix, questions]) => ({
//       prefix,
//       questions
//     }));
//   }

//   getGrandTotalMarks(): number {
//     this.sectionBMarks = 0;

//     if (!this.geminiResponseAI || this.geminiResponseAI.length === 0) {
//       return 0;
//     }

//     this.sectionBMarks = this.geminiResponseAI.reduce((grandTotal, group) => {
//       const prefixScores = this.getScoresForPrefixes([group]);
//       const groupTotal = prefixScores.reduce((sum, p) => sum + p.totalScore, 0);
//       return grandTotal + groupTotal;
//     }, 0);

//     console.log("Grand Total Marks: ", this.sectionBMarks);
//     return this.sectionBMarks;
//   }

//   addSectBMarks(): void {
//     this.theoryResults = {
//       marksB: this.sectionBMarks,
//       quiz: {
//         qId: this.qid
//       }
//     };

//     console.log(this.theoryResults);
//     console.log(this.theoryResults.marksB);
//     console.log(this.theoryResults.quiz.qId);

//     this._quiz.addSectionBMarks(this.theoryResults).subscribe(
//       (data) => {
//         console.log("Marks successful");
//       },
//       (error) => {
//         console.log("Unsuccessful");
//       }
//     );
//   }

//   getScoresForPrefixes(groupedData: GroupedQuestions[]): PrefixScores[] {
//     return groupedData.map(group => {
//       const { prefix, questions } = group;
//       const safeQuestions = Array.isArray(questions) ? questions : [];
//       const totalScore = safeQuestions.reduce((sum, q) => sum + q.score, 0);
//       const totalMaxMarks = safeQuestions.reduce((sum, q) => sum + q.maxMarks, 0);
//       const percentage = totalMaxMarks > 0
//         ? Math.round((totalScore / totalMaxMarks) * 100)
//         : 0;

//       console.log("Total Marks for Prefix: ", totalScore, totalMaxMarks);

//       return {
//         prefix,
//         totalScore,
//         totalMaxMarks,
//         percentage
//       };
//     });
//   }

//   getPrefixes(): string[] {
//     const prefixes = new Set<string>();
//     this.selectedQuestionsAnswer.forEach(question => {
//       const prefix = question.quesNo.match(/^Q\d+/)?.[0];
//       if (prefix) {
//         prefixes.add(prefix);
//       }
//     });
//     return Array.from(prefixes);
//   }

//   getGroupedQuestions(prefix: string): any[] {
//     return this.selectedQuestionsAnswer.filter(q => q.quesNo.startsWith(prefix));
//   }

//   // ============================================================================
//   // UTILITY METHODS
//   // ============================================================================

//   printPage(): void {
//     window.print();
//   }

//   saveDataInBrowser(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {});
//   }

//   disablePaste(event: ClipboardEvent): void {
//     event.preventDefault();
//   }

//   preventAction(event: Event): void {
//     event.preventDefault();
//     event.stopPropagation();
//     this.showWarningMessage('Copy/Paste operations are disabled during the exam');
//     return;
//   }

//   private showWarningMessage(message: string): void {
//     console.warn(message);
//   }

//   // ============================================================================
//   // ANSWER PERSISTENCE
//   // ============================================================================

//   clearSavedAnswers(): void {
//     this.quiz_progress.clearAnswers(this.qid).subscribe({
//       next: (response) => {
//         console.log(response.message);
//         this.currentQuestions.forEach((q: any) => {
//           q.givenAnswer = '';
//         });
//       },
//       error: (error) => {
//         console.error('Error clearing answers:', error);
//       }
//     });
//   }

//   updateSelectedAnswers(q: any, option: string, isChecked: boolean): string[] {
//     if (!q.givenAnswer) {
//       q.givenAnswer = [];
//     }

//     if (isChecked) {
//       if (!q.givenAnswer.includes(option)) {
//         q.givenAnswer.push(option);
//       }
//     } else {
//       const index = q.givenAnswer.indexOf(option);
//       if (index !== -1) {
//         q.givenAnswer.splice(index, 1);
//       }
//     }

//     const currentAnswers = [...q.givenAnswer];

//     const request: QuizAnswerRequest = {
//       questionId: q.quesId,
//       option: option,
//       checked: isChecked,
//       quizId: this.qid
//     };

//     this.quiz_progress.updateAnswer(request).subscribe({
//       next: (response) => {
//         if (response.selectedOptions && Array.isArray(response.selectedOptions)) {
//           console.log("Server returned:", response.selectedOptions);
//           console.log("Local state:", currentAnswers);
//         }
//       },
//       error: (error) => {
//         console.error("❌ Error saving answer:", error);
//         q.givenAnswer = currentAnswers;
//       }
//     });

//     return q.givenAnswer;
//   }

//   loadSavedAnswers(): void {
//     this.quiz_progress.getAnswersByQuiz(this.qid).subscribe({
//       next: (response: UserQuizAnswersResponse) => {
//         console.log("📥 Loaded saved answers:", response);

//         this.questions.forEach((q: any) => {
//           if (response.answers && response.answers[q.quesId]) {
//             q.givenAnswer = response.answers[q.quesId];
//           } else {
//             q.givenAnswer = [];
//           }
//         });

//         console.log("✅ Questions with answers:", this.questions);
//       },
//       error: (error) => {
//         console.error("❌ Error loading saved answers:", error);
//         this.questions.forEach((q: any) => {
//           q.givenAnswer = [];
//         });
//       }
//     });
//   }

//   saveAnswers(): void {
//     const answersToSave = this.currentQuestions.map((q: any) => ({
//       quesNo: q.quesNo,
//       givenAnswer: q.givenAnswer || ''
//     }));
//     this.quiz_progress.saveAnswers(this.qid, answersToSave).subscribe({
//       next: (response) => {
//         console.log('Answers saved to backend successfully');
//       },
//       error: (error) => {
//         console.error('Error saving answers:', error);
//       }
//     });
//   }

//   loadAnswers(): void {
//     this.quiz_progress.loadAnswers(this.qid).subscribe({
//       next: (savedAnswers) => {
//         this.currentQuestions.forEach((q: any) => {
//           const saved = savedAnswers.find((s: any) => s.quesNo === q.quesNo);
//           if (saved) {
//             q.givenAnswer = saved.givenAnswer;
//           }
//         });
//       },
//       error: (error) => {
//         console.error('Error loading answers:', error);
//       }
//     });
//   }

//   // ============================================================================
//   // PAGINATION
//   // ============================================================================

//   onTableDataChange(event: any): void {
//     this.page = event;
//   }

//   onTableSizeChange(event: any): void {
//     this.tableSize = event.target.value;
//     this.page = 1;
//   }

//   // ============================================================================
//   // JSON CONVERSION FOR API
//   // ============================================================================

//   convertJson(): any {
//     this.convertedJsonAPIResponsebody = {
//       contents: [
//         {
//           parts: this.selectedQuestionsAnswer.map(item => {
//             const quizId = item.quiz.qId;
//             const quesId = item.tqId;
//             const questionNo = item.quesNo;
//             const question = item.question;
//             const answer = item.givenAnswer ? item.givenAnswer : '';
//             const marks = item.marks ? item.marks.split(' ')[0] : '';
//             let criteria = 'Evaluate based on clarity, completeness, and accuracy';

//             const text = `quizId ${quizId}: tqid ${quesId}: Question Number ${questionNo}: ${question}. Answer: ${answer}. Marks: ${marks} Criteria:${criteria}.`;

//             return { text: text };
//           })
//         }
//       ]
//     };

//     console.log(this.convertedJsonAPIResponsebody);
//     return this.convertedJsonAPIResponsebody;
//   }
// }



// NEW NEW IMPLEMENTATION

// import { LocationStrategy } from '@angular/common';
// import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { QuestionService } from 'src/app/services/question.service';
// import { QuizService } from 'src/app/services/quiz.service';
// import { Router, } from '@angular/router';
// import { Question } from 'src/model testing/model';
// import { FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { LoginService } from 'src/app/services/login.service';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { QuizProgressService } from 'src/app/services/quiz-progress.service';
// import { QuizAnswerRequest } from 'src/app/services/quiz-progress.service';
// import { UserQuizAnswersResponse } from 'src/app/services/quiz-progress.service';
// import { interval, Subscription } from 'rxjs';
// import { Observable, forkJoin, of } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import Swal from 'sweetalert2';
// import { ScreenshotPreventionService } from 'src/app/services/ScreenshotPreventionService ';

// import { 
//   QuizProtectionService,
//   ViolationAction,
//   ExamMode,
//   QuizProtectionState,
//   SecurityEvent,
//   AutoSubmitPayload
// } from 'src/app/services/QuizProtectionService';

// interface QuizAnswers {
//   [prefix: string]: {
//     [tqId: number]: string
//   }
// }

// interface QuestionResponse {
//   questionNumber: string;
//   question: string;
//   studentAnswer: string;
//   score: number;
//   maxMarks: number;
//   feedback: string;
//   keyMissed: string[];
// }

// interface GroupedQuestions {
//   prefix: string;
//   questions: QuestionResponse[];
// }

// interface PrefixScores {
//   prefix: string;
//   totalScore: number;
//   totalMaxMarks: number;
//   percentage: number;
// }

// interface Category {
//   cid: number;
//   level: string;
//   title: string;
//   description: string;
//   courseCode: string;
// }

// interface Quiz {
//   qId: number;
//   title: string;
//   description: string;
//   maxMarks: string;
//   quizTime: string;
//   numberOfQuestions: string;
//   active: boolean;
//   attempted: boolean;
//   quizpassword: string;
//   category: Category;
// }

// @Component({
//   selector: 'app-start',
//   templateUrl: './start.component.html',
//   styleUrls: ['./start.component.css']
// })
// export class StartComponent implements OnInit, OnDestroy {

//   // ============================================================================
//   // QUIZ PROTECTION STATE
//   // ============================================================================
//   protectionState: QuizProtectionState = {
//     isActive: false,
//     isFullscreen: false,
//     violationCount: 0,
//     violations: [],
//     penaltySeconds: 0,
//     autoSubmitTriggered: false,
//     autoSubmitCountdown: undefined,
//   };
//   private protectionSubscriptions: Subscription[] = [];

//   // ============================================================================
//   // PAGINATION
//   // ============================================================================
//   private readonly QUIZ_STORAGE_KEY = 'quiz_answers_by_prefix';
//   title = "pagination";
//   page: number = 1;
//   count: number = 0;
//   tableSize: number = 3;
//   tableSizes: any = [3, 6, 9, 12];
//   isLoading: boolean = true;
//   checked: true;

//   // ============================================================================
//   // QUIZ DATA
//   // ============================================================================
//   catId;
//   quizzes;
//   questions;
//   questionss;
//   qid;
//   questionWithAnswers;
//   marksGot = 0;
//   maxMarks = 0;
//   correct_answer = 0;
//   attempted: any;
//   isSubmit = false;
//   isNavigating = false;
//   second: number;
//   minutes: number;
//   count_timer: any;
//   timeT: number = 0;
//   timerAll: number = 0;
//   timeO: number = 0;
//   quizTitle;
//   courseTitle;
//   quiz;
//   noOfQuesObject;
//   private intervalId: any;

//   // ============================================================================
//   // SUBJECTIVE QUESTIONS
//   // ============================================================================
//   questionT: Question[] = [];
//   filteredQuestions: Question[] = [];
//   itemsPerPage: number = 5;
//   groupedQuestions: { [key: string]: Question[] } = {};
//   prefixes: string[] = [];
//   currentPage: number = 0;
//   selectedQuestions: { [key: string]: boolean } = {};
//   selectedPrefix: string;
//   selectedQuestionsCount: number = 0;
//   numberOfQuestionsToAnswer: number = 0;
//   quizForm: FormGroup;
//   selectedQuestionsAnswer = [];
//   convertedJsonAPIResponsebody: any;
//   sectionB: any[] = [];
//   question: Question[] = [];
//   geminiResponse: any[] = [];
//   geminiResponseAI;
//   sectionBMarks;
//   theoryResults = {
//     marksB: "",
//     quiz: {
//       qId: ""
//     }
//   }
//   localStorageKey = 'quiz_answers';
//   public currentQuestions: Question[] = [];
//   compulsoryPrefixes: string[] = [];

//   // ============================================================================
//   // TIMER
//   // ============================================================================
//   showTimeUpModal = false;
//   private isExpiredHandled = false;
//   countdownText = '';
//   progressPercent = 100;
//   private audio = new Audio('/assets/beep.mp3');
//   private timerSubscription: Subscription;
//   private autoSaveSubscription: Subscription;
//   private isTimerLoaded: boolean = false;

//   constructor(
//     private _quiz: QuizService,
//     private fb: FormBuilder,
//     private login: LoginService,
//     private locationSt: LocationStrategy,
//     private _route: ActivatedRoute,
//     private _snack: MatSnackBar,
//     private _questions: QuestionService,
//     private router: Router,
//     private quiz_progress: QuizProgressService,
//     private screenshotPrevention: ScreenshotPreventionService,
//     private quizProtection: QuizProtectionService // <-- INJECT THE PROTECTION SERVICE
//   ) {}

//   // ============================================================================
//   // LIFECYCLE HOOKS
//   // ============================================================================

//   ngOnInit(): void {

//   this.screenshotPrevention.enableProtection();
//     this.isLoading = true;
//     this.qid = this._route.snapshot.params['qid'];
//     console.log(this.qid);

//     // Setup protection subscriptions FIRST
//     this.setupProtectionSubscriptions();

//     this._quiz.getQuiz(this.qid).subscribe(
//       (data: any) => {
//         console.log(data.title);
//         this.quiz = data;
//         this.courseTitle = this.quiz.category.title;
//         console.log(this.quiz);
//         console.log(this.quiz.quizTime);

//         this.timeO = this.quiz.quizTime * 1;
//         this.timerAll = (this.timeT + this.timeO) * 60;

//         console.log(this.timerAll);
//         console.log(this.timeO * 60);

//         // Enable protection AFTER quiz data is loaded
//         this.enableQuizProtection();
//       },
//       (error) => {
//         this.isLoading = false;
//         this._snack.open("You're Session has expired! ", "", {
//           duration: 3000,
//         });
//         this.login.logout();
//         console.log("error !!");
//       }
//     );

//     this.loadQuestions();

//     this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe(
//       (data: any) => {
//         this.numberOfQuestionsToAnswer = data[0].totalQuestToAnswer;
//         console.log("This is for number of questions to answer", data[0].timeAllowed);
//         console.log("Number question to answer ", data[0].totalQuestToAnswer);
//         this.quizTitle = data[0].quiz.title;
//         this.courseTitle = data[0].quiz.category.title;

//         this.loadTheory();
//         this.timeT = data[0].timeAllowed;
//         console.log("This is the number of questions to answer", this.numberOfQuestionsToAnswer);
//         console.log("This is the time for the Theory ", this.timeT);

//         this.startAutoSave();
//       },
//       (error) => {
//         this.isLoading = false;
//       }
//     );

//     this.initForm();
//     this.preventBackButton();
//   }

//   ngOnDestroy(): void {
//     // CRITICAL: Disable protection when leaving the component
//     this.disableQuizProtection();

//     // Save timer before leaving the page
//     if (this.isTimerLoaded && this.timerAll > 0) {
//       this.saveTimerToDatabase();
//     }

//     // Clean up subscriptions
//     if (this.timerSubscription) {
//       this.timerSubscription.unsubscribe();
//     }
//     if (this.autoSaveSubscription) {
//       this.autoSaveSubscription.unsubscribe();
//     }

//     // Clean up protection subscriptions
//     this.protectionSubscriptions.forEach(sub => sub.unsubscribe());
//   }

//   // ============================================================================
//   // QUIZ PROTECTION METHODS
//   // ============================================================================

//   /**
//    * Setup subscriptions to protection service events
//    */
//   private setupProtectionSubscriptions(): void {
//     // Subscribe to state changes
//     this.protectionSubscriptions.push(
//       this.quizProtection.onStateChange.subscribe(state => {
//         this.protectionState = state;
//         console.log('[Quiz Protection] State updated:', state);
//       })
//     );

//     // Subscribe to violations
//     this.protectionSubscriptions.push(
//       this.quizProtection.onViolation.subscribe(event => {
//         console.log('[Quiz Protection] Violation detected:', event);
//         this.handleProtectionViolation(event);
//       })
//     );

//     // Subscribe to auto-submit warning (when getting close to max violations)
//     this.protectionSubscriptions.push(
//       this.quizProtection.onAutoSubmitWarning.subscribe(({ remaining, total }) => {
//         console.warn(`[Quiz Protection] Auto-submit warning: ${remaining}/${total} violations remaining`);
//         this.handleAutoSubmitWarning(remaining, total);
//       })
//     );

//     // Subscribe to auto-submit countdown
//     this.protectionSubscriptions.push(
//       this.quizProtection.onAutoSubmitCountdown.subscribe(countdown => {
//         console.log(`[Quiz Protection] Auto-submit countdown: ${countdown}`);
//         // You can update UI here if needed
//       })
//     );

//     // Subscribe to auto-submit execution - THIS IS THE MAIN AUTO-SUBMIT HANDLER
//     this.protectionSubscriptions.push(
//       this.quizProtection.onAutoSubmit.subscribe((payload: AutoSubmitPayload) => {
//         console.log('[Quiz Protection] Auto-submit executed:', payload);
//         this.executeAutoSubmitFromProtection(payload);
//       })
//     );

//     // Subscribe to auto-submit cancelled (if user somehow cancels)
//     this.protectionSubscriptions.push(
//       this.quizProtection.onAutoSubmitCancelled.subscribe(() => {
//         console.log('[Quiz Protection] Auto-submit was cancelled');
//         this._snack.open('Auto-submit cancelled. Please remain on the quiz page.', 'OK', { duration: 3000 });
//       })
//     );
//   }

//   /**
//    * Enable quiz protection with appropriate settings
//    * Call this when quiz is ready to start
//    */
//   private enableQuizProtection(): void {
//     // Configure protection based on your quiz requirements
//     // You can make this dynamic based on quiz settings from backend

//     this.quizProtection.updateConfig({
//       // Mode: 'casual' | 'standard' | 'proctored'
//       // Use 'proctored' for strict auto-submit behavior
//       examMode: 'proctored',

//       // Watermark settings
//       watermarkEnabled: true,
//       watermarkOpacity: 0.12,
//       watermarkCount: 25,
//       watermarkText: `${this.getUserDisplayName()} • ${this.courseTitle} • ${new Date().toLocaleDateString()}`,

//       // Alerts & Logging
//       enableAlerts: true,
//       enableLogging: true,
//       logEndpoint: '/api/security-events',

//       // Fullscreen lock
//       enableFullscreenLock: true,
//       fullscreenRetryInterval: 2000,

//       // Focus monitoring
//       focusCheckInterval: 1000,

//       // VIOLATION HANDLING - AUTO-SUBMIT MODE
//       // This will auto-submit the quiz after maxViolations
//       violationAction: 'auto-submit',
//       maxViolations: 3,                    // Auto-submit after 3 violations
//       violationPenaltySeconds: 30,         // Add 30s penalty per violation

//       // Auto-submit specific settings
//       autoSubmitCountdownSeconds: 5,       // 5 second countdown before auto-submit
//       autoSubmitGracePeriodMs: 1000,       // 1 second grace period between violations

//       // Mobile protection
//       enableMobileProtection: true,
//       preventZoom: true,

//       // Screenshot & DevTools blocking
//       enableScreenshotBlocking: true,
//       enableDevToolsBlocking: true,

//       // Wake Lock (keeps screen on)
//       enableWakeLock: true,
//     });

//     // Enable protection
//     this.quizProtection.enableProtection();

//     console.log('[Quiz Protection] Protection enabled for quiz:', this.qid);
//     console.log('[Quiz Protection] Config:', this.quizProtection.getConfig());
//   }

//   /**
//    * Disable quiz protection
//    * Call this when quiz is submitted or user leaves legitimately
//    */
//   private disableQuizProtection(): void {
//     this.quizProtection.disableProtection();
//     console.log('[Quiz Protection] Protection disabled');
//   }

//   /**
//    * Handle violation events from protection service
//    */
//   private handleProtectionViolation(event: SecurityEvent): void {
//     console.warn(`[Quiz Violation] Type: ${event.type}, Details: ${event.details}, Severity: ${event.severity}`);

//     // Show violation count in UI when getting concerning
//     if (this.protectionState.violationCount >= 2) {
//       const remaining = this.quizProtection.getConfig().maxViolations - this.protectionState.violationCount;
//       if (remaining > 0) {
//         this._snack.open(
//           `⚠️ Warning: ${this.protectionState.violationCount} violations. ${remaining} remaining before auto-submit.`,
//           'OK',
//           { duration: 4000 }
//         );
//       }
//     }
//   }

//   /**
//    * Handle auto-submit warning (approaching max violations)
//    */
//   private handleAutoSubmitWarning(remaining: number, total: number): void {
//     // Show escalating warning using Swal
//     if (remaining === 1) {
//       Swal.fire({
//         icon: 'warning',
//         title: '⚠️ FINAL WARNING',
//         html: `
//           <p>You have <strong>${total - 1}</strong> violations.</p>
//           <p><strong>ONE MORE violation will AUTO-SUBMIT your quiz!</strong></p>
//           <p>Please stay on this page and do not:</p>
//           <ul style="text-align: left;">
//             <li>Switch tabs or windows</li>
//             <li>Exit fullscreen mode</li>
//             <li>Use keyboard shortcuts</li>
//             <li>Right-click on the page</li>
//           </ul>
//         `,
//         confirmButtonText: 'I Understand',
//         allowOutsideClick: false,
//         customClass: {
//           popup: 'swal-danger'
//         }
//       });
//     } else if (remaining === 2) {
//       Swal.fire({
//         icon: 'error',
//         title: '🚨 Critical Warning',
//         text: `Only ${remaining} violations remaining before your quiz is auto-submitted!`,
//         timer: 4000,
//         showConfirmButton: true
//       });
//     }
//   }

//   /**
//    * Execute auto-submit - called when protection service triggers auto-submit
//    */
//   private executeAutoSubmitFromProtection(payload: AutoSubmitPayload): void {
//     console.log('[Quiz Protection] Executing auto-submit with payload:', payload);

//     // Clear any saved draft answers
//     this.clearSavedAnswers();

//     // Build evaluation list based on quiz type
//     const evaluations: Observable<any>[] = [];

//     if (this.timeO > 0 && this.questions && this.questions.length > 0) {
//       evaluations.push(this.evalQuiz());
//     }

//     if (this.timeT > 0 && Object.keys(this.selectedQuestions).length > 0) {
//       evaluations.push(this.evalSubjective());
//     }

//     // If no evaluations needed, just finish
//     if (evaluations.length === 0) {
//       this.finalizeAutoSubmit(payload);
//       return;
//     }

//     // Execute all evaluations
//     forkJoin(
//       evaluations.map(obs =>
//         obs.pipe(
//           catchError(err => {
//             console.error('[Auto-Submit] Evaluation error:', err);
//             return of(null); // Continue even if one fails
//           })
//         )
//       )
//     ).subscribe({
//       next: (results) => {
//         console.log('[Auto-Submit] All evaluations completed:', results);
//         this.clearProgress();
//         this.finalizeAutoSubmit(payload);
//       },
//       error: (err) => {
//         console.error('[Auto-Submit] Unexpected error:', err);
//         this.finalizeAutoSubmit(payload);
//       }
//     });
//   }

//   /**
//    * Finalize the auto-submit process
//    */
//   private finalizeAutoSubmit(payload: AutoSubmitPayload): void {
//     // Disable protection
//     this.disableQuizProtection();

//     // Show final result to user
//     Swal.fire({
//       icon: 'error',
//       title: '⛔ Quiz Auto-Submitted',
//       html: `
//         <div style="text-align: left;">
//           <p><strong>Reason:</strong> ${payload.reason}</p>
//           <p><strong>Total Violations:</strong> ${payload.totalViolations}</p>
//           <p><strong>Time Penalty:</strong> +${payload.penaltySeconds} seconds</p>
//           <hr>
//           <p style="font-size: 14px; color: #666;">
//             Your quiz has been submitted with your current answers.
//             Results are available on the dashboard.
//           </p>
//         </div>
//       `,
//       confirmButtonText: 'Go to Dashboard',
//       allowOutsideClick: false,
//       allowEscapeKey: false
//     }).then((result) => {
//       // Navigate to dashboard
//       if (window.opener) {
//         window.opener.location.href = '/user-dashboard/0';
//       }
//       window.close();

//       // Fallback if window doesn't close
//       setTimeout(() => {
//         this.router.navigate(['/user-dashboard/0']);
//       }, 500);
//     });
//   }

//   /**
//    * Legacy handler - kept for backwards compatibility
//    */
//   private handleAutoSubmitFromProtection(reason: string, violations: any[]): void {
//     // This is now handled by executeAutoSubmitFromProtection
//     console.log('[Quiz Protection] Legacy auto-submit handler called');
//   }

//   /**
//    * Legacy perform auto-submit - kept for backwards compatibility
//    */
//   // private performAutoSubmit(reason: string, violations: any[]): void {
//   //   const payload: AutoSubmitPayload = {
//   //     reason,
//   //     violationType: 'legacy',
//   //     violations: violations,
//   //     totalViolations: this.protectionState.violationCount,
//   //     penaltySeconds: this.protectionState.penaltySeconds,
//   //     timestamp: new Date(),
//   //     userId: this.getUserDisplayName(),
//   //     username: this.getUserDisplayName(),
//   //   };
//   //   this.executeAutoSubmitFromProtection(payload);
//   // }

//   /**
//    * Get user display name for watermark
//    */
//   private getUserDisplayName(): string {
//     try {
//       const userData = localStorage.getItem('user');
//       if (userData) {
//         const user = JSON.parse(userData);
//         return user.username || user.name || user.email || 'Student';
//       }
//     } catch (e) {
//       console.error('Error getting user data:', e);
//     }
//     return 'Student';
//   }

//   /**
//    * Manually trigger fullscreen (e.g., from a button)
//    */
//   requestFullscreen(): void {
//     this.quizProtection.enterFullscreen()
//       .then(() => {
//         console.log('Fullscreen activated');
//       })
//       .catch(err => {
//         console.warn('Could not enter fullscreen:', err);
//         this._snack.open('Please enable fullscreen mode for the quiz', 'OK', { duration: 3000 });
//       });
//   }

//   /**
//    * Get current protection state for UI display
//    */
//   getProtectionState(): QuizProtectionState {
//     return this.protectionState;
//   }

//   // ============================================================================
//   // HOST LISTENERS
//   // ============================================================================

//   @HostListener('window:beforeunload', ['$event'])
//   beforeUnloadHandler(event: Event): void {
//     this.saveTimerToDatabase();
//     console.log('timerAll:', this.timerAll);
//     console.log("Helllooooo...");
//     this.preventBackButton();
//     event.returnValue = '' as any;
//   }

//   @HostListener('window:unload', ['$event'])
//   unloadHandler(event: Event): void {
//     this.preventBackButton();
//   }

//   // ============================================================================
//   // FORM INITIALIZATION
//   // ============================================================================

//   initForm(): void {
//     const formGroupConfig = {};
//     this.questionT.forEach(question => {
//       formGroupConfig[question.id] = ['', Validators.required];
//     });
//     this.quizForm = this.fb.group(formGroupConfig);
//   }

//   get isSubmitDisabled(): boolean {
//     const selectedCount = Object.values(this.selectedQuestions).filter(val => val === true).length;
//     const compulsoryGroups = this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
//     const allCompulsorySelected = compulsoryGroups.every(prefix => this.selectedQuestions[prefix] === true);
//     const hasCorrectTotal = selectedCount === this.numberOfQuestionsToAnswer;
//     return !allCompulsorySelected || !hasCorrectTotal;
//   }

//   // ============================================================================
//   // TIMER METHODS
//   // ============================================================================

//   totalTime(): number {
//     const timeT = Number(this.timeT) || 0;
//     const quizTime = Number(this.quiz.quizTime) || 0;
//     return timeT + quizTime;
//   }

//   getFormmatedTime(): string {
//     const hr = Math.floor(this.timerAll / 3600);
//     const mm = Math.floor((this.timerAll % 3600) / 60);
//     const ss = this.timerAll % 60;

//     let formattedTime = '';
//     if (hr > 0) {
//       formattedTime += `${hr} hr(s) : `;
//     }
//     formattedTime += `${mm} min : ${ss} sec`;
//     return formattedTime;
//   }

//   initializeTimer(): void {
//     this.quiz_progress.getQuizTimer(this.qid).subscribe({
//       next: (savedTimer) => {
//         this.timerAll = (savedTimer?.remainingTime && savedTimer.remainingTime > 0)
//           ? savedTimer.remainingTime
//           : (this.timeT + this.timeO) * 60;

//         if (!savedTimer || savedTimer.remainingTime <= 0) {
//           this.saveTimerToDatabase();
//         }

//         this.isTimerLoaded = true;
//         this.startCountdown();
//       },
//       error: () => {
//         this.timerAll = (this.timeT + this.timeO) * 60;
//         this.isTimerLoaded = true;
//         this.startCountdown();
//       }
//     });
//   }

//   private startCountdown(): void {
//     this.timerSubscription?.unsubscribe();

//     this.timerSubscription = interval(1000).subscribe(() => {
//       this.timerAll--;

//       if (this.timerAll % 10 === 0) {
//         this.saveTimerToDatabase();
//       }

//       if (this.timerAll <= 0) {
//         this.onTimerExpired();
//       }
//     });
//   }







































































//   private onTimerExpired(): void {
//     if (this.isExpiredHandled) return;
//     this.isExpiredHandled = true;

//     this.timerSubscription?.unsubscribe();
//     this.timerAll = 0;
//     this.saveTimerToDatabase();
//     this.showTimeUpModal = true;

//     const total = 5;
//     let count = total;
//     this.countdownText = count.toString();
//     this.progressPercent = 100;

//     const timerInterval = setInterval(() => {
//       count--;
//       this.progressPercent = (count / total) * 100;

//       if (count > 0) {
//         this.countdownText = count.toString();
//         if (count <= 3) {
//           this.audio.currentTime = 0;
//           this.audio.play().catch(() => {});
//         }
//       } else {
//         clearInterval(timerInterval);
//         this.countdownText = 'Submitting...';
//         this.progressPercent = 0;

//         setTimeout(() => {
//           const observables: Observable<any>[] = [];

//           if (this.evalQuiz) {
//             observables.push(this.evalQuiz());
//           }
//           if (this.evalSubjective) {
//             observables.push(this.evalSubjective());
//           }

//           if (observables.length === 0) {
//             this.finishAfterEvaluation();
//             return;
//           }

//           forkJoin(
//             observables.map(obs =>
//               obs.pipe(
//                 catchError(err => {
//                   console.error('One evaluation failed:', err);
//                   return of(null);
//                 })
//               )
//             )
//           ).subscribe({
//             next: () => {
//               console.log('All evaluations completed');
//               this.finishAfterEvaluation();
//             },
//             error: (err) => {
//               console.error('Unexpected error in evaluation', err);
//               this.finishAfterEvaluation();
//             }
//           });
//         }, 700);
//       }
//     }, 1000);
//   }

//   private finishAfterEvaluation(): void {
//     this.showTimeUpModal = false;
//     this.disableQuizProtection(); // <-- DISABLE PROTECTION
//     this.preventBackButton();
//     if (window.opener) {
//       window.opener.location.href = '/user-dashboard/0';
//     }
//     window.close();
//   }

//   private saveTimerToDatabase(): void {
//     this.quiz_progress.saveQuizTimer(this.qid, this.timerAll).subscribe({
//       next: (response) => {
//         console.log('Timer saved successfully:', response);
//       },
//       error: (error) => {
//         console.error('Failed to save timer:', error);
//       }
//     });
//   }

//   private startAutoSave(): void {
//     this.autoSaveSubscription = interval(10000).subscribe(() => {
//       if (this.isTimerLoaded && this.timerAll > 0) {
//         this.saveTimerToDatabase();
//       }
//     });
//   }

//   // ============================================================================
//   // THEORY/SUBJECTIVE QUESTIONS
//   // ============================================================================

//   loadTheory(): void {
//     this._questions.getSubjective(this.qid).subscribe(
//       (theory: any) => {
//         console.log(theory);
//         this.groupedQuestions = this.getQuestionsGroupedByPrefix(theory);
//         this.prefixes = this.sortPrefixesByCompulsory(this.groupedQuestions);
//         this.compulsoryPrefixes = this.getCompulsoryPrefixes();
//         this.loadQuestionsTheory();
//         console.log(this.groupedQuestions);
//         this.preventBackButton();

//         if (!this.isLoading) {
//           this.isLoading = false;
//         }
//       },
//       (error) => {
//         console.log("Could not load data from server");
//         this.isLoading = false;
//       }
//     );
//   }

//   getCompulsoryPrefixes(): string[] {
//     return this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
//   }

//   isCurrentGroupCompulsory(): boolean {
//     if (!this.currentQuestions || this.currentQuestions.length === 0) {
//       return false;
//     }
//     return this.currentQuestions.every(q => q.isCompulsory);
//   }

//   isGroupCompulsory(prefix: string): boolean {
//     const questions = this.groupedQuestions[prefix];
//     if (!questions || questions.length === 0) {
//       return false;
//     }
//     return questions.every((q: any) => q.isCompulsory);
//   }

//   sortPrefixesByCompulsory(groupedQuestions: any): string[] {
//     const prefixes = Object.keys(groupedQuestions);

//     return prefixes.sort((prefixA, prefixB) => {
//       const questionsA = groupedQuestions[prefixA];
//       const questionsB = groupedQuestions[prefixB];
//       const isGroupACompulsory = questionsA.every((q: any) => q.isCompulsory);
//       const isGroupBCompulsory = questionsB.every((q: any) => q.isCompulsory);

//       if (isGroupACompulsory && !isGroupBCompulsory) return -1;
//       if (!isGroupACompulsory && isGroupBCompulsory) return 1;
//       return prefixA.localeCompare(prefixB, undefined, { numeric: true });
//     });
//   }

//   getQuestionsGroupedByPrefix(questions): any {
//     return questions.reduce((acc, question) => {
//       const prefix = question.quesNo.match(/^[A-Za-z]+[0-9]+/)[0];
//       if (!acc[prefix]) {
//         acc[prefix] = [];
//       }
//       acc[prefix].push(question);
//       return acc;
//     }, {});
//   }

//   loadQuestionsTheory(): void {
//     this.prefixes.forEach(prefix => {
//       if (this.isGroupCompulsory(prefix)) {
//         this.selectedQuestions[prefix] = true;
//       }
//     });
//     const key = this.prefixes[this.currentPage];
//     this.currentQuestions = this.groupedQuestions[key] || [];
//     this.loadAnswers();
//   }

//   togglePrefixSelection(prefix: string): void {
//     if (this.isGroupCompulsory(prefix)) {
//       this.selectedQuestions[prefix] = true;
//       alert(`${prefix} contains compulsory questions and cannot be deselected.`);
//       return;
//     }
//     this.selectedQuestions[prefix] = !this.selectedQuestions[prefix];
//     console.log('After toggle:', this.selectedQuestions);
//   }

//   onPrefixChange(prefix: string): void {
//     this.selectedPrefix = prefix;
//   }

//   nextPage(): void {
//     this.saveAnswers();
//     if (this.currentPage < this.prefixes.length - 1) {
//       this.currentPage++;
//       this.loadQuestionsTheory();
//     }
//   }

//   prevPage(): void {
//     this.saveAnswers();
//     if (this.currentPage > 0) {
//       this.currentPage--;
//       this.loadQuestionsTheory();
//     }
//   }

//   onQuestionSelect(question: Question): void {
//     if (question.selected) {
//       question.selected = false;
//       this.selectedQuestionsCount--;
//     } else {
//       if (this.selectedQuestionsCount < 2) {
//         question.selected = true;
//         this.selectedQuestionsCount++;
//       } else {
//         alert('You can only select 2 questions.');
//       }
//     }
//   }

//   // ============================================================================
//   // QUESTIONS LOADING
//   // ============================================================================

//   loadQuestionsWithAnswers(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe(
//       (data: any) => {
//         this.questionWithAnswers = data;
//         console.log(data);
//         console.log(this.questionWithAnswers);
//       },
//       (error) => {
//         console.log("Error Loading questions");
//         Swal.fire("Error", "Error loading questions with answers", "error");
//       }
//     );
//     this.preventBackButton();
//   }

//   loadQuestions(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe(
//       (data: any) => {
//         const storedAnswers = JSON.parse(localStorage.getItem('selectedAnswers') || '{}');
//         this.loadSavedAnswers();

//         this.questions = data.map((q, index) => {
//           q.count = index + 1;
//           if (storedAnswers[q.quesId]) {
//             q.givenAnswer = [...storedAnswers[q.quesId]];
//           } else {
//             q.givenAnswer = [];
//           }
//           console.log(`📥 Question ID: ${q.quesId}, Restored Answers:`, q.givenAnswer);
//           return q;
//         });

//         this.isLoading = false;
//         console.log("✅ Final loaded questions:", this.questions);
//         this.initializeTimer();
//       },
//       (error) => {
//         console.log("Error Loading questions");
//         this.isLoading = false;
//         Swal.fire("Error", "Error loading questions", "error");
//       }
//     );
//     this.preventBackButton();
//   }

//   // ============================================================================
//   // NAVIGATION PREVENTION
//   // ============================================================================

//   preventBackButton(): void {
//     history.pushState(null, null, location.href);
//     this.locationSt.onPopState(() => {
//       history.pushState(null, null, location.href);
//     });
//   }

//   // ============================================================================
//   // QUIZ SUBMISSION
//   // ============================================================================

//   submitQuiz(): void {
//     Swal.fire({
//       title: "Do you want to submit the quiz?",
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Submit",
//       cancelButtonText: "Cancel"
//     }).then((e) => {
//       if (e.isConfirmed) {
//         this.clearSavedAnswers();
//         Swal.fire({
//           title: 'Evaluating...',
//           text: `Please wait while we evaluate your quiz for "${this.courseTitle}".`,
//           allowOutsideClick: false,
//           didOpen: () => {
//             Swal.showLoading();
//           }
//         });

//         setTimeout(() => {
//           this.evalQuiz();
//           this.waitNavigateFunction();
//           this.loadQuestionsWithAnswers();
//           this.clearProgress();
//           this.preventBackButton();
//           this.disableQuizProtection(); // <-- DISABLE PROTECTION

//           Swal.fire({
//             icon: 'success',
//             title: 'Evaluated!',
//             text: `Your results for "${this.courseTitle}" is available for print on the dashboard.`,
//             timer: 1000,
//             showConfirmButton: false
//           });
//           setTimeout(() => {
//             window.close();
//             if (window.opener) {
//               window.opener.location.href = '/user-dashboard/0';
//             }
//           }, 1200);
//         }, 3000);
//       }
//     });
//   }

//   async submitAllQuiz(): Promise<void> {
//     Swal.fire({
//       title: "Do you want to submit the quiz?",
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Submit",
//       cancelButtonText: "Cancel"
//     }).then((e) => {
//       if (!e.isConfirmed) return;

//       this.clearSavedAnswers();

//       Swal.fire({
//         title: 'Evaluating...',
//         text: `Please wait while we evaluate your quiz for ${this.courseTitle}.`,
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         }
//       });

//       const evaluations: Observable<any>[] = [];

//       if (this.timeO > 0) {
//         evaluations.push(this.evalQuiz());
//       }

//       if (this.timeT > 0) {
//         evaluations.push(this.evalSubjective());
//       }

//       if (evaluations.length === 0) {
//         this.finishAfterEvaluation();
//         return;
//       }

//       forkJoin(evaluations).subscribe({
//         next: () => {
//           this.waitNavigateFunction();
//           this.loadQuestionsWithAnswers();
//           this.clearProgress();
//           this.preventBackButton();
//           this.disableQuizProtection(); // <-- DISABLE PROTECTION

//           Swal.fire({
//             icon: 'success',
//             title: 'Evaluated!',
//             text: `Your results for ${this.courseTitle} are available on the dashboard.`,
//           });

//           setTimeout(() => {
//             if (window.opener) {
//               window.opener.location.href = '/user-dashboard/0';
//             }
//             window.close();
//           }, 1200);
//         },
//         error: (err) => {
//           console.error('Evaluation failed', err);
//           Swal.fire({
//             icon: 'error',
//             title: 'Evaluation failed',
//             text: 'Please contact support.',
//           });
//         }
//       });
//     });
//   }

//   clearProgress(): void {
//     this.quiz_progress.clearQuizAnswers(this.qid).subscribe(
//       (data: any) => {
//         console.log("Quiz Progress has been cleared!!");
//       },
//       (error) => {
//         console.log("Error clearing quiz progress");
//       }
//     );
//   }

//   waitNavigateFunction(): void {
//     setTimeout(() => {
//       this.printQuiz();
//     }, 3000);
//   }

//   printQuiz(): void {
//     this.router.navigate(['./user-dashboard/0']);
//   }

//   // ============================================================================
//   // EVALUATION METHODS
//   // ============================================================================

//   evalQuiz(): Observable<any> {
//     return new Observable(observer => {
//       this._questions.evalQuiz(this.qid, this.questions).subscribe({
//         next: (data: any) => {
//           console.log(this.questions, data);
//           this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
//           this.correct_answer = data.correct_answer;
//           this.attempted = data.attempted;
//           this.maxMarks = data.maxMarks;

//           localStorage.setItem('CorrectAnswer', JSON.stringify(this.correct_answer));
//           localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
//           localStorage.setItem('Attempted', JSON.stringify(this.attempted));
//           localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks));

//           this.clearSavedAnswers();
//           this.preventBackButton();
//           this.isSubmit = true;

//           observer.next(data);
//           observer.complete();
//         },
//         error: (err) => {
//           console.error('Evaluation Error', err);
//           observer.error(err);
//         }
//       });
//     });
//   }

//   evalSubjective(): Observable<any> {
//     return new Observable(observer => {
//       for (const prefix in this.selectedQuestions) {
//         this.selectedQuestionsAnswer.push(...this.groupedQuestions[prefix]);
//       }
//       if (Object.keys(this.selectedQuestions).length !== this.numberOfQuestionsToAnswer) {
//         this._snack.open("Please select exactly 3 sets of questions to submit", "", {
//           duration: 3000,
//         });
//         observer.error('Not enough questions selected');
//         return;
//       }

//       localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestions));
//       this.convertJson();
//       this._quiz.evalTheory(this.convertedJsonAPIResponsebody).subscribe({
//         next: (data: any) => {
//           console.log("Server Response:", data);
//           this.geminiResponse = data;
//           localStorage.setItem("answeredAIQuestions" + this.qid, JSON.stringify(this.geminiResponse));

//           setTimeout(() => {
//             this.loadSubjectiveAIEval();
//           }, 1000);

//           observer.next(data);
//           observer.complete();
//         },
//         error: (err) => {
//           console.error("Subjective evaluation failed", err);
//           observer.error(err);
//         }
//       });
//     });
//   }

//   // ============================================================================
//   // SUBJECTIVE EVALUATION HELPERS
//   // ============================================================================

//   loadSubjectiveAIEval(): void {
//     const geminiResponse = localStorage.getItem("answeredAIQuestions" + this.qid);
//     console.log(geminiResponse);
//     this.geminiResponseAI = this.groupByPrefix(this.geminiResponse);
//     console.log('This is the geminiResponse groupedByPrefixes', this.geminiResponseAI);
//     console.log("CHECKING ...");
//     this.getScoresForPrefixes(this.geminiResponseAI);
//     this.getGrandTotalMarks();
//     this.addSectBMarks();
//   }

//   getTotalMarksForPrefix(questions: any[]): number {
//     if (!questions || questions.length === 0) {
//       return 0;
//     }
//     return questions.reduce((total, question) => {
//       return total + (question.score || 0);
//     }, 0);
//   }

//   groupByPrefix(data: QuestionResponse[]): GroupedQuestions[] {
//     if (!Array.isArray(data)) {
//       throw new Error('Input must be an array');
//     }
//     if (data.length === 0) {
//       return [];
//     }

//     const prefixMap: Record<string, QuestionResponse[]> = {};

//     data.forEach((questionResponse) => {
//       if (!questionResponse.questionNumber) {
//         console.warn('Question missing questionNumber:', questionResponse);
//         return;
//       }

//       const prefixMatch = questionResponse.questionNumber.match(/^(Q\d+)/i);
//       const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : 'UNCATEGORIZED';

//       if (!prefixMap[prefix]) {
//         prefixMap[prefix] = [];
//       }
//       prefixMap[prefix].push(questionResponse);
//     });

//     return Object.entries(prefixMap).map(([prefix, questions]) => ({
//       prefix,
//       questions
//     }));
//   }

//   getGrandTotalMarks(): number {
//     this.sectionBMarks = 0;

//     if (!this.geminiResponseAI || this.geminiResponseAI.length === 0) {
//       return 0;
//     }

//     this.sectionBMarks = this.geminiResponseAI.reduce((grandTotal, group) => {
//       const prefixScores = this.getScoresForPrefixes([group]);
//       const groupTotal = prefixScores.reduce((sum, p) => sum + p.totalScore, 0);
//       return grandTotal + groupTotal;
//     }, 0);

//     console.log("Grand Total Marks: ", this.sectionBMarks);
//     return this.sectionBMarks;
//   }

//   addSectBMarks(): void {
//     this.theoryResults = {
//       marksB: this.sectionBMarks,
//       quiz: {
//         qId: this.qid
//       }
//     };

//     console.log(this.theoryResults);
//     console.log(this.theoryResults.marksB);
//     console.log(this.theoryResults.quiz.qId);

//     this._quiz.addSectionBMarks(this.theoryResults).subscribe(
//       (data) => {
//         console.log("Marks successful");
//       },
//       (error) => {
//         console.log("Unsuccessful");
//       }
//     );
//   }

//   getScoresForPrefixes(groupedData: GroupedQuestions[]): PrefixScores[] {
//     return groupedData.map(group => {
//       const { prefix, questions } = group;
//       const safeQuestions = Array.isArray(questions) ? questions : [];
//       const totalScore = safeQuestions.reduce((sum, q) => sum + q.score, 0);
//       const totalMaxMarks = safeQuestions.reduce((sum, q) => sum + q.maxMarks, 0);
//       const percentage = totalMaxMarks > 0
//         ? Math.round((totalScore / totalMaxMarks) * 100)
//         : 0;

//       console.log("Total Marks for Prefix: ", totalScore, totalMaxMarks);

//       return {
//         prefix,
//         totalScore,
//         totalMaxMarks,
//         percentage
//       };
//     });
//   }

//   getPrefixes(): string[] {
//     const prefixes = new Set<string>();
//     this.selectedQuestionsAnswer.forEach(question => {
//       const prefix = question.quesNo.match(/^Q\d+/)?.[0];
//       if (prefix) {
//         prefixes.add(prefix);
//       }
//     });
//     return Array.from(prefixes);
//   }

//   getGroupedQuestions(prefix: string): any[] {
//     return this.selectedQuestionsAnswer.filter(q => q.quesNo.startsWith(prefix));
//   }

//   // ============================================================================
//   // UTILITY METHODS
//   // ============================================================================

//   printPage(): void {
//     window.print();
//   }

//   saveDataInBrowser(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {});
//   }

//   disablePaste(event: ClipboardEvent): void {
//     event.preventDefault();
//   }

//   preventAction(event: Event): void {
//     event.preventDefault();
//     event.stopPropagation();
//     this.showWarningMessage('Copy/Paste operations are disabled during the exam');
//     return;
//   }

//   private showWarningMessage(message: string): void {
//     console.warn(message);
//   }

//   // ============================================================================
//   // ANSWER PERSISTENCE
//   // ============================================================================

//   clearSavedAnswers(): void {
//     this.quiz_progress.clearAnswers(this.qid).subscribe({
//       next: (response) => {
//         console.log(response.message);
//         this.currentQuestions.forEach((q: any) => {
//           q.givenAnswer = '';
//         });
//       },
//       error: (error) => {
//         console.error('Error clearing answers:', error);
//       }
//     });
//   }

//   updateSelectedAnswers(q: any, option: string, isChecked: boolean): string[] {
//     if (!q.givenAnswer) {
//       q.givenAnswer = [];
//     }

//     if (isChecked) {
//       if (!q.givenAnswer.includes(option)) {
//         q.givenAnswer.push(option);
//       }
//     } else {
//       const index = q.givenAnswer.indexOf(option);
//       if (index !== -1) {
//         q.givenAnswer.splice(index, 1);
//       }
//     }

//     const currentAnswers = [...q.givenAnswer];

//     const request: QuizAnswerRequest = {
//       questionId: q.quesId,
//       option: option,
//       checked: isChecked,
//       quizId: this.qid
//     };

//     this.quiz_progress.updateAnswer(request).subscribe({
//       next: (response) => {
//         if (response.selectedOptions && Array.isArray(response.selectedOptions)) {
//           console.log("Server returned:", response.selectedOptions);
//           console.log("Local state:", currentAnswers);
//         }
//       },
//       error: (error) => {
//         console.error("❌ Error saving answer:", error);
//         q.givenAnswer = currentAnswers;
//       }
//     });

//     return q.givenAnswer;
//   }

//   loadSavedAnswers(): void {
//     this.quiz_progress.getAnswersByQuiz(this.qid).subscribe({
//       next: (response: UserQuizAnswersResponse) => {
//         console.log("📥 Loaded saved answers:", response);

//         this.questions.forEach((q: any) => {
//           if (response.answers && response.answers[q.quesId]) {
//             q.givenAnswer = response.answers[q.quesId];
//           } else {
//             q.givenAnswer = [];
//           }
//         });

//         console.log("✅ Questions with answers:", this.questions);
//       },
//       error: (error) => {
//         console.error("❌ Error loading saved answers:", error);
//         this.questions.forEach((q: any) => {
//           q.givenAnswer = [];
//         });
//       }
//     });
//   }

//   saveAnswers(): void {
//     const answersToSave = this.currentQuestions.map((q: any) => ({
//       quesNo: q.quesNo,
//       givenAnswer: q.givenAnswer || ''
//     }));
//     this.quiz_progress.saveAnswers(this.qid, answersToSave).subscribe({
//       next: (response) => {
//         console.log('Answers saved to backend successfully');
//       },
//       error: (error) => {
//         console.error('Error saving answers:', error);
//       }
//     });
//   }

//   loadAnswers(): void {
//     this.quiz_progress.loadAnswers(this.qid).subscribe({
//       next: (savedAnswers) => {
//         this.currentQuestions.forEach((q: any) => {
//           const saved = savedAnswers.find((s: any) => s.quesNo === q.quesNo);
//           if (saved) {
//             q.givenAnswer = saved.givenAnswer;
//           }
//         });
//       },
//       error: (error) => {
//         console.error('Error loading answers:', error);
//       }
//     });
//   }

//   // ============================================================================
//   // PAGINATION
//   // ============================================================================

//   onTableDataChange(event: any): void {
//     this.page = event;
//   }

//   onTableSizeChange(event: any): void {
//     this.tableSize = event.target.value;
//     this.page = 1;
//   }

//   // ============================================================================
//   // JSON CONVERSION FOR API
//   // ============================================================================

//   convertJson(): any {
//     this.convertedJsonAPIResponsebody = {
//       contents: [
//         {
//           parts: this.selectedQuestionsAnswer.map(item => {
//             const quizId = item.quiz.qId;
//             const quesId = item.tqId;
//             const questionNo = item.quesNo;
//             const question = item.question;
//             const answer = item.givenAnswer ? item.givenAnswer : '';
//             const marks = item.marks ? item.marks.split(' ')[0] : '';
//             let criteria = 'Evaluate based on clarity, completeness, and accuracy';

//             const text = `quizId ${quizId}: tqid ${quesId}: Question Number ${questionNo}: ${question}. Answer: ${answer}. Marks: ${marks} Criteria:${criteria}.`;

//             return { text: text };
//           })
//         }
//       ]
//     };

//     console.log(this.convertedJsonAPIResponsebody);
//     return this.convertedJsonAPIResponsebody;
//   }
// }





// import { LocationStrategy } from '@angular/common';
// import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { QuestionService } from 'src/app/services/question.service';
// import { QuizService } from 'src/app/services/quiz.service';
// import { Router, } from '@angular/router';
// import { Question } from 'src/model testing/model';
// import { FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { LoginService } from 'src/app/services/login.service';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { QuizProgressService } from 'src/app/services/quiz-progress.service';
// import { QuizAnswerRequest } from 'src/app/services/quiz-progress.service';
// import { UserQuizAnswersResponse } from 'src/app/services/quiz-progress.service';
// import { interval, Subscription } from 'rxjs';
// import { Observable, forkJoin, of } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import Swal from 'sweetalert2';
// import { ScreenshotPreventionService } from 'src/app/services/ScreenshotPreventionService ';

// import {
//   QuizProtectionService,
//   ViolationAction,
//   ExamMode,
//   QuizProtectionState,
//   SecurityEvent,
//   AutoSubmitPayload
// } from 'src/app/services/QuizProtectionService';

// interface QuizAnswers {
//   [prefix: string]: {
//     [tqId: number]: string
//   }
// }

// interface QuestionResponse {
//   questionNumber: string;
//   question: string;
//   studentAnswer: string;
//   score: number;
//   maxMarks: number;
//   feedback: string;
//   keyMissed: string[];
// }

// interface GroupedQuestions {
//   prefix: string;
//   questions: QuestionResponse[];
// }

// interface PrefixScores {
//   prefix: string;
//   totalScore: number;
//   totalMaxMarks: number;
//   percentage: number;
// }

// interface Category {
//   cid: number;
//   level: string;
//   title: string;
//   description: string;
//   courseCode: string;
// }

// interface Quiz {
//   qId: number;
//   title: string;
//   description: string;
//   maxMarks: string;
//   quizTime: string;
//   numberOfQuestions: string;
//   active: boolean;
//   attempted: boolean;
//   quizpassword: string;
//   category: Category;
// }

// @Component({
//   selector: 'app-start',
//   templateUrl: './start.component.html',
//   styleUrls: ['./start.component.css']
// })
// export class StartComponent implements OnInit, OnDestroy {

//   // ============================================================================
//   // QUIZ PROTECTION STATE
//   // ============================================================================
//   protectionState: QuizProtectionState = {
//     isActive: false,
//     isFullscreen: false,
//     violationCount: 0,
//     violations: [],
//     penaltySeconds: 0,
//     autoSubmitTriggered: false,
//     autoSubmitCountdown: undefined,
//   };
//   private protectionSubscriptions: Subscription[] = [];

//   // ============================================================================
//   // PAGINATION
//   // ============================================================================
//   private readonly QUIZ_STORAGE_KEY = 'quiz_answers_by_prefix';
//   title = "pagination";
//   page: number = 1;
//   count: number = 0;
//   tableSize: number = 3;
//   tableSizes: any = [3, 6, 9, 12];
//   isLoading: boolean = true;
//   checked: true;

//   // ============================================================================
//   // QUIZ DATA
//   // ============================================================================
//   catId;
//   quizzes;
//   questions;
//   questionss;
//   qid;
//   questionWithAnswers;
//   marksGot = 0;
//   maxMarks = 0;
//   correct_answer = 0;
//   attempted: any;
//   isSubmit = false;
//   isNavigating = false;
//   second: number;
//   minutes: number;
//   count_timer: any;
//   timeT: number = 0;
//   timerAll: number = 0;
//   timeO: number = 0;
//   quizTitle;
//   courseTitle;
//   quiz;
//   noOfQuesObject;
//   private intervalId: any;

//   // ============================================================================
//   // SUBJECTIVE QUESTIONS
//   // ============================================================================
//   questionT: Question[] = [];
//   filteredQuestions: Question[] = [];
//   itemsPerPage: number = 5;
//   groupedQuestions: { [key: string]: Question[] } = {};
//   prefixes: string[] = [];
//   currentPage: number = 0;
//   selectedQuestions: { [key: string]: boolean } = {};
//   selectedPrefix: string;
//   selectedQuestionsCount: number = 0;
//   numberOfQuestionsToAnswer: number = 0;
//   quizForm: FormGroup;
//   selectedQuestionsAnswer = [];
//   convertedJsonAPIResponsebody: any;
//   sectionB: any[] = [];
//   question: Question[] = [];
//   geminiResponse: any[] = [];
//   geminiResponseAI;
//   sectionBMarks;
//   theoryResults = {
//     marksB: "",
//     quiz: {
//       qId: ""
//     }
//   }
//   localStorageKey = 'quiz_answers';
//   public currentQuestions: Question[] = [];
//   compulsoryPrefixes: string[] = [];

//   // ============================================================================
//   // TIMER
//   // ============================================================================
//   showTimeUpModal = false;
//   private isExpiredHandled = false;
//   countdownText = '';
//   progressPercent = 100;
//   private timerSubscription: Subscription;
//   private autoSaveSubscription: Subscription;
//   private isTimerLoaded: boolean = false;

//   constructor(
//     private _quiz: QuizService,
//     private fb: FormBuilder,
//     private login: LoginService,
//     private locationSt: LocationStrategy,
//     private _route: ActivatedRoute,
//     private _snack: MatSnackBar,
//     private _questions: QuestionService,
//     private router: Router,
//     private quiz_progress: QuizProgressService,
//     private screenshotPrevention: ScreenshotPreventionService,
//     private quizProtection: QuizProtectionService // <-- INJECT THE PROTECTION SERVICE
//   ) { }

//   // ============================================================================
//   // LIFECYCLE HOOKS
//   // ============================================================================

//   ngOnInit(): void {
//     this.isLoading = true;
//     this.qid = this._route.snapshot.params['qid'];
//     console.log(this.qid);

//     // Setup protection subscriptions FIRST
//     this.setupProtectionSubscriptions();

//     this._quiz.getQuiz(this.qid).subscribe(
//       (data: any) => {
//         console.log(data.title);
//         this.quiz = data;
//         this.courseTitle = this.quiz.category.title;
//         console.log(this.quiz);
//         console.log(this.quiz.quizTime);

//         this.timeO = this.quiz.quizTime * 1;
//         this.timerAll = (this.timeT + this.timeO) * 60;

//         console.log(this.timerAll);
//         console.log(this.timeO * 60);

//         // Enable protection AFTER quiz data is loaded
//         this.enableQuizProtection();
//       },
//       (error) => {
//         this.isLoading = false;
//         this._snack.open("You're Session has expired! ", "", {
//           duration: 3000,
//         });
//         this.login.logout();
//         console.log("error !!");
//       }
//     );

//     this.loadQuestions();

//     this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe(
//       (data: any) => {
//         this.numberOfQuestionsToAnswer = data[0].totalQuestToAnswer;
//         console.log("This is for number of questions to answer", data[0].timeAllowed);
//         console.log("Number question to answer ", data[0].totalQuestToAnswer);
//         this.quizTitle = data[0].quiz.title;
//         this.courseTitle = data[0].quiz.category.title;

//         this.loadTheory();
//         this.timeT = data[0].timeAllowed;
//         console.log("This is the number of questions to answer", this.numberOfQuestionsToAnswer);
//         console.log("This is the time for the Theory ", this.timeT);

//         this.startAutoSave();
//       },
//       (error) => {
//         this.isLoading = false;
//       }
//     );

//     this.initForm();
//     this.preventBackButton();
//   }

//   ngOnDestroy(): void {
//     // CRITICAL: Disable protection when leaving the component
//     this.disableQuizProtection();

//     // Save timer before leaving the page
//     if (this.isTimerLoaded && this.timerAll > 0) {
//       this.saveTimerToDatabase();
//     }

//     // Clean up subscriptions
//     if (this.timerSubscription) {
//       this.timerSubscription.unsubscribe();
//     }
//     if (this.autoSaveSubscription) {
//       this.autoSaveSubscription.unsubscribe();
//     }

//     // Clean up protection subscriptions
//     this.protectionSubscriptions.forEach(sub => sub.unsubscribe());
//   }

//   // ============================================================================
//   // QUIZ PROTECTION METHODS
//   // ============================================================================

//   /**
//    * Setup subscriptions to protection service events
//    */
//   private setupProtectionSubscriptions(): void {
//     // Subscribe to state changes
//     this.protectionSubscriptions.push(
//       this.quizProtection.onStateChange.subscribe(state => {
//         this.protectionState = state;
//         console.log('[Quiz Protection] State updated:', state);
//       })
//     );

//     // Subscribe to violations
//     this.protectionSubscriptions.push(
//       this.quizProtection.onViolation.subscribe(event => {
//         console.log('[Quiz Protection] Violation detected:', event);
//         this.handleProtectionViolation(event);
//       })
//     );

//     // Subscribe to auto-submit warning (when getting close to max violations)
//     this.protectionSubscriptions.push(
//       this.quizProtection.onAutoSubmitWarning.subscribe(({ remaining, total }) => {
//         console.warn(`[Quiz Protection] Auto-submit warning: ${remaining}/${total} violations remaining`);
//         this.handleAutoSubmitWarning(remaining, total);
//       })
//     );

//     // Subscribe to auto-submit countdown
//     this.protectionSubscriptions.push(
//       this.quizProtection.onAutoSubmitCountdown.subscribe(countdown => {
//         console.log(`[Quiz Protection] Auto-submit countdown: ${countdown}`);
//         // You can update UI here if needed
//       })
//     );

//     // Subscribe to auto-submit execution - THIS IS THE MAIN AUTO-SUBMIT HANDLER
//     this.protectionSubscriptions.push(
//       this.quizProtection.onAutoSubmit.subscribe((payload: AutoSubmitPayload) => {
//         console.log('[Quiz Protection] Auto-submit executed:', payload);
//         this.executeAutoSubmitFromProtection(payload);
//       })
//     );

//     // Subscribe to auto-submit cancelled (if user somehow cancels)
//     this.protectionSubscriptions.push(
//       this.quizProtection.onAutoSubmitCancelled.subscribe(() => {
//         console.log('[Quiz Protection] Auto-submit was cancelled');
//         this._snack.open('Auto-submit cancelled. Please remain on the quiz page.', 'OK', { duration: 3000 });
//       })
//     );
//   }

//   /**
//    * Enable quiz protection with appropriate settings
//    * Call this when quiz is ready to start
//    */
//   private enableQuizProtection(): void {
//     // Configure protection based on your quiz requirements
//     // You can make this dynamic based on quiz settings from backend

//     this.quizProtection.updateConfig({
//       // Mode: 'casual' | 'standard' | 'proctored'
//       // Use 'proctored' for strict auto-submit behavior
//       examMode: 'proctored',

//       // Watermark settings
//       watermarkEnabled: true,
//       watermarkOpacity: 0.12,
//       watermarkCount: 25,
//       watermarkText: `${this.getUserDisplayName()} • ${this.courseTitle} • ${new Date().toLocaleDateString()}`,

//       // Alerts & Logging
//       enableAlerts: true,
//       enableLogging: true,
//       logEndpoint: '/api/security-events',

//       // Fullscreen lock
//       enableFullscreenLock: true,
//       fullscreenRetryInterval: 2000,

//       // Focus monitoring
//       focusCheckInterval: 1000,

//       // VIOLATION HANDLING - AUTO-SUBMIT MODE
//       // This will auto-submit the quiz after maxViolations
//       violationAction: 'auto-submit',
//       maxViolations: 5,                    // Auto-submit after 3 violations
//       violationPenaltySeconds: 30,         // Add 30s penalty per violation

//       // Auto-submit specific settings
//       autoSubmitCountdownSeconds: 5,       // 5 second countdown before auto-submit
//       autoSubmitGracePeriodMs: 1000,       // 1 second grace period between violations

//       // Mobile protection
//       enableMobileProtection: true,
//       preventZoom: true,

//       // Screenshot & DevTools blocking
//       enableScreenshotBlocking: true,
//       enableDevToolsBlocking: true,

//       // Wake Lock (keeps screen on)
//       enableWakeLock: true,
//     });

//     // Enable protection
//     this.quizProtection.enableProtection();

//     console.log('[Quiz Protection] Protection enabled for quiz:', this.qid);
//     console.log('[Quiz Protection] Config:', this.quizProtection.getConfig());
//   }

//   /**
//    * Disable quiz protection
//    * Call this when quiz is submitted or user leaves legitimately
//    */
//   private disableQuizProtection(): void {
//     this.quizProtection.disableProtection();
//     console.log('[Quiz Protection] Protection disabled');
//   }

//   /**
//    * Handle violation events from protection service
//    */
//   private handleProtectionViolation(event: SecurityEvent): void {
//     console.warn(`[Quiz Violation] Type: ${event.type}, Details: ${event.details}, Severity: ${event.severity}`);

//     // Show violation count in UI when getting concerning
//     if (this.protectionState.violationCount >= 2) {
//       const remaining = this.quizProtection.getConfig().maxViolations - this.protectionState.violationCount;
//       if (remaining > 0) {
//         this._snack.open(
//           `⚠️ Warning: ${this.protectionState.violationCount} violations. ${remaining} remaining before auto-submit.`,
//           'OK',
//           { duration: 4000 }
//         );
//       }
//     }
//   }

//   /**
//    * Handle auto-submit warning (approaching max violations)
//    */
//   private handleAutoSubmitWarning(remaining: number, total: number): void {
//     // Show escalating warning using Swal
//     if (remaining === 1) {
//       Swal.fire({
//         icon: 'warning',
//         title: '⚠️ FINAL WARNING',
//         html: `
//           <p>You have <strong>${total - 1}</strong> violations.</p>
//           <p><strong>ONE MORE violation will AUTO-SUBMIT your quiz!</strong></p>
//           <p>Please stay on this page and do not:</p>
//           <ul style="text-align: left;">
//             <li>Switch tabs or windows</li>
//             <li>Exit fullscreen mode</li>
//             <li>Use keyboard shortcuts</li>
//             <li>Right-click on the page</li>
//           </ul>
//         `,
//         confirmButtonText: 'I Understand',
//         allowOutsideClick: false,
//         customClass: {
//           popup: 'swal-danger'
//         }
//       });
//     } else if (remaining === 2) {
//       Swal.fire({
//         icon: 'error',
//         title: '🚨 Critical Warning',
//         text: `Only ${remaining} violations remaining before your quiz is auto-submitted!`,
//         timer: 4000,
//         showConfirmButton: true
//       });
//     }
//   }

//   /**
//    * Execute auto-submit - called when protection service triggers auto-submit
//    */
//   private executeAutoSubmitFromProtection(payload: AutoSubmitPayload): void {
//     console.log('[Quiz Protection] Executing auto-submit with payload:', payload);

//     // Clear any saved draft answers
//     this.clearSavedAnswers();

//     // Build evaluation list based on quiz type
//     const evaluations: Observable<any>[] = [];

//     if (this.timeO > 0 && this.questions && this.questions.length > 0) {
//       evaluations.push(this.evalQuiz());
//     }

//     if (this.timeT > 0 && Object.keys(this.selectedQuestions).length > 0) {
//       evaluations.push(this.evalSubjective());
//     }

//     // If no evaluations needed, just finish
//     if (evaluations.length === 0) {
//       this.finalizeAutoSubmit(payload);
//       return;
//     }

//     // Execute all evaluations
//     forkJoin(
//       evaluations.map(obs =>
//         obs.pipe(
//           catchError(err => {
//             console.error('[Auto-Submit] Evaluation error:', err);
//             return of(null); // Continue even if one fails
//           })
//         )
//       )
//     ).subscribe({
//       next: (results) => {
//         console.log('[Auto-Submit] All evaluations completed:', results);
//         this.clearProgress();
//         this.finalizeAutoSubmit(payload);
//       },
//       error: (err) => {
//         console.error('[Auto-Submit] Unexpected error:', err);
//         this.finalizeAutoSubmit(payload);
//       }
//     });
//   }

//   /**
//    * Finalize the auto-submit process
//    */
//   private finalizeAutoSubmit(payload: AutoSubmitPayload): void {
//     // Disable protection
//     this.disableQuizProtection();

//     // Show final result to user
//     Swal.fire({
//       icon: 'error',
//       title: '⛔ Quiz Auto-Submitted',
//       html: `
//         <div style="text-align: left;">
//           <p><strong>Reason:</strong> ${payload.reason}</p>
//           <p><strong>Total Violations:</strong> ${payload.totalViolations}</p>
//           <p><strong>Time Penalty:</strong> +${payload.penaltySeconds} seconds</p>
//           <hr>
//           <p style="font-size: 14px; color: #666;">
//             Your quiz has been submitted with your current answers.
//             Results are available on the dashboard.
//           </p>
//         </div>
//       `,
//       confirmButtonText: 'Go to Dashboard',
//       allowOutsideClick: false,
//       allowEscapeKey: false
//     }).then((result) => {
//       // Navigate to dashboard
//       if (window.opener) {
//         window.opener.location.href = '/user-dashboard/0';
//       }
//       window.close();

//       // Fallback if window doesn't close
//       setTimeout(() => {
//         this.router.navigate(['/user-dashboard/0']);
//       }, 500);
//     });
//   }

//   /**
//    * Legacy handler - kept for backwards compatibility
//    */
//   private handleAutoSubmitFromProtection(reason: string, violations: any[]): void {
//     // This is now handled by executeAutoSubmitFromProtection
//     console.log('[Quiz Protection] Legacy auto-submit handler called');
//   }

//   /**
//    * Legacy perform auto-submit - kept for backwards compatibility
//    */
//   // private performAutoSubmit(reason: string, violations: any[]): void {
//   //   const payload: AutoSubmitPayload = {
//   //     reason,
//   //     violationType: 'legacy',
//   //     violations: violations,
//   //     totalViolationCount: this.protectionState.violationCount,
//   //     penaltySeconds: this.protectionState.penaltySeconds,
//   //     timestamp: new Date(),
//   //     userId: this.getUserDisplayName(),
//   //     username: this.getUserDisplayName(),
//   //   };
//   //   this.executeAutoSubmitFromProtection(payload);
//   // }

//   /**
//    * Get user display name for watermark
//    */
//   private getUserDisplayName(): string {
//     try {
//       const userData = localStorage.getItem('user');
//       if (userData) {
//         const user = JSON.parse(userData);
//         return user.username || user.name || user.email || 'Student';
//       }
//     } catch (e) {
//       console.error('Error getting user data:', e);
//     }
//     return 'Student';
//   }

//   /**
//    * Manually trigger fullscreen (e.g., from a button)
//    */
//   requestFullscreen(): void {
//     this.quizProtection.enterFullscreen()
//       .then(() => {
//         console.log('Fullscreen activated');
//       })
//       .catch(err => {
//         console.warn('Could not enter fullscreen:', err);
//         this._snack.open('Please enable fullscreen mode for the quiz', 'OK', { duration: 3000 });
//       });
//   }

//   /**
//    * Get current protection state for UI display
//    */
//   getProtectionState(): QuizProtectionState {
//     return this.protectionState;
//   }

//   // ============================================================================
//   // HOST LISTENERS
//   // ============================================================================

//   @HostListener('window:beforeunload', ['$event'])
//   beforeUnloadHandler(event: Event): void {
//     this.saveTimerToDatabase();
//     console.log('timerAll:', this.timerAll);
//     console.log("Helllooooo...");
//     this.preventBackButton();
//     event.returnValue = '' as any;
//   }

//   @HostListener('window:unload', ['$event'])
//   unloadHandler(event: Event): void {
//     this.preventBackButton();
//   }

//   // ============================================================================
//   // FORM INITIALIZATION
//   // ============================================================================

//   initForm(): void {
//     const formGroupConfig = {};
//     this.questionT.forEach(question => {
//       formGroupConfig[question.id] = ['', Validators.required];
//     });
//     this.quizForm = this.fb.group(formGroupConfig);
//   }

//   get isSubmitDisabled(): boolean {
//     const selectedCount = Object.values(this.selectedQuestions).filter(val => val === true).length;
//     const compulsoryGroups = this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
//     const allCompulsorySelected = compulsoryGroups.every(prefix => this.selectedQuestions[prefix] === true);
//     const hasCorrectTotal = selectedCount === this.numberOfQuestionsToAnswer;
//     return !allCompulsorySelected || !hasCorrectTotal;
//   }

//   // ============================================================================
//   // TIMER METHODS
//   // ============================================================================

//   totalTime(): number {
//     const timeT = Number(this.timeT) || 0;
//     const quizTime = Number(this.quiz.quizTime) || 0;
//     return timeT + quizTime;
//   }

//   getFormmatedTime(): string {
//     const hr = Math.floor(this.timerAll / 3600);
//     const mm = Math.floor((this.timerAll % 3600) / 60);
//     const ss = this.timerAll % 60;

//     let formattedTime = '';
//     if (hr > 0) {
//       formattedTime += `${hr} hr(s) : `;
//     }
//     formattedTime += `${mm} min : ${ss} sec`;
//     return formattedTime;
//   }

//   initializeTimer(): void {
//     this.quiz_progress.getQuizTimer(this.qid).subscribe({
//       next: (savedTimer) => {
//         this.timerAll = (savedTimer?.remainingTime && savedTimer.remainingTime > 0)
//           ? savedTimer.remainingTime
//           : (this.timeT + this.timeO) * 60;

//         if (!savedTimer || savedTimer.remainingTime <= 0) {
//           this.saveTimerToDatabase();
//         }

//         this.isTimerLoaded = true;
//         this.startCountdown();
//       },
//       error: () => {
//         this.timerAll = (this.timeT + this.timeO) * 60;
//         this.isTimerLoaded = true;
//         this.startCountdown();
//       }
//     });
//   }

//   private startCountdown(): void {
//     this.timerSubscription?.unsubscribe();

//     this.timerSubscription = interval(1000).subscribe(() => {
//       this.timerAll--;

//       if (this.timerAll % 10 === 0) {
//         this.saveTimerToDatabase();
//       }

//       if (this.timerAll <= 0) {
//         this.onTimerExpired();
//       }
//     });
//   }

//   private onTimerExpired(): void {
//     if (this.isExpiredHandled) return;
//     this.isExpiredHandled = true;

//     this.timerSubscription?.unsubscribe();
//     this.timerAll = 0;
//     this.saveTimerToDatabase();
//     this.showTimeUpModal = true;

//     const total = 5;
//     let count = total;
//     this.countdownText = count.toString();
//     this.progressPercent = 100;

//     // Play initial warning sound
//     this.quizProtection.playUrgentWarning();

//     const timerInterval = setInterval(() => {
//       count--;
//       this.progressPercent = (count / total) * 100;

//       if (count > 0) {
//         this.countdownText = count.toString();
//         // Play beep for last 3 seconds using the protection service
//         if (count <= 4) {
//           this.quizProtection.playCountdownBeep();
//         }
//       } else {
//         clearInterval(timerInterval);
//         this.countdownText = 'Submitting...';
//         this.progressPercent = 0;
//         this.clearSavedAnswers();
//         setTimeout(() => {
//           const observables: Observable<any>[] = [];

//           if (this.evalQuiz) {
//             observables.push(this.evalQuiz());
//           }
//           if (this.evalSubjective) {
//             observables.push(this.evalSubjective());
//           }

//           if (observables.length === 0) {
//             this.finishAfterEvaluation();
//             return;
//           }

//           forkJoin(
//             observables.map(obs =>
//               obs.pipe(
//                 catchError(err => {
//                   console.error('One evaluation failed:', err);
//                   return of(null);
//                 })
//               )
//             )
//           ).subscribe({
//             next: () => {
//               console.log('All evaluations completed');
//               this.finishAfterEvaluation();
//             },
//             error: (err) => {
//               console.error('Unexpected error in evaluation', err);
//               this.finishAfterEvaluation();
//             }
//           });
//         }, 700);
//       }
//     }, 1000);
//   }

//   private finishAfterEvaluation(): void {
//     this.showTimeUpModal = false;
//     this.disableQuizProtection(); // <-- DISABLE PROTECTION
//     this.preventBackButton();
//     this.clearSavedAnswers();
//     if (window.opener) {
//       window.opener.location.href = '/user-dashboard/0';
//     }
//     window.close();
//   }

//   private saveTimerToDatabase(): void {
//     this.quiz_progress.saveQuizTimer(this.qid, this.timerAll).subscribe({
//       next: (response) => {
//         console.log('Timer saved successfully:', response);
//       },
//       error: (error) => {
//         console.error('Failed to save timer:', error);
//       }
//     });
//   }

//   private startAutoSave(): void {
//     this.autoSaveSubscription = interval(10000).subscribe(() => {
//       if (this.isTimerLoaded && this.timerAll > 0) {
//         this.saveTimerToDatabase();
//       }
//     });
//   }

//   // ============================================================================
//   // THEORY/SUBJECTIVE QUESTIONS
//   // ============================================================================

//   loadTheory(): void {
//     this._questions.getSubjective(this.qid).subscribe(
//       (theory: any) => {
//         console.log(theory);
//         this.groupedQuestions = this.getQuestionsGroupedByPrefix(theory);
//         this.prefixes = this.sortPrefixesByCompulsory(this.groupedQuestions);
//         this.compulsoryPrefixes = this.getCompulsoryPrefixes();
//         this.loadQuestionsTheory();
//         console.log(this.groupedQuestions);
//         this.preventBackButton();

//         if (!this.isLoading) {
//           this.isLoading = false;
//         }
//       },
//       (error) => {
//         console.log("Could not load data from server");
//         this.isLoading = false;
//       }
//     );
//   }

//   getCompulsoryPrefixes(): string[] {
//     return this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
//   }

//   isCurrentGroupCompulsory(): boolean {
//     if (!this.currentQuestions || this.currentQuestions.length === 0) {
//       return false;
//     }
//     return this.currentQuestions.every(q => q.isCompulsory);
//   }

//   isGroupCompulsory(prefix: string): boolean {
//     const questions = this.groupedQuestions[prefix];
//     if (!questions || questions.length === 0) {
//       return false;
//     }
//     return questions.every((q: any) => q.isCompulsory);
//   }

//   sortPrefixesByCompulsory(groupedQuestions: any): string[] {
//     const prefixes = Object.keys(groupedQuestions);

//     return prefixes.sort((prefixA, prefixB) => {
//       const questionsA = groupedQuestions[prefixA];
//       const questionsB = groupedQuestions[prefixB];
//       const isGroupACompulsory = questionsA.every((q: any) => q.isCompulsory);
//       const isGroupBCompulsory = questionsB.every((q: any) => q.isCompulsory);

//       if (isGroupACompulsory && !isGroupBCompulsory) return -1;
//       if (!isGroupACompulsory && isGroupBCompulsory) return 1;
//       return prefixA.localeCompare(prefixB, undefined, { numeric: true });
//     });
//   }

//   getQuestionsGroupedByPrefix(questions): any {
//     return questions.reduce((acc, question) => {
//       const prefix = question.quesNo.match(/^[A-Za-z]+[0-9]+/)[0];
//       if (!acc[prefix]) {
//         acc[prefix] = [];
//       }
//       acc[prefix].push(question);
//       return acc;
//     }, {});
//   }

//   loadQuestionsTheory(): void {
//     this.prefixes.forEach(prefix => {
//       if (this.isGroupCompulsory(prefix)) {
//         this.selectedQuestions[prefix] = true;
//       }
//     });
//     const key = this.prefixes[this.currentPage];
//     this.currentQuestions = this.groupedQuestions[key] || [];
//     this.loadAnswers();
//   }

//   togglePrefixSelection(prefix: string): void {
//     if (this.isGroupCompulsory(prefix)) {
//       this.selectedQuestions[prefix] = true;
//       alert(`${prefix} contains compulsory questions and cannot be deselected.`);
//       return;
//     }
//     this.selectedQuestions[prefix] = !this.selectedQuestions[prefix];
//     console.log('After toggle:', this.selectedQuestions);
//   }

//   onPrefixChange(prefix: string): void {
//     this.selectedPrefix = prefix;
//   }

//   nextPage(): void {
//     this.saveAnswers();
//     if (this.currentPage < this.prefixes.length - 1) {
//       this.currentPage++;
//       this.loadQuestionsTheory();
//     }
//   }

//   prevPage(): void {
//     this.saveAnswers();
//     if (this.currentPage > 0) {
//       this.currentPage--;
//       this.loadQuestionsTheory();
//     }
//   }

//   onQuestionSelect(question: Question): void {
//     if (question.selected) {
//       question.selected = false;
//       this.selectedQuestionsCount--;
//     } else {
//       if (this.selectedQuestionsCount < 2) {
//         question.selected = true;
//         this.selectedQuestionsCount++;
//       } else {
//         alert('You can only select 2 questions.');
//       }
//     }
//   }

//   // ============================================================================
//   // QUESTIONS LOADING
//   // ============================================================================

//   loadQuestionsWithAnswers(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe(
//       (data: any) => {
//         this.questionWithAnswers = data;
//         console.log(data);
//         console.log(this.questionWithAnswers);
//       },
//       (error) => {
//         console.log("Error Loading questions");
//         Swal.fire("Error", "Error loading questions with answers", "error");
//       }
//     );
//     this.preventBackButton();
//   }

//   loadQuestions(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe(
//       (data: any) => {
//         const storedAnswers = JSON.parse(localStorage.getItem('selectedAnswers') || '{}');
//         this.loadSavedAnswers();

//         this.questions = data.map((q, index) => {
//           q.count = index + 1;
//           if (storedAnswers[q.quesId]) {
//             q.givenAnswer = [...storedAnswers[q.quesId]];
//           } else {
//             q.givenAnswer = [];
//           }
//           console.log(`📥 Question ID: ${q.quesId}, Restored Answers:`, q.givenAnswer);
//           return q;
//         });

//         this.isLoading = false;
//         console.log("✅ Final loaded questions:", this.questions);
//         this.initializeTimer();
//       },
//       (error) => {
//         console.log("Error Loading questions");
//         this.isLoading = false;
//         Swal.fire("Error", "Error loading questions", "error");
//       }
//     );
//     this.preventBackButton();
//   }

//   // ============================================================================
//   // NAVIGATION PREVENTION
//   // ============================================================================

//   preventBackButton(): void {
//     history.pushState(null, null, location.href);
//     this.locationSt.onPopState(() => {
//       history.pushState(null, null, location.href);
//     });
//   }

//   // ============================================================================
//   // QUIZ SUBMISSION
//   // ============================================================================

//   submitQuiz(): void {
//     Swal.fire({
//       title: "Do you want to submit the quiz?",
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Submit",
//       cancelButtonText: "Cancel"
//     }).then((e) => {
//       if (e.isConfirmed) {
//         this.clearSavedAnswers();
//         Swal.fire({
//           title: 'Evaluating...',
//           text: `Please wait while we evaluate your quiz for "${this.courseTitle}".`,
//           allowOutsideClick: false,
//           didOpen: () => {
//             Swal.showLoading();
//           }
//         });

//         setTimeout(() => {
//           this.evalQuiz();
//           this.waitNavigateFunction();
//           this.loadQuestionsWithAnswers();
//           this.clearProgress();
//           this.preventBackButton();
//           this.disableQuizProtection(); // <-- DISABLE PROTECTION
//           this.clearSavedAnswers();


//           Swal.fire({
//             icon: 'success',
//             title: 'Evaluated!',
//             text: `Your results for "${this.courseTitle}" is available for print on the dashboard.`,
//             timer: 1000,
//             showConfirmButton: false
//           });
//           setTimeout(() => {
//             window.close();
//             if (window.opener) {
//               window.opener.location.href = '/user-dashboard/0';
//             }
//           }, 1200);
//         }, 3000);
//       }
//     });
//   }

//   async submitAllQuiz(): Promise<void> {
//     Swal.fire({
//       title: "Do you want to submit the quiz?",
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Submit",
//       cancelButtonText: "Cancel"
//     }).then((e) => {
//       if (!e.isConfirmed) return;

//       this.clearSavedAnswers();

//       Swal.fire({
//         title: 'Evaluating...',
//         text: `Please wait while we evaluate your quiz for ${this.courseTitle}.`,
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         }
//       });

//       const evaluations: Observable<any>[] = [];

//       if (this.timeO > 0) {
//         evaluations.push(this.evalQuiz());
//       }

//       if (this.timeT > 0) {
//         evaluations.push(this.evalSubjective());
//       }

//       if (evaluations.length === 0) {
//         this.finishAfterEvaluation();
//         return;
//       }

//       forkJoin(evaluations).subscribe({
//         next: () => {
//           this.waitNavigateFunction();
//           this.loadQuestionsWithAnswers();
//           this.clearProgress();
//           this.preventBackButton();
//           this.disableQuizProtection(); // <-- DISABLE PROTECTION
//           this.clearSavedAnswers();

//           this.loadSavedAnswers();
//           Swal.fire({
//             icon: 'success',
//             title: 'Evaluated!',
//             text: `Your results for ${this.courseTitle} are available on the dashboard.`,
//           });

//           setTimeout(() => {
//             if (window.opener) {
//               window.opener.location.href = '/user-dashboard/0';
//             }
//             window.close();
//           }, 1200);
//         },
//         error: (err) => {
//           console.error('Evaluation failed', err);
//           Swal.fire({
//             icon: 'error',
//             title: 'Evaluation failed',
//             text: 'Please contact support.',
//           });
//         }
//       });
//     });
//   }

//   clearProgress(): void {
//     this.quiz_progress.clearQuizAnswers(this.qid).subscribe(
//       (data: any) => {
//         console.log("Quiz Progress has been cleared!!");
//       },
//       (error) => {
//         console.log("Error clearing quiz progress");
//       }
//     );
//   }

//   waitNavigateFunction(): void {
//     setTimeout(() => {
//       this.printQuiz();
//     }, 3000);
//   }

//   printQuiz(): void {
//     this.router.navigate(['./user-dashboard/0']);
//   }

//   // ============================================================================
//   // EVALUATION METHODS
//   // ============================================================================

//   evalQuiz(): Observable<any> {
//     return new Observable(observer => {
//       this._questions.evalQuiz(this.qid, this.questions).subscribe({
//         next: (data: any) => {
//           console.log(this.questions, data);
//           this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
//           this.correct_answer = data.correct_answer;
//           this.attempted = data.attempted;
//           this.maxMarks = data.maxMarks;

//           localStorage.setItem('CorrectAnswer', JSON.stringify(this.correct_answer));
//           localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
//           localStorage.setItem('Attempted', JSON.stringify(this.attempted));
//           localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks));

//           this.clearSavedAnswers();
//           this.preventBackButton();
//           this.isSubmit = true;

//           observer.next(data);
//           observer.complete();
//         },
//         error: (err) => {
//           console.error('Evaluation Error', err);
//           observer.error(err);
//         }
//       });
//     });
//   }

//   evalSubjective(): Observable<any> {
//     return new Observable(observer => {
//       for (const prefix in this.selectedQuestions) {
//         this.selectedQuestionsAnswer.push(...this.groupedQuestions[prefix]);
//       }
//       if (Object.keys(this.selectedQuestions).length !== this.numberOfQuestionsToAnswer) {
//         this._snack.open("Please select exactly 3 sets of questions to submit", "", {
//           duration: 3000,
//         });
//         observer.error('Not enough questions selected');
//         return;
//       }

//       localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestions));
//       this.convertJson();
//       this._quiz.evalTheory(this.convertedJsonAPIResponsebody).subscribe({
//         next: (data: any) => {
//           console.log("Server Response:", data);
//           this.geminiResponse = data;
//           localStorage.setItem("answeredAIQuestions" + this.qid, JSON.stringify(this.geminiResponse));

//           setTimeout(() => {
//             this.loadSubjectiveAIEval();
//           }, 1000);

//           observer.next(data);
//           observer.complete();
//         },
//         error: (err) => {
//           console.error("Subjective evaluation failed", err);
//           observer.error(err);
//         }
//       });
//     });
//   }

//   // ============================================================================
//   // SUBJECTIVE EVALUATION HELPERS
//   // ============================================================================

//   loadSubjectiveAIEval(): void {
//     const geminiResponse = localStorage.getItem("answeredAIQuestions" + this.qid);
//     console.log(geminiResponse);
//     this.geminiResponseAI = this.groupByPrefix(this.geminiResponse);
//     console.log('This is the geminiResponse groupedByPrefixes', this.geminiResponseAI);
//     console.log("CHECKING ...");
//     this.getScoresForPrefixes(this.geminiResponseAI);
//     this.getGrandTotalMarks();
//     this.addSectBMarks();
//   }

//   getTotalMarksForPrefix(questions: any[]): number {
//     if (!questions || questions.length === 0) {
//       return 0;
//     }
//     return questions.reduce((total, question) => {
//       return total + (question.score || 0);
//     }, 0);
//   }

//   groupByPrefix(data: QuestionResponse[]): GroupedQuestions[] {
//     if (!Array.isArray(data)) {
//       throw new Error('Input must be an array');
//     }
//     if (data.length === 0) {
//       return [];
//     }

//     const prefixMap: Record<string, QuestionResponse[]> = {};

//     data.forEach((questionResponse) => {
//       if (!questionResponse.questionNumber) {
//         console.warn('Question missing questionNumber:', questionResponse);
//         return;
//       }

//       const prefixMatch = questionResponse.questionNumber.match(/^(Q\d+)/i);
//       const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : 'UNCATEGORIZED';

//       if (!prefixMap[prefix]) {
//         prefixMap[prefix] = [];
//       }
//       prefixMap[prefix].push(questionResponse);
//     });

//     return Object.entries(prefixMap).map(([prefix, questions]) => ({
//       prefix,
//       questions
//     }));
//   }

//   getGrandTotalMarks(): number {
//     this.sectionBMarks = 0;

//     if (!this.geminiResponseAI || this.geminiResponseAI.length === 0) {
//       return 0;
//     }

//     this.sectionBMarks = this.geminiResponseAI.reduce((grandTotal, group) => {
//       const prefixScores = this.getScoresForPrefixes([group]);
//       const groupTotal = prefixScores.reduce((sum, p) => sum + p.totalScore, 0);
//       return grandTotal + groupTotal;
//     }, 0);

//     console.log("Grand Total Marks: ", this.sectionBMarks);
//     return this.sectionBMarks;
//   }

//   addSectBMarks(): void {
//     this.theoryResults = {
//       marksB: this.sectionBMarks,
//       quiz: {
//         qId: this.qid
//       }
//     };

//     console.log(this.theoryResults);
//     console.log(this.theoryResults.marksB);
//     console.log(this.theoryResults.quiz.qId);

//     this._quiz.addSectionBMarks(this.theoryResults).subscribe(
//       (data) => {
//         console.log("Marks successful");
//       },
//       (error) => {
//         console.log("Unsuccessful");
//       }
//     );
//   }

//   getScoresForPrefixes(groupedData: GroupedQuestions[]): PrefixScores[] {
//     return groupedData.map(group => {
//       const { prefix, questions } = group;
//       const safeQuestions = Array.isArray(questions) ? questions : [];
//       const totalScore = safeQuestions.reduce((sum, q) => sum + q.score, 0);
//       const totalMaxMarks = safeQuestions.reduce((sum, q) => sum + q.maxMarks, 0);
//       const percentage = totalMaxMarks > 0
//         ? Math.round((totalScore / totalMaxMarks) * 100)
//         : 0;

//       console.log("Total Marks for Prefix: ", totalScore, totalMaxMarks);

//       return {
//         prefix,
//         totalScore,
//         totalMaxMarks,
//         percentage
//       };
//     });
//   }

//   getPrefixes(): string[] {
//     const prefixes = new Set<string>();
//     this.selectedQuestionsAnswer.forEach(question => {
//       const prefix = question.quesNo.match(/^Q\d+/)?.[0];
//       if (prefix) {
//         prefixes.add(prefix);
//       }
//     });
//     return Array.from(prefixes);
//   }

//   getGroupedQuestions(prefix: string): any[] {
//     return this.selectedQuestionsAnswer.filter(q => q.quesNo.startsWith(prefix));
//   }

//   // ============================================================================
//   // UTILITY METHODS
//   // ============================================================================

//   printPage(): void {
//     window.print();
//   }

//   saveDataInBrowser(): void {
//     this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => { });
//   }

//   disablePaste(event: ClipboardEvent): void {
//     event.preventDefault();
//   }

//   preventAction(event: Event): void {
//     event.preventDefault();
//     event.stopPropagation();
//     this.showWarningMessage('Copy/Paste operations are disabled during the exam');
//     return;
//   }

//   private showWarningMessage(message: string): void {
//     console.warn(message);
//   }

//   // ============================================================================
//   // ANSWER PERSISTENCE
//   // ============================================================================

//   // clearSavedAnswers(): void {
//   //   this.quiz_progress.clearAnswers(this.qid).subscribe({
//   //     next: (response) => {
//   //       console.log(response.message);
//   //       this.currentQuestions.forEach((q: any) => {
//   //         q.givenAnswer = '';
//   //       });
//   //     },
//   //     error: (error) => {
//   //       console.error('Error clearing answers:', error);
//   //     }
//   //   });
//   // }

//   clearSavedAnswers(): void {
//     this.quiz_progress.clearQuizAnswers(this.qid).subscribe({
//       next: (response) => {
//         console.log(response);
//         // Clear UI
//         this.currentQuestions.forEach((q: any) => {
//           q.givenAnswer = '';
//         })
//       },
//       error: (error) => {
//         console.error('Error clearing answers:', error);
//       }
//     });
//   }



//   updateSelectedAnswers(q: any, option: string, isChecked: boolean): string[] {
//     if (!q.givenAnswer) {
//       q.givenAnswer = [];
//     }

//     if (isChecked) {
//       if (!q.givenAnswer.includes(option)) {
//         q.givenAnswer.push(option);
//       }
//     } else {
//       const index = q.givenAnswer.indexOf(option);
//       if (index !== -1) {
//         q.givenAnswer.splice(index, 1);
//       }
//     }

//     const currentAnswers = [...q.givenAnswer];

//     const request: QuizAnswerRequest = {
//       questionId: q.quesId,
//       option: option,
//       checked: isChecked,
//       quizId: this.qid
//     };

//     this.quiz_progress.updateAnswer(request).subscribe({
//       next: (response) => {
//         if (response.selectedOptions && Array.isArray(response.selectedOptions)) {
//           console.log("Server returned:", response.selectedOptions);
//           console.log("Local state:", currentAnswers);
//         }
//       },
//       error: (error) => {
//         console.error("❌ Error saving answer:", error);
//         q.givenAnswer = currentAnswers;
//       }
//     });

//     return q.givenAnswer;
//   }

//   loadSavedAnswers(): void {
//     this.quiz_progress.getAnswersByQuiz(this.qid).subscribe({
//       next: (response: UserQuizAnswersResponse) => {
//         console.log("📥 Loaded saved answers:", response);

//         this.questions.forEach((q: any) => {
//           if (response.answers && response.answers[q.quesId]) {
//             q.givenAnswer = response.answers[q.quesId];
//           } else {
//             q.givenAnswer = [];
//           }
//         });

//         console.log("✅ Questions with answers:", this.questions);
//       },
//       error: (error) => {
//         console.error("❌ Error loading saved answers:", error);
//         this.questions.forEach((q: any) => {
//           q.givenAnswer = [];
//         });
//       }
//     });
//   }

//   saveAnswers(): void {
//     const answersToSave = this.currentQuestions.map((q: any) => ({
//       quesNo: q.quesNo,
//       givenAnswer: q.givenAnswer || ''
//     }));
//     this.quiz_progress.saveAnswers(this.qid, answersToSave).subscribe({
//       next: (response) => {
//         console.log('Answers saved to backend successfully');
//       },
//       error: (error) => {
//         console.error('Error saving answers:', error);
//       }
//     });
//   }

//   loadAnswers(): void {
//     this.quiz_progress.loadAnswers(this.qid).subscribe({
//       next: (savedAnswers) => {
//         this.currentQuestions.forEach((q: any) => {
//           const saved = savedAnswers.find((s: any) => s.quesNo === q.quesNo);
//           if (saved) {
//             q.givenAnswer = saved.givenAnswer;
//           }
//         });
//       },
//       error: (error) => {
//         console.error('Error loading answers:', error);
//       }
//     });
//   }

//   // ============================================================================
//   // PAGINATION
//   // ============================================================================

//   onTableDataChange(event: any): void {
//     this.page = event;
//   }

//   onTableSizeChange(event: any): void {
//     this.tableSize = event.target.value;
//     this.page = 1;
//   }

//   // ============================================================================
//   // JSON CONVERSION FOR API
//   // ============================================================================

//   convertJson(): any {
//     this.convertedJsonAPIResponsebody = {
//       contents: [
//         {
//           parts: this.selectedQuestionsAnswer.map(item => {
//             const quizId = item.quiz.qId;
//             const quesId = item.tqId;
//             const questionNo = item.quesNo;
//             const question = item.question;
//             const answer = item.givenAnswer ? item.givenAnswer : '';
//             const marks = item.marks ? item.marks.split(' ')[0] : '';
//             let criteria = 'Evaluate based on clarity, completeness, and accuracy';

//             const text = `quizId ${quizId}: tqid ${quesId}: Question Number ${questionNo}: ${question}. Answer: ${answer}. Marks: ${marks} Criteria:${criteria}.`;

//             return { text: text };
//           })
//         }
//       ]
//     };

//     console.log(this.convertedJsonAPIResponsebody);
//     return this.convertedJsonAPIResponsebody;
//   }
// }




import { LocationStrategy } from '@angular/common';
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
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
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ScreenshotPreventionService } from 'src/app/services/ScreenshotPreventionService ';
// import { ScreenshotPreventionService } from 'src/app/services/ScreenshotPreventionService ';


import { 
  QuizProtectionService,
  QuizProtectionState,
  SecurityEvent,
  AutoSubmitPayload,
  DelayEvent,
  QuizViolationConfig
} from 'src/app/services/QuizProtectionService';

interface QuizAnswers {
  [prefix: string]: {
    [tqId: number]: string
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
  
  // =========================================================================
  // QUIZ PROTECTION SETTINGS (from database)
  // =========================================================================
  
  // Violation Action: 'NONE' | 'DELAY_ONLY' | 'AUTOSUBMIT_ONLY' | 'DELAY_AND_AUTOSUBMIT'
  violationAction?: string;
  
  // Maximum violations before auto-submit (if action includes auto-submit)
  maxViolations?: number;
  
  // Delay duration in seconds for each violation
  delaySeconds?: number;
  
  // Whether to increase delay on repeat violations
  delayIncrementOnRepeat?: boolean;
  
  // Multiplier for delay increment (e.g., 1.5 = 50% increase each time)
  delayMultiplier?: number;
  
  // Maximum delay cap in seconds
  maxDelaySeconds?: number;
  
  // Countdown seconds before auto-submit executes
  autoSubmitCountdownSeconds?: number;
  
  // Enable/disable watermark overlay
  enableWatermark?: boolean;
  
  // Enable/disable fullscreen lock
  enableFullscreenLock?: boolean;
  
  // Enable/disable screenshot blocking
  enableScreenshotBlocking?: boolean;
  
  // Enable/disable developer tools blocking
  enableDevToolsBlocking?: boolean;
}

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit, OnDestroy {

  // ============================================================================
  // QUIZ PROTECTION STATE
  // ============================================================================
  protectionState: QuizProtectionState = {
    isActive: false,
    isFullscreen: false,
    violationCount: 0,
    violations: [],
    penaltySeconds: 0,
    autoSubmitTriggered: false,
    autoSubmitCountdown: undefined,
    isDelayActive: false,
    delayRemainingSeconds: 0,
    totalDelayTimeServed: 0,
  };
  private protectionSubscriptions: Subscription[] = [];

  // ============================================================================
  // PAGINATION
  // ============================================================================
  private readonly QUIZ_STORAGE_KEY = 'quiz_answers_by_prefix';
  title = "pagination";
  page: number = 1;
  count: number = 0;
  tableSize: number = 3;
  tableSizes: any = [3, 6, 9, 12];
  isLoading: boolean = true;
  checked: true;

  // ============================================================================
  // QUIZ DATA
  // ============================================================================
  catId;
  quizzes;
  questions;
  questionss;
  qid;
  questionWithAnswers;
  marksGot = 0;
  maxMarks = 0;
  correct_answer = 0;
  attempted: any;
  isSubmit = false;
  isNavigating = false;
  second: number;
  minutes: number;
  count_timer: any;
  timeT: number = 0;
  timerAll: number = 0;
  timeO: number = 0;
  quizTitle;
  courseTitle;
  quiz;
  noOfQuesObject;
  private intervalId: any;

  // ============================================================================
  // SUBJECTIVE QUESTIONS
  // ============================================================================
  questionT: Question[] = [];
  filteredQuestions: Question[] = [];
  itemsPerPage: number = 5;
  groupedQuestions: { [key: string]: Question[] } = {};
  prefixes: string[] = [];
  currentPage: number = 0;
  selectedQuestions: { [key: string]: boolean } = {};
  selectedPrefix: string;
  selectedQuestionsCount: number = 0;
  numberOfQuestionsToAnswer: number = 0;
  quizForm: FormGroup;
  selectedQuestionsAnswer = [];
  convertedJsonAPIResponsebody: any;
  sectionB: any[] = [];
  question: Question[] = [];
  geminiResponse: any[] = [];
  geminiResponseAI;
  sectionBMarks;
  theoryResults = {
    marksB: "",
    quiz: {
      qId: ""
    }
  }
  localStorageKey = 'quiz_answers';
  public currentQuestions: Question[] = [];
  compulsoryPrefixes: string[] = [];

  // ============================================================================
  // TIMER
  // ============================================================================
  showTimeUpModal = false;
  private isExpiredHandled = false;
  countdownText = '';
  progressPercent = 100;
  private timerSubscription: Subscription;
  private autoSaveSubscription: Subscription;
  private isTimerLoaded: boolean = false;

  constructor(
    private _quiz: QuizService,
    private fb: FormBuilder,
    private login: LoginService,
    private locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _snack: MatSnackBar,
    private _questions: QuestionService,
    private router: Router,
    private quiz_progress: QuizProgressService,
    private screenshotPrevention: ScreenshotPreventionService,
    private quizProtection: QuizProtectionService // <-- INJECT THE PROTECTION SERVICE
  ) {}

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnInit(): void {
    this.isLoading = true;
    this.qid = this._route.snapshot.params['qid'];
    console.log(this.qid);

    // Setup protection subscriptions FIRST
    this.setupProtectionSubscriptions();

    this._quiz.getQuiz(this.qid).subscribe(
      (data: any) => {
        console.log(data.title);
        this.quiz = data;
        this.courseTitle = this.quiz.category.title;
        console.log(this.quiz);
        console.log(this.quiz.quizTime);

        this.timeO = this.quiz.quizTime * 1;
        this.timerAll = (this.timeT + this.timeO) * 60;

        console.log(this.timerAll);
        console.log(this.timeO * 60);

        // Enable protection AFTER quiz data is loaded
        this.enableQuizProtection();
      },
      (error) => {
        this.isLoading = false;
        this._snack.open("You're Session has expired! ", "", {
          duration: 3000,
        });
        this.login.logout();
        console.log("error !!");
      }
    );

    this.loadQuestions();

    this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe(
      (data: any) => {
        this.numberOfQuestionsToAnswer = data[0].totalQuestToAnswer;
        console.log("This is for number of questions to answer", data[0].timeAllowed);
        console.log("Number question to answer ", data[0].totalQuestToAnswer);
        this.quizTitle = data[0].quiz.title;
        this.courseTitle = data[0].quiz.category.title;

        this.loadTheory();
        this.timeT = data[0].timeAllowed;
        console.log("This is the number of questions to answer", this.numberOfQuestionsToAnswer);
        console.log("This is the time for the Theory ", this.timeT);

        this.startAutoSave();
      },
      (error) => {
        this.isLoading = false;
      }
    );

    this.initForm();
    this.preventBackButton();



    this.screenshotPrevention.enableProtection();
  }

  ngOnDestroy(): void {
    // CRITICAL: Disable protection when leaving the component
    this.disableQuizProtection();

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

    // Clean up protection subscriptions
    this.protectionSubscriptions.forEach(sub => sub.unsubscribe());
  }

  // ============================================================================
  // QUIZ PROTECTION METHODS
  // ============================================================================

  /**
   * Setup subscriptions to protection service events
   */
  private setupProtectionSubscriptions(): void {
    // Subscribe to state changes
    this.protectionSubscriptions.push(
      this.quizProtection.onStateChange.subscribe(state => {
        this.protectionState = state;
        console.log('[Quiz Protection] State updated:', state);
      })
    );

    // Subscribe to violations
    this.protectionSubscriptions.push(
      this.quizProtection.onViolation.subscribe(event => {
        console.log('[Quiz Protection] Violation detected:', event);
        this.handleProtectionViolation(event);
      })
    );

    // Subscribe to auto-submit warning (when getting close to max violations)
    this.protectionSubscriptions.push(
      this.quizProtection.onAutoSubmitWarning.subscribe(({ remaining, total }) => {
        console.warn(`[Quiz Protection] Auto-submit warning: ${remaining}/${total} violations remaining`);
        this.handleAutoSubmitWarning(remaining, total);
      })
    );

    // Subscribe to auto-submit countdown
    this.protectionSubscriptions.push(
      this.quizProtection.onAutoSubmitCountdown.subscribe(countdown => {
        console.log(`[Quiz Protection] Auto-submit countdown: ${countdown}`);
      })
    );

    // Subscribe to auto-submit execution - THIS IS THE MAIN AUTO-SUBMIT HANDLER
    this.protectionSubscriptions.push(
      this.quizProtection.onAutoSubmit.subscribe((payload: AutoSubmitPayload) => {
        console.log('[Quiz Protection] Auto-submit executed:', payload);
        this.executeAutoSubmitFromProtection(payload);
      })
    );

    // Subscribe to auto-submit cancelled (if user somehow cancels)
    this.protectionSubscriptions.push(
      this.quizProtection.onAutoSubmitCancelled.subscribe(() => {
        console.log('[Quiz Protection] Auto-submit was cancelled');
        this._snack.open('Auto-submit cancelled. Please remain on the quiz page.', 'OK', { duration: 3000 });
      })
    );

    // Subscribe to delay started
    this.protectionSubscriptions.push(
      this.quizProtection.onDelayStarted.subscribe((event: DelayEvent) => {
        console.log('[Quiz Protection] Delay started:', event);
        // Optionally show additional UI feedback
        if (event.willAutoSubmitNext) {
          console.warn('[Quiz Protection] FINAL WARNING: Next violation will auto-submit!');
        }
      })
    );

    // Subscribe to delay tick (countdown updates)
    this.protectionSubscriptions.push(
      this.quizProtection.onDelayTick.subscribe(remaining => {
        // Update any UI that shows delay countdown
        console.log(`[Quiz Protection] Delay remaining: ${remaining}s`);
      })
    );

    // Subscribe to delay ended
    this.protectionSubscriptions.push(
      this.quizProtection.onDelayEnded.subscribe(() => {
        console.log('[Quiz Protection] Delay ended, quiz access restored');
        this._snack.open('Quiz access restored. Please continue.', 'OK', { duration: 3000 });
      })
    );
  }

  /**
   * Enable quiz protection with appropriate settings
   * Call this when quiz is ready to start
   */
  private enableQuizProtection(): void {
    // =========================================================================
    // READ VIOLATION CONFIG FROM DATABASE (this.quiz object)
    // =========================================================================
    // These fields should be added to your Quiz entity in the backend:
    //
    // @Column({ default: 'DELAY_AND_AUTOSUBMIT' })
    // violationAction: string;  // 'NONE' | 'DELAY_ONLY' | 'AUTOSUBMIT_ONLY' | 'DELAY_AND_AUTOSUBMIT'
    //
    // @Column({ default: 3 })
    // maxViolations: number;
    //
    // @Column({ default: 30 })
    // delaySeconds: number;
    //
    // @Column({ default: true })
    // delayIncrementOnRepeat: boolean;
    //
    // @Column({ type: 'float', default: 1.5 })
    // delayMultiplier: number;
    //
    // @Column({ default: 120 })
    // maxDelaySeconds: number;
    //
    // @Column({ default: 5 })
    // autoSubmitCountdownSeconds: number;
    //
    // @Column({ default: true })
    // enableWatermark: boolean;
    //
    // @Column({ default: true })
    // enableFullscreenLock: boolean;
    //
    // @Column({ default: true })
    // enableScreenshotBlocking: boolean;
    //
    // @Column({ default: true })
    // enableDevToolsBlocking: boolean;
    // =========================================================================

    const violationConfig = {
      action: (this.quiz.violationAction || 'NONE') as 'NONE' | 'DELAY_ONLY' | 'AUTOSUBMIT_ONLY' | 'DELAY_AND_AUTOSUBMIT',
      maxViolations: this.quiz.maxViolations ?? 3,
      delaySeconds: this.quiz.delaySeconds ?? 30,
      delayIncrementOnRepeat: this.quiz.delayIncrementOnRepeat ?? true,
      delayMultiplier: this.quiz.delayMultiplier ?? 1.5,
      maxDelaySeconds: this.quiz.maxDelaySeconds ?? 120,
      autoSubmitCountdownSeconds: this.quiz.autoSubmitCountdownSeconds ?? 5,
    };

    // Set the violation config from database
    this.quizProtection.setViolationConfig(violationConfig);
    
    // Configure other protection settings from database
    this.quizProtection.updateConfig({
      examMode: 'proctored',
      
      // Watermark settings from database
      watermarkEnabled: this.quiz.enableWatermark ?? true,
      watermarkOpacity: 0.12,
      watermarkCount: 25,
      watermarkText: `${this.getUserDisplayName()} • ${this.courseTitle} • ${new Date().toLocaleDateString()}`,
      
      // Alerts & Logging
      enableAlerts: true,
      enableLogging: true,
      logEndpoint: '/api/security-events',
      
      // Fullscreen lock from database
      enableFullscreenLock: this.quiz.enableFullscreenLock ?? true,
      fullscreenRetryInterval: 2000,
      
      // Focus monitoring
      focusCheckInterval: 1000,
      
      // Grace period
      autoSubmitGracePeriodMs: 1000,
      
      // Mobile protection
      enableMobileProtection: true,
      preventZoom: true,
      
      // Screenshot & DevTools blocking from database
      enableScreenshotBlocking: this.quiz.enableScreenshotBlocking ?? true,
      enableDevToolsBlocking: this.quiz.enableDevToolsBlocking ?? true,
      
      // Wake Lock (keeps screen on)
      enableWakeLock: true,
    });

    // Enable protection
    this.quizProtection.enableProtection();
    
    console.log('[Quiz Protection] Protection enabled for quiz:', this.qid);
    console.log('[Quiz Protection] Violation Config from DB:', violationConfig);
  }

  /**
   * Disable quiz protection
   * Call this when quiz is submitted or user leaves legitimately
   */
  private disableQuizProtection(): void {
    this.quizProtection.disableProtection();
    console.log('[Quiz Protection] Protection disabled');
  }

  /**
   * Handle violation events from protection service
   */
  private handleProtectionViolation(event: SecurityEvent): void {
    console.warn(`[Quiz Violation] Type: ${event.type}, Details: ${event.details}, Severity: ${event.severity}`);
    
    // Show violation count in UI when getting concerning
    // if (this.protectionState.violationCount >= 2) {
    //   const remaining = this.quizProtection.getConfig().maxViolations - this.protectionState.violationCount;
    //   if (remaining > 0) {
    //     this._snack.open(
    //       `⚠️ Warning: ${this.protectionState.violationCount} violations. ${remaining} remaining before auto-submit.`,
    //       'OK',
    //       { duration: 4000 }
    //     );
    //   }
    // }
  }

  /**
   * Handle auto-submit warning (approaching max violations)
   */










private handleAutoSubmitWarning(remaining: number, total: number): void {
  if (remaining === 2) {
    Swal.fire({
      icon: 'warning',
      title: '<span class="swal-title-pro">Security Warning</span>',
      html: `
        <div class="swal-body-pro">
          <p>Your activity indicates behavior outside the quiz environment.</p>

          <div class="violation-badge badge-warning">
            ${remaining} violations remaining before auto-submit
          </div>
          <p style="margin-top:16px">
            Please remain focused on the quiz screen to avoid automatic submission.
          </p>
        </div>
      `,
      timer: 4500,
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-proctoring swal-warning'
      }
    });
  }

  if (remaining === 1) {
    Swal.fire({
      icon: 'error',
      title: '<span class="swal-title-pro">Final Warning</span>',
      html: `
        <div class="swal-body-pro">
          <p>You have reached the maximum allowed violations.</p>

          <div class="violation-badge badge-danger">
            ONE more violation will auto-submit your quiz
          </div>

          <p style="margin-top:18px; font-weight:500;">Do NOT perform any of the following:</p>
          <ul style="margin-top:8px; padding-left:18px;">
            <li>Switch browser tabs or applications</li>
            <li>Exit fullscreen mode</li>
            <li>Use restricted keyboard shortcuts</li>
            <li>Right-click on the page</li>
          </ul>
        </div>
      `,
      confirmButtonText: 'Continue Quiz',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'swal-proctoring swal-danger'
      }
    });
  }
}














  // private handleAutoSubmitWarning(remaining: number, total: number): void {
  //   // Show escalating warning using Swal
  //   if (remaining === 1) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: '⚠️ FINAL WARNING',
  //       html: `
  //         <p>You have <strong>${total - 1}</strong> violations.</p>
  //         <p><strong>ONE MORE violation will AUTO-SUBMIT your quiz!</strong></p>
  //         <p>Please stay on this page and do not:</p>
  //         <ul style="text-align: left;">
  //           <li>Switch tabs or windows</li>
  //           <li>Exit fullscreen mode</li>
  //           <li>Use keyboard shortcuts</li>
  //           <li>Right-click on the page</li>
  //         </ul>
  //       `,
  //       confirmButtonText: 'I Understand',
  //       allowOutsideClick: false,
  //       customClass: {
  //         popup: 'swal-danger'
  //       }
  //     });
  //   } else if (remaining === 2) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: '🚨 Critical Warning',
  //       text: `Only ${remaining} violations remaining before your quiz is auto-submitted!`,
  //       timer: 4000,
  //       showConfirmButton: true
  //     });
  //   }
  // }














  /**
   * Execute auto-submit - called when protection service triggers auto-submit
   */
  private executeAutoSubmitFromProtection(payload: AutoSubmitPayload): void {
    console.log('[Quiz Protection] Executing auto-submit with payload:', payload);
    
    // Clear any saved draft answers
    this.clearSavedAnswers();

    // Build evaluation list based on quiz type
    const evaluations: Observable<any>[] = [];

    if (this.timeO > 0 && this.questions && this.questions.length > 0) {
      evaluations.push(this.evalQuiz());
    }

    if (this.timeT > 0 && Object.keys(this.selectedQuestions).length > 0) {
      evaluations.push(this.evalSubjective());
    }

    // If no evaluations needed, just finish
    if (evaluations.length === 0) {
      this.finalizeAutoSubmit(payload);
      return;
    }

    // Execute all evaluations
    forkJoin(
      evaluations.map(obs =>
        obs.pipe(
          catchError(err => {
            console.error('[Auto-Submit] Evaluation error:', err);
            return of(null); // Continue even if one fails
          })
        )
      )
    ).subscribe({
      next: (results) => {
        console.log('[Auto-Submit] All evaluations completed:', results);
        this.clearProgress();
        this.finalizeAutoSubmit(payload);
      },
      error: (err) => {
        console.error('[Auto-Submit] Unexpected error:', err);
        this.finalizeAutoSubmit(payload);
      }
    });
  }

  /**
   * Finalize the auto-submit process
   */
  private finalizeAutoSubmit(payload: AutoSubmitPayload): void {
    // Disable protection
    this.disableQuizProtection();

    // Show final result to user
    Swal.fire({
      icon: 'error',
      title: '⛔ Quiz Auto-Submitted',
      html: `
        <div style="text-align: left;">
          <p><strong>Reason:</strong> ${payload.reason}</p>
          <p><strong>Total Violations:</strong> ${payload.totalViolations}</p>
          <p><strong>Time Penalty:</strong> +${payload.penaltySeconds} seconds</p>
          <p><strong>Total Delay Served:</strong> ${this.formatDelayTime(payload.totalDelayTimeServed)}</p>
          <hr>
          <p style="font-size: 14px; color: #666;">
            Your quiz has been submitted with your current answers.
            Results are available on the dashboard.
          </p>
        </div>
      `,
      confirmButtonText: 'Go to Dashboard',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      // Navigate to dashboard
      if (window.opener) {
        window.opener.location.href = '/user-dashboard/0';
      }
      window.close();
      
      // Fallback if window doesn't close
      setTimeout(() => {
        this.router.navigate(['/user-dashboard/0']);
      }, 500);
    });
  }

  /**
   * Format delay time for display
   */
  private formatDelayTime(seconds: number): string {
    if (!seconds || seconds === 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Legacy handler - kept for backwards compatibility
   */
  private handleAutoSubmitFromProtection(reason: string, violations: any[]): void {
    // This is now handled by executeAutoSubmitFromProtection
    console.log('[Quiz Protection] Legacy auto-submit handler called');
  }

  /**
   * Legacy perform auto-submit - kept for backwards compatibility
   */
  // private performAutoSubmit(reason: string, violations: any[]): void {
  //   const payload: AutoSubmitPayload = {
  //     reason,
  //     violationType: 'legacy',
  //     violations: violations,
  //     totalViolationCount: this.protectionState.violationCount,
  //     penaltySeconds: this.protectionState.penaltySeconds,
  //     timestamp: new Date(),
  //     userId: this.getUserDisplayName(),
  //     username: this.getUserDisplayName(),
  //   };
  //   this.executeAutoSubmitFromProtection(payload);
  // }

  /**
   * Get user display name for watermark
   */
  private getUserDisplayName(): string {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.username || user.name || user.email || 'Student';
      }
    } catch (e) {
      console.error('Error getting user data:', e);
    }
    return 'Student';
  }

  /**
   * Manually trigger fullscreen (e.g., from a button)
   */
  requestFullscreen(): void {
    this.quizProtection.enterFullscreen()
      .then(() => {
        console.log('Fullscreen activated');
      })
      .catch(err => {
        console.warn('Could not enter fullscreen:', err);
        this._snack.open('Please enable fullscreen mode for the quiz', 'OK', { duration: 3000 });
      });
  }

  /**
   * Get current protection state for UI display
   */
  getProtectionState(): QuizProtectionState {
    return this.protectionState;
  }

  // ============================================================================
  // HOST LISTENERS
  // ============================================================================

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    this.saveTimerToDatabase();
    console.log('timerAll:', this.timerAll);
    console.log("Helllooooo...");
    this.preventBackButton();
    event.returnValue = '' as any;
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event): void {
    this.preventBackButton();
  }

  // ============================================================================
  // FORM INITIALIZATION
  // ============================================================================

  initForm(): void {
    const formGroupConfig = {};
    this.questionT.forEach(question => {
      formGroupConfig[question.id] = ['', Validators.required];
    });
    this.quizForm = this.fb.group(formGroupConfig);
  }

  get isSubmitDisabled(): boolean {
    const selectedCount = Object.values(this.selectedQuestions).filter(val => val === true).length;
    const compulsoryGroups = this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
    const allCompulsorySelected = compulsoryGroups.every(prefix => this.selectedQuestions[prefix] === true);
    const hasCorrectTotal = selectedCount === this.numberOfQuestionsToAnswer;
    return !allCompulsorySelected || !hasCorrectTotal;
  }

  // ============================================================================
  // TIMER METHODS
  // ============================================================================

  totalTime(): number {
    const timeT = Number(this.timeT) || 0;
    const quizTime = Number(this.quiz.quizTime) || 0;
    return timeT + quizTime;
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

  initializeTimer(): void {
    this.quiz_progress.getQuizTimer(this.qid).subscribe({
      next: (savedTimer) => {
        this.timerAll = (savedTimer?.remainingTime && savedTimer.remainingTime > 0)
          ? savedTimer.remainingTime
          : (this.timeT + this.timeO) * 60;

        if (!savedTimer || savedTimer.remainingTime <= 0) {
          this.saveTimerToDatabase();
        }

        this.isTimerLoaded = true;
        this.startCountdown();
      },
      error: () => {
        this.timerAll = (this.timeT + this.timeO) * 60;
        this.isTimerLoaded = true;
        this.startCountdown();
      }
    });
  }

  private startCountdown(): void {
    this.timerSubscription?.unsubscribe();

    this.timerSubscription = interval(1000).subscribe(() => {
      this.timerAll--;

      if (this.timerAll % 10 === 0) {
        this.saveTimerToDatabase();
      }

      if (this.timerAll <= 0) {
        this.onTimerExpired();
      }
    });
  }

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

    // Play initial warning sound
    this.quizProtection.playUrgentWarning();

    const timerInterval = setInterval(() => {
      count--;
      this.progressPercent = (count / total) * 100;

      if (count > 0) {
        this.countdownText = count.toString();
        // Play beep for last 3 seconds using the protection service
        if (count <= 3) {
          this.quizProtection.playCountdownBeep();
        }
      } else {
        clearInterval(timerInterval);
        this.countdownText = 'Submitting...';
        this.progressPercent = 0;
    this.clearSavedAnswers();
          this.clearProgress();

        setTimeout(() => {
          const observables: Observable<any>[] = [];

          if (this.evalQuiz) {
            observables.push(this.evalQuiz());
                this.clearSavedAnswers();
          this.clearProgress();

          }
          if (this.evalSubjective) {
            observables.push(this.evalSubjective());
                this.clearSavedAnswers();
                          this.clearProgress();


          }

          if (observables.length === 0) {
            this.finishAfterEvaluation();
            return;
          }

          forkJoin(
            observables.map(obs =>
              obs.pipe(
                catchError(err => {
                  console.error('One evaluation failed:', err);
                  return of(null);
                })
              )
            )
          ).subscribe({
            next: () => {
              console.log('All evaluations completed');
              this.finishAfterEvaluation();
                  this.clearSavedAnswers();
                            this.clearProgress();


            },
            error: (err) => {
              console.error('Unexpected error in evaluation', err);
              this.finishAfterEvaluation();
            }
          });
        }, 700);
      }
    }, 1000);
  }

  private finishAfterEvaluation(): void {
    this.showTimeUpModal = false;
    this.disableQuizProtection(); // <-- DISABLE PROTECTION
    this.preventBackButton();
    if (window.opener) {
      window.opener.location.href = '/user-dashboard/0';
    }
    window.close();
  }

  private saveTimerToDatabase(): void {
    this.quiz_progress.saveQuizTimer(this.qid, this.timerAll).subscribe({
      next: (response) => {
        console.log('Timer saved successfully:', response);
      },
      error: (error) => {
        console.error('Failed to save timer:', error);
      }
    });
  }

  private startAutoSave(): void {
    this.autoSaveSubscription = interval(10000).subscribe(() => {
      if (this.isTimerLoaded && this.timerAll > 0) {
        this.saveTimerToDatabase();
      }
    });
  }

  // ============================================================================
  // THEORY/SUBJECTIVE QUESTIONS
  // ============================================================================

  loadTheory(): void {
    this._questions.getSubjective(this.qid).subscribe(
      (theory: any) => {
        console.log(theory);
        this.groupedQuestions = this.getQuestionsGroupedByPrefix(theory);
        this.prefixes = this.sortPrefixesByCompulsory(this.groupedQuestions);
        this.compulsoryPrefixes = this.getCompulsoryPrefixes();
        this.loadQuestionsTheory();
        console.log(this.groupedQuestions);
        this.preventBackButton();

        if (!this.isLoading) {
          this.isLoading = false;
        }
      },
      (error) => {
        console.log("Could not load data from server");
        this.isLoading = false;
      }
    );
  }

  getCompulsoryPrefixes(): string[] {
    return this.prefixes.filter(prefix => this.isGroupCompulsory(prefix));
  }

  isCurrentGroupCompulsory(): boolean {
    if (!this.currentQuestions || this.currentQuestions.length === 0) {
      return false;
    }
    return this.currentQuestions.every(q => q.isCompulsory);
  }

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
      const isGroupACompulsory = questionsA.every((q: any) => q.isCompulsory);
      const isGroupBCompulsory = questionsB.every((q: any) => q.isCompulsory);

      if (isGroupACompulsory && !isGroupBCompulsory) return -1;
      if (!isGroupACompulsory && isGroupBCompulsory) return 1;
      return prefixA.localeCompare(prefixB, undefined, { numeric: true });
    });
  }

  getQuestionsGroupedByPrefix(questions): any {
    return questions.reduce((acc, question) => {
      const prefix = question.quesNo.match(/^[A-Za-z]+[0-9]+/)[0];
      if (!acc[prefix]) {
        acc[prefix] = [];
      }
      acc[prefix].push(question);
      return acc;
    }, {});
  }

  loadQuestionsTheory(): void {
    this.prefixes.forEach(prefix => {
      if (this.isGroupCompulsory(prefix)) {
        this.selectedQuestions[prefix] = true;
      }
    });
    const key = this.prefixes[this.currentPage];
    this.currentQuestions = this.groupedQuestions[key] || [];
    this.loadAnswers();
  }

  togglePrefixSelection(prefix: string): void {
    if (this.isGroupCompulsory(prefix)) {
      this.selectedQuestions[prefix] = true;
      alert(`${prefix} contains compulsory questions and cannot be deselected.`);
      return;
    }
    this.selectedQuestions[prefix] = !this.selectedQuestions[prefix];
    console.log('After toggle:', this.selectedQuestions);
  }

  onPrefixChange(prefix: string): void {
    this.selectedPrefix = prefix;
  }

  nextPage(): void {
    this.saveAnswers();
    if (this.currentPage < this.prefixes.length - 1) {
      this.currentPage++;
      this.loadQuestionsTheory();
    }
  }

  prevPage(): void {
    this.saveAnswers();
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadQuestionsTheory();
    }
  }

  onQuestionSelect(question: Question): void {
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

  // ============================================================================
  // QUESTIONS LOADING
  // ============================================================================

  loadQuestionsWithAnswers(): void {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe(
      (data: any) => {
        this.questionWithAnswers = data;
        console.log(data);
        console.log(this.questionWithAnswers);
      },
      (error) => {
        console.log("Error Loading questions");
        Swal.fire("Error", "Error loading questions with answers", "error");
      }
    );
    this.preventBackButton();
  }

  loadQuestions(): void {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe(
      (data: any) => {
        const storedAnswers = JSON.parse(localStorage.getItem('selectedAnswers') || '{}');
        this.loadSavedAnswers();

        this.questions = data.map((q, index) => {
          q.count = index + 1;
          if (storedAnswers[q.quesId]) {
            q.givenAnswer = [...storedAnswers[q.quesId]];
          } else {
            q.givenAnswer = [];
          }
          console.log(`📥 Question ID: ${q.quesId}, Restored Answers:`, q.givenAnswer);
          return q;
        });

        this.isLoading = false;
        console.log("✅ Final loaded questions:", this.questions);
        this.initializeTimer();
      },
      (error) => {
        console.log("Error Loading questions");
        this.isLoading = false;
        Swal.fire("Error", "Error loading questions", "error");
      }
    );
    this.preventBackButton();
  }

  // ============================================================================
  // NAVIGATION PREVENTION
  // ============================================================================

  preventBackButton(): void {
    history.pushState(null, null, location.href);
    this.locationSt.onPopState(() => {
      history.pushState(null, null, location.href);
    });
  }

  // ============================================================================
  // QUIZ SUBMISSION
  // ============================================================================

  submitQuiz(): void {
    Swal.fire({
      title: "Do you want to submit the quiz?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel"
    }).then((e) => {
      if (e.isConfirmed) {
        this.clearSavedAnswers();
                  this.clearProgress();

        Swal.fire({
          title: 'Evaluating...',
          text: `Please wait while we evaluate your quiz for "${this.courseTitle}".`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        setTimeout(() => {
          this.evalQuiz();
          this.waitNavigateFunction();
          this.loadQuestionsWithAnswers();
          this.clearProgress();
          this.preventBackButton();
          this.disableQuizProtection(); // <-- DISABLE PROTECTION

          Swal.fire({
            icon: 'success',
            title: 'Evaluated!',
            text: `Your results for "${this.courseTitle}" is available for print on the dashboard.`,
            timer: 1000,
            showConfirmButton: false
          });
          setTimeout(() => {
            window.close();
            if (window.opener) {
              window.opener.location.href = '/user-dashboard/0';
            }
          }, 1200);
        }, 3000);
      }
    });
  }

  async submitAllQuiz(): Promise<void> {
    Swal.fire({
      title: "Do you want to submit the quiz?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel"
    }).then((e) => {
      if (!e.isConfirmed) return;

      this.clearSavedAnswers();
          this.clearProgress();

      Swal.fire({
        title: 'Evaluating...',
        text: `Please wait while we evaluate your quiz for ${this.courseTitle}.`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const evaluations: Observable<any>[] = [];

      if (this.timeO > 0) {
        evaluations.push(this.evalQuiz());
      }

      if (this.timeT > 0) {
        evaluations.push(this.evalSubjective());
      }

      if (evaluations.length === 0) {
        this.finishAfterEvaluation();
        return;
      }

      forkJoin(evaluations).subscribe({
        next: () => {
          this.waitNavigateFunction();
          this.loadQuestionsWithAnswers();
          this.clearProgress();
                this.clearSavedAnswers();

          this.preventBackButton();
          this.disableQuizProtection(); // <-- DISABLE PROTECTION

          Swal.fire({
            icon: 'success',
            title: 'Evaluated!',
            text: `Your results for ${this.courseTitle} are available on the dashboard.`,
          });

          setTimeout(() => {
            if (window.opener) {
              window.opener.location.href = '/user-dashboard/0';
            }
            window.close();
          }, 1200);
        },
        error: (err) => {
          console.error('Evaluation failed', err);
          Swal.fire({
            icon: 'error',
            title: 'Evaluation failed',
            text: 'Please contact support.',
          });
        }
      });
    });
  }


  waitNavigateFunction(): void {
    setTimeout(() => {
      this.printQuiz();
    }, 3000);
  }

  printQuiz(): void {
    this.router.navigate(['./user-dashboard/0']);
  }

  // ============================================================================
  // EVALUATION METHODS
  // ============================================================================

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

          this.clearProgress();
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

  // ============================================================================
  // SUBJECTIVE EVALUATION HELPERS
  // ============================================================================

  loadSubjectiveAIEval(): void {
    const geminiResponse = localStorage.getItem("answeredAIQuestions" + this.qid);
    console.log(geminiResponse);
    this.geminiResponseAI = this.groupByPrefix(this.geminiResponse);
    console.log('This is the geminiResponse groupedByPrefixes', this.geminiResponseAI);
    console.log("CHECKING ...");
    this.getScoresForPrefixes(this.geminiResponseAI);
    this.getGrandTotalMarks();
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

  groupByPrefix(data: QuestionResponse[]): GroupedQuestions[] {
    if (!Array.isArray(data)) {
      throw new Error('Input must be an array');
    }
    if (data.length === 0) {
      return [];
    }

    const prefixMap: Record<string, QuestionResponse[]> = {};

    data.forEach((questionResponse) => {
      if (!questionResponse.questionNumber) {
        console.warn('Question missing questionNumber:', questionResponse);
        return;
      }

      const prefixMatch = questionResponse.questionNumber.match(/^(Q\d+)/i);
      const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : 'UNCATEGORIZED';

      if (!prefixMap[prefix]) {
        prefixMap[prefix] = [];
      }
      prefixMap[prefix].push(questionResponse);
    });

    return Object.entries(prefixMap).map(([prefix, questions]) => ({
      prefix,
      questions
    }));
  }

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

  addSectBMarks(): void {
    this.theoryResults = {
      marksB: this.sectionBMarks,
      quiz: {
        qId: this.qid
      }
    };

    console.log(this.theoryResults);
    console.log(this.theoryResults.marksB);
    console.log(this.theoryResults.quiz.qId);

    this._quiz.addSectionBMarks(this.theoryResults).subscribe(
      (data) => {
        console.log("Marks successful");
      },
      (error) => {
        console.log("Unsuccessful");
      }
    );
  }

  getScoresForPrefixes(groupedData: GroupedQuestions[]): PrefixScores[] {
    return groupedData.map(group => {
      const { prefix, questions } = group;
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

  getGroupedQuestions(prefix: string): any[] {
    return this.selectedQuestionsAnswer.filter(q => q.quesNo.startsWith(prefix));
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  printPage(): void {
    window.print();
  }

  saveDataInBrowser(): void {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {});
  }

  disablePaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  preventAction(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showWarningMessage('Copy/Paste operations are disabled during the exam');
    return;
  }

  private showWarningMessage(message: string): void {
    console.warn(message);
  }

  // ============================================================================
  // ANSWER PERSISTENCE
  // ============================================================================

  clearSavedAnswers(): void {
    this.quiz_progress.clearAnswers(this.qid).subscribe({
      next: (response) => {
        console.log(response.message);
        this.currentQuestions.forEach((q: any) => {
          q.givenAnswer = '';
        });
      },
      error: (error) => {
        console.error('Error clearing answers:', error);
      }
    });
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





  updateSelectedAnswers(q: any, option: string, isChecked: boolean): string[] {
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
    
    const currentAnswers = [...q.givenAnswer];

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
        q.givenAnswer = currentAnswers;
      }
    });

    return q.givenAnswer;
  }

  loadSavedAnswers(): void {
    this.quiz_progress.getAnswersByQuiz(this.qid).subscribe({
      next: (response: UserQuizAnswersResponse) => {
        console.log("📥 Loaded saved answers:", response);

        this.questions.forEach((q: any) => {
          if (response.answers && response.answers[q.quesId]) {
            q.givenAnswer = response.answers[q.quesId];
          } else {
            q.givenAnswer = [];
          }
        });

        console.log("✅ Questions with answers:", this.questions);
      },
      error: (error) => {
        console.error("❌ Error loading saved answers:", error);
        this.questions.forEach((q: any) => {
          q.givenAnswer = [];
        });
      }
    });
  }

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

  loadAnswers(): void {
    this.quiz_progress.loadAnswers(this.qid).subscribe({
      next: (savedAnswers) => {
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

  // ============================================================================
  // PAGINATION
  // ============================================================================

  onTableDataChange(event: any): void {
    this.page = event;
  }

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
  }

  // ============================================================================
  // JSON CONVERSION FOR API
  // ============================================================================

  convertJson(): any {
    this.convertedJsonAPIResponsebody = {
      contents: [
        {
          parts: this.selectedQuestionsAnswer.map(item => {
            const quizId = item.quiz.qId;
            const quesId = item.tqId;
            const questionNo = item.quesNo;
            const question = item.question;
            const answer = item.givenAnswer ? item.givenAnswer : '';
            const marks = item.marks ? item.marks.split(' ')[0] : '';
            let criteria = 'Evaluate based on clarity, completeness, and accuracy';

            const text = `quizId ${quizId}: tqid ${quesId}: Question Number ${questionNo}: ${question}. Answer: ${answer}. Marks: ${marks} Criteria:${criteria}.`;

            return { text: text };
          })
        }
      ]
    };

    console.log(this.convertedJsonAPIResponsebody);
    return this.convertedJsonAPIResponsebody;
  }
}











