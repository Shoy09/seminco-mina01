import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlanMetrajeComponent } from './create-plan-metraje.component';

describe('CreatePlanMetrajeComponent', () => {
  let component: CreatePlanMetrajeComponent;
  let fixture: ComponentFixture<CreatePlanMetrajeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlanMetrajeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePlanMetrajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
