// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import baseUrl from './helper';
// import { Subject } from 'rxjs';
// // import jwt_decode from 'jwt-decode';
// import { Router } from '@angular/router';

// import { jwtDecode } from 'jwt-decode';
// import { Question } from 'src/model testing/model';
// import { Observable } from 'rxjs';


// @Injectable({
//   providedIn: 'root'
// })
// export class LoginService {
//   public loginStatusSubject = new Subject<boolean>();

//   constructor(private http:HttpClient, private router: Router) { }

// //   public getCurrentUser() {
// //   return this.http.get(`${baseUrl}/current-user`, { 
// //     withCredentials: true 
// //   });
// // }


// //   public getCurrentUser() {
// //   return this.http.get(`${baseUrl}/current-user`, { 
// //     withCredentials: true 
// //   });
// // }


// public getCurrentUser() {
//     // No need to specify withCredentials here - the interceptor handles it
//     return this.http.get(`${baseUrl}/current-user`);
// }


// public generateToken(loginData: any) {
//   return this.http.post(`${baseUrl}/authenticate`, loginData, { 
//     withCredentials: true 
//   });
// }

// public getAllUsers() {
//   return this.http.get(`${baseUrl}/users`, { 
//     withCredentials: true 
//   });
// }


//   //Login User : save token in local storage
//   public loginUser(token: any){
//     localStorage.setItem("token", token);
//     this.loginStatusSubject.next(true)
//     return true;
//   }

//   // get token
//   // public getToken(){
//   //   return localStorage.getItem("token");
//   // }

//   //Set userDetails
//   public setUser(user:any){
//     localStorage.setItem('user', JSON.stringify(user));
//   }

//   public getUser(){
//     let userStr = localStorage.getItem("user");
//     if (userStr != null ){
//       return JSON.parse(userStr);
//     }
//     else{
//       this.logout();
//       return null;
//     }
//   }

//   //get User Role
//   public getUserRole(){
//     let user = this.getUser();
//     return user.authorities[0].authority;
//   }





//     //  TOKEN EXPIRATION
//   //    isTokenExpired(): boolean {
//   //     const token = this.getToken();
//   //     if (!token) return true;
//   //     const decoded: any = jwtDecode(token);
//   //     const expirationDate = decoded.exp * 1000; // Convert to milliseconds
//   // console.log(expirationDate);
//   //     return new Date() > new Date(expirationDate);
//   //   }



  
//   logout(): Observable<any> {
//     console.log(`${baseUrl}/logout`)
//     return this.http.post(`${baseUrl}/logout`, {}, {
//       withCredentials: true  // ⭐ Important: sends cookies to backend
//     });
//   }




//   // // Logout: remove  token from local storage
//   public clearLocalSession(){
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     localStorage.removeItem("exam");
//     localStorage.removeItem("tokenExpiratioTime");
//     // window.location.href="/login/";
//     // this.router.navigate(["/login"]);
//     // this.router.navigate(["user-dashboard"])
//     sessionStorage.clear()
//     return true;
//   }
 
//    /**
//    * Check if user is logged in
//    */
//   isLoggedIn(): boolean {
//     // Your logic to check if user is logged in
//     return !!localStorage.getItem('user');
//   }


//   // SENT PASSWORD RESET link
// resetPassword(token: string, newPassword: string): Observable<any> {
//   return this.http.post(`${baseUrl}/reset-password`, { token, newPassword,
//             withCredentials:true

//    });
// }


//   // RESET PASSWORD

//   // public resetPassword(resetData:any){
//   //   return this.http.put(`${baseUrl}/changePassword`, resetData);
//   // }

//   requestPasswordResetLink(email: any): Observable<any> {
//   return this.http.post(`${baseUrl}/forgotten-password`, { email });
// }



// }


































import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // Use BehaviorSubject to maintain current state
  public loginStatusSubject = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Get current authenticated user
   * Interceptor handles withCredentials automatically
   */
  public getCurrentUser(): Observable<any> {
    return this.http.get(`${baseUrl}/current-user`);
  }

  /**
   * Authenticate user and get cookie set by backend
   */
  public generateToken(loginData: any): Observable<any> {
    return this.http.post(`${baseUrl}/authenticate`, loginData).pipe(
      tap((response: any) => {
        // Cookie is automatically set by browser from backend response
        console.log('Authentication successful');
      })
    );
  }

  /**
   * Get all users
   */
  public getAllUsers(): Observable<any> {
    return this.http.get(`${baseUrl}/users`);
  }


  //   logout(): Observable<any> {
//     console.log(`${baseUrl}/logout`)
//     return this.http.post(`${baseUrl}/logout`, {}, {
//       withCredentials: true  // ⭐ Important: sends cookies to backend
//     });
//   }

  /**
   * Login user - store user details in localStorage
   * Note: We don't store token anymore since it's in HttpOnly cookie
   */
  public loginUser(user: any): boolean {
    this.setUser(user);
    this.loginStatusSubject.next(true);
    return true;
  }

  /**
   * Set user details in localStorage
   */
  public setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Get user details from localStorage
   */
  public getUser(): any {
    let userStr = localStorage.getItem("user");
    if (userStr != null) {
      return JSON.parse(userStr);
    }
    return null;
  }

  /**
   * Get user role from stored user object
   */
  public getUserRole(): string | null {
    let user = this.getUser();
    if (user && user.authorities && user.authorities.length > 0) {
      return user.authorities[0].authority;
    }
    return null;
  }

  /**
   * Logout user - call backend to clear cookie and clear local storage
   */
  public logout(): void {
    this.http.post(`${baseUrl}/logout`, {}).subscribe({
      next: () => {
        console.log('Logout successful');
        this.clearLocalSession();
        this.loginStatusSubject.next(false);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.clearLocalSession();
        this.loginStatusSubject.next(false);
        this.router.navigate(['/login']);
      }
    });
  }


   public clearLocalSession(): void {
    localStorage.removeItem("user");
    localStorage.removeItem("exam");
    sessionStorage.clear();
  }

  public isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  /**
   * Clear all local storage data
   */

  /**
   * Check if user is logged in
   * User is logged in if user object exists in localStorage
   */
 

  /**
   * Request password reset link
   */
  public requestPasswordResetLink(email: string): Observable<any> {
    return this.http.post(`${baseUrl}/forgotten-password`, { email });
  }

  /**
   * Reset password with token
   */
  public resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${baseUrl}/reset-password`, { 
      token, 
      newPassword 
    });
  }
}
