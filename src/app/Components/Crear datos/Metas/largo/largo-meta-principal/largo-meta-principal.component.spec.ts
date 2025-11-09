import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LargoMetaPrincipalComponent } from './largo-meta-principal.component';

describe('LargoMetaPrincipalComponent', () => {
  let component: LargoMetaPrincipalComponent;
  let fixture: ComponentFixture<LargoMetaPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LargoMetaPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LargoMetaPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
