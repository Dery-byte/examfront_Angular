import baseUrl from './helper';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class QuizProgressService {


  constructor(private http: HttpClient) { }

  updateAnswer(request: QuizAnswerRequest): Observable<QuizAnswerResponse> {
    return this.http.post<QuizAnswerResponse>(`${baseUrl}/quiz-progress/update`, request,
      {
        withCredentials: true
      }
    );
  }

  getAllAnswers(): Observable<UserQuizAnswersResponse> {
    return this.http.get<UserQuizAnswersResponse>(`${baseUrl}/quiz-progress/all`,
      {
        withCredentials: true
      }
    );
  }

  getAnswersByQuiz(quizId: number): Observable<UserQuizAnswersResponse> {
    return this.http.get<UserQuizAnswersResponse>(`${baseUrl}/quiz-progress/quiz/${quizId}`,
      {
        withCredentials: true
      }
    );
  }

  clearQuizAnswers(quizId: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/quiz-progress/quiz/${quizId}`,
      {
        withCredentials: true
      }
    );
  }


  clearAllUserAnswers(): Observable<any> {
    return this.http.delete(`${baseUrl}/quiz-progress/clear-all`,
      {
        withCredentials: true
      }
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
    return this.http.get<any[]>(`${baseUrl}/theory-progress/load/${quizId}`,
      {
        withCredentials: true
      }
    );
  }

  clearAnswers(quizId: number): Observable<any> {
    return this.http.delete(`${baseUrl}/theory-progress/clear/${quizId}`,
      {
        withCredentials: true
      }
    );
  }







  // TIMER FOR THE QUIZ_STORAGE_KEY
 getQuizTimer(quizId: number): Observable<QuizTimerResponse | null> {
    return this.http.get<QuizTimerResponse>(`${baseUrl}/quiz-timer/getRemainingTime/${quizId}`,
        {
        withCredentials: true
      }
    )
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            // No timer found, return null
            return [null];
          }
          console.error('Error fetching quiz timer:', error);
          return throwError(() => error);
        })
      );
  }


   saveQuizTimer(quizId: number, remainingTime: number): Observable<QuizTimerResponse> {
    const request: QuizTimerRequest = { remainingTime };
    return this.http.post<QuizTimerResponse>(`${baseUrl}/quiz-timer/saveRemainingTime/${quizId}`,request,
        {
        withCredentials: true
      }
    )
      .pipe(
        catchError(error => {
          console.error('Error saving quiz timer:', error);
          return throwError(() => error);
        })
      );
  }


   deleteQuizTimer(quizId: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/quiz-timer/deleteRemainingTime/${quizId}`,
        {
        withCredentials: true
      }
    )
      .pipe(
        catchError(error => {
          console.error('Error deleting quiz timer:', error);
          return throwError(() => error);
        })
      );
  }






}
