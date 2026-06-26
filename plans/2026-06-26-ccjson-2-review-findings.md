---
name: Address cc.json 2.0 roasting-review findings
issue:
state: complete
version: 1
---

## Goal

Address the 34 verified findings from the Clean Code / SOLID / DRY review of the
`feature/cc-json-2-analysis` branch. No critical or major issues survived adversarial
verification — these are all minor/nit improvements. Group them into **Tidy First** batches:
structural cleanups (docs, DRY, model coherence) commit first, behavioral changes (fail-loud,
correctness, test hardening) after. Each batch is independently shippable; nothing here blocks merge.

## Findings index

All 34 findings, by batch. Severity is the verified (corrected) severity.

| # | Code | Sev | File | Issue |
|---|---|---|---|---|
| 25 | DOC-LENS | minor | LensSet.kt | KDoc claims converters are confined to wire mapper/builder; 5 filters call them |
| 2 | DOC-NODEID | minor | NodeId.kt | "single owner / cross-OS" docstring doesn't state producers must pre-segment paths |
| 10 | DRY-MD5 | minor | ProjectToCcJsonV2/15Mapper, ProjectWrapper | MD5 idiom copy-pasted in 3 places |
| 11 | DRY-LENSKEYS | minor | CcJsonV2Gson.kt, CcJsonV2.kt | lens keys spelled out 4×; KNOWN_LENSES can drift |
| 5 | DRY-MERGEHELP | minor | MetricsLens.kt | shared merge helpers live in MetricsLens but DependencyLens calls them |
| 24 | DRY-COPYATTR | minor | FolderMover/NodeRemover/SubProjectExtractor/EdgeProjectBuilder | `copyAttributeTypes` cloned 4×; now reduces to `.toMutableMap()` |
| 21 | DRY-DCBOILER | nit | DependaChartaImporter.kt | edge/node `attributeTypes` getters are mutableMap boilerplate |
| 22 | DRY-DCCANON | nit | DcJsonParser.kt | leaf paths canonicalized twice (parseEdges + parseFileNodes) |
| 23 | CLEAN-SRCBANG | nit | ConvertTool.kt | triple `source!!` after a null check; bind once |
| 34 | DRY-FQN | nit | CcJsonV2SerializationTest.kt | repeated FQNs instead of imports |
| 4 | COMPAT-RELOCATE | minor | LensSet.kt + 5 filters | 1.5 wire converters live on domain type; filters consume them |
| 1 | LENS-UNIFORM | minor | LensSet.kt | typed/`Map<String,Any>`/`JsonElement` chimera; no uniform lens repr |
| 6 | LENS-TYPING | nit | MetricsLens.kt, LensSet.kt | `clusters: List<Any>` / `domain,security: Map<String,Any>` stringly-typed |
| 3 | NODEID-INVARIANT | minor | NodeId.kt | `fromSegments` doesn't split, `fromEndpoint` does; no no-separator guard |
| 8 | FAIL-VERDISPATCH | minor | ProjectDeserializer.kt | unknown future major silently read as 1.5 |
| 12 | FAIL-EDGEFALLBACK | minor | CcJsonV2ToProjectMapper.kt | edge to missing node → raw hash string as nodeName |
| 7 | FAIL-15VER | minor | ProjectToCcJson15Mapper.kt | emits `project.apiVersion` not the wire version |
| 20 | FAIL-CONVEXIT | minor | ConvertTool.kt | exit 0 on unconvertible input; writes nothing |
| 13 | FAIL-JSONERR | nit | ProjectDeserializer.kt | malformed top-level JSON: inconsistent/cryptic errors across overloads |
| 14 | FAIL-NODETYPE | nit | CcJsonV2ToProjectMapper.kt | bare `NodeType.valueOf` error vs 1.5's descriptive one |
| 9 | CLEAN-DEFVER | nit | ProjectSerializer.kt | `defaultApiVersion` is a never-mutated `var` |
| 26 | BUG-MUTATE | minor | FolderMover.kt | `extractEdges`/`copyBlacklist` mutate source Edge/BlacklistItem in place |
| 17 | DRY-EDGEDUP | minor | ProjectMerger.kt | edge dedup duplicated; `mergedDependencyLens.edges` is a misleading trap |
| 18 | CLEAN-STATS | minor | MergeResolverStrategy.kt | stat counters mutated in lambdas, never reset → cumulative across MIMO groups |
| 19 | PERF-SUFFIX | minor | MergeResolverStrategy.kt | `suffixFit` computed twice/candidate; re-allocs lowercased Paths |
| 15 | PERF-CHKSUM2X | nit | ProjectToCcJsonV2Mapper.kt | payload serialized twice (hash + write) |
| 27 | TEST-CLASSCAST | minor | CcJsonV2SerializationTest.kt | `assertTrue(thrown !is ClassCastException)` vacuously true |
| 31 | TEST-DEDUP | minor | LensTest.kt, DcJsonParserTest.kt | dedup tests assert size only, not surviving data |
| 32 | TEST-CANONPATH | minor | NodeIdTest.kt | "canonical path" test asserts on hashed id, not the path |
| 28 | TEST-CONVERT | minor | ConvertToolTest.kt | only happy path; 3 error branches uncovered |
| 30 | TEST-KEYS | nit | MergeResolverStrategyTest.kt | `assertTrue(a && b)` hides which key is missing |
| 29 | TEST-SPLIT | nit | MergeResolverStrategyTest.kt | one test asserts two behaviors |
| 33 | TEST-AAA | nit | DcJsonParserTest.kt (+others) | new tests omit Arrange/Act/Assert comments |
| 16 | (deferred) | nit | MergeResolverStrategy.kt | interface-of-one + mode enum — see Notes |

