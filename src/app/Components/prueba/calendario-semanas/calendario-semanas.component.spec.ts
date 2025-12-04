import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioSemanasComponent } from './calendario-semanas.component';

describe('CalendarioSemanasComponent', () => {
  let component: CalendarioSemanasComponent;
  let fixture: ComponentFixture<CalendarioSemanasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioSemanasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarioSemanasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
