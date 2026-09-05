// Utilities
import addTrimMarks from "./add-trim-marks";
import longShortEdgeFlip from "./long-short-edge-flip";
import reduceInk from "./reduce-ink";
import removeInnerBleed from "./remove-inner-bleed";
import cropPages from "./crop-pages";
import markSpineHoles from "./mark-spine-holes";
import splitIntoSignatures from "./split-into-signatures";

// Layouts
import booklet2Up from "./booklet-2up";
import booklet4Up from "./booklet-4up";
import booklet4UpTall from "./booklet-4up-tall";
import bookletFlexGrid from "./booklet-flex-grid";
import zine8Up from "./zine-8up";
import bizcard8Up from "./bizcard-8up";
import flexGrid from "./flex-grid";
import flexGridRepeating from "./flex-grid-repeating";

export const UTILITY_PRESETS = {
  reduceInk,
  longShortEdgeFlip,
  removeInnerBleed,
  cropPages,
  splitIntoSignatures,
  markSpineHoles,
};

export const LAYOUT_PRESETS = {
  addTrimMarks,
  booklet2Up,
  booklet4Up,
  booklet4UpTall,
  bookletFlexGrid,
  zine8Up,
  bizcard8Up,
  flexGrid,
  flexGridRepeating,
};

export const PRESETS = {
  ...UTILITY_PRESETS,
  ...LAYOUT_PRESETS,
};

export type PresetId = keyof typeof PRESETS;

export const DEFAULT_PRESET_ID: PresetId = "reduceInk";
