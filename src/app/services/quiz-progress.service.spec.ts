import { TestBed } from '@angular/core/testing';

import { QuizProgressService } from './quiz-progress.service';

describe('QuizProgressService', () => {
  let service: QuizProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
