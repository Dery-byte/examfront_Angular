import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-update-category',
  templateUrl: './update-category.component.html',
  styleUrls: ['./update-category.component.css']
})
export class UpdateCategoryComponent implements OnInit{


  constructor(private _route : ActivatedRoute, 
    private _quizz:QuizService, 
    private _category : CategoryService,
    private _router:Router){}

  cId = 0;
  quiz;
  category;
  ngOnInit(): void {
   
    this.cId = this._route.snapshot.params['cid'];
    // alert(this.qId);
    this._category.getCategory(this.cId).subscribe((data)=>
    {
      this.category=data;
      console.log(this.category);
    },
    (error)=>
    {
      console.log(error);
    });
    
    
    // this._category.getCategories().subscribe((data)=>
    // {
    //   this.categories = data;
    // },
    // (error)=>
    // {
    //   alert("error loading Categories");
    // }
}


public updateCategoryData(){

  this._category.updateCategory(this.category).subscribe((data)=>
  {
    Swal.fire("Success ", "Category Updated Succesfully","success").then((e)=>
    {
      this._router.navigate(["/admin/categories"]);
    });
  },
  (error)=>{
    Swal.fire("Error", "Category Could not be updated", "error");

  });
}
}
