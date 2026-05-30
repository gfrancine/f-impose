import businessCard from "./business-card-8up";
import addTrimMarks from "./add-trim-marks";
import saddleStitch from "./saddle-stitch-2up";
import saddleStitch4UpTall from "./saddle-stitch-4up-tall";
import removeInnerBleed from "./remove-inner-bleed";

export const presets = {
  addTrimMarks,
  removeInnerBleed,
  businessCard,
  saddleStitch,
  saddleStitch4UpTall,
};

export type PresetId = keyof typeof presets;

export const defaultPresetId = Object.keys(presets)[0] as PresetId;
