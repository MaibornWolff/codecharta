# cc.json 2.0 — the `clusters` lens

> Status: **designed, not implemented.** This document fixes the format definition so 2.0 can ship
> with the correct `clusters` shape reserved, without any producer or visualization support yet.
> Design discussion: [#4411](https://github.com/MaibornWolff/codecharta/issues/4411).
> Format context: [cc-json-2.0-format.md](cc-json-2.0-format.md).

## Decision: clusters are a top-level lens, not part of `metrics`

The 2.0 draft reserved an empty `clusters` array inside the metrics lens. That slot is removed;
clusters become a **top-level lens** (`lenses.clusters`), sibling to `dependency`:

- Clusters are structurally a cross-cutting relation joined to `files` by node id — like edges,
  not like a per-node metric map. That is exactly the lens definition from ADR 12.
- Each lens owns its own `merge()`. Cluster merging has real semantics (union members, reconcile
  weights, drop members whose node id did not survive the merge) that do not belong inside the
  metrics lens.
- The move is free **only before release**: nothing produces `metrics.clusters` yet. After release
  it would be a breaking change under the additive-only versioning rules.

Until typed support lands, the `clusters` lens rides the existing unknown-lens passthrough
(`opaqueLenses`), so 2.0 readers already preserve it on round-trip. One caveat, general to every
opaque lens rather than specific to this one: the writer does not emit explicit JSON nulls, so a
`"parentId": null` written by a producer comes back out **absent**. Nothing is lost — the schema
treats null and omitted alike — but omit optional nulls rather than writing them if you want a
byte-identical round-trip.

## Shape

```json
"lenses": {
  "clusters": {
    "clusterings": {
      "author-ownership": {
        "title": "Author ownership",
        "membership": "weighted",
        "weightBasis": "rloc",
        "analyzers": ["gitlogparser"],
        "clusters": [
          {
            "id": "author-a",
            "name": "Author A",
            "attributes": { "commits": 214 },
            "members": [
              { "nodeId": "a1b2c3d4e5f60718", "weight": 0.62 }
            ]
          }
        ],
        "attributeDescriptors": {},
        "attributeTypes": {}
      }
    }
  }
}
```

A file has **clusterings**, a clustering has **clusters**, a cluster has **members**. One file can
carry several orthogonal groupings side by side (author ownership, temporal coupling, feature
scope, test coverage); the visualization activates one clustering at a time, the same way it picks
one edge metric today.

**Why `clusterings` is a map, not an array.** The format's convention is: merge-by-one-key → keyed
map (`metrics.attributes` by node id, `attributeDescriptors`/`attributeTypes` by metric name);
multi-field records → array (`edges` join by `fromId`+`toId`). Clusterings merge by exactly one key,
so the map gives merge-by-key for free and JSON itself enforces key uniqueness (no duplicate-id
validation). Ordering is not wire information — views sort by title or size. The inner `clusters`
list stays an array: producer-controlled display order, fuller records.

**`analyzers`** lists the producers that contributed to a clustering and merges by union — the same
provenance pattern as `AttributeDescriptor.analyzers` (a merged file legitimately reads
`["gitlogparser", "coverageimporter"]`).

## Semantics

**Members reference node `id`s** — the same join as edges. The merge resolver, rename matching via
`contentHash`, and differently-rooted-tree handling apply unchanged. Members whose id cannot be
resolved after a merge are dropped with a warning, exactly like dangling edges.

**`membership` is declared per clustering** and answers the double-counting question up front:

| mode        | meaning                                                                              | weight rule                                    |
| ----------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `partition` | each node belongs to at most one cluster                                             | weight implied `1`, may be omitted             |
| `weighted`  | overlapping, fractional membership (e.g. a file 80% author A / 20% author B)         | a node's weights across clusters must sum ≤ 1  |
| `overlay`   | independent per-cluster membership (e.g. one file fully covered by three test suites)| weights are per-cluster; never summed across   |

The `weighted` sum-≤-1 invariant is a semantic constraint (documented here, not expressible in JSON
Schema). It makes aggregation safe by construction: folder roll-ups and whole-codebase shares
(pie/stacked-bar views) are `Σ weight × weightBasis(node)` and can never exceed 100%; the remainder
is an honest "unowned/unknown" bucket.

**`weightBasis`** names the metric the weight is a fraction of (`rloc`, `loc`, `commits`, …) and
should reference a key in the metrics lens so views can weight aggregation with real per-node
values. This resolves the "percentage of what?" ambiguity from #4411 explicitly.

**`parentId`** gives cheap hierarchy: flat clusterings omit it; hierarchical ones (feature →
sub-feature, temporal-coupling communities suggesting module boundaries) form a forest *within* a
clustering. Clusters are deliberately **not** a second `files`-style tree — identity stays in one
place.

**Clusters carry their own `attributes`** (commit count on an author, ticket count on a feature),
with `attributeDescriptors`/`attributeTypes` at the clustering level mirroring the other lenses.

## Merge

Clusterings merge by key: same clustering key → union of clusters by cluster `id`; same cluster →
union of members by `nodeId` (conflicting weights: keep the reference side, warn — same spirit as
attribute conflicts). `analyzers` merge by union. Unresolvable member ids are dropped with a
warning.

## Producers (future, out of scope for 2.0)

- `gitlogparser`: author ownership (`weighted`, basis = surviving lines or commits — the
  historical-vs-current question is just two clusterings with different `weightBasis`).
- A cluster filter running community detection (Louvain/Leiden) over co-change data or the
  `dependency` lens — clusters as a *derived* lens in the pipe chain.
- Issue/ticket importer (`overlay`), coverage importer (one cluster per suite, `overlay`).

## Visualization (future, out of scope for 2.0)

- **Phase 1 — color/highlight dimension**: "color by cluster" with a categorical palette; hovering
  a cluster highlights its member buildings (same mechanism as edge-metric hover). Overlaps render
  as the dominant cluster with the per-node breakdown in the attribute sidebar. Aggregate views
  (pie chart / ownership share) are pure derived views over `weight × weightBasis`.
- **Phase 2 — alternate layout**: re-run the treemap grouped by the cluster forest instead of the
  folder tree (the temporal-belonging payoff). Much larger change; gated on phase 1 learnings.
