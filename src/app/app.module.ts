import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GridItemComponent } from './grid-item/grid-item.component';
import { GridComponent } from './grid/grid.component';

@NgModule({
  declarations: [AppComponent, GridItemComponent, GridComponent],
  imports: [
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
