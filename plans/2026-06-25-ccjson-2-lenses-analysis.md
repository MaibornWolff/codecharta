---
name: cc.json 2.0 {meta, files, lenses} — analysis side
issue:
state: complete
version: 3
---

## Goal

Replace the conflated cc.json 1.5 format on the **analysis (Kotlin/`ccsh`) side** with the
`{ meta, files, lenses }` 2.0 format: a DTO + mapper seam so `Project` stops doubling as the wire
format, a **lens-native domain model**, a stable per-node `id` that all suite tools reproduce, and a
merge **resolver** that joins heterogeneous tools (structure + coverage, backend + frontend) by more
than exact path. Visualization is out of scope and stays on 1.5 (its own later story).

## Decisions (agreed 2026-06-25)

- **Analysis only.** No viz changes. `ccsh` default output becomes 2.0; the current viz cannot load it
  until its migration story lands (accepted).
- **Format** `{ meta, files, lenses }`, `meta.apiVersion = "2.0"` (string). `meta` = `projectName`,
  `apiVersion`, `checksum`, `commitHash` (short git SHA, optional).
- **`id`** = `sha-256(canonicalPath)` truncated to **16 hex chars**, computed by one shared `NodeId`
  utility. Reproducibility requires a **canonicalization pass** (Task 1) — it is not free.
- **`files`** = a JSON array with exactly **one root folder**, nested `children`. Node: `id`, `name`,
  `type`, `children?`, `contentHash?` (no metrics on the node).
- **`lenses.metrics`** = `attributes` (**map keyed by `id`**), `attributeDescriptors`, `attributeTypes`
  (node/edge split removed), `clusters` (reserved). **`lenses.dependency`** = `edges` (by `id`) + edge
  `attributeTypes`/descriptors. **`lenses.domain` / `lenses.security`** = reserved.
- **Unknown lenses preserved verbatim** via `additionalLenses` passthrough.
- **`blacklist` dropped from the wire format**, but it has live analysis consumers — see Task 6.
  `markedPackages` is absent from the analysis model already (drop = no-op here).
- **Identity ≠ matching.** `id` unique (path). `contentHash` = the existing per-file checksum, a
  matching signal, never the id. Duplicate content (README) keeps distinct ids and is skipped by
  content-matching.
- **Merge resolver** (one chain replacing the two strategies): exact path (`id`) → **unique**
  content hash → longest path-suffix (`Path.fittingEdgesFromTailWith`) → keep + **warn**. Must preserve
  the leaf strategy's `addMisfittingNodes` (`-a`) and `ignoreCase` semantics. Each `Lens` owns `merge()`.
- **Converter:** `ccsh` **1.5 → 2.0** only. Deserializer auto-detects apiVersion major, reads both.
- **Staged, Tidy First.** Stage A structural seam (1.5 still default) → Stage B lens-native domain →
  Stage C resolver + default flip. The flip is **hard-gated** on fixtures being green.
- **Centralization — single source of truth (no duplication).** Each new concern lives **once** in the
  shared `model`/`serialization` core; every parser/importer/filter *calls* it and never re-implements
  it. This is not just DRY — it is what makes "same file → same `id` everywhere" actually hold and stops
  the current scatter (Sonar/Tokei/MergeFilter/StructureModifier each doing their own path surgery) from
  recurring. The single owners are:
  - **`NodeId` + the path canonicalizer** — the only code that builds a canonical path or an `id`.
  - **`ChecksumCalculator`** — the only content-hash routine (all parsers call it).
  - **`CcJsonV2` DTO + the two mappers** — the only code that knows the wire shape (no tool reads/writes
    2.0 JSON directly).
  - **The merge resolver** — the only place node matching happens.
  - **`Lens.merge()` per lens** — the only place that lens's data is combined; `MergeFilter` delegates.
  - **The `MetricsLens` write API** — producers add metrics through it, not by mutating node attributes
    across N call sites.

## Tasks

### 1. Identity & path canonicalization foundation

