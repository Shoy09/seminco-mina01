import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDataComponent } from './crear-data.component';

describe('CrearDataComponent', () => {
  let component: CrearDataComponent;
  let fixture: ComponentFixture<CrearDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
