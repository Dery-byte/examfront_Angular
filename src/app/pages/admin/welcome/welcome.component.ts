import { Component, OnInit, HostListener } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { ReportServiceService } from 'src/app/services/report-service.service';
import { QuizService } from 'src/app/services/quiz.service';
import { TokenExpirationService } from 'src/app/services/token-expiration.service';
import * as XLSX from 'xlsx';


import { LocationStrategy } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { Router, } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
@Component({
	selector: 'app-welcome',
	templateUrl: './welcome.component.html',
	styleUrls: ['./welcome.component.css'],


})
export class WelcomeComponent implements OnInit {
	allQuizzes: any = [];
	categories: { id: number, title: string }[] = [];
	quizzes: { Qid: number, qTitle: string }[] = [];

	public reportsData: any = [];
	allReportData: any = [];
	public quizReportsData: any = [];

	uniqueItems: any = [];
	uniqueCategories
	qId;
	cid;
	totalQuizTakers = 0;
	totalMarks = 0;
	averageScore = 0;
	courseName= 'Course Name';
	expirationSeconds: any;
	timeDifferenceInSeconds: any;
	jwtToken: string;
	private tokenExpirationKey = 'tokenExpirationTime';
	//  uniqueCategories: any[];
	public displayColumn: string[] = ['index', 'name', 'marks'];



	constructor(private _cat: CategoryService, private _snackbar: MatSnackBar, private _report: ReportServiceService, private _quiz: QuizService,
		private tokenExpirationService: TokenExpirationService, private _login: LoginService) { }



	@HostListener('window:beforeunload', ['$event'])
	beforeUnloadHandler(event: Event): void {
		// Custom code to be executed before the page is unloaded
		localStorage.setItem(this.tokenExpirationKey, JSON.stringify(this.expirationSeconds));
		console.log(this.expirationSeconds);
		event.preventDefault();
		// this.preventBackButton();
		event.returnValue = '' as any; // This is required for some older browsers
	}
	@HostListener('window:unload', ['$event'])
	unloadHandler(event: Event): void {
		// this.preventBackButton();
	}



	ngOnInit(): void {
		this._quiz.loadQuizzes().subscribe(
			(data: any) => {
				this.allQuizzes = data;
				console.log(this.allQuizzes);
				console.log(this.allQuizzes[0].category.title)
			},
			(error) => {
				console.table(error);
				Swal.fire('Error !!', 'Server Error', 'error');
			});
		this.allReports();
		// this.extractUniqueCategories();
		this.expirationFromServer();
		this.startTimer();
		this.formattedExpirationTime();
	}




	allReports() {
		this._report.loadReportSummary().subscribe((data => {
			this.allReportData = data; /// you can fetch the results based on the category ID to get only one of the category titles. (Those with same cid have the same title.)
			console.log(this.allReportData);
			const categoryMap = new Map<number, string>();
			const quizMap = new Map<number, string>();
			// Iterate over the response and extract unique categories
			this.allReportData.forEach(item => {
				const category = item.quiz.category;
				categoryMap.set(category.cid, category.title);
				const quiz = item.quiz;
				quizMap.set(quiz.qId, quiz.title);
			});

			// Convert the map to an array of categories
			this.categories = Array.from(categoryMap).map(([id, title]) => ({ id, title }));
			console.log(this.categories[0].title)
			console.log(this.categories)

			// Convert the map to an array of categories
			this.quizzes = Array.from(quizMap).map(([Qid, qTitle]) => ({ Qid, qTitle }));
			console.log(this.quizzes[0].qTitle)
			console.log(this.quizzes)



			// MODIFED FROM CHAT
			// this.allReportData.forEach(item => {
			//   const category = item.quiz.category;
			//   const quiz = item.quiz;

			//   // Update categories array
			//   const existingCategory = this.categories.find(c => c.id === category.cid);
			//   if (!existingCategory) {
			//     this.categories.push({ id: category.cid, title: category.title });
			//   }

			//   // Update quizzesByCategory object
			//   if (!this.quizzesByCategory[category.title]) {
			//     this.quizzesByCategory[category.title] = [];
			//   }
			//   this.quizzesByCategory[category.title].push({ Qid: quiz.qId, qTitle: quiz.title });
			// });

			// console.log(this.categories);
			// console.log(this.quizzesByCategory);


			// MODIFED FROM CHATEND




			// console.log(this.allReportData);
			// const quizMap = new Map<number, string>();
			// // Iterate over the response and extract unique categories
			// this.allReportData.forEach(item => {
			//   const quiz = item.quiz;
			//   quizMap.set(quiz.cid, quiz.title);
			// });

			// // Convert the map to an array of categories
			// this.quizzes = Array.from(quizMap).map(([id, title]) => ({ id, title }));
			// console.log(this.quizzes[0].title)
			// console.log(this.quizzes)

		}));




	}

