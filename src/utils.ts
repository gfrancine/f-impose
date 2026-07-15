import {
  PDFDocument,
  PDFEmbeddedPage,
  type PDFPage,
  rgb,
  degrees,
  grayscale,
} from "pdf-lib";

export function assert(condition: unknown, err: string) {
  if (!condition) throw new Error(err);
}

/** immutable set */
export function set<O, K extends keyof O>(object: O, key: K, value: O[K]) {
  return { ...object, [key]: value };
}

/** immutable set array */
export function setArray<T>(array: T[], index: number, value: T) {
  const newArray = [...array];
  newArray[index] = value;
  return newArray;
}

export function removeFromArray<T extends unknown[]>(array: T, index: number) {
  const newArray = [...array];
  newArray.splice(index, 1);
  return newArray;
}

export const mmToPts = (mm: number) => mm * 2.83465;
export const mmToIn = (mm: number) => mm / 25.4;
export const inToPts = (inches: number) => inches * 72;
export const inToMm = (inches: number) => inches * 25.4;
export const ptsToMm = (pt: number) => pt / 2.83465;
export const ptsToIn = (pt: number) => pt / 72;
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
  mul = (v: number) => new Vec2(this.x * v, this.y * v);
  div = (v: number) => this.mul(1 / v);

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
 * Calculate how much trim marks stretch outside the bleed area. Used
 * for working with extra gutter space caused by this excess length.
 */
