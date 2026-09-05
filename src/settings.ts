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

export interface BaseInputSchema {
  id: string;
  name: string;
  tooltip?: string;
}

export interface NumberInputSchema extends BaseInputSchema {
  type: "number";
  defaultValue: number;
  min?: number;
  max?: number;
}

export function numberInput(
  schema: NoType<OptionalDefaultValue<NumberInputSchema>>,
): NumberInputSchema {
  return { type: "number", defaultValue: 0, ...schema };
}

export interface CheckboxInputSchema extends BaseInputSchema {
  type: "checkbox";
  defaultValue: boolean;
}

export function checkboxInput(
  schema: NoType<OptionalDefaultValue<CheckboxInputSchema>>,
): CheckboxInputSchema {
  return { type: "checkbox", defaultValue: false, ...schema };
}

export interface SelectInputSchema extends BaseInputSchema {
  type: "select";
  defaultValue: string;
  options: { id: string; name: string }[];
}

export function selectInput(
  schema: NoType<SelectInputSchema>,
): SelectInputSchema {
  return { type: "select", ...schema };
}

export interface ButtonInputSchema extends BaseInputSchema {
  type: "button";
  onClick: (
    rawSettings: RawSettings,
    setRawSettings: (updated: RawSettings) => void,
  ) => void;
}

export function buttonInput(
  schema: NoType<ButtonInputSchema>,
): ButtonInputSchema {
  return { type: "button", ...schema };
}

export type ButtonGroupSchema = {
  type: "buttonGroup";
  id: string;
  name: string;
  tooltip?: string;
  buttons: ButtonInputSchema[];
};

export function buttonGroup(
  schema: NoType<ButtonGroupSchema>,
): ButtonGroupSchema {
  return { type: "buttonGroup", ...schema };
}

export type InputSchema =
  | NumberInputSchema
  | CheckboxInputSchema
  | SelectInputSchema
  | ButtonInputSchema;

export interface InputRowSchema {
  type: "inputRow";
  inputs: SettingsItemSchema[];
}

export function inputRow(inputs: SettingsItemSchema[]): InputRowSchema {
  return { type: "inputRow", inputs };
}

export type SettingsItemSchema =
  | InputRowSchema
  | InputSchema
  | ButtonGroupSchema;

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
 *   sheetWidth: (v) => mmToPts(asNumber(v, 297)),
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
  processValue: (v: string | undefined) => T,
) {
  return processValue(rawSettings[id]);
}

// Authored by Big Pickle
export function asNumber(v: string | undefined, defaultValue: number): number {
  const n = Number(v);
  if (!Number.isNaN(n)) return n;
  return defaultValue; // null/undefined, nan, gibberish / invalid numbers
}

export function asBool(v: string | undefined, defaultValue: boolean) {
  if (v === "true") return true;
  if (v === "false") return false;
  return defaultValue;
}

/** get a pre-populated raw settings object from a schema. Guarantees every setting with a default value is filled */
export function getPrefilledRawSettings(settingsSchema: SettingsSchema) {
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
