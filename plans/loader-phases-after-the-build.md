---
name: loader-phases-after-the-build
issue: <none>
state: complete
version: unreleased
---

## Goal

Keep the spinner's phase text honest for the whole wait. Today it goes blank once the map is
committed, which is the longest part of a load: the first frame still has to be drawn and the session
still has to be written (~7 s on the first boot after an update).

## Tasks

### 1. Derive the later phases where the spinner's visibility is decided

- `LoadingFileProgressSpinnerService` already combines the reasons the spinner is up (view readiness,
  `isLoadingFile`, pending heavy dispatch, scenario application, `isPendingSave$`). Add a `phase$(view)`
  beside `isLoading$(view)` that turns the same reasons into text.
- An announced phase (reading, restoring, building) wins. Otherwise: a pending save first, because it
  blocks the main thread, then a stale view or a pending dispatch as the draw.
- Per view, since the domain view draws a word cloud, not a map.
- Do not touch `isLoading$` — when the spinner shows and hides stays exactly as it is.

### 2. Let the component read the phase from the service

- Replace the direct `loadPhase$` subscription with `phase$(view)`.

### 3. Changelog

- Rewrite the existing unreleased loader entry to cover the finished behaviour.

## Steps

- [x] Complete Task 1: Derive the later phases in `LoadingFileProgressSpinnerService`
- [x] Complete Task 2: Let the component read the phase from the service
- [x] Complete Task 3: Rewrite the unreleased changelog entry
- [x] Full gate green: `npm run format:check`, `npm test`, `npm run lint`, `npx tsc --noEmit`

## Notes

- `clearLoadPhase()` stays where it is at the end of `commit()` / `commitRestoredFiles()`: the derived
  phase takes over in the same task, because `filesLoaded` marks every view stale synchronously.
- Applying a scenario shows the spinner without marking a view stale, so that one stays unlabelled. It
  is not a load phase.
- On boot the phase stays "Restoring your session" through the build; only the upload path announces
  "Building the map". Left alone — labelling it means another `await nextPaint()` on the boot path.
