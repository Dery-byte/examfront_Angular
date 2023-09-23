import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetpopupComponent } from './resetpopup.component';

describe('ResetpopupComponent', () => {
  let component: ResetpopupComponent;
  let fixture: ComponentFixture<ResetpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetpopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
