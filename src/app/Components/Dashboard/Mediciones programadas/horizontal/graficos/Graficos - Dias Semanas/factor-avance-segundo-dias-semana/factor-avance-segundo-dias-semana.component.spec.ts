import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorAvanceSegundoDiasSemanaComponent } from './factor-avance-segundo-dias-semana.component';

describe('FactorAvanceSegundoDiasSemanaComponent', () => {
  let component: FactorAvanceSegundoDiasSemanaComponent;
  let fixture: ComponentFixture<FactorAvanceSegundoDiasSemanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactorAvanceSegundoDiasSemanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactorAvanceSegundoDiasSemanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
