
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { tap, catchError } from 'rxjs/operators';

// import baseUrl from './helper';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   constructor(private http: HttpClient) {}

//   /**
//    * Request password reset code via phone number
//    * @param phone - User's phone number
//    * @returns Observable with API response
//    */
//   public requestPasswordResetCode(phone: string): Observable<any> {
//     console.log('📱 Requesting password reset for phone:', phone);
    
//     return this.http.post(`${baseUrl}/sms/send`, { phone }).pipe(
//       tap((response) => {
//         console.log('✅ Password reset code sent via SMS', response);
//       }),
//       catchError((error) => {
//         console.error('❌ Password reset request failed:', error);
//         return throwError(() => error);
//       })
//     );
//   }



//    public requestPasswordReset(
//     identifier: string, 
//     type: 'email' | 'phone' = 'phone'
//   ): Observable<any> {
//     console.log(`📧📱 Requesting password reset for ${type}:`, identifier);
    
//     const payload = type === 'email' 
//       ? { email: identifier } 
//       : { phone: identifier };
    
//     return this.http.post(`${baseUrl}/sms/send`, payload).pipe(
//       tap((response) => {
//         const method = type === 'email' ? 'email' : 'SMS';
//         console.log(`✅ Reset ${type === 'email' ? 'link' : 'code'} sent via ${method}`, response);
//       }),
//       catchError((error) => {
//         console.error('❌ Password reset request failed:', error);
//         return throwError(() => error);
//       })
//     );
//   }

// }






// ============================================
// AUTH SERVICE (auth.service.ts)
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  /**
   * Request password reset code via phone number
   * The message will be generated and sent by the backend
   * @param phone - User's phone number
   * @returns Observable with API response
   */
  public requestPasswordResetCode(phone: string): Observable<any> {
    console.log('📱 Requesting password reset for phone:', phone);
    
    // Backend expects recipient as an array and generates the message
    const payload = {
      recipient: [phone]
    };
    
    return this.http.post(`${baseUrl}/forgotten-password/send/link`, payload).pipe(
      tap((response) => {
        console.log('✅ Password reset code sent via SMS', response);
      }),
      catchError((error) => {
        console.error('❌ Password reset request failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Request password reset for multiple phone numbers (batch)
   * @param phones - Array of phone numbers
   * @returns Observable with API response
   */
  public requestPasswordResetCodeBatch(phones: string[]): Observable<any> {
    console.log('📱 Requesting password reset for multiple phones:', phones);
    
    const payload = {
      recipient: phones
    };
    
    return this.http.post(`${baseUrl}/sms/send`, payload).pipe(
      tap((response) => {
        console.log('✅ Password reset codes sent to all recipients', response);
      }),
      catchError((error) => {
        console.error('❌ Batch password reset request failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verify reset code and update password
   * @param phone - User's phone number
   * @param token - Verification code received via SMS
   * @param newPassword - New password
   * @returns Observable with API response
   */

  public verifyResetCodeAndUpdatePassword(
    // phone: string, 
    token: string, 
    newPassword: string
  ): Observable<any> {
    console.log('🔐 Verifying reset code and updating password');
    
    return this.http.post(`${baseUrl}/reset-password-with-token`, { 
      // recipient: [phone],
      token, 
      newPassword 
    }).pipe(
      tap((response) => {
        console.log('✅ Password updated successfully', response);
      }),
      catchError((error) => {
        console.error('❌ Password reset verification failed:', error);
        return throwError(() => error);
      })
    );
  }
}