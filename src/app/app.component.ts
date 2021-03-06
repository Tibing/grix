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
    {
      id: Math.random(),
      x: 1, y: 1, w: 5, h: 7,
      items: [],
    },
    {
      id: Math.random(),
      x: 11, y: 7, w: 5, h: 7,
      items: [],
    },
    {
      id: Math.random(),
      x: 1, y: 17, w: 9, h: 31,
      items: [
        { id: Math.random(), x: 1, y: 2, w: 2, h: 2, items: [] },
        { id: Math.random(), x: 5, y: 3, w: 7, h: 4, items: [] },
        {
          id: Math.random(),
          x: 1, y: 17, w: 9, h: 11,
          items: [
            { id: Math.random(), x: 1, y: 2, w: 2, h: 2, items: [] },
            { id: Math.random(), x: 5, y: 3, w: 7, h: 4, items: [] },
          ],
        },
      ],
    },
  ];
}
