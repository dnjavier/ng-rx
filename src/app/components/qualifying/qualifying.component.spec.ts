import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualifyingComponent } from './qualifying.component';
import { QualifyingDataService } from 'src/app/services/qualifying-data.service';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';

describe('QualifyingComponent', () => {
  let component: QualifyingComponent;
  let fixture: ComponentFixture<QualifyingComponent>;
  let mockQDataService: Partial<QualifyingDataService> = {
    getResults: () => of([])
  };
  @Component({ selector: 'app-pagination-controls', template: '' })
  class mockPaginationControls {
    @Input() currentPage: any;
    @Input() itemsLength: any;
    @Input() isMorePages: any;
    @Input() isLoadingData = false;
  }


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{
        provide: QualifyingDataService,
        useValue: mockQDataService
      } ],
      declarations: [ QualifyingComponent, mockPaginationControls ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualifyingComponent);
    component = fixture.componentInstance;
    component.isLoadingData = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
