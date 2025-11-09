import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromedioNTaladroComponent } from './promedio-n-taladro.component';

describe('PromedioNTaladroComponent', () => {
  let component: PromedioNTaladroComponent;
  let fixture: ComponentFixture<PromedioNTaladroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromedioNTaladroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromedioNTaladroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
