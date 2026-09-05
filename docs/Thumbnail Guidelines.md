# Preset Thumbnails Design Workflow

1. After writing an imposition preset, generate an example PDF file that showcases it.
   - Instead of generating test PDFs every time, feel free to use one of the premade ones at `assets/test-pdfs` !
2. With Illustrator or any vector editing program:
   1. Create a **1350 x 900 px** artboard with a **pure black** (RGB 0,0,0) background.
   2. Place just one (at most two) pages from the example PDF into the layer. Make sure any artwork is center-aligned and fitted _exactly_ to an area within a **60px margin all-around**.
   3. Export the asset as a **PNG image**.
3. Place the exported thumbnail in `public/thumbnails` and update the preset thumbnail.
   - As a good practice make sure the preset file and thumbnail share the same name!
