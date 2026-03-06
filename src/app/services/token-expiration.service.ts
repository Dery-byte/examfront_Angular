
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { map, takeWhile, switchMap, filter } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
   * ✅ REFACTORED: Get token from localStorage/sessionStorage
   */
  private getToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  /**
   * ✅ REFACTORED: Fetch token info from backend with Authorization header
   * Backend reads JWT from Authorization header and returns token expiration
   */








  fetchTokenInfo(): Observable<TokenInfo> {
    const token = this.getToken();
    if (!token) {
      console.error('❌ No token found in storage');
      throw new Error('No authentication token available');
    }
    // ✅ Add Authorization header with Bearer token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('🔍 Calling URL:', `${baseUrl}/token-info`);
    console.log('🔑 Token present:', token.substring(0, 20) + '...');
    return this.http.get<TokenInfo>(`${baseUrl}/token-info`, { headers }).pipe(
      map(response => {
        console.log('✅ Raw backend response:', response);
        return response;
      })
    );
  }

  /**
   * Start the countdown based on token expiration info from backend
   */





  // startCountdownFromBackend(): void {
  //   // ✅ Check if token exists before starting countdown
  //   if (!this.getToken()) {
  //     console.error('❌ Cannot start countdown: No token available');
  //     this.expirationSubject.next(0);
  //     return;
  //   }


  //   // ✅ FIX: Stop any existing countdown before starting a new one
  //   this.stopCountdown();


  //   this.countdownSubscription = this.fetchTokenInfo()
  //     .pipe(
  //       switchMap(tokenInfo => {
  //         const currentTime = Math.floor(Date.now() / 1000);
  //         const expirationInSeconds = tokenInfo.exp - currentTime;

  //         // Log expiration info to console
  //         console.log('⏱️ Token expiration timestamp:', tokenInfo.exp);
  //         console.log('🕐 Current timestamp:', currentTime);
  //         console.log('⏳ Time until expiration (seconds):', expirationInSeconds);
  //         console.log('📅 Expiration date:', new Date(tokenInfo.exp * 1000));

  //         if (expirationInSeconds <= 0) {
  //           console.log('❌ Token already expired');
  //           this.expirationSubject.next(0);
  //           return [];
  //         }

  //         const expirationTime = Date.now() + expirationInSeconds * 1000;

  //         return timer(0, 1000).pipe(
  //           map(() => {
  //             const remaining = Math.max(0, Math.floor((expirationTime - Date.now()) / 1000));
  //             if (remaining % 60 === 0 || remaining <= 10) {
  //               console.log('⏱️ Seconds remaining:', remaining);
  //             }
  //             return remaining;
  //           }),
  //           takeWhile(seconds => seconds >= 0, true) // inclusive: true to emit final 0
  //         );
  //       })
  //     )
  //     .subscribe({
  //       next: seconds => {
  //         this.expirationSubject.next(seconds);
  //         if (seconds === 0) {
  //           console.log('🚨 Token has expired!');
  //           this.handleTokenExpiration();
  //         }
  //       },
  //       error: err => {
  //         console.error('❌ Error fetching token info:', err);
  //         this.expirationSubject.next(0);
  //         // Optionally handle error (e.g., logout user)
  //       },
  //       complete: () => {
  //         console.log('✅ Countdown completed');
  //         this.countdownSubscription = null;
  //       }
  //     });
  // }





  startCountdownFromLocal(): void {
  const token = localStorage.getItem('access_token')
  if (!token) {
    console.error('❌ Cannot start countdown: No token available');
    console.log(token);
    this.expirationSubject.next(0);
    return;
  }
  // Stop existing countdown
  this.stopCountdown();
  try {
    // ✅ Decode JWT locally
    const payload = JSON.parse(atob(token.split('.')[1]));
    const tokenExp = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationInSeconds = tokenExp - currentTime;
    console.log('⏱️ Token expiration timestamp:', tokenExp);
    console.log('🕐 Current timestamp:', currentTime);
    console.log('⏳ Time until expiration (seconds):', expirationInSeconds);
    console.log('📅 Expiration date:', new Date(tokenExp * 1000));
    if (expirationInSeconds <= 0) {
      console.log('❌ Token already expired');
      this.expirationSubject.next(0);
      this.handleTokenExpiration();
      return;
    }
    const expirationTime = Date.now() + expirationInSeconds * 1000;
    this.countdownSubscription = timer(0, 1000).pipe(
      map(() => {
        const remaining = Math.max(0, Math.floor((expirationTime - Date.now()) / 1000));
        if (remaining % 60 === 0 || remaining <= 10) {
          console.log('⏱️ Seconds remaining:', remaining);
        }
        return remaining;
      }),
      takeWhile(seconds => seconds >= 0, true)
    )
    .subscribe({
      next: seconds => {
        this.expirationSubject.next(seconds);
        if (seconds === 0) {
          console.log('🚨 Token has expired!');
          this.handleTokenExpiration();
        }
      },
      complete: () => {
        console.log('✅ Countdown completed');
        this.countdownSubscription = null;
      }
    });
  } catch (error) {
    console.error('❌ Invalid token format', error);
    this.expirationSubject.next(0);
  }
}





  /**
   * ✅ NEW: Handle token expiration (logout, clear storage, redirect, etc.)
   */
  private handleTokenExpiration(): void {
    // Clear token from storage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Optionally trigger logout or redirect to login
    // You can inject Router and navigate or emit an event
    console.log('🔓 Token expired - clearing storage');
  }

  /**
   * ✅ Stop the current countdown and reset state
   */
  stopCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
    // Reset to null instead of 0 to indicate "no active countdown"
    this.expirationSubject.next(null);
    console.log('⏸️ Countdown stopped and reset');
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
   * ✅ Get current countdown value (useful for debugging)
   */
  getCurrentCountdown(): number | null {
    return this.expirationSubject.value;
  }

  /**
   * ✅ NEW: Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}