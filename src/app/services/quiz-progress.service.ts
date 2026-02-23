import baseUrl from './helper';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError,of, } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface QuizAnswerRequest {
  questionId: number;
  option: string;
  checked: boolean;
  quizId?: number;
}

export interface QuizAnswerResponse {
  questionId: number;
  selectedOptions: string[];
}

export interface UserQuizAnswersResponse {
  answers: { [key: number]: string[] };
}


export interface QuizTimerResponse {
  remainingTime: number;
  updatedAt: string;
}

export interface QuizTimerRequest {
  remainingTime: number;
}

export interface ViolationTimerRequest{
  remainingDelayTime:number;
}

export interface ViolationTimerResponse {
  remainingTime: number;
  updatedAt: string;
}


@Injectable({
  providedIn: 'root'
})
export class QuizProgressService {


  constructor(private http: HttpClient) { }

  updateAnswer(request: QuizAnswerRequest): Observable<QuizAnswerResponse> {
    return this.http.post<QuizAnswerResponse>(`${baseUrl}/quiz-progress/update`, request
    );
  }

  getAllAnswers(): Observable<UserQuizAnswersResponse> {
    return this.http.get<UserQuizAnswersResponse>(`${baseUrl}/quiz-progress/all`
    );
  }

  getAnswersByQuiz(quizId: number): Observable<UserQuizAnswersResponse> {
    return this.http.get<UserQuizAnswersResponse>(`${baseUrl}/quiz-progress/quiz/${quizId}`
    );
  }

  clearQuizAnswers(quizId: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/quiz-progress/quiz/${quizId}`
    );
  }


  clearAllUserAnswers(): Observable<any> {
    return this.http.delete(`${baseUrl}/quiz-progress/clear-all`
    );
  }









  // BELOW CODE IS FOR THEORY

  saveAnswers(quizId: number, answers: any[]): Observable<any> {
    return this.http.post(`${baseUrl}/theory-progress/save/${quizId}`, answers,
      {
        withCredentials: true,
      },
    );
  }

  loadAnswers(quizId: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/theory-progress/load/${quizId}`
    );
  }

  clearAnswers(quizId: number): Observable<any> {
    return this.http.delete(`${baseUrl}/theory-progress/clear/${quizId}`
    );
  }







//   // TIMER FOR THE QUIZ_STORAGE_KEY
//  getQuizTimer(quizId: number): Observable<QuizTimerResponse | null> {
//     return this.http.get<QuizTimerResponse>(`${baseUrl}/quiz-timer/getRemainingTime/${quizId}`,
//         {
//         withCredentials: true
//       }
//     )
//       .pipe(
//         catchError(error => {
//           if (error.status === 404) {
//             // No timer found, return null
//             return [null];
//           }
//           console.error('Error fetching quiz timer:', error);
//           return throwError(() => error);
//         })
//       );
//   }


//    saveQuizTimer(quizId: number, remainingTime: number): Observable<QuizTimerResponse> {
//     const request: QuizTimerRequest = { remainingTime };
//     return this.http.post<QuizTimerResponse>(`${baseUrl}/quiz-timer/saveRemainingTime/${quizId}`,request,
//         {
//         withCredentials: true
//       }
//     )
//       .pipe(
//         catchError(error => {
//           console.error('Error saving quiz timer:', error);
//           return throwError(() => error);
//         })
//       );
//   }


//    deleteQuizTimer(quizId: number): Observable<void> {
//     return this.http.delete<void>(`${baseUrl}/quiz-timer/deleteRemainingTime/${quizId}`,
//         {
//         withCredentials: true
//       }
//     )
//       .pipe(
//         catchError(error => {
//           console.error('Error deleting quiz timer:', error);
//           return throwError(() => error);
//         })
//       );
//   }

// import { of, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';


// GET TIMER
getQuizTimer(quizId: number): Observable<QuizTimerResponse | null> {
    const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.jwtToken}` // Add this!
  });
  return this.http
    .get<QuizTimerResponse>(`${baseUrl}/quiz-timer/getRemainingTime/${quizId}`,{headers})
    .pipe(
      catchError(error => {
        if (error.status === 404) {
          // 404 is valid business logic: no timer saved yet
          return of(null);
        }
        console.error('Error fetching quiz timer:', error);
        return throwError(() => error);
      })
    );
}

// private jwtToken = localStorage.getItem('token')

// To this:
private get jwtToken(): string {
  return localStorage.getItem('token') || '';
}
// SAVE TIMER
saveQuizTimer(quizId: number, remainingTime: number): Observable<QuizTimerResponse> {
  const request: QuizTimerRequest = { remainingTime };
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.jwtToken}` // Add this!
  });
  return this.http
    .post<QuizTimerResponse>(
      `${baseUrl}/quiz-timer/saveRemainingTime/${quizId}`,
      request,{headers}
    )
    .pipe(
      catchError(error => {
        console.error('Error saving quiz timer:', error);
        return throwError(() => error);
      })
    );
}


// DELETE TIMER
deleteQuizTimer(quizId: number): Observable<void> {
      const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.jwtToken}` // Add this!
  });
  return this.http
    .delete<void>(`${baseUrl}/quiz-timer/deleteRemainingTime/${quizId}`,{headers})
    .pipe(
      catchError(error => {
        console.error('Error deleting quiz timer:', error);
        return throwError(() => error);
      })
    );
}




saveViolatioDelay(quizId: number, remainingDelayTime: number): Observable<ViolationTimerRequest> {
  const request: ViolationTimerRequest = { remainingDelayTime };
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.jwtToken}` // Add this!
  });
  return this.http
    .post<ViolationTimerRequest>(
      `${baseUrl}/quiz-timer/saveViolation-delay/${quizId}`,
      request,{headers}
    )
    .pipe(
      catchError(error => {
        console.error('Error saving quiz timer:', error);
        return throwError(() => error);
      })
    );
}




getViolatioDelay(quizId: number): Observable<ViolationTimerResponse | null> {
    const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.jwtToken}` // Add this!
  });
  return this.http
    .get<ViolationTimerResponse>(`${baseUrl}/quiz-timer/getViolation-delay/${quizId}`,{headers})
    .pipe(
      catchError(error => {
        if (error.status === 404) {
          // 404 is valid business logic: no timer saved yet
          return of(null);
        }
        console.error('Error fetching quiz timer:', error);
        return throwError(() => error);
      })
    );
}



}
