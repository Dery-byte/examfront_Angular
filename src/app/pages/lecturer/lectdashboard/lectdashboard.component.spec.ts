import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectdashboardComponent } from './lectdashboard.component';

describe('LectdashboardComponent', () => {
  let component: LectdashboardComponent;
  let fixture: ComponentFixture<LectdashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LectdashboardComponent]
    });
    fixture = TestBed.createComponent(LectdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
