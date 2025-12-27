import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { map, takeWhile, switchMap, filter } from 'rxjs/operators';
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

  // ✅ FIX: Use null instead of 0 as initial value to distinguish from expired state
  private expirationSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  
  // ✅ FIX: Filter out null values so subscribers only get valid numbers
  expiration$: Observable<number> = this.expirationSubject.asObservable().pipe(
    filter((seconds): seconds is number => seconds !== null)
  );

  private countdownSubscription: Subscription | null = null;

  constructor(private http: HttpClient) { }

  /**
   * Fetch token info from backend
   * Backend should read HTTP-only cookie and return token expiration
   */
  fetchTokenInfo(): Observable<TokenInfo> {
    console.log('🔍 Calling URL:', `${baseUrl}/token-info`);
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
    // ✅ FIX: Stop any existing countdown before starting a new one
    this.stopCountdown();

    this.countdownSubscription = this.fetchTokenInfo()
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
              console.log('Seconds remaining:', remaining);
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
        complete: () => {
          console.log('Countdown completed');
          this.countdownSubscription = null;
        }
      });
  }

  /**
   * ✅ NEW: Stop the current countdown and reset state
   */
  stopCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
    // Reset to null instead of 0 to indicate "no active countdown"
    this.expirationSubject.next(null);
    console.log('Countdown stopped and reset');
  }

  /**
   * Optional helper to check if token is expired
   * @param exp Expiration timestamp in seconds
   */
  isTokenExpired(exp: number): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return exp <= currentTime;
  }

  /**
   * ✅ NEW: Get current countdown value (useful for debugging)
   */
  getCurrentCountdown(): number | null {
    return this.expirationSubject.value;
  }
}