import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { GRID_COLUMN_WIDTH, GRID_ROW_HEIGHT, GridItem, GridItems } from '../const';
import { fromEvent, Observable, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: '[grid-item]',
  templateUrl: './grid-item.component.html',
  styleUrls: ['./grid-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridItemComponent implements OnDestroy {
  @Input() x: number = 0;
  @Input() y: number = 0;
  @Input() w: number = 0;
  @Input() h: number = 0;
  @Input() items: GridItems = [];
  @Input() level: number = 0;

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
    return this.x * this.GRID_COLUMN_WIDTH_LEVEL_BIASED;
  }

  @HostBinding('style.top.px')
  get top(): number {
    return this.y * this.GRID_ROW_HEIGHT_LEVEL_BIASED;
  }

  @HostBinding('style.width.px')
  get width(): number {
    return this.w * this.GRID_COLUMN_WIDTH_LEVEL_BIASED;
  }

  @HostBinding('style.height.px')
  get height(): number {
    return this.h * this.GRID_ROW_HEIGHT_LEVEL_BIASED;
  }

  get GRID_COLUMN_WIDTH_LEVEL_BIASED(): number {
    return GRID_COLUMN_WIDTH / (this.level || 1);
  }

  get GRID_ROW_HEIGHT_LEVEL_BIASED(): number {
    return GRID_ROW_HEIGHT;
  }

  private destroy$: Subject<void> = new Subject<void>();
  private dragging: boolean = false;

  constructor(elementRef: ElementRef, @Inject(DOCUMENT) document: Document, cd: ChangeDetectorRef) {
    let lastPotentialPosition!: GridItem;
    const el: HTMLElement = elementRef.nativeElement;
    const dragStart: Observable<MouseEvent> = fromEvent<MouseEvent>(el, 'mousedown')
      .pipe(
        tap((event: MouseEvent) => {
          event.stopPropagation();
          this.dragging = true;
          lastPotentialPosition = { id: Math.random(), x: this.x, y: this.y, w: this.w, h: this.h, items: this.items };
          this.dragStart.emit(lastPotentialPosition);
          cd.markForCheck();
        }),
      );
    const dragStop: Observable<MouseEvent> = fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(
        tap((event: MouseEvent) => {
          event.stopPropagation();
          this.dragging = false;
          this.dragStop.emit(lastPotentialPosition);
          cd.markForCheck();
        }),
      );

    dragStart
      .pipe(
        switchMap((dragStartEvent: MouseEvent) => {
          let bounds = el.parentElement!.getBoundingClientRect();
          let parentX = dragStartEvent.clientX - bounds.left;
          let parentY = dragStartEvent.clientY - bounds.top;
          const cursorOffset: {x: number, y: number} = {
            x: parentX - +el.style.left.split('px')[0],
            y: parentY - +el.style.top.split('px')[0],
          }
          return fromEvent<MouseEvent>(document, 'mousemove')
            .pipe(
              takeUntil(dragStop),
              tap((event: MouseEvent) => {
                let bounds = el.parentElement!.getBoundingClientRect();
                let parentX = event.clientX - bounds.left;
                let parentY = event.clientY - bounds.top;
                const newX: number = parentX - cursorOffset.x;
                const newY: number = parentY - cursorOffset.y;
                el.style.left = `${newX}px`;
                el.style.top = `${newY}px`;
                lastPotentialPosition = {
                  ...lastPotentialPosition,
                  x: this.mod(newX + this.GRID_COLUMN_WIDTH_LEVEL_BIASED / 2, this.GRID_COLUMN_WIDTH_LEVEL_BIASED),
                  y: this.mod(newY + GRID_ROW_HEIGHT / 2, GRID_ROW_HEIGHT),
                  w: this.w ,
                  h: this.h ,
                  items: this.items,
                };
                this.potentialPosition.emit({
                  ...lastPotentialPosition,
                });
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
