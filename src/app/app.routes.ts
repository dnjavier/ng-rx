import { DriversComponent } from './components/drivers/drivers.component';
import { QualifyingComponent } from './components/qualifying/qualifying.component';
import { RacesComponent } from './components/races/races.component';

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
  }
];