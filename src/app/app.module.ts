import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { PaginationControlsComponent } from './components/pagination-controls/pagination-controls.component';
import { APP_ROUTES } from './app.routes';
import { DriversComponent } from './components/drivers/drivers.component';
import { RacesComponent } from './components/races/races.component';
import { QualifyingComponent } from './components/qualifying/qualifying.component';
import { StandingsComponent } from './components/standings/standings.component';
import { BonusComponent } from './components/bonus/bonus.component';

@NgModule({
  declarations: [
    AppComponent,
    DriversComponent,
    PaginationControlsComponent,
    RacesComponent,
    QualifyingComponent,
    StandingsComponent,
    BonusComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(APP_ROUTES)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
