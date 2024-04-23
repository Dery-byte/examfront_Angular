import { TestBed } from '@angular/core/testing';

import { RegCoursesService } from './reg-courses.service';

describe('RegCoursesService', () => {
  let service: RegCoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegCoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
