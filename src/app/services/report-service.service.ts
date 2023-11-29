import { Injectable, OnInit } from '@angular/core';
import baseUrl from './helper';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class ReportServiceService {
  constructor( private _http:HttpClient ) { }

public loadResultsSummary(rId){
  return this._http.get(`${baseUrl}/getReport/${rId}`);
}


public loadReportSummary(){
  return this._http.get(`${baseUrl}/getReport`);
}

//get Report by userId and QuizId
public getReport(uId,qId){
  return this._http.get(`${baseUrl}/getReportByUidAndQid/${uId}/${qId}`);
}

//get Report by  QuizId
public getReportByQuizId(qId){
  return this._http.get(`${baseUrl}/getReports/${qId}`);
}


}
