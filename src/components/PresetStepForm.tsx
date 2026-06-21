/* eslint-disable react-refresh/only-export-components */

import { presets, defaultPresetId, type PresetId } from "../presets";
import "./App.css";
import SettingsForm from "./SettingsForm";
import type {
  RawSettings,
  SettingsItemSchema,
  SettingsSchema,
} from "../settings";

// authored by Big Pickle
// Splits paragraphs from double line breaks "\n\n" and turns single ones "\n"
// into a <br/> element. Used for preset descriptions in place of a full-blown
// Markdown processor.
function descriptionToElements(description: string) {
  return description
    .split("\n\n")
    .map((paragraph, i) => (
      <p key={i}>
        {paragraph
          .split("\n")
          .flatMap((line, j) =>
            j === 0 ? [line] : [<br key={`${i}-${j}`} />, line],
          )}
      </p>
    ));
}

export type PresetStep = {
  presetId: PresetId;
  rawSettings: RawSettings;
};

export function getDefaultRawSettings(settingsSchema: SettingsSchema) {
  const filledRawSettings: RawSettings = {};
  const populateDefaultValues = (item: SettingsItemSchema) => {
    if (item.type === "inputRow") {
      item.inputs.forEach((input) => populateDefaultValues(input));
    } else if (
      "defaultValue" in item &&
      filledRawSettings[item.id] === undefined
    ) {
      filledRawSettings[item.id] = item.defaultValue + "";
    }
  };

  settingsSchema.forEach((item) => populateDefaultValues(item));
  return filledRawSettings;
}

export function newPresetStep(
  presetId: PresetId = defaultPresetId,
): PresetStep {
  const preset = presets[presetId];
  return {
    presetId,
    rawSettings: getDefaultRawSettings(preset.settingsSchema || []),
  };
}

export default function PresetStepForm({
  presetId,
  rawSettings,
  onPresetIdChange,
  onRawSettingsChange,
  onDelete,
}: {
  presetId: PresetId;
  rawSettings: RawSettings;
  onPresetIdChange?: (presetId: PresetId) => unknown;
  onRawSettingsChange?: (rawSettings: RawSettings) => unknown;
  onDelete?: () => unknown;
}) {
  const currentPreset = presets[presetId];

  return (
    <fieldset>
      <legend>Preset</legend>
      {onDelete && (
        <>
          <div>
            <button onClick={onDelete}>Delete Step</button>
          </div>
          <br />
        </>
      )}
      <label>
        Select Layout Preset{" "}
        <select
          value={presetId}
          onChange={(e) => onPresetIdChange?.(e.target.value as PresetId)}
        >
          {Object.entries(presets).map(([id, preset]) => (
            <option key={id} value={id}>
              {preset.name}
            </option>
          ))}
        </select>
      </label>
      <div>{descriptionToElements(currentPreset.description)}</div>
      {currentPreset.settingsSchema && (
        <>
          <h3>Preset Settings</h3>
          <SettingsForm
            schema={currentPreset.settingsSchema}
            rawSettings={rawSettings}
            setRawSettings={onRawSettingsChange}
          />
        </>
      )}
    </fieldset>
  );
}
