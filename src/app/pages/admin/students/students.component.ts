import { Component, TemplateRef, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  phone: string;
  fullName: string;
  role: string;
  enabled: boolean;
  // add other properties as needed
}

interface StudentResponse {
  count: number;
  students: Student[];
}


@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent {
  // students = [];
  students: Student[] = [];
  filteredStudents: Student[] = [];
  studentss = [];
  studentTotal = 0;
  searchText: string = '';
  studentEdit;





  constructor(
    private _category: CategoryService,
    private _snack: MatSnackBar,
    public dialog: MatDialog,
    private login: LoginService,
    private userService: UserService
  ) { }

  dialogRef!: MatDialogRef<any>;

  ngOnInit(): void {
    // this.getAllStudents();
    this.fetchStudents();
  }


  fetchStudents() {
    this.userService.allStudentss().subscribe({
      next: (response: StudentResponse) => {
        // The API returns { count: 18, students: [...] }
        // So extract the students array:
        this.students = response.students;  // <-- Important!
        this.studentTotal = response.count;
        this.filteredStudents = this.students;
      },
      error: (err) => {
        console.error('Error fetching students', err);
      }
    });
  }


  applyFilter() {
    if (!this.searchText) {
      this.filteredStudents = this.students;
    } else {
      const search = this.searchText.toLowerCase();
      this.filteredStudents = this.students.filter(student =>
        student.fullName.toLowerCase().includes(search) ||
        student.username.toLowerCase().includes(search)
      );
    }
  }


  clearSearch() {
    this.searchText = '';
    this.filteredStudents = this.students;
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