export function calcExcessTrim(
  srcBleedArea: number,
  srcPageScale: number,
  trimLength: number,
  trimOffset: number,
) {
  const scaledBleed = srcBleedArea * srcPageScale;
  return trimLength + trimOffset > scaledBleed
    ? trimLength + trimOffset - scaledBleed
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

export async function mergePdfs(srcPdfs: PDFDocument[]) {
  const outPdf = await PDFDocument.create();
  for (const srcPdf of srcPdfs) {
    const pages = await outPdf.copyPages(srcPdf, srcPdf.getPageIndices());
    pages.forEach((page) => outPdf.addPage(page));
  }
  return outPdf;
}

// pdf-lib drawing utils
// --------

export function debugPoint(page: PDFPage, origin: Vec2) {
  page.drawRectangle({
    x: origin.x,
    y: origin.y,
    width: 10,
    height: 10,
    color: rgb(1, 0, 0), // Fill color
  });
}

type TrimMarkType = "default" | "inverted";

export function drawTrimMark(
  page: PDFPage,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  type: TrimMarkType, //= "default"
) {
  const start = { x: fromX, y: fromY };
  const end = { x: toX, y: toY };

  page.drawLine({
    start,
    end,
    thickness: 1.5,
    color: type === "default" ? grayscale(1) : grayscale(0),
  });

  page.drawLine({
    start,
    end,
    thickness: 0.5,
    color: type === "default" ? grayscale(0) : grayscale(1),
  });
}

export function drawTrimMarksLine(
  page: PDFPage,
  {
    origin,
    srcLength,
    trimOffset,
    trimLength,
    trimType,
    orientation,
    hideTrimMarks = {},
  }: {
    origin: Vec2;
    srcLength: number;
    trimOffset: number;
    trimLength: number;
    trimType: TrimMarkType;
    orientation: "horiz" | "vert";
    // line1 is the left trim mark when horizontal, top when vertical, and so on
    hideTrimMarks?: Partial<{ line1: boolean; line2: boolean }>;
  },
) {
  const srcLengthHalf = srcLength / 2;

  // top
  if (orientation === "vert" && !hideTrimMarks.line1) {
    drawTrimMark(
      page,
      // from
      origin.x,
      origin.y + srcLengthHalf + trimOffset + trimLength,
      // to
      origin.x,
      origin.y + srcLengthHalf + trimOffset,
      trimType,
    );
  }

  // bottom
  if (orientation === "vert" && !hideTrimMarks.line2) {
    drawTrimMark(
      page,
      // from
      origin.x,
      origin.y - srcLengthHalf - trimOffset - trimLength,
      // to
      origin.x,
      origin.y - srcLengthHalf - trimOffset,
      trimType,
    );
  }

  // left
  if (orientation === "horiz" && !hideTrimMarks.line1) {
    drawTrimMark(
      page,
      // from
      origin.x - srcLengthHalf - trimOffset - trimLength,
      origin.y,
      // to
      origin.x - srcLengthHalf - trimOffset,
      origin.y,
      trimType,
    );
  }

  // right
  if (orientation === "horiz" && !hideTrimMarks.line2) {
    drawTrimMark(
      page,
      // from
      origin.x + srcLengthHalf + trimOffset,
      origin.y,
      // to
      origin.x + srcLengthHalf + trimOffset + trimLength,
      origin.y,
      trimType,
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
  page: PDFPage,
  {
    origin,
    srcSize,
    trimOffset,
    trimLength,
    trimType,
    hideTrimMarks = {},
  }: {
    origin: Vec2;
    srcSize: Vec2;
    trimOffset: number;
    trimLength: number;
    trimType: TrimMarkType;
    hideTrimMarks?: Partial<HideTrimMarkOptions>;
  },
) {
  const srcSizeHalf = srcSize.div(2);

  // bottom left, horiz
  if (!hideTrimMarks.bottomLeftHoriz) {
    drawTrimMark(
      page,
      // from
      origin.x - srcSizeHalf.x - trimOffset - trimLength,
      origin.y - srcSizeHalf.y,
      // to
      origin.x - srcSizeHalf.x - trimOffset,
      origin.y - srcSizeHalf.y,
      trimType,
    );
  }

  // bottom left, vert
  if (!hideTrimMarks.bottomLeftVert) {
    drawTrimMark(
      page,
      // from
      origin.x - srcSizeHalf.x,
      origin.y - srcSizeHalf.y - trimOffset - trimLength,
      // to
      origin.x - srcSizeHalf.x,
      origin.y - srcSizeHalf.y - trimOffset,
      trimType,
    );
  }

  // bottom right, horiz
  if (!hideTrimMarks.bottomRightHoriz) {
    drawTrimMark(
      page,
      // from
      origin.x + srcSizeHalf.x + trimOffset,
      origin.y - srcSizeHalf.y,
      // to
      origin.x + srcSizeHalf.x + trimOffset + trimLength,
      origin.y - srcSizeHalf.y,
      trimType,
    );
  }

  // bottom right, vert
  if (!hideTrimMarks.bottomRightVert) {
    drawTrimMark(
      page,
      // from
      origin.x + srcSizeHalf.x,
      origin.y - srcSizeHalf.y - trimOffset - trimLength,
      // to
      origin.x + srcSizeHalf.x,
      origin.y - srcSizeHalf.y - trimOffset,
      trimType,
    );
  }

  // top left, horiz
  if (!hideTrimMarks.topLeftHoriz) {
    drawTrimMark(
      page,
      // from
      origin.x - srcSizeHalf.x - trimOffset - trimLength,
      origin.y + srcSizeHalf.y,
      // to
      origin.x - srcSizeHalf.x - trimOffset,
      origin.y + srcSizeHalf.y,
      trimType,
    );
  }

  // top left, vert
  if (!hideTrimMarks.topLeftVert) {
    drawTrimMark(
      page,
      // from
      origin.x - srcSizeHalf.x,
      origin.y + srcSizeHalf.y + trimOffset + trimLength,
      // to
      origin.x - srcSizeHalf.x,
      origin.y + srcSizeHalf.y + trimOffset,
      trimType,
    );
  }

  // top right, horiz
  if (!hideTrimMarks.topRightHoriz) {
    drawTrimMark(
      page,
      // from
      origin.x + srcSizeHalf.x + trimOffset,
      origin.y + srcSizeHalf.y,
      // to
      origin.x + srcSizeHalf.x + trimOffset + trimLength,
      origin.y + srcSizeHalf.y,
      trimType,
    );
  }

  // top right, vert
  if (!hideTrimMarks.topRightVert) {
    drawTrimMark(
      page,
      // from
      origin.x + srcSizeHalf.x,
      origin.y + srcSizeHalf.y + trimOffset + trimLength,
      // to
      origin.x + srcSizeHalf.x,
      origin.y + srcSizeHalf.y + trimOffset,
      trimType,
    );
  }
}

/**
 * drawPage with transform batteries, ie. center origin, page rotation,
 * page scaling, for better integration with the app
 */
export function drawPageWithTransform(
  outPage: PDFPage,
  srcPage: PDFEmbeddedPage,
  origin: Vec2,
  {
    rotateDeg = 0,
    srcPageScale = 1,
  }: {
    rotateDeg?: number;
    srcPageScale?: number;
  },
) {
  const size = new Vec2(srcPage.width, srcPage.height).mul(srcPageScale);
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

  outPage.drawPage(srcPage, {
    x: bottomLeft.x,
    y: bottomLeft.y,
    width: size.x,
    height: size.y,
    rotate: degrees(rotateDeg),
  });
}

export function drawPageWithTrimMarks(
  outPage: PDFPage,
  srcPage: PDFEmbeddedPage,
  origin: Vec2,
  {
    srcPageScale = 1,
    srcBleedArea = 0,
    trimLength = 0,
    trimOffset = 0,
    trimType = "default",
    hideTrimMarks = {},
  }: {
    srcPageScale?: number;
    srcBleedArea?: number;
    trimLength?: number;
    trimOffset?: number;
    trimType?: TrimMarkType;
    hideTrimMarks?: Partial<HideTrimMarkOptions>;
  } = {},
) {
  const srcSize = new Vec2(srcPage.width, srcPage.height).mul(srcPageScale);
  const srcSizeHalf = srcSize.div(2);

  outPage.drawPage(srcPage, {
    x: origin.x - srcSizeHalf.x,
    y: origin.y - srcSizeHalf.y,
    width: srcSize.x,
    height: srcSize.y,
  });

  drawTrimMarksRect(outPage, {
    origin,
    srcSize: srcSize.sub(
      srcBleedArea * 2 * srcPageScale,
      srcBleedArea * 2 * srcPageScale,
    ),
    trimLength,
    trimOffset,
    hideTrimMarks,
    trimType,
  });
}

export function drawSpread(
  outPage: PDFPage,
  {
    origin,
    leftPage,
    rightPage,
    srcBleedArea,
    srcPageScale = 1,
    trimLength,
    trimOffset,
    trimType,
    hideTrimMarks = {},
  }: {
    origin: Vec2;
    leftPage: PDFEmbeddedPage;
    rightPage: PDFEmbeddedPage;
    srcBleedArea: number;
    srcPageScale?: number;
    trimLength: number;
    trimOffset: number;
    trimType: TrimMarkType;
    hideTrimMarks?: Partial<HideTrimMarkOptions>;
  },
) {
  const rightPageOrigin = origin.add((leftPage.width * srcPageScale) / 2, 0);
  const leftPageOrigin = origin.sub((rightPage.width * srcPageScale) / 2, 0);

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

  drawPageWithTrimMarks(outPage, leftPage, leftPageOrigin, {
    srcPageScale,
    srcBleedArea,
    trimLength,
    trimOffset,
    trimType,
    hideTrimMarks: {
      ...hideRightTrimMarks,
      topLeftHoriz,
      topLeftVert,
      bottomLeftHoriz,
      bottomLeftVert,
    },
  });

  drawPageWithTrimMarks(outPage, rightPage, rightPageOrigin, {
    srcPageScale,
    srcBleedArea,
    trimLength,
    trimOffset,
    trimType,
    hideTrimMarks: {
      ...hideLeftTrimMarks,
      topRightHoriz,
      topRightVert,
      bottomRightHoriz,
      bottomRightVert,
    },
  });
}
