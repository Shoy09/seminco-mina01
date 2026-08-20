import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarpetaFormDialogComponent } from './carpeta-form-dialog.component';

describe('CarpetaFormDialogComponent', () => {
  let component: CarpetaFormDialogComponent;
  let fixture: ComponentFixture<CarpetaFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarpetaFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarpetaFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
