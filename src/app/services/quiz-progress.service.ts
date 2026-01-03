import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baseUrl from './helper';

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

@Injectable({
  providedIn: 'root'
})
export class QuizProgressService {


  constructor(private http: HttpClient) {}

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
}
