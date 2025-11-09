import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SumaMetrosPerforadosComponent } from './suma-metros-perforados.component';

describe('SumaMetrosPerforadosComponent', () => {
  let component: SumaMetrosPerforadosComponent;
  let fixture: ComponentFixture<SumaMetrosPerforadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SumaMetrosPerforadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SumaMetrosPerforadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
