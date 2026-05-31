import {
  type Rotation,
  PDFDocument,
  PDFEmbeddedPage,
  type PDFPage,
  rgb,
  degrees,
} from "pdf-lib";

export function assert(condition: unknown, err: string) {
  if (!condition) throw new Error(err);
}

/** immutable set */
export function set<O, K extends keyof O>(object: O, key: K, value: O[K]) {
  return { ...object, [key]: value };
}

export const mmToPts = (mm: number) => mm * 2.83465;
export const inToPts = (inches: number) => inches * 72;
export const ptsToMm = (pt: number) => pt / 2.83465;
export const degToRad = (deg: number) => (deg * Math.PI) / 180;

/** a fancy immutable {x, y} container */
export class Vec2 {
  readonly x: number;
  readonly y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add = (x: number, y: number) => new Vec2(this.x + x, this.y + y);
  sub = (x: number, y: number) => this.add(-x, -y);
  div = (v: number) => new Vec2(this.x / v, this.y / v);

  addVec = (v: Vec2) => this.add(v.x, v.y);
  subVec = (v: Vec2) => this.add(-v.x, -v.y);
}

export async function pdfToUrl(pdf: PDFDocument) {
  const pdfUint8Array = await pdf.save();
  const pdfBlob = new Blob([pdfUint8Array as BlobPart], {
    type: "application/pdf",
  });
  return URL.createObjectURL(pdfBlob);
}

/**
 * When trim marks stretch outside the bleed area, it creates an
 * unnecessary gutter in tight-grid layouts. This calculates how
 * much to remove to maximize space.
 */
export function calcExcessTrimLength(
  bleedArea: number,
  trimLength: number,
  trimOffset: number,
) {
  return trimLength + trimOffset > bleedArea
    ? trimLength + trimOffset - bleedArea
    : 0;
}

// one leaf
export type SaddleStitchIndexGroup = {
  front1: number; // front page, right-hand side
  front2: number; // front page, left-hand side
  back1: number; // back page of front1
  back2: number; // back page of front2
};

/**
 * Map saddle stitch page indices. Takes a page length and groups per sheet
 * the indices of a hypothetical array of pages.
 */
export function mapIndicesSaddleStitch(pageCount: number) {
  assert(pageCount % 4 === 0, "Page count must be a multiple of 4.");

  const indexGroups: SaddleStitchIndexGroup[] = [];

  for (let i = 0; i < pageCount / 2; i += 2) {
    const front1 = i;
    const back1 = i + 1;
    const front2 = pageCount - 1 - i; // don't forget the -1 because indices start with 0
    const back2 = pageCount - 1 - i - 1;
    indexGroups.push({ front1, front2, back1, back2 });
  }

  return indexGroups;
}

// pdf-lib drawing utils
// --------

