import { Component, OnInit, } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { RegCoursesService } from 'src/app/services/reg-courses.service';
import { forkJoin } from 'rxjs';


import { error, event } from 'jquery';

@Component({
	selector: 'app-register-courses',
	templateUrl: './register-courses.component.html',
	styleUrls: ['./register-courses.component.css']
})
export class RegisterCoursesComponent implements OnInit {

	categories: any[] = [];
	public displayColumn: string[] = ['courseCode', 'courseTitle'];
	displayedColumns: string[] = ['checkboxes', 'courseCode', 'courseTitle'];
	selectAllCategories: boolean = false;

	courses: any[] = [];
	uniqueLevels: string[] = [];
	selectedLevel: string = '';
	filteredCourses: any[] = [];
	SelectedItems: string[] = [];
	selectedCid: string | null = null;
	selectedCategories: any[] = [];

	unRegCourse: any[] = [];

	uniqueItems;
	// filteredData;


	userRecords = [];
	u_id
	RegCourse;
	// REGISTER course
	regCourdetails = {
		regDate: "",
		category:
		{
			cid: ""
		},
	}

	transformedData: any[] = [];
	unRegisteredCourses: any[] = [];


	constructor(private _cat: CategoryService, private _regCourse: RegCoursesService, private _snack: MatSnackBar) { }
	selectedItem(item: string, event: any) {
		if (event.target.checked) {
			this.SelectedItems.push(item)
		}
		else {
			const index = this.SelectedItems.indexOf(item)
			if (index !== -1) {
				this.SelectedItems.splice(index, 1)
			}
		}
	}

	getUniqueItems(data: any[]): any[] {
		const uniqueItems = {};
		data.forEach(item => {
			if (!uniqueItems[item.cid]) {
				uniqueItems[item.cid] = item;
			}
		});
		return Object.values(uniqueItems);
	}


	ngOnInit(): void {
		this.loadCoursesData();
		this.getCourses();
	}

	loadCoursesData(): void {
		// Fetch registered courses
		this._regCourse.getRegCourses().subscribe(regCourses => {
		  // Process registered courses
		  this.RegCourse = regCourses;
		  this.userRecords = this.checkUserId();
	  
		  // Transform registered courses for comparison
		  this.transformedData = this.userRecords.map(item => ({
			cid: item.category.cid,
			level: item.category.level,
			title: item.category.title,
			description: item.category.description,
			courseCode: item.category.courseCode
		  }));
	  
		  // After transforming registered courses, fetch available courses
		  this._cat.getCategories().subscribe(categories => {
			// Combine available and registered courses and remove duplicates
			this.categories = categories;
			this.unRegCourse = this.combineAndRemoveDuplicates(this.categories, this.transformedData);
	  
			// Apply filters based on selected level
			this.filterCourses();
		  });
		});
	  }
	  







	// loadCoursesData(): void {
	// 	// Fetch both registered and available courses in parallel
	// 	forkJoin({
	// 		regCourses: this._regCourse.getRegCourses(),  // Registered courses
	// 		categories: this._cat.getCategories()         // All available courses
	// 	}).subscribe(({ regCourses, categories }) => {
	// 		// Process registered courses
	// 		this.RegCourse = regCourses;
	// 		this.userRecords = this.checkUserId();

	// 		// Transform registered courses for comparison
	// 		this.transformedData = this.userRecords.map(item => ({
	// 			cid: item.category.cid,
	// 			level: item.category.level,
	// 			title: item.category.title,
	// 			description: item.category.description,
	// 			courseCode: item.category.courseCode
	// 		}));

	// 		// Combine available and registered courses and remove duplicates
	// 		this.categories = categories;
	// 		this.unRegCourse = this.combineAndRemoveDuplicates(this.categories, this.transformedData);

	// 		// Apply filters based on selected level
	// 		this.filterCourses();
	// 	});
	// }























































	combineAndRemoveDuplicates(jsonArray1: any[], jsonArray2: any[]): any[] {
		const combinedArray = [...jsonArray1, ...jsonArray2];
		const cidCount = new Map<number, number>();
		// Count occurrences of each cid
		for (const item of combinedArray) {
			cidCount.set(item.cid, (cidCount.get(item.cid) || 0) + 1);
		}

		// Return items that appear only once (unregistered courses)
		return combinedArray.filter(item => cidCount.get(item.cid) === 1);
	}

	checkUserId(): any[] {
		const userDetails = localStorage.getItem('user');
		const userObject = JSON.parse(userDetails);
		this.u_id = userObject.id;

		// Filter registered courses by user ID
		return this.RegCourse.filter(item => item.user.id === this.u_id);
	}

	filterCourses() {
		// Filter unregistered courses by selected level
		if (this.selectedLevel) {
			this.filteredCourses = this.unRegCourse.filter(course => course.level === this.selectedLevel);
		} else {
			this.filteredCourses = [];
		}
	}
	showCid(event: any, cid: any) {
		if (event.target.checked) {
			this.regCourdetails.category.cid = cid;
			console.log(`Selected ID: ${this.regCourdetails.category.cid}`);

			Swal.fire({
				title: "Do you want to register for this course?",
				showCancelButton: true,
				confirmButtonText: "Register",
				icon: "info",
			}).then((result) => {
				if (result.isConfirmed) {
					this._regCourse.regCourses(this.regCourdetails).subscribe(
						(data) => {
							const currentDate = new Date();
							this.regCourdetails = {
								regDate: currentDate.toISOString().split("T")[0],
								category: {
									cid: ""
								}
							};
							event.target.checked = false;
							console.log(this.regCourdetails);
							// REMOVE THE COURSE FROM THE LIST IF REGISTRATION SUCCESSFUL
							this.deleteRecord(cid);
							this._snack.open("Course registered Successfully ! ", "", {
								duration: 3000,
							});
							this.loadCoursesData();
						},
						(error) => {
							this._snack.open("Course registeration Unsuccessful ! ", "", {
								duration: 3000,
							});
						}
					);
				} else if (result.dismiss === Swal.DismissReason.cancel) {
					// If the user cancels, uncheck the checkbox
					event.target.checked = false;
				}
			});
		}
	}
	deleteRecord(cid: number) {
		this.filteredCourses = this.filteredCourses.filter(record => record.cid !== cid);
	}
	delRecord(cid: number) {
		const mergeRegUnreg = [...this.filteredCourses, ...this.transformedData];
		mergeRegUnreg.forEach(item => {
			if (item.cid) {
				this.unRegCourse = mergeRegUnreg.filter(record => record.cid !== cid);
			}
		});
	}
	getCourses() {
		this._cat.getCategories().subscribe(data => {
			this.courses = data;
			this.getUniqueLevels();
			// this.filterCourses();
		});
	}
	getUniqueLevels() {
		// this.uniqueLevels = [...new Set(this.courses.map(course => course.level))];
		const uniqueLevelsSet = new Set(this.courses.map(course => course.level));
		this.uniqueLevels = Array.from(uniqueLevelsSet).sort((b, a) => {
			// Assuming the level format is "Level XXX"
			const levelA = parseInt(a.split(' ')[1]);
			const levelB = parseInt(b.split(' ')[1]);
			return levelB - levelA;
		});
	}

	checkAllCheckBox(ev: any) { // Angular 13
		this.categories.forEach(x => x.checked = ev.target.checked)
	}
	isAllCheckBoxChecked() {
		return this.categories.every(c => c.checked);
	}

}








