import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriversComponent } from './drivers.component';
import { mockDriverSeason } from 'src/app/mocks/mockDrivers';
import { of } from 'rxjs';
import { DriversDataService } from 'src/app/services/drivers-data.service';
import { Component, Input } from '@angular/core';

describe('DriversComponent', () => {
  let component: DriversComponent;
  let fixture: ComponentFixture<DriversComponent>;
  let mockDriversDataService: Partial<DriversDataService> = {
    driversSeason$: of(mockDriverSeason)
  };
  @Component({ selector: 'app-pagination-controls', template: '' })
  class mockPaginationControls {
    @Input() currentPage: any;
    @Input() itemsLength: any;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{
        provide: DriversDataService,
        useValue: mockDriversDataService
      } ],
      declarations: [ DriversComponent, mockPaginationControls ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
