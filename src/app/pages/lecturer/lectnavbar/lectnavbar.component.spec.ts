import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectnavbarComponent } from './lectnavbar.component';

describe('LectnavbarComponent', () => {
  let component: LectnavbarComponent;
  let fixture: ComponentFixture<LectnavbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LectnavbarComponent]
    });
    fixture = TestBed.createComponent(LectnavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