**Canonical path form** (one `NodeId` owner in `model`; `Path` today is a bare `data class(edgesList)`
with no canonical string form):
- A file/folder's path = its **tree position**: the segment names from the root's children down.
- Canonical string = `"/" + segments.join("/")` with: **`root` excluded**, `/` separator, **empty
  segments dropped**, **`.` removed and `..` collapsed**, **Unicode NFC-normalized** (macOS stores
  filenames NFD, Linux NFC — without this the same file hashes differently across OSes), **case
  preserved** (case-sensitive filesystems). Example: tree `root→src→App.kt` → `/src/App.kt`.
- `id = sha-256(canonicalPath, UTF-8)` → **lowercase hex, first 16 chars**.

**Edge endpoint reconciliation:** edges store full `/root/…` strings (`addRootToEdgePaths` prepends
`/root/`; `EdgeProjectBuilder` builds `"/root" + …`). `NodeId.fromEndpoint(string)` applies the same
canonicalization (strip leading `/root`, then the rules above) so `edge.fromId`/`toId` equal the
FileTree node ids. CodeMaat/DependaCharta edge strings route through the same call.

**The boundary the `id` can and cannot promise** (this is the keystone — do not over-promise it):
- **Spurious divergence** — separator, root name, leading slash, `.`/`..`, Unicode form, trailing
  slash — is *eliminated* by the canonicalizer: same tree position ⇒ same id across every tool. This is
  exactly what `NodeId` guarantees.
- **Semantic divergence** — a tool genuinely roots the tree at a different depth (Sonar `getCuttedPath`
  cuts a leading segment, Tokei strips a root name, `LargeMerge` wraps nodes under a project folder,
  StructureModifier `SET_ROOT`/`FolderMover` re-roots) — means the file's *logical path differs*, so its
  id legitimately differs. The hash neither can nor should paper over this. Aligning differently-rooted
  trees (the backend+frontend+coverage case) is the **merge resolver's** job (content-hash → longest
  path-suffix) or an explicit, declared **re-root/prefix before hashing**. Re-rooting tools keep doing
  their tree surgery and then derive ids from the *resulting* tree via `NodeId` — they must never
  compute ids independently.

**Call sites routed through the single `NodeId` owner:** FileTree id assignment (mapper tree-walk);
edge `fromId`/`toId` (GitLog `addRootToEdgePaths`, `EdgeProjectBuilder`, CodeMaat, DependaCharta);
re-rooting/prefix tools (Sonar, Tokei, `LargeMerge`, StructureModifier) — surgery first, ids derived
after, never ad hoc.

**contentHash:** **reuse the existing per-file checksum** — already populated by UnifiedParser
(`TreeSitterAdapter`) and RawTextParser and consumed by `--base-file` (`ProjectScanner`,
`BaseFileResolver`). Verify `ChecksumCalculator`'s algorithm is the intended `contentHash`, freeze it,
do **not** regress `--base-file`; optional (absent for importer-only nodes).

**Tests:** canonicalizer rules (NFC, `.`/`..`, root-exclusion, case, separators); determinism for the
same tree position across tools; edge↔node id join; duplicate-content keeps distinct ids; re-rooted
tree yields different-but-deterministic ids.

### 2. DTO seam + serialization realities (Stage A — structural)
- `CcJsonV2` DTO + `ProjectToCcJsonV2Mapper` / `CcJsonV2ToProjectMapper`; **explicit** (de)serialization
  (today `ProjectSerializer` GSON-reflects the domain — that reflection must stop).
- Handle the on-disk realities the seam must not lose: the **`ProjectWrapper{checksum, data}` envelope**
  (MD5 over the inner JSON; decide keep-wrapper vs fold-into-`meta`; the v1 reader must still unwrap);
  **GZIP** (read auto-sniffs magic header; write GZIPs files but **not** stdout); **piping** (12-char
  sync flag + trailing-balanced-`{...}` extraction in `ProjectInputReader`).
- `ProjectDeserializer` auto-detects `apiVersion` major → v1/v2 reader, both yielding the domain model.
  `ProjectSerializer` can emit 2.0 behind a flag (default still 1.5 at this stage).
