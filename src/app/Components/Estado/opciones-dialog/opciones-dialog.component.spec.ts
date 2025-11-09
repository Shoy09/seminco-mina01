import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpcionesDialogComponent } from './opciones-dialog.component';

describe('OpcionesDialogComponent', () => {
  let component: OpcionesDialogComponent;
  let fixture: ComponentFixture<OpcionesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpcionesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpcionesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
