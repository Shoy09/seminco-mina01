import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionProcesoEstatosDialogComponent } from './seleccion-proceso-estatos-dialog.component';

describe('SeleccionProcesoEstatosDialogComponent', () => {
  let component: SeleccionProcesoEstatosDialogComponent;
  let fixture: ComponentFixture<SeleccionProcesoEstatosDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionProcesoEstatosDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionProcesoEstatosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
