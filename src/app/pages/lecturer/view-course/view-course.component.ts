import { Component,TemplateRef, OnInit } from '@angular/core';
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



    categories =[];
    category;
    categoryEdit;
  
  
  
  
    constructor(
      private _category: CategoryService,
      private _snack: MatSnackBar,
      public dialog: MatDialog,
      private login: LoginService,
    ){ }
  
    dialogRef!: MatDialogRef<any>;
  
    ngOnInit(): void{
  this._category.getCategories().subscribe((data: any)=>{
    this.categories = data;
    console.log(this.categories);
  },
  (error)=>{
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
  
  
    openUpdateObjDialog(catId: any, templateRef: TemplateRef<any>): void {
      console.log(catId);
      // Fetch question details based on ID
      this.category = this.getQuesObj(catId).subscribe((data) => {
        // console.log(this.category);
        this.categoryEdit = data;
        console.log(this.categoryEdit);
        this.dialogRef = this.dialog.open(templateRef, {
          width: '650px',
          data: this.categoryEdit,
        })
      });
      this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.categoryEdit = result;
        }
      });
    }
  
  
  
    public updateCategoryData(){
  
      this._category.updateCategory(this.categoryEdit).subscribe((data)=>
      {
        this._snack.open("This Course is Updated Successfully! ", "", {
          duration: 3000,
        });
        this.dialogRef.close(this.categoryEdit);
        this.ngOnInit();
      },
        (error) => {
          this._snack.open("This question couldn't be updated", "", {
            duration: 3000,
          });
        });
  
  
    }
  
    
  
    deleteCategor(cId){
      Swal.fire({ 
       icon:"info",
       title:"Are you sure of this ?",
       confirmButtonText:"Delete",
       showCancelButton:true,
      }).then((results)=>{
       if(results.isConfirmed){
    //delete
   
    this._category.deleteCategory(cId).subscribe(
     (data)=>{
   this.categories = this.categories.filter((category)=> category.cId != cId);
   
       Swal.fire("Success", "Course Deleted", "success");
     },
     (error)=>
     {
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
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
    {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
    {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
    {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  ];
  
  /**
   * @title Basic use of `<table mat-table>`
   */
  
  export class TableBasicExample {
    displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
    dataSource = ELEMENT_DATA;
  }
  
