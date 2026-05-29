import { PDFEmbeddedPage, type PDFPage, rgb } from "pdf-lib";

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

  add = (v: number) => new Vec2(this.x + v, this.y + v);

  sub = (v: number) => this.add(-v);

  div = (v: number) => new Vec2(this.x / v, this.y / v);
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
    thickness: 1.5,
    color: rgb(1, 1, 1),
  });

  sheet.drawLine({
    start,
    end,
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
}

export function drawTrimMarksRect(
  sheet: PDFPage,
  {
    origin,
    srcSize,
    trimOffset,
    trimLength,
  }: { origin: Vec2; srcSize: Vec2; trimOffset: number; trimLength: number },
) {
  const srcSizeHalf = srcSize.div(2);

  // bottom left, horiz
  drawTrimMark(
    sheet,
    // from
    origin.x - srcSizeHalf.x - trimOffset - trimLength,
    origin.y - srcSizeHalf.y,
    // to
    origin.x - srcSizeHalf.x - trimOffset,
    origin.y - srcSizeHalf.y,
  );

  // bottom left, vert
  drawTrimMark(
    sheet,
    // from
    origin.x - srcSizeHalf.x,
    origin.y - srcSizeHalf.y - trimOffset - trimLength,
    // to
    origin.x - srcSizeHalf.x,
    origin.y - srcSizeHalf.y - trimOffset,
  );

  // bottom right, horiz
  drawTrimMark(
    sheet,
    // from
    origin.x + srcSizeHalf.x + trimOffset,
    origin.y - srcSizeHalf.y,
    // to
    origin.x + srcSizeHalf.x + trimOffset + trimLength,
    origin.y - srcSizeHalf.y,
  );

  // bottom right, vert
  drawTrimMark(
    sheet,
    // from
    origin.x + srcSizeHalf.x,
    origin.y - srcSizeHalf.y - trimOffset - trimLength,
    // to
    origin.x + srcSizeHalf.x,
    origin.y - srcSizeHalf.y - trimOffset,
  );

  ///

  // top left, horiz
  drawTrimMark(
    sheet,
    // from
    origin.x - srcSizeHalf.x - trimOffset - trimLength,
    origin.y + srcSizeHalf.y,
    // to
    origin.x - srcSizeHalf.x - trimOffset,
    origin.y + srcSizeHalf.y,
  );

  // top left, vert
  drawTrimMark(
    sheet,
    // from
    origin.x - srcSizeHalf.x,
    origin.y + srcSizeHalf.y + trimOffset + trimLength,
    // to
    origin.x - srcSizeHalf.x,
    origin.y + srcSizeHalf.y + trimOffset,
  );

  // top right, horiz
  drawTrimMark(
    sheet,
    // from
    origin.x + srcSizeHalf.x + trimOffset,
    origin.y + srcSizeHalf.y,
    // to
    origin.x + srcSizeHalf.x + trimOffset + trimLength,
    origin.y + srcSizeHalf.y,
  );

  // top right, vert
  drawTrimMark(
    sheet,
    // from
    origin.x + srcSizeHalf.x,
    origin.y + srcSizeHalf.y + trimOffset + trimLength,
    // to
    origin.x + srcSizeHalf.x,
    origin.y + srcSizeHalf.y + trimOffset,
  );
}

export function imposePage(
  sheet: PDFPage,
  srcPage: PDFEmbeddedPage,
  origin: Vec2,
  options: {
    bleedArea?: number;
    trimLength?: number;
    trimOffset?: number;
  } = {},
) {
  const { bleedArea = 0, trimLength = 0, trimOffset = 0 } = options;
  const srcSize = new Vec2(srcPage.width, srcPage.height);
  const srcSizeHalf = srcSize.div(2);

  sheet.drawPage(srcPage, {
    x: origin.x - srcSizeHalf.x,
    y: origin.y - srcSizeHalf.y,
  });

  drawTrimMarksRect(sheet, {
    origin,
    srcSize: srcSize.sub(bleedArea * 2),
    trimLength,
    trimOffset,
  });
}
