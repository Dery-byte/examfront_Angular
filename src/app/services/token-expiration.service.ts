import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, takeWhile, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import baseUrl from './helper';

// Interface representing token info from backend
interface TokenInfo {
  exp: number; // expiration timestamp in seconds
}

@Injectable({
  providedIn: 'root'
})
export class TokenExpirationService {

  private expirationSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  expiration$: Observable<number> = this.expirationSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Fetch token info from backend
   * Backend should read HTTP-only cookie and return token expiration
   */
fetchTokenInfo(): Observable<TokenInfo> {
    console.log('🔍 Calling URL:', `${baseUrl}/token-info`); // ADD THIS
  return this.http.get<TokenInfo>(`${baseUrl}/token-info`, {
    withCredentials: true // ⭐ CRITICAL - sends cookies
  }).pipe(
    map(response => {
      console.log('Raw backend response:', response);
      return response;
    })
  );
}
  /**
   * Start the countdown based on token expiration info from backend
   */

  startCountdownFromBackend(): void {
  this.fetchTokenInfo()
    .pipe(
      switchMap(tokenInfo => {
        const currentTime = Math.floor(Date.now() / 1000);
        const expirationInSeconds = tokenInfo.exp - currentTime;

        // Log expiration info to console
        console.log('Token expiration timestamp:', tokenInfo.exp);
        console.log('Current timestamp:', currentTime);
        console.log('Time until expiration (seconds):', expirationInSeconds);
        console.log('Expiration date:', new Date(tokenInfo.exp * 1000));

        if (expirationInSeconds <= 0) {
          console.log('Token already expired');
          this.expirationSubject.next(0);
          return [];
        }

        const expirationTime = Date.now() + expirationInSeconds * 1000;

        return timer(0, 1000).pipe(
          map(() => {
            const remaining = Math.max(0, Math.floor((expirationTime - Date.now()) / 1000));
            console.log('Seconds remaining:', remaining); // Optional: log every second
            return remaining;
          }),
          takeWhile(seconds => seconds >= 0, true) // inclusive: true to emit final 0
        );
      })
    )
    .subscribe({
      next: seconds => {
        this.expirationSubject.next(seconds);
        if (seconds === 0) {
          console.log('Token has expired!');
          // Optionally trigger logout or token refresh here
        }
      },
      error: err => {
        console.error('Error fetching token info:', err);
        this.expirationSubject.next(0);
      },
      complete: () => console.log('Countdown completed')
    });
}

  /**
   * Optional helper to check if token is expired
   * @param exp Expiration timestamp in seconds
   */
  isTokenExpired(exp: number): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return exp <= currentTime;
  }
}