- **Update the `ProjectMerger` major-`== "1"` gate** (`Project.isAPIVersionCompatible`) to accept 2.0
  / convert-on-read, so piped 2.0 producers don't throw `MergeException`.
- Back Stage A with **semantic-equality tests** vs current 1.5 output (wrapper, key set, gzip).

### 3. Lens-native domain + attribute-type/descriptor rehoming (Stage B)
- `Project(meta, files: FileTree, lenses: LensSet)`; `FileNode` pure + `id` + `contentHash`; metrics
  pulled out into a `MetricsLens` keyed by `id`. `sealed interface Lens` (Metrics/Dependency/Domain/
  Security) + `additionalLenses` passthrough; each lens owns `merge()`. Update the Task 2 mappers.
- **Remove the `attributeTypes` node/edge split** (`Map<"nodes"|"edges", …>` in `Project`): route node
  types → `MetricsLens`, edge types → `DependencyLens`. Touches every `AttributeTypes(type=…)` producer
  and consumers `EdgeProjectBuilder["edges"]`, `MetricRenamer["nodes"]`.
- **Re-point `AttributeGenerator`/`AttributeGeneratorRegistry`** → `lenses.metrics.attributeDescriptors`
  (feeds `ProjectBuilder` descriptor/direction computation today).

### 4. Migrate every node-attribute producer/consumer (Stage B)
- Calculators: UnifiedParser `MetricPerFileCalc`/`MetricPerFunctionCalc` → `MetricsLens` by `id`.
- Parsers that write node attributes: **GitLog & SVN converters** (incl. the non-numeric `authors`
  list — a special case for a numeric MetricsLens), **RawTextParser** (producer *and* consumer).
- Importers: Sonar, Coverage, CSV, CodeMaat, Tokei, SourceMonitor → `MetricsLens`.
- **EdgeFilter writes aggregated edge metrics onto nodes** (`EdgeProjectBuilder`) *and* owns edges →
  redefine its output across `MetricsLens` + `DependencyLens`.
- **Model-layer machinery:** `NodeMaxAttributeMerger` (folder aggregation by **max**), `NodeInserter`
  (folder creation entry point), `MutableNode.translateMetrics` (key rewrite via `ProjectBuilder.build`),
  `ProjectBuilder` descriptor computation. (InspectionTool only prints structure; ValidationTool is
  schema-only — neither reads node attributes.)

### 5. Unified merge resolver (Stage C)
- Replace `RecursiveNodeMergerStrategy` + `LeafNodeMergerStrategy` with one prioritized resolver:
  `id` → unique content hash → longest path-suffix (`Path.fittingEdgesFromTailWith`) → keep + warn.
  Preserve `addMisfittingNodes` (`-a`) and `ignoreCase`. Ambiguous content/suffix → skip, never guess.
- **MergeFilter MIMO + `LargeMerge`** do `/root/`-prefixed path surgery + tree-wrapping with no direct
  lens analog — re-express in the `id`-keyed model (genuine redesign, not just "delegate").
- Per-lens merge delegation.
- Tests: exact / rename(content) / scheme-mismatch(suffix) / duplicate-content(**must not merge**) /
  unmatched-warning / `-a` / `ignoreCase`.

### 6. blacklist rehoming (Stage B/C)
- `blacklist` leaves the wire format but has live consumers: `ProjectMerger` (merge + dedup),
  `LargeMerge` (path-rewrite), StructureModifier (`SubProjectExtractor`, `NodeRemover`, `FolderMover`).
  Decide whether hide/exclude becomes a filter-time concept or is dropped; document the behavior change.

### 7. Converter command + default flip (Stage C — hard-gated)
- `ccsh convert` (1.5 → 2.0): read (auto-detect) + write 2.0; dialog/`isApplicable`; register in
  `Ccsh.kt` + `settings.gradle.kts`.
- Flip `ProjectSerializer` default to 2.0 **only after Tasks 1–6 and Task 8 fixtures are green.**

