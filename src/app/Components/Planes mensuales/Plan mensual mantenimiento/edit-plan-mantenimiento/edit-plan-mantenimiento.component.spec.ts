import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlanMantenimientoComponent } from './edit-plan-mantenimiento.component';

describe('EditPlanMantenimientoComponent', () => {
  let component: EditPlanMantenimientoComponent;
  let fixture: ComponentFixture<EditPlanMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPlanMantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPlanMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
