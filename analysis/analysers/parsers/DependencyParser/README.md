# Dependency Parser

**Category**: Parser (takes in source code and outputs cc.json)

This parser extracts the *dependency graph* of a codebase: which file uses which, how often, where the
dependencies run in circles, and which of them point against the architectural flow. It is a port of
[DependaCharta](https://github.com/MaibornWolff/DependaCharta)'s analysis, running on CodeCharta's
infrastructure and writing into the cc.json 2.0 **`dependency` lens** instead of a `.cg.json`.

## What it produces

**Edges.** One per ordered pair of files that depend on each other, addressed by node id:

```json
"dependency": {
  "edges": [{ "fromId": "…", "toId": "…", "attributes": { "dependencies": 3 }, "isCyclic": true }],
  "nodes": { "<nodeId>": { "level": 2 } }
}
```

- `dependencies` is the edge weight: how many individual code-level references the edge stands for.
- `isCyclic` — the edge takes part in a dependency cycle.
- `isPointingUpwards` — the edge runs against the levelized flow, i.e. its target sits at the same
  level as or above its source.

Both flags are absent when false. Together they name the four edge types DependaCharta defines:

| `isCyclic` | `isPointingUpwards` | Edge type                  | Reading                                              |
| ---------- | ------------------- | -------------------------- | ---------------------------------------------------- |
| no         | no                  | regular                    | a normal dependency, following the architecture       |
| yes        | no                  | cyclic                     | part of a cycle, but still pointing downwards         |
| no         | yes                 | container-level feedback   | an architectural violation between packages           |
| yes        | yes                 | leaf-level feedback        | an architectural violation that also closes a cycle   |

**Levels.** `nodes` gives every file and every folder its levelization depth within its parent: 0 for
something that depends on nothing, *n* for something that depends only on nodes below level *n*.

**Metrics.** `outgoing_dependencies` and `incoming_dependencies` per file, in the metrics lens — the
summed weights of the edges leaving and entering that file.

**The logical layer.** The same analysis a second time, at declaration level — the model DependaCharta
works in. `leaves` are the individual declarations, `namespaces` the packages containing them, and
`leafEdges` the dependencies between declarations:

```json
"dependency": {
  "namespaces": { "com.example.domain": { "level": 0 } },
  "leaves": {
    "com.example.domain.Creature": { "nodeId": "<file node id>", "name": "Creature", "kind": "CLASS", "level": 2 }
  },
  "leafEdges": [
    { "fromLeaf": "com.example.domain.Creature", "toLeaf": "com.example.domain.HitPoints",
      "attributes": { "dependencies": 1 }, "usage": ["inheritance"], "isCyclic": true, "isPointingUpwards": true }
  ]
}
```

- Both tables are keyed by the **dotted logical path** verbatim, so a namespace's parent is its id's
  prefix and needs no field of its own. `name` is kept because the logical path escapes dots inside a
  segment and that escaping is not reversible.
- **`nodeId`** is the id of the file node the declaration lives in — the one join from the logical layer
  back onto the file tree, and the only thing a re-pathing filter has to rewrite.
- **`usage`** lists every way the source declaration uses the target: `usage`, `inheritance`,
  `implementation`, `instantiation`, `argument`, `return_value`, `constant_access`. **Only PHP reports
  more than `usage` today**, because `PhpAnalyzer` runs its own tree-sitter queries and classifies types by
  the clause they appear in. Every other language goes through `TreeSitterExcavationSite`, which already
  makes the same distinction internally — its per-language `UsedTypeExtractor` has separate
  `extractInheritanceTypes`, `extractParameterTypes`, `extractReturnTypes`, `extractObjectCreationTypes`
  passes — but flattens it into a public `UsedType` of `(name, genericTypes, namespacePrefix)`. Carrying
  the position on `UsedType` upstream would light all of these up at once; `TseMappings.toType()` is the
  only place here that would change. DependaCharta has the same gap for the same reason.
- A declaration split across files — a C# partial class, a Go function name reused within a package — is
  one leaf, joined to the first of its files as the scan lists them (path order), and its `leafEdges` are the union of every
  part's dependencies. In the physical layer each part's dependencies count for the file they are written
  in, while a dependency *on* the split declaration points at the same first file the leaf reports.
- `kind` is the declaration kind: `CLASS`, `VALUECLASS`, `INTERFACE`, `ANNOTATION`, `ENUM`, `FUNCTION`,
  `VARIABLE`, `REEXPORT`, `SCRIPT` or `UNKNOWN`.
- `leafEdges` is a list of its own rather than a widened `Edge`, because `Edge` addresses file nodes by
  id and is what the edge-metric machinery, `edgefilter` and the 3D map read. Leaving `edges` untouched
  is what keeps the physical view working unchanged.

Both projections ship on every run. The logical one carries the two signals the physical one cannot: a
dependency between two declarations of the *same* file (which disappears when edges fold onto files) and
the kind of use each dependency is. Levels of the two disagree by design where a language's packages and
folders diverge — folder levels are not a projection of namespace levels, so both are levelized
separately.

Size on `visualization/app` (921 files, 2150 declarations, 3986 declaration edges): 376 KB → 1.7 MB
uncompressed, 65 KB → 166 KB gzipped. Output is gzipped by default, so the cost lands mostly in viewer
memory. `--omit-graph-analysis` skips both levelizations and both cycle passes, leaving both projections
without levels and with every edge unflagged.

### Parity with DependaCharta

Both tools run over the three contract samples in
`src/test/resources/analysis/contract/examples/{java,csharp,cpp}`:

| Sample   | Declarations (DC / ccsh) | Declaration edges | Cyclic edges | Upward-pointing edges |
| -------- | ------------------------ | ----------------- | ------------ | --------------------- |
| `java`   | 16 / 16                  | 30 / 29           | 6 / 6        | 3 / 2                 |
| `csharp` | 16 / 16                  | 29 / 28           | 6 / 6        | 3 / 2                 |
| `cpp`    | 16 / 16                  | 29 / 28           | 6 / 6        | 3 / 2                 |

Every declaration and every declaration pair matches exactly. The single difference in each sample is
one **self-edge** (`HitPoints` → `HitPoints`), which DependaCharta keeps and flags as upward-pointing
and this parser drops: an edge from a declaration to itself says nothing about the architecture, and the
file-level projection has never carried one either.

`script/compare_dependency_parsers.py` produces this comparison for any project: it runs both tools (or
takes two existing output files) and diffs declarations, declaration edges, namespace levels and file
edges by key, ignoring the self-edges unless asked to keep them. It needs the DependaCharta fat jar,
found via `--dependacharta-jar` or `DEPENDACHARTA_JAR`, and a locally installed `ccsh`.

```
./script/compare_dependency_parsers.py path/to/project --dependacharta-jar dependacharta.jar
```

## How it works

1. **Extract.** Every source file is parsed with tree-sitter into the declarations it contains and the
   types they use. Imports are resolved through the language's own rules, plus tsconfig/jsconfig path
   aliases, bundler aliases (webpack, vite, vue.config) and Module Federation remotes.
2. **Resolve.** Used types are matched against the declarations the whole project offers, with a
   per-language standard-library filter so `java.util.List` does not become a project dependency.
3. **Detect cycles.** Tarjan's algorithm finds the strongly connected components, then a bounded DFS
   enumerates the cycles inside each. This runs at *declaration* level, where a cycle means two classes
   genuinely reference each other.
4. **Aggregate onto files.** Declaration edges fold onto the file they live in: weights sum, `isCyclic`
   ORs, and an edge between two declarations of the same file disappears.
5. **Levelize, twice.** The namespace tree and the physical folder tree are each levelized bottom-up,
   breaking cycles at the edge into the node with the least incoming weight; `isPointingUpwards` follows
   from the resulting levels, once per projection.

Levelizing the *folder* tree means the physical levels join straight onto ids the cc.json file tree
already has. Where a language's packages and folders diverge (Java, C#, Go), those levels therefore
differ from the namespace levels in the logical layer — which are DependaCharta's.

## Supported languages

Java, Kotlin, C#, C/C++, Go, Python, PHP, TypeScript, JavaScript, Vue, Delphi and Rust.

## Usage and parameters

| Parameter                                 | Description                                                                                          |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `FILE or FOLDER`                          | file/project to parse                                                                                |
| `-o, --output-file=<outputFile>`          | output file (or empty for stdout)                                                                    |
| `-nc, --not-compressed`                   | save uncompressed output file                                                                        |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of extensions to analyse only those files (default: all supported)              |
| `-e, --exclude=<patterns>`                | comma-separated list of regex patterns to exclude files/folders                                      |
| `-ibf, --include-build-folders`           | include build and common resource folders                                                            |
| `--bypass-gitignore`                      | disable automatic .gitignore-based file exclusion                                                    |
| `--commit=<ref>`                          | analyze the codebase at a specific git commit/tag/branch (creates a temporary worktree)              |
| `--verbose`                               | verbose mode                                                                                         |
| `--include-tests`                         | analyse test files too (excluded by default)                                                         |
| `--max-file-size=<kb>`                    | skip files of at least this size in KB (default: no limit)                                           |
| `--file-timeout=<seconds>`                | give up on a file after this many seconds (default: no timeout)                                      |
| `--omit-graph-analysis`                   | emit dependencies only, skipping cycle detection and both levelizations                              |
| `-h, --help`                              | displays this help and exits                                                                         |

`--base-file` and `--local-changes` are rejected: the dependency graph needs every file of the project, so
there is no per-file result to skip or reuse. A single file is a legal input; it is analysed alone, with its
directory as the project root. It is still judged by extension, size and the test-file rule, while `.gitignore`
and the exclude patterns only apply to a directory walk.

### Tests are excluded by default

A test depends on everything it exercises and nothing depends on it, so including tests shifts every
level and every cycle. DependaCharta's results are calibrated on production code, and this parser keeps
that default; `--include-tests` opts back in. Test files are recognized by directory (`test`, `tests`,
`__tests__`, `spec`, `specs`, matched on the path *inside* the project) and by each language's naming
convention (`FooTest.java`, `foo_test.go`, `foo.spec.ts`, `test_foo.py`, …).

### When the analysis does not finish

Cycle detection and levelization are both superlinear in the size of the graph, and levelization now
runs twice — once per projection. On a repository where they do not finish, `--omit-graph-analysis`
emits the dependencies and their weights alone, leaving every edge unflagged and the lens without
levels.

`--file-timeout` bounds a single file's parse. The parse itself is a blocking native call, so the
timeout abandons *waiting* for it: the file is skipped with a warning while the parse runs to
completion in the background.

## Examples

Analyze a project folder and write a compressed cc.json:

```
ccsh dependencyparser foo/bar/project -o out.cc.json
```

Include the tests, and give up on any file that takes more than ten seconds:

```
ccsh dependencyparser foo/bar/project --include-tests --file-timeout=10 -o out.cc.json
```

Combine the dependency graph with the metrics of another parser:

```
ccsh unifiedparser foo/bar/project -nc | ccsh dependencyparser foo/bar/project - -o out.cc.json
```
