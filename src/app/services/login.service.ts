import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public loginStatusSubject = new Subject<boolean>();

  constructor(private http:HttpClient) { }

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
 

  // Logout: remove  token from local storage
  public logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("exam");

    return true;
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
}
