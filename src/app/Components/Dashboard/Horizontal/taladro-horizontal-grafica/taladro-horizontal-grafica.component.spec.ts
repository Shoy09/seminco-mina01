import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaladroHorizontalGraficaComponent } from './taladro-horizontal-grafica.component';

describe('TaladroHorizontalGraficaComponent', () => {
  let component: TaladroHorizontalGraficaComponent;
  let fixture: ComponentFixture<TaladroHorizontalGraficaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaladroHorizontalGraficaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaladroHorizontalGraficaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
