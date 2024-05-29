import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { Subject } from 'rxjs';
// import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';

import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

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
