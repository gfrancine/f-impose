import { expect, test } from "vitest";
import { mapIndicesSaddleStitch } from "./utils";

test("mapIndicesSaddleStitch", () => {
  /** shortcut for mocking an index map group */
  const indices = (
    front1: number,
    front2: number,
    back1: number,
    back2: number,
  ) => ({ front1, front2, back1, back2 });

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

  // throws when pageCount isn't a multiple of 4
  expect(() => mapIndicesSaddleStitch(7)).toThrow();
});
