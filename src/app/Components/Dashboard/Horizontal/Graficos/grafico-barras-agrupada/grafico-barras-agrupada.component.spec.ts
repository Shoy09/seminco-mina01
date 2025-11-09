import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoBarrasAgrupadaComponent } from './grafico-barras-agrupada.component';

describe('GraficoBarrasAgrupadaComponent', () => {
  let component: GraficoBarrasAgrupadaComponent;
  let fixture: ComponentFixture<GraficoBarrasAgrupadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoBarrasAgrupadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoBarrasAgrupadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
