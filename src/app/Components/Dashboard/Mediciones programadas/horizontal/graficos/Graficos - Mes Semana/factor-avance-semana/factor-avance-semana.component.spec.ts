import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorAvanceSemanaComponent } from './factor-avance-semana.component';

describe('FactorAvanceSemanaComponent', () => {
  let component: FactorAvanceSemanaComponent;
  let fixture: ComponentFixture<FactorAvanceSemanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactorAvanceSemanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactorAvanceSemanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
