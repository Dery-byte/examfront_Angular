import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';





@Injectable({
  providedIn: 'root'
})
export class RegCoursesService {

  constructor(private _http: HttpClient) { }

  public getRegCourses(): any{
    return this._http.get(`${baseUrl}/getRegCourses`)
  }

  public regCourses(courses) {
    return this._http.post(`${baseUrl}/registerCourse`, courses)
  }

  public deleteRegCourse(Rid) {
    return this._http.delete(`${baseUrl}/regCourse/deleteById/${Rid}`)
  }






}

