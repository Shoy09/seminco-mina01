import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemanaListComponent } from './semana-list.component';

describe('SemanaListComponent', () => {
  let component: SemanaListComponent;
  let fixture: ComponentFixture<SemanaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemanaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemanaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
