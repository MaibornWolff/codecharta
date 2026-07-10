---
date: 2026-06-29T09:35:11Z
git_commit: 76da06841d62ca271bdaea778fe890eb898cce5e
branch: main
topic: "Rust metrics support for the UnifiedParser"
tags: [plan, analysis, UnifiedParser, gh-pages, rust, treesitter]
status: complete
---

# Rust metrics support for the UnifiedParser Implementation Plan

## Overview

Add Rust (`.rs`) code-metrics support to CodeCharta's `unifiedparser`, consuming the new Rust
metrics from TreeSitterExcavationSite (TSE). During development CodeCharta builds against a **local
TSE** via a Gradle composite build; once TSE releases a version containing Rust metrics, a final
deferred phase swaps the local override for the released JitPack coordinate.

## Current State Analysis

- **TSE is ready.** `Language.RUST` (`.rs`) exists and `TreeSitterMetrics.parse(content, Language.RUST)`
  returns populated metrics. This lives on TSE branch `feat/rust-metric-support` and is **not yet
  released** (latest tag `v0.11.0`; Rust metrics unreleased).
- **CodeCharta pins an old TSE.** `analysis/analysers/parsers/UnifiedParser/build.gradle.kts:12`:
  `implementation("com.github.MaibornWolff:TreeSitterExcavationSite:v0.7.0")` — too old to contain
  `Language.RUST`, so the Rust code changes will not compile until CodeCharta points at local TSE.
- **Integration is small and additive.** Metrics are language-agnostic string keys copied straight
  through (`TreeSitterAdapter.convertToMutableNode`), so no new metric names / `AttributeDescriptors`
  are needed. Adding a language end-to-end touches three production files:
  - `analysis/model/.../serialization/FileExtension.kt:34` (central extension enum; ends at `DELPHI`)
  - `analysis/analysers/parsers/UnifiedParser/.../metriccollectors/AvailableCollectors.kt:29`
    (the enum `ProjectScanner.findCollectorForFileType` iterates to decide parsable files — the
    functional gate)
  - `analysis/analysers/parsers/UnifiedParser/.../metriccollectors/TreeSitterAdapter.kt:67`
    (`getLanguageForExtension` `when`; has `else -> null`)
- **No hidden compile risk.** The only other `when(FileExtension)` (`model/.../OutputFileHandler.kt`)
  has an `else`, so a new enum value does not break exhaustiveness.
- **Tests follow one consistent pattern** (golden `.cc.json` per language sample + parameterized
  test + mapping lists). See `UnifiedParserTest.kt:29`, `TreeSitterAdapterTest.kt`, and the
  `*CollectorTest.kt` files.
- **Build env:** Gradle 9.3.1; TSE pins `jvmToolchain(17)`, so a JDK 17 toolchain must be available
  for the composite build (already installed in this sandbox).

## Desired End State

`ccsh unifiedparser` parses `.rs` files and emits a `cc.json` with the same metric set as every other
language. Rust appears in `provideSupportedLanguages()` with a committed golden, in both mapping
lists, in the README/gh-pages support tables, in the gh-pages detailed-metric subsections, and in
`analysis/CHANGELOG.md`. During development everything is green against local TSE; the merge-ready
state (Phase 5) resolves Rust from a released TSE tag with no composite build.

## What We're NOT Doing

- No new metrics, `AttributeDescriptors`, or metric calculators (Rust reuses the language-agnostic set).
- No changes to TSE itself (already done on `feat/rust-metric-support`).
- No dependency/extraction-graph (DependaCharta) work — this is UnifiedParser **metrics** only.
- No visualization/frontend changes (it has no hardcoded UnifiedParser language list).
- Phase 5 (released-version switch) is **not executed now** — it is blocked on a TSE release.

## Architecture and Code Reuse

```
ccsh unifiedparser <path>
   └─ ProjectScanner.findCollectorForFileType(ext)   ── gate: AvailableCollectors
        └─ TreeSitterLibraryCollector(Language.RUST)
             └─ TreeSitterAdapter.collectMetricsForFile(file)
                  └─ getLanguageForFile() → Language.fromExtension(".rs")  [TSE, already works]
                  └─ TreeSitterMetrics.parse(content, Language.RUST)        [TSE, already works]
                  └─ convertToMutableNode() → metrics copied verbatim       [language-agnostic]
```

Composite-build override (chosen approach — keeps the JitPack line untouched; one-place toggle):

```kotlin
// analysis/settings.gradle.kts
includeBuild("../../TreeSitterExcavationSite") {
    dependencySubstitution {
        substitute(module("com.github.MaibornWolff:TreeSitterExcavationSite"))
            .using(project(":"))
    }
}
```

Affected files:

