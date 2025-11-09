import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetrosPerforadosEquipoComponent } from './metros-perforados-equipo.component';

describe('MetrosPerforadosEquipoComponent', () => {
  let component: MetrosPerforadosEquipoComponent;
  let fixture: ComponentFixture<MetrosPerforadosEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetrosPerforadosEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetrosPerforadosEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