### 8. Schema + fixtures + docs (land WITH the format)
- **Hand-rewrite the everit JSON schema** (analysis `ValidationTool` resource `cc.json`) for 2.0 — it is
  not generated; viz `schema:generate` is a separate, out-of-scope shape. ValidationTool validates 2.0.
- Convert/refresh **all** golden + integration fixtures, sample `.cc.json`, and the `--base-file`
  corpus, so suites pass.
- Document the 2.0 format, the `id`/canonical-path spec, the resolver, and the `convert` workflow.

## Steps

- [x] Complete Task 1: Identity & path canonicalization foundation
- [x] Complete Task 2: DTO seam + serialization realities (Stage A)
- [x] Complete Task 3: Lens-native domain + attribute-type/descriptor rehoming (Stage B)
- [x] Complete Task 4: Migrate every node-attribute producer/consumer (Stage B)
- [x] Complete Task 5: Unified merge resolver (Stage C)
- [x] Complete Task 6: blacklist rehoming
- [x] Complete Task 7: Converter command + default flip (hard-gated)
- [x] Complete Task 8: Schema + fixtures + docs

## Review Feedback Addressed

1. **`id` reproducibility (critical)**: review showed `Path` has no canonical form and tools diverge
   (Sonar cut, Tokei strip, MergeFilter/LargeMerge wrap, StructureModifier re-root, edges' literal
   `/root/`). Added the cross-tool canonicalization pass as the core of Task 1; `id` reproducibility is
   no longer assumed.
2. **`checksum` is not inert**: it backs `--base-file` (TreeSitterAdapter/RawTextParser →
   ProjectScanner/BaseFileResolver). Task 1 now reuses it as `contentHash`, freezes the algorithm, and
   guards `--base-file`; `contentHash` marked optional.
3. **2.0 default breaks pipes**: `ProjectMerger` major-`=="1"` gate. Task 2 now updates the gate /
   convert-on-read.
4. **Task 4 inventory**: added GitLog/SVN converters (+`authors` list), RawText, EdgeFilter-writes, and
   the model-layer aggregation machinery; removed InspectionTool/ValidationTool as attribute consumers.
5. **Serialization realities**: Task 2 now covers the `ProjectWrapper` envelope, GZIP, and pipe
   extraction, with semantic-equality tests.
6. **`attributeTypes` split + AttributeGenerator**: now an explicit part of Task 3.
7. **`blacklist`**: not a clean view-state drop — Task 6 rehomes its analysis consumers.
8. **Schema**: clarified it is hand-maintained (everit), rewritten in Task 8 with the format; viz
   schema-gen is separate.
9. **Default-flip gating**: Task 7 is a hard dependency on Tasks 1–6 + 8, not a suggestion.

## Notes

- **Stage A is the safe first commit** (DTO seam + v2 reader, 1.5 still default) only once the seam
  honors the wrapper/gzip/pipe realities — verified by semantic-equality tests against 1.5 output.
- **Keep it centralized (guardrail):** a cross-tool reproducibility test asserts every producer yields
  identical ids for the same file, so divergence fails CI rather than shipping. Any new path/id/hash or
  wire-format computation appearing *outside* the core owner modules is a review smell — candidate for a
  ktlint/architecture rule. Note the tension with ADR 6 ("filters share nothing"): the shared core is the
  `model`/`serialization` modules everything already depends on (where `Path`, `ProjectBuilder`,
  `ChecksumCalculator` live) — filters still share no logic *with each other*, only via that core.
- **Task 1 spec must settle before Task 4** because the importer/filter path conventions it normalizes
  are the same code Task 4 migrates.
- **Deferred (not this story):** coverage importer reading source to content-hash; FQN/alias keys and a
  component/module layer; concrete `clusters`/`domain`/`security` shapes.
- **Follow-ups gated by this:** stories #6 (clone importer), #8 (domain), #9 (SBOM), #10 (dependency),
  and the viz 2.0 migration.
- Also to update outside this plan: refresh ADR 12 and the `stories/cc-json-2-dto.md` story.
