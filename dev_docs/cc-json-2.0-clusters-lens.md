# cc.json 2.0 — the `clusters` lens

> Status: **implemented.** `gitlogparser` produces author ownership, and the visualization's metrics
> view shows any clustering in a Clusters tab of the explorer and a section of the inspector.
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

The analysis model reads the lens as `ClustersLens` and carries it through every filter. A lens that
carries no cluster is left out on write, so its key on the wire always means data.

## Shape

```json
"lenses": {
  "clusters": {
    "clusterings": {
      "author-ownership": {
        "title": "Author ownership",
        "membership": "weighted",
        "weightBasis": "rloc",
        "analyzers": ["some-producer"],
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

A filter that re-paths the tree (`ccsh modify`, `merge --large`) re-keys the members and drops those of
removed nodes; a cluster left without members goes too, unless a surviving cluster names it as its parent.

`ccsh check` fails on a member with an unknown node id and warns when the weights of a node in a
`weighted` clustering sum to more than 1.

## Producer: author ownership

`ccsh gitlogparser repo-scan --author-ownership` and `ccsh analyse --author-ownership` write:

```json
"clusters": { "clusterings": { "author-ownership": {
  "title": "Author ownership",
  "membership": "weighted",
  "weightBasis": "loc",
  "analyzers": ["gitlogparser"],
  "clusters": [
    { "id": "a1b2c3d-author-3", "name": "Author 3",
      "members": [ { "nodeId": "<file node id>", "weight": 0.62 } ] }
  ]
} } }
```

- **A weight** is the share of the lines in the file today that the person last changed, from
  `git blame -w -M`, honouring `.git-blame-ignore-revs`. A line counts for everyone who made its commit:
  it is split equally among the author and each `Co-authored-by`, bots and AI included. The weight is
  rounded down to 4 decimals, so a file's weights sum to at most 1, and a share too small to show at
  that precision is left out.
- **The id** starts with the first 7 characters of the repository's first commit, then the author's
  number, so the clusters of two repositories stay apart when their maps are merged.
- **The number** counts people in the order of their first commit, as author or co-author, after applying
  `.mailmap` to both, and someone with no surviving line keeps theirs, so numbers hold as history grows.
  Changing `.mailmap` joins people and so moves the numbers after them. A shallow clone does not see the
  first commits, so its numbers are not stable, and the producer warns about it.
- **Names never reach the file**: no name, email or per-author commit data, and no cluster `attributes`.
  The numbers are pseudonymous, not anonymous: anyone with the repository can match them to people,
  so a map may still be personal data under GDPR.
- **Not attributed** is what is left of a file: uncommitted lines, and all of a binary or empty file.

Further producers could be a cluster filter running community detection over co-change data, an
issue importer or a coverage importer, the last two as `overlay`.

## Visualization

The metrics view offers a Clusters tab in the explorer while a loaded file carries clusters, outside
compare mode. It lists the clusters of one clustering, picked by `title`, flat: `parentId` is not drawn yet.

- **The total** of a cluster is the sum of its weights over the files shown, divided by the number of
  files shown, so exclusions and folder focus apply and each file counts the same whatever its size.
  It is labelled "share of files" for that reason, and does not read `weightBasis`, so a map without
  that metric works.
- **"Not attributed"** is 1 minus the sum of those totals. An `overlay` has none, as its weights are never summed.
- **Hover** lights every shown file with any share, **a click** pins it, through the kept highlight of the map.
- **The inspector** lists the clusters a selected file belongs to, per clustering.
- **The repository marker** is the commit prefix of the id, shown only when two repositories' clusters
  meet in one clustering.

The lens stays on the loaded file; anything merged across files is derived in a selector, following
[LENS_DATA_RULES.md](../visualization/LENS_DATA_RULES.md).
