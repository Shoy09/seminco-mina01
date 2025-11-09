import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarrasMetroPerforadosLaborComponent } from './barras-metro-perforados-labor.component';

describe('BarrasMetroPerforadosLaborComponent', () => {
  let component: BarrasMetroPerforadosLaborComponent;
  let fixture: ComponentFixture<BarrasMetroPerforadosLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarrasMetroPerforadosLaborComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarrasMetroPerforadosLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