## Tasks

### 1. Honesty & docs (structural, zero behavior)
- **DOC-LENS (#25)**: update LensSet KDoc to admit filters are legitimate legacy-shape consumers — or defer until COMPAT-RELOCATE makes the original claim true.
- **DOC-NODEID (#2)**: state the precondition explicitly — producers must split raw paths into segments (`\` is a valid Linux filename char, so NodeId is intentionally segment-based). Don't move separator handling into `canonicalize`.

### 2. DRY extractions (structural, low risk)
- **DRY-MD5 (#10)**: extract one `Checksum.md5(input: String): String` util; call from both mappers + `ProjectWrapper`.
- **DRY-LENSKEYS (#11)**: hoist the known lens-key list to one companion constant; derive `KNOWN_LENSES` and the serializer `add()` keys from it.
- **DRY-MERGEHELP (#5)**: move `mergeAttributeTypes`/`mergeAttributeDescriptors` (+ `withAnalyzersOrUnknown`/`warnIfDescriptorsDiffer`) into neutral `Lens.kt` or a new `AttributeMerging.kt`.
- **DRY-COPYATTR (#24)**: collapse the 4 cloned `copyAttributeTypes`/`copyAttributeDescriptors` bodies to `project.lenses.legacyAttributeTypes().toMutableMap()` (now that it returns fresh maps). Best done together with COMPAT-RELOCATE.
- **DRY-DCBOILER (#21)**: collapse the two `AttributeTypes` getters to expression form reusing existing constants.
- **DRY-DCCANON (#22)**: precompute `leaf → canonicalSegments` once; feed both edge- and node-building from it.
- **CLEAN-SRCBANG (#23)**: `val file = source ?: return …` then use `file` (no bangs) in the file branch.
- **DRY-FQN (#34)**: add imports for `LensSet`, `BlacklistItem`, `BlacklistType`, `CodeChartaConstants` in the test.

### 3. Domain model coherence (structural, larger — the "compat layer" theme)
- **COMPAT-RELOCATE (#4)**: move `fromLegacy`/`legacyAttributeTypes`/`allAttributeDescriptors` out of the domain `LensSet` into the serialization layer (alongside `ProjectToCcJson15Mapper`); migrate the 5 filters to operate on the typed `MetricsLens`/`DependencyLens`. This is the proper fix that subsumes DRY-COPYATTR and makes DOC-LENS honest. Behavior is currently byte-identical and tested — keep it that way.
- **LENS-UNIFORM (#1)**: collapse `domain`/`security`/`additionalLenses` into one representation (e.g. `OpaqueLens(name, payload: JsonElement)` stored in a `Map<String, Lens>`), with `metrics`/`dependency` as typed accessors — so the eventual domain-lens story doesn't change the field type and every caller.
- **LENS-TYPING (#6)**: type the reserved `clusters`/`domain`/`security` as `List<JsonElement>` / `Map<String, JsonElement>` (matching `additionalLenses`) for verbatim round-trip and well-defined equality. Folds into LENS-UNIFORM if done.
- **NODEID-INVARIANT (#3)**: `require` segments contain no `/` or `\` in `canonicalize`, so `fromSegments`/`fromEndpoint` can't disagree; add a duplicate-id guard where `metricsByNodeId` is materialized so a clash fails loud, not silently overwrites.

### 4. Fail-loud & correctness (behavioral — needs/updates tests)
- **FAIL-VERDISPATCH (#8)**: detect the major explicitly, map to `ApiVersion`, `throw` "unsupported cc.json version X" instead of defaulting to the 1.5 reader.
- **FAIL-EDGEFALLBACK (#12)**: drop edges with unresolvable endpoints + log a warning (or throw); never write a hash as a node name.
- **FAIL-15VER (#7)**: hardcode `apiVersion = ApiVersion.ONE_FIVE.versionString` in the 1.5 mapper (version is a property of the wire format).
- **FAIL-CONVEXIT (#20)**: ConvertTool should fail loud / non-zero exit when nothing is written. Note: this is the analyser-wide null→exit-0 convention, so decide whether to fix repo-wide or just here.
- **FAIL-JSONERR (#13)**: guard `isJsonObject` once in `parseProject`, throw one clear "not a valid cc.json document"; make all 4 entry points consistent.
- **FAIL-NODETYPE (#14)**: extract a shared `NodeType.parse(String)` that throws the descriptive `JsonParseException`; call from both readers.
- **CLEAN-DEFVER (#9)**: `defaultApiVersion` → `val` (it's never mutated).
- **BUG-MUTATE (#26)**: `extractEdges`/`copyBlacklist` should emit new `Edge`/`BlacklistItem` instances, not reassign `var` fields on the source.
- **DRY-EDGEDUP (#17)**: compute `mergedDependencyLens` with `mergeEdges = nodeMerger.mergesEdges`, read `mergedDependencyLens.edges`, delete `getMergedEdges` — one source of truth for edge dedup.
- **CLEAN-STATS (#18)**: derive stat counts from partitioned collections after the pipeline (keep lambdas pure), or reset counters at the top of the outermost merge — fixes cumulative stats across MIMO groups.
- **PERF-SUFFIX (#19)**: map candidates to `(path, suffixFit)` once; take max + unique best from that; hoist lowercased paths out of the per-comparison loop.
- **PERF-CHKSUM2X (#15)**: optional — hash the sub-trees produced during the single write pass, or document the double-pass as intentional.

### 5. Test hardening (behavioral verification)
- **TEST-CLASSCAST (#27)**: add `assertNotNull(thrown)` (keep type check loose to avoid coupling to gson internals).
- **TEST-DEDUP (#31)**: assert the surviving edge set by endpoint + retained attributes; for the Dc node-dedup test, assert both leaves' data survived.
- **TEST-CANONPATH (#32)**: assert `NodeId.canonicalPath(...)` directly; keep id-inequality as a separate hash-level test.
- **TEST-CONVERT (#28)**: add error-branch tests — garbage file (catch→null, no output, no crash), already-2.0 file (idempotent), stdin via the InputStream constructor.
- **TEST-KEYS (#30)**: `assertThat(map).containsKeys("a", "b")` (AssertJ already used in sibling tests).
- **TEST-SPLIT (#29)**: split the case-sensitivity test into one-concept-per-test (note: `merge()` does not mutate inputs, so the inline rebuild is unnecessary).
- **TEST-AAA (#33)**: add Arrange/Act/Assert comments to the new tests to match the files' existing convention.

## Steps

- [x] Complete Task 1: Honesty & docs (DOC-LENS, DOC-NODEID)
- [x] Complete Task 2: DRY extractions (DRY-MD5, DRY-LENSKEYS, DRY-MERGEHELP, DRY-COPYATTR, DRY-DCBOILER, DRY-DCCANON, CLEAN-SRCBANG, DRY-FQN)
- [x] Complete Task 3: Domain model coherence (COMPAT-RELOCATE, LENS-UNIFORM, LENS-TYPING, NODEID-INVARIANT)
- [x] Complete Task 4: Fail-loud & correctness (FAIL-VERDISPATCH, FAIL-EDGEFALLBACK, FAIL-15VER, FAIL-CONVEXIT, FAIL-JSONERR, FAIL-NODETYPE, CLEAN-DEFVER, BUG-MUTATE, DRY-EDGEDUP, CLEAN-STATS, PERF-SUFFIX, PERF-CHKSUM2X)
- [x] Complete Task 5: Test hardening (TEST-CLASSCAST, TEST-DEDUP, TEST-CANONPATH, TEST-CONVERT, TEST-KEYS, TEST-SPLIT, TEST-AAA)
- [x] Run `./gradlew ktlintFormat test` from `analysis/`; all green

## Implementation notes (deviations from plan, decided during execution)

- **COMPAT-RELOCATE (#4)** — scope-limited from the literal "relocate converters out of LensSet"
  to: migrate the 5 production filters onto a new `ProjectBuilder.fromLenses` (so they no longer use
  the legacy projection), keep `legacyAttributeTypes`/`allAttributeDescriptors`/`fromLegacy` on
  `LensSet`, and make the KDoc honest. Reason: ~40 cross-module **tests** use those accessors as the
  legacy view; a physical relocation would ripple a minor finding into 15 modules. Substance (filters
  lens-native, DRY-COPYATTR dissolved, DOC honest) is achieved.
- **NODEID-INVARIANT (#3)** — guard rejects `/` only, **not** `\`. `fromEndpoint` splits on `/` only,
  so `\` is already a literal in both `fromSegments` and `fromEndpoint` (they already agree on it);
  guarding `\` would crash legitimate Windows CodeMaat/Tokei endpoints. The `\` pre-split contract is
  documented (DOC-NODEID) instead.
- **LENS-UNIFORM/LENS-TYPING (#1/#6)** — applied fully per maintainer decision; 43 parser/importer 2.0
  golden fixtures regenerated (dropped always-empty `domain`/`security`, recomputed checksums).
- **FAIL-CONVEXIT (#20)** — fixed ConvertTool-locally; the repo-wide null→exit-0 convention untouched.
- **Bonus fix** — `LargeMerge` now detects a non-`root` base from the root node directly. The old
  strict-root check fired only as a side effect of unresolved edges surfacing as raw hashes, which
  FAIL-EDGEFALLBACK (#12) correctly removed.
- **#16** deferred as planned (no change).

## Notes

- **Source**: synthesized from the fan-out roasting review (workflow `wf_08288f79-5d3`). 6 cluster
  reviewers → 37 findings → adversarial verification → 34 survived, 3 killed as wrong (anemic-Lens
  claim, fromLegacy mis-partition claim, parseFileNodes default-edges claim — all factually incorrect).
- **No critical/major.** Every "major" was downgraded to minor/nit on verification. None of this is a
  merge blocker; this is polish.
- **Tidy First / commit discipline**: ship Tasks 1–3 (structural) as separate commits before Tasks 4–5
  (behavioral). One logical unit per commit; tests green before each.
- **Dependency**: COMPAT-RELOCATE (#4) is the keystone of Task 3 — doing it properly subsumes
  DRY-COPYATTR (#24) and makes DOC-LENS (#25) true rather than a patched comment. Consider doing #4
  first and letting #24/#25 fall out, rather than patching them independently.
- **Deferred — #16 (interface-of-one + mode enum, nit)**: `MergeResolverStrategy` is the only
  `NodeMergerStrategy` impl and dispatches on a `Mode` enum. The verifier judged it fine as-is: the
  refactor removed real duplication and the dispatch is two one-liners. No action now; revisit only if a
  third merge mode is added (then either restore two impls or drop the interface for plain functions).
- **Repo-wide decision flagged by #20**: returning null → picocli exit 0 on bad input is the existing
  analyser convention (MergeFilter et al.). Fixing ConvertTool to fail loud is arguably a codebase-wide
  contract change — agree scope before implementing.
