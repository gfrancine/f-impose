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

export function drawTrimMark(
  sheet: PDFPage,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) {
  const start = { x: toPts(fromX), y: toPts(fromY) };
  const end = { x: toPts(toX), y: toPts(toY) };

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
