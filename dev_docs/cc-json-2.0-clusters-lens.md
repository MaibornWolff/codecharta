# cc.json 2.0 — the `clusters` lens

> Status: **implemented.** `gitlogparser` produces author ownership and commit changes, `dependencyparser` the tests,
> and the visualization's metrics view shows any clustering in a Clusters tab of the explorer and a section of the
> inspector.
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
with `attributeDescriptors`/`attributeTypes` at the clustering level mirroring the other lenses. A value is a
number or a string: `attributeTypes` describes numbers only, so a string has no entry there, and an ISO date sorts
correctly as text. A descriptor's `title` names the value in a view, which falls back to its key.

## Merge

Clusterings merge by key: same clustering key → union of clusters by cluster `id`; same cluster →
union of members by `nodeId` (conflicting weights: keep the reference side, warn — same spirit as
attribute conflicts). `analyzers` merge by union. Unresolvable member ids are dropped with a
warning.

A filter that re-paths the tree (`ccsh modify`, `merge --large`) re-keys the members and drops those of
removed nodes, and moves a cluster `id` or `parentId` that is a node id, as a test's is; a cluster left without members goes too, unless a surviving cluster names it as its parent.

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
    { "id": "a1b2c3d-author-teal-falcon", "name": "Teal Falcon",
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
  pseudonym, so the clusters of two repositories stay apart when their maps are merged. Clusters are sorted by id,
  so their order does not give away who came first.
- **The pseudonym** is a colour and an animal, picked by the person's place in the order of first commits, as author or
  co-author, after applying `.mailmap` to both, from word lists shuffled by the repository's first commit. Someone with no
  surviving line keeps theirs, so names hold as history grows. The lists walk in step and have coprime sizes, 71 and 73:
  no word repeats before a list runs out, no pair before 5,183 people, and then a suffix keeps names unique. The lists hold
  no word with a rude or insulting reading and are frozen, because changing one renames everyone.
  Changing `.mailmap` joins people and so renames the people after them. A shallow clone does not see the
  first commits, so its names are not stable, and the producer warns about it.
- **No hashing**: a plain hash of a name can be recomputed from a list of employees, a keyed one needs a key kept safe,
  and a hash picking from a word list collides.
- **Real names stay out of the file by default**: no name, email or per-author commit data, and no cluster `attributes`.
  `--with-author-names` opts out for names alone: the cluster `name` is then the person's name, under the clustering
  `author-ownership-with-names` titled "Author ownership (real names)", so a merge never mixes it with pseudonymous clusters.
  The CLI warns last, even with `--silent`, and the Clusters tab warns whenever a loaded map holds that clustering.
  The pseudonyms are not anonymous: anyone with the repository can match them to people by comparing `git blame`,
  so a map may still be personal data under GDPR.
- **Not attributed** is what is left of a file: uncommitted lines, and all of a binary or empty file.

## Producer: commit changes

`ccsh gitlogparser repo-scan --commit-changes-since YYYY-MM-DD` and the same option of `ccsh analyse` write:

```json
"clusters": { "clusterings": { "commit-changes": {
  "title": "Commit changes",
  "membership": "overlay",
  "weightBasis": "loc",
  "analyzers": ["gitlogparser"],
  "clusters": [
    { "id": "<full commit hash>", "name": "a1b2c3d Fix login",
      "attributes": { "date": "2026-10-31", "changed_files": 2, "changed_lines": 14 },
      "members": [ { "nodeId": "<file node id>", "weight": 0.25 } ] }
  ],
  "attributeDescriptors": { "date": { "title": "Date" }, "changed_files": { "title": "Files changed" }, "changed_lines": { "title": "Lines changed" } },
  "attributeTypes": { "changed_files": "absolute", "changed_lines": "absolute" }
} } }
```

- **The window is required**, as an absolute day in UTC: a repository's whole history can reach tens of thousands of
  clusters, and "6 months ago" would give another map on every run.
- **A weight** is the lines the commit added and removed over the lines in the file today, capped at 1 because the
  schema caps weights there, so it reads "at least this share of today's size", and floored at 0.0001 so that a real
  change stays a member. A file with no line count (binary, or empty today) omits the weight, the wire's "whole file".
  A pure rename is no member. This is why the clustering is an `overlay`: a file's commits can sum far above 1.
- **The id** is the full hash, unique across repositories, so no marker is needed when maps merge.
- **Files** follow renames to their path today (`git log -M`), walking from the newest commit; a commit with no member
  left is not written, and merge commits never are.
- **The attributes** describe the whole commit, including files gone today, so they survive filters unchanged.
- **Personal data**: subjects are free text and a hash leads to its author, so the map may still be personal data.

Further producers could be a cluster filter running community detection over co-change data, an
issue importer or a coverage importer, the last two as `overlay`.

## Visualization

The metrics view offers a Clusters tab in the explorer while a loaded file carries clusters, outside
compare mode. It lists the clusters of one clustering, picked by `title`, flat: `parentId` is not drawn yet.

- **The total** of a cluster is `Σ weight × basis ÷ Σ basis` over the files shown, where basis is the map's area
  metric, so the share is one of what the buildings show, and exclusions and folder focus apply. A weight of `loc`
  applied to `rloc` assumes a file's lines spread evenly over code, comments and blank lines; exact shares would need
  the producer to classify each blamed line. Where no shown file holds the area metric, the basis is the clustering's
  `weightBasis`, and where none holds that either, every file counts the same, labelled "share of files", so a map from
  the git log alone still works. The label names the metric, "share of lines" for `loc`.
- **An `overlay`** shows only the part of the map instead, labelled "share of the map", or of the files counted where
  no file holds the area metric: its weights mean something of their own, such as a commit's churn, which is no share.
- **The part of the map** is `Σ area ÷ Σ area` over the cluster's shown files, ignoring weights, because the highlight
  lights whole buildings. It shows below the share, after the sorted attribute, and as a lighter bar behind it, so
  the gap between owning and touching is visible. It is left out without an area metric, for a cluster covering
  none of the map and for an `overlay`, whose share it already is.
- **"Not attributed"** is 1 minus the sum of those totals. An `overlay` has none, as its weights are never summed.
- **Hover** shows only that cluster's shown files, replacing whatever the kept highlight holds until it ends; **a click**
  pins it into the kept highlight. Either greys the rest of the 3D map and limits its labels to those files.
- **A cluster with no building** among its shown files, say because they have no area in the current metric,
  goes into one closed "not on the map" group after the other rows, in the same order, which opens on a click; its share
  still counts them, and the group sums those shares unless it is an `overlay`.
- **Attributes** of a cluster show below its name by their `title`, the sorted one first. The list sorts by share or by
  any attribute, highest first, whatever the descriptor's `direction`: which end matters is the reader's question.
- **A long list** renders only the rows on screen, and above ten clusters it can be filtered by name.
- **The inspector** lists the clusters a selected file belongs to, per clustering, the 20 biggest and a count of the rest.
- **The repository marker** is the commit prefix of the id, shown only when two repositories' clusters
  meet in one clustering.

The lens stays on the loaded file; anything merged across files is derived in a selector, following
[LENS_DATA_RULES.md](../visualization/LENS_DATA_RULES.md).
## Producer: tests

`ccsh dependencyparser --link-tests` writes:

```json
"clusters": { "clusterings": { "tests": {
  "title": "Tests",
  "membership": "overlay",
  "analyzers": ["dependencyParser"],
  "clusters": [
    { "id": "<test file node id>", "name": "PriceTest.kt",
      "members": [ { "nodeId": "<code file node id>" } ] },
    { "id": "<code file node id>", "name": "price.rs (tests inside)",
      "members": [ { "nodeId": "<code file node id>" } ] }
  ]
} } }
```

- **One cluster per test file** that names code, its members the code files it names directly, without weights. A
  test file that names nothing has no cluster. A file with tests inside (Rust's `#[cfg(test)]`) gets a cluster named
  `<file> (tests inside)` that holds its own file too.
- **The id is the node id of the file holding the tests**, so a view finds the test on the map like a member. Clusters
  follow the tests' paths.
- **The metric `test_file`** goes with the clustering, in `lenses.metrics`: 1 on each test file, 0 on every other file
  the run read, so a test that names nothing still counts. A run without `--link-tests` writes neither.
- A link means a test names a file, not that it runs it.
