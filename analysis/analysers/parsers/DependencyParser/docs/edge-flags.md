# Edge flags: cyclic and upward

Every dependency edge the parser writes carries two flags, `isCyclic` and `isPointingUpwards`. The visualization's
dependency view draws an edge by them; both live in the cc.json on file edges (`edges`) and leaf edges (`leafEdges`).
State of 2026-10-23.

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

- Cycles are found between declarations, not files: Tarjan's strongly connected components, then a depth-first search
  for the cycles inside each component (`CycleAnalyzer`, `DepthFirstSearchCycleDetection`).
- The search caps the cycle length by the component's edge count: 10 below 100 edges, 8 below 200, 6 below 400, else 4.
- A declaration edge is cyclic when it lies on a found cycle; a file edge when any declaration edge behind it is
  (`FileLevelAggregator`). Edges inside one file disappear from the file layer.

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
  `ProcessingPipelineTest`; `CycleChainsTest` for the gate.
- Visualization unit tests: `dependencyEdge.spec.ts` (flags to type), `edgeProjection.spec.ts` (merging, upward rule),
  `lineStyle.spec.ts`.
- `ProbeRegressionTest` compares ` cyclic` and ` upward` exactly, but only one spec probe has such a line
  (`java/r1-mono`): the name-resolution probes are kept free of cycles on purpose.
- The checkpoint probes (`.claude/name-resolution-tools/cp-probes`, 25 of 197 with flags) are compared by
  `cp-compare.py`, which strips the flags, so the acceptance of the name-resolution commits does not check them.
- The sample project reviews (`sample-projects/<language>/FINDINGS.md`) check expected cycles and upward edges by hand.

## Known weak points

1. A cycle longer than the cap is not found: in a large component its edges stay grey or dashed red instead of blue or
   solid red.
2. Which edge of a cycle is the solid red one follows a heuristic (fewest incoming weight); another edge of the same
   cycle would be as right.
3. An equal level counts as upward. After cycle breaking only the removed edges can meet that, but no rule says so.
4. Name resolution feeds both flags: a missing or wrong edge changes cycles and levels.

Next step proposed (2026-10-23): a spec page for cycles and layering, flag probes (cycle, long cycle, container-only
upward, equal level), and flags compared in `cp-compare.py`.
