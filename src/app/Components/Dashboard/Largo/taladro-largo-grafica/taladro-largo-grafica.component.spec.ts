import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaladroLargoGraficaComponent } from './taladro-largo-grafica.component';

describe('TaladroLargoGraficaComponent', () => {
  let component: TaladroLargoGraficaComponent;
  let fixture: ComponentFixture<TaladroLargoGraficaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaladroLargoGraficaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaladroLargoGraficaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
