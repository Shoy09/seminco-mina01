import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlanProduccionComponent } from './create-plan-produccion.component';

describe('CreatePlanProduccionComponent', () => {
  let component: CreatePlanProduccionComponent;
  let fixture: ComponentFixture<CreatePlanProduccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlanProduccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePlanProduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