export function debugPoint(sheet: PDFPage, origin: Vec2) {
  sheet.drawRectangle({
    x: origin.x,
    y: origin.y,
    width: 10,
    height: 10,
    color: rgb(1, 0, 0), // Fill color
  });
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

export function drawTrimMarksLine(
  sheet: PDFPage,
  {
    origin,
    srcLength,
    trimOffset,
    trimLength,
    orientation,
    hideTrimMarks = {},
  }: {
    origin: Vec2;
    srcLength: number;
    trimOffset: number;
    trimLength: number;
    orientation: "horiz" | "vert";
    // line1 is the left trim mark when horizontal, top when vertical, and so on
    hideTrimMarks?: Partial<{ line1: boolean; line2: boolean }>;
  },
) {
  const srcLengthHalf = srcLength / 2;

  // top
  if (orientation === "vert" && !hideTrimMarks.line1) {
    drawTrimMark(
      sheet,
      // from
      origin.x,
      origin.y + srcLengthHalf + trimOffset + trimLength,
      // to
      origin.x,
      origin.y + srcLengthHalf + trimOffset,
    );
  }

  // bottom
  if (orientation === "vert" && !hideTrimMarks.line2) {
    drawTrimMark(
      sheet,
      // from
      origin.x,
      origin.y - srcLengthHalf - trimOffset - trimLength,
      // to
      origin.x,
      origin.y - srcLengthHalf - trimOffset,
    );
  }

  // left
  if (orientation === "horiz" && !hideTrimMarks.line1) {
    drawTrimMark(
      sheet,
      // from
      origin.x - srcLengthHalf - trimOffset - trimLength,
      origin.y,
      // to
      origin.x - srcLengthHalf - trimOffset,
      origin.y,
    );
  }

  // right
  if (orientation === "horiz" && !hideTrimMarks.line2) {
    drawTrimMark(
      sheet,
      // from
      origin.x + srcLengthHalf + trimOffset,
      origin.y,
      // to
      origin.x + srcLengthHalf + trimOffset + trimLength,
      origin.y,
    );
  }
}

type HideTrimMarkOptions = {
  bottomLeftHoriz: boolean;
  bottomLeftVert: boolean;
  bottomRightHoriz: boolean;
  bottomRightVert: boolean;
  topLeftHoriz: boolean;
  topLeftVert: boolean;
  topRightHoriz: boolean;
  topRightVert: boolean;
};

export function drawTrimMarksRect(
  sheet: PDFPage,
  {
    origin,
    srcSize,
    trimOffset,
    trimLength,
    hideTrimMarks = {},
  }: {
    origin: Vec2;
    srcSize: Vec2;
    trimOffset: number;
    trimLength: number;
    hideTrimMarks?: Partial<HideTrimMarkOptions>;
  },
) {
  const srcSizeHalf = srcSize.div(2);

  // bottom left, horiz
  if (!hideTrimMarks.bottomLeftHoriz) {
    drawTrimMark(
      sheet,
      // from
      origin.x - srcSizeHalf.x - trimOffset - trimLength,
      origin.y - srcSizeHalf.y,
      // to
      origin.x - srcSizeHalf.x - trimOffset,
      origin.y - srcSizeHalf.y,
    );
  }

  // bottom left, vert
  if (!hideTrimMarks.bottomLeftVert) {
    drawTrimMark(
      sheet,
      // from
      origin.x - srcSizeHalf.x,
      origin.y - srcSizeHalf.y - trimOffset - trimLength,
      // to
      origin.x - srcSizeHalf.x,
      origin.y - srcSizeHalf.y - trimOffset,
    );
  }

  // bottom right, horiz
  if (!hideTrimMarks.bottomRightHoriz) {
    drawTrimMark(
      sheet,
      // from
      origin.x + srcSizeHalf.x + trimOffset,
      origin.y - srcSizeHalf.y,
      // to
      origin.x + srcSizeHalf.x + trimOffset + trimLength,
      origin.y - srcSizeHalf.y,
    );
  }

  // bottom right, vert
  if (!hideTrimMarks.bottomRightVert) {
    drawTrimMark(
      sheet,
      // from
      origin.x + srcSizeHalf.x,
      origin.y - srcSizeHalf.y - trimOffset - trimLength,
      // to
      origin.x + srcSizeHalf.x,
      origin.y - srcSizeHalf.y - trimOffset,
    );
  }

  // top left, horiz
  if (!hideTrimMarks.topLeftHoriz) {
    drawTrimMark(
      sheet,
      // from
      origin.x - srcSizeHalf.x - trimOffset - trimLength,
      origin.y + srcSizeHalf.y,
      // to
      origin.x - srcSizeHalf.x - trimOffset,
      origin.y + srcSizeHalf.y,
    );
  }

  // top left, vert
  if (!hideTrimMarks.topLeftVert) {
    drawTrimMark(
      sheet,
      // from
      origin.x - srcSizeHalf.x,
      origin.y + srcSizeHalf.y + trimOffset + trimLength,
      // to
      origin.x - srcSizeHalf.x,
      origin.y + srcSizeHalf.y + trimOffset,
    );
  }

  // top right, horiz
  if (!hideTrimMarks.topRightHoriz) {
    drawTrimMark(
      sheet,
      // from
      origin.x + srcSizeHalf.x + trimOffset,
      origin.y + srcSizeHalf.y,
      // to
      origin.x + srcSizeHalf.x + trimOffset + trimLength,
      origin.y + srcSizeHalf.y,
    );
  }

  // top right, vert
  if (!hideTrimMarks.topRightVert) {
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
}

export function drawPageRotated(
  sheet: PDFPage,
  srcPage: PDFEmbeddedPage,
  origin: Vec2,
  rotateDeg: number = 0,
) {
  const size = new Vec2(srcPage.width, srcPage.height);
  const sizeHalf = size.div(2);
  const rotateRad = degToRad(rotateDeg);

  const c = Math.cos(rotateRad);
  const s = Math.sin(rotateRad);

  // drawPage's rotation option rotates on the bottom-left corner (bx, by).
  // find the offset bottom-left position so the center remains at origin
  // bx = origin.x - (w/2)·cos(θ) + (h/2)·sin(θ)
  // by = origin.y - (w/2)·sin(θ) - (h/2)·cos(θ)
  // thanks big pickle
  const bottomLeft = origin.sub(
    sizeHalf.x * c - sizeHalf.y * s,
    sizeHalf.x * s + sizeHalf.y * c,
  );

  sheet.drawPage(srcPage, {
    x: bottomLeft.x,
    y: bottomLeft.y,
    rotate: degrees(rotateDeg),
  });
}

export function drawPageWithTrimMarks(
  sheet: PDFPage,
  srcPage: PDFEmbeddedPage,
  origin: Vec2,
  {
    bleedArea = 0,
    trimLength = 0,
    trimOffset = 0,
    hideTrimMarks = {},
    rotateDeg = 0,
  }: {
    bleedArea?: number;
    trimLength?: number;
    trimOffset?: number;
    hideTrimMarks?: Partial<HideTrimMarkOptions>;
    rotateDeg?: number;
  } = {},
) {
  drawPageRotated(sheet, srcPage, origin, rotateDeg);
  const srcSize = new Vec2(srcPage.width, srcPage.height);

  drawTrimMarksRect(sheet, {
    origin,
    srcSize: srcSize.sub(bleedArea * 2, bleedArea * 2),
    trimLength,
    trimOffset,
    hideTrimMarks,
  });
}

export function drawSpread(
  sheet: PDFPage,
  {
    origin,
    leftPage,
    rightPage,
    bleedArea,
    trimLength,
    trimOffset,
    hideTrimMarks = {},
  }: {
    origin: Vec2;
    leftPage: PDFEmbeddedPage;
    rightPage: PDFEmbeddedPage;
    bleedArea: number;
    trimLength: number;
    trimOffset: number;
    hideTrimMarks?: Partial<HideTrimMarkOptions>;
  },
) {
  const rightPageOrigin = origin.add(leftPage.width / 2, 0);
  const leftPageOrigin = origin.sub(rightPage.width / 2, 0);

  const {
    topLeftHoriz,
    topLeftVert,
    topRightHoriz,
    topRightVert,
    bottomRightHoriz,
    bottomRightVert,
    bottomLeftHoriz,
    bottomLeftVert,
  } = hideTrimMarks;

  const hideLeftTrimMarks = {
    topLeftHoriz: true,
    topLeftVert: true,
    bottomLeftHoriz: true,
    bottomLeftVert: true,
  };

  const hideRightTrimMarks = {
    topRightHoriz: true,
    topRightVert: true,
    bottomRightHoriz: true,
    bottomRightVert: true,
  };

  drawPageWithTrimMarks(sheet, leftPage, leftPageOrigin, {
    bleedArea,
    trimLength,
    trimOffset,
    hideTrimMarks: {
      ...hideRightTrimMarks,
      topLeftHoriz,
      topLeftVert,
      bottomLeftHoriz,
      bottomLeftVert,
    },
  });

  drawPageWithTrimMarks(sheet, rightPage, rightPageOrigin, {
    bleedArea,
    trimLength,
    trimOffset,
    hideTrimMarks: {
      ...hideLeftTrimMarks,
      topRightHoriz,
      topRightVert,
      bottomRightHoriz,
      bottomRightVert,
    },
  });
}
