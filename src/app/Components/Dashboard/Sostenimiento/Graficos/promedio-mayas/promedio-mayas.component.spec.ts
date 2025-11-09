import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromedioMayasComponent } from './promedio-mayas.component';

describe('PromedioMayasComponent', () => {
  let component: PromedioMayasComponent;
  let fixture: ComponentFixture<PromedioMayasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromedioMayasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromedioMayasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
