import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridItems } from './const';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  items: GridItems = [
    { x: 1, y: 1, w: 5, h: 7 },
    { x: 11, y: 7, w: 5, h: 7 },
  ];
}
