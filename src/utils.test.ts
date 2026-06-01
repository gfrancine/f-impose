import { describe, expect, it } from "vitest";
import { calcExcessTrim, mapIndicesSaddleStitch } from "./utils";

describe("calcExcessTrim", () => {
  it("returns the excess length of the trim mark when outside the bleed area", () => {
    expect(calcExcessTrim(10, 10, 2)).toBe(2);
    expect(calcExcessTrim(10, 5, 7)).toBe(2);
  });

  it("returns 0 if the trim mark is within the bleed area", () => {
    expect(calcExcessTrim(10, 8, 2)).toBe(0);
    expect(calcExcessTrim(10, 8, 0)).toBe(0);
  });
});

describe("mapIndicesSaddleStitch", () => {
  /** shortcut for mocking an index map group */
  const indices = (
    front1: number,
    front2: number,
    back1: number,
    back2: number,
  ) => ({ front1, front2, back1, back2 });

  it("maps indices correctly", () => {
    // 4-page booklet
    expect(mapIndicesSaddleStitch(4)).toEqual([indices(0, 3, 1, 2)]);

    // 8-page booklet
    expect(mapIndicesSaddleStitch(8)).toEqual([
      indices(0, 7, 1, 6),
      indices(2, 5, 3, 4),
    ]);

    // 16-page booklet
    expect(mapIndicesSaddleStitch(16)).toEqual([
      indices(0, 15, 1, 14),
      indices(2, 13, 3, 12),
      indices(4, 11, 5, 10),
      indices(6, 9, 7, 8),
    ]);
  });

  it("throws when pageCount isn't a multiple of 4", () => {
    expect(() => mapIndicesSaddleStitch(7)).toThrow();
  });
});
