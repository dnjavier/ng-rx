import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusComponent } from './bonus.component';
import { F1Service } from 'src/app/services/f1.service';
import { RaceDataService } from 'src/app/services/race-data.service';
import { mockStatus } from 'src/app/mocks/mockStatus';
import { of } from 'rxjs';
import { mockSeasonRaces } from 'src/app/mocks/mockRaces';

describe('BonusComponent', () => {
  let component: BonusComponent;
  let fixture: ComponentFixture<BonusComponent>;
  let mockF1Service: Partial<F1Service> = {
    getStatus: () => of(mockStatus)
  }
  let mockRaceDataService: Partial<RaceDataService> = {
    getSeasonRaces: () => of(mockSeasonRaces)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ {
        provide: F1Service,
        useValue: mockF1Service
      }, {
        provide: RaceDataService,
        useValue: mockRaceDataService
      } ],
      declarations: [ BonusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
