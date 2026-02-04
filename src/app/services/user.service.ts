import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http:HttpClient ) { }

  //add user
  public addUser(user:any){
return this.http.post(`${baseUrl}/register`, user);
  }

  public alluser(){
    return this.http.get(`${baseUrl}/users`)
  }


  registerLecturer(payload: any) {
  return this.http.post(`${baseUrl}/register/lecturer`, payload);
}





public allStudentss(){
    return this.http.get(`${baseUrl}/students/counts`)
  }

public allLecturer(){
    return this.http.get(`${baseUrl}/lecturers/counts`)
  }
  public allAdmin(){
    return this.http.get(`${baseUrl}/admins/counts`)
  }


}
