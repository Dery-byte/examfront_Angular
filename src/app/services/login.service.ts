import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { Subject } from 'rxjs';
// import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';

import { jwtDecode } from 'jwt-decode';
import { Question } from 'src/model testing/model';


@Injectable({
  providedIn: 'root'
})
export class LoginService {


  private questions: Question[] = [
    { id: 'Q1a', text: 'What is Photosynthesis?',marks:'3 marks' , givenAnswer:[]},
    { id: 'Q1b', text: 'Explain computer.', marks:'4 marks' , givenAnswer:[] },
    { id: 'Q1c', text: 'Distinguish between Solid State Drive and Hard Disk Drive.',marks:'3 marks'  , givenAnswer:[]},
    { id: 'Q2ai', text: 'What is a peripheral device?',marks:'5 marks'  , givenAnswer:[]},
    { id: 'Q2aii', text: 'Mention two components of the motherboard.' ,marks:'2 marks' , givenAnswer:[]},
    { id: 'Q2b', text: 'What is an Input device?' ,marks:'1 marks' , givenAnswer:[]},
    { id: 'Q2c', text: 'What is an output device?',marks:'1 marks' , givenAnswer:[] },
    { id: 'Q3a', text: 'Explain Information Processing System.',marks:'3 marks' , givenAnswer:[] },
    { id: 'Q3bi', text: 'What is a storage device?',marks:'2 marks' , givenAnswer:[] },
    { id: 'Q3bii', text: 'What is a processing device?',marks:'4 marks'  , givenAnswer:[]},
    { id: 'Q3biii', text: 'Briefly explain the computer CPU.',marks:'3 marks'  , givenAnswer:[]},
    { id: 'Q3c', text: 'Give 2 examples of processor manufacturing companies.',marks:'4 marks'  , givenAnswer:[]},
    { id: 'Q4a', text: 'What is an output device?' ,marks:'3 mark' , givenAnswer:[]},
    { id: 'Q4ai', text: 'Explain Information Processing System.',marks:'5 marks' , givenAnswer:[] },
    { id: 'Q4bi', text: 'What is a storage device?' ,marks:'2 marks' , givenAnswer:[]},
    { id: 'Q4bii', text: 'What is a processing device?',marks:'2 marks' , givenAnswer:[] },
    { id: 'Q4biii', text: 'Briefly explain the computer CPU.' ,marks:'2 marks' , givenAnswer:[]},
    { id: 'Q4c', text: 'Give 2 examples of processor manufacturing companies.' ,marks:'4 marks' , givenAnswer:[]}
  ];

  getQuestionsGroupedByPrefix(): { [key: string]: Question[] } {
    return this.questions.reduce((acc, question) => {
      const prefix = question.id.match(/^[A-Za-z]+[0-9]+/)[0];
      if (!acc[prefix]) {
        acc[prefix] = [];
      }
      acc[prefix].push(question);
      return acc;
    }, {});

    // givenAnswer:[] THIS HAS THE ANSWERS FROM THE STUDENTS
  }















  // ===============================================

  public loginStatusSubject = new Subject<boolean>();

  constructor(private http:HttpClient, private router: Router) { }


//get all Users

  public getAllUsers(){
    return this.http.get(`${baseUrl}/users`);
  }

  //get the current logged in user
  public getCurrentUser(){
    return this.http.get(`${baseUrl}/current-user`);
  }

  //Generate Token
  public generateToken(loginData: any){
    return this.http.post(`${baseUrl}/authenticate`, loginData);
  } 


  //Login User : save token in local storage
  public loginUser(token: any){
    localStorage.setItem("token", token);
    this.loginStatusSubject.next(true)
    return true;
  }
  //isLogin: user logged in or not
  public isLoggedIn(){
    let tokenStr = localStorage.getItem("token");
    if(tokenStr == undefined || tokenStr == ' ' || tokenStr ==null){
      return false;
    }
    else{
      return true;
    }
  }
 



  // get token
  public getToken(){
    return localStorage.getItem("token");
  }

  //Set userDetails
  public setUser(user:any){
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUser(){
    let userStr = localStorage.getItem("user");
    if (userStr != null ){
      return JSON.parse(userStr);
    }
    else{
      this.logout();
      return null;
    }
  }

  //get User Role
  public getUserRole(){
    let user = this.getUser();
    return user.authorities[0].authority;
  }


  // RESET PASSWORD

  public resetPassword(resetData:any){
    return this.http.put(`${baseUrl}/changePassword`, resetData);

  }


    //  TOKEN EXPIRATION
     isTokenExpired(): boolean {
      const token = this.getToken();
      if (!token) return true;
      const decoded: any = jwtDecode(token);
      const expirationDate = decoded.exp * 1000; // Convert to milliseconds
  console.log(expirationDate);
      return new Date() > new Date(expirationDate);
    }


  // Logout: remove  token from local storage
  public logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("exam");
    localStorage.removeItem("tokenExpiratioTime");
    // window.location.href="/login/";
    // this.router.navigate(["/login"]);
    // this.router.navigate(["user-dashboard"]);


    return true;
  }
 
}
