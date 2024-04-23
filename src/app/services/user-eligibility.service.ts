// user-eligibility.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserEligibilityService {
  constructor() { }

  isUserEligible(idNumberReport: number[], currentUserId: number, reportQuizId: number, currentQuizId: number): boolean {
    return idNumberReport.length > 0 && idNumberReport[0] == currentUserId && reportQuizId == currentQuizId;
  }
}
