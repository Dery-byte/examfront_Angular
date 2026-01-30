import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrlCategory from './categoryHelper';
import baseUrl from './helper';
import { BehaviorSubject, Observable } from 'rxjs';
import baseUrlGemini from './helperGemini';

import { TokenExpirationService } from './token-expiration.service';



@Injectable({
  providedIn: 'root'
})
export class QuizService {
attempts:any
data="";
private items: BehaviorSubject<any> =new BehaviorSubject<any>(this.data);
$items: Observable<any> = this.items.asObservable();

 
  constructor( private _http:HttpClient, private token: TokenExpirationService) { }

  setLocalStorageData(){
    localStorage.setItem("Attempts", this.attempts)
    this.data=this.attempts;
  }

public loadQuizzes(){
  return this._http.get(`${baseUrl}/getQuizzes`);
}


public loadQuizzesForUser(){
  return this._http.get(`${baseUrl}/user/getQuiz`);
}



public addQuiz(quiz){
return this._http.post(`${baseUrl}/addQuiz`, quiz);
}


public addUserQuiz(quiz){
return this._http.post(`${baseUrl}/user/addQuiz`, quiz);
}


// public deleteQuizs(qId){
// return this._http.delete(`${baseUrl}/quiz/${qId}`);
// }

public deleteQuizs(qId){
return this._http.delete(`${baseUrl}/delete/quiz/${qId}`);
}

//get single quiz to facilitate update

public getQuiz(qId){
  return this._http.get(`${baseUrl}/singleQuiz/${qId}`);
}




public getQuizById(qId){
  return this._http.get(`${baseUrl}/singleQuiz/${qId}`);
}
//update Quiz
public updateQuiz(quiz){
return this._http.put(`${baseUrl}/update`, quiz);
}

//get quizzes of ctegory

public getQuizzessOfCategory(cid){
  return this._http.get(`${baseUrl}/quiz/category/${cid}`);
}

//get Active quizzzes
// public actieQuizzes(){
//   return this._http.get(`${baseUrl}/active/quizzes`);
// }



   public actieQuizzes() {
  return this._http.get(`${baseUrl}/active/quizzes`);
}

// get active quizzes of category 
// public getActieQuizzesOfCategory(cid){
//   return this._http.get(`${baseUrl}/category/active/${cid}`)
// }


   public getActieQuizzesOfCategory(cid) {
  return this._http.get(`${baseUrl}/category/active/${cid}`);
}




// GET QUIZZES TAKEN BY SPECIFIC STUDENT BY CATEGORY 
// public getTakenQuizzesOfCategoryByUser(cid){
//   return this._http.get(`${baseUrl}/category/takenByUser/${cid}`)
// }


   public getTakenQuizzesOfCategoryByUser(cid) {
  return this._http.get(`${baseUrl}/category/takenByUser/${cid}`);
}







//get single quiz to facilitate update
public getNumerOfQuesToAnswer(qId){
  return this._http.get(`${baseUrl}/numberOfTheoryQuestion/${qId}`);
}

public addNumberOfTheoryQuestions(quizNumberOfQuestion){
  return this._http.post(`${baseUrl}/numberOfTheoryQuestion/add`, quizNumberOfQuestion);
}


//get Active quizzzes
public addSectionBMarks(questions){
  return this._http.put(`${baseUrl}/addtheoryMark`,questions);
}

//BELOW IS FOR TESTING

// public evalTheory(questions){
//   return this._http.post(`${baseUrlGemini}/quiz/eval`, questions);
// }

// public evalTheory(questions: any) {
//   const token = this.token.getTokenFromLocalStorage();
//   const headers = new HttpHeaders({
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}` // Replace with your token retrieval logic
//   });
//   return this._http.post(`${baseUrl}/quizEval`, questions, { headers });
// }


// GEMINI API EVALUATION
// public evalTheory(questions){
//   return this._http.post(`${baseUrl}/quizEval`, questions);
// }





// GPT EVALUATION
public evalTheory(questions){
  return this._http.post(`${baseUrl}/quizGPT/evaluate`, questions);
}




public updateQuizStatus(qId: number, status: string) {
  const body = { status };
  return this._http.put(`${baseUrl}/quiz/status/${qId}`, body);
}








}
 