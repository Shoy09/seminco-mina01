import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlanAvanceComponent } from './edit-plan-avance.component';

describe('EditPlanAvanceComponent', () => {
  let component: EditPlanAvanceComponent;
  let fixture: ComponentFixture<EditPlanAvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPlanAvanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPlanAvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
