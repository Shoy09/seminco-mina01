import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicionHorizontalComponent } from './medicion-horizontal.component';

describe('MedicionHorizontalComponent', () => {
  let component: MedicionHorizontalComponent;
  let fixture: ComponentFixture<MedicionHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicionHorizontalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicionHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
