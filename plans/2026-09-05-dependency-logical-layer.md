---
name: Emit the logical package/declaration layer next to the physical one
issue: <#issueid>
state: todo
version: 1
---

## Goal

Make `ccsh dependencyparser` emit **both projections of one analysis** in one cc.json: the logical
layer (packages and declarations, DependaCharta's model) as a lens overlay, and the physical layer
(the file-collapsed graph) exactly as it ships today. After this the analysis side is complete — every
signal DependaCharta produces is in the file, and only the frontend work remains.

## Orientation

`plans/2026-09-04-dependency-parser.md` (complete) ported the analysis and shipped the **physical**
projection. The logical layer is not missing work — it is **computed on every run and discarded**:

| Asset | State today |
| --- | --- |
| Declaration nodes (`Node.pathWithName`, `nodeType`, `language`, `physicalPath`) | computed, discarded at aggregation |
| Resolved leaf→leaf dependencies with `TypeOfUsage` | computed; `FileLevelAggregator` reads neither the leaf ids nor `Dependency.type` |
| Declaration-level cycles | computed (they feed the physical `isCyclic`) |
| `toGraphNodes()` — the namespace tree builder | ported and unit-tested, **called only by its own test** |
| `levelize()`, `GraphIndex` | tree-agnostic, already reused for the folder tree |

So this is: **stop discarding, add a place to put it, levelize a second time.**

Measured on `visualization/app` (921 files): 2353 declarations, 4131 leaf edges, 376 KB physical-only
output today.

## Tasks

### 1. Grow the `dependency` lens with the logical layer

The lens today is `{ edges, nodes, attributeTypes, attributeDescriptors }`. It gains three siblings.
All are **optional and omitted when empty**, so a file that carries only the physical projection stays
byte-identical to what the parser writes today — the `meta.checksum` characterization test in
`CcJsonV2SerializationTest` is the guard.

```json
"dependency": {
  "edges":  [ { "fromId": "<node id>", "toId": "<node id>", "attributes": { "dependencies": 3 }, "isCyclic": true } ],
  "nodes":  { "<node id>": { "level": 2 } },

  "namespaces": { "com.example.domain": { "level": 0 } },
  "leaves": {
    "com.example.domain.Creature": { "nodeId": "<file node id>", "name": "Creature", "kind": "CLASS", "level": 2 }
  },
  "leafEdges": [
    { "fromLeaf": "com.example.domain.Creature", "toLeaf": "com.example.domain.HitPoints",
      "attributes": { "dependencies": 1 }, "usage": "inheritance", "isCyclic": true, "isPointingUpwards": true }
  ]
}
```

- **`leafEdges` is a separate list, not a widened `Edge`.** `Edge` requires `fromId`/`toId`, and the
  existing edge-metric machinery, `EdgeFilter` and the 3D map all read `edges`. Leaving `edges`
  untouched is what keeps the physical view working with zero consumer changes.
- **`leaves[].nodeId`** is the join to the physical tree: the id of the file the declaration lives in.
  It is the only field in the logical layer that is a *node id*, and therefore the only one a
  re-pathing filter has to rewrite.
- **`namespaces` needs no `parent`** — with dotted ids the parent is the id's prefix. `leaves` needs no
  `namespace` for the same reason, but does keep `name`, because `Path` escapes dots inside a segment
  and that escaping is not reversible.
- **`usage`** carries `TypeOfUsage` (`usage`, `inheritance`, `implementation`, `instantiation`,
  `argument`, `return_value`, `constant_access`). It is already computed and currently thrown away.

Files, mirroring the shape of the Task 1 commit of the previous plan:
- `analysis/model/.../model/DependencyLens.kt` — add `namespaces`, `leaves`, `leafEdges` plus
  `DependencyNamespace`, `DependencyLeaf`, `LeafEdge`; extend `merge` and `rekeyed` (see Task 4).
- `analysis/model/.../model/ProjectBuilder.kt` — **replace** `withDependencyNodes(...)` with one
  `withDependencyLens(nodes, namespaces, leaves, leafEdges)`; four builder methods for one lens is
  worse than one. Carry it through `buildFromLenses` and the `fromLenses` companion.
- `analysis/model/.../serialization/dto/CcJsonV2.kt` — `DependencyLensDto` gains the three fields,
  nullable so GSON omits them; add `LeafEdgeDto`.
- `analysis/model/.../serialization/ProjectToCcJsonV2Mapper.kt` and `CcJsonV2ToProjectMapper.kt`.
- Schema, the three copies that must stay in step: `dev_docs/cc-json-2.0.schema.json` and
  `visualization/app/codeCharta/util/ccJson2Schema.json` are byte-identical
  (`ccJson2Schema.drift.spec.ts` asserts deep equality);
  `analysis/analysers/tools/ValidationTool/src/main/resources/cc.json` is the combined 1.x + 2.0 file
  where the 2.0 edge is `Edge2`.
- Visualization types: `visualization/app/codeCharta/model/ccjson2.model.ts`. Reading them into
  `CCFile` is frontend work and out of scope; the types and the vendored schema are not, because a viz
  released without them rejects the parser's output.

Verify: `cd analysis && ./gradlew :model:test` and `cd visualization && npm run test`.

### 2. Stop discarding: wire the namespace levelization

`ProcessingPipeline` currently resolves, detects cycles, aggregates onto files, levelizes the folder
tree, and drops everything else. It gains a second, parallel half.

- Keep the resolved declaration nodes and `cyclicEdgesByDeclaration` — both already exist as locals.
- Build the namespace tree with the **already-ported** `Collection<Node>.toGraphNodes()`, levelize it
  with `levelize()`, and index it with `GraphIndex` — the same three calls the folder tree makes.
- Emit per-leaf and per-namespace levels, and `isPointingUpwards` per leaf edge, from that index.
- Fold leaf edges that share an endpoint pair: sum `dependencies`, OR `isCyclic`, union `usage`.
- **Duplicate leaf ids must not be silent.** Two declarations can resolve to the same dotted path
  (DependaCharta's `ReportService` lets the last one win). Keep the first and warn, matching how
  `CcJsonV2ToProjectMapper` handles a duplicate node id.
- `--omit-graph-analysis` skips **both** levelizations and both cycle passes, as it does today.

Cost: levelization is superlinear and now runs twice. That is the reason `--omit-graph-analysis`
exists; no new escape hatch is needed.

Verify: `./gradlew :analysers:parsers:DependencyParser:test`.

### 3. Emit both projections

- `DependencyGraph` grows a logical half beside `edges`/`levels`; `ProcessingPipeline.run` fills both.
- `DependencyProjectGenerator` writes the logical tables through the new builder method. The file tree,
  `edges`, `nodes` and the `outgoing_dependencies`/`incoming_dependencies` metrics stay exactly as they
  are — this task adds, it does not change.
- `leaves[].nodeId` uses the same `NodeId.fromSegments(segments, NodeType.File)` the generator already
  computes for the tree, so the join is exact by construction rather than by string matching.
- Both layers ship on every run (no flag). Size on `visualization/app` goes from ~376 KB to ~1.4 MB
  uncompressed; output is gzipped by default, so the cost lands mostly in viewer memory.

Verify: `./gradlew installDist`, then run against `visualization/app` and confirm both halves are
present and that `edges`/`nodes` are unchanged from the current output.

### 4. Keep the logical layer intact through the filters

The logical tables are keyed by namespace and leaf id, which no filter moves — except `leaves[].nodeId`,
which is a node id and therefore invalidated by any re-pathing.

- `DependencyLens.merge`: union `leaves` (first wins on conflict, warn), max-wins on `namespaces`
  levels like `nodes`, fold `leafEdges` by endpoint pair with OR'd flags and summed weight.
- `DependencyLens.rekeyed`: rewrite `leaves[].nodeId` through the existing `nodeIdRemapping`; drop a
  leaf whose file did not survive.
- `LargeMerge` and `StructureModifier` already call `DependencyLens.rekeyed` — confirm they need no
  further change.
- `EdgeFilter` reads `edges` only; add a guard that it carries the logical layer through untouched.
- On read, drop a leaf whose `nodeId` resolves to no file node, with a warning — the rule
  `CcJsonV2ToProjectMapper` already applies to metrics entries and dependency nodes.

Verify: `./gradlew :analysers:filters:MergeFilter:test :analysers:filters:StructureModifier:test
:analysers:filters:EdgeFilter:test`.

### 5. Tests, parity check and documentation

- Model tests: merge, re-key, round-trip, and — most importantly — that a project without a logical
  layer still serializes byte-identically (extend the existing checksum characterization test).
- `EveritValidatorTest`: the representative project carries `namespaces`, `leaves` and `leafEdges`, so
  a new DTO field fails both schema validations until the three schema copies catch up.
- `ProcessingPipelineTest`: leaf edges exist, namespace levels exist, all four edge types appear at leaf
  level, and **the two projections agree** — every leaf edge's file pair appears in `edges` unless the
  two leaves share a file.
- A test pinning the intra-file case: two declarations in one file that depend on each other produce a
  leaf edge and no file edge. This is the signal the physical view loses, and the reason the logical
  layer exists.
- **Parity check against DependaCharta.** Run both tools over the three contract samples
  (`src/test/resources/analysis/contract/examples/{java,csharp,cpp}`) and compare leaf count, edge count
  and cycle count. Record the numbers in the module README; where they differ, explain why rather than
  chasing byte parity.
- Golden test: extend `check_dependencyparser` in `analysis/test/golden_test.sh` to assert the logical
  tables are present alongside the physical ones.
- Docs: module `README.md`, `gh-pages/src/content/docs/docs/parser/dependency.md`,
  `dev_docs/cc-json-2.0-format.md` (shape, merge and re-key semantics of the new tables), and both
  `CHANGELOG.md` files.

Verify: `./gradlew build ktlintCheck`, then `./gradlew installDist && ./gradlew integrationTest`, and
`cd visualization && npm run test`.

### 6. Retire `DependaChartaImporter`

Once the parser emits the full logical layer, the importer is redundant: it declares `.dc.json` while
DependaCharta emits `.cg.json` (so it never matches real output), and it flattens levels, cycles and
upward flags away. Deprecate it with a message pointing at `dependencyparser`, or remove it — a
decision for whoever picks this up, but it should not be left as a third, worse path to the same data.

## Steps

- [ ] Complete Task 1: grow the `dependency` lens — `namespaces`, `leaves`, `leafEdges` across model,
      DTO, both mappers, three schema copies and the viz types
- [ ] Complete Task 2: stop discarding the declaration layer; levelize the namespace tree with the
      already-ported `toGraphNodes()`; warn on duplicate leaf ids
- [ ] Complete Task 3: emit both projections from one run, leaving the physical half untouched
- [ ] Complete Task 4: merge and re-key the logical layer through `MergeFilter`, `StructureModifier`
      and `EdgeFilter`
- [ ] Complete Task 5: tests, DependaCharta parity check, golden test, documentation
- [ ] Complete Task 6: deprecate or remove `DependaChartaImporter`

## Notes

### Decisions

- **The logical layer is a lens overlay, not the `files` tree.** `files` stays the physical identity
  layer, so ids keep joining with `unifiedparser`, `gitlogparser` and every other analyser. Making
  packages the tree would have given the existing 3D map a logical view for free, at the cost of a
  `files` tree whose paths do not exist on disk and which nothing else can join.
- **Leaf ids are the dotted logical path verbatim** (`com.example.domain.Creature`). The ported cycle
  detection and levelization already key on exactly this string (`pathWithName.withDots()`), so there
  is nothing to translate; it is readable in the file and in bug reports; and namespace ids are its
  prefixes, which makes the parent relation checkable without storing it. Node ids are hashed to
  canonicalize *paths* (separator, Unicode form, `.`/`..`) — a dotted namespace has none of that
  variance, so hashing would buy nothing. The cost is size: ~40 chars twice per leaf edge, roughly
  330 KB of the ~600 KB `leafEdges` estimate on `visualization/app`. Hashing to 16 hex would roughly
  halve it; gzip already recovers most of the difference, and readability wins.
- **All declaration kinds, DependaCharta parity.** Classes, interfaces, enums, annotations, functions,
  variables, re-exports and scripts. Dropping variables and re-exports would be smaller and less noisy
  but would no longer be a faithful port, and free functions are most of Go and Python.
- **Both projections materialized, always.** The physical half cannot be derived cheaply anyway —
  folder levels need their own levelization pass, they are not a projection of namespace levels.
  Materializing both keeps today's 3D edge-metric map working with no frontend change.
- **`edges` keeps its meaning.** The physical edge list is what `EdgeFilter` and the map read; the
  logical graph goes in `leafEdges` rather than widening `Edge` with optional endpoints.

### What this closes

After Task 6 the analysis side is complete: extraction, resolution, cycle detection and levelization
all run at declaration level and are all emitted, at both granularities, from one command.

### Deferred

- **Frontend.** No view consumes the logical layer. Per the standing preference, a logical view should
  gate the existing components per projection rather than build a parallel one; DependaCharta's
  nested-box LSM graph is a separate decision.
- **Convergence with `UnifiedParser`** — both walk the tree and both hold a language registry. Worth
  extracting a shared scan.

### Open

- **Size on a monorepo.** `visualization/app` grows from ~376 KB to ~1.4 MB uncompressed. A
  `--level=file|declaration|both` option is the pressure valve if that turns out to hurt; it is
  deliberately not in this plan, because two knobs for one decision is worse than one large file until
  a real repository proves otherwise.
- **Cross-source-root packages.** Two modules whose classes share a package (`moduleA/src/.../com/x`
  and `moduleB/src/.../com/x`) merge into one namespace in the logical view and stay two subtrees in
  the physical one. That is correct for both views, but the two will disagree visibly — worth a note in
  the docs once the frontend renders them side by side.
