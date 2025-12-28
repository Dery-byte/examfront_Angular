import { Component, TemplateRef, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LoginService } from 'src/app/services/login.service';
@Component({
  selector: 'app-view-course',
  templateUrl: './view-course.component.html',
  styleUrls: ['./view-course.component.css']
})
export class ViewCourseComponent {



  categories = [];
  category;
  categoryEdit;




  constructor(
    private _category: CategoryService,
    private _snack: MatSnackBar,
    public dialog: MatDialog,
    private login: LoginService,
  ) { }

  dialogRef!: MatDialogRef<any>;

  ngOnInit(): void {
    this._category.getCategoriesForUser().subscribe((data: any) => {
      this.categories = data;
      console.log(this.categories);
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


  // UPDATE THE CATEGORY
  getQuesObj(categoryId: any): any {
    return this._category.getCategory(categoryId);
  }







  // openUpdateObjDialog(catId: any, templateRef: TemplateRef<any>): void {
  //   console.log(catId);
  //   this.category = this.getQuesObj(catId).subscribe((data) => {
  //     this.categoryEdit = data;
  //     console.log(this.categoryEdit);
  //     this.dialogRef = this.dialog.open(templateRef, {
  //       width: '650px',
  //       data: this.categoryEdit,
  //     })
  //   });
  //   this.dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.categoryEdit = result;
  //     }
  //   });
  // }



  openUpdateObjDialog(catId: any, templateRef: TemplateRef<any>): void {
  console.log('Category ID:', catId);
  
  this.getQuesObj(catId).subscribe((data) => {
    this.categoryEdit = data;
    console.log('Category data loaded:', this.categoryEdit);
    
    // Open dialog after data is loaded
    this.dialogRef = this.dialog.open(templateRef, {
      width: '650px',
      data: this.categoryEdit,
    });
    
    // Handle dialog close AFTER it's opened
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog closed with result:', result);
        this.categoryEdit = result;
        // Optionally refresh your data
        this.ngOnInit();
      }
    });
  }, error => {
    console.error('Error loading category:', error);
    this._snack.open("Error loading category data", "", {
      duration: 3000,
    });
  });
}


  // public updateCategoryData(){
  //   this._category.updateCategory(this.categoryEdit).subscribe((data)=>
  //   {
  //     this._snack.open("This Course is Updated Successfully! ", "", {
  //       duration: 3000,
  //     });
  //     this.dialogRef.close(this.categoryEdit);
  //     this.ngOnInit();
  //   },
  //     (error) => {
  //       this._snack.open("This question couldn't be updated", "", {
  //         duration: 3000,
  //       });
  //     });
  // }



  // // Update category
  // public updateCategoryData() {
  //   // Make sure categoryEdit has an id
  //   if (!this.categoryEdit.id) {
  //     this._snack.open("Category ID is missing", "", {
  //       duration: 3000,
  //     });
  //     return;
  //   }
  //   // Create a clean object with only the fields needed for update
  //   const updateRequest = {
  //     id: this.categoryEdit.id,
  //     courseCode: this.categoryEdit.courseCode,
  //     level: this.categoryEdit.level,
  //     title: this.categoryEdit.title,
  //     description: this.categoryEdit.description
  //     // Don't include 'user' field
  //   };

  //   console.log(updateRequest);

  //   this._category.updateCategory(updateRequest).subscribe(
  //     (data) => {
  //       this._snack.open("This Course is Updated Successfully!", "", {
  //         duration: 3000,
  //       });
  //       this.dialogRef.close(data); // Close with updated data
  //       this.ngOnInit();
  //     },
  //     (error) => {
  //       this._snack.open("This question couldn't be updated", "", {
  //         duration: 3000,
  //       });
  //     }
  //   );
  // }



  public updateCategoryData() {
  console.log('categoryEdit before update:', this.categoryEdit);
  
  // Check if ID exists (check both 'cid' and 'id' just to be sure)
  const categoryId = this.categoryEdit.cid || this.categoryEdit.id;
  
  if (!categoryId) {
    console.error('No ID found in categoryEdit:', this.categoryEdit);
    this._snack.open("Category ID is missing", "", {
      duration: 3000,
    });
    return;
  }

  // Create update request - map to backend expected format
  const updateRequest = {
    id: categoryId,                          // Backend expects 'id'
    title: this.categoryEdit.title,
    description: this.categoryEdit.description,
    courseCode: this.categoryEdit.courseCode,
    level: this.categoryEdit.level
  };

  console.log('Sending update request:', updateRequest);

  this._category.updateCategory(updateRequest).subscribe(
    (data) => {
      console.log('Update successful:', data);
      this._snack.open("This Course is Updated Successfully!", "", {
        duration: 3000,
      });
      this.dialogRef.close(data); // Pass updated data back
    },
    (error) => {
      console.error('Update error:', error);
      this._snack.open("This course couldn't be updated", "", {
        duration: 3000,
      });
    }
  );
}



  deleteCategor(cId) {
    Swal.fire({
      icon: "info",
      title: "Are you sure of this ?",
      confirmButtonText: "Delete",
      showCancelButton: true,
    }).then((results) => {
      if (results.isConfirmed) {
        //delete

        this._category.deleteCategory(cId).subscribe(
          (data) => {
            this.categories = this.categories.filter((category) => category.cId != cId);

            Swal.fire("Success", "Course Deleted", "success");
          },
          (error) => {
            Swal.fire("Error", "Course could not be deleted", "error");

          }
        );
      }
    })
  }




}


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

/**
 * @title Basic use of `<table mat-table>`
 */

export class TableBasicExample {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
}

