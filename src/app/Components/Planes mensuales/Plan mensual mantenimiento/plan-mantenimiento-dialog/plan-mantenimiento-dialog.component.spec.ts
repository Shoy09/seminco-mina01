import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanMantenimientoDialogComponent } from './plan-mantenimiento-dialog.component';

describe('PlanMantenimientoDialogComponent', () => {
  let component: PlanMantenimientoDialogComponent;
  let fixture: ComponentFixture<PlanMantenimientoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanMantenimientoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanMantenimientoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
