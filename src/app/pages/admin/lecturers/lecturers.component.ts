import { Component, TemplateRef, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-lecturers',
  templateUrl: './lecturers.component.html',
  styleUrls: ['./lecturers.component.css']
})
export class LecturersComponent {

  lecturers = [];
// students: any[] = [];
  filteredLecturers: any[] = [];
  searchText: string = '';

  lecturersEdit;



  
    constructor(
    private _category: CategoryService,
    private _snack: MatSnackBar,
    public dialog: MatDialog,
    private login: LoginService,
  ) { }

  dialogRef!: MatDialogRef<any>;

  ngOnInit(): void {
    this.getAllStudents();
  }


    getAllStudents(){
    this._category.getAllLecturers().subscribe((data: any) => {
      this.lecturers = data;
      this.filteredLecturers = [...this.lecturers]; // Display ALL lecturers initially
        console.log('Loaded lecturers:', this.lecturers.length);
      console.log(this.lecturers);
    },
      (error) => {
        this._snack.open("You're Session has expired! ", "", {
          duration: 3000,
        });
        this.login.logout();
        // console.log(error);
        // Swal.fire('Error !! ', 'Error in loading data', 'error');
      }
    );
  }

  applyFilter() {
    const searchValue = this.searchText.toLowerCase().trim();
     if (!searchValue) {
      this.filteredLecturers = [...this.lecturers];
      return;
    }
    this.filteredLecturers = this.lecturers.filter(student => {
      const fullName = student.fullName?.toLowerCase() || '';
      const indexNumber = student.username?.toLowerCase() || '';
      return fullName.includes(searchValue) || indexNumber.includes(searchValue);
    });
  }
  clearSearch() {
    this.searchText = '';
    this.filteredLecturers = [...this.lecturers];
  }






    // UPDATE THE CATEGORY
  getOneLecturer(lecturerId: any): any {
    return this._category.getLecturerById(lecturerId);
  }
  openUpdateLecturer(lecturerId: any, templateRef: TemplateRef<any>): void {
    console.log(lecturerId);
    // Fetch question details based on ID
    this.lecturers = this.getOneLecturer(lecturerId).subscribe((data) => {
      // console.log(this.category);
      this.lecturersEdit = data;
      console.log(this.lecturersEdit);
      this.dialogRef = this.dialog.open(templateRef, {
        width: '650px',
        data: this.lecturersEdit,
      })
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lecturersEdit = result;
      }
    });
  }


}
