import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { tap ,Subject,Observable} from 'rxjs';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private _http:HttpClient) { }

  public getQuestionsOfQuiz(qid){
    return this._http.get(`${baseUrl}/question/quiz/all/${qid}`);
  }


  public getSubjective(qid){
    return this._http.get(`${baseUrl}/theoryquestion/quiz/all/${qid}`);
  }

  public getSpecificSubjective(tqId){
    return this._http.get(`${baseUrl}/theoryquestion/${tqId}`);
  }


  //// HOPE it works
  private refreshNeeded= new Subject<void>();
  
  get refreshNeeded$(){
    return this.refreshNeeded;
  }

  public getSpecificQuestion(quesId){
    return this._http.get(`${baseUrl}/question/${quesId}`)
  }

  public getSpecificObj(quesId){
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

  //Delete Theory Question
  public deleteTheoryQuestion(questionId){
    return this._http.delete(`${baseUrl}/theoryquestion/${questionId}`);
  }

  //Update Question
  public updateQuestion(question){
    return this._http.put(`${baseUrl}/question/updateQuestions`, question);
  }


 //update Theory
public updateTheoryQuestions(theory){
  return this._http.put(`${baseUrl}/theoryquestion/updateQuestions`, theory);
  }


  //Add user ID and Quiz ID 
  public addUserIdQuizId(qid,user){
    return this._http.post(`${baseUrl}/question/add-quizUserId/${qid}`, user);
  }


  //  public addNumberOfTheoryQuestions(quizNumberOfQuestion){
  //   return this._http.post(`${baseUrl}/numberOfTheoryQuestion/add`, quizNumberOfQuestion);
  // }



  public getNumerOfQuesToAnswer(qId){
    return this._http.get(`${baseUrl}/numberOfTheoryQuestion/${qId}`);
  }

 //update TheoryNumber of Questions to answer
 public updateTheoryNumberOfQuestionsToAnswer(numberOfquestionsToAnswer){
  return this._http.put(`${baseUrl}/numberOfTheoryQuestion/update`, numberOfquestionsToAnswer);
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


    private jwtToken = localStorage.getItem('token')

    
    // upload questions
    uploadQuestions(qid: number, questions): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        // 'Content-Type': 'multipart/form-data',
      });
        return this._http.post(`${baseUrl}/upload/${qid}`, questions, {headers})
  }


  uploadTheoryQuestions(qid: number, questions): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Content-Type': 'multipart/form-data',
      
    });
    console.log('Payload being sent:', JSON.stringify(questions));

      return this._http.post(`${baseUrl}/theoryupload/${qid}`, questions, {headers})
}

public getNumerOfQuesToAnswerBy(qId){
  return this._http.get(`${baseUrl}/numberOfTheoryQuestion/${qId}`);
}


}


