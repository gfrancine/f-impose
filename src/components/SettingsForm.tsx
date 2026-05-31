import type {
  ButtonGroupSchema,
  CheckboxInputSchema,
  NumberInputSchema,
  SelectInputSchema,
  RawSettings,
  SettingsItemSchema,
  SettingsSchema,
} from "../settings";
import { set } from "../utils";

function NumberInput({
  schema,
  value,
  onChange,
}: {
  schema: NumberInputSchema;
  value: string;
  onChange?: (value: string) => unknown;
}) {
  const { name, min, max } = schema;

  return (
    <label>
      {name}{" "}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
          if (e.target.value.length) {
            // enforce min/max values when not blank
            let asNumber = Number(e.target.value);
            if (min !== undefined) asNumber = Math.max(asNumber, min);
            if (max !== undefined) asNumber = Math.min(asNumber, max);
            onChange?.("" + asNumber);
          } else {
            onChange?.(e.target.value);
          }
        }}
      />
    </label>
  );
}

function CheckboxInput({
  schema,
  value,
  onChange,
}: {
  schema: CheckboxInputSchema;
  value: string;
  onChange?: (value: string) => unknown;
}) {
  const { name } = schema;

  return (
    <label>
      <input
        type="checkbox"
        checked={value === "true"}
        onChange={(e) => onChange?.(e.target.checked + "")}
      />{" "}
      {name}
    </label>
  );
}

function SelectInput({
  schema,
  value,
  onChange,
}: {
  schema: SelectInputSchema;
  value: string;
  onChange?: (value: string) => unknown;
}) {
  const { name, options } = schema;

  return (
    <label>
      {name}{" "}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ButtonGroupInput({
  schema,
  rawSettings,
  onChange,
}: {
  schema: ButtonGroupSchema;
  rawSettings: RawSettings;
  onChange?: (v: RawSettings) => unknown;
}) {
  const { name, buttons } = schema;

  return (
    <div>
      <label>{name}: </label>
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => button.onClick(rawSettings, (updated) => onChange?.(updated))}
        >
          {button.name}
        </button>
      ))}
    </div>
  );
}

export default function SettingsForm({
  schema,
  rawSettings,
  onChange,
}: {
  schema: SettingsSchema;
  rawSettings: RawSettings;
  onChange?: (v: RawSettings) => unknown;
}) {
  const fallback = (v: string, defaultValue: unknown) =>
    v !== undefined ? v : "" + defaultValue;

  const schemaItemToElement = (item: SettingsItemSchema) => (
    <>
      {item.type === "inputRow" ? (
        <div>{item.inputs.map((input) => schemaItemToElement(input))}</div>
      ) : item.type === "number" ? (
        <NumberInput
          schema={item}
          value={fallback(rawSettings[item.id], item.defaultValue)}
          onChange={(v) => onChange?.(set(rawSettings, item.id, v))}
        />
      ) : item.type === "checkbox" ? (
        <CheckboxInput
          schema={item}
          value={fallback(rawSettings[item.id], item.defaultValue)}
          onChange={(v) => onChange?.(set(rawSettings, item.id, v))}
        />
      ) : item.type === "select" ? (
        <SelectInput
          schema={item}
          value={fallback(rawSettings[item.id], item.defaultValue)}
          onChange={(v) => onChange?.(set(rawSettings, item.id, v))}
        />
      ) : item.type === "buttonGroup" ? (
        <ButtonGroupInput
          schema={item}
          rawSettings={rawSettings}
          onChange={onChange}
        />
      ) : (
        <></>
      )}{" "}
    </>
  );
  return (
    <div>
      {schema.map((item) => (
        <div>{schemaItemToElement(item)}</div>
      ))}
    </div>
  );
}
