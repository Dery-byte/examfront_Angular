import { Component, OnInit} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';
import { RegCoursesService } from 'src/app/services/reg-courses.service';
import { ReportServiceService } from 'src/app/services/report-service.service';

@Component({
  selector: 'app-available-quizzes',
  templateUrl: './available-quizzes.component.html',
  styleUrls: ['./available-quizzes.component.css']
})
export class AvailableQuizzesComponent  implements OnInit {
  productDialog: boolean;
	public availablequizzes: any = [];
  userRecords: any[];
	  categories;
    RegCourse
    u_id
    reportData;
    pqId
    qId;
  constructor(private _cat: CategoryService, private _couseReg:RegCoursesService ,private _snack:MatSnackBar, private _quiz: QuizService, private _route:ActivatedRoute, private _report: ReportServiceService){}
  
  ngOnInit(): void {

    // this.qId = this._route.snapshot.params['qid'];
    this.qId = this._route.paramMap['qId']
    console.log(this.qId)




    this._couseReg.getRegCourses().subscribe((data:any)=>{
      this.categories=data;
      this.userRecords = this.checkUserId();

          },
          (error)=>{
      this._snack.open("Couldn't load Categories from Server","",{
        duration:3000
      })
          });



//     this._cat.getCategories().subscribe((data:any)=>{
// this.categories=data;
//     },
//     (error)=>{
// this._snack.open("Couldn't load Categories from Server","",{
//   duration:3000
// })
//     });    
  }

  checkUserId(): any[] {
    // Filter the records associated with user id 6
    const userDetails = localStorage.getItem('user');
    const Object = JSON.parse(userDetails);
    this.u_id = Object.id;
    return this.categories.filter(item => item.user.id === this.u_id);
    // return this.RegCourse.filter(item => item.user.id === 6);

  } 










  	//SELECTING A COURSE DISPLAY AVAILABLE QUIZZES FOR EACH COURSE
	onQuizOptionSelected() {
		this._quiz.getActieQuizzesOfCategory(this.categories.cid).subscribe((quiz: any) => {
			this.availablequizzes = quiz;
			console.log(this.availablequizzes);
		})
	}





  hideDialog() {
    this.productDialog = false;
    this.qId=null;
}
openNew(id:number) {
    this.productDialog  = true;
    this.pqId = id;
    console.log(id)
    this.loadReport();
    this.pqId=null;
}

  loadReport(){
    const userDetails = localStorage.getItem('user');
    const Object = JSON.parse(userDetails);
  this._report.getReport(Object.id,this.pqId).subscribe((report)=>{
    this.reportData = report;
  console.log(this.reportData[0].marks);
  console.log(this.reportData[0].progress);
  console.log(this.reportData[0].quiz.title);
  console.log(this.reportData[0].user.lastname);
  
  
  
  console.log(report);
  });
  }






}
