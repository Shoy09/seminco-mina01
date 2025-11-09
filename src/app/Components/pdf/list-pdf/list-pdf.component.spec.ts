import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPdfComponent } from './list-pdf.component';

describe('ListPdfComponent', () => {
  let component: ListPdfComponent;
  let fixture: ComponentFixture<ListPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
