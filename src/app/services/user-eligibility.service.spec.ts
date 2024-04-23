import { TestBed } from '@angular/core/testing';

import { UserEligibilityService } from './user-eligibility.service';

describe('UserEligibilityService', () => {
  let service: UserEligibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserEligibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
