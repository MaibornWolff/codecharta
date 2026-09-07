---
name: per-label-floor-label-textures
issue: - (regression from #4490, follow-up to clamp-device-pixel-ratio)
state: complete
version: 2
---

## Goal

Stop iOS Safari from killing the tab while a real map loads. The floor labels draw one map-sized 2D
canvas per folder level, sized four times the drawing-buffer width, so a phone allocates three
canvases of 6128² (~450 MB) plus the same again as textures. Draw each label as its own small
texture instead, and put the drawing buffer back near the ratio of 1 that worked before #4490.

## Tasks

### 1. Cap the floor label canvas edge
- `floorLabelHelper.ts`: bound the scaling threshold by a fixed maximum edge instead of four times
  a Full HD+ display, so no level canvas exceeds a size a phone can afford
- Keep the "four times the display width" sharpness rule below the cap

### 2. Rewrite the drawer to one texture per label (supersedes task 1)
- `floorLabelDrawer.ts`: rasterize every label at a fixed 64px font into a canvas sized to its text,
  place a plane per label at the folder's reserved strip, one mesh per label
- `threeRenderer.service.ts`: lower the drawing-buffer budget to 2 megapixels

### 3. Verify on the built bundle
- Rebuild and rerun the Playwright memory measurement on the demo URL with an iPhone-shaped viewport

## Steps

- [x] Complete Task 1: Cap the floor label canvas edge (test first)
- [x] Complete Task 2: Rewrite the drawer to one texture per label
- [x] Complete Task 3: Verify on the built bundle
- [x] CHANGELOG, unit suite, Biome

## Notes

- Measured before the change (local build with the pixel-ratio fix, 980x1669 viewport at ratio 3):
  docs demo link renders three 6128² label canvases, renderer RSS 848 MB, GPU RSS 803 MB, JS heap 131 MB.
- 4096 is the conservative maximum texture edge; larger canvases would also be resampled by three.js
  on GPUs whose MAX_TEXTURE_SIZE is 4096, which costs yet another canvas copy.
- Measured after the change, same setup, one full map: three 4096² canvases, renderer RSS 751 -> 545 MB,
  GPU RSS 763 -> 602 MB, JS heap unchanged at ~85 MB. Not yet verified on a real iPhone; if the tab still
  dies there, lowering `MAX_LABEL_CANVAS_EDGE` to 2048 is the next lever, at the cost of label sharpness
  when zoomed far in on a desktop.
- Full unit suite green, Biome clean. On this container the build needs a case-exact tsconfig include
  because the virtiofs mount lists `app/codeCharta` under both casings; the host build is unaffected.
- Version 2, same setup, one full map, phone viewport: renderer RSS 751 -> 320 MB, GPU RSS 763 -> 250 MB,
  label canvases a few hundred KB. The 4096 cap from version 1 is superseded; the helper is back to its
  original form because the experimental folder height still uses its map scaling.
- Known cost: one mesh and one texture per label. The netbeans showcase map has 831 labelled folders,
  so it draws 831 label planes; merging per level is the follow-up if that ever shows in profiling.
