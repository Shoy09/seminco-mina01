import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocadMineroComponent } from './autocad-minero.component';

describe('AutocadMineroComponent', () => {
  let component: AutocadMineroComponent;
  let fixture: ComponentFixture<AutocadMineroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocadMineroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutocadMineroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
