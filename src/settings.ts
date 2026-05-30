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

export type BaseInput = {
  id: string;
  name: string;
};

export type NumberInput = BaseInput & {
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
}: NoType<OptionalDefaultValue<NumberInput>>): NumberInput {
  return { type: "number", id, name, min, max, defaultValue };
}

export type CheckboxInput = BaseInput & {
  type: "checkbox";
  defaultValue: boolean;
};

export function checkboxInput({
  id,
  name,
  defaultValue = false,
}: NoType<OptionalDefaultValue<CheckboxInput>>): CheckboxInput {
  return { type: "checkbox", id, name, defaultValue };
}

export type Inputs = NumberInput | CheckboxInput;

export type InputRow = {
  type: "inputRow";
  inputs: Inputs[];
};

export function inputRow(inputs: Inputs[]): InputRow {
  return { type: "inputRow", inputs };
}

export type SettingsSchemaItem = InputRow | Inputs;

export type SettingsSchema = SettingsSchemaItem[];

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
  items: SettingsSchemaItem[],
): SettingsSchema {
  return items;
}

// Retrieval & validation
// --------

export type GetSetting<T> = (id: string, processValue: (v: unknown) => T) => T;
