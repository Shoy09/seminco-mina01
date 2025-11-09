import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoDePerforacionesComponent } from './rendimiento-de-perforaciones.component';

describe('RendimientoDePerforacionesComponent', () => {
  let component: RendimientoDePerforacionesComponent;
  let fixture: ComponentFixture<RendimientoDePerforacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoDePerforacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoDePerforacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
