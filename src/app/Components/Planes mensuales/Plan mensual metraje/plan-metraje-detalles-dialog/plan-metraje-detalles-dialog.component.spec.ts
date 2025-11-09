import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanMetrajeDetallesDialogComponent } from './plan-metraje-detalles-dialog.component';

describe('PlanMetrajeDetallesDialogComponent', () => {
  let component: PlanMetrajeDetallesDialogComponent;
  let fixture: ComponentFixture<PlanMetrajeDetallesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanMetrajeDetallesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanMetrajeDetallesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
