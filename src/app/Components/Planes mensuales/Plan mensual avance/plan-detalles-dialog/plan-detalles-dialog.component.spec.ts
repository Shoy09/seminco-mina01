import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDetallesDialogComponent } from './plan-detalles-dialog.component';

describe('PlanDetallesDialogComponent', () => {
  let component: PlanDetallesDialogComponent;
  let fixture: ComponentFixture<PlanDetallesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanDetallesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanDetallesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
