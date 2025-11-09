import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToneladasComponent } from './toneladas.component';

describe('ToneladasComponent', () => {
  let component: ToneladasComponent;
  let fixture: ComponentFixture<ToneladasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToneladasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToneladasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
