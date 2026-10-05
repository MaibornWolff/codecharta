---
name: Key the logical layer of the dependency lens by node id
issue: <#issueid>
state: complete
version: 2
---

## Goal

Replace the dotted logical path as the key of `leaves`, `leafEdges` and `namespaces` with the node id
the file tree already has, before any reader depends on the current shape. The logical layer is
unreleased, so this is a rewrite of unreleased work, not a migration.

## Target shape

```json
"leaves": {
  "<file node id>": {
    "Util":    { "kind": "class", "language": "java", "namespace": "com.acme", "level": 1 },
    "A.Inner": { "name": "Inner", "parent": "A", "kind": "class", "language": "java", "level": 0 }
  }
},
"leafEdges": [
  { "fromId": "<file node id>", "fromLeaf": "Helper", "toId": "<file node id>", "toLeaf": "Util",
    "attributes": { "dependencies": 1 }, "usage": ["inheritance"] }
],
"namespaces": { "com": { "level": 0 }, "com.acme": { "parent": "com", "level": 0 } }
```

- A leaf key is unique within its file and never parsed; hierarchy comes from `parent`.
- `name` only when it differs from the key; `namespace` only on top-level leaves of package languages.
- `kind`, `usage` and `language` are lower-case strings with documented known values, not enums.
- `edges`, `nodes`, `attributeTypes` and `attributeDescriptors` do not change.

## Tasks

### 1. Schema (three copies, in step)
- `dev_docs/cc-json-2.0.schema.json` and `visualization/app/codeCharta/util/ccJson2Schema.json`
  (byte-identical, the drift spec compares them), and the 2.0 branch of
  `analysis/analysers/tools/ValidationTool/src/main/resources/cc.json`.
- `leaves` becomes node id → leaf key → leaf; drop `nodeIds`; `name` optional; add `namespace`,
  `parent`, `language`. `leafEdges` gains `fromId`/`toId`. `namespaces` gains `parent`.

### 2. Analysis
- Model: `DependencyLens.kt` — merge by (node id, leaf key), re-key the outer keys of `leaves` and the
  ids of `leafEdges`, drop a file's leaves with the file. `underNamespace` only has to prefix
  `namespaces` keys and the `namespace`/`parent` references.
- Serialization: `CcJsonV2.kt`, `ProjectToCcJsonV2Mapper.kt`, `CcJsonV2ToProjectMapper.kt`,
  `ProjectBuilder.withDependencyLens`.
- Parser output: `DependencyProjectGenerator.kt` and `DependencyGraph.kt` — one leaf per file instead
  of one merged leaf with several files; lower-case kinds; set `language`.
- Validation: `EveritValidator.kt` — outer keys of `leaves` and the ids of `leafEdges` must be file
  nodes, `fromLeaf`/`toLeaf` must exist under their id, `namespace`/`parent` must resolve.
- Scripts: `script/compare_dependency_parsers.py`, `script/ccjson_to_cgjson.py`, `test/golden_test.sh`.
- Tests and fixtures in `model`, `MergeFilter`, `EdgeFilter`, `StructureModifier`, `ValidationTool`
  and the parser.

### 3. Visualization
- `model/ccjson2.model.ts` — the three interfaces. Nothing reads the tables yet, so no view changes.
- `util/ccJson2Schema.json` (Task 1) and the `fileValidator` spec that loads a file with the lens.

### 4. Version and documentation
- `apiVersion` goes to `2.1`: 2.0 is released (`ana-2.0.2`, `vis-2.7.0`), and the whole lens growth —
  edge flags, `nodes`, the logical tables — is one unreleased minor.
- `CC_JSON_SCHEMA_CHANGELOG.md`: a single `2.1` entry describing the finished lens.
- `analysis/CHANGELOG.md`: rewrite the existing unreleased entry on the logical layer to the new
  shape. No "Changed" entry — nobody outside saw the dotted keys.
- `visualization/CHANGELOG.md`: no entry, nothing a user can see changes.
- `dev_docs/cc-json-2.0-format.md`, the parser `README.md`, the gh-pages parser page.

## Steps

- [x] Complete Task 1: schema in all three copies
- [x] Complete Task 2: analysis model, serialization, parser output, validation, scripts, tests
- [x] Complete Task 3: visualization types and validator spec
- [x] Complete Task 4: `apiVersion` 2.1, schema changelog, rewritten analysis entry, docs

## Notes

- Why: the dotted path is the declared package in Java, Kotlin, C#, PHP and C++ but the re-encoded file
  path everywhere else (3293 of 3293 leaves on the visualization), and as a key it collides
  (`app.config.ts` / `app_config.ts`), goes stale on `ccsh modify --move-from` and makes the parent
  ambiguous (`user.ts` beside `user/User.ts`).
- A partial class becomes one leaf per file with the same `namespace` and key; a reader that wants one
  class groups on that pair.
- Parser limit, out of scope: an edge to a name two files declare still targets the first of them.
- JSON does not reject duplicate keys, so the parser has to guarantee a leaf key is unique in its file.
- Nested declarations and overloads are not emitted today; `name` and `parent` reserve room for them.
