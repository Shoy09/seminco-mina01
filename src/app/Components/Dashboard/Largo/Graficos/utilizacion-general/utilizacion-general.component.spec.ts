import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilizacionGeneralComponent } from './utilizacion-general.component';

describe('UtilizacionGeneralComponent', () => {
  let component: UtilizacionGeneralComponent;
  let fixture: ComponentFixture<UtilizacionGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilizacionGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilizacionGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
