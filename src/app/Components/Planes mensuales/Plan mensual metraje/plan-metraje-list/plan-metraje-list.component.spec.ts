import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanMetrajeListComponent } from './plan-metraje-list.component';

describe('PlanMetrajeListComponent', () => {
  let component: PlanMetrajeListComponent;
  let fixture: ComponentFixture<PlanMetrajeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanMetrajeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanMetrajeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
