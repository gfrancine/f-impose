import {
  LAYOUT_PRESETS,
  PRESETS,
  UTILITY_PRESETS,
  type PresetId,
} from "../presets";
import SettingsForm from "./SettingsForm";
import { type RawSettings } from "../settings";
import "./PresetStepForm.scss";

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

export default function PresetStepForm({
  presetId,
  presetOrder,
  rawSettings,
  onPresetIdChange,
  onRawSettingsChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  presetId: PresetId;
  presetOrder?: number; // used in the fieldset legend; starts at 1
  rawSettings: RawSettings;
  onPresetIdChange?: (presetId: PresetId) => unknown;
  onRawSettingsChange?: (rawSettings: RawSettings) => unknown;
  onDelete?: () => unknown;
  onMoveUp?: () => unknown;
  onMoveDown?: () => unknown;
}) {
  const currentPreset = PRESETS[presetId];

  return (
    <fieldset className="preset-step-form">
      <legend>{presetOrder ? `Preset #${presetOrder}` : "Preset"}</legend>
      <div>
        {onDelete && <button onClick={onDelete}>Delete Step</button>}
        {onMoveUp && (
          <>
            {" "}
            <button onClick={onMoveUp}>Move Up</button>
          </>
        )}
        {onMoveDown && (
          <>
            {" "}
            <button onClick={onMoveDown}>Move Down</button>
          </>
        )}
      </div>
      {onDelete || onMoveUp || onMoveDown ? <br /> : <></>}
      <label>
        Select Imposition Preset{" "}
        <select
          value={presetId}
          onChange={(e) => onPresetIdChange?.(e.target.value as PresetId)}
        >
          <optgroup label="Utilities">
            {Object.entries(UTILITY_PRESETS).map(([id, preset]) => (
              <option key={id} value={id}>
                {preset.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Layouts">
            {Object.entries(LAYOUT_PRESETS).map(([id, preset]) => (
              <option key={id} value={id}>
                {preset.name}
              </option>
            ))}
          </optgroup>
        </select>
      </label>
      {currentPreset.thumbnail ? (
        <div className="description two-column">
          <div className="col">
            {descriptionToElements(currentPreset.description)}
          </div>
          <div className="col right">
            <p>
              <img
                className="thumbnail"
                src={currentPreset.thumbnail}
                alt={currentPreset.name + " thumbnail"}
              />
            </p>
          </div>
        </div>
      ) : (
        <div className="description">
          {descriptionToElements(currentPreset.description)}
        </div>
      )}

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
