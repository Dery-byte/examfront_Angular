import { Component, TemplateRef, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';


@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent {
students = [];
// students: any[] = [];
  filteredStudents: any[] = [];
  searchText: string = '';




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
    this._category.getAllStudent().subscribe((data: any) => {
      this.students = data;
      this.filteredStudents = [...this.students]; // Display ALL students initially
        console.log('Loaded students:', this.students.length);
      console.log(this.students);
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
      this.filteredStudents = [...this.students];
      return;
    }
    this.filteredStudents = this.students.filter(student => {
      const fullName = student.fullName?.toLowerCase() || '';
      const indexNumber = student.username?.toLowerCase() || '';
      return fullName.includes(searchValue) || indexNumber.includes(searchValue);
    });
  }
  clearSearch() {
    this.searchText = '';
    this.filteredStudents = [...this.students];
  }
}
