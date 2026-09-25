---
name: Rebase on main and mark the DependencyParser experimental
issue: <#issueid>
state: complete
version: 1
---

## Goal

Bring the branch up to date with main and ship `ccsh dependencyparser` as experimental: still listed
everywhere, but labelled so users know its output may change. Visualization stays unlabelled.

## Tasks

### 1. Rebase on main
- Resolve the conflicts in both CHANGELOGs, `PathUtils.kt`, `edges.merger.ts` and `indexedDBWriter(.spec).ts`
- Keep main's IndexedDB migrations (up to v25); since the files split the upgrade never reads the loaded files, so
  the branch's `dependencyLevels` backfill moves from an upgrade transform to the read path (no DB version bump)

### 2. Label the DependencyParser experimental
- Mark it in its ccsh description (shows in `ccsh -h`, `ccsh dependencyparser -h` and the interactive picker)
- Mark it in the analysis README, the parser README, the gh-pages docs and the CHANGELOG entry

## Steps

- [x] Complete Task 1: Rebase on main, `dependencyLevels` backfill moved to the read path
- [x] Complete Task 2: Label the DependencyParser experimental

## Notes

- Nothing is pushed; the branch needs a `git push --force-with-lease` after review
- Verified: jest (484 suites, coverage gate), `npm run lint`, `tsc --noEmit`, `npm run format:check`, `./gradlew ktlintCheck test`
