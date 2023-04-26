import { BonusComponent } from './components/bonus/bonus.component';
import { DriversComponent } from './components/drivers/drivers.component';
import { QualifyingComponent } from './components/qualifying/qualifying.component';
import { RacesComponent } from './components/races/races.component';
import { StandingsComponent } from './components/standings/standings.component';

export const APP_ROUTES = [
  {
    path: 'drivers',
    component: DriversComponent
  },
  {
    path: 'races',
    component: RacesComponent
  },
  {
    path: 'qualifying',
    component: QualifyingComponent
  },
  {
    path: 'standings',
    component: StandingsComponent
  },
  {
    path: 'bonus',
    component: BonusComponent
  }
];