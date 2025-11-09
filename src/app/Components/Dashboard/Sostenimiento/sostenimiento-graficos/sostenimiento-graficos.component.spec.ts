import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SostenimientoGraficosComponent } from './sostenimiento-graficos.component';

describe('SostenimientoGraficosComponent', () => {
  let component: SostenimientoGraficosComponent;
  let fixture: ComponentFixture<SostenimientoGraficosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SostenimientoGraficosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SostenimientoGraficosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
