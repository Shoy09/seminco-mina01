import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarOperacionesDialogComponent } from './editar-operaciones-dialog.component';

describe('EditarOperacionesDialogComponent', () => {
  let component: EditarOperacionesDialogComponent;
  let fixture: ComponentFixture<EditarOperacionesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarOperacionesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarOperacionesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
