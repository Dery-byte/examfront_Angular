import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { tap ,Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private _http:HttpClient) { }

  public getQuestionsOfQuiz(qid){
    return this._http.get(`${baseUrl}/question/quiz/all/${qid}`);
  }
  //// HOPE it works
  private refreshNeeded= new Subject<void>();
  
  get refreshNeeded$(){
    return this.refreshNeeded;
  }

  public getSpecificQuestion(quesId){
    return this._http.get(`${baseUrl}/question/${quesId}`)
  }

  public getQuestionsOfQuizForText(qid){
    return this._http.get(`${baseUrl}/question/quiz/${qid}`);
  }

  // add questions 
  public addQuestion(question){
    return this._http.post(`${baseUrl}/question/add`, question);
  }

  //delete Question
  public deleteQuestion(questionId){
    return this._http.delete(`${baseUrl}/question/${questionId}`);
  }

  //Update Question
  public updateQuestion(question){
    return this._http.put(`${baseUrl}/question/updateQuestions`, question);
  }


  //Add user ID and Quiz ID 
  public addUserIdQuizId(qid,user){
    return this._http.post(`${baseUrl}/question/add-quizUserId/${qid}`, user);
  }

//get report with ID parameter
public getReportIdUserId(rid){
  return this._http.get(`${baseUrl}/getReport/{rid}`);
}

public getReport(){
  return this._http.get(`${baseUrl}/getReport`);
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
  public evalQuiz(qid,question){
    return this._http.post(`${baseUrl}/question/eval-quiz/${qid}`, question)
    .pipe(
      tap(()=>{
        this.refreshNeeded.next();
      })
    )};
}


