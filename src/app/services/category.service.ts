import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrlCategory from './categoryHelper';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }
  
  //load all categories
  public getCategories(){
    return this.http.get(`${baseUrl}/getCategories`);
    }
    //add new category
    public addCategory(category){
      return this.http.post(`${baseUrl}/add`, category);
    }
    // Fetch a single category by ID
    public getCategory(cId){
      return this.http.get(`${baseUrl}/category/${cId}`);
    }
    //update category
public updateCategory(category){
  return this.http.put(`${baseUrl}/category/updateCategory`, category);
  }

  //delete category
  public deleteCategory(cId){
    return this.http.delete(`${baseUrl}/category/${cId}`);
    
    }

}
