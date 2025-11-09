import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorAvanceSegundoComponent } from './factor-avance-segundo.component';

describe('FactorAvanceSegundoComponent', () => {
  let component: FactorAvanceSegundoComponent;
  let fixture: ComponentFixture<FactorAvanceSegundoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactorAvanceSegundoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactorAvanceSegundoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
