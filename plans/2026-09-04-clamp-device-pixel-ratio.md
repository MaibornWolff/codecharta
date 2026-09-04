---
name: clamp-device-pixel-ratio
issue: - (regression from #4490)
state: complete
version: 1
---

## Goal

Make the map render again on phones. #4490 hard-coded `setPixelRatio(window.devicePixelRatio)`, which on a
phone produces a ~15 megapixel drawing buffer (7x the desktop workload) and exhausts the mobile GPU budget.
Budget the pixel ratio instead, and make a lost WebGL context visible rather than a silent blank map.

## Tasks

### 1. Budget the drawing buffer
- `threeRenderer.service.ts`: derive the pixel ratio from `window.devicePixelRatio` capped by a maximum
  ratio and by a maximum total buffer area, instead of taking the device ratio raw
- Add a `setSize()` that re-applies the budget, so a rotation or a viewport change re-evaluates it
- `threeViewer.service.ts`: `onWindowResize` delegates to that `setSize()` rather than poking both renderers

### 2. Surface a lost WebGL context
- `threeRenderer.service.ts`: listen for `webglcontextlost` (with `preventDefault`, required for the browser
  to attempt a restore) and `webglcontextrestored`; expose the state as an observable
- `threeViewer.service.ts`: re-expose it and detach the listeners on destroy
- `codeMap.component.html`: show a daisyUI alert while the context is lost

## Steps

- [x] Complete Task 1: Budget the drawing buffer
- [x] Complete Task 2: Surface a lost WebGL context
- [x] Run unit suite, biome, architecture lint

## Notes

- Measured on the built bundle under Chromium device emulation: iPhone 13 portrait 2940x5007 (14.72 MP),
  Pixel 7 2575x5239 (13.49 MP), desktop 1920x1080 (2.07 MP). All report `SAMPLES: 4`, so antialiasing
  quadruples the colour and depth storage on top.
- The 980px layout viewport (no `<meta name="viewport">` in `app/index.html`) is what inflates the phone
  height. Adding that tag would cut the buffer another 5x but re-lays-out the whole desktop-sized UI —
  a separate responsive task, deliberately not done here.
- The previous default was `SharpnessMode.Standard`, i.e. pixel ratio 1, NOT the "Best" mode #4490 kept.
- Chosen budget: ratio <= 2 and buffer <= 4 megapixels, floor 1. Verified on the rebuilt bundle under device
  emulation: desktop 1920x1080 unchanged at 2.07 MP, iPhone 13 14.72 -> 4.00 MP, Pixel 7 13.49 -> 4.00 MP.
- The alert sits at `z-[1000]`, above the explorer panel — at a lower layer it rendered behind it and was cut off.
- Verified the alert by forcing a loss with `WEBGL_lose_context` on an emulated phone and on desktop.
- Full unit suite green (420 suites, 2870 tests), `tsc --noEmit` clean, `npm run lint` clean, Biome clean.
