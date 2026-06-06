import addTrimMarks from "./add-trim-marks";
import removeInnerBleed from "./remove-inner-bleed";
import longShortEdgeFlip from "./long-short-edge-flip";
import businessCard from "./business-card-8up";
import saddleStitch from "./saddle-stitch-2up";
import saddleStitch4Up from "./saddle-stitch-4up";
import saddleStitch4UpTall from "./saddle-stitch-4up-tall";
import zine8Fold from "./zine-8fold";

export const presets = {
  addTrimMarks,
  removeInnerBleed,
  longShortEdgeFlip,
  businessCard,
  saddleStitch,
  saddleStitch4Up,
  saddleStitch4UpTall,
  zine8Fold,
};

export type PresetId = keyof typeof presets;

export const defaultPresetId = Object.keys(presets)[0] as PresetId;
