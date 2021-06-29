export const GRID_COLUMNS: number = 24;
export const GRID_COLUMN_WIDTH: number = document.documentElement.scrollWidth / GRID_COLUMNS;
export const GRID_ROW_HEIGHT: number = 22;
export interface GridItem {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type GridItems = GridItem[];
