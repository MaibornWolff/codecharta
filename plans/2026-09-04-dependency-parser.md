---
name: Port DependaCharta's analysis as the dependency parser
issue: <#issueid>
state: complete
version: 2
---

## Goal

Bring DependaCharta's analysis capability into `ccsh` as a native parser: tree-sitter dependency
extraction for 12 languages, cycle detection and levelization, emitted into the `dependency` lens the
cc.json 2.0 schema already reserves. Keep DependaCharta's domain (cycles, levels, upward-pointing
feedback edges); run it on CodeCharta's infrastructure and join it to the file tree by node id, so
the data is usable from every view. This pass is file level; declaration-level leaves and
namespace-tree levelization follow later.

## Orientation

**Source to port**: `Ideas/DC/DependaCharta/analysis/src/main/kotlin/de/maibornwolff/dependacharta/`
(~7.4k LOC, 100 files, untracked in this repo — a checkout of the separate DependaCharta project).
Read `Ideas/DC/DependaCharta/DOMAIN.md` first: it defines leaf, namespace, level, pointing-upward,
weight and the four edge types. The two algorithms have their own READMEs under
`pipeline/processing/cycledetection/` and `pipeline/processing/levelization/`.

**Reference implementations in this repo**:
- `analysis/analysers/parsers/DomainLanguageParser` — a parser that produces a **non-metrics lens**
  (`input/`, `processing/`, `output/`, `cli/`, `progress/` packages; writes via
  `ProjectBuilder.withDomainLens`). Mirror its layout, and mirror its **scanner** (`input/FileScanner`,
  `FileFilter`, `TestFileDetector`, `ExtensionMatching`) — it is the newer of the two scan copies and
  already knows test files.
- `analysis/analysers/parsers/UnifiedParser` — TSE usage (`AvailableCollectors`); its
  `ProjectScanner.kt` is the older scan copy, reference only.
- `plans/2026-08-28-domain-lens-envelope.md` — the precedent for changing the lens schema in all
  three copies.

## Tasks

### 1. Grow the `dependency` lens to hold the domain

The lens is `{ edges, attributeTypes, attributeDescriptors }` today and `Edge` carries only free-form
`attributes`. All changes here are **additive** — every field is optional with a falsy default, so
existing fixtures stay valid and no fixture churn is expected.

- `Edge` gains two optional booleans, `isCyclic` and `isPointingUpwards` (default `false`). The four
  edge types (`REGULAR` / `CYCLIC` / `FEEDBACK_CONTAINER_LEVEL` / `FEEDBACK_LEAF_LEVEL`) are a pure
  function of that pair — derive them where they are consumed, never store a `type` field.
- `DependencyLens` gains `nodes: Map<String, DependencyNode>` with `DependencyNode(level: Int)`,
  mirroring the `DomainLens` envelope so per-node data (node type, language) and lens-wide data can
  be added later without a break. Keep it optional: an unused lens slot must stay `{}`.
- Edge weight stays a normal numeric attribute named `dependencies`, so it keeps working with the
  existing edge-metric machinery, `attributeTypes` and descriptors.

Files:
- `analysis/model/.../model/Edge.kt` — add the two fields; update `equals`/`hashCode`/`toString`.
  `Edge` is a hand-written class and five places rebuild edges through the three-argument constructor
  (`LargeMerge.addFolderToEdgePaths`, `FolderMover`, `SubProjectExtractor`, `CcJsonV2ToProjectMapper`,
  `DependencyLens.unionAttributes`) — each would silently drop the flags. Give `Edge` a
  `withEndpoints(from, to)` copy (or make it a data class) and route all five through it.
- `analysis/model/.../model/DependencyLens.kt` — add `nodes`, extend `merge` (higher level wins on
  conflict, like `NodeMaxAttributeMerger`; `mergeEdges` ORs the two flags instead of first-wins),
  add `rekeyed` modelled on `DomainLens.rekeyed` so `StructureModifier` can re-path it.
