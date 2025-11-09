import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlanMantenimientoComponent } from './create-plan-mantenimiento.component';

describe('CreatePlanMantenimientoComponent', () => {
  let component: CreatePlanMantenimientoComponent;
  let fixture: ComponentFixture<CreatePlanMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlanMantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePlanMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
