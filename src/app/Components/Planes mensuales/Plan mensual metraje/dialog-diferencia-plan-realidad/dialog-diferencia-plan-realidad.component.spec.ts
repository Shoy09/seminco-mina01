import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDiferenciaPlanRealidadComponent } from './dialog-diferencia-plan-realidad.component';

describe('DialogDiferenciaPlanRealidadComponent', () => {
  let component: DialogDiferenciaPlanRealidadComponent;
  let fixture: ComponentFixture<DialogDiferenciaPlanRealidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDiferenciaPlanRealidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDiferenciaPlanRealidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
