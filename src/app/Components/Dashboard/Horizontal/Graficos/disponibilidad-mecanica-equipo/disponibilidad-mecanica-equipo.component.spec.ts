import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisponibilidadMecanicaEquipoComponent } from './disponibilidad-mecanica-equipo.component';

describe('DisponibilidadMecanicaEquipoComponent', () => {
  let component: DisponibilidadMecanicaEquipoComponent;
  let fixture: ComponentFixture<DisponibilidadMecanicaEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibilidadMecanicaEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisponibilidadMecanicaEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
