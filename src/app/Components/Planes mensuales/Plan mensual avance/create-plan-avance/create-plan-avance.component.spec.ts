import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlanAvanceComponent } from './create-plan-avance.component';

describe('CreatePlanAvanceComponent', () => {
  let component: CreatePlanAvanceComponent;
  let fixture: ComponentFixture<CreatePlanAvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlanAvanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePlanAvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
