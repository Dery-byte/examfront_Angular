import { Component, OnInit, HostListener } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { ReportServiceService } from 'src/app/services/report-service.service';
import { QuizService } from 'src/app/services/quiz.service';
import { TokenExpirationService } from 'src/app/services/token-expiration.service';
import * as XLSX from 'xlsx';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
	selector: 'app-welcome',
	templateUrl: './welcome.component.html',
	styleUrls: ['./welcome.component.css'],


})
export class WelcomeComponent implements OnInit {
	allQuizzes: any = [];
	reportsData: any[] = [];
	// reportsData = new MatTableDataSource<any>([]);  // Initialize with an empty array


	currentDate:Date;
	// allReportData: any = [];
	// public quizReportsData: any = [];

	// public chartDataPoints: any =[];
	chartOptions

	chartDataPoints: { label: string, y: number }[] = [];

	qId;
	totalQuizTakers = 0;
	totalMarks = 0;
	averageScore: number= 0;
	courseName = 'Course Name';
	// expirationSeconds: any;
	// timeDifferenceInSeconds: any;
	// jwtToken: string;
	AandB=0;
	theoryMarks
	sectionAmarks
	sectionB

	selectedCategoryId;
	associatedQuizzes: any[];
	cateGory;
	allUsers


	public displayColumn: string[] = ['index', 'name', 'marks', 'theory', 'total'];
	constructor(
		private _cat: CategoryService, 
		private _snackbar: MatSnackBar, 
		private _report: ReportServiceService, 
		private _quiz: QuizService,
		private tokenExpirationService: TokenExpirationService, 
		private _login: LoginService,
	private _user:UserService
	) { 

			// this.chartDataPoints = [];
		}
	// @HostListener('window:beforeunload', ['$event'])
	// beforeUnloadHandler(event: Event): void {
	// 	// Custom code to be executed before the page is unloaded
	// 	localStorage.setItem(this.tokenExpirationKey, JSON.stringify(this.expirationSeconds));
	// 	console.log(this.expirationSeconds);
	// 	event.preventDefault();
	// 	// this.preventBackButton();
	// 	event.returnValue = '' as any; // This is required for some older browsers
	// }
	// @HostListener('window:unload', ['$event'])
	// unloadHandler(event: Event): void {
	// 	// this.preventBackButton();
	// }
	ngOnInit(): void {

		this.currentDate = new Date();
		this._user.alluser().subscribe(
			(users:any)=>{
				this.allUsers=users.length;
			}
		)
		this._quiz.loadQuizzes().subscribe(
			(data: any) => {
				this.allQuizzes = data;
				console.log(this.allQuizzes);
				console.log(this.allQuizzes[0].category.title)
			},
			(error) => {
				console.table(error);
				// Swal.fire('Error !!', 'Server Error', 'error');
				this._snackbar.open("You're Session has expired! ", "", {
					duration: 3000,
				  });
				this._login.logout();
			});
		this.allReports();
		// this.extractUniqueCategories();
		// this.expirationFromServer();
		// this.startTimer();
		// this.formattedExpirationTime();
	}

	// =========================
	allReports() {
		this._report.getUniqueCategoriesAndQuizzes().subscribe((data) => {
			this.cateGory = data;
			// console.log(this.cateGory);
			// console.log(this.cateGory[1].title);
			// console.log(this.cateGory[1].cid);
			// console.log(this.cateGory[1].quizTitles[1].title);

		});
	}
	// =========================
	getQuizTitlesByCategory(categoryId: any) {
		const category = this.cateGory.find((c) => c.cid === categoryId);
		return category ? category.quizTitles : [];
	}

	selectCategory(categoryId: any) {
		this.selectedCategoryId = categoryId;
		this.cateGory.forEach(item => {
			if (categoryId === item.cid) {
				this.courseName = item.title;
			}
		});
		this.associatedQuizzes = this.getQuizTitlesByCategory(categoryId);
	}

