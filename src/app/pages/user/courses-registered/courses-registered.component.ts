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

  constructor (private regCourse: RegCoursesService, 
    private _snack: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef){}
  userRecords=[];  

  u_id
  RegCourse: any[] = [];
  ngOnInit(): void {
    this.regCourse.getRegCourses().subscribe((data=>{
      this.RegCourse = data;
      this.userRecords = this.checkUserId();
    }))
  }
  checkUserId(): any[] {
    const userDetails = localStorage.getItem('user');
    const Object = JSON.parse(userDetails);
    this.u_id = Object.id;
    return this.RegCourse.filter(item => item.user.id === this.u_id);
  }                           

  deleteRegCourse(rid){
    Swal.fire({ 
     icon:"info",
     title:"Are you sure of this ?",
     confirmButtonText:"Delete",
     showCancelButton:true,
    }).then((results)=>{
     if(results.isConfirmed){
  //delete
  this.regCourse.deleteRegCourse(rid).subscribe(
   (data)=>{
// this.userRecords = this.userRecords.filter((userRecord)=>userRecord.rid ! = rid);
this.deleteRecord(rid)
this._snack.open("Course Deleted Successfully ! ", "",{
  duration:3000,
});   },
   (error)=>
   {
    this._snack.open("Course  Deletion Unsuccessfully ", "",{
      duration:3000,
    });

   }
 );
      }
    })
   }


   deleteRecord(rid: number) {
    this.userRecords = this.userRecords.filter(record => record.rid !== rid);
  }
  

  

  
  





}
