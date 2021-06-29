import { Component, Input } from '@angular/core';
import { GridItem, GridItems } from '../const';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent {
  @Input() items: GridItems = [];

  placeholder$: Subject<GridItem | null> = new Subject<GridItem | null>();

  commitMove(oldPosition: GridItem, newPosition: GridItem): void {
    debugger;
    this.placeholder$.next(null);
    const index: number = this.items.findIndex((item: GridItem) => {
      return item.x === oldPosition.x &&
        item.y === oldPosition.y &&
        item.w === oldPosition.w &&
        item.h === oldPosition.h;
    });

    this.items = [
      ...this.items.slice(0, index),
      newPosition,
      ...this.items.slice(index + 1),
    ];
  }
}
