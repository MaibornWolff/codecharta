---
name: cap-floor-label-canvas
issue: - (regression from #4490, follow-up to clamp-device-pixel-ratio)
state: complete
version: 1
---

## Goal

Stop iOS Safari from killing the tab while a real map loads. The floor labels draw one map-sized 2D
canvas per folder level, sized four times the drawing-buffer width, so a phone allocates three
canvases of 6128² (~450 MB) plus the same again as textures. Cap the canvas edge.

## Tasks

### 1. Cap the floor label canvas edge
- `floorLabelHelper.ts`: bound the scaling threshold by a fixed maximum edge instead of four times
  a Full HD+ display, so no level canvas exceeds a size a phone can afford
- Keep the "four times the display width" sharpness rule below the cap

### 2. Verify on the built bundle
- Rebuild and rerun the Playwright memory measurement on the demo URL with an iPhone-shaped viewport

## Steps

- [x] Complete Task 1: Cap the floor label canvas edge (test first)
- [x] Complete Task 2: Verify on the built bundle
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
