// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS, HttpResponse } from "@angular/common/http";
// import { Observable, catchError, throwError } from 'rxjs';
// import { Injectable } from '@angular/core';
// import { LoginService } from "./login.service";
// import { error } from "jquery";


// // const TOKEN_HEADER = 'Authorization';

// @Injectable() 
// export class AuthInterceptor implements HttpInterceptor
// {

//     constructor(private login: LoginService){}
//     intercept(req:HttpRequest<any>, next: HttpHandler):Observable<HttpEvent<any>>{


//         // add the jwt token (LocalStorage)
//         let authReq = req;
// // const token = this.login.getToken();
// // console.log("Insider interceptor");
// // if(token!=null){
// // authReq = authReq.clone({setHeaders:{ Authorization: `Bearer ${token}` }, });
// // }
// // else if(token && this.login.isTokenExpired()){
// //     this.login.logout();
// // }


// ///Log user out on token expiration start
// // if(this.login.isTokenExpired()){
// //     this.login.logout();
// //     return throwError("Token Expired");
// // ///Log user out on token expiration end
// // }

// return next.handle(authReq)

//     }




    




// }
// export const authInterceptorProviders = [
//     {
//      provide : HTTP_INTERCEPTORS,
//      useClass: AuthInterceptor,
//      multi:true,
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
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        // Clone the request and add withCredentials for cookie-based auth
        const authReq = req.clone({
            withCredentials: true  // This ensures cookies are sent with every request
        });

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                
                // Handle 401 Unauthorized errors
                if (error.status === 401) {
                    console.error('Unauthorized request - logging out');
                    this.login.logout();
                    this.router.navigate(['/login']);
                }

                // Handle 403 Forbidden errors
                if (error.status === 403) {
                    console.error('Forbidden - insufficient permissions');
                }

                // Handle network errors
                if (error.status === 0) {
                    console.error('Network error - unable to reach server');
                }

                // Re-throw the error so components can handle it
                return throwError(() => error);
            })
        );
    }
}

export const authInterceptorProviders = [
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
    }
];