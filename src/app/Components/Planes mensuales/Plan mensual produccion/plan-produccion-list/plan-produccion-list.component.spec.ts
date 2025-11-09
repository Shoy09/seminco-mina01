import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanProduccionListComponent } from './plan-produccion-list.component';

describe('PlanProduccionListComponent', () => {
  let component: PlanProduccionListComponent;
  let fixture: ComponentFixture<PlanProduccionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanProduccionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanProduccionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
