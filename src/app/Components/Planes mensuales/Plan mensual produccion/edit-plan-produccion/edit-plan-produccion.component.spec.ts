import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlanProduccionComponent } from './edit-plan-produccion.component';

describe('EditPlanProduccionComponent', () => {
  let component: EditPlanProduccionComponent;
  let fixture: ComponentFixture<EditPlanProduccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPlanProduccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPlanProduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
