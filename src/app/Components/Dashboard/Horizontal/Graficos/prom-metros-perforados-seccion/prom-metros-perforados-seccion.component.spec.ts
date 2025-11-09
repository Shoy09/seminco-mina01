import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromMetrosPerforadosSeccionComponent } from './prom-metros-perforados-seccion.component';

describe('PromMetrosPerforadosSeccionComponent', () => {
  let component: PromMetrosPerforadosSeccionComponent;
  let fixture: ComponentFixture<PromMetrosPerforadosSeccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromMetrosPerforadosSeccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromMetrosPerforadosSeccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
