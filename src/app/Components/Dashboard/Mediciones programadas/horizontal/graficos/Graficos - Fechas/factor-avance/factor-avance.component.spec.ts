import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorAvanceComponent } from './factor-avance.component';

describe('FactorAvanceComponent', () => {
  let component: FactorAvanceComponent;
  let fixture: ComponentFixture<FactorAvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactorAvanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactorAvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
