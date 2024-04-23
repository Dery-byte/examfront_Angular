import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesRegisteredComponent } from './courses-registered.component';

describe('CoursesRegisteredComponent', () => {
  let component: CoursesRegisteredComponent;
  let fixture: ComponentFixture<CoursesRegisteredComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoursesRegisteredComponent]
    });
    fixture = TestBed.createComponent(CoursesRegisteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
