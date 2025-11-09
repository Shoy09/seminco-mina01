import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanProduccionDetallesDialogComponent } from './plan-produccion-detalles-dialog.component';

describe('PlanProduccionDetallesDialogComponent', () => {
  let component: PlanProduccionDetallesDialogComponent;
  let fixture: ComponentFixture<PlanProduccionDetallesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanProduccionDetallesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanProduccionDetallesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
