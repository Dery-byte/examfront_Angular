




// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse } from "@angular/common/http";
// import { Observable, catchError, throwError } from 'rxjs';
// import { Injectable } from '@angular/core';
// import { LoginService } from "./login.service";
// import { Router } from '@angular/router';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//     constructor(
//         private login: LoginService,
//         private router: Router
//     ) { }

//     intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         const token = localStorage.getItem('access_token'); // or sessionStorage

//         // Clone the request and add withCredentials for cookie-based auth
//         const authReq = req.clone({
//             setHeaders: {
//                 Authorization: `Bearer ${token}`
//             }
//         });

//         return next.handle(authReq).pipe(
//             catchError((error: HttpErrorResponse) => {

//                 // Handle 401 Unauthorized errors
//                 if (error.status === 401) {
//                     console.error('Unauthorized request - logging out');
//                     this.login.logout();
//                     this.router.navigate(['/login']);
//                 }

//                 // Handle 403 Forbidden errors
//                 if (error.status === 403) {
//                     console.error('Forbidden - insufficient permissions');
//                 }

//                 // Handle network errors
//                 if (error.status === 0) {
//                     console.error('Network error - unable to reach server');
//                 }

//                 // Re-throw the error so components can handle it
//                 return throwError(() => error);
//             })
//         );
//     }
// }

// export const authInterceptorProviders = [
//     {
//         provide: HTTP_INTERCEPTORS,
//         useClass: AuthInterceptor,
//         multi: true,
//     }
// ];









import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse } from "@angular/common/http";
import { Observable, catchError, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { LoginService } from "./login.service";
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private login: LoginService,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        // ✅ Define public endpoints that don't need authentication
        const publicEndpoints = [
            '/authenticate',
            '/register',
            '/register/lecturer',
            '/register/admin',
            '/forgotten-password',
            '/reset-password'
        ];

        // ✅ Check if this is a public endpoint
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
            req.url.includes(endpoint)
        );

        // ✅ For public endpoints, send request without Authorization header
        if (isPublicEndpoint) {
            console.log('🔓 Public endpoint - no auth header:', req.url);
            return next.handle(req).pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
        }

        // ✅ For protected endpoints, add Authorization header
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.warn('⚠️ No token found for protected endpoint:', req.url);
            // Don't block the request, let backend return 401
        }

        // Clone request and add Authorization header
        const authReq = token 
            ? req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
              })
            : req;

        console.log('🔐 Request to:', req.url, token ? 'with token' : 'without token');

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => this.handleError(error))
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('❌ HTTP Error:', {
            status: error.status,
            url: error.url,
            message: error.message,
            error: error.error
        });

        // Handle 401 Unauthorized - token expired or invalid
        if (error.status === 401) {
            console.error('❌ Unauthorized - logging out');
            this.login.logout();
            this.router.navigate(['/login']);
        }

        // Handle 403 Forbidden - insufficient permissions
        if (error.status === 403) {
            console.error('❌ Forbidden - access denied');
        }

        // Handle network/connection errors
        if (error.status === 0) {
            console.error('❌ Network error - server unreachable');
        }

        return throwError(() => error);
    }
}

export const authInterceptorProviders = [
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
    }
];