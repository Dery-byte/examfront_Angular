import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectviewQuizzesComponent } from './lectview-quizzes.component';

describe('LectviewQuizzesComponent', () => {
  let component: LectviewQuizzesComponent;
  let fixture: ComponentFixture<LectviewQuizzesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LectviewQuizzesComponent]
    });
    fixture = TestBed.createComponent(LectviewQuizzesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
