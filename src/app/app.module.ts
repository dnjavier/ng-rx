import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { PaginationControlsComponent } from './components/pagination-controls/pagination-controls.component';
import { APP_ROUTES } from './app.routes';
import { DriversComponent } from './components/drivers/drivers.component';

@NgModule({
  declarations: [
    AppComponent,
    DriversComponent,
    PaginationControlsComponent
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
