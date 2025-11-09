import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoBarrasAgrupadaNumLaborComponent } from './grafico-barras-agrupada-num-labor.component';

describe('GraficoBarrasAgrupadaNumLaborComponent', () => {
  let component: GraficoBarrasAgrupadaNumLaborComponent;
  let fixture: ComponentFixture<GraficoBarrasAgrupadaNumLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoBarrasAgrupadaNumLaborComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoBarrasAgrupadaNumLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
