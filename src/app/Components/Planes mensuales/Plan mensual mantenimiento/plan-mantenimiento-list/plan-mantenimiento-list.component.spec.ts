import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanMantenimientoListComponent } from './plan-mantenimiento-list.component';

describe('PlanMantenimientoListComponent', () => {
  let component: PlanMantenimientoListComponent;
  let fixture: ComponentFixture<PlanMantenimientoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanMantenimientoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanMantenimientoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
