---
name: Convert a cc.json dependency lens back into DependaCharta's cg.json
issue: <#issueid>
state: complete
version: 1
---

## Goal

A script that turns the `dependency` lens of a cc.json 2.0 file into a `.cg.json`, so the graph
`ccsh dependencyparser` produces can be opened in DependaCharta's Web Studio and compared there
against a DependaCharta run of the same project.

## Tasks

### 1. Read the lens
- Input may be gzipped (ccsh compresses by default); detect it by magic bytes
- Use `lenses.dependency.{leaves,namespaces,leafEdges}` and the `files` tree only — the lens `edges`
  may carry metrics from a piped project (`temporal_coupling`) and are not the dependency graph
- Resolve `nodeId` to a repository-relative path through the `files` tree, dropping its `root` node

### 2. Emit the leaves table
- `{id, name, physicalPath, nodeType, language, dependencies}` per declaration
- `language` from the file extension, using the same names DependaCharta's enum has
- `dependencies[target] = {isCyclic, weight, type, isPointingUpwards}`; write `isPointingUpwards`
  as false the way DependaCharta does, since the tree is what carries the real flag

### 3. Emit the namespace tree
- One node per namespace and one per declaration, keyed by the dotted logical path
- A declaration that has declarations nested inside it gets a container node *beside* its leaf node,
  as DependaCharta does, so no node has both a `leafId` and children
- `containedLeaves` are the declarations strictly below a node, and
  `containedInternalDependencies` aggregates their outgoing edges by target: weight sums,
  `isCyclic` and `isPointingUpwards` OR

### 4. Verify
- Round-trip the result through `compare_dependency_parsers.py` against its own input: the two must
  agree on leaves, leaf edges and namespaces
- Check the emitted node and leaf key sets against a real DependaCharta file, and that no
  `containedLeaves` entry or dependency target is dangling

## Steps

- [x] Complete Task 1: read the lens
- [x] Complete Task 2: leaves table
- [x] Complete Task 3: namespace tree
- [x] Complete Task 4: verification, README pointer

## Notes

- Python 3, standard library only, next to `compare_dependency_parsers.py` under `analysis/script/`.
- DependaCharta emits one tree node per declaration *occurrence*, so the same declaration appears
  several times when several files declare it. The cc.json lens holds one leaf per logical path, so
  the converted tree is deduplicated — a difference in the tree, not in the graph.
