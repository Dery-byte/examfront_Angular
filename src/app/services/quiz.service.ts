import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrlCategory from './categoryHelper';
import baseUrl from './helper';
import { BehaviorSubject, Observable } from 'rxjs';
import baseUrlGemini from './helperGemini';


@Injectable({
  providedIn: 'root'
})
export class QuizService {
attempts:any
data="";
private items: BehaviorSubject<any> =new BehaviorSubject<any>(this.data);
$items: Observable<any> = this.items.asObservable();

 
  constructor( private _http:HttpClient) { }

  setLocalStorageData(){
    localStorage.setItem("Attempts", this.attempts)
    this.data=this.attempts;
  }

public loadQuizzes(){
  return this._http.get(`${baseUrl}/getQuizzes`);
}

public addQuiz(quiz){
return this._http.post(`${baseUrl}/addQuiz`, quiz);
}


public deleteQuizs(qId){
return this._http.delete(`${baseUrl}/quiz/${qId}`);

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
public actieQuizzes(){
  return this._http.get(`${baseUrl}/active/quizzes`);
}

// get active quizzes of category 
public getActieQuizzesOfCategory(cid){
  return this._http.get(`${baseUrl}/category/active/${cid}`)
}

//get single quiz to facilitate update

public getNumerOfQuesToAnswer(qId){
  return this._http.get(`${baseUrl}/numberOfTheoryQuestion/${qId}`);
}

public addNumberOfTheoryQuestions(quizNumberOfQuestion){
  return this._http.post(`${baseUrl}/numberOfTheoryQuestion/add`, quizNumberOfQuestion);
}

//BELOW IS FOR TESTING

// public evalTheory(questions){
//   return this._http.post(`${baseUrlGemini}/quiz/eval`, questions);
// }

public evalTheory(questions){
  return this._http.post(`${baseUrl}/quizEval`, questions);
}


}
 