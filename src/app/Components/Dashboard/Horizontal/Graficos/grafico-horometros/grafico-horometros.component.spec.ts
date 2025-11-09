import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoHorometrosComponent } from './grafico-horometros.component';

describe('GraficoHorometrosComponent', () => {
  let component: GraficoHorometrosComponent;
  let fixture: ComponentFixture<GraficoHorometrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoHorometrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoHorometrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
