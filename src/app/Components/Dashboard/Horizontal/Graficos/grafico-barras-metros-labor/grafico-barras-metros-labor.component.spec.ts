import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoBarrasMetrosLaborComponent } from './grafico-barras-metros-labor.component';

describe('GraficoBarrasMetrosLaborComponent', () => {
  let component: GraficoBarrasMetrosLaborComponent;
  let fixture: ComponentFixture<GraficoBarrasMetrosLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoBarrasMetrosLaborComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoBarrasMetrosLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