	exportexcel() {
		let data = document.getElementById('reportdata');
		const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(data);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'sheet1')
		XLSX.writeFile(wb, `${this.courseName}.xlsx`)
	}

























	formattedExpirationTime() {
		this.jwtToken = localStorage.getItem('token')
		const tokenParts = this.jwtToken.split('.');
		console.log(this.jwtToken);

		if (tokenParts.length !== 3) {
			console.error('Invalid JWT format');
			return null;
		}

		const payload = JSON.parse(atob(tokenParts[1]));

		if (!payload || !payload.exp) {
			console.error('Expiration time not found in JWT');
			return null;
		}

		const expirationTimeInSeconds = payload.exp;
		const expirationDate = new Date(expirationTimeInSeconds * 1000); // Convert to milliseconds
		const currentTime = new Date();
		const timeDifferenceInSeconds = Math.floor((expirationDate.getTime() - currentTime.getTime()) / 1000);
		console.log(timeDifferenceInSeconds);
		console.log(typeof (timeDifferenceInSeconds));

		console.log(expirationDate.toLocaleString());

		return timeDifferenceInSeconds; // Adjust the format as needed
	}






























	// THIS JWT EXPIRATION NOT OPTIMIZED

	expirationFromServer() {
		// const expirationTimeFromServer = 120; // 15 minutes in seconds
		const expirationTimeFromServers = this.formattedExpirationTime();

		console.log(expirationTimeFromServers);

		this.tokenExpirationService.startCountdown(expirationTimeFromServers);

		this.startTimer();

		this.tokenExpirationService.expiration$.subscribe(seconds => {
			this.expirationSeconds = seconds;

			//   const remainingTime = this.tokenExpirationService.getRemainingTime();
			let timerString = localStorage.getItem(this.tokenExpirationKey);
			const timerNumber = parseInt(timerString, 10);

			if (timerNumber) {
				this.expirationSeconds = timerNumber;
				this.tokenExpirationService.startCountdown(this.expirationSeconds);

				console.log(timerNumber)
				console.log(typeof (timerNumber));
				localStorage.removeItem(this.tokenExpirationKey);

				// Start the countdown again with the remaining time
				// this.tokenExpirationService.startCountdown(this.expirationSeconds);
				// this.startTimer();
			} else {
				// Handle the case when there is no remaining time (e.g., user refreshed after expiration)
				// this.tokenExpirationService.startCountdown(this.expirationSeconds);
				// console.log('Token has expired.');
			}
		});
	}




















	startTimer() {
		let t = window.setInterval(() => {
			//Code
			if (this.expirationSeconds <= 0) {
				this._login.logout();
				// window.location('/login')
				window.location.href = "/login";
				clearInterval(t);

			}
			else {
				this.expirationSeconds--;
			}
		}, 1000);
	}
	getFormmatedTime() {
		let mm = Math.floor(this.expirationSeconds / 60);
		let ss = this.expirationSeconds - mm * 60;
		return `${mm} min : ${ss} sec`
	}







	// 
	onCategorySelectedReport() {
		this.totalMarks = 0;
		this._report.getReportByQuizId(this.qId).subscribe((reports: any) => {
			this.quizReportsData = reports;
			console.table(this.reportsData)
			this.totalQuizTakers = this.quizReportsData.length;
			console.log(this.totalQuizTakers);
			console.log(this.quizReportsData)
			console.log(typeof (this.totalQuizTakers));
			console.log(this.quizReportsData[0].quiz.category.title)
			console.log(this.quizReportsData[0].quiz.title)
			this.courseName = this.quizReportsData[0].quiz.category.title;
			this.quizReportsData.forEach(item => {
				this.totalMarks += parseFloat(item.marks);
			});
			// Output the total marks
			console.log("Total Marks:", this.totalMarks);
			console.log(typeof (this.totalMarks));
		})
	}

	//SELECTING A QUIZ DISPLAY RESULTS FOR EACH STUDENT
	onQuizOptionSelected() {
		this.totalMarks = 0;
		this._report.getReportByQuizId(this.qId).subscribe((report: any) => {
			this.reportsData = report;
			this.totalQuizTakers = this.reportsData.length;
			this.courseName = this.reportsData[0].quiz.category.title;
			this.reportsData.forEach(item => {
				this.totalMarks += parseFloat(item.marks);
			});
			// Output the total marks
			console.log("Total Marks:", this.totalMarks);
			this.averageScore = this.totalMarks / this.totalQuizTakers;
		})
	}





	// extractUniqueCategories(): void {
	//     const uniqueCategorySet = new Set<number>();

	//     this.allReportData.forEach(item => {
	//       uniqueCategorySet.add(item.quiz.category.cid);
	//     });

	//     // Convert the Set to an array of unique categories
	//     this.uniqueCategories = Array.from(uniqueCategorySet).map(cid => {
	//       const categoryItem = this.allReportData.find(item => item.quiz.category.cid === cid);
	//       return { cid, title: categoryItem?.quiz.category.title || 'Unknown Title' };
	//     });

	//     console.log('Unique Categories:', this.uniqueCategories);
	//   }































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
				if (order > suffixes.length - 1)
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

