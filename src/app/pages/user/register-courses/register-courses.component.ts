import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { RegCoursesService } from 'src/app/services/reg-courses.service';

@Component({
	selector: 'app-register-courses',
	templateUrl: './register-courses.component.html',
	styleUrls: ['./register-courses.component.css']
})
export class RegisterCoursesComponent implements OnInit {

	categories: any[]      = [];
	courses: any[]         = [];
	uniqueLevels: string[] = [];
	selectedLevel: string  = '';

	filteredCourses: any[] = [];   // after level filter  (unregistered)
	displayedCourses: any[] = [];  // after search filter (shown in table)

	unRegCourse: any[]     = [];
	transformedData: any[] = [];

	userRecords: any[]     = [];
	u_id: any;
	RegCourse: any;

	isLoading: boolean     = false;
	enrollingCid: any      = null;
	searchQuery: string    = '';

	regCourdetails = {
		category: { cid: '' }
	};

	constructor(
		private _cat: CategoryService,
		private _regCourse: RegCoursesService,
		private _snack: MatSnackBar
	) {}

	ngOnInit(): void {
		this.loadCoursesData();
		this.getCourses();
	}

	// ── Data loading ──────────────────────────────────────────────

	loadCoursesData(): void {
		this.isLoading = true;

		this._regCourse.getRegCourses().subscribe(regCourses => {
			this.RegCourse    = regCourses;
			this.userRecords  = this.checkUserId();

			this.transformedData = this.userRecords.map(item => ({
				cid:         item.category.cid,
				level:       item.category.level,
				title:       item.category.title,
				description: item.category.description,
				courseCode:  item.category.courseCode
			}));

			this._cat.getCategories().subscribe((categories: any) => {
				this.categories  = categories;
				this.unRegCourse = this.combineAndRemoveDuplicates(this.categories, this.transformedData);
				this.filterCourses();
				this.isLoading = false;
			});
		});
	}

	getCourses(): void {
		this._cat.getCategories().subscribe((data: any) => {
			this.courses = data;
			this.getUniqueLevels();
		});
	}

	// ── Filtering ─────────────────────────────────────────────────

	onLevelChange(): void {
		this.searchQuery = '';
		this.filterCourses();
	}

	filterCourses(): void {
		if (this.selectedLevel) {
			this.filteredCourses = this.unRegCourse.filter(
				course => course.level === this.selectedLevel
			);
		} else {
			this.filteredCourses = [];
		}
		this.applySearch();
	}

	onSearch(): void {
		this.applySearch();
	}

	applySearch(): void {
		if (!this.searchQuery.trim()) {
			this.displayedCourses = [...this.filteredCourses];
			return;
		}
		const q = this.searchQuery.toLowerCase().trim();
		this.displayedCourses = this.filteredCourses.filter(c =>
			c.title.toLowerCase().includes(q) ||
			c.courseCode.toLowerCase().includes(q)
		);
	}

	getUniqueLevels(): void {
		const set = new Set(this.courses.map(course => course.level));
		this.uniqueLevels = Array.from(set).sort((b, a) => {
			const levelA = parseInt(a.split(' ')[1]);
			const levelB = parseInt(b.split(' ')[1]);
			return levelB - levelA;
		});
	}

	checkUserId(): any[] {
		const userDetails = localStorage.getItem('user');
		const userObject  = JSON.parse(userDetails!);
		this.u_id         = userObject.id;
		return this.RegCourse.filter((item: any) => item.user.id === this.u_id);
	}

	combineAndRemoveDuplicates(jsonArray1: any[], jsonArray2: any[]): any[] {
		const combined  = [...jsonArray1, ...jsonArray2];
		const cidCount  = new Map<number, number>();
		for (const item of combined) {
			cidCount.set(item.cid, (cidCount.get(item.cid) || 0) + 1);
		}
		return combined.filter(item => cidCount.get(item.cid) === 1);
	}

	// ── Registration ──────────────────────────────────────────────

	showCid(event: any, cid: any): void {
		if (event.target.checked) {
			this.regCourdetails.category.cid = cid;

			Swal.fire({
				title: 'Register for this course?',
				showCancelButton: true,
				confirmButtonText: 'Confirm',
				icon: 'question',
				background: '#0f0f0f',
				color: 'rgba(255,255,255,0.82)',
				confirmButtonColor: '#e8ff47',
			}).then(result => {
				if (result.isConfirmed) {
					this.enrollingCid = cid;

					this._regCourse.regCourses(this.regCourdetails).subscribe(
						() => {
							this.regCourdetails = { category: { cid: '' } };
							event.target.checked = false;
							this.enrollingCid    = null;
							this.deleteRecord(cid);
							this._snack.open('Course registered successfully!', '', { duration: 3000 });
							this.loadCoursesData();
						},
						() => {
							this.enrollingCid    = null;
							event.target.checked = false;
							this._snack.open('Registration unsuccessful. Try again.', '', { duration: 3000 });
						}
					);
				} else {
					event.target.checked = false;
				}
			});
		}
	}

	deleteRecord(cid: number): void {
		this.filteredCourses  = this.filteredCourses.filter(r => r.cid !== cid);
		this.displayedCourses = this.displayedCourses.filter(r => r.cid !== cid);
	}

	trackByCid(_: number, course: any): any {
		return course.cid;
	}
}