import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MallaInstaladaLaborComponent } from './malla-instalada-labor.component';

describe('MallaInstaladaLaborComponent', () => {
  let component: MallaInstaladaLaborComponent;
  let fixture: ComponentFixture<MallaInstaladaLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MallaInstaladaLaborComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MallaInstaladaLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
