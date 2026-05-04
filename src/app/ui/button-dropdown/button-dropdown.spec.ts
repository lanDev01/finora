import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonDropdown } from './button-dropdown';

describe('ButtonDropdown', () => {
  let component: ButtonDropdown;
  let fixture: ComponentFixture<ButtonDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonDropdown],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
