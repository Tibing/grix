import { Component, Input } from '@angular/core';
import { GridItem, GridItems } from '../const';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent {
  @Input() set items(items: GridItems) {
    this._items = items;
  }
  get items(): GridItems {
    return this._items;
  }
  private _items: GridItems = [];
  @Input() level: number = 1;

  placeholder$: Subject<GridItem | null> = new Subject<GridItem | null>();
  itemsBeforeDragStarted: GridItems | null = null;

  startMove(newPosition: GridItem): void {
    this.itemsBeforeDragStarted = [...this.items];
    this.placeholder$.next(newPosition);
  }

  movePlaceholder(oldPosition: GridItem, newPosition: GridItem): void {
    if (!this.itemsBeforeDragStarted) {
      return;
    }
    this.placeholder$.next(newPosition);
    const index: number = this.itemsBeforeDragStarted.findIndex((item: GridItem) => this.equals(item, oldPosition));
    const items: GridItems = [...this.itemsBeforeDragStarted.slice(0, index), ...this.itemsBeforeDragStarted.slice(index + 1)];
    let wasCollided: boolean = false;
    let collision: GridItem | null;
    let itemsDuringCollisions: GridItems = [...this.itemsBeforeDragStarted];

    collision = this.getCollision(items, newPosition);
    while (collision) {
      wasCollided = true;
      const collisionCenter: number = collision.y + collision.h / 2;
      let newY: number;

      if (collisionCenter > newPosition.y) {
        newY = newPosition.y + newPosition.h;
      } else {
        newY = newPosition.y - collision.h;
        if (newY < 0) {
          newY = newPosition.y + newPosition.h;
        }
      }

      itemsDuringCollisions = this.moveItem(collision, { ...collision, y: newY }, itemsDuringCollisions);

      const index: number = itemsDuringCollisions.findIndex((item: GridItem) => this.equals(item, oldPosition));
      const items: GridItems = [...itemsDuringCollisions.slice(0, index), ...itemsDuringCollisions.slice(index + 1)];
      collision = this.getCollision(items, newPosition);
    }

    if (wasCollided) {
      this.items = [...itemsDuringCollisions];
    } else {
      this.items = [...this.itemsBeforeDragStarted];
    }
  }

  commitMove(oldPosition: GridItem, newPosition: GridItem): void {
    this.itemsBeforeDragStarted = null;
    this.placeholder$.next(null);
    const index: number = this.items.findIndex((item: GridItem) => this.equals(item, oldPosition));

    this.items = [
      ...this.items.slice(0, index),
      newPosition,
      ...this.items.slice(index + 1),
    ];
  }

  track(_index: number, item: GridItem): number {
    return item.id;
  }

  private getCollision(items: GridItems, rect1: GridItem): GridItem | null {
    return items.find((item: GridItem) => this.collide(item, rect1)) ?? null;
  }

  private collide(rect1: GridItem, rect2: GridItem = rect1): GridItem | null {
    if (this.equals(rect1, rect2)) {
      return null;
    }
    if (rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.y + rect1.h > rect2.y) {
      return rect2;
    }
    return null;
  }

  private equals(rect1: GridItem, rect2: GridItem): boolean {
    return rect1.x === rect2.x &&
      rect1.y === rect2.y &&
      rect1.w === rect2.w &&
      rect1.h === rect2.h;
  }

  private moveItem(prev: GridItem, curr: GridItem, items: GridItems): GridItems {
    const index: number = items.findIndex((item: GridItem) => this.equals(item, prev));
    return [...items.slice(0, index), curr, ...items.slice(index + 1)];
  }
}
