# Edge flags: cyclic and upward

Every dependency edge the parser writes carries two flags, `isCyclic` and `isPointingUpwards`. The visualization's
dependency view draws an edge by them; both live in the cc.json on file edges (`edges`) and leaf edges (`leafEdges`).
State of 2026-10-28.

## What the visualization draws

Default colours (`stores/preferences/store/dependencyGraph/dependencyGraph.reducer.ts`), changeable by the reader;
type and legend in `lenses/dependency/store/dependencyEdge.ts` and `renderer/dependencyGraph/util/dependencyGraphStyle.ts`.

| Look | cyclic | upward | Type | Legend | Meaning |
| --- | --- | --- | --- | --- | --- |
| grey `#8c96a3` | no | no | `regular` | Dependency | Follows the layering |
| blue `#2563eb` | yes | no | `cyclic` | In a cycle | On a real cycle between declarations, not the edge that closes it |
| red `#dc2626`, solid | yes | yes | `feedbackLeafLevel` | Points upward and closes a cycle | The edge of a cycle that runs against the layering |
| red `#dc2626`, dashed | no | yes | `feedbackContainerLevel` | Points upward | No declaration cycle, but against the layering of the folders or packages it connects |

- The dashes tell the types apart only while "line style" shows the edge type (the default, `lineStyleShows:
  "edgeType"`). When it shows the kind of use, `feedbackLeafLevel` gets its own dark red `#7f1d1d`
  (`edgeColorsAsDrawn`).
- An edge metric other than `dependencies` is always `regular`: the flags describe the dependency graph alone.

## How the analysis sets the flags

`processing/ProcessingPipeline.kt`.

**Cyclic** (`processing/cycledetection/`):

- Cycles are found between declarations, not files, by Tarjan's strongly connected components (`CycleAnalyzer`):
  an edge lies on a cycle exactly when both its ends are in one component, as the target's way back to the source
  closes it. No cycle is listed, so a cycle of any length counts; until 2026-10-28 a capped search listed them and
  missed the long ones and short ones far from its start.
- A declaration is its file and its logical path (`DeclarationKey` in `DeclarationCycles`), and a use points at the
  copies the copy rules of its language pick, the same the drawn edges target. Two declarations of one path in
  different files (twin source trees, a C# partial class, Go build variants) are apart, so a cycle closes only along
  drawn edges. Until 2026-10-28 they were one node, whose dependencies came from one copy picked by chance.
- An implementation part (C++ members defined in another file, a Rust `impl` in another file, an SQL body or `ALTER`)
  is one declaration with the declaration of its path, as the compiler sees one type. Its edge to that declaration has
  the kind `part_of` and is cyclic when a cycle enters the type through one part and leaves it through another.
- A declaration edge is cyclic when it lies on a cycle; a file edge when any declaration edge behind it is
  (`FileLevelAggregator`). Edges inside one file disappear from the file layer.
- Every cyclic declaration edge has a way back along cyclic edges, a `part_of` edge walked both ways
  (`cyclicEdgesWithoutWayBack`, a test helper of `DeclarationCyclesTest`).

**Upward** (`processing/levelization/`), once over the folder tree for file edges and once over the namespace tree for
leaf edges:

1. Inside every folder or package, the edges are lifted onto its direct children (`transformEdgeToDirectChildren`).
2. Cycles among the children are broken: per cycle, the edge into the node with the fewest incoming weight is
   removed (`removeCycles`), until none is left.
3. Level 0 is a child without outgoing edges; a child gets level n+1 once all its targets have a level.
4. An edge points upward when, of the two ancestors that are siblings under the lowest common ancestor, the source's
   level is lower than **or equal to** the target's (`GraphIndex.isPointingUpwards`). An edge the index cannot relate
   counts as not upward. A class and a declaration nested in it are not ranked; in a cycle, the edge from the nested
   one back to its host is the upward one (`LogicalProjection.pointsUpwards`).

So a solid red edge is the edge the levelizer removed to break a real cycle, the blue ones are the rest of that cycle,
and a dashed red edge breaks a cycle that exists only between folders or packages.

## How the visualization combines them

`renderer/dependencyGraph/util/edgeProjection.ts`:

- Edges landing on the same two boxes merge; the merged edge is cyclic or upward when any part is.
- Among folders, a declaration edge between two files takes the upward flag of their file edge; its own flag counts
  only inside one file or between two files without a file edge. Among packages its own flag always counts.
- `ccsh gate` applies the folders rule through a Kotlin copy (`isUpward` in `GateTool/.../rules/CycleChains.kt`); a
  change on one side belongs on the other too.

## How the flags are tested

- Analysis unit tests: `CycleAnalyzerTest`, `LevelizerTest`, `IsPointingUpwardsTest`, `FileLevelAggregatorTest`,
  `ProcessingPipelineTest`, `DeclarationCyclesTest` (twin copies, C++ header and source, Rust `impl`, way back);
  `CycleChainsTest` for the gate.
- Visualization unit tests: `dependencyEdge.spec.ts` (flags to type), `edgeProjection.spec.ts` (merging, upward rule),
  `lineStyle.spec.ts`.
- `ProbeRegressionTest` compares ` cyclic` and ` upward` exactly, but only two probes have such a line (`java/r1-mono`
  and `cpp/spec-friend`, whose cycle runs through a friend edge): the name-resolution probes are kept free of cycles on
  purpose.
- The checkpoint probes (`.claude/name-resolution-tools/cp-probes`, 25 of 197 with flags) are compared by
  `cp-compare.py`, which strips the flags, so the acceptance of the name-resolution commits does not check them.
- The sample project reviews (`sample-projects/<language>/FINDINGS.md`) check expected cycles and upward edges by hand.

## Known weak points

1. Which edge of a cycle is the solid red one follows a heuristic (fewest incoming weight); another edge of the same
   cycle would be as right.
2. An equal level counts as upward. After cycle breaking only the removed edges can meet that, but no rule says so.
3. Name resolution feeds both flags: a missing or wrong edge changes cycles and levels.
4. An edge into a Rust facade (`mod.rs`, `lib.rs` re-exporting its children) can be flagged upward when the folders
   form a cycle; about 800 such edges in nushell are not examined yet (known gap, Christian, 2026-10-28).

Next step proposed (2026-10-23): a spec page for cycles and layering, flag probes (cycle, long cycle, container-only
upward, equal level), and flags compared in `cp-compare.py`.
