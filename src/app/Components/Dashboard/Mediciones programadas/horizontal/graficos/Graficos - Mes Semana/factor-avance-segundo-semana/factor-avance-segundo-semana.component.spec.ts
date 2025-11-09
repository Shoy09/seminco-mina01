import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorAvanceSegundoSemanaComponent } from './factor-avance-segundo-semana.component';

describe('FactorAvanceSegundoSemanaComponent', () => {
  let component: FactorAvanceSegundoSemanaComponent;
  let fixture: ComponentFixture<FactorAvanceSegundoSemanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactorAvanceSegundoSemanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactorAvanceSegundoSemanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
