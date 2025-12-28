import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectwelcomeComponent } from './lectwelcome.component';

describe('LectwelcomeComponent', () => {
  let component: LectwelcomeComponent;
  let fixture: ComponentFixture<LectwelcomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LectwelcomeComponent]
    });
    fixture = TestBed.createComponent(LectwelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
