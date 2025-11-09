import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplosivosGraficosComponent } from './explosivos-graficos.component';

describe('ExplosivosGraficosComponent', () => {
  let component: ExplosivosGraficosComponent;
  let fixture: ComponentFixture<ExplosivosGraficosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplosivosGraficosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplosivosGraficosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
