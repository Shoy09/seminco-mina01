import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplosivosComponent } from './explosivos.component';

describe('ExplosivosComponent', () => {
  let component: ExplosivosComponent;
  let fixture: ComponentFixture<ExplosivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplosivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplosivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
