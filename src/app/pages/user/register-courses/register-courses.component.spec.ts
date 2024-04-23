import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCoursesComponent } from './register-courses.component';

describe('RegisterCoursesComponent', () => {
  let component: RegisterCoursesComponent;
  let fixture: ComponentFixture<RegisterCoursesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterCoursesComponent]
    });
    fixture = TestBed.createComponent(RegisterCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
