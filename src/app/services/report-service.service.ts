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
}
