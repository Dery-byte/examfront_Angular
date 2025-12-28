import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectaddQuizComponent } from './lectadd-quiz.component';

describe('LectaddQuizComponent', () => {
  let component: LectaddQuizComponent;
  let fixture: ComponentFixture<LectaddQuizComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LectaddQuizComponent]
    });
    fixture = TestBed.createComponent(LectaddQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
