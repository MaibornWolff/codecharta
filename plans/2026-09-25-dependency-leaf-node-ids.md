---
name: A dependency leaf lists every file its declaration lives in
issue: <#issueid>
state: complete
version: 1
---

## Goal

A declaration split across files (partial class, same package and name in two modules) keeps all of its
files in the logical layer instead of only the first. Alongside, the rules the `dependency` lens only
implies today are written down in the format spec. Both land before the lens ships, so no compatibility
is at stake.

## Tasks

### 1. `leaves[].nodeId` becomes `nodeIds`
- `DependencyLeaf.nodeIds`: every file the declaration lives in; the first is the one incoming file
  edges point at, as today
- Parser collects every file per logical path instead of keeping the first
- Merge unions `nodeIds`; re-keying keeps the files that survive and drops a leaf only when none do
- Reader drops unresolved ids (and a leaf left without any), `ccsh check` reports each unknown id
- Schema (all three copies), viz `ccjson2.model.ts`, `ccjson_to_cgjson.py`, `compare_dependency_parsers.py`

### 2. Document the implicit rules in `dev_docs/cc-json-2.0-format.md`
- Graph flags only describe edges that carry `dependencies`; `edges` is shared with other producers
- A node without a `nodes` entry is not part of the graph
- Levels are local to the parent folder or namespace
- A leaf edge weighs more than 1 when its source declaration is split across files

## Steps

- [x] Complete Task 1: `nodeIds` on leaves
- [x] Complete Task 2: Document the implicit rules

## Notes

- C++ header/source pairs stay folded into one node before leaves are built, so such a class lists only
  its source file; unfolding them would bring back the `.cpp` → `.h` file edges
- On this repo 43 leaves span several files, all in `sample-projects/` (one class copied across languages)
- Considered and not done now: a `language` on leaves (only surfaces key collisions, mostly a
  `sample-projects/` artefact) and `name`/`nodeId` on namespaces
