import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanMensualListComponent } from './plan-mensual-list.component';

describe('PlanMensualListComponent', () => {
  let component: PlanMensualListComponent;
  let fixture: ComponentFixture<PlanMensualListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanMensualListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanMensualListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
