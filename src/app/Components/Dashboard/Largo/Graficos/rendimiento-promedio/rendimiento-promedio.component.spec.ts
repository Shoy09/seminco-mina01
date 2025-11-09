import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoPromedioComponent } from './rendimiento-promedio.component';

describe('RendimientoPromedioComponent', () => {
  let component: RendimientoPromedioComponent;
  let fixture: ComponentFixture<RendimientoPromedioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoPromedioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoPromedioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
