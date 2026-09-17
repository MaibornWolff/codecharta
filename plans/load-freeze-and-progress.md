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
- Measured, this does **less than it sounds**: on a loading page `requestIdleCallback` fires after
  1 ms (`didTimeout=false`), so the write lands in the middle of the load, not after it. It is worth
  keeping for the small settings saves during normal use, but it is tasks 1 and 3 that actually keep
  the freeze away from the reader. Do not credit this one for the result.

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

- The other two paths, measured the same way after the fact:

  ```
  reload, restoring from IndexedDB   spinner hidden @ 2928 ms   0 long tasks after it
  first boot on a v21 database       spinner hidden @ 4388 ms   0 long tasks after it
                                     migration v21 -> v22       1477-1887 ms, all before the spinner
  ```

  The migration reads the old combined record and writes the files back out inside the upgrade
  transaction, and it is covered by the spinner. `scratchpad/profileMigration.mjs` seeds a v21
  database from a real state to reproduce it.

- **Boot on a big project runs close to the heap ceiling, and the save is what puts it there.**
  Measured on `netbeans.cc.json` (830 MB, 37,393 word-bank entries), first boot against a v21 database,
  three variants:

  ```
                                          boot work        peak JS heap (limit 4295 MB)
  splitting migration (as first written)   8867 ms          3909 MB
  no split, record still read              ~6 s less        3910 MB
  no split, record not read either         ~9 s less        3907 MB
  ```

  The peak does not move. It is not the migration: those copies are garbage by the time it matters and
  the collector takes them (the heap drops to 1489 MB moments later). The peak is the post-load save
  structured-cloning the whole file set (~6.3 s, ~940 MB) on top of a boot that already holds ~2.97 GB.
  A v21 boot carries a higher baseline than a plain reload (2441 MB) because the old record still holds
  the 631 MB word bank, which is dropped on read but not yet collected.

  So the two boot commits are worth keeping — they remove real copies and ~9 s of work — but neither is
  demonstrably the crash fix, and the crash itself never reproduced: the renderer survived four runs at
  91% of the ceiling. **Not yet done:** a restore writes the files record straight back with the very
  files it just read out of it. Skipping that save would remove the ~940 MB clone from every reload,
  which is the only measured lever left on the peak.

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
