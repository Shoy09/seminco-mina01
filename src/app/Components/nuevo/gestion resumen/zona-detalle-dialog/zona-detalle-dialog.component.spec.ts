import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonaDetalleDialogComponent } from './zona-detalle-dialog.component';

describe('ZonaDetalleDialogComponent', () => {
  let component: ZonaDetalleDialogComponent;
  let fixture: ComponentFixture<ZonaDetalleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonaDetalleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonaDetalleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
