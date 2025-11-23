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

import Swal from 'sweetalert2';

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

// interface Question {
//   quesNo: string;
//   question: string;
//   answer: string | null;
//   marks: string;
//   quiz: Quiz;
//   tqId: number;  // Make sure this is included
//   givenAnswer: string;
//   selected: boolean;
// }
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
  private countdownKey = 'countdown_timer';
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

  get isSubmitDisabled(): boolean {
    return Object.keys(this.selectedQuestions).length !== this.numberOfQuestionsToAnswer;
  }
  //  ============================SUBJECTIVE QUESTIONS=======================================






  constructor(private _quiz: QuizService,
    private fb: FormBuilder,
    private login: LoginService,
    private locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _snack: MatSnackBar,
    private _questions: QuestionService,
    private router: Router) {
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    // Custom code to be executed before the page is unloaded
    localStorage.setItem(this.countdownKey, JSON.stringify(this.timerAll));
    console.log('countdownKey:', this.countdownKey);
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

  // onSubmitt() {
  //   Swal.fire({
  //     title: "Do you want to submit the questions answered?",
  //     showCancelButton: true,
  //     confirmButtonText: "Submit",
  //     icon: "info",
  //   }).then((e) => {
  //     if (e.isConfirmed) {
  //       const selectedQuestions = [];
  //       for (const prefix in this.selectedQuestions) {
  //         selectedQuestions.push(...this.groupedQuestions[prefix]);
  //       }
  //       if (Object.keys(this.selectedQuestions).length === this.numberOfQuestionsToAnswer) {
  //         // Handle the submission logic here
  //         console.log('Submitted Questions:', selectedQuestions);
  //       } else {
  //         alert('Please select exactly 2 sets of questions to submit.');
  //       }
  //     };
  //   });
  // }
  //  ============================SUBJECTIVE QUESTIONS=======================================


  ngOnInit(): void {
      this.isLoading = true; // Set loading to true when starting

    this.qid = this._route.snapshot.params['qid'];
    // this.qid = this._route.snapshot.params['qid'];
    this._quiz.getQuiz(this.qid).subscribe((data: any) => {
      console.log(data.title);
      this.quiz = data;
      this.courseTitle = this.quiz.category.title;


      console.log(this.quiz);
      console.log(this.quiz.quizTime)


      this.timeO = this.quiz.quizTime * 1;
      // this.timerAll = (this.timeT + this.timeO) * 60;


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




    this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe((data: any) => {
      this.numberOfQuestionsToAnswer = data[0].totalQuestToAnswer;
      console.log("This is for number of questions to answer", data[0].timeAllowed);
      console.log("Number question to answer ", data[0].totalQuestToAnswer);
      this.quizTitle = data[0].quiz.title;
      this.courseTitle = data[0].quiz.category.title;

      // this.numberOfQuestionsToAnswer = this.noOfQuesObject[0].totalQuestToAnswer;
      this.timeT = data[0].timeAllowed;
      console.log("This is the number of questions to answer", this.numberOfQuestionsToAnswer);
      console.log("This is the time for the Theory ", this.timeT);


      let timerString = localStorage.getItem('countdown_timer');
      const timerNumber = parseInt(timerString, 10);
      console.log(typeof (timerNumber));

      if (timerNumber) {
        this.timerAll = timerNumber;
        console.log("The remaining time is ", this.timerAll);
        console.log("The remaining time from the localStorage ", timerString);
        console.log("This is remaining Theory timer", this.timeT);
        console.log("This is remaining Theory timer", this.timeO);
        //Remove value from local storage after accessing it.
        localStorage.removeItem("countdown_timer");
      } else {
        // this.timer = this.questions.length * 2 * 60;
        // this.timerAll = (this.quiz.quizTime * 60);
        this.timerAll = (this.timeT + this.timeO) * 60;
        // this.timerAll = (this.questions.length * 2 * 60) + this.timeT;
        localStorage.setItem('totalTime', JSON.stringify(this.timerAll));

      }



      // this.timerAll = (this.timeT + this.timeO) * 60;

      // this.timeT = data[0].timeAllowed;
      // this.timerAll = (this.timeT + this.timeO) * 60;




      console.log("This is time for the theory questions", this.timeT);
      console.log("This is the time for the Objectives", this.timeO);
      console.log(" Both time for theory and objectives", this.timerAll)


    this.loadTheory();
    // this.loadSavedAnswers();

    // this.loadSubjective();
    this.loadQuestions();
    },
    (error)=>{
          this.isLoading = false;


    });

    // console.log(this.timerAll);




    this.loadQuestionsFromLocalStorage();

    // this.startTimer();
    // this.printQuiz();
    this.initForm();
    this.preventBackButton();



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

      this.prefixes = Object.keys(this.groupedQuestions).sort();

      this.loadQuestionsTheory();

      console.log(this.groupedQuestions);
      this.startTimer();
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

  loadQuestionsTheory(): void {
    const key = this.prefixes[this.currentPage];
    this.currentQuestions = this.groupedQuestions[key] || [];
    this.loadSavedAnswers(); // load into currentQuestions
  }




  togglePrefixSelection(prefix: string) {
    if (this.selectedQuestions[prefix]) {
      // Deselect all sub-questions
      this.groupedQuestions[prefix].forEach(question => question.selected = false);
      delete this.selectedQuestions[prefix];
    } else {
      if (Object.keys(this.groupedQuestions).length >= this.numberOfQuestionsToAnswer) {
        // Select all sub-questions
        this.groupedQuestions[prefix].forEach(question => question.selected = true);
        this.selectedQuestions[prefix] = true;
      }
      else {
        alert('You can only select ' + this.numberOfQuestionsToAnswer + ' set(s) of questions.');
        this._snack.open(`You can only select ${this.numberOfQuestionsToAnswer} sets of questions`, "", {
          duration: 3000,
        });
      }
    }

  }

  // disableOtherSelection(){
  //   Object.keys(this.selectedQuestions).length = this.numberOfQuestionsToAnswer
  // }


  onPrefixChange(prefix: string) {
    this.selectedPrefix = prefix;
  }
  // nextPage() {
  //   if (this.currentPage < this.prefixes.length - 1) {
  //     this.currentPage++;
  //     this.saveAnswers();
  //         // this.loadSavedAnswers();

  //   }
  // }
  // prevPage() {
  //   if (this.currentPage > 0) {
  //     this.currentPage--;
  //     this.saveAnswers();
  //         // this.loadSavedAnswers();

  //   }
  // }


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





  // loadQuestions(): void {
  //   this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {
  //     // this._questions.getQuestionsOfQuizForText(this.qid).subscribe((data: any) => {  // this does the question shuffle on start of quiz
  //     // this._questions.getQuestionsOfQuizForText(1).subscribe((data: any) => {  // this does the question shuffle on start of quiz
  //     // console.log(data[0].answer);
  //     console.log("This is quest data",data);
  //     this.questions = data.map((q, index) => {
  //       q.count = index + 1;
  //       q['givenAnswer'] = [];
  //       console.log(this.questions)

  //       return q;

  //     });


  //   },
  //     (error) => {
  //       console.log("Error Loading questions");
  //       Swal.fire("Error", "Error loading questions", "error");
  //     }
  //   );
  //   this.preventBackButton();
  // }







  // updateSelectedAnswers(q: any, option: string, isChecked: boolean) {
  //   if (isChecked) {
  //     // Add the option to the givenAnswer array if it's checked
  //     q.givenAnswer.push(option);
  //   } else {
  //     // Remove the option from the givenAnswer array if it's unchecked
  //     const index = q.givenAnswer.indexOf(option);
  //     if (index !== -1) {
  //       q.givenAnswer.splice(index, 1);
  //     }
  //   }
  // }

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


  // submitQuiz() {
  //   // this.evalSubjective();
  //   Swal.fire({
  //     title: "Do you want to submit the quiz ?",
  //     showCancelButton: true,
  //     confirmButtonText: "Submit",
  //     icon: "info",
  //   }).then((e) => {
  //     if (e.isConfirmed) {
  //       this.evalQuiz();
  //       // this.triggerAddSectBMarks();
  //       // localStorage.removeItem("countdown_timer");
  //       // this.waitNavigateFunction();
  //       this.loadQuestionsWithAnswers();
  //       this.evalSubjective();
  //       // this.loadSubjectiveAIEval();
  //       // this.getGrandTotalMarks();
  //       this.preventBackButton();
  //     };
  //   });
  // }
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
          // this.evalSubjective();
          this.preventBackButton();

          // Optional: Close the spinner and show success message
          Swal.fire({
            icon: 'success',
            title: 'Evaluated!',
            text: `Your results for "${this.courseTitle}" is available for print on the dashboard.`,
          }).then(()=>{
            window.close();
          });

        }, 3000); // You can remove this delay or wait for async logic instead
      }
    });

    // window.close();
  }


  // submitAllQuiz() {
  //   // this.evalSubjective();
  //   Swal.fire({
  //     title: "Do you want to submit the quiz ?",
  //     showCancelButton: true,
  //     confirmButtonText: "Submit",
  //     icon: "info",
  //   }).then((e) => {
  //     if (e.isConfirmed) {
  //       // EVALUATE THE SUBJECTIVE
  //       this.evalQuiz();
  //       // this.triggerAddSectBMarks();
  //       // localStorage.removeItem("countdown_timer");
  //       this.waitNavigateFunction();
  //       this.loadQuestionsWithAnswers();
  //       this.evalSubjective();
  //       // this.loadSubjectiveAIEval();
  //       // this.getGrandTotalMarks();
  //       this.preventBackButton();
  //     };
  //   });
  // }

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

          this.preventBackButton();

          // Optional: Close the spinner and show success message
          Swal.fire({
            icon: 'success',
            title: 'Evaluated!',
            text: `Your results for ${this.courseTitle} is available for print on the dashboard.`,
          }).then(()=>{
            window.close();
          });

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
    // this.router.navigate(['./print_quiz/' + this.qid]);
    // this.router.navigate(['./start/' + this.qid]);
  }


  async startTimer() {
    let t = window.setInterval(async () => {
      //Code
      if (this.timerAll <= 0) {
        // this.submitQuiz();
        // this.triggerAddSectBMarks();
        // localStorage.removeItem("countdown_timer");
        this.evalQuiz();
        this.waitNavigateFunction();
        this.loadQuestionsWithAnswers();
        await this.evalSubjective();            // ✅ Wait here
        // this.loadSubjectiveAIEval();
        // this.getGrandTotalMarks();
        this.preventBackButton();
        // this.addSectBMarks();
        clearInterval(t);
        // localStorage.removeItem("exam");
        // this.preventBackButton();
      }
      else {
        this.timerAll--;
      }
    }, 1000);
  }
  // DISABLE PASTE
  // disablePaste(event: ClipboardEvent): void {
  //   event.preventDefault();
  // }


  getFormmatedTime() {
    // let timeToseconds = this.timerAll * 60
    let hr = Math.floor(this.timerAll / 3600);
    let mm = Math.floor((this.timerAll % 3600) / 60);
    let ss = this.timerAll % 60;

    let formattedTime = '';
    if (hr > 0) {
      formattedTime += `${hr} hr(s) : `;
    }
    formattedTime += `${mm} min : ${ss} sec`;
    return formattedTime;
  }


  evalQuiz() {
    //Evaluate questions
    this._questions.evalQuiz(this.qid, this.questions).subscribe((data: any) => {
      console.log(this.questions);
      console.log(data);
      this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
      this.correct_answer = data.correct_answer;
      this.attempted = data.attempted;
      this.maxMarks = data.maxMarks;
      localStorage.setItem('CorrectAnswer', JSON.stringify(this.correct_answer));
      localStorage.setItem('MarksGot', JSON.stringify(this.marksGot));
      localStorage.setItem('Attempted', JSON.stringify(this.attempted));
      localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks));
      this.clearSavedAnswers();
      // this.addSectBMarks();
      this.preventBackButton();
      // this.evalSubjective();
      this.isSubmit = true;
    },
      (error) => {
        console.log("Error !")

      }

    );

  }








  async evalSubjective(): Promise<void> {
    for (const prefix in this.selectedQuestions) {
      this.selectedQuestionsAnswer.push(...this.groupedQuestions[prefix]);
    }
    if (Object.keys(this.selectedQuestions).length === this.numberOfQuestionsToAnswer) {
      localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestions));
      this.convertJson();

      this._quiz.evalTheory(this.convertedJsonAPIResponsebody).subscribe((data: any) => {
        console.log("This is the Original Response from the server and formatted!!!!");

        // Store the response only once
        this.geminiResponse = data;
        localStorage.setItem("answeredAIQuestions" + this.qid, JSON.stringify(this.geminiResponse));

        console.log('Stored successfully:', localStorage.getItem("answeredAIQuestions" + this.qid));
        console.log(this.geminiResponse);

        setTimeout(() => {
          this.loadSubjectiveAIEval();
        }, 1000);
      });

      localStorage.setItem(this.qid + "answeredQuestions", JSON.stringify(this.selectedQuestionsAnswer));
    }
    (error) => {
      this._snack.open("Please select exactly 3 sets of questions to submit", "", {
        duration: 3000,
      });
    }
                  // window.close();

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
  loadQuestionsFromLocalStorage() {
    // this.questionss = JSON.parse(localStorage.getItem("exam"));
    // this.timeO = parseInt(this.quiz.quizTime) * 60;
    this.timeO = parseInt(this.questionss[0].quiz.category.quizTime) * 1 * 60;
    // this.timer = this.questionss.length * 2 * 60; // THIS WORKS FINE
    localStorage.setItem('time', JSON.stringify(this.timeO));
    this.questions.forEach(q => {
      q['givenAnswer'] = "";
    });
    // localStorage.setItem('exam', JSON.stringify(data));
    // this.preventBackButton();
    // this.startTimer();
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


  // In your component
  private saveAnswers(): void {
    const storageKey = 'savedAnswers';
    const existing = localStorage.getItem(storageKey);
    let savedAnswers = existing ? JSON.parse(existing) : [];

    // Merge currentQuestions into savedAnswers
    this.currentQuestions.forEach((currentQ: any) => {
      const index = savedAnswers.findIndex((q: any) => q.quesNo === currentQ.quesNo);
      if (index !== -1) {
        savedAnswers[index].givenAnswer = currentQ.givenAnswer; // update existing
      } else {
        savedAnswers.push({
          quesNo: currentQ.quesNo,
          givenAnswer: currentQ.givenAnswer,
        }); // keep only what's necessary
      }
    });

    localStorage.setItem(storageKey, JSON.stringify(savedAnswers));
  }



  saved
  loadSavedAnswers() {
    const saved = localStorage.getItem('savedAnswers');
    if (saved) {
      const savedAnswers = JSON.parse(saved);
      this.currentQuestions.forEach((question: any) => {
        const savedQ = savedAnswers.find((sq: any) => sq.quesNo === question.quesNo);
        if (savedQ) {
          question.givenAnswer = savedQ.givenAnswer;
        }
      });
    }
  }


  clearSavedAnswers(): void {
    localStorage.removeItem('savedAnswers');
    localStorage.removeItem('selectedAnswers');
    console.log('Saved answers cleared from localStorage');
  }



































































  //PESISTING OBJ EVEN ON PAGE REFRESH
  loadQuestions(): void {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe(
      (data: any) => {
        // Get all stored answers from localStorage
        const storedAnswers = JSON.parse(localStorage.getItem('selectedAnswers') || '{}');

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
    // Initialize storage if needed
    if (!q.givenAnswer) {
      q.givenAnswer = [];
    }

    // Get all stored answers from localStorage
    const allStoredAnswers = JSON.parse(localStorage.getItem('selectedAnswers') || '{}');

    // Handle adding or removing the option from current question's answers
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

    // Update the specific question's answers in the overall storage object
    // Using question ID as the unique key to avoid conflicts
    allStoredAnswers[q.quesId] = [...q.givenAnswer]; // Create a copy to avoid reference issues

    // Save all answers back to localStorage
    localStorage.setItem('selectedAnswers', JSON.stringify(allStoredAnswers));

    // 🔍 Debugging Logs
    console.log("✅ Updated Question ID:", q.quesId);
    console.log("➡️ Option Changed:", option, "Checked:", isChecked);
    console.log("📦 Current givenAnswer:", q.givenAnswer);
    console.log("🗃️ All storedAnswers:", allStoredAnswers);

    // Return the updated answers (useful for reactive frameworks)
    return q.givenAnswer;
  }


};

