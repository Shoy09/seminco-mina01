import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoFormComponent } from './estado-form.component';

describe('EstadoFormComponent', () => {
  let component: EstadoFormComponent;
  let fixture: ComponentFixture<EstadoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
