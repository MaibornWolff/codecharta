---
name: add-delphi-support
issue:
state: progress
version:
---

## Goal

Wire up the `Language.DELPHI` support added to TreesitterLibrary so the UnifiedParser
discovers and parses `.pas` and `.dpr` files (metrics only). Validate locally via a
Gradle composite build; the JitPack version bump is out of scope and tracked as a
follow-up.

## Context

- Delphi is fully implemented in TreesitterLibrary (`languages/delphi/DelphiDefinition.kt`)
  but only present in the `[Unreleased]` section of TSE's CHANGELOG. Latest TSE tag is
  `v0.6.0`; codecharta currently pins `v0.4.1`.
- Repository directory casing: the sibling repo on disk is `TreesitterLibrary`
  (lowercase second `s`). Case-sensitive filesystems (Linux CI) require the exact
  spelling.
- TSE registers Delphi as `DELPHI(primaryExtension = ".pas", otherExtensions = setOf(".dpr"))`.
- Integration shape mirrors completed `plans/add-tsx-support.md`: extend
  `FileExtension`, register a collector, add an adapter mapping, plus tests, golden
  fixtures, docs, and changelog.
- A Delphi-specific `CalculationConfig` quirk (avoid double-counting message-chain
  calls when `exprDot` sits under `exprCall`) is already handled inside TSE's
  `DelphiDefinition` — no codecharta-side handling needed.

## Out of Scope

- Bumping `UnifiedParser/build.gradle.kts` from `TreeSitterExcavationSite:v0.4.1` to a
  Delphi-enabled tag. Composite build supersedes JitPack locally; production bump is
  a follow-up after TSE cuts the next release.
- Wiring TSE's extraction or dependency APIs for Delphi. Codecharta's UnifiedParser
  consumes only the metrics API today, and this plan keeps that scope.
- Visualization changes. The `.cc.json` output format is unchanged.

## Architecture / Touch-Points

```
analysis/
├── model/.../FileExtension.kt                                       (add DELPHI)
├── analysers/parsers/UnifiedParser/
│   ├── build.gradle.kts                                             (composite-build edit, REVERT)
│   └── src/
│       ├── main/.../metriccollectors/
│       │   ├── AvailableCollectors.kt                               (register DELPHI)
│       │   └── TreeSitterAdapter.kt                                 (FileExtension.DELPHI -> Language.DELPHI)
│       └── test/
│           ├── kotlin/.../metriccollectors/
│           │   ├── DelphiCollectorTest.kt                           (NEW)
│           │   └── TreeSitterAdapterTest.kt                         (extend mappings/supported assertions)
│           └── resources/languageSamples/
│               ├── delphiSample.pas                                 (NEW fixture)
│               └── delphiSample.cc.json                             (NEW golden file)
├── settings.gradle.kts                                              (composite-build edit, REVERT)
└── CHANGELOG.md                                                     (add [unreleased] entry)

analysers/parsers/UnifiedParser/README.md                            (supported-languages row)
gh-pages/_docs/05-parser/05-unified.md                               (supported-languages row)
```

Test pattern reference: `analysers/parsers/UnifiedParser/src/test/kotlin/.../metriccollectors/JavaCollectorTest.kt`
mirrors what `DelphiCollectorTest.kt` should look like.

## Tasks

### 1. Phase 1 — Local composite build (uncommitted scaffolding)

Wire codecharta's Gradle build to consume TreesitterLibrary HEAD locally so Delphi is
on the classpath while iterating. **All edits in this phase must be reverted in
Phase 5 before staging any commit.**

- File: `analysis/settings.gradle.kts` — add `includeBuild("../../TreesitterLibrary")`
  (path relative to `analysis/`; adjust if your layout differs. Note the casing —
  directory is `TreesitterLibrary`, not `TreeSitterLibrary`)
- File: `analysis/analysers/parsers/UnifiedParser/build.gradle.kts` — replace
  `implementation("com.github.MaibornWolff:TreeSitterExcavationSite:v0.4.1")` with
  `implementation("de.maibornwolff.treesitter.excavationsite:treesitter-excavationsite")`
  (composite-build coordinate, per `TreeSitterLibrary/.claude/rules/dependency-migration.md`)
- Verify the composite build resolves and `Language.DELPHI` is reachable:
  ```bash
  cd analysis && ./gradlew :analysers:parsers:UnifiedParser:compileKotlin
  ```

### 2. Phase 2 — Wire Delphi into UnifiedParser

Three small, mechanical edits matching the TSX precedent.

- File: `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/serialization/FileExtension.kt`
  - Add `DELPHI(".pas", setOf(".dpr"))` (placement next to other source-language entries)
