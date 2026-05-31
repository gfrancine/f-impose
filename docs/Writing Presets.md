# Writing Presets

- F-impose is essentially a preset engine, which means it can support any kind of imposition layout imaginable. 
- Every layout preset has the freedom to do whatever it wants as long as it takes a source `PDFDocument` and returns an output `PDFDocument`.

- A preset is a JavaScript object that consists of:
  - A string name
  - A string description
  - A preset settings definition schema
  - An `impose` function that takes a source PDF and outputs a new PDF.
  > See the `Preset` type within the `types.ts` module.

## How it Works (At a Glance)
  1. The user selects a preset from the dropdown.
  2. The app gets its `Preset` object from the lookup at `presets/index.ts`.
  3. The app uses the preset's `settingsSchema` to display the preset settings in the UI, storing all the raw settings values as a `Record<string, string>`.
  4. When the user clicks 'Impose', the app passes the uploaded PDF and the raw settings object to the preset's `impose` function.
  5. If the impose function successfully returns a PDF, the app displays the output for the user to download.

## Preset Settings 

- In presets, defining the settings schema and retrieving the values are two completely independent processes. 
  - The schema is for the presentation and UI, how the settings form will behave and look. 
  - The raw settings values as strings passed by the UI are later processed and made type-safe with the `getSettings` utility later in the preset's `impose` function.

### Defining Settings

```ts
// Settings schema definition example

import { defineSettingsSchema, inputRow, numberInput, checkboxInput } from "../settings.ts";

const settingsSchema = defineSettingsSchema([
  inputRow([
    numberInput({ id: "width", name: "Width", min: 0 }),
    numberInput({ id: "height", name: "Height", max: 0 }),
  ]),
  checkboxInput({ id: "", name: "", defaultValue: true }),
]);
```
- an `InputRow` is used to group inputs within the same line.


### Retrieving Settings

- A `rawSettings` object, which is just a `Record<string, string>` is passed as the second parameter to the `impose` function.
- This object is not intended to be used as-is, but instead processed with the `getSettings` or `getSetting` utility functions to extract its type-safe values.

  ```ts
  // Within impose():

  const { sheetWidth, sheetHeight } =
    getSettings(rawSettings, {
      // [Settings input ID]: (Raw string value) => Processed value
      sheetWidth: (v) => mmToPts(asNumber(v, 210)), // 210 as the default value
      sheetHeight: (v) => mmToPts(asNumber(v, 297)),
    }
  )
  ```
- All that is shared between the settings schema and the retrieval functions are the settings inputs' `id`s.

## Imposing Pages

- Several utility functions already exist to help imposition logic:
  - A `Vec2` class, which is a fancy `{x, y}` container. It is immutable and operations copy the class like strings or numbers.
  - Unit conversions (`ptsToMm`, `toPt` [from millimeters])
  - Several draw and imposition functions, such as `drawTrimMarksRect` and `drawTrimMarksLine` (both with options to hide certain trim mark arms), `drawPageWithTrimMarks`, `drawSpread`, and more.
  - A `mapIndicesSaddleStitch` utility for saddle-stitch booklets, which groups the indices of an array of pages by sheet when imposed.

## Patterns & Design Notes

- Always prefer to work with **center** anchor points or origins.
  - e.g., When placing a page or writing a utility drawing function, always start by finding its center position. Or, always place things relative to the center of the page.
  - Positional coordinates in PDFs start on the bottom and can be confusing to read.
  - Center positions also make working with double-sided layouts much easier.

- Presets are supposed to be able to do anything. Prefer composable parts and utility functions, even though this means  code is more susceptible to boilerplate.
  - When boilerplate or copy-pasting begins to happen accross presets, find a way to separate the logic. The most common place to put them in is the `utils.ts` module or `helpers.ts` if it's not generic enough.

- Make code as readable as possible
  - Longer variable names are always preferred for clarity.
  - Try to share as many words in variable names to denote relations or similar behavior, e.g., `srcPage`, `srcPdf`, or `drawTrimMark`, `drawTrimMarksRect`, `drawSpread`.
  - Performance and optimisation is not critical. If a choice had to be made between verbose but readable and performant code always prefer readable.
