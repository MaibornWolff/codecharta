---
name: Progress bar survives parallel updates
issue: -
state: complete
version: -
---

## Goal

A parser that reports progress from several threads no longer crashes in `ProgressTracker`: one `unifiedparser` run
on a Vue project aborted with `IllegalArgumentException` from `String.repeat`.

## Tasks

### 1. Reproduce
- `getClearingSpaces` compares and then subtracts `lastLineLength`, which another thread can raise in between; the
  count turns negative
- Test: while one update is held in printing, a second one must not start printing

### 2. Fix
- One update at a time: the line length a call clears against is the one of the line printed before it

### 3. Verify and note
- Analysis tests and `ktlintCheck`
- Changelog entry under Fixed

## Steps

- [x] Complete Task 1: Reproduce
- [x] Complete Task 2: Fix
- [x] Complete Task 3: Verify and note

## Review Feedback Addressed

## Notes

- A stress test with up to 400 threads hit the race in 2 of about 30 runs of the unfixed code, too rarely to guard
  anything; the test holds the first update inside `System.err.print` instead and fails every time without the fix
- `updateProgress` is `@Synchronized`: the same tracker is shared by the worker threads of `unifiedparser`,
  `domainlanguageparser` and `dependencyparser`
- Verified: analysis unit tests and `ktlintCheck`
