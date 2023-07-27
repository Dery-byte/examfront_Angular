import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintQuizComponent } from './print-quiz.component';

describe('PrintQuizComponent', () => {
  let component: PrintQuizComponent;
  let fixture: ComponentFixture<PrintQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintQuizComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
