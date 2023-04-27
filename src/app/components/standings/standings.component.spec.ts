import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandingsComponent } from './standings.component';
import { Component, Input } from '@angular/core';
import { of } from 'rxjs';
import { StandingsDataService } from 'src/app/services/standings-data.service';

describe('StandingsComponent', () => {
  let component: StandingsComponent;
  let fixture: ComponentFixture<StandingsComponent>;
  let mockSDataService: Partial<StandingsDataService> = {
    getStandings: () => of([])
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
        provide: StandingsDataService,
        useValue: mockSDataService
      } ],
      declarations: [ StandingsComponent, mockPaginationControls ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
