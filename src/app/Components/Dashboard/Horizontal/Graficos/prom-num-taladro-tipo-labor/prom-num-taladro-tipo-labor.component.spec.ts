import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromNumTaladroTipoLaborComponent } from './prom-num-taladro-tipo-labor.component';

describe('PromNumTaladroTipoLaborComponent', () => {
  let component: PromNumTaladroTipoLaborComponent;
  let fixture: ComponentFixture<PromNumTaladroTipoLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromNumTaladroTipoLaborComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromNumTaladroTipoLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
