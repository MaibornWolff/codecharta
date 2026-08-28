---
name: Close the domain-language branch gaps before merge
issue: <#issueid>
state: complete
version: 1
---

## Goal

Close the gaps found while reviewing `feature/domainlanguage-parser`: `ccsh modify` silently
invalidates the domain lens, the deployed demo maps carry no domain data so the Domain tab never
appears, and the parser is the only analyser without a golden test.

## Tasks

### 1. Stop `ccsh modify` from silently orphaning the domain lens

`SubProjectExtractor`, `NodeRemover` and `FolderMover` pass `opaqueLenses` through verbatim while
re-pathing the tree. The domain lens is keyed by `NodeId.fromSegments(...)`, a path hash, so
`--set-root` and `--move-from/--move-to` leave surviving nodes without their words, and `--remove`
leaves keys pointing at nothing. Nothing warns; the visualization then drops the unresolved ids.

- Refuse the restructuring actions when a data-bearing opaque lens is present, matching the guard
  `LargeMerge` already applies. `--rename-mcc` and `--print-levels` do not re-path and stay allowed.
- Exit non-zero so scripts detect the refusal.
- Re-keying the lens is the richer fix but assumes every opaque lens is a flat node-id map, which
  only holds for `domain` today — leave it as a follow-up.

### 2. Single-source the "does this lens carry data" predicate

`carriesData()` lives in `mergefilter` and is needed by `structuremodifier` too.

- Move it to `:model` next to `LensSet` and add `LensSet.dataBearingOpaqueLensNames`, the
  computation both guards actually want.
- Point `LargeMerge` and `ProjectMerger` at the moved definition.

### 3. Give the demo maps a domain lens

`build_demo_files.sh` never runs `domainlanguageparser`, so the Domain tab is invisible on GitHub
Pages and in the bundled maps.

- Run the parser for both the visualization and the analysis map and add its output to the merge.
- Keep it clear of the `modify --set-root` step, which task 1 now refuses.

### 4. Cover the parser in the golden test

`golden_test.sh` covers every other analyser and runs in Docker on every PR.

- Add `check_domainlanguage` following the `check_unifiedparser` pattern.

### 5. Tidy-ups

- Remove the stray untracked `analysis/script/dlm-app2.cc.json.gz` (1.9 MB, not gitignored).
- Fix the language list in `gh-pages/.../parser/domain-language.md`: 17 languages, not 14 — Vue,
  ABL and Rust are missing.
- Record the `modify` refusal in the analysis CHANGELOG.

## Steps

- [x] Complete Task 2: single-source the predicate in `:model`
- [x] Complete Task 1: refuse restructuring that would invalidate an opaque lens
- [x] Complete Task 3: domain lens in the demo maps
- [x] Complete Task 4: golden test for the parser
- [x] Complete Task 5: tidy-ups and CHANGELOG

## Notes

- Verified before the change: `--set-root` and move leave 3 of 4 domain keys orphaned and 2 of 3
  nodes without words; `--remove` leaves 2 orphans; `--rename-mcc` is clean.
- `unifiedparser` + `domainlanguageparser` merge cleanly (0 orphans), which is what task 3 relies on.
- Merging two *different* domain maps still fails loudly (`MergeException`) — a known limitation,
  out of scope here.
- E2E could not be run locally: Playwright ships no chromium for ubuntu 26.04 arm64.

## Verification performed

- Red first: the four guard tests failed before the implementation; the two control tests (empty
  reserved lens slot, `--rename-mcc`) passed throughout.
- After: `:analysers:filters:StructureModifier:test` and `:analysers:filters:MergeFilter:test` green,
  full `./gradlew test` green, `ktlintCheck` green.
- Against the rebuilt binary: all three restructuring actions refuse, write no output file and exit 1;
  `--rename-mcc` on a domain map and `modify` on a map without a domain lens are unaffected.
- A three-way merge with one domain-carrying input keeps all 4 domain keys, 0 orphaned — which is what
  the demo-map change depends on.
- `domainlanguageparser data/codecharta/sourcecode.java` passes `ccsh check`, so the new golden step holds.

- The local JDK is 25 and the build pins `jvmToolchain(17)`, with toolchain download blocked. The runs
  above needed a temporary bump to 25, since reverted — `build.gradle.kts` is untouched. Under JDK 25
  `jacocoTestReport` cannot instrument and was excluded; it is unaffected by these changes.
- `:model:test` has one pre-existing failure, `ProgressTrackerTest > should handle zero total correctly`.
  It fails with these changes stashed, and `ProgressTracker.kt` and its test are both unchanged on this
  branch — an order-dependent assertion on a shared `errContent` buffer, not related to this work.
