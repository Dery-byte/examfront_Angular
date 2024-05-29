import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS, HttpResponse } from "@angular/common/http";
import { Observable, catchError, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { LoginService } from "./login.service";
import { error } from "jquery";


// const TOKEN_HEADER = 'Authorization';

@Injectable() 
export class AuthInterceptor implements HttpInterceptor
{

    constructor(private login: LoginService){}
    intercept(req:HttpRequest<any>, next: HttpHandler):Observable<HttpEvent<any>>{


        // add the jwt token (LocalStorage)
        let authReq = req;
const token = this.login.getToken();
console.log("Insider interceptor");
if(token!=null){
authReq = authReq.clone({setHeaders:{ Authorization: `Bearer ${token}` }, });
}
else if(token && this.login.isTokenExpired()){
    this.login.logout();
}


///Log user out on token expiration start
// if(this.login.isTokenExpired()){
//     this.login.logout();
//     return throwError("Token Expired");
// ///Log user out on token expiration end
// }

return next.handle(authReq)

    }




    




}
export const authInterceptorProviders = [
    {
     provide : HTTP_INTERCEPTORS,
     useClass: AuthInterceptor,
     multi:true,
    }
];  