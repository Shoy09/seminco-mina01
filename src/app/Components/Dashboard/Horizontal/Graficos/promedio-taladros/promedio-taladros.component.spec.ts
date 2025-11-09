import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromedioTaladrosComponent } from './promedio-taladros.component';

describe('PromedioTaladrosComponent', () => {
  let component: PromedioTaladrosComponent;
  let fixture: ComponentFixture<PromedioTaladrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromedioTaladrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromedioTaladrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
