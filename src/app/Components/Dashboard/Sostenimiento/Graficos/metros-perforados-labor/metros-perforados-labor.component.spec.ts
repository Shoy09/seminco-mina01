import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetrosPerforadosLaborComponent } from './metros-perforados-labor.component';

describe('MetrosPerforadosLaborComponent', () => {
  let component: MetrosPerforadosLaborComponent;
  let fixture: ComponentFixture<MetrosPerforadosLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetrosPerforadosLaborComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetrosPerforadosLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
