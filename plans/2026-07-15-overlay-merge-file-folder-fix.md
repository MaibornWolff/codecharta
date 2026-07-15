---
name: overlay-merge-file-folder-collision-fix
issue: none
state: complete
version: 1
---

## Goal

Fix finding 7e (`plans/2026-07-10-branch-review.md`): OVERLAY merge nests an incoming leaf under a
same-named reference *File*, emitting a structurally invalid File node that owns children. Make
`NodeInserter`'s folder-traversal parent lookup type-aware so it never mistakes a File for a folder
parent — mirroring how UNION already resolves the same collision (keep both as separate siblings).

## Tasks

### 1. Pin the bug with a regression test first (red)
- Add a test on `OverlayMergeResolver` reproducing the finding's exact repro: reference `/src/foo`
  (File, `{a: 1.0}`), incoming `/src/foo/bar.kt` (File, `{b: 2.0}`) — ordinary tool-output shapes, no
  hand-crafted File root. Assert the current (broken) output before touching `NodeInserter`.
- Add a matching unit test directly on `NodeInserter.insertByPath` (model module) for the same
  File/Folder collision, since the fix lives there and every parser routes through it — the merge
  test alone would leave the shared model code unpinned.

### 2. Make `NodeInserter`'s folder-traversal lookup type-aware
- `NodeInserter.kt` has one private `getNode(root, name)` used at two call sites — keep them
  distinct instead of unifying them further:
  - Line 17 (`rootContainsNodeAlready`/terminal leaf-merge branch): **unchanged**. Same-named
    terminal nodes should keep merging regardless of type — that's the existing, intentional
    `NodeMaxAttributeMerger.createType` "conflicting types" warning path.
  - Line 31 (folder-traversal branch, resolving/creating the *parent* while walking a path): add a
    new type-aware lookup (e.g. `getFolderNode`) matching `it.name == name && it.type == NodeType.Folder`.
- When a same-named File sits where a Folder parent is expected, `getFolderNode` returns `null`, so
  `root.insertNewFolderNode(name)` creates a new Folder **sibling** instead — the exact outcome UNION
  already produces for this collision (`dcbbd3b5a`, `MergeResolverStrategy.nodesMatch`).

### 3. Regression-test across every `NodeInserter` caller
- `NodeInserter.insertByPath` is the shared insertion path for UnifiedParser, GitLogParser,
  SVNLogParser, RawTextParser, SonarImporter, TokeiImporter, CoverageImporter (4 strategies),
  CSVImporter, DependaChartaImporter, EdgeFilter, and MergeFilter — run the full suite, not just
  MergeFilter's: `./gradlew test` and `./gradlew integrationTest`.
- Any diff beyond the two new regression tests means an existing fixture relied on the old name-only
  collision behavior — investigate before accepting it, don't just update the golden file.

### 4. Verify against the finding's repro
- Re-run finding 7e's exact repro against `OverlayMergeResolver` and confirm the emitted tree is now
  two siblings (`foo` File `{a}`, `foo` Folder → `bar.kt`) instead of a File owning a child.
- Spot-check with `analysis/script/compare-ccsh.sh` (or a manual OVERLAY merge) against real output if
  a natural File/Folder name collision is easy to find in this repo's own analysis output.

### 5. Close out the finding
- Update `plans/2026-07-10-branch-review.md`: move finding 7e from "Not taken on" to resolved, with a
  one-line pointer to the fix commit (matching how 7a/7c/7d are already recorded there).

## Steps

- [x] Complete Task 1: Pin the bug with a regression test first (red)
- [x] Complete Task 2: Make `NodeInserter`'s folder-traversal lookup type-aware
- [x] Complete Task 3: Regression-test across every `NodeInserter` caller
- [x] Complete Task 4: Verify against the finding's repro
- [x] Complete Task 5: Close out the finding

## Outcome

The folder-traversal lookup alone (Task 2 as originally scoped) was insufficient: the same File/Folder
clash is also reachable through the terminal same-name merge branch when the incoming leaf happens to
be inserted before the reference leaf. Extended the fix to also guard that branch
(`getMergeableNode`, mirroring `UnionMergeResolver.isFileFolderClash`) so both insertion orders
converge on keeping the File and Folder as siblings. One pre-existing `NodeInserterTest` case
hand-crafted a File/Folder merge and was updated to use two same-typed nodes, preserving its original
dedup-on-insert intent. Landed in `49b2a6225`.

## Notes

- Root cause: `NodeInserter.getNode` (`analysis/model/src/main/kotlin/de/maibornwolff/codecharta/model/NodeInserter.kt:37-39`)
  matches children by name only, no type check. The folder-traversal branch (`:31`) uses it to
  resolve/create the parent while walking a path, so a same-named File is mistaken for a folder and
  gets a child attached to it — structurally invalid, and non-deterministic which node "wins" since it
  depends on the resolved-leaves map's iteration order.
- Chosen fix (type-aware `NodeInserter`) was picked over two alternatives: (a) a narrow guard local to
  `OverlayMergeResolver.resolveLeaves` (zero blast radius outside MergeFilter, but leaves the same
  latent name-only collision reachable by any future `NodeInserter` caller), and (c) documenting the
  limitation without a code change. Rationale for going wide: this mirrors UNION's already-ratified
  fix for the identical collision shape (`dcbbd3b5a`), so OVERLAY and UNION converge on the same
  semantics via the one shared insertion path instead of duplicating the guard per merge strategy.
- Discovered while tracing finding 7c (`plans/2026-07-10-branch-review.md:305-349`), 2026-07-10;
  documented 2026-07-13. Not a 2.0 regression in the traditional sense — `NodeInserter`'s name-only
  matching dates to 2018 (`48422bf31`); OVERLAY merge (`ef13422e8`, 2026-06-25) is simply the first
  caller to reach this exact collision shape.