- `analysis/`
  - `settings.gradle.kts` — add `includeBuild` + `dependencySubstitution` block (Phase 1; removed in Phase 5)
  - `model/src/main/kotlin/de/maibornwolff/codecharta/serialization/FileExtension.kt` — add `RUST(".rs")`
  - `analysers/parsers/UnifiedParser/`
    - `build.gradle.kts` — **unchanged** in Phases 1–4; version bump only in Phase 5
    - `src/main/kotlin/.../metriccollectors/AvailableCollectors.kt` — add `RUST` collector entry
    - `src/main/kotlin/.../metriccollectors/TreeSitterAdapter.kt` — add `FileExtension.RUST -> Language.RUST`
    - `src/test/kotlin/.../metriccollectors/RustCollectorTest.kt` — new (mirror `GoCollectorTest`)
    - `src/test/kotlin/.../UnifiedParserTest.kt` — add `Arguments.of("rust", ".rs")`
    - `src/test/kotlin/.../metriccollectors/TreeSitterAdapterTest.kt` — add to `expectedMappings` + `supportedExtensions`
    - `src/test/resources/languageSamples/rustSample.rs` — new fixture
    - `src/test/resources/languageSamples/rustSample.cc.json` — new golden (generated by the parser)
    - `README.md` — add Rust row to Supported Languages
- `gh-pages/src/content/docs/docs/parser/unified.md` — table row + Rust entries in detailed subsections
- `analysis/CHANGELOG.md` — `## [unreleased] → ### Added 🚀` entry

## Performance Considerations

None. One additional enum entry and one already-supported grammar; per-file parsing cost is unchanged.

## Migration Notes

- Implement on a CodeCharta feature branch (e.g. `feat/rust-unifiedparser-support`); do not work on `main`.
- The composite-build override in `settings.gradle.kts` is **machine-specific** (relative path to a
  sibling checkout) and must not reach `main`. It is intentionally committed on the feature branch for
  reviewability and removed in Phase 5.
- The branch is not mergeable until TSE releases a Rust-metrics tag (Phase 5), because the committed
  Rust code requires a TSE version that contains `Language.RUST` with populated metrics.

## Phase 1: Wire CodeCharta to local TSE (composite build)

Unblocks compilation against the new Rust API. No CodeCharta code changes yet.

**Tasks**:
- [x] In `analysis/settings.gradle.kts`, add the `includeBuild("../../TreeSitterExcavationSite")`
      block with the `dependencySubstitution` mapping `com.github.MaibornWolff:TreeSitterExcavationSite`
      → `project(":")` (see Architecture snippet). Leave `UnifiedParser/build.gradle.kts:12` unchanged.
- [x] Ensure the local TSE checkout is on a branch containing Rust metrics (`feat/rust-metric-support`).

**Automated Verification**:
- [x] `./gradlew :analysers:parsers:UnifiedParser:dependencies --configuration runtimeClasspath` shows
      TSE resolved from the included build (`v0.7.0 -> project :TreeSitterExcavationSite`), not JitPack.
- [x] `./gradlew :analysers:parsers:UnifiedParser:compileKotlin` succeeds (TSE built locally under JDK 17).
- [x] `./gradlew :analysers:parsers:UnifiedParser:test` (existing suite) still passes against local TSE.

---

## Phase 2: Register Rust in the UnifiedParser

Dependencies: **Phase 1**

The three additive production changes plus a CodeCharta-side collector unit test.

**Tasks**:
- [x] `FileExtension.kt`: add a comma after the `DELPHI(...)` entry and add `RUST(".rs")` as the last constant.
- [x] `AvailableCollectors.kt`: add `RUST(FileExtension.RUST, { TreeSitterLibraryCollector(Language.RUST) })`
      (after the `DELPHI` entry; add the preceding comma).
- [x] `TreeSitterAdapter.kt` `getLanguageForExtension`: add `FileExtension.RUST -> Language.RUST` before `else -> null`.
- [x] Add `RustCollectorTest.kt` mirroring `GoCollectorTest.kt` (9 cases: complexity for if/&&/||, match arms,
      closure, comment_lines, number_of_functions incl. trait signatures, parameters excl. self, rloc-per-function, message chains).

```kotlin
// sanity examples (exact values verified against TSE RustMetricsTest)
collector.collectMetricsForFile(rs("fn f(x:i32){ if x>0 { } }"))
    .attributes[AvailableFileMetrics.COMPLEXITY.metricName]   // == 2.0 (1 fn + 1 if)
```

**Automated Verification**:
- [x] `RustCollectorTest` (Unit) passes (9/9).
- [x] `./gradlew :analysers:parsers:UnifiedParser:compileKotlin` and `:model:compileKotlin` succeed.
- [x] `./gradlew :model:ktlintCheck :analysers:parsers:UnifiedParser:ktlintCheck` passes.

---

## Phase 3: Golden fixture + parameterized & adapter tests

Dependencies: **Phase 2**

Wire Rust into the existing parameterized golden test and mapping-list tests.

**Tasks**:
- [x] Create `src/test/resources/languageSamples/rustSample.rs` — reused TSE's curated `rust_sample.rs`
      verbatim so values cross-check against TSE's verified golden.
- [x] Generate `rustSample.cc.json` via `ccsh unifiedparser .../rustSample.rs`. Sanity-checked:
      complexity 6.0, logic_complexity 0.0, comment_lines 11.0, number_of_functions 6.0,
      message_chains 0.0, rloc 50.0, loc 76.0 — all match TSE's golden exactly.