- File: `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/.../metriccollectors/AvailableCollectors.kt`
  - Add `DELPHI(FileExtension.DELPHI, { TreeSitterLibraryCollector(Language.DELPHI) })`
- File: `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/.../metriccollectors/TreeSitterAdapter.kt`
  - Add `FileExtension.DELPHI -> Language.DELPHI` to `getLanguageForExtension(...)`

### 3. Phase 3 — Tests & golden fixtures

Mirror `JavaCollectorTest` for the unit-level collector test; mirror existing
`languageSamples/*` for the parameterized end-to-end test.

- New file: `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/.../metriccollectors/DelphiCollectorTest.kt`
  - Construct `TreeSitterLibraryCollector(Language.DELPHI)`
  - At minimum: `should count if statements for complexity`, `should count comments for comment_lines`,
    `should count procedure declarations for number_of_functions`, `should detect message chains`
    (the `exprDot`/`exprCall` quirk in `DelphiDefinition` is worth one targeted assertion to
    confirm chains aren't double-counted)
- Update: `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/.../metriccollectors/TreeSitterAdapterTest.kt`
  - Add `FileExtension.DELPHI to Language.DELPHI` in `should map all supported FileExtensions to Languages`
  - Add `FileExtension.DELPHI` to the `supportedExtensions` list in
    `should return true for supported FileExtensions`
- New fixture: `analysis/analysers/parsers/UnifiedParser/src/test/resources/languageSamples/delphiSample.pas`
  - Small but representative unit: a `unit` header, one `procedure`, one `function`, one `if`/`for`,
    one `//` comment, one `{ }` comment, one `'...'` string. Use `.pas` (typical case);
    `.dpr` is covered transitively by the FileExtension entry.
- New golden: `analysis/analysers/parsers/UnifiedParser/src/test/resources/languageSamples/delphiSample.cc.json`
  - Generate by running the parameterized test once and capturing actual output, then commit.
    Verify metric values are sensible (compare against `pythonSample.cc.json` shape).
- Update: `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/.../UnifiedParserTest.kt`
  - Add `Arguments.of("delphi", ".pas")` to `provideSupportedLanguages()`

### 4. Phase 4 — Docs & changelog

- File: `analysis/analysers/parsers/UnifiedParser/README.md`
  - Add row to "Supported Languages" table: `| Delphi       | .pas, .dpr                             |`
- File: `gh-pages/_docs/05-parser/05-unified.md`
  - Add the same row to its "Supported Languages" table (around line 17–36)
  - Add a `#### Delphi (.pas, .dpr)` subsection to each of the five per-language
    sections: **Complexity**, **Comment Lines**, **Number of Functions**, **Parameters
    per Function**, **Message Chains**. List the AST node types lifted directly
    from `TreesitterLibrary/.../languages/delphi/DelphiMetricMapping.kt` as the
    source of truth (e.g. `if`, `ifElse`, `for`, `foreach`, `while`, `case`,
    `caseCase`, `repeat`, `try`, `exceptionHandler` for control flow; binary
    `kAnd`/`kOr`/`kXor` for logical operators; `procedure`/`function`-shaped node
    types for functions). Match the formatting of the existing Swift/Kotlin
    subsections.
- File: `analysis/CHANGELOG.md`
  - Under `## [unreleased]` → `### Added 🚀`, add:
    `- Add Delphi support to UnifiedParser (.pas, .dpr)`
- Verify whether the root-level `/codecharta/CHANGELOG.md` also needs touching.
  Precedent (`plans/add-tsx-support.md`) does not mention it, and recent feature
  entries (e.g. Swift, Objective-C) live only in `analysis/CHANGELOG.md`. Default:
  skip the root CHANGELOG. Touch it only if a maintainer requests it during review.

### 5. Phase 5 — Revert composite-build scaffolding

Before staging any commit: revert the two Phase 1 edits so codecharta keeps consuming
TSE via JitPack at `v0.4.1`. **Do not commit until reverted.**

- File: `analysis/settings.gradle.kts` — remove `includeBuild("../../TreesitterLibrary")`
- File: `analysis/analysers/parsers/UnifiedParser/build.gradle.kts` — restore
  `implementation("com.github.MaibornWolff:TreeSitterExcavationSite:v0.4.1")`
- Confirm via `git diff -- analysis/settings.gradle.kts analysis/analysers/parsers/UnifiedParser/build.gradle.kts`
  that no composite-build artifacts remain.

**Follow-up (NOT covered by this plan)**: cut TSE `v0.7.0` (or equivalent tag
containing Delphi), then bump
`UnifiedParser/build.gradle.kts:12` to that tag. Without that follow-up the changes
in this plan compile locally but will fail on CI.

## Steps

- [x] **Phase 1**: Add `includeBuild` to `analysis/settings.gradle.kts` (uncommitted)
- [x] **Phase 1**: Swap UnifiedParser dependency to composite-build coordinate (uncommitted)
- [x] **Phase 1**: Bump root `analysis/build.gradle.kts` `jvmToolchain(17)` → `jvmToolchain(21)` (uncommitted; required because TSE 0.6.0 targets JVM 21)
- [x] **Phase 1**: `./gradlew :analysers:parsers:UnifiedParser:compileKotlin` succeeds with `Language.DELPHI` reachable
- [x] **Phase 2**: Add `DELPHI` to `FileExtension`
- [x] **Phase 2**: Register `DELPHI` in `AvailableCollectors`
- [x] **Phase 2**: Add Delphi mapping in `TreeSitterAdapter`
- [x] **Phase 3**: Write `DelphiCollectorTest` (covers complexity, comments, functions, message chains)
- [x] **Phase 3**: Add `FileExtension.DELPHI to Language.DELPHI` to `TreeSitterAdapterTest.should map all supported FileExtensions to Languages`
- [x] **Phase 3**: Add `FileExtension.DELPHI` to `TreeSitterAdapterTest.should return true for supported FileExtensions`
- [x] **Phase 3**: Add `delphiSample.pas` fixture
- [x] **Phase 3**: Add `delphiSample.cc.json` golden file (captured from first run)
- [x] **Phase 3**: Add `("delphi", ".pas")` to `UnifiedParserTest.provideSupportedLanguages`
- [x] **Phase 3**: `./gradlew :analysers:parsers:UnifiedParser:test` is green
- [x] **Phase 3**: `./gradlew :analysers:parsers:UnifiedParser:ktlintCheck` is clean
- [x] **Phase 4**: Update `analysers/parsers/UnifiedParser/README.md` languages table
- [x] **Phase 4**: Update `gh-pages/_docs/05-parser/05-unified.md` languages table
- [x] **Phase 4**: Add Delphi subsection under **Complexity** in `gh-pages/_docs/05-parser/05-unified.md`
- [x] **Phase 4**: Add Delphi subsection under **Comment Lines** in `gh-pages/_docs/05-parser/05-unified.md`
- [x] **Phase 4**: Add Delphi subsection under **Number of Functions** in `gh-pages/_docs/05-parser/05-unified.md`
- [x] **Phase 4**: Add Delphi subsection under **Parameters per Function** in `gh-pages/_docs/05-parser/05-unified.md`
- [x] **Phase 4**: Add Delphi subsection under **Message Chains** in `gh-pages/_docs/05-parser/05-unified.md`
- [x] **Phase 4**: Add `[unreleased]` Added entry to `analysis/CHANGELOG.md`
- [-] **Phase 5**: Revert `analysis/settings.gradle.kts` composite-build edit
- [ ] **Phase 5**: Revert `UnifiedParser/build.gradle.kts` to JitPack `v0.4.1`
- [x] **Phase 5**: Revert `analysis/build.gradle.kts` `jvmToolchain(21)` → `jvmToolchain(17)` (TSE bumped down to 17 upstream)
- [ ] **Phase 5**: `git diff` shows no composite-build artifacts in tracked files

## Manual Verification

(Run after Phase 3 succeeds, before reverting in Phase 5.)

- [ ] Drop a real-world `.pas` file into a temp directory and run:
  ```bash
  cd analysis && ./gradlew installDist
  ./build/install/codecharta-analysis/bin/ccsh unifiedparser <temp-dir> -o /tmp/delphi.cc.json --not-compressed
  ```
  Open the output and confirm: `complexity`, `loc`, `rloc`, `comment_lines`,
  `number_of_functions`, and per-function aggregations are populated and non-zero
  for files with code.
- [ ] Run the same against a `.dpr` project file and confirm it is also picked up.

## Notes

- Test pattern reference: `JavaCollectorTest.kt` is the canonical shape for new
  collector tests. Use `Assertions.assertThat(result.attributes[AvailableFileMetrics.X.metricName])`
  rather than raw string keys.
- Golden-file convention: existing `*Sample.cc.json` files are pretty-printed and
  use deterministic ordering. After capturing the first run, eyeball the metric
  values against the source rather than blindly committing.
- The `exprDot`/`exprCall` chain quirk lives in TSE's `DelphiDefinition`; if the
  message-chain assertion in `DelphiCollectorTest` fails, the bug is upstream in TSE,
  not in codecharta.
- If TSE's primary class for `.pas` parse errors (the asm/IFDEF recovery path noted
  in TSE's CHANGELOG) ever surfaces as a flaky metric, capture the offending file
  and report upstream — codecharta should not work around TSE bugs locally.
