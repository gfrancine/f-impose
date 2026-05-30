import businessCard from "./business-card-8up";
import addTrimMarks from "./add-trim-marks";
import saddleStitch from "./saddle-stitch-2up";
import removeInnerBleed from "./remove-inner-bleed";

export const presets = {
  addTrimMarks,
  removeInnerBleed,
  businessCard,
  saddleStitch,
};

export type PresetId = keyof typeof presets;

export const defaultPresetId = Object.keys(presets)[0] as PresetId;
