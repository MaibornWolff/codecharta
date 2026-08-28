---
name: Give the domain lens a node envelope
issue: <#issueid>
state: complete
version: 1
---

## Goal

Wrap the `domain` lens payload so it stops being a bare `nodeId -> DomainWord[]` map and becomes
`domain: { nodes: { "<id>": { words: [...] } } }`. Every other lens is an object with named sub-keys;
`domain` is the only one whose top level is the per-node map itself, so it cannot gain lens-level
data (corpus IDF, analyzers) or per-node data (dominant term, token count) without a breaking change.
Do it now, before 2.0 ships, while breaking the shape is still free.

## Tasks

### 1. Schema (three copies must stay in step)
- `dev_docs/cc-json-2.0.schema.json`: `DomainLens` becomes `{ nodes: { <id>: DomainNode } }` with
  `additionalProperties: false` and a new `DomainNode` definition holding `words: DomainWord[]`.
- Mirror byte-for-byte into `visualization/app/codeCharta/util/ccJson2Schema.json` —
  `ccJson2Schema.drift.spec.ts` asserts deep equality.
- Mirror into `analysis/analysers/tools/ValidationTool/src/main/resources/cc.json` (add `DomainNode`
  next to the existing `DomainLens`/`DomainWord`).
- Keep `words` required on `DomainNode`, `nodes` required on `DomainLens`; leave room for optional
  siblings later.

### 2. Producer
- `DomainProjectGenerator.buildDomainLens` currently adds each node id directly onto the lens object.
  Build a `nodes` object, and put each word array under a per-node `{ "words": [...] }`.
- Keep the existing deterministic ordering (by segment count, then path) — it feeds `meta.checksum`.
- Add `NODES_KEY` / `WORDS_KEY` constants next to the existing `TEXT_KEY`/`FREQUENCY_KEY`/`TFIDF_KEY`.

### 3. Visualization reader
- `ccJson2ToCCFile.ts` `mapDomainWords` iterates `file.lenses.domain ?? {}`; change it to
  `file.lenses.domain?.nodes ?? {}` and read `node.words`.
- Update the `CcJson2` type for the lens. The internal `DomainLensSource` already wraps under `words`,
  so nothing downstream of the loader changes.

### 4. Fixtures and tests
- Update the `.cc.json` fixtures that carry a domain lens: MergeFilter (`mergeFolderTest`,
  `mergeFolderNoOverlap`, `mimoOverlap`, `mimoFileSelection`, `largeMerge`), StructureModifier
  (`sample_project_with_domain`, `sample_project_with_empty_domain`), `SVNLogParser/cc_project.cc.json`,
  and `visualization/app/codeCharta/assets/sample1.cc.json`.
- Update viz `dataMocks.ts` and the `ccJson2ToCCFile` spec.
- Extend the `EveritValidatorTest` representative project to actually carry a domain lens — today it
  exercises only metrics + dependency, so no analysis-side test validates `DomainLens` at all.
- Re-run the golden test; the demo maps carry a domain lens since `19af37816`.

## Steps

- [x] Complete Task 1: Schema, all three copies
- [x] Complete Task 2: Producer emits the `nodes`/`words` envelope
- [x] Complete Task 3: Visualization reader follows the new shape
- [x] Complete Task 4: Fixtures, mocks, specs, golden test
- [x] Update `dev_docs/cc-json-2.0-format.md` (shape snippet + prose) and CHANGELOG.md

## Notes

- Shape chosen over the flatter `domain: { words: { "<id>": [...] } }` because it gives two growth
  points instead of one: lens-level siblings to `nodes`, and per-node siblings to `words`.
- `nodes` matches the join vocabulary used everywhere else (`NodeId`, `ClusterMember.nodeId`,
  "unresolved node id"), even though the identity array at the top level is called `files`.
- No back-compat shim: `ccsh` emits 2.0 only and 2.0 has not shipped, so old-shape domain lenses are
  not a case to support. Any 2.0 file produced before this change must be regenerated.
- `nodes` is **optional**, not required. `carriesData()` (`LensSet.kt:69`) is a shallow size check, so a
  mandatory envelope key would make every empty domain lens data-bearing — flipping the 14 fixtures that
  use `"domain": {}` into merge conflicts and blocking StructureModifier re-paths. Keeping `nodes`
  optional preserves `{}` as the reserved-empty form. Note the sharp edge this leaves: `{}` and
  `{"nodes":{}}` mean the same thing but only the latter counts as carrying data. `clusters` already has
  this problem (`clusterings` is required), so the real fix is splitting `carriesData()` into its two
  distinct questions — "anything to conflict over?" and "does it reference node ids?".
- The golden test's `check_domainlanguage` was passing a **file** to a parser that scans a **directory**,
  so it processed 0 files and only ever asserted that an empty lens validates. Fixed to scan `${DATA}`
  and to assert the envelope explicitly.
- `integrationTest` is a bare `Exec` task with no dependency on `distTar`, so it silently tests whatever
  tar was last built. Worth wiring up separately.
- **This does not make the domain lens mergeable.** `ProjectMerger.mergeOpaqueLens` still throws
  `MergeException` when two inputs both carry a data-bearing `domain` payload — merging a frontend
  and a backend scan is still a hard error. That is a separate fix (a real merge contract for
  non-typed lenses) and should not be folded into this change. When it is built, domain word banks
  should combine like metrics do in `NodeMaxAttributeMerger`: highest value wins, including for
  `tfidf` — the inputs are normally scans of the same codebase, so max is the sane reconciliation.
