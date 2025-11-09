import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SostenimientoMetaPrincipalComponent } from './sostenimiento-meta-principal.component';

describe('SostenimientoMetaPrincipalComponent', () => {
  let component: SostenimientoMetaPrincipalComponent;
  let fixture: ComponentFixture<SostenimientoMetaPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SostenimientoMetaPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SostenimientoMetaPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