- `analysis/model/.../model/ProjectBuilder.kt` — add `withDependencyNodes(...)` next to
  `withDomainLens` (line ~53) and carry it through `buildFromLenses` / the lens copy at line ~327.
- `analysis/model/.../serialization/dto/CcJsonV2.kt` — `EdgeDto` (line ~42) and `DependencyLensDto`
  (line ~36).
- `analysis/model/.../serialization/ProjectToCcJsonV2Mapper.kt` (~lines 64-80) and
  `CcJsonV2ToProjectMapper.kt` (~lines 29-50).
- Schema, three copies that must stay in step. `dev_docs/cc-json-2.0.schema.json` and
  `visualization/app/codeCharta/util/ccJson2Schema.json` are byte-identical
  (`ccJson2Schema.drift.spec.ts` asserts deep equality).
  `analysis/analysers/tools/ValidationTool/src/main/resources/cc.json` is **not** a copy: it is a
  combined 1.x + 2.0 schema where the 2.0 edge is `Edge2` and `Edge` is the legacy one — edit `Edge2`
  and `DependencyLens` there and add `DependencyNode`.
- Visualization types: `visualization/app/codeCharta/model/ccjson2.model.ts` (`DependencyLensData`
  gains `nodes?`, `DependencyEdge` the two flags). The viz `Edge` lives in `model/domain.model.ts`
  (line ~201) and gets the same two optional flags. `util/edges/edges.merger.ts` rebuilds edges field
  by field — carry the flags. `CCFile.settings.fileSettings` has a `domainWords` slot but nowhere to
  keep levels: add a `dependencyLevels` slot next to it and fill it in
  `stores/fileStore/loaders/ccJson/util/ccJson2/ccJson2ToCCFile.ts` the way `mapDomainWords` does.
  Consuming any of it is view work and out of scope here.
- **Release order.** The viz vendors the schema with `additionalProperties: false` on `Edge` and
  `DependencyLens`, so a viz released before this change rejects files from the new parser. Release
  the visualization schema change before or together with the analysis release.

Verify: `cd analysis && ./gradlew :model:test` and `cd visualization && npm run test`.

### 2. New module `analysers:parsers:DependencyParser`

- `analysis/settings.gradle.kts` — add to the parsers `include(...)` block (line ~19).
- `analysis/ccsh/build.gradle.kts` — add `:analysers:parsers:DependencyParser` to the hard-coded
  module list; without it the command never reaches ccsh.
- `analysis/analysers/parsers/DependencyParser/build.gradle.kts` — depend on `model`,
  `dialogProvider`, `analysers:AnalyserInterface`, `libs.picocli`, `libs.kotter`, `libs.gson`,
  `libs.tree.sitter.excavation.site`, `libs.kotlinx.coroutines.core`.
- `analysis/gradle/libs.versions.toml` — the grammar bindings the raw-query analyzers need
  (`io.github.bonede:tree-sitter-go`, `-php`, `-python`, `-vue`) are **already on the runtime
  classpath** via TSE v0.12.0, at exactly DependaCharta's versions (core `tree-sitter` 0.26.3, go
  0.23.3, php 0.23.11, python 0.23.4, vue 0.2.1a). Only the core artifact is compile-visible, so
  declare the four grammars explicitly and pin them to the versions TSE resolves
  (`./gradlew :analysers:parsers:UnifiedParser:dependencies --configuration runtimeClasspath`), never
  to a different one — the ccsh fat jar would otherwise carry conflicting natives.
- **No kotlinx.serialization compiler plugin.** DependaCharta's whole analysis model (`Node`,
  `Dependency`, `FileReport`, `Path`, `Type`, `TypeOfUsage`, `NodeDependencies`), `TsConfigData`,
  `FederationConfigParser` and `ProjectReportDto` are `@Serializable`; this repo applies the plugin
  nowhere. Strip the annotations — the persistence they served goes with resumability — and rewrite
  the two config parsers (tsconfig, federation `package.json`) on Gson, which every module already has.
