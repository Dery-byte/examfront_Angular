import { Component} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportServiceService } from 'src/app/services/report-service.service';


@Component({
  selector: 'app-result-summary',
  templateUrl: './result-summary.component.html',
  styleUrls: ['./result-summary.component.css']
})
export class ResultSummaryComponent {

  constructor(private ref: MatDialogRef<ResultSummaryComponent>, private _route: ActivatedRoute, private router: Router,
    private _report: ReportServiceService) { }


  qid
  summary: any;
  qId
  all
  reportQuizId
  userId
  currentQuizId
  currentUserId
  iSresultsSummary=false;
  ngOnInit(): void {
    this.qid = this._route.snapshot.params['qid'];
    // this.qId = this.router.navigate(['qid']);
    this.viewSummary();
    this.allresults()
    console.log(this.qid);
    console.log(this.qId);

  }

  public viewSummary() {
    this._report.loadResultsSummary(this.qid).subscribe((data) => {
      this.summary = data;
      console.log(this.summary);
    });

  }

  public allresults() {
    this._report.loadReportSummary().subscribe((items) => {
      this.all = items;
      this.all.forEach((q)=>{
      // console.log(this.qid);
      console.log(this.all);

const userDetails =localStorage.getItem('user');
const Object = JSON.parse(userDetails);
      this.userId = q.user.id;
      this.reportQuizId=q.quiz.qId;
      this.currentQuizId =this.qid;
      this.currentUserId = Object.id;
      });
      console.log(this.currentUserId)
      console.log(this.userId)
      console.log(this.reportQuizId)

      console.log(this.currentQuizId)




      this.iSresultsSummary = (this.userId==this.currentUserId && this.reportQuizId==3);
      console.log(this.iSresultsSummary);

    });
  }

  // Filter the quiz gotten
  





  closepoup() {
    this.ref.close();
  }

  printPage() {
    document.title = "Results";
    window.print();
    // this.removeResults();
    // this.preventBackButton();
  }
}
