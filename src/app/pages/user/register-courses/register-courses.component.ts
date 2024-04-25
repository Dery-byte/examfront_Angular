import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { RegCoursesService } from 'src/app/services/reg-courses.service';
import { error, event } from 'jquery';

@Component({
	selector: 'app-register-courses',
	templateUrl: './register-courses.component.html',
	styleUrls: ['./register-courses.component.css']
})
export class RegisterCoursesComponent implements OnInit {

	categories:any[] =[];
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

	uniqueItems;
	filteredData;


	userRecords=[];  
  u_id
  RegCourse: any[] = [];
	// REGISTER course
	regCourdetails={
		regDate:"",
		category:
		{
		  cid:""
		},
	}

	transformedData:any[] =[];
	unRegisteredCourses:any[]=[];

	  
	constructor(private _cat: CategoryService, private _regCourse: RegCoursesService,private _snack : MatSnackBar) { }
	selectedItem(item: string, event: any){
		if(event.target.checked){
			this.SelectedItems.push(item)
		}
		else{
			const index = this.SelectedItems.indexOf(item)
		if(index !==-1){
			this.SelectedItems.splice(index,1)
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
	// Notice this
	this._regCourse.getRegCourses().subscribe((data=>{
		this.RegCourse = data;
		this.userRecords = this.checkUserId();

		this.transformedData = this.userRecords.map(item => {
    return {
        cid: item.category.cid,
        level: item.category.level,
        title: item.category.title,
        description: item.category.description,
        courseCode: item.category.courseCode
    };
});

// console.log(this.transformedData);
	  }))
		this._cat.getCategories().subscribe((courses: any) => {
			this.categories = courses;
			console.log(this.categories);
			const mergedArray = [...this.categories, ...this.transformedData];
// Create a map to keep track of the count of each cid
           const cidCountMap = new Map();
          mergedArray.forEach(course => {
			const cid = course.cid;
			if (!cidCountMap.has(cid)) {
				cidCountMap.set(cid, 1);
			} else {
				const count = cidCountMap.get(cid);
				cidCountMap.set(cid, count + 1);
			}
		});

this.unRegisteredCourses = courses.filter(course => cidCountMap.get(course.cid) === 1);
console.log(this.unRegisteredCourses);

		})

		this.getCourses();	
	}



	
	checkUserId(): any[] {
		const userDetails = localStorage.getItem('user');
		const Object = JSON.parse(userDetails);
		this.u_id = Object.id;
		return this.RegCourse.filter(item => item.user.id === this.u_id);
	  } 

	showCid(event: any, cid: any) {
		if (event.target.checked) {
			this.regCourdetails.category.cid=cid;
		  console.log(`Selected ID: ${this.regCourdetails.category.cid}`);
		  Swal.fire({
			title: "Do you want to register for this course ?",
			showCancelButton: true,
			confirmButtonText: "Register",
			icon: "info",
		  }).then((e) => {
			if (e.isConfirmed) {
				this._regCourse.regCourses(this.regCourdetails).subscribe(
					(data)=>{
					this.regCourdetails={
						regDate:"",
						category:
						{
						  cid:""
						},
					}
					event.target.checked = false;
					Swal.fire('Success', "Registration done", "success");
				}), error=>{
					Swal.fire("Error", "Registration Unsuccessful", "error");
				}			
			};
		  });
		//   this.formSubmit();
		}
	  }
	
	getCourses() {
		this._cat.getCategories().subscribe(data => {
			this.courses = data;
			this.getUniqueLevels();
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
	filterCourses() {
		this.filteredCourses = this.unRegisteredCourses.filter(course => course.level === this.selectedLevel);
	}




	checkAllCheckBox(ev: any) { // Angular 13
		this.categories.forEach(x => x.checked = ev.target.checked)
	}
	isAllCheckBoxChecked() {
		return this.categories.every(c => c.checked);
	}

	  }