	exportexcel() {
		let data = document.getElementById('reportdata');
		const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(data);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'sheet1')
		XLSX.writeFile(wb, `${this.courseName}.xlsx`)
	}

	// formattedExpirationTime() {
	// 	this.jwtToken = localStorage.getItem('token')
	// 	const tokenParts = this.jwtToken.split('.');
	// 	console.log(this.jwtToken);

	// 	if (tokenParts.length !== 3) {
	// 		console.error('Invalid JWT format');
	// 		return null;
	// 	}

	// 	const payload = JSON.parse(atob(tokenParts[1]));

	// 	if (!payload || !payload.exp) {
	// 		console.error('Expiration time not found in JWT');
	// 		return null;
	// 	}

	// 	const expirationTimeInSeconds = payload.exp;
	// 	const expirationDate = new Date(expirationTimeInSeconds * 1000); // Convert to milliseconds
	// 	const currentTime = new Date();
	// 	const timeDifferenceInSeconds = Math.floor((expirationDate.getTime() - currentTime.getTime()) / 1000);
	// 	console.log(timeDifferenceInSeconds);
	// 	console.log(typeof (timeDifferenceInSeconds));

	// 	console.log(expirationDate.toLocaleString());

	// 	return timeDifferenceInSeconds; // Adjust the format as needed
	// }


	// // THIS JWT EXPIRATION NOT OPTIMIZED

	// expirationFromServer() {
	// 	// const expirationTimeFromServer = 120; // 15 minutes in seconds
	// 	const expirationTimeFromServers = this.formattedExpirationTime();

	// 	console.log(expirationTimeFromServers);

	// 	this.tokenExpirationService.startCountdown(expirationTimeFromServers);

	// 	this.startTimer();

	// 	this.tokenExpirationService.expiration$.subscribe(seconds => {
	// 		this.expirationSeconds = seconds;

	// 		//   const remainingTime = this.tokenExpirationService.getRemainingTime();
	// 		let timerString = localStorage.getItem(this.tokenExpirationKey);
	// 		const timerNumber = parseInt(timerString, 10);

	// 		if (timerNumber) {
	// 			this.expirationSeconds = timerNumber;
	// 			this.tokenExpirationService.startCountdown(this.expirationSeconds);

	// 			console.log(timerNumber)
	// 			console.log(typeof (timerNumber));
	// 			localStorage.removeItem(this.tokenExpirationKey);

	// 			// Start the countdown again with the remaining time
	// 			// this.tokenExpirationService.startCountdown(this.expirationSeconds);
	// 			// this.startTimer();
	// 		} else {
	// 			// Handle the case when there is no remaining time (e.g., user refreshed after expiration)
	// 			// this.tokenExpirationService.startCountdown(this.expirationSeconds);
	// 			// console.log('Token has expired.');
	// 		}
	// 	});
	// }




	// startTimer() {
	// 	let t = window.setInterval(() => {
	// 		//Code
	// 		if (this.expirationSeconds <= 0) {
	// 			this._login.logout();
	// 			// window.location('/login')
	// 			window.location.href = "/login";
	// 			clearInterval(t);

	// 		}
	// 		else {
	// 			// this.expirationSeconds--;
	// 		}
	// 	}, 1000);
	// }
	// getFormmatedTime() {
	// 	let mm = Math.floor(this.expirationSeconds / 60);
	// 	let ss = this.expirationSeconds - mm * 60;
	// 	return `${mm} min : ${ss} sec`
	// }

	//SELECTING A QUIZ DISPLAY RESULTS FOR EACH STUDENT
onQuizOptionSelected() {
    this.totalMarks = 0;
	// this.chartDataPoints = [];
    this._report.getReportByQuizId(this.qId).subscribe((report: any) => {
        this.reportsData= report;
		this.extractForChart();
        this.totalQuizTakers = this.reportsData.length;
        console.log(this.reportsData);
        this.reportsData.forEach(item => {
            this.totalMarks += parseFloat(item.marks);
			this.sectionAmarks = parseFloat(item.marksB);


			this.sectionB = item.marks;
			this.theoryMarks = item.marksB;
			this.averageScore=(this.totalMarks + this.sectionAmarks) /this.totalQuizTakers;
        });
		console.log(this.averageScore);
		this.AandB=(this.sectionB + this.theoryMarks)



		// this.AandB = (this.totalMarks + this.theoryMarks)
        // Output the total marks
        console.log("Total Marks:", this.totalMarks);
    });
}
extractForChart(){
	  // Extracting names and marks
	  this.chartDataPoints = this.reportsData.map(item => {
		const username = `${item.user.username}`;
		return { label: username, y: parseFloat(item.marks) };
		// this.chartDataPoints = this.reportsData.map(item => ({
		// 	label: item.label,
		// 	y: item.y
		  });

		  // Initialize chart options
		  this.chartOptions = {
			theme: "light2",
			animationEnabled: true,
			zoomEnabled: true,
			title: {
			  text: "Quiz Performance"
			},
			data: [{
			  type: "column",
			  dataPoints: this.chartDataPoints
			}]
		  };
	
		  // Render the chart
		 let chart = new (window as any).CanvasJS.Chart("chartContainer", this.chartOptions);
      chart.render();
		;
	// });
	console.log(this.chartDataPoints);
}



	// chart: any;
	// chartOptions = {
	// 	theme: "light2",
	// 	animationEnabled: true,
	// 	zoomEnabled: true,
	// 	title: {
	// 		text: "Quiz Performance"
	// 	},
	// 	data: [{
	// 		type: "column",
	// 		dataPoints:this.chartDataPoints



	// 		// type: "pie",
	// 		// type: "stepLine",
	// 		// xlabel:"Marks",
	// 		// xValueFormatString: "YYYY",
	// 		// yValueFormatString: "$#,###.##",
	// 		/* The `dataPoint` property in the `chartOptions` object is defining an array of data points for the
	// 		chart. Each data point represents a label (name) and a value (y-axis value) for the chart. In
	// 		this case, the array contains four data points: */
	// 		// dataPoints: 
	// 		// 	[
	// 		// 	{ "label": 'Derry', "y": 5},
	// 		// 	{ "label": 'Emmanuel', "y": 1 },
	// 		// 	{ "label": 'Henry', "y": 5},
	// 		// 	{ "label": 'Mark', "y": 2},
	// 	    //     ]
			
	// 	}]
	// }
}

