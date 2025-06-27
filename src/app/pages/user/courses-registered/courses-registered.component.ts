import { Component, OnInit } from '@angular/core';
import { RegCoursesService } from 'src/app/services/reg-courses.service';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-courses-registered',
  templateUrl: './courses-registered.component.html',
  styleUrls: ['./courses-registered.component.css']
})
export class CoursesRegisteredComponent implements OnInit {
  userRecords: any[] = [];  
  u_id: string;
  isLoading: boolean = false;
  isDeleting: boolean = false;
  errorLoading: boolean = false;

  constructor(
    private regCourse: RegCoursesService, 
    private _snack: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRegisteredCourses();
  }

  loadRegisteredCourses(): void {
    this.isLoading = true;
    this.errorLoading = false;
    
    this.regCourse.getRegCourses().subscribe(
      (data) => {
        this.userRecords = this.filterUserCourses(data);
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.errorLoading = true;
        this._snack.open("Failed to load courses. Please try again.", "", {
          duration: 3000,
        });
      }
    );
  }

  filterUserCourses(allCourses: any[]): any[] {
    const userDetails = localStorage.getItem('user');
    if (!userDetails) return [];
    
    try {
      const user = JSON.parse(userDetails);
      this.u_id = user.id;
      return allCourses.filter(item => item.user?.id === this.u_id);
    } catch (e) {
      console.error('Error parsing user data', e);
      return [];
    }
  }                           

  deleteRegCourse(rid: number): void {
    Swal.fire({ 
      icon: "info",
      title: "Are you sure?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33"
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeDelete(rid);
      }
    });
  }

  private executeDelete(rid: number): void {
    this.isDeleting = true;
    
    this.regCourse.deleteRegCourse(rid).subscribe(
      () => {
        this.deleteRecord(rid);
        this.isDeleting = false;
        this._snack.open("Course deleted successfully!", "", {
          duration: 3000,
        });
      },
      (error) => {
        this.isDeleting = false;
        this._snack.open("Failed to delete course. Please try again.", "", {
          duration: 3000,
        });
      }
    );
  }

  private deleteRecord(rid: number): void {
    this.userRecords = this.userRecords.filter(record => record.rid !== rid);
    this.changeDetectorRef.detectChanges();
  }
}