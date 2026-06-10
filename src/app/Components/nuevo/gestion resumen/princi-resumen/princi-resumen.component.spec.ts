import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinciResumenComponent } from './princi-resumen.component';

describe('PrinciResumenComponent', () => {
  let component: PrinciResumenComponent;
  let fixture: ComponentFixture<PrinciResumenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrinciResumenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrinciResumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
