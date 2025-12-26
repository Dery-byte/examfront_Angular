import { Injectable, OnInit } from '@angular/core';
import baseUrl from './helper';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';




@Injectable({
  providedIn: 'root'
})
export class ReportServiceService {
  constructor( private _http:HttpClient ) { }

public loadResultsSummary(rId){
  return this._http.get(`${baseUrl}/getReport/${rId}`,{
    withCredentials: true 
  });
}


public loadReportSummary(): Observable<any> {
  return this._http.get(`${baseUrl}/getReport`,{
    withCredentials: true 
  });
}

//get Report by userId and QuizId
// public getReport(uId,qId){
//   return this._http.get(`${baseUrl}/getReportByUidAndQid/${uId}/${qId}`);
// }


    public getReport(uId,qId) {
  return this._http.get(`${baseUrl}/getReportByUidAndQid/${uId}/${qId}`, { 
    withCredentials: true 
  });
}




// public getReportsByUserID(uid){
//   return this._http.get(`${baseUrl}/getReportsByUser/${uid}`);
// }


   public getReportsByUserID(uid) {
  return this._http.get(`${baseUrl}/getReportsByUser/${uid}`, { 
    withCredentials: true 
  });
}




public getReportsByUserAndId(qid){
  return this._http.get(`${baseUrl}/quiz-results/my-quiz/${qid}`,{
    withCredentials: true 
  });
}

public getTheoryDetails(qid){
  return this._http.get(`${baseUrl}/quiz/${qid}`,{
    withCredentials: true 
  });
}

public getResultsDetails(qid){
  return this._http.get(`${baseUrl}/quiz/result/${qid}`,{
    withCredentials: true 
  });
}







getUniqueCategoriesAndQuizzes(): Observable<any[]> {
  return this.loadReportSummary().pipe(
    map(quizzes => this.extractCategoriesAndQuizzes(quizzes))
  );
}

private extractCategoriesAndQuizzes(quizzes: any[]): any[] {
  const result = [];
  quizzes.forEach((quiz) => {
    const categoryId = quiz.quiz.category.cid;
    // Find the category index in the result array
    const categoryIndex = result.findIndex((c) => c.cid === categoryId);
    if (categoryIndex === -1) {
      // Category not found, add a new category
      const category = {
        cid: categoryId,
        title: quiz.quiz.category.title,
        quizTitles: [
          {
            qId: quiz.quiz.qId,
            title: quiz.quiz.title,
          },
        ],
      };
      result.push(category);
    } else {
      // Category found, check if the quiz title is unique
      const existingQuizIndex = result[categoryIndex].quizTitles.findIndex(
        (q) => q.qId === quiz.quiz.qId
      );
      if (existingQuizIndex === -1) {
        // Quiz title is unique, add it to the existing category
        result[categoryIndex].quizTitles.push({
          qId: quiz.quiz.qId,
          title: quiz.quiz.title,
        });
      }
    }
  });

  return result;
}





// ======================================================



// ======================================================

//get Report by  QuizId
public getReportByQuizId(qId){
  return this._http.get(`${baseUrl}/getReports/${qId}`,{
    withCredentials: true 
  });
}


}
