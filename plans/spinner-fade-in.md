---
name: Fade the loading overlay in
issue: -
state: complete
version: -
---

## Goal

Adding or removing a metric rule flashes the full-screen loading overlay for a few frames, because
`dispatchAfterPaint` shows it before every heavy dispatch and a fast render hides it again at once. Keep showing it
first, but fade it in after a short delay, so quick changes finish before it becomes visible and slow ones still get
it while the page is blocked.

## Tasks

### 1. Tests first
- Component spec: loading → overlay visible with the delayed fade-in; not loading → hidden, no fade

### 2. Delayed fade-in
- `fade-in-delayed` animation in the Tailwind `@theme` (opacity only, so the compositor runs it while the main
  thread is blocked)
- Spinner template applies it while loading

### 3. Verify in the browser
- Fast change: overlay never reaches visible opacity; slow blocking change: overlay fades in during the block

### 4. Changelog
- Fixed entry in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Tests first
- [x] Complete Task 2: Delayed fade-in
- [x] Complete Task 3: Verify in the browser
- [x] Complete Task 4: Changelog

## Notes

- Measured with a CDP screencast in headless Chromium (software WebGL) on the sample map, adding `rloc > 50`:
  without the fade the overlay stays on screen ~180 ms (the frame that removes it waits for the map render);
  with the fade no frame shows it. With a 2 s main-thread block the overlay fades in and stays up throughout,
  so the compositor runs the animation while the page is blocked.
- The 200 ms delay is the knob: renders that keep the overlay up longer show it, which is intended.
