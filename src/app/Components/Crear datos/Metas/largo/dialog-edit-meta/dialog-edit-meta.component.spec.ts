import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditMetaComponent } from './dialog-edit-meta.component';

describe('DialogEditMetaComponent', () => {
  let component: DialogEditMetaComponent;
  let fixture: ComponentFixture<DialogEditMetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditMetaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
