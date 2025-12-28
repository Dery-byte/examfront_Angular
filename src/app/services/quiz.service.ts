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
  return this._http.get(`${baseUrl}/getQuizzes`,{
            withCredentials:true

  });
}


public loadQuizzesForUser(){
  return this._http.get(`${baseUrl}/user/getQuiz`,{
            withCredentials:true

  });
}



public addQuiz(quiz){
return this._http.post(`${baseUrl}/addQuiz`, quiz,{
          withCredentials:true
});
}


public addUserQuiz(quiz){
return this._http.post(`${baseUrl}/user/addQuiz`, quiz,{
          withCredentials:true
});
}


// public deleteQuizs(qId){
// return this._http.delete(`${baseUrl}/quiz/${qId}`);
// }

public deleteQuizs(qId){
return this._http.delete(`${baseUrl}/delete/quiz/${qId}`,{
          withCredentials:true

});
}

//get single quiz to facilitate update

public getQuiz(qId){
  return this._http.get(`${baseUrl}/singleQuiz/${qId}`,{
    withCredentials:true
  });
}




public getQuizById(qId){
  return this._http.get(`${baseUrl}/singleQuiz/${qId}`,{
            withCredentials:true

  });
}
//update Quiz
public updateQuiz(quiz){
return this._http.put(`${baseUrl}/update`, quiz,{
          withCredentials:true

});
}

//get quizzes of ctegory

public getQuizzessOfCategory(cid){
  return this._http.get(`${baseUrl}/quiz/category/${cid}`,{
            withCredentials:true

  });
}

//get Active quizzzes
// public actieQuizzes(){
//   return this._http.get(`${baseUrl}/active/quizzes`);
// }



   public actieQuizzes() {
  return this._http.get(`${baseUrl}/active/quizzes`, { 
    withCredentials: true 
  });
}

// get active quizzes of category 
// public getActieQuizzesOfCategory(cid){
//   return this._http.get(`${baseUrl}/category/active/${cid}`)
// }


   public getActieQuizzesOfCategory(cid) {
  return this._http.get(`${baseUrl}/category/active/${cid}`, { 
    withCredentials: true 
  });
}




// GET QUIZZES TAKEN BY SPECIFIC STUDENT BY CATEGORY 
// public getTakenQuizzesOfCategoryByUser(cid){
//   return this._http.get(`${baseUrl}/category/takenByUser/${cid}`)
// }


   public getTakenQuizzesOfCategoryByUser(cid) {
  return this._http.get(`${baseUrl}/category/takenByUser/${cid}`, { 
    withCredentials: true 
  });
}







//get single quiz to facilitate update
public getNumerOfQuesToAnswer(qId){
  return this._http.get(`${baseUrl}/numberOfTheoryQuestion/${qId}`,{
    withCredentials:true
  });
}

public addNumberOfTheoryQuestions(quizNumberOfQuestion){
  return this._http.post(`${baseUrl}/numberOfTheoryQuestion/add`, quizNumberOfQuestion,{
            withCredentials:true

  });
}


//get Active quizzzes
public addSectionBMarks(questions){
  return this._http.put(`${baseUrl}/addtheoryMark`,questions,{
            withCredentials:true

  });
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
  return this._http.post(`${baseUrl}/quizGPT/evaluate`, questions,{
            withCredentials:true

  });
}




public updateQuizStatus(qId: number, status: string) {
  const body = { status };
  return this._http.put(`${baseUrl}/quiz/status/${qId}`, body,{
            withCredentials:true

  });
}








}
 