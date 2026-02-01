
// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import baseUrl from './helper';
// import { BehaviorSubject, Observable, tap } from 'rxjs';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class LoginService {
//   // Use BehaviorSubject to maintain current state
//   public loginStatusSubject = new BehaviorSubject<boolean>(this.isLoggedIn());

//   constructor(private http: HttpClient, private router: Router) {}

//   /**
//    * Get current authenticated user
//    * Interceptor handles withCredentials automatically
//    */
//   public getCurrentUser(): Observable<any> {
//     return this.http.get(`${baseUrl}/current-user`);
//   }

//   /**
//    * Authenticate user and get cookie set by backend
//    */
//   public generateToken(loginData: any): Observable<any> {
//     return this.http.post(`${baseUrl}/authenticate`, loginData).pipe(
//       tap((response: any) => {
//         // Cookie is automatically set by browser from backend response
//         console.log('Authentication successful');
//       })
//     );
//   }

//   /**
//    * Get all users
//    */
//   public getAllUsers(): Observable<any> {
//     return this.http.get(`${baseUrl}/users`);
//   }


//   //   logout(): Observable<any> {
// //     console.log(`${baseUrl}/logout`)
// //     return this.http.post(`${baseUrl}/logout`, {}, {
// //       withCredentials: true  // ⭐ Important: sends cookies to backend
// //     });
// //   }

//   /**
//    * Login user - store user details in localStorage
//    * Note: We don't store token anymore since it's in HttpOnly cookie
//    */
//   public loginUser(user: any): boolean {
//     this.setUser(user);
//     this.loginStatusSubject.next(true);
//     return true;
//   }

//   /**
//    * Set user details in localStorage
//    */
//   public setUser(user: any): void {
//     localStorage.setItem('user', JSON.stringify(user));
//   }

//   /**
//    * Get user details from localStorage
//    */
//   public getUser(): any {
//     let userStr = localStorage.getItem("user");
//     if (userStr != null) {
//       return JSON.parse(userStr);
//     }
//     return null;
//   }

//   /**
//    * Get user role from stored user object
//    */
//   public getUserRole(): string | null {
//     let user = this.getUser();
//     if (user && user.authorities && user.authorities.length > 0) {
//       return user.authorities[0].authority;
//     }
//     return null;
//   }

//   /**
//    * Logout user - call backend to clear cookie and clear local storage
//    */
//   public logout(): void {
//     this.http.post(`${baseUrl}/logout`, {}).subscribe({
//       next: () => {
//         console.log('Logout successful');
//         this.clearLocalSession();
//         this.loginStatusSubject.next(false);
//         this.router.navigate(['/login']);
//       },
//       error: (error) => {
//         console.error('Logout error:', error);
//         this.clearLocalSession();
//         this.loginStatusSubject.next(false);
//         this.router.navigate(['/login']);
//       }
//     });
//   }


//    public clearLocalSession(): void {
//     localStorage.removeItem("user");
//     localStorage.removeItem("exam");
//     sessionStorage.clear();
//   }

//   public isLoggedIn(): boolean {
//     return !!localStorage.getItem('user');
//   }

//   /**
//    * Clear all local storage data
//    */

//   /**
//    * Check if user is logged in
//    * User is logged in if user object exists in localStorage
//    */
 

//   /**
//    * Request password reset link
//    */
//   public requestPasswordResetLink(email: string): Observable<any> {
//     return this.http.post(`${baseUrl}/forgotten-password`, { email });
//   }

//   /**
//    * Reset password with token
//    */
//   public resetPassword(token: string, newPassword: string): Observable<any> {
//     return this.http.post(`${baseUrl}/reset-password`, { 
//       token, 
//       newPassword 
//     });
//   }
// }



import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

// ===========================
// INTERFACES
// ===========================
interface AuthResponse {
  token: string;
  refresh_token?: string;
  token_type: string;
  message?: string;
  email?: string;
  role?: string;
  userId?: number;
  expires_in?: number;
}

interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  
  // ===========================
  // CONSTANTS
  // ===========================
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';
  private readonly EXAM_KEY = 'exam';

  // ===========================
  // STATE MANAGEMENT
  // ===========================
  // Use BehaviorSubject to maintain current login state
  public loginStatusSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loginStatus$ = this.loginStatusSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router
  ) {
    // Initialize login status on service creation
    this.loginStatusSubject.next(this.isLoggedIn());
  }

  // ===========================
  // AUTHENTICATION
  // ===========================

  /**
   * Authenticate user and store token in localStorage
   * @param loginData - { email: string, password: string }
   */
  
  public generateToken(loginData: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 Attempting authentication...');

    console.log(loginData);
    
    return this.http.post<AuthResponse>(`${baseUrl}/authenticate`, loginData).pipe(
      tap((response: AuthResponse) => {
        console.log('✅ Authentication successful');
        
        // Store tokens in localStorage
        this.storeAuthTokens(response);
        
        console.log(response)
        // Update login status
        this.loginStatusSubject.next(true);
      }),
      catchError((error) => {
        console.error('❌ Authentication failed:', error);
        this.clearAllData();
        this.loginStatusSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current authenticated user from backend
   */
  public getCurrentUser(): Observable<any> {
    return this.http.get(`${baseUrl}/current-user`).pipe(
      tap((user) => {
        console.log('✅ Current user fetched:', user);
        // Optionally update stored user data
        this.setUser(user);
      }),
      catchError((error) => {
        console.error('❌ Failed to fetch current user:', error);
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  // ===========================
  // TOKEN MANAGEMENT
  // ===========================

  /**
   * Store authentication tokens in localStorage
   */
  private storeAuthTokens(response: AuthResponse): void {
    // Store access token
    if (response.token) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, response.token);
      console.log('✅ Access token stored');
    }

    // Store refresh token if provided
    if (response.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
      console.log('✅ Refresh token stored');
    }

    // Store user info if provided
    if (response.email || response.role) {
      const userInfo = {
        email: response.email,
        role: response.role,
        userId: response.userId
      };
      this.setUser(userInfo);
    }
  }

  /**
   * Get access token from localStorage
   */
  public getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   */
  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if token exists
   */
  public hasToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Refresh access token using refresh token
   */
  public refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      console.error('❌ No refresh token available');
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('🔄 Refreshing token...');

    return this.http.post<AuthResponse>(`${baseUrl}/refresh`, {}, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    }).pipe(
      tap((response: AuthResponse) => {
        console.log('✅ Token refreshed successfully');
        // Update only the access token
        if (response.token) {
          localStorage.setItem(this.ACCESS_TOKEN_KEY, response.token);
        }
      }),
      catchError((error) => {
        console.error('❌ Token refresh failed:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Validate current token
   */
  public validateToken(): Observable<boolean> {
    const token = this.getAccessToken();
    
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    return this.http.get<boolean>(`${baseUrl}/validate`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      catchError((error) => {
        console.error('❌ Token validation failed:', error);
        this.clearAllData();
        return throwError(() => error);
      })
    );
  }

  // ===========================
  // USER MANAGEMENT
  // ===========================

  /**
   * Login user - store user details and update state
   */
  public loginUser(user: any): boolean {
    this.setUser(user);
    this.loginStatusSubject.next(true);
    console.log('✅ User logged in:', user.email || user.username);
    return true;
  }

  /**
   * Set user details in localStorage
   */
  public setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user details from localStorage
   */
  public getUser(): any {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Get user role from stored user object
   */
  public getUserRole(): string | null {
    const user = this.getUser();
    
    // Handle different user object structures
    if (user) {
      // Check if role is directly on user object
      if (user.role) {
        return user.role;
      }
      // Check if role is in authorities array (Spring Security format)
      if (user.authorities && user.authorities.length > 0) {
        return user.authorities[0].authority;
      }
    }
    
    return null;
  }

  /**
   * Get all users (admin only)
   */
  public getAllUsers(): Observable<any> {
    return this.http.get(`${baseUrl}/users`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch users:', error);
        return throwError(() => error);
      })
    );
  }

  // ===========================
  // LOGOUT
  // ===========================

  /**
   * Logout user - call backend and clear all local data
   */
  public logout(): void {
    console.log('🚪 Logging out...');

    const token = this.getAccessToken();
    
    if (token) {
      // Call backend logout endpoint with token
      this.http.post(`${baseUrl}/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).subscribe({
        next: () => {
          console.log('✅ Backend logout successful');
          this.performLogout();
        },
        error: (error) => {
          console.error('⚠️ Backend logout failed, clearing local data anyway:', error);
          this.performLogout();
        }
      });
    } else {
      // No token, just clear local data
      this.performLogout();
    }
  }

  /**
   * Perform logout - clear data and redirect
   */
  private performLogout(): void {
    this.clearAllData();
    this.loginStatusSubject.next(false);
    this.router.navigate(['/login']);
    console.log('✅ Logout complete');
  }

  /**
   * Clear all authentication and user data
   */
  public clearAllData(): void {
    // Clear tokens
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    
    // Clear user data
    this.clearLocalSession();
    
    console.log('🗑️ All local data cleared');
  }

  /**
   * Clear user session data
   */
  public clearLocalSession(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXAM_KEY);
    sessionStorage.clear();
  }

  // ===========================
  // AUTHENTICATION STATE
  // ===========================

  /**
   * Check if user is logged in
   * User is logged in if both token and user data exist
   */
  public isLoggedIn(): boolean {
    return this.hasToken() && !!this.getUser();
  }

  /**
   * Check if user is authenticated (same as isLoggedIn)
   */
  public isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // ===========================
  // PASSWORD RESET
  // ===========================

  /**
   * Request password reset link
   */

  
  public requestPasswordResetLink(email: string): Observable<any> {
    console.log('📧 Requesting password reset for:', email);
    
    return this.http.post(`${baseUrl}/forgotten-password`, { email }).pipe(
      tap(() => {
        console.log('✅ Password reset email sent');
      }),
      catchError((error) => {
        console.error('❌ Password reset request failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Reset password with token
   */
  public resetPassword(token: string, newPassword: string): Observable<any> {
    console.log('🔒 Resetting password...');
    
    return this.http.post(`${baseUrl}/reset-password`, { 
      token, 
      newPassword 
    }).pipe(
      tap(() => {
        console.log('✅ Password reset successful');
      }),
      catchError((error) => {
        console.error('❌ Password reset failed:', error);
        return throwError(() => error);
      })
    );
  }

  // ===========================
  // UTILITY METHODS
  // ===========================

  /**
   * Get user email
   */
  public getUserEmail(): string | null {
    const user = this.getUser();
    return user?.email || null;
  }

  /**
   * Get user ID
   */
  public getUserId(): number | null {
    const user = this.getUser();
    return user?.userId || user?.id || null;
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user is admin
   */
  public isAdmin(): boolean {
    return this.hasRole('ADMIN') || this.hasRole('ADMIN');
  }

  /**
   * Check if user is regular user
   */
  public isStudent(): boolean {
    return this.hasRole('NORMAL') || this.hasRole('NORMAL');
  }

    public isLecturer(): boolean {
    return this.hasRole('LECTURER') || this.hasRole('LECTURER');
  }
}