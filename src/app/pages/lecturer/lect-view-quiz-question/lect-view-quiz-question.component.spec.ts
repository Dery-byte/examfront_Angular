import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectViewQuizQuestionComponent } from './lect-view-quiz-question.component';

describe('LectViewQuizQuestionComponent', () => {
  let component: LectViewQuizQuestionComponent;
  let fixture: ComponentFixture<LectViewQuizQuestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LectViewQuizQuestionComponent]
    });
    fixture = TestBed.createComponent(LectViewQuizQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
