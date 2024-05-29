import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {

  selectedLevel: string;

  category = {
    title: "",
    courseCode: "",
    description: "",
    level:"",
  }
  constructor(private categorys: CategoryService, private _snack: MatSnackBar) {
    this.selectedLevel = 'Level 100'; // Initial value

  }
  ngOnInit(): void {
  }

  formSubmit() {

    if (this.category.title.trim() == "" || this.category.title == null) {
      this._snack.open("Title required", "",
        { duration: 3000 })
      return;
    }

    //add cate

    this.categorys.addCategory(this.category).subscribe(
      (data: any) => {
        this.category.title = '',
          this.category.courseCode = '',
          this.category.description = '',
          this.category.level='',
          Swal.fire("Success !! ", "Course added sucessfully", "success")
      },
      (error) => {
        console.log(error);
        Swal.fire("Error !! ", "Could not add course", "error");
      }
    );

  }
}
