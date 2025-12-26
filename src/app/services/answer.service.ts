import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AnswerService {
constructor( private _http:HttpClient ) { }





  //get Report by userId and QuizId
  // get Report by quizId
public getTheoryReport(qId: number): Observable<any> {
  const token = localStorage.getItem('token'); // or however you store it
  const headers = {
    Authorization: `Bearer ${token}`
  };
  return this._http.get(`${baseUrl}/answers/quiz/${qId}`, { 
    headers,
  withCredentials: true 
  });
}

// public getTheoryReport(qId){
//   return this._http.get(`${baseUrl}//answers/quiz/${qId}`);
// }

}
