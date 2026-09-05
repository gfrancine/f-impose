/*

Handles preset step file imports and exports

*/

import { DEFAULT_PRESET_ID, PRESETS } from "./presets";
import { getPrefilledRawSettings } from "./settings";
import type { PresetStep } from "./types";
import { assert, toFilenameSafeDate } from "./utils";

const CURRENT_VERSION = 1;

type PresetsFile = {
  version: number;
  presetSteps: PresetStep[];
};

export function exportPresetsFile(presetSteps: PresetStep[]) {
  const data: PresetsFile = { version: CURRENT_VERSION, presetSteps };

  const filename = "f-impose-presets-" + toFilenameSafeDate(new Date());
  const textContents = JSON.stringify(data, null, 2);
  const blob = new Blob([textContents], { type: "application/json" });
  const dataUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(dataUrl);
}

export async function importPresetsFile(file: File): Promise<PresetStep[]> {
  // assumes the file is guaranteed to be a .json file
  const textContents = await file.text();
  const rawData = JSON.parse(textContents);

  // validate, migrate versions, et cetera
  assert(typeof rawData === "object", "Invalid preset file: not an object");
  assert(
    typeof rawData.version === "number",
    "Invalid preset file: version is not a number",
  );
  assert(
    Array.isArray(rawData.presetSteps),
    "Invalid preset file: presetSteps is not an array",
  );
  const rawPresetFile: PresetsFile = rawData; // migrate(rawData);

  // extract presets
  // only really need to validate presetId, everything else is handled
  // either by preset-level settings retrieval or getPrefilled
  const presetSteps: PresetStep[] = [];
  rawPresetFile.presetSteps.forEach((rawPresetStep: PresetStep) => {
    const presetExists = PRESETS[rawPresetStep.presetId] !== undefined;
    let presetId = rawPresetStep.presetId;
    if (!presetExists) {
      console.warn(
        `"${presetId}" is not a valid preset, defaulting to ${DEFAULT_PRESET_ID}`,
      );
      presetId = DEFAULT_PRESET_ID;
    }
    const preset = PRESETS[presetId];

    presetSteps.push({
      presetId,
      rawSettings: {
        ...getPrefilledRawSettings(preset.settingsSchema || []),
        // todo: sanitize
        ...rawPresetStep.rawSettings,
      },
    });
  });

  return presetSteps;
}
