---
name: clusters-lens-definition
issue: #4411
state: complete
version: 1
---

## Goal

Move `clusters` from the reserved `metrics.clusters` slot to a fully defined top-level
`lenses.clusters` lens **before the 2.0 release**, so 2.0 ships with the correct cluster
definition but without producer/visualization support. Design: `dev_docs/cc-json-2.0-clusters-lens.md`.

## Tasks

### 1. Remove `clusters` from the Kotlin model and DTO

- `MetricsLens.kt`: drop the `clusters` field and its `merge()` line
- `dto/CcJsonV2.kt`: drop `clusters` from `MetricsLensDto`
- `ProjectBuilder.kt`: drop `withClusters(...)`, the `clusters` var, and the `copy(clusters = ...)` /
  `.withClusters(...)` call sites
- `ProjectToCcJsonV2Mapper.kt` / `CcJsonV2ToProjectMapper.kt`: drop both `clusters =` mappings
- No typed `ClustersLens` yet: a top-level `clusters` lens rides the existing `opaqueLenses`
  passthrough (`CcJsonV2Gson` collects unknown lens keys). Typed model lands with the first producer.
- Add a round-trip test: a file with a populated `lenses.clusters` object survives
  deserialize → serialize verbatim via `opaqueLenses` (extend `CcJsonV2SerializationTest`)
- Update tests that construct/assert `metrics.clusters`: `LensTest`, `ProjectBuilderTest`,
  `CcJsonV2SerializationTest`, and the representative project in `EveritValidatorTest`

### 2. Update all three schema copies in sync

The drift guards force these to land together:
- `dev_docs/cc-json-2.0.schema.json` (source of truth): remove `clusters` from `MetricsLens`,
  add optional `clusters` to `Lenses` with full definitions (`ClustersLens`, `Clustering`,
  `Cluster`, `ClusterMember`) per the design doc — `clusterings` map keyed by clustering id;
  `membership` enum `partition|weighted|overlay`; optional `weightBasis`; `analyzers` array;
  clusters array with `id`, `name`, optional `parentId`, `attributes`, required `members`
  (`nodeId`, optional `weight` 0..1)
- `visualization/app/codeCharta/util/ccJson2Schema.json`: exact copy
  (`ccJson2Schema.drift.spec.ts` asserts deep equality with dev_docs)
- `analysis/.../ValidationTool/src/main/resources/cc.json`: mirror the change in the strict 2.0
  branch (~line 490) so `ccsh check` accepts files carrying a clusters lens and rejects the old
  `metrics.clusters` slot (`EveritValidatorTest` sync test validates a DTO-serialized project
  against bundled + published schemas)

### 3. Update the visualization type

- `ccjson2.model.ts`: remove `clusters?: unknown[]` from the metrics lens interface; add an
  optional `clusters?: unknown` on the lenses type (opaque until viz support lands)

### 4. Clean up fixtures and golden files

- ~93 JSON fixtures contain `"clusters": []` inside the metrics lens (analysis test data,
  MergeFilter/EdgeFilter/StructureModifier/UnifiedParser resources, `example.cc.json`,
  viz `sample1–4.cc.json`) — strip the key mechanically (script + spot check)
- Rerun `./gradlew integrationTest` and regenerate any golden outputs that embed the old slot
- Leave `legacy_1_5.cc.json` and other 1.x fixtures untouched (they never had the slot;
  case-insensitive grep hits there are unrelated)

### 5. Update docs

- `cc-json-2.0-format.md`: shape example — remove `"clusters": []` from metrics, show
  `"clusters"` as a defined-but-optional lens next to `domain`/`security`, link the design doc
- ADR 12: amend the lens enumeration mention (metrics no longer lists clusters)

### 6. Verify

- `cd analysis && ./gradlew test integrationTest ktlintCheck`
- `cd visualization && npm test` (drift spec is the canary)
- `ccsh check` on a hand-written sample containing a `clusters` lens (valid) and on one still
  using `metrics.clusters` (must be rejected by the strict 2.0 branch)

## Steps

- [x] Complete Task 1: Remove `clusters` from Kotlin model/DTO + round-trip test
- [x] Complete Task 2: Update all three schema copies in sync
- [x] Complete Task 3: Update visualization type
- [x] Complete Task 4: Clean up fixtures and golden files
- [x] Complete Task 5: Update docs (format doc, ADR 12)
- [x] Complete Task 6: Verify (gradle tests, viz tests, ccsh check both directions)

## Outcome (beyond the plan)

Four things the plan did not anticipate:

- **`LargeMerge.kt`** carried a `require(...metrics.clusters.none { it.carriesData() })` guard the
  plan missed. Removed: the `opaqueLenses` guard directly above already covers a top-level
  `clusters` lens. `LargeMergeTest` reworked to assert the protection via that guard.
- **`meta.checksum` covers the lenses**, so stripping the slot invalidated it. 41 fixtures were
  correct at HEAD and were regenerated; 50 were *already* stale at HEAD (the reader never
  validates `meta.checksum`) and were deliberately left alone.
- **Explicit JSON nulls are dropped** by the opaque passthrough (`CcJsonV2Gson` never enables
  `serializeNulls`) — a pre-existing, lens-general property. The design doc's `"parentId": null`
  example could not survive the round-trip it claimed; the example now omits it and the doc
  documents the caveat. Left `serializeNulls` alone: it would change output for every lens.
- **Stale pointers** at `CC_JSON_SCHEMA_CHANGELOG.md` (2.0 lens enumeration),
  `stories/duplication-clone-importer.md` and `stories/cc-json-2-dto.md` repointed at the new lens.

## Notes

- Everything must land in **one atomic change**: the everit sync test and the viz drift spec
  fail on any partial state (strict `additionalProperties: false` means DTO and schemas cannot
  disagree even transiently across commits).
- `clusterings` is a keyed map (merge-by-key, JSON-enforced uniqueness), not an array; provenance
  is `analyzers: string[]` merged by union — see design doc for rationale.
- The `weighted` sum-≤-1 invariant is prose-only (not expressible in JSON Schema); enforcement
  becomes a `ccsh check` semantic warning when typed support lands, not part of this change.
- Frontend scope check (verified): the viz never re-exports cc.json (`FileDownloader` is only
  used for 3D-print and scenario exports), so it has no verbatim-preservation duty — it only
  needs to *accept* files carrying a clusters lens. That comes free from the vendored schema
  update (Task 2): `Lenses` has no `additionalProperties: false`, and after the change the ajv
  validator in `fileValidator.ts` correctly rejects the old `metrics.clusters` slot.
- Out of scope: typed `ClustersLens` model, producers (gitlogparser ownership), viz
  color-by-cluster (typed TS model, a `lenses/` projection, `activeClustering` state,
  highlight/legend UI). Those come after the 2.0 release as additive work.
