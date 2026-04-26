import React, { useState } from "react";

export type Settings = {
  sourcePageWidth: number;
  sourcePageHeight: number;
  sourcePageBleed: number;
  scaleInput: number;
  signatureWidth: number; // millimeters
  signatureHeight: number;
  trimMarkLength: number;
};

export const DEFAULT_SETTINGS: Settings = {
  sourcePageWidth: 0,
  sourcePageHeight: 0,
  sourcePageBleed: 0,
  scaleInput: 1,
  signatureWidth: 297,
  signatureHeight: 210,
  trimMarkLength: 5,
};

export function SettingsForm({
  settings,
  setSettings,
}: {
  settings: Settings;
  setSettings: (settings: Settings) => unknown;
}) {
  const setSettingsKey = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => setSettings({ ...settings, [key]: value });

  return (
    <div>
      <fieldset>
        <legend>Input</legend>
        <label htmlFor="sourcePageWidth">Source Page Width</label>
        <input
          id="sourcePageWidth"
          type="number"
          value={settings.sourcePageWidth}
          onChange={(e) =>
            setSettingsKey("sourcePageWidth", Number(e.target.value))
          }
        />
        <label htmlFor="sourcePageHeight">Source Page Height</label>
        <input
          id="sourcePageHeight"
          type="number"
          value={settings.sourcePageHeight}
          onChange={(e) =>
            setSettingsKey("sourcePageHeight", Number(e.target.value))
          }
        />
        <br />
        <label htmlFor="sourcePageBleed">Source Page Bleed</label>
        <input
          id="sourcePageBleed"
          type="number"
          value={settings.sourcePageBleed}
          onChange={(e) =>
            setSettingsKey("sourcePageBleed", Number(e.target.value))
          }
        />
        <br />
        <label htmlFor="scaleInput">Scale Input</label>
        <input
          id="scaleInput"
          type="number"
          value={settings.scaleInput}
          onChange={(e) => setSettingsKey("scaleInput", Number(e.target.value))}
        />
      </fieldset>
      <fieldset>
        <legend>Output</legend>
        {/* <label>Layout</label>
        <select>
          <option>BookletFourUp</option>
        </select>
        <br /> */}
        <label htmlFor="signatureWidth">Signature Width</label>
        <input
          id="signatureWidth"
          type="number"
          value={settings.signatureWidth}
          onChange={(e) =>
            setSettingsKey("signatureWidth", Number(e.target.value))
          }
        />
        <label htmlFor="signatureHeight">Signature Height</label>
        <input
          id="signatureHeight"
          type="number"
          value={settings.signatureHeight}
          onChange={(e) =>
            setSettingsKey("signatureHeight", Number(e.target.value))
          }
        />
        {/* <label>Preset</label>
        <select value={"a4"} onChange={(e) => {}}>
          <option value="a4">A4</option>
        </select> */}
        <br />
        <label htmlFor="trimMarkLength">Trim Mark Length</label>
        <input
          id="trimMarkLength"
          type="number"
          value={settings.trimMarkLength}
          onChange={(e) =>
            setSettingsKey("trimMarkLength", Number(e.target.value))
          }
        />
      </fieldset>
    </div>
  );
}
