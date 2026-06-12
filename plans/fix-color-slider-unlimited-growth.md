---
name: fix-color-slider-unlimited-growth
issue: none
state: complete
version: 1
---

## Goal

Stop the color-settings range slider from growing without bound when the right thumb is
dragged against the left one (or vice versa). Root cause: thumb clamping mixes screen
rects with logical track pixels, letting positions cross; a crossed position produces a
negative span width, the overflowing spans widen the flex track, and the ResizeObserver
feeds the bigger width back into the spans — an unbounded growth loop.

## Tasks

### 1. Clamp thumb positions in logical space (root cause)
- In `SliderRangePosition.ts`, clamp against the other thumb's logical position
  (`sliderRangePosition`) instead of its `getBoundingClientRect().x`
- Clamp `calculateSliderRangePosition` output to `0 ≤ leftEnd ≤ rightStart ≤ sliderWidth`
  (also covers stale from/to after a metric switch)

### 2. Never render negative segment widths (defense in depth)
- Derive the three track segment widths in the component, clamped so they are
  non-negative and sum exactly to `actualSliderWidth`
- This removes the fuel for the ResizeObserver feedback loop entirely

### 3. Tests
- Unit tests for the new clamping in `SliderRangePosition.spec.ts` (crossed thumbs,
  out-of-range values)
- Component tests asserting segment widths stay non-negative for crossed/stale state

## Steps

- [x] Complete Task 1: logical-space clamping in SliderRangePosition
- [x] Complete Task 2: clamped segment widths in the slider component/template
- [x] Complete Task 3: tests green (`npm test` — 391 suites, 2278 passed)
- [x] Update CHANGELOG.md

## Notes

- Reproduced: a 1px crossing makes the track grow by the overlap on every
  ResizeObserver tick (verified 220px → 341px in 2s in Electron/Chromium)
- Crossing trigger: subpixel rect snapping (Retina/zoom) and the popover's 0.2s
  scale-in animation make rect-derived clamps land a fraction below the logical position
- Verified: full unit suite green (391 suites / 2278 tests), Biome format clean,
  manual check of the drag scenario in the running app
