import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculoDialogComponent } from './calculo-dialog.component';

describe('CalculoDialogComponent', () => {
  let component: CalculoDialogComponent;
  let fixture: ComponentFixture<CalculoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
