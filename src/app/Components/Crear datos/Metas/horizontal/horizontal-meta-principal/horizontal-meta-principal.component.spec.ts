import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalMetaPrincipalComponent } from './horizontal-meta-principal.component';

describe('HorizontalMetaPrincipalComponent', () => {
  let component: HorizontalMetaPrincipalComponent;
  let fixture: ComponentFixture<HorizontalMetaPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalMetaPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizontalMetaPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
