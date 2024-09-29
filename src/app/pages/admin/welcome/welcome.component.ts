import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
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


	currentDate: Date;
	// allReportData: any = [];
	// public quizReportsData: any = [];

	// public chartDataPoints: any =[];
	chartOptions

	chartDataPoints: { label: string, y: number }[] = [];

	qId;
	totalQuizTakers = 0;
	totalMarks = 0;
	averageScore: number = 0;
	courseName = 'Course Name';
	AandB = 0;
	theoryMarks
	sectionAmarks
	sectionB
	maxOfTotalScore

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
		private _user: UserService
	) {

		// this.chartDataPoints = [];
	}

	ngOnInit(): void {
		this.currentDate = new Date();
		this._user.alluser().subscribe(
			(users: any) => {
				this.allUsers = users.length;
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

	}

	// =========================
	allReports() {
		this._report.getUniqueCategoriesAndQuizzes().subscribe((data) => {
			this.cateGory = data;


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


	//SELECTING A QUIZ DISPLAY RESULTS FOR EACH STUDENT
	onQuizOptionSelected() {
		this.totalMarks = 0;
		this.sectionAmarks = 0;
		// this.chartDataPoints = [];
		this._report.getReportByQuizId(this.qId).subscribe((report: any) => {
			this.reportsData = report;
			this.extractForChart();
			this.totalQuizTakers = this.reportsData.length;
			console.log(this.reportsData);
			this.reportsData.forEach(item => {
				this.totalMarks += parseFloat(item.marks);
				this.sectionAmarks += parseFloat(item.marksB);


				// this.sectionB = parseFloat(item.marks);
				// this.theoryMarks = parseFloat(item.marksB);
				this.averageScore = (this.totalMarks + this.sectionAmarks) / this.totalQuizTakers;
			});
			console.log(this.averageScore);


			// this.AandB = (this.totalMarks + this.theoryMarks)
			// Output the total marks
			console.log("Total Marks:", this.totalMarks);
		});
	}
	extractForChart() {
		var maxOfTotalScore = 0;
		// Extracting names and marks
		this.chartDataPoints = this.reportsData.map(item => {
			const username = `${item.user.username}`;
			this.maxOfTotalScore = (parseFloat(item.marks) + parseFloat(item.marksB));
			return { label: username, y: this.maxOfTotalScore };
			// this.chartDataPoints = this.reportsData.map(item => ({
			// 	label: item.label,
			// 	y: item.y
		});


		const maxScore = Math.max(...this.chartDataPoints.map(point => point.y));
		const yAxisMax = Math.ceil(maxScore + 2);
		// Initialize chart options
		this.chartOptions = {
			theme: "light2",
			animationEnabled: true,
			zoomEnabled: true,
			title: {
				text: "Quiz Performance"
			},
			axisX: {
				title: "Students", // Label for the X-axis
				labelFontSize: 14, // Font size for X-axis labels
			}
			,
			axisY: {
				title: "Marks", // Label for the Y-axis
				minimum: 0, // Set the minimum value of Y-axis
				maximum: yAxisMax, // Set the maximum value of Y-axis
				interval: 1, // Set interval between data points on Y-axis
				labelFontSize: 10, // Font size for Y-axis labels
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
}




// TOMORROW WORK ON THE JWT TOKEN EXPIRATION ALERT ON THE INTERFACE