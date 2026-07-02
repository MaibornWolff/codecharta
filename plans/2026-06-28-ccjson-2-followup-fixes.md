---
name: cc.json 2.0 follow-up fixes (opaque-lens carry-through, strict schema, golden coverage, drop SourceCodeParser)
issue:
state: complete
version: 1
---

## Goal

Close four reviewed gaps from the cc.json 2.0 migration (visualization stays out of scope, on 1.5):
preserve opaque lenses / clusters / commitHash through the filter rebuild, tighten the everit 2.0
schema, extend the golden CLI harness to the new 2.0 producers, and fully remove the dead
`SourceCodeParser` module. Each is verified against the codebase below and lands TDD + green.

## Tasks

### 1. Thread opaqueLenses / clusters / commitHash through the filter rebuild (#2)

Root cause: every filter rebuilds via `ProjectBuilder` whose `build()` reconstructs lenses from the
legacy flat maps (`LensSet.fromLegacy`), dropping `lenses.opaqueLenses` (domain/security/unknown),
`metrics.clusters`, and `meta.commitHash`. `LargeMerge` already preserves them (it builds `Project`
directly) — no change there.

- `ProjectBuilder`: add private `clusters`/`opaqueLenses`/`commitHash` + fluent `withClusters`/
  `withOpaqueLenses`/`withCommitHash`. `build()` injects them: `LensSet.fromLegacy(...)` then
  `.copy(metrics = it.metrics.copy(clusters = clusters), opaqueLenses = opaqueLenses)`, and
  `Project(..., commitHash = commitHash)`.
- `ProjectBuilder.fromLenses`: add `opaqueLenses` + `commitHash` params; carry `metrics.clusters` and
  both through the new setters (single-input filters get pure passthrough).
- 5 call sites pass the source project's data: `SubProjectExtractor`, `NodeRemover`, `FolderMover`,
  `MetricRenamer` (StructureModifier) and `EdgeProjectBuilder` (EdgeFilter) →
  `opaqueLenses = project.lenses.opaqueLenses, commitHash = project.commitHash`.
- `ProjectMerger` (multi-input): `.withClusters(mergedMetricsLens.clusters)` (already concatenated by
  `MetricsLens.merge`), `.withOpaqueLenses(<unioned>)`, `.withCommitHash(<first non-null>)`.
- New merge helper in `AttributeMerging.kt`: `mergeOpaqueLenses(first, second)` — union by lens name,
  keep the reference (first) on a same-name collision and `Logger.warn`.
- Tests: opaque lens + clusters + commitHash survive `modify` (each op), `edgefilter`, and `merge`
  (incl. a same-name opaque-lens collision warning).

### 2. Tighten the everit 2.0 schema (#3, strict)

File: `analysers/tools/ValidationTool/src/main/resources/cc.json`. Tighten ONLY the 2.0 branch; the
1.5 branch stays permissive (its `validFile.cc.json` fixture is `apiVersion 0.1`; legacy 0.x/1.x must
still validate — so no version `const`/`pattern` on `Data`).

- `Meta.apiVersion`: `const "2.0"` (this alone rejects a 2.0-shaped file mislabeled `1.5`).
- `ExportCCFile2.files`: `minItems: 1, maxItems: 1` (exactly one root; readers do `files.single()`).
- `additionalProperties: false` on `Meta`, `FileNode`, `Edge2`, `MetricsLens`, `DependencyLens`,
  `AttributeDescriptor`, `ExportCCFile2`. NOT on `Lenses` (must stay open for opaque-lens forward-compat).
- Tests (`EveritValidatorTest`): reject a `{meta,files,lenses}` doc with `apiVersion:"1.5"`; reject a
  typo'd/extra key (e.g. `childrenn`, stray meta key); reject `files:[]` and a two-root `files`.
  Confirm real ccsh 2.0 output + the existing round-trip test still pass.

### 3. Extend the golden CLI harness to the new 2.0 producers (#4)

File: `analysis/test/golden_test.sh` (run by the `integrationTest` Gradle Exec task on the built dist).

- `check_unifiedparser`: `ccsh unifiedparser ${DATA}/sourcecode.java -o … ` → `validate`.
- `check_dependacharta`: new fixture `test/data/codecharta/dependacharta.dc.json` (copy of importer
  `simple.dc.json`); `ccsh dependachartaimport <fixture> -o …` → `validate`.
- `check_convert`: `ccsh convert ${DATA}/mergefilter_a.cc.json -o …` (1.2 → 2.0) → `validate`.
- Wire all three into `run_tests()`. Verify command names/flags against each analyser, then prove the
  three via `:ccsh:installDist` + manual invocation (full 8-min golden run is optional here).

### 4. Fully remove the dead SourceCodeParser module (#5)

It is a deprecated no-op stub (`README`: "DEPRECATED AND REMOVED"). Remove every reference:

- `Ccsh.kt`: import (l.17), subcommand entry (l.56), `registerGenerator(SourceCodeParser())` (l.271).
- `settings.gradle.kts` (l.22) and `ccsh/build.gradle.kts` (l.21) module includes/deps.
- `PicocliAnalyserRepositoryTest.kt`: import (l.17) + the two expected-analyser list entries (l.69, l.97).
- Delete the 4 tracked module files (`git rm -r analysers/parsers/SourceCodeParser`).
- `README.md`: drop the SourceCodeParser table row (l.19); reword/remove the SonarJava note (l.166).
- `CHANGELOG.md`: add a Removed entry. Keep `test/data/codecharta/sourcecode.java` (reused by Task 3).
- Grep the whole tree (excluding the GitLog `codeCharta.log` fixture + `build/`) to confirm no straggler.

## Steps

- [x] Task 1: opaque/clusters/commitHash carry-through (model + 5 filters + merger + helper + tests)
- [x] Task 2: strict 2.0 schema + validator tests
- [x] Task 3: golden harness checks + dependacharta fixture
- [x] Task 4: remove SourceCodeParser everywhere
- [x] Prove Task 3 + #5 + #3 via a fresh `:ccsh:installDist`: unifiedparser/dependachartaimport/convert
      all emit valid 2.0; `sourcecodeparser` is unknown; `ccsh check` rejects a mislabeled 2.0 file
- [x] `./gradlew test ktlintCheck` from `analysis/` all green — 2041 tests, 0 failures, 0 errors, 1 skipped

## Notes (added during implementation)

- Filters now reference `com.google.gson.JsonElement` (via the model's opaque-lens API); since
  subprojects apply only the `kotlin` plugin (no `java-library`, so no `api()` configuration), gson was
  added as an `implementation` dep to MergeFilter/StructureModifier/EdgeFilter rather than re-exported
  from model.
- A stale `1.143.0` install dist in the working tree masked the changes (emitted 1.5, bundled the stub);
  a clean `:ccsh:installDist` produced the correct 2.0-default dist used for verification.
- Follow-up (asked after the four tasks): besides the opaque-lens/commitHash drop fixed under #2, the
  `edgefilter` also dropped every node's `contentHash` (it rebuilt nodes without their checksum). Fixed
  in `EdgeProjectBuilder` (`Node(... , checksum = it.checksum)`), with a test asserting both survive.
- Follow-up — **fully removed the 1.5 writer** (PR part 1; the visualization migrates to 2.0 in part 2,
  same PR). Deleted `ProjectToCcJson15Mapper`, `dto/CcJson15`, `CcJson15Gson`, and the now-dead
  `BlacklistTypeSerializer` (2.0 drops blacklist); dropped the `apiVersion` param from `ProjectSerializer`
  so it can only emit 2.0; removed the `ConvertTool` explicit `TWO_ZERO`. 1.5 **reading** is kept
  (every reader still auto-detects 1.5/2.0). Tests that used the 1.5 writer as an oracle/fixture were
  reworked: `CcJsonV2SerializationTest.semantic15` → a 2.0-serialization comparison; the "reads 1.x"
  cases now use the static `example_api_version_1.3.cc.json` fixture / an inline legacy fixture; the
  1.5-output tests were deleted.

## Notes

- Decisions confirmed with maintainer: full module removal (#5), strict schema (#3), all filters incl.
  merge with keep-first+warn opaque-lens conflict policy (#2).
- Deviation recorded: #3 `const` is applied to the 2.0 branch only; the 1.5 branch keeps an
  unconstrained `apiVersion` because the suite still reads/validates legacy 0.x/1.x files (e.g. the
  `validFile.cc.json` 0.1 fixture). The one-direction fix still closes the mislabel hole that matters.
- Visualization is intentionally untouched (separate future story); 2.0 stays analysis-first.
- Tidy First: schema/test/harness/removal are largely independent; commit per logical unit when asked.
