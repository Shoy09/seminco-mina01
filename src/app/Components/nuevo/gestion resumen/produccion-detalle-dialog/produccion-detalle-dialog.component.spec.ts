import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduccionDetalleDialogComponent } from './produccion-detalle-dialog.component';

describe('ProduccionDetalleDialogComponent', () => {
  let component: ProduccionDetalleDialogComponent;
  let fixture: ComponentFixture<ProduccionDetalleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduccionDetalleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduccionDetalleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
