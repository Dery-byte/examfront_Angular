import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-result-summary',
  templateUrl: './result-summary.component.html',
  styleUrls: ['./result-summary.component.css']
})
export class ResultSummaryComponent {



  constructor(private ref: MatDialogRef<ResultSummaryComponent>){

  }


  closepoup() {
    this.ref.close();
  }

  printPage(){
    document.title= "Results";
    window.print();
    // this.removeResults();
    // this.preventBackButton();
  }
}
