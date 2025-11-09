import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromNumTaladroSeccionComponent } from './prom-num-taladro-seccion.component';

describe('PromNumTaladroSeccionComponent', () => {
  let component: PromNumTaladroSeccionComponent;
  let fixture: ComponentFixture<PromNumTaladroSeccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromNumTaladroSeccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromNumTaladroSeccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
