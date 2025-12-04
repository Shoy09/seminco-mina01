import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipLaborComponent } from './tooltip-labor.component';

describe('TooltipLaborComponent', () => {
  let component: TooltipLaborComponent;
  let fixture: ComponentFixture<TooltipLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipLaborComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TooltipLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
