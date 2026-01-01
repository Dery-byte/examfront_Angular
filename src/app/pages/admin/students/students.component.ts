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
  studentEdit;




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


  getAllStudents() {
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










  // UPDATE THE CATEGORY
  getOneStudent(studentsId: any): any {
    return this._category.getStudentById(studentsId);
  }
  openUpdateStudent(studentsId: any, templateRef: TemplateRef<any>): void {
    console.log(studentsId);
    // Fetch question details based on ID
    this.students = this.getOneStudent(studentsId).subscribe((data) => {
      // console.log(this.category);
      this.studentEdit = data;
      console.log("On opening the modal Student Details ", this.studentEdit);
      this.dialogRef = this.dialog.open(templateRef, {
        width: '650px',
        data: this.studentEdit,
      })
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentEdit = result;
      }
    });
  }





  updatestudent() {
    console.log('Student DEtails before persisting for Edit:', this.studentEdit);
    console.log('studentEdit.id:', this.studentEdit.id);
    this._category.updateStudent(this.studentEdit.id, this.studentEdit).subscribe((data) => {
      this._snack.open("This Student is Updated Successfully! ", "", {
        duration: 3000,
      });
      this.dialogRef.close(this.studentEdit);
      this.ngOnInit();
    },
      (error) => {
        this._snack.open("This student couldn't be updated", "", {
          duration: 3000,
        });
      });
  }




  deleteStudent(lectId) {
    Swal.fire({
      icon: "info",
      title: "Are you sure of this ?",
      confirmButtonText: "Delete",
      showCancelButton: true,
    }).then((results) => {
      if (results.isConfirmed) {
        //delete
        this._category.deleteStudent(lectId).subscribe(
          (data) => {
            this.studentEdit = this.studentEdit.filter((students) => students.id != lectId);
            Swal.fire(`Success", "${this.studentEdit.fullName} Deleted", success`);
          },
          (error) => {
            Swal.fire("Error", "Student could not be deleted", "error");
          }
        );
      }
    })
  }


}
