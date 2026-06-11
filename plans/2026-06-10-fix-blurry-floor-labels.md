---
name: fix-blurry-floor-labels
issue: none
state: complete
version: none
---

## Goal

Folder (floor) labels look blurred when the camera is a bit away from the map. Improve their
sharpness at distance without changing the folder-relative label sizing introduced in #4482.

## Tasks

### 1. Enable anisotropic filtering on the floor label texture
- The label plane is viewed at a glancing angle; with default `anisotropy = 1` the GPU
  over-blurs the text along the view direction (main cause of the blur).
- Pass the renderer's max anisotropy from `ThreeSceneService` into `FloorLabelDrawer`
  and set it on the `CanvasTexture`.

### 2. Outline the label text to survive mipmap minification
- White text on a transparent canvas fades to semi-transparent gray when mipmaps
  average glyph pixels with transparent neighbors.
- Draw a subtle dark stroke under the white fill so glyph edges keep contrast at distance.

### 3. Tests, changelog, visual verification
- Extend `floorLabelDrawer.spec.ts` (anisotropy set, stroke drawn under fill).
- Add CHANGELOG entry.
- Verify in the running app that labels are sharper from a distance.

## Steps

- [x] Complete Task 1: anisotropic filtering
- [x] Complete Task 2: text outline
- [x] Complete Task 3: tests, changelog, verification

## Notes

- three.js clamps `texture.anisotropy` to the device maximum internally, but we pass the real
  capability value from `renderer.capabilities.getMaxAnisotropy()`.
- Texture resolution itself is not the bottleneck when zoomed out (the per-level canvas is
  already capped at 4x display width); supersampling would only help magnification, so it
  was intentionally not done.
