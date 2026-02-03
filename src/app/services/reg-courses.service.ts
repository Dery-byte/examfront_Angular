import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';






@Injectable({
  providedIn: 'root'
})
export class RegCoursesService {

  constructor(private _http: HttpClient) { }

  // public getRegCourses(): any{
  //   return this._http.get(`${baseUrl}/getRegCourses`)
  // }

    public getRegCourses() {
  return this._http.get(`${baseUrl}/getRegCourses`);
}



  // public regCourses(courses) {
  //   return this._http.post(`${baseUrl}/registerCourse`, courses)
  // }

private jwtToken = localStorage.getItem('token')

uploadQuestions(qid: number, questions): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.jwtToken}` // Add this!
  });
  
  return this._http.post(`${baseUrl}/upload/${qid}`, questions, { headers })
}
  

      public regCourses(courses) {
  return this._http.post(`${baseUrl}/registerCourse `, courses);
}

  // public deleteRegCourse(Rid) {
  //   return this._http.delete(`${baseUrl}/regCourse/deleteById/${Rid}`)
  // }



        public deleteRegCourse(Rid) {
  return this._http.delete(`${baseUrl}/regCourse/deleteById/${Rid}`);
}




// Method to combine and remove duplicates based on cid
combineAndRemoveDuplicates(jsonArray1: any[], jsonArray2: any[]): any[] {
  // Combine the two arrays
  const combinedArray = [...jsonArray1, ...jsonArray2];
  // Use a Map to track occurrences of each cid
  const cidCount = new Map<number, number>();
  for (const item of combinedArray) {
    cidCount.set(item.cid, (cidCount.get(item.cid) || 0) + 1);
  }
  // Filter out items that have duplicates
  return combinedArray.filter(item => cidCount.get(item.cid) === 1);
}



}

