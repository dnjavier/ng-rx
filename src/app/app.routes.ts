import { DriversComponent } from './components/drivers/drivers.component';
import { RacesComponent } from './components/races/races.component';

export const APP_ROUTES = [
  {
    path: 'drivers',
    component: DriversComponent
  },
  {
    path: 'races',
    component: RacesComponent
  }
];