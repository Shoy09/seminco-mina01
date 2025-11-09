import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlanMetrajeComponent } from './edit-plan-metraje.component';

describe('EditPlanMetrajeComponent', () => {
  let component: EditPlanMetrajeComponent;
  let fixture: ComponentFixture<EditPlanMetrajeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPlanMetrajeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPlanMetrajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
