import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisponibilidadMecanicaGeneralComponent } from './disponibilidad-mecanica-general.component';

describe('DisponibilidadMecanicaGeneralComponent', () => {
  let component: DisponibilidadMecanicaGeneralComponent;
  let fixture: ComponentFixture<DisponibilidadMecanicaGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibilidadMecanicaGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisponibilidadMecanicaGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
