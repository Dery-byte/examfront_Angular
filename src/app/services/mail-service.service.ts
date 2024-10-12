import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';



@Injectable({
  providedIn: 'root'
})
export class MailServiceService {

  constructor(
    private httpClient : HttpClient
  ) { }



  public sendMail(mailData){
    return this.httpClient.post(`${baseUrl}/sendMail2`, mailData)
  }
}
