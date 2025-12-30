import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrlCategory from './categoryHelper';
import baseUrl from './helper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  //load all categories
  // public getCategories(): Observable<any> {
  //   return this.http.get(`${baseUrl}/getCategories`);
  //   }

  public getCategories() {
    return this.http.get(`${baseUrl}/getCategories`, {
      withCredentials: true
    });
  }





  // Categories for a USER
  public getCategoriesForUser() {
    return this.http.get(`${baseUrl}/categoriesForUser`, {
      withCredentials: true
    });
  }




  //add new category
  public addCategory(category) {
    return this.http.post(`${baseUrl}/add`, category, {
      withCredentials: true
    });
  }

  //add new category then USER
  public addCategoryAndUser(category) {
    return this.http.post(`${baseUrl}/user/addCategory`, category, {
      withCredentials: true
    });
  }



  // Fetch a single category by ID
  public getCategory(cId) {
    return this.http.get(`${baseUrl}/category/${cId}`,
      {
        withCredentials: true

      }
    );
  }



  // Fetch a single category by ID
  public getAllLecturers() {
    return this.http.get(`${baseUrl}/all/lecturers`,
      {
        withCredentials: true

      }
    );
  }


    // Fetch a single category by ID
  public getLecturerById(lecturerId) {
    return this.http.get(`${baseUrl}/lecturerbyId/${lecturerId}`,
      {
        withCredentials: true
      }
    );
  }

    // Fetch a single category by ID
  public getAllStudent() {
    return this.http.get(`${baseUrl}/all/students`,
      {
        withCredentials: true

      }
    );
  }



  // In your category service file
  assignCourseToLecturer(courseId: number, lecturerId: number): Observable<any> {
    return this.http.put(`${baseUrl}/courses/${courseId}/assign/${lecturerId}`, {}, {
      withCredentials: true
    });
  }


  //update category
  public updateCategory(category) {
    return this.http.put(`${baseUrl}/category/updateCategory`, category,
      {
        withCredentials: true
      }
    );
  }


 
  // Update category
  public adminUpdateCategory(cId:number, category: any): Observable<any> {
    return this.http.put(
      `${baseUrl}/category/admin/updateCategory/${cId}`,
      category,
      { withCredentials: true }
    );
  }


  //delete category
  public deleteCategory(cId) {
    return this.http.delete(`${baseUrl}/category/${cId}`, {
      withCredentials: true

    });

  }


  // ===================================THIS IS WHERE IT STARTS ======================================================



  getUniqueCategoriesAndQuizzes(): Observable<any[]> {
    return this.getCategories().pipe(
      map((quizzes: any) => this.extractCategoriesAndQuizzes(quizzes))
    );
  }



  private extractCategoriesAndQuizzes(quizzes: any[]): any[] {
    const result = [];
    quizzes.forEach((quiz) => {
      const categoryId = quiz.quiz.category.cid;
      // Find the category index in the result array
      const categoryIndex = result.findIndex((c) => c.cid === categoryId);
      if (categoryIndex === -1) {
        // Category not found, add a new category
        const category = {
          cid: categoryId,
          title: quiz.quiz.category.title,
          quizTitles: [
            {
              qId: quiz.quiz.qId,
              title: quiz.quiz.title,
            },
          ],
        };

        result.push(category);
      } else {
        // Category found, check if the quiz title is unique
        const existingQuizIndex = result[categoryIndex].quizTitles.findIndex(
          (q) => q.qId === quiz.quiz.qId
        );

        if (existingQuizIndex === -1) {
          // Quiz title is unique, add it to the existing category
          result[categoryIndex].quizTitles.push({
            qId: quiz.quiz.qId,
            title: quiz.quiz.title,
          });
        }
      }
    });

    return result;
  }











}
