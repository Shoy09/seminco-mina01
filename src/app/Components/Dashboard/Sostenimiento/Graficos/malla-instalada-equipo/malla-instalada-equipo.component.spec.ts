import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MallaInstaladaEquipoComponent } from './malla-instalada-equipo.component';

describe('MallaInstaladaEquipoComponent', () => {
  let component: MallaInstaladaEquipoComponent;
  let fixture: ComponentFixture<MallaInstaladaEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MallaInstaladaEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MallaInstaladaEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
