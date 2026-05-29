import { type PDFPage, rgb } from "pdf-lib";

export function assert(condition: unknown, err: string) {
  if (!condition) throw new Error(err);
}

/** immutable set */
export function set<O, K extends keyof O>(object: O, key: K, value: O[K]) {
  return { ...object, [key]: value };
}

export const toPts = (mm: number) => mm * 2.83465;
export const toMm = (pt: number) => pt / 2.83465;

/** a fancy immutable {x, y} container */
export class Vec2 {
  readonly x: number;
  readonly y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  div(v: number) {
    return new Vec2(this.x / v, this.y / v);
  }
}

export function drawTrimMark(
  sheet: PDFPage,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) {
  const start = { x: fromX, y: fromY };
  const end = { x: toX, y: toY };

  sheet.drawLine({
    start,
    end,
    thickness: 3,
    color: rgb(0, 0, 0),
  });

  sheet.drawLine({
    start,
    end,
    thickness: 0.75,
    color: rgb(1, 1, 1),
  });
}
