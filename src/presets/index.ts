import addTrimMarks from "./add-trim-marks";
import removeInnerBleed from "./remove-inner-bleed";
import longShortEdgeFlip from "./long-short-edge-flip";
import reduceInk from "./reduce-ink";
import businessCard from "./business-card-8up";
import saddleStitch from "./saddle-stitch-2up";
import saddleStitch4Up from "./saddle-stitch-4up";
import saddleStitch4UpTall from "./saddle-stitch-4up-tall";
import zine8Fold from "./zine-8fold";
import repeatingGrid from "./repeating-grid";

export const presets = {
  addTrimMarks,
  removeInnerBleed,
  longShortEdgeFlip,
  reduceInk,
  businessCard,
  saddleStitch,
  saddleStitch4Up,
  saddleStitch4UpTall,
  zine8Fold,
  repeatingGrid,
};

export type PresetId = keyof typeof presets;

export const defaultPresetId = Object.keys(presets)[0] as PresetId;
