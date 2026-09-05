import { DEFAULT_PRESET_ID, PRESETS, type PresetId } from "../presets";
import { getPrefilledRawSettings } from "../settings";
import type { PresetStep } from "../types";

export function newPresetStep(
  presetId: PresetId = DEFAULT_PRESET_ID,
): PresetStep {
  const preset = PRESETS[presetId];
  return {
    presetId,
    rawSettings: getPrefilledRawSettings(preset.settingsSchema || []),
  };
}
