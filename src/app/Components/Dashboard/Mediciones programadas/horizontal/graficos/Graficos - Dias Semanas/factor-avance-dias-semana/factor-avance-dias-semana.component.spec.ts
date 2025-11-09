import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorAvanceDiasSemanaComponent } from './factor-avance-dias-semana.component';

describe('FactorAvanceDiasSemanaComponent', () => {
  let component: FactorAvanceDiasSemanaComponent;
  let fixture: ComponentFixture<FactorAvanceDiasSemanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactorAvanceDiasSemanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactorAvanceDiasSemanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
