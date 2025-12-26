import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { tap, Subject, Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private _http: HttpClient) { }

  // public getQuestionsOfQuiz(qid){
  //   return this._http.get(`${baseUrl}/question/quiz/all/${qid}`);
  // }

  public getQuestionsOfQuiz(qid) {
    return this._http.get(`${baseUrl}/question/quiz/all/${qid}`, {
      withCredentials: true
    });
  }


  public getSubjective(qid) {
    return this._http.get(`${baseUrl}/theoryquestion/quiz/all/${qid}`, {
      withCredentials: true
    });
  }

  public getSpecificSubjective(tqId) {
    return this._http.get(`${baseUrl}/theoryquestion/${tqId}`, {
      withCredentials: true
    });
  }


  //// HOPE it works
  private refreshNeeded = new Subject<void>();

  get refreshNeeded$() {
    return this.refreshNeeded;
  }

  public getSpecificQuestion(quesId) {
    return this._http.get(`${baseUrl}/question/${quesId}`, {
      withCredentials: true
    })
  }

  public getSpecificObj(quesId) {
    return this._http.get(`${baseUrl}/question/${quesId}`, {
      withCredentials: true
    })
  }

  public getQuestionsOfQuizForText(qid) {
    return this._http.get(`${baseUrl}/question/quiz/${qid}`, {
      withCredentials: true
    });
  }

  // add questions 
  public addQuestion(question) {
    return this._http.post(`${baseUrl}/question/add`, question, {
      withCredentials: true
    });
  }

  //delete Question
  public deleteQuestion(questionId) {
    return this._http.delete(`${baseUrl}/question/${questionId}`, {
      withCredentials: true
    });
  }

  //Delete Theory Question
  public deleteTheoryQuestion(questionId) {
    return this._http.delete(`${baseUrl}/theoryquestion/${questionId}`, {
      withCredentials: true
    });
  }

  //Update Question
  public updateQuestion(question) {
    return this._http.put(`${baseUrl}/question/updateQuestions`, question, {
      withCredentials: true
    });
  }


  //update Theory
  public updateTheoryQuestions(theory) {
    return this._http.put(`${baseUrl}/theoryquestion/updateQuestions`, theory, {
      withCredentials: true
    });
  }


  //Add user ID and Quiz ID 
  public addUserIdQuizId(qid, user) {
    return this._http.post(`${baseUrl}/question/add-quizUserId/${qid}`, user, {
      withCredentials: true
    });
  }


  //  public addNumberOfTheoryQuestions(quizNumberOfQuestion){
  //   return this._http.post(`${baseUrl}/numberOfTheoryQuestion/add`, quizNumberOfQuestion);
  // }



  public getNumerOfQuesToAnswer(qId) {
    return this._http.get(`${baseUrl}/numberOfTheoryQuestion/${qId}`, {
      withCredentials: true
    });
  }

  //update TheoryNumber of Questions to answer
  public updateTheoryNumberOfQuestionsToAnswer(numberOfquestionsToAnswer) {
    return this._http.put(`${baseUrl}/numberOfTheoryQuestion/update`, numberOfquestionsToAnswer, {
      withCredentials: true
    });
  }




  //get report with ID parameter
  public getReportIdUserId(rid) {
    return this._http.get(`${baseUrl}/getReport/{rid}`, {
      withCredentials: true
    });
  }

  public getReport() {
    return this._http.get(`${baseUrl}/getReport`, {
      withCredentials: true
    });
  }


  //eval-quiz ORIGINAL
  // public evalQuiz(question){
  // return this._http.post(`${baseUrl}/question/eval-quiz`, question)
  // .pipe(
  //   tap(()=>{
  //     this.refreshNeeded.next();
  //   })
  // )};

  //eval-quiz
  // public evalQuiz(qid, question) {
  //   return this._http.post(`${baseUrl}/question/eval-quiz/${qid}`, question, {
  //     withCredentials: true
  //   })
  //     .pipe(
  //       tap(() => {
  //         this.refreshNeeded.next();
  //       })
  //     )
  // };


    public evalQuiz(qid, question) {
    return this._http.post(`${baseUrl}/question/eval-quiz/${qid}`, question,
      {withCredentials: true}
    )
      .pipe(
        tap(() => {
          this.refreshNeeded.next();
        })
      )
  };



  private jwtToken = localStorage.getItem('token')
  // upload questions
  uploadQuestions(qid: number, questions): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Content-Type': 'multipart/form-data',
    });
    return this._http.post(`${baseUrl}/upload/${qid}`, questions, {
      headers,
      withCredentials: true
    })
  }


  uploadTheoryQuestions(qid: number, questions): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Content-Type': 'multipart/form-data',
    });
    console.log('Payload being sent:', JSON.stringify(questions));
    return this._http.post(`${baseUrl}/theoryupload/${qid}`, questions, {
      headers,
      withCredentials: true,
      responseType: 'text' // This tells Angular to expect text, not JSON
    });
  }


  //   uploadTheoryQuestions(qid: number, questions): Observable<any> {
  //     const headers = new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       // 'Content-Type': 'multipart/form-data',
  //     });
  //     console.log('Payload being sent:', JSON.stringify(questions));
  //       return this._http.post(`${baseUrl}/theoryupload/${qid}`, questions, {headers})
  // }

  public getNumerOfQuesToAnswerBy(qId) {
    return this._http.get(`${baseUrl}/numberOfTheoryQuestion/${qId}`, {
      withCredentials: true
    });
  }

}


