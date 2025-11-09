import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemanaDialogComponent } from './semana-dialog.component';

describe('SemanaDialogComponent', () => {
  let component: SemanaDialogComponent;
  let fixture: ComponentFixture<SemanaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemanaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemanaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
