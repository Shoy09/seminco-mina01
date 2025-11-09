import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilizacionEquipoComponent } from './utilizacion-equipo.component';

describe('UtilizacionEquipoComponent', () => {
  let component: UtilizacionEquipoComponent;
  let fixture: ComponentFixture<UtilizacionEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilizacionEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilizacionEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
