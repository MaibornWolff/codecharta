---
name: load-freeze-and-progress
issue: <none>
state: complete
version: unreleased
---

## Goal

Stop the map freezing for the length of a state save right after the loading spinner disappears, and
say what the loader is doing while it works instead of showing an unlabelled spinner.

## Tasks

Measured against the real built app (Playwright, 21,909 nodes / 2.58M domain word entries), driving a
file through `?file=`:

```
MARK spinner-hidden @ 2639 ms
@2639 ms  store=ccstate  BLOCKED 806 ms  (+0 ms vs spinner)
```

The block is `IDBObjectStore.put`, which structured-clones the whole `CcState` synchronously on the
main thread. It is the only long task after the spinner clears, and it starts the same millisecond.

### 1. Give the loaded files their own persisted record

- `writeCcState` persists one record holding the entire `CcState`, `files` included — so every colour,
  metric or word-cloud change re-clones every loaded map.
- Split the record in two, both in the existing `ccstate` store: the settings record (the state minus
  `files`) and a files record. `readCcState` recombines them; `deleteCcState` clears both.
- Needs a `DB_VERSION` bump and a migration that moves `state.files` out of the existing record.
- Write the files record only for actions that can change files: `fileActions` **and** `setState`
  (`setState` carries `files` — a map reset dispatches the whole default state through it).

### 2. Save when the browser is idle

- The save fires 500 ms after the load's file actions, which is right as the spinner clears.
- Schedule the write through `requestIdleCallback` with a timeout fallback, so it lands in a gap
  rather than the moment the reader first reaches for the map. Bypass it under test, the way
  `dispatchAfterPaint` already does.

### 3. Keep the spinner up while a save is still in flight

- Belt and braces for task 1: whatever the save still costs, the reader should not be invited to
  interact during it. Add the pending save to what `LoadingFileProgressSpinnerService` already
  combines (view readiness, `isLoadingFile`, pending heavy dispatch, scenario application).

### 4. Say what the loader is doing

- One small store holding the current phase, rendered under the spinner.
- Only phases that can actually paint are worth showing: the per-file read loop in
  `UploadFilesService.readNameDataPairs` is already async and runs file by file, so
  "Reading <name> (2 of 3)" is real. Set "Building the map" and yield one paint before the
  synchronous commit.
- No percentages: parse, merge, decorate and render happen in one synchronous block with no
  measurable progress, and a bar that sticks is worse than a phase that is honest.

## Steps

- [x] Complete Task 1: Give the loaded files their own persisted record
- [x] Complete Task 2: Save when the browser is idle
- [x] Complete Task 3: Keep the spinner up while a save is still in flight
- [x] Complete Task 4: Say what the loader is doing
- [x] Update `visualization/CHANGELOG.md`
- [x] Full gate green: `npm run format:check`, `npm test`, `npm run lint`, `npx tsc --noEmit`
- [x] Re-profile to confirm no long task remains after the spinner

## Notes

- Result, same project and harness as the reproduction:

  ```
  before   spinner hidden @ 2639 ms   then 806 ms blocked, +0 ms after it cleared
  after    spinner hidden @ 3874 ms   0 long tasks, 0 ms blocked after it cleared
           settings record    0 ms    (was carrying every loaded map)
           files record    1214 ms    written 1220 ms BEFORE the spinner clears
  ```

  The spinner is up longer because it now covers work it used to hand to the reader as a frozen map.

- Reproduced with `scratchpad/profileLoad.mjs`, which instruments `IDBObjectStore.put`/`get` and marks
  when the spinner hides. It verifies the load end to end, so it is worth re-running after any change
  to the load pipeline — but only against a freshly built `dist`, and only when nothing else is
  competing for the CPU.
- The load is janky before the spinner too — 3195 ms over 7 long tasks (parse 877 ms, then merge,
  decorate and render). Task 4 labels that wait; it does not shorten it. Shortening it is separate work.
- netbeans-sized files without a domain word bank never showed the freeze: the cost is the word bank,
  which is why this only bites projects that carry domain words.
- `filesLoaded` must stay dispatched synchronously with the `setFiles` burst, so no `await` may be
  introduced inside `LoadFilesUseCase.commit`.
