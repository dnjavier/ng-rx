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

@NgModule({
  declarations: [
    AppComponent,
    DriversComponent,
    PaginationControlsComponent,
    RacesComponent,
    QualifyingComponent
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
