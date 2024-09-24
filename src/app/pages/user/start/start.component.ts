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
    // event.preventDefault();
    this.preventBackButton();

    // event.returnValue = '' as any; // This is required for some older browsers
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
    this.qid = this._route.snapshot.params['qid'];
    // this.qid = this._route.snapshot.params['qid'];

    this._quiz.getQuiz(this.qid).subscribe((data: any) => {
      console.log(data.title);
      this.quiz = data;

      console.log(this.quiz);
      console.log(this.quiz.quizTime)
      return this.timeO = parseInt(this.quiz.quizTime) * 60;
    },
      (error) => {
        this._snack.open("You're Session has expired! ", "", {
          duration: 3000,
        });
        this.login.logout();
        console.log("error !!");
        // alert("Error loading quiz data")
      }
    );
    this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe((data: any) => {
      console.log(data);
      console.log(data[0].totalQuestToAnswer);
      this.quizTitle = data[0].quiz.title;
      this.courseTitle = data[0].quiz.category.title;

      this.numberOfQuestionsToAnswer = data[0].totalQuestToAnswer;
      this.timeT = data[0].timeAllowed * 60;

      this.timerAll = this.timeT + this.timeO;

      console.log(this.timeT);
      console.log(this.timeO);
      console.log(this.timerAll)

    });

    // console.log(this.timerAll);


    this.loadTheory();
    // this.loadSubjective();
    this.loadQuestions();
    this.startTimer();
    this.loadQuestionsFromLocalStorage();
    this.printQuiz();
    this.initForm();
    // this.preventBackButton();


  }


  loadNumQuesToAnswer() {
    this._quiz.getNumerOfQuesToAnswer(this.qid).subscribe((data: any) => {
      console.log(data.totalQuestToAnswer);
      this.numberOfQuestionsToAnswer = data;
    });
  }


  //  ============================SUBJECTIVE QUESTIONS=======================================
  loadTheory() {
    this._questions.getSubjective(this.qid).subscribe((theory: any) => {
      console.log(theory);
      // this.sectionB = theory;
      this.groupedQuestions = this.getQuestionsGroupedByPrefix(theory);
      this.prefixes = Object.keys(this.groupedQuestions);

      console.log(this.groupedQuestions);
    },
      (error) => {
        console.log("Could not load data from server");
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
  get currentQuestions(): Question[] {
    return this.groupedQuestions[this.prefixes[this.currentPage]];
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
  nextPage() {
    if (this.currentPage < this.prefixes.length - 1) {
      this.currentPage++;
    }
  }
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
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





  loadQuestions(): void {
    this._questions.getQuestionsOfQuiz(this.qid).subscribe((data: any) => {
      // this._questions.getQuestionsOfQuizForText(this.qid).subscribe((data: any) => {  // this does the question shuffle on start of quiz
      // this._questions.getQuestionsOfQuizForText(1).subscribe((data: any) => {  // this does the question shuffle on start of quiz
      // console.log(data[0].answer);
      console.log(data);
      this.questions = data.map((q, index) => {
        q.count = index + 1;
        q['givenAnswer'] = [];
        console.log(this.questions)

        return q;

      });



      let timerString = localStorage.getItem('countdown_timer');
      const timerNumber = parseInt(timerString, 10);
      console.log(typeof (timerNumber));
      if (timerNumber) {
        this.timerAll = timerNumber;
        //Remove value from local storage after accessing it.
        localStorage.removeItem("countdown_timer");
      } else {
        // this.timer = this.questions.length * 2 * 60;
        this.timerAll = (this.quiz.quizTime * 60);
        // this.timerAll = (this.questions.length * 2 * 60) + this.timeT;

      }
      // this.questions.forEach(q => {
      //   q['givenAnswer'] = []; //Initialize as empty array
      // });
    },
      (error) => {
        console.log("Error Loading questions");
        Swal.fire("Error", "Error loading questions", "error");
      }
    );
    this.preventBackButton();
  }



  updateSelectedAnswers(q: any, option: string, isChecked: boolean) {
    if (isChecked) {
      // Add the option to the givenAnswer array if it's checked
      q.givenAnswer.push(option);
    } else {
      // Remove the option from the givenAnswer array if it's unchecked
      const index = q.givenAnswer.indexOf(option);
      if (index !== -1) {
        q.givenAnswer.splice(index, 1);
      }
    }
  }

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
    // this.evalSubjective();
    Swal.fire({
      title: "Do you want to submit the quiz ?",
      showCancelButton: true,
      confirmButtonText: "Submit",
      icon: "info",
    }).then((e) => {
      if (e.isConfirmed) {
        // EVALUATIING THE OBJECTIVES
        this.evalQuiz();
        // localStorage.removeItem("countdown_timer");
        this.printQuiz();
        this.loadQuestionsWithAnswers();
        this.preventBackButton();
      };
    });
  }


  submitAllQuiz() {
    // this.evalSubjective();
    Swal.fire({
      title: "Do you want to submit the quiz ?",
      showCancelButton: true,
      confirmButtonText: "Submit",
      icon: "info",
    }).then((e) => {
      if (e.isConfirmed) {
        // EVALUATE THE SUBJECTIVE
        this.evalSubjective();
        // EVALUATIING THE OBJECTIVES
        this.evalQuiz();
        // localStorage.removeItem("countdown_timer");
        this.printQuiz();
        this.loadQuestionsWithAnswers();
        this.preventBackButton();
      };
    });
  }






  printQuiz() {
    this.router.navigate(['./user-dashboard/0']);
    // this.router.navigate(['./print_quiz/' + this.qid]);
    // this.router.navigate(['./start/' + this.qid]);
  }


  startTimer() {
    let t = window.setInterval(() => {
      //Code
      if (this.timerAll <= 0) {
        // this.submitQuiz();
        this.printQuiz();
        this.evalQuiz();
        this.evalSubjective();
        this.loadQuestionsWithAnswers();
        clearInterval(t);
        // localStorage.removeItem("exam");
        // this.preventBackButton();
      }
      else {
        this.timerAll--;
      }
    }, 1000);
  }


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
      localStorage.setItem('MaxMarks', JSON.stringify(this.maxMarks))
      this.preventBackButton();
      this.isSubmit = true;
    },
      (error) => {
        console.log("Error !")

      }
    );

  }

  parseApiResponse(apiResponse: string[]): any {
    // Assuming apiResponse is an array with a single string element
    let dataString = apiResponse[0];
    // Remove the code block markers (```json and ```)
    dataString = dataString.replace(/```json\n/, '').replace(/\n```/, '');
    // Parse the remaining string into a JSON object
    try {
      const jsonData = JSON.parse(dataString);
      return jsonData;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return null;
    }
  }





  evalSubjective() {
    // const selectedQuestions = [];
    for (const prefix in this.selectedQuestions) {
      this.selectedQuestionsAnswer.push(...this.groupedQuestions[prefix]);
    }
    if (Object.keys(this.selectedQuestions).length === this.numberOfQuestionsToAnswer) {
      // Handle the submission logic here

      localStorage.setItem("answeredQuestions", JSON.stringify(this.selectedQuestions));

      this.convertJson();

      this._quiz.evalTheory(this.convertedJsonAPIResponsebody).subscribe((data: any) => {
        // this.geminiResponse=data.replace('json', "");
        this.geminiResponse = this.parseApiResponse(data);
        // this.geminiResponse= this.groupByPrefix(geminiResponse);
        console.log(data);
        console.log(this.geminiResponse);
        localStorage.setItem("answeredAIQuestions", JSON.stringify(this.geminiResponse));



      });
      console.log('Submitted Questions:', this.selectedQuestionsAnswer);
      console.log(this.convertedJsonAPIResponsebody)
      // SAVE THE SELECTED QUESTIONS IN LOCAL STOREAGE
      localStorage.setItem("answeredQuestions", JSON.stringify(this.selectedQuestionsAnswer));

    }
    (error) => {
      this._snack.open("Please select exactly 3 sets of questions to submit", "", {
        duration: 3000,
      });
    }
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


  //CONVERT TO API RESPONSE

  // Method to convert JSON data
  convertJson() {
    this.convertedJsonAPIResponsebody = {
      contents: [
        {
          parts: this.selectedQuestionsAnswer.map(item => {
            // Extract fields from each item
            const questionNo = item.quesNo;
            const question = item.question;
            const answer = item.givenAnswer ? item.givenAnswer : ''; // Assume empty if null
            const marks = item.marks ? item.marks.split(' ')[0] : ''; // Extracting the numeric part
            let criteri = '';
            let criteria = 'Evaluate the answer for each question, returning the question, answer, and marks. If no answer is found, set marks to 0. Return the result in JSON format.';

            // Define criteria based on the question
            // if (question.includes('Distinguish between')) {
            //   criteria = 'Evaluate based on the accuracy of the comparison.';
            // } else if (question.includes('Explain computer')) {
            //   criteria = 'Evaluate based on clarity, completeness, and accuracy.';
            // } else if (question.includes('What is Photosynthesis')) {
            //   criteria = 'Evaluate based on the accuracy of the scientific explanation.';
            // } else if (question.includes('What is a peripheral device')) {
            //   criteria = 'Evaluate based on clarity and completeness of the definition.';
            // }

            // Create the text format
            const text = `${questionNo}: ${question}. Answer: ${answer}. Marks: ${marks}. Criteria: ${criteria}.`;

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



};

