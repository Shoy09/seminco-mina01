import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcerosGraficosComponent } from './aceros-graficos.component';

describe('AcerosGraficosComponent', () => {
  let component: AcerosGraficosComponent;
  let fixture: ComponentFixture<AcerosGraficosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcerosGraficosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcerosGraficosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
