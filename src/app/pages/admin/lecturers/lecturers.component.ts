import { Component, TemplateRef, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';



interface Lecturer {
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

interface LecturerResponse {
  count: number;
  lecturers: Lecturer[];
}

@Component({
  selector: 'app-lecturers',
  templateUrl: './lecturers.component.html',
  styleUrls: ['./lecturers.component.css']
})
export class LecturersComponent {

  // lecturers = [];


   lecturers: Lecturer[] = [];
  // students: any[] = [];
  filteredLecturers: any[] = [];
  searchText: string = '';
  lecturersEdit;
  lectuersTotal = 0;
  lecturerForm: FormGroup;





  constructor(
    private _category: CategoryService,
    private _snack: MatSnackBar,
    public dialog: MatDialog,
    private login: LoginService,
    private userService: UserService,
    private fb: FormBuilder,
  ) {
    this.lecturerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      phone: [''],
      password: ['', Validators.required],
    });
  }

  dialogRef!: MatDialogRef<any>;

  //  onSubmit() {
  //   if (this.lecturerForm.valid) {
  //     console.log(this.lecturerForm.value);
  //     this.dialogRef.close(this.lecturerForm.value);
  //   }
  // }


  openAddLecturerDialog(templateRef: any) {
    const dialogRef = this.dialog.open(templateRef, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.lecturerForm.reset();
    });
  }




  onSubmit() {
    if (this.lecturerForm.valid) {
      const lecturerData = this.lecturerForm.value;
      // Call the service to register lecturer
      this.userService.registerLecturer(lecturerData).subscribe(
        (data) => {
          // Success snackbar
          this._snack.open(`${lecturerData.firstname} has been added`, '', {
            duration: 3000,
          });
          // Close the dialog
          this.dialog.closeAll();
          // Refresh the lecturer list
          this.fetchLecturers(); // make sure this is a method
        },
        (error) => {
          // Error snackbar
          this._snack.open(`Failed to add ${lecturerData.firstname}`, '', {
            duration: 3000,
          });
          console.error('Error adding lecturer:', error);
        }
      );
    }
  }




  ngOnInit(): void {
    this.fetchLecturers();
  }


  // getAllLecturerss() {
  //   this._category.getAllLecturers().subscribe((data: any) => {
  //     this.lecturers = data;
  //     this.filteredLecturers = [...this.lecturers]; // Display ALL lecturers initially
  //     console.log('Loaded lecturers:', this.lecturers.length);
  //     console.log(this.lecturers);
  //   },
  //     (error) => {
  //       this._snack.open("You're Session has expired! ", "", {
  //         duration: 3000,
  //       });
  //       this.login.logout();
  //       // console.log(error);
  //       // Swal.fire('Error !! ', 'Error in loading data', 'error');
  //     }
  //   );
  // }


  fetchLecturers() {
    this.userService.allLecturer().subscribe({
      next: (response: LecturerResponse) => {
        // The API returns { count: 18, students: [...] }
        // So extract the students array:
        this.lecturers = response.lecturers;  // <-- Important!
        this.lectuersTotal = response.count;
        this.filteredLecturers = this.lecturers;
      },
      error: (err) => {
        console.error('Error fetching lecturers', err);
      }
    });
  }


  applyFilter() {
    if (!this.searchText) {
      this.filteredLecturers = this.lecturers;
    } else {
      const search = this.searchText.toLowerCase();
      this.filteredLecturers = this.lecturers.filter(student =>
        student.fullName.toLowerCase().includes(search) ||
        student.username.toLowerCase().includes(search)
      );
    }
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








  updateLecturer() {
    console.log('categoryEdit:', this.lecturersEdit);
    console.log('lecturersEdit.id:', this.lecturersEdit.id);
    this._category.updateLecturer(this.lecturersEdit.id, this.lecturersEdit).subscribe((data) => {
      this._snack.open("This Lecturer is Updated Successfully! ", "", {
        duration: 3000,
      });
      this.dialogRef.close(this.lecturersEdit);
      this.ngOnInit();
    },
      (error) => {
        this._snack.open("This Lecturer couldn't be updated", "", {
          duration: 3000,
        });
      });
  }



  deleteLecturer(lectId) {
    Swal.fire({
      icon: "info",
      title: "Are you sure of this ?",
      confirmButtonText: "Delete",
      showCancelButton: true,
    }).then((results) => {
      if (results.isConfirmed) {
        //delete
        this._category.deleteLecturer(lectId).subscribe(
          (data) => {
            this.lecturersEdit = this.lecturersEdit.filter((lecturers) => lecturers.id != lectId);
            Swal.fire(`Success", "${this.lecturersEdit.fullName} Deleted", success`);
          },
          (error) => {
            Swal.fire("Error", "Lecturer could not be deleted", "error");
          }
        );
      }
    })
  }

}
