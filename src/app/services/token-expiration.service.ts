import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { takeWhile, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenExpirationService {

  constructor() { }



  private expirationSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  expiration$: Observable<number> = this.expirationSubject.asObservable();

  startCountdown(expirationInSeconds: number): void {
    const expirationTime = new Date().getTime() + expirationInSeconds * 1000;
    // localStorage.setItem('tokenExpirationTime', expirationTime.toString());
    timer(0, 1000)
      .pipe(
        map(() => Math.max(0, Math.floor((expirationTime - new Date().getTime()) / 1000))),
        takeWhile(seconds => seconds > 0)
      )
      .subscribe(seconds => {
        this.expirationSubject.next(seconds);
      });
  }

  // ====================NEW TOKEN EXPIRATION CODE==========================

  getTokenFromLocalStorage(): string | null {
    return localStorage.getItem('token');
  }
  // Function to decode the JWT token
  parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  // Function to calculate the time left before expiration
  getTimeLeft(token: string): number {
    const decodedToken = this.parseJwt(token);
    const exp = decodedToken.exp;
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return exp - currentTime; // Time left in seconds
  }

   // Function to check whether the token has expired
   isTokenExpired(token: string): boolean {
    const timeLeft = this.getTimeLeft(token);
    return timeLeft <= 0;
  }







}
