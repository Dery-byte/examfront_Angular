import { Component, OnInit } from '@angular/core';
import { RegCoursesService } from 'src/app/services/reg-courses.service';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';





@Component({
  selector: 'app-courses-registered',
  templateUrl: './courses-registered.component.html',
  styleUrls: ['./courses-registered.component.css']
})
export class CoursesRegisteredComponent implements OnInit {

  constructor (private regCourse: RegCoursesService, private changeDetectorRef: ChangeDetectorRef){}
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
this.userRecords = this.userRecords.filter((userRecord)=>userRecord.rid ! = rid);

this.changeDetectorRef.detectChanges();

     Swal.fire("Success", "Course Removed", "success");
   },
   (error)=>
   {
     Swal.fire("Error", "Course could not be removed", "error");
 
   }
 );
      }
    })
   }


  

  

  
  





}
