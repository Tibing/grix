import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { GRID_COLUMN_WIDTH, GRID_ROW_HEIGHT, GridItem } from '../const';
import { fromEvent, Observable, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: '[grid-item]',
  templateUrl: './grid-item.component.html',
  styleUrls: ['./grid-item.component.scss'],
})
export class GridItemComponent implements OnDestroy {
  @Input() x: number = 0;
  @Input() y: number = 0;
  @Input() w: number = 0;
  @Input() h: number = 0;

  @Input() placeholder: boolean = false;

  @Output() dragStart: EventEmitter<GridItem> = new EventEmitter<GridItem>();
  @Output() dragStop: EventEmitter<GridItem> = new EventEmitter<GridItem>();
  @Output() potentialPosition: EventEmitter<GridItem> = new EventEmitter<GridItem>();

  @HostBinding('class.placeholder')
  get isPlaceholder(): boolean {
    return this.placeholder;
  }

  @HostBinding('class.dragging')
  get isDragging(): boolean {
    return this.dragging;
  }

  @HostBinding('style.left.px')
  get left(): number {
    return this.x * GRID_COLUMN_WIDTH;
  }

  @HostBinding('style.top.px')
  get top(): number {
    return this.y * GRID_ROW_HEIGHT;
  }

  @HostBinding('style.width.px')
  get width(): number {
    return this.w * GRID_COLUMN_WIDTH;
  }

  @HostBinding('style.height.px')
  get height(): number {
    return this.h * GRID_ROW_HEIGHT;
  }

  private destroy$: Subject<void> = new Subject<void>();
  private dragging: boolean = false;

  constructor(elementRef: ElementRef, @Inject(DOCUMENT) document: Document) {
    let lastPotentialPosition!: GridItem;
    const el: HTMLElement = elementRef.nativeElement;
    const dragStart: Observable<MouseEvent> = fromEvent<MouseEvent>(el, 'mousedown')
      .pipe(
        tap(() => {
          this.dragging = true;
          this.dragStart.emit({ x: this.x, y: this.y, w: this.w, h: this.h });
        }),
      );
    const dragStop: Observable<MouseEvent> = fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(
        tap((event: MouseEvent) => {
          this.dragging = false;
          this.dragStop.emit(lastPotentialPosition);
        }),
      );

    dragStart
      .pipe(
        switchMap((dragStartEvent: MouseEvent) => {
          const offset: {x: number, y: number} = {
            x: dragStartEvent.pageX - +el.style.left.split('px')[0],
            y: dragStartEvent.pageY - +el.style.top.split('px')[0],
          }
          return fromEvent<MouseEvent>(document, 'mousemove')
            .pipe(
              takeUntil(dragStop),
              tap((event: MouseEvent) => {
                const newX: number = event.pageX - offset.x;
                const newY: number = event.pageY - offset.y;
                el.style.left = `${newX}px`;
                el.style.top = `${newY}px`;
                lastPotentialPosition = {
                  x: this.mod(newX + GRID_COLUMN_WIDTH / 2, GRID_COLUMN_WIDTH),
                  y: this.mod(newY + GRID_ROW_HEIGHT / 2, GRID_ROW_HEIGHT),
                  w: this.w,
                  h: this.h,
                };
                this.potentialPosition.emit(lastPotentialPosition);
              }),
            );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void  {
    this.destroy$.next();
  }

  private mod(x: number, y: number): number {
    const remainder = x % y;
    return (x - remainder) / y;
  }
}
