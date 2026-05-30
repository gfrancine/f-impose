/*

Preset settings form schema 

*/

// Settings schema definition
// --------

/** Make certain keys optional in an object type */
// Authored by Gemini 3 Flash
type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type NoType<T> = Omit<T, "type">;
type OptionalDefaultValue<T extends Record<"defaultValue", unknown>> =
  PartialKeys<T, "defaultValue">;

export type BaseInputSchema = {
  id: string;
  name: string;
};

export type NumberInputSchema = BaseInputSchema & {
  type: "number";
  defaultValue: number;
  min?: number;
  max?: number;
};

export function numberInput({
  id,
  name,
  min,
  max,
  defaultValue = 0,
}: NoType<OptionalDefaultValue<NumberInputSchema>>): NumberInputSchema {
  return { type: "number", id, name, min, max, defaultValue };
}

export type CheckboxInputSchema = BaseInputSchema & {
  type: "checkbox";
  defaultValue: boolean;
};

export function checkboxInput({
  id,
  name,
  defaultValue = false,
}: NoType<OptionalDefaultValue<CheckboxInputSchema>>): CheckboxInputSchema {
  return { type: "checkbox", id, name, defaultValue };
}

export type InputSchema = NumberInputSchema | CheckboxInputSchema;

export type InputRowSchema = {
  type: "inputRow";
  inputs: InputSchema[];
};

export function inputRow(inputs: InputSchema[]): InputRowSchema {
  return { type: "inputRow", inputs };
}

export type SettingsItemSchema = InputRowSchema | InputSchema;

export type SettingsSchema = SettingsItemSchema[];

/**
 * Usage:
 *
 * ```ts
 * defineSettingsSchema([
 *   inputRow([
 *     numberInput({ id: "width", name: "Width", min: 0 }),
 *     numberInput({ id: "height", name: "Height", max: 0 }),
 *   ]),
 *   checkboxInput({ id: "", name: "", defaultValue: true }),
 * ]);
 * ```
 */
export function defineSettingsSchema(
  items: SettingsItemSchema[],
): SettingsSchema {
  return items;
}

// Retrieval & validation
// --------

export type RawSettings = Record<string, string>; // native HTML inputs work with strings

/**
 * Processes the raw settings object and returns its type-safe values.
 *
 * Usage:
 * ```ts
 * const { sheetWidth, enableTrimMarks } = getSettings(rawSettings, {
 *   sheetWidth: (v) => toPts(asNumber(v, 297)),
 *   enableTrimMarks: (v) => asBool(v, true),
 * })
 * ```
 */
// Authored with Big Pickle
export function getSettings<T extends Record<string, (v: string) => unknown>>(
  rawSettings: RawSettings,
  processSettings: T,
) {
  const processedSettings: Record<string, unknown> = {};
  for (const [id, processValue] of Object.entries(processSettings)) {
    processedSettings[id] = processValue(rawSettings[id]);
  }
  return processedSettings as { [K in keyof T]: ReturnType<T[K]> };
}

export function getSetting<T>(
  rawSettings: RawSettings,
  id: string,
  processValue: (v: unknown) => T,
) {
  return processValue(rawSettings[id]);
}

// Authored by Big Pickle
export function asNumber(v: string, defaultValue: number): number {
  const n = Number(v);
  if (!Number.isNaN(n)) return n;
  return defaultValue; // null/undefined, nan, gibberish / invalid numbers
}

export function asBool(v: string, defaultValue: boolean) {
  if (v === "true") return true;
  if (v === "false") return false;
  return defaultValue;
}
