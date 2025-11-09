import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LongitudDePerforacionComponent } from './longitud-de-perforacion.component';

describe('LongitudDePerforacionComponent', () => {
  let component: LongitudDePerforacionComponent;
  let fixture: ComponentFixture<LongitudDePerforacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LongitudDePerforacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LongitudDePerforacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
