---
name: loader-covers-the-whole-boot
issue: <none>
state: progress
version: unreleased
---

## Goal

Show a loading indicator from the first painted frame until the map is ready, and let it cover the whole
application while it is up, instead of a long white page followed by a spinner that leaves the top bar
live.

## Tasks

### 1. Paint something before Angular has booted

- `app/index.html` carries only `<cc-code-charta></cc-code-charta>`, so the page is blank white until the
  bundle is downloaded, parsed and bootstrapped.
- Put the indicator inside that element. Angular replaces the host's content when it renders the
  component, so the placeholder disappears on its own — no script, no teardown, nothing to get wrong.
- It must not reuse the `loading-gif-file` id: `playwright.helper.ts` and several e2e specs locate that
  id strictly, and a second element carrying it fails them.

### 2. Keep the indicator up through the boot load

- The shell — nav bar, router outlet, and therefore the view's own spinner — sits behind
  `@if (isInitialized())`, and `isInitialized` is only set in the `finally` of `loadOnBoot()`. The whole
  restore, parse and build of a session runs with nothing at all on screen, which is the long white
  stretch: on a large project that is over ten seconds.
- Render a boot indicator in the `@else` branch and show the phase the load already publishes through
  `loadPhase$`, so the boot says what it is doing rather than showing white.

### 3. Cover the whole application while loading

- The view spinner is positioned below the top bar (`top-[var(--cc-bars-height,49px)]`), so the nav bar
  stays live while the map behind it is not ready.
- Cover the viewport instead, and centre the spinner properly rather than with the `mt-[22%]` offset that
  the old top offset needed.
- Only the geometry changes. When the spinner appears and disappears is deliberate and stays untouched.

## Steps

- [x] Complete Task 1: Paint something before Angular has booted
- [x] Complete Task 2: Keep the indicator up through the boot load
- [x] Complete Task 3: Cover the whole application while loading
- [x] Update `visualization/CHANGELOG.md` (rewrite the existing unreleased loader entry)
- [x] Full gate green: `npm run format:check`, `npm test`, `npm run lint`, `npx tsc --noEmit`

## Notes

- The boot indicator and the view spinner are two different elements on purpose: the view spinner needs a
  `ViewId` to know which view it is waiting for, and during boot there is no view yet.

- Verified in a browser against the built app (`scratchpad/checkBootLoader.mjs`), loading a 44 MB file:

  ```
  samples with nothing on screen, before the load settled    0
  boot indicator                 first seen @ 72 ms, naming "Restoring your session"
  view spinner                   top 0 px, height 1000 of a 1000 px viewport
  placeholder                    removed by Angular, not present at the end
  ```

  The static placeholder cannot be caught on localhost, where the bundle is parsed within about 70 ms —
  the harness takes `SLOW_BUNDLE_MS` to delay the scripts and reproduce the cold-cache case it exists for.
  With the scripts held back by 1.5 s the whole chain is visible, and hands over without a gap:

  ```
  placeholder        on screen from 71 ms to 1570 ms   (the bundle is still arriving)
  boot indicator     from 1630 ms                      ("Restoring your session")
  view spinner       until the map is ready            (top 0, full viewport height)
  samples with nothing on screen: 0
  ```
