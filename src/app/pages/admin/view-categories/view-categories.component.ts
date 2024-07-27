import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-view-categories',
  templateUrl: './view-categories.component.html',
  styleUrls: ['./view-categories.component.css']
})
export class ViewCategoriesComponent implements OnInit {

  categories =[];

  constructor(private _category: CategoryService){ }
  ngOnInit(): void{
this._category.getCategories().subscribe((data: any)=>{
  this.categories = data;
  console.log(this.categories);
},
(error)=>{
  console.log(error);
  Swal.fire('Error !! ', 'Error in loading data', 'error');
}  
);
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
