import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RacesComponent } from './races.component';
import { RaceDataService } from 'src/app/services/race-data.service';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';

describe('RacesComponent', () => {
  let component: RacesComponent;
  let fixture: ComponentFixture<RacesComponent>;
  let mockRaceDataService: Partial<RaceDataService> = {
    getRaces: () => of([])
  };
  @Component({ selector: 'app-pagination-controls', template: '' })
  class mockPaginationControls {
    @Input() currentPage: any;
    @Input() itemsLength: any;
    @Input() isMorePages: any;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{
        provide: RaceDataService,
        useValue: mockRaceDataService
      } ],
      declarations: [ RacesComponent, mockPaginationControls ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
