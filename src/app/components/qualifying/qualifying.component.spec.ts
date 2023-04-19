import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualifyingComponent } from './qualifying.component';

describe('QualifyingComponent', () => {
  let component: QualifyingComponent;
  let fixture: ComponentFixture<QualifyingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualifyingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualifyingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
