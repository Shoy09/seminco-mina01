import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoEstadosComponent } from './grafico-estados.component';

describe('GraficoEstadosComponent', () => {
  let component: GraficoEstadosComponent;
  let fixture: ComponentFixture<GraficoEstadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoEstadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoEstadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
