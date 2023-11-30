import { Component ,OnInit} from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { ReportServiceService } from 'src/app/services/report-service.service';
import { QuizService } from 'src/app/services/quiz.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],


})
export class WelcomeComponent implements OnInit{
	allQuizzes=[];
	categories=[];
	public reportsData: any=[];
	qId;
	quizTitles: string[] = [];
	selectedTitle: string;
	totalQuizTakers
	 totalMarks = 0;

	public displayColumn: string[]=['index','name','marks'];

	changeCourse(e){
		console.log(e.target.value)
	}






	constructor(private _cat:CategoryService, private _snackbar:MatSnackBar, private _report:ReportServiceService, private _quiz:QuizService){}

ngOnInit(): void {
this._quiz.loadQuizzes().subscribe(
	(data:any)=>{
	  this.allQuizzes=data;
	  console.log(this.allQuizzes);
	},
	(error)=>{
	  console.table(error);
	  Swal.fire('Error !!', 'Server Error', 'error');
	}
	)
	
}


onOptionSelected(){
	this.totalMarks=0;
	this._report.getReportByQuizId(this.qId).subscribe((report:any)=>{
		this.reportsData=report;
		this.quizTitles=this.getUniqueTitles(report);
		// this.totalQuizTakers=this.report.length
		// console.log(this.totalQuizTakers)
		this.totalQuizTakers= this.reportsData.length;
		console.log(this.totalQuizTakers);
		console.log(this.reportsData)
		console.log(typeof(this.totalQuizTakers));


// Loop through the array and add up the marks
this.reportsData.forEach(item => {
	this.totalMarks += parseFloat(item.marks);
  });
  // Output the total marks
  console.log("Total Marks:", this.totalMarks);
  console.log(typeof(this.totalMarks));
	})
}

getUniqueTitles(data: any[]): string[] {
    const uniqueTitles = [...new Set(data.map(item => item.quiz.title))];
    return uniqueTitles;
  }

onOptionSelectedReport(){
	this._report.getReportByQuizId(this.qId).subscribe((report:any)=>{
		this.reportsData=report;
		console.table(this.reportsData)

		
	})
}



  chart: any;
	chartOptions = {
		theme: "light2",
		animationEnabled: true,
		zoomEnabled: true,
		title: {
			text: "Quiz Performance"
		},
		axisY: {
			labelFormatter: (e: any) => {
				var suffixes = ["", "K", "M", "B", "T"];
 
				var order = Math.max(Math.floor(Math.log(e.value) / Math.log(1000)), 0);
				if(order > suffixes.length - 1)
					order = suffixes.length - 1;

				var suffix = suffixes[order];
				return "$" + (e.value / Math.pow(1000, order)) + suffix;
			}
		},
		data: [{
			type: "line",
			xValueFormatString: "YYYY",
			yValueFormatString: "$#,###.##",
			dataPoints: [
			  { x: new Date(1980, 0, 1), y: 2500582120 },
			  { x: new Date(1981, 0, 1), y: 2318922620 },
			  { x: new Date(1982, 0, 1), y: 2682595570 },
			  { x: new Date(1983, 0, 1), y: 3319952630 },
			  { x: new Date(1984, 0, 1), y: 3220180980 },
			  { x: new Date(1985, 0, 1), y: 4627024630 },
			  { x: new Date(1986, 0, 1), y: 6317198860 },
			  { x: new Date(1987, 0, 1), y: 7653429640 },
			  { x: new Date(1988, 0, 1), y: 9314027340 },
			  { x: new Date(1989, 0, 1), y: 11377814830 },
			  { x: new Date(1990, 0, 1), y: 9379751620 },
			  { x: new Date(1991, 0, 1), y: 11185055410 },
			  { x: new Date(1992, 0, 1), y: 10705343270 },
			  { x: new Date(1993, 0, 1), y: 13764161445.9 },
			  { x: new Date(1994, 0, 1), y: 14470193647.6 },
			  { x: new Date(1995, 0, 1), y: 17087721440.6 },
			  { x: new Date(1996, 0, 1), y: 19594314507.7 },
			  { x: new Date(1997, 0, 1), y: 21708247148.4 },
			  { x: new Date(1998, 0, 1), y: 25445271790 },
			  { x: new Date(1999, 0, 1), y: 33492125981.9 },
			  { x: new Date(2000, 0, 1), y: 30963463195.2 },
			  { x: new Date(2001, 0, 1), y: 26815924144.7 },
			  { x: new Date(2002, 0, 1), y: 22770427533.4 },
			  { x: new Date(2003, 0, 1), y: 31253989239.5 },
			  { x: new Date(2004, 0, 1), y: 36677497452.5 },
			  { x: new Date(2005, 0, 1), y: 40439926591.3 },
			  { x: new Date(2006, 0, 1), y: 49993998569.1 },
			  { x: new Date(2007, 0, 1), y: 60305010382.7 },
			  { x: new Date(2008, 0, 1), y: 32271465666.7 },
			  { x: new Date(2009, 0, 1), y: 43959427666.5 },
			  { x: new Date(2010, 0, 1), y: 50941861580.9 },
			  { x: new Date(2011, 0, 1), y: 43956921719.4 },
			  { x: new Date(2012, 0, 1), y: 50655765599.9 },
			  { x: new Date(2013, 0, 1), y: 59629932862.7 },
			  { x: new Date(2014, 0, 1), y: 62837256171.1 },
			  { x: new Date(2015, 0, 1), y: 61894377981.9 },
			  { x: new Date(2016, 0, 1), y: 64998472607.9 },
			  { x: new Date(2017, 0, 1), y: 75233321687.8 },
			  { x: new Date(2018, 0, 1), y: 68650476424.8 }
			]
		}]
	}	
}