- Command class `DependencyParser.kt`, name `dependencyparser`, extending `CommonAnalyserParameters`
  (which already supplies `-o`, `-nc`, `--verbose`, `-e`, `-fe`, `-bf`, `--bypass-gitignore`,
  `--local-changes`, `--commit`) and implementing `AnalyserInterface` + `AttributeGenerator`.
  DependaCharta-specific options to keep: `--max-file-size`, `--file-timeout`, and
  `--omit-graph-analysis` (skips cycles and levelization; DependaCharta's escape hatch for huge repos).
- `Dialog.kt` for interactive mode, modelled on `DomainLanguageParser`'s.
- Register in `analysis/ccsh/.../Ccsh.kt`: the command list (~line 59) and
  `AttributeGeneratorRegistry` (~line 275). The ccsh tests enumerate every analyser by name — add it
  to `PicocliAnalyserRepositoryTest` (lines ~71, ~101) and `AnalyserServiceTest` (lines ~67, ~152).

Verify: `./gradlew :analysers:parsers:DependencyParser:build :ccsh:test` and `ccsh dependencyparser -h`.

### 3. Port the extraction layer

`pipeline/analysis` moves near-verbatim to
`analysis/analysers/parsers/DependencyParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/dependency/`.

- All 12 languages from day one. Java, Kotlin, Delphi, JS, TS, C#, C++ and Rust already run on TSE's
  `TreeSitterDependencies.analyze` via `BaseLanguageAnalyzer`. **Go, PHP and Python keep their raw
  tree-sitter query packages, ported as-is**; Vue is mixed (TSQuery for the SFC blocks, then TSE on
  the script content).
- **TSE version delta**: DependaCharta is on `v0.11.0`, this repo on `v0.12.0`. Check
  `TreeSitterDependencies.analyze`, `Declaration`, `ImportDeclaration`, `UsedType` and
  `DeclarationType` still match `TseMappings.kt` before porting; adjust the mappings, do not pin an
  older TSE.
- Keep the resolution machinery CodeCharta has no equivalent for: `common/bundler`,
  `common/federation`, `typescript/tsconfig` path aliases, and
  `processing/dependencies/dictionaries` (per-language standard-library filters).
- **Do not port** `src/main/kotlin/org/treesitter/TreeSitterTsx.kt` or `src/main/resources/lib/*`
  (the bundled TSX natives). Nothing but its own test uses that shim — TSX goes through TSE's
  `Language.TSX`.
- Replace infrastructure with CodeCharta's:
  - `analysis/synchronization/RootDirectoryWalker` + `IgnoredDirectories` → DomainLanguageParser's
    `input/` scanner (gitignore, exclude/include patterns, `TestFileDetector`), so exclusion behaves
    like the other parsers.
  - **Test files.** DependaCharta skips `test`, `tests`, `__tests__`, `node_modules`, `dist`, `build`
    and the suffixes `.spec.ts`, `_test.go`, `Test.java`, `Test.kt`, `.min.js`, `.min.css` by default
    (`IgnoredDirectories.kt`); CodeCharta's parsers analyse tests. Tests pull levels and cycles around
    noticeably, so keep DependaCharta's default (tests excluded) behind `--include-tests`, detected
    with `TestFileDetector`; build folders are already covered by gitignore and `-ibf`.
  - `shared/Logger` → `de.maibornwolff.codecharta.util.Logger`.
  - `shared/ConditionalProgressBar` → `progresstracker.ProgressTracker` / `ParsingUnit`.
  - `shared/SupportedLanguage` → `serialization.FileExtension`. Mind the deltas: CodeCharta splits
    `C` out of `CPP`, carries `.jsx` under `JAVASCRIPT.otherValidExtensions`, and has no `.kts` under
    `KOTLIN` — add it. `TYPESCRIPT` lists `"cts"` without the leading dot — fix that first in its own
    tidy commit, since language detection here relies on it.
  - **Timeout semantics carry over as they are.** The per-file timeout wraps a blocking JNI parse in
    `withTimeout`; cancellation is cooperative, so the parse thread runs on and the file is merely
    skipped with a warning. Keep the behaviour, document it in the option help.

Verify: port each analyzer's tests alongside it; `./gradlew :analysers:parsers:DependencyParser:test`.

### 4. Port the processing layer

`pipeline/processing` moves over: dependency resolution, cycle detection, levelization. Carry both
algorithm READMEs with the code.

- Cycle detection (Tarjan SCC → bounded DFS, edge budget scaled by cluster size) is tree-independent
  and ports unchanged.
- Levelization runs on the **physical folder tree** in this pass: folders are the namespaces, so
  levels join directly to file and folder ids with nothing to reconcile. Results will differ from
  DependaCharta wherever packages and folders diverge — that is the deferred namespace pass.
- `isPointingUpwards` follows the same tree: siblings compare levels directly; cross-folder pairs
  compare the levels of the sub-folders under their lowest common ancestor.
- `GraphNode.findNodeById` is a recursive linear search and `calculateIsPointingUpwards` calls it
  twice per edge plus an ancestor walk — O(edges × nodes). Fine on DependaCharta's leaf sets; index
  nodes by id while porting so a large file-level graph stays tractable.

Verify: port the algorithm tests; they are the best regression net for processing.

### 5. Emit the lens at file level

- Aggregate the per-declaration leaves onto their file via `physicalPath`: edges become file-to-file
  with summed `dependencies` weight, and `isCyclic` / `isPointingUpwards` OR'd across the constituent
  declaration edges (the aggregation rule DependaCharta already uses for namespace collapse).
- Drop self-edges left over from aggregation (two declarations in one file).
- Build the tree with `ProjectBuilder` so ids come from the single `NodeId` owner; attach levels with
  `withDependencyNodes`.
- Also emit `outgoing_dependencies` and `incoming_dependencies` per file into the **metrics** lens
  with descriptors — those are metrics, not lens structure. The wording in
  `analysis/analysers/importers/DependaChartaImporter/.../AttributeDescriptors.kt` is reusable.

### 6. Tests and documentation

- Unit tests per ported unit: Arrange-Act-Assert comments, names starting with `should`.
- **Port DependaCharta's contract suite instead of authoring a fixture.**
  `src/test/kotlin/.../analysis/contract/` (`AnalysisPipelineContractTests`, one subclass per language,
  `SotsExpectedNodesBuilder`) runs the same "cellars and centaurs" sample in Java, C# and C++ from
  `src/test/resources/analysis/contract/examples/`. That is the extraction regression net; the algorithm
  tests only cover processing. Port the resource fixtures with their tests too: `typescript-alias`,
  `typescript-wildcard`, `bundler-alias`. 67 test files and 109 resource files in total; the
  `rootdirectorywalker`, `sychronization` and `org/treesitter` tests go with the code they cover.
- One of the contract samples doubles as the golden fixture: it must produce all four edge types.
- `analysis/test/golden_test.sh` — add `check_dependencyparser` next to the existing
  `check_dependacharta` (line ~241).
- Extend `EveritValidatorTest` so an actual project carrying the grown `DependencyLens` is validated.
- Documentation, following what every parser already has: a module `README.md`; a row in the parser
  table of `analysis/README.md` (line ~20); a page
  `gh-pages/src/content/docs/docs/parser/dependency.md` next to `domain-language.md`;
  `dev_docs/cc-json-2.0-format.md` (shape snippet + prose); `CHANGELOG.md`.
- `analysis/script/simplecc.sh` wires `domainlanguageparser` as an optional step (line ~249); add
  `dependencyparser` the same way.

Verify: `./gradlew build ktlintCheck`, then `./gradlew installDist && ./gradlew integrationTest`.

## Steps

- [x] Complete Task 1: Grow the `dependency` lens — schema (all three copies), model, edge copy
      helper, DTOs, mappers, merge, rekey, TS types and the `dependencyLevels` slot
- [x] Complete Task 2: `DependencyParser` module skeleton, gradle deps (ccsh list, grammar pins,
      Gson instead of the serialization plugin), CLI, dialog, registration, ccsh tests
- [x] Complete Task 3: Port the extraction layer onto CodeCharta infrastructure (scanner, tests
      excluded by default, `FileExtension` fix)
- [x] Complete Task 4: Port cycle detection and levelization, levelized on the folder tree, indexed
- [x] Complete Task 5: File-level aggregation, lens emission, metrics-lens counts
- [x] Complete Task 6: Contract suite, golden test, README/gh-pages/format doc, simplecc, CHANGELOG

## Notes

### Decisions

- **File level first.** Node identity in cc.json 2.0 is the physical tree position; DependaCharta's
  leaves are declarations under a logical namespace tree. Aggregating declarations onto their file
  joins to existing ids with no new id space, and keeps the lens navigable from every other view.
- **Levels on the folder tree first**, namespace levelization second. The end state is both: the full
  DependaCharta result plus the option to project everything onto file level, so jumping between
  views stays cheap.
- **Two booleans, not four types.** Edge type is a pure function of `(isCyclic, isPointingUpwards)`;
  storing it too would be a second source of truth for the same fact.
- **TSE stays the extraction library.** This parser and `UnifiedParser` both sit on
  `TreeSitterExcavationSite`. The raw tree-sitter queries for Go, PHP and Python are the exception,
  carried over unchanged rather than blocking on upstream TSE work.
- **Infrastructure is CodeCharta's, domain logic is DependaCharta's.** CLI, dialog, file walk,
  gitignore, logging, progress and serialization get replaced; extraction, resolution, cycle
  detection and levelization get ported.
- **Tests excluded by default, `--include-tests` to opt in.** DependaCharta's result is calibrated on
  production code; matching CodeCharta's include-everything default would change every level and
  cycle for users coming from DependaCharta.
- **Gson, not the kotlinx.serialization plugin.** The annotations only served the temp-file
  persistence and the `.cg.json` export, both of which are dropped; a compiler plugin for two small
  config parsers is not worth a new build dependency.

### Review of version 1 (2026-09-04)

Verified against both checkouts. Corrected: the grammar bindings already arrive via TSE; the
ValidationTool schema is a combined 1.x/2.0 file, not a copy; the viz `Edge` is in `domain.model.ts`.
Added: ccsh module list and enumeration tests, the five edge copy sites, the missing viz slot for
levels, default test exclusion, `--omit-graph-analysis`, timeout semantics, levelization indexing,
the existing contract suite, docs pages, simplecc, release order, the `FileExtension` typo.

### Deferred

- **Declaration-level leaves** — full class-to-class fidelity; needs a lens-owned leaf table and a
  schema design for it.
- **Namespace-tree levelization** — for languages where packages and folders genuinely diverge
  (Java, C#, Go).
- **Visualization** — no view work in this plan. `visualization/app/codeCharta/lenses/dependency/`
  and `stores/dependencyLensSource/` already exist as edge-metric plumbing for the 3D map; a
  dedicated dependency view (DependaCharta's nested-box LSM graph, Cytoscape) is a separate decision.
- **`DependaChartaImporter` stays as is.** For whoever picks it up: it declares `.dc.json` while
  DependaCharta actually emits `.cg.json`, so it never matches real output, and it flattens levels,
  cycles and upward flags away. Once this parser lands it is largely redundant.
- **Convergence with `UnifiedParser`** — both walk the tree and both hold a language registry. Worth
  extracting a shared scan once this parser is stable.

### Open

- **Resumability** — confirmed dropped (2026-09-04). CodeCharta's incremental story is `--base-file`
  plus `contentHash`; `--file-timeout` and `--omit-graph-analysis` cover the large-repo cases the temp
  directory was there for.
- **Levels after a merge.** Levels are only meaningful within one producer's tree; merging two
  levelized projects yields levels that should really be recomputed. Max-wins in
  `DependencyLens.merge` is a placeholder, not a correct reconciliation.