- [x] `UnifiedParserTest.kt` `provideSupportedLanguages()`: add `Arguments.of("rust", ".rs")`.
- [x] `TreeSitterAdapterTest.kt`: add `FileExtension.RUST to Language.RUST` to `expectedMappings`
      and `FileExtension.RUST` to the `supportedExtensions` list.

**Automated Verification**:
- [x] `UnifiedParserTest` parameterized case `[21] "rust", ".rs"` (Integration) passes (golden matches, `NON_EXTENSIBLE`).
- [x] `TreeSitterAdapterTest` mapping + supported-extensions tests (Unit) pass with the Rust entry.
- [x] `./gradlew :analysers:parsers:UnifiedParser:test` (full module suite) passes; `ktlintCheck` clean.

**Manual Verification**:
- [-] `ccsh unifiedparser path/to/rustSample.rs` produces a `cc.json` whose Rust file node carries
      non-zero `complexity`/`number_of_functions`/`comment_lines` + `*_per_function` aggregations.
      (Executed during golden generation — values above; awaiting user confirmation.)

---

## Phase 4: Documentation

Dependencies: **Phase 2** (extensions/behaviour finalized)

**Tasks**:
- [x] `analysis/analysers/parsers/UnifiedParser/README.md`: add `| Rust | .rs |` to the Supported Languages table.
- [x] `gh-pages/.../parser/unified.md` — Supported Languages table: add `| Rust | .rs |`.
- [x] `gh-pages/.../parser/unified.md` — detailed subsections, mirroring the existing per-language format:
  - [x] **Complexity** `##### Rust (.rs)` — Control flow: `if_expression`, `while_expression`,
        `for_expression`, `loop_expression`, `match_arm`; Functions: `function_item`,
        `function_signature_item`, `closure_expression`; Logical operators: `&&`, `||` in binary expressions.
  - [x] **Comment Lines** — add `**Rust**: line_comment, block_comment`.
  - [x] **Number of Functions** `##### Rust (.rs)` — `function_item`, `function_signature_item`
        (closures add complexity only; `self` is a distinct receiver node).
  - [x] **Parameters per Function** — add `**Rust**: parameter (self_parameter excluded)`.
  - [x] **Message Chains** `##### Rust (.rs)` — Chain nodes: `call_expression`, `field_expression`; Call nodes: `call_expression`.
- [x] `analysis/CHANGELOG.md` under `## [unreleased] → ### Added 🚀`: `- Add Rust support to UnifiedParser (.rs)`.

**Automated Verification**:
- [-] gh-pages site build (`npm run build`): NOT run in sandbox (no `node_modules`, needs `npm install`).
      Changes are pure-markdown additions (table row + `#####` headings + bullets); deferred to CI.

---

## Phase 5: Switch to released TSE (DEFERRED — blocked on TSE release)

Dependencies: **Phase 1–4**, **TSE release containing Rust metrics**

Executed only after TSE merges `feat/rust-metric-support` and publishes a tag (here called `vX.Y.Z`).
This produces the merge-ready CodeCharta state (no composite build, resolves from JitPack).

Executed: TSE released as **v0.12.0** (tag commit `83c3ede` "feat(rust): add Rust code-metrics support").

**Tasks**:
- [x] Remove the `includeBuild(...)`/`dependencySubstitution` block from `analysis/settings.gradle.kts`.
- [x] Bump `UnifiedParser/build.gradle.kts:12` `v0.7.0` → `v0.12.0`.
- [x] Confirm the JitPack repository is still present (it is, in the root `buildscript`/`allprojects` repos).

**Automated Verification**:
- [x] `./gradlew :analysers:parsers:UnifiedParser:dependencies` shows `com.github.MaibornWolff:TreeSitterExcavationSite:v0.12.0` (JitPack), not a local project.
- [x] `./gradlew :analysers:parsers:UnifiedParser:test` passes against released TSE (`[21] "rust"` + 9 RustCollectorTest); `:model:test` + `ktlintCheck` clean.
- [-] Full multi-module `./gradlew build`: NOT run in sandbox (heavy). Only changed modules are `model`
      (FileExtension enum addition) and `UnifiedParser`, both verified green; deferred to CI.

---

## References

- TSE Rust metrics: `TreeSitterExcavationSite/plans/add-rust-metric-support.md`; branch `feat/rust-metric-support`
- TSE composite-build guidance: `TreeSitterExcavationSite/.claude/rules/dependency-migration.md` ("Composite Build (for local testing)")
- Integration call site: `analysis/analysers/parsers/UnifiedParser/.../metriccollectors/TreeSitterAdapter.kt:32`
- Parsable-file gate: `analysis/analysers/parsers/UnifiedParser/.../AvailableCollectors.kt` + `ProjectScanner.findCollectorForFileType`
- Golden test pattern: `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/.../UnifiedParserTest.kt:82`
- Docs to update: `analysis/.../UnifiedParser/README.md`, `gh-pages/src/content/docs/docs/parser/unified.md`, `analysis/CHANGELOG.md`
