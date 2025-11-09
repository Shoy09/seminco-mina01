import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromedioDeEstadosGeneralComponent } from './promedio-de-estados-general.component';

describe('PromedioDeEstadosGeneralComponent', () => {
  let component: PromedioDeEstadosGeneralComponent;
  let fixture: ComponentFixture<PromedioDeEstadosGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromedioDeEstadosGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromedioDeEstadosGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
