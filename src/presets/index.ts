// Utilities
import addTrimMarks from "./add-trim-marks";
import longShortEdgeFlip from "./long-short-edge-flip";
import reduceInk from "./reduce-ink";
import removeInnerBleed from "./remove-inner-bleed";
import markSpineHoles from "./mark-spine-holes";

// Layouts
import saddleStitch from "./saddle-stitch-2up";
import saddleStitch4Up from "./saddle-stitch-4up";
import saddleStitch4UpTall from "./saddle-stitch-4up-tall";
import zine8Fold from "./zine-8fold";
import businessCard from "./business-card-8up";
import repeatingGrid from "./repeating-grid";

export const UTILITY_PRESETS = {
  addTrimMarks,
  longShortEdgeFlip,
  removeInnerBleed,
  reduceInk,
  markSpineHoles,
};

export const LAYOUT_PRESETS = {
  saddleStitch,
  saddleStitch4Up,
  saddleStitch4UpTall,
  zine8Fold,
  businessCard,
  repeatingGrid,
};

export const PRESETS = {
  ...UTILITY_PRESETS,
  ...LAYOUT_PRESETS,
};

export type PresetId = keyof typeof PRESETS;

export const DEFAULT_PRESET_ID: PresetId = "addTrimMarks";
