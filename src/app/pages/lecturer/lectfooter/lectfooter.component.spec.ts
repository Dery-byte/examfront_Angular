import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectfooterComponent } from './lectfooter.component';

describe('LectfooterComponent', () => {
  let component: LectfooterComponent;
  let fixture: ComponentFixture<LectfooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LectfooterComponent]
    });
    fixture = TestBed.createComponent(LectfooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
