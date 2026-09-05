---
title: "Dependency Parser"
---

**Category**: Parser (takes in source code and outputs cc.json)

This parser extracts the *dependency graph* of a codebase: which file uses which, how often, where the
dependencies run in circles, and which of them point against the architectural flow. It is a port of
[DependaCharta](https://github.com/MaibornWolff/DependaCharta)'s analysis, writing into the cc.json 2.0
**`dependency` lens**.

### What it produces

**Edges**, one per ordered pair of files that depend on each other, addressed by node id:

```json
"dependency": {
  "edges": [{ "fromId": "…", "toId": "…", "attributes": { "dependencies": 3 }, "isCyclic": true }],
  "nodes": { "<nodeId>": { "level": 2 } }
}
```

- `dependencies` is the edge weight: how many individual code-level references the edge stands for.
- `isCyclic` — the edge takes part in a dependency cycle.
- `isPointingUpwards` — the edge runs against the levelized flow, i.e. its target sits at the same level
  as or above its source.

Both flags are absent when false. Together they name the four edge types:

| `isCyclic` | `isPointingUpwards` | Edge type                | Reading                                            |
| ---------- | ------------------- | ------------------------ | -------------------------------------------------- |
| no         | no                  | regular                  | a normal dependency, following the architecture     |
| yes        | no                  | cyclic                   | part of a cycle, but still pointing downwards       |
| no         | yes                 | container-level feedback | an architectural violation between packages         |
| yes        | yes                 | leaf-level feedback      | an architectural violation that also closes a cycle |

**Levels**: `nodes` gives every file and every folder its levelization depth within its parent — 0 for
something that depends on nothing, *n* for something that depends only on nodes below level *n*.

**Metrics**: `outgoing_dependencies` and `incoming_dependencies` per file, the summed weights of the
edges leaving and entering it.

**The logical layer**: the same analysis a second time, at declaration level. `leaves` are the individual
declarations, `namespaces` the packages containing them, and `leafEdges` the dependencies between
declarations:

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

- Both tables are keyed by the dotted logical path, so a namespace's parent is its id's prefix.
- `nodeId` is the id of the file node the declaration lives in — the one join back onto the file tree.
- `usage` lists every way the source uses the target: `usage`, `inheritance`, `implementation`,
  `instantiation`, `argument`, `return_value`, `constant_access`. Only PHP reports more than `usage`
  today; see [known issues](#known-issues).
- `kind` is the declaration kind: `CLASS`, `VALUECLASS`, `INTERFACE`, `ANNOTATION`, `ENUM`, `FUNCTION`,
  `VARIABLE`, `REEXPORT`, `SCRIPT` or `UNKNOWN`.

Both projections ship on every run. The logical one carries the two signals the file-level one cannot: a
dependency between two declarations of the *same* file, and the kind of use each dependency is. Their
levels disagree by design where a language's packages and folders diverge — folder levels are not a
projection of namespace levels, so both trees are levelized separately. The file roughly quadruples in
size uncompressed (376 KB to 1.7 MB on this project's own frontend) and about doubles gzipped; output is
gzipped by default.

### Supported Languages

Java, Kotlin, C#, C/C++, Go, Python, PHP, TypeScript, JavaScript, Vue, Delphi and Rust.

Imports are resolved through each language's own rules, plus tsconfig/jsconfig path aliases, bundler
aliases (webpack, vite, vue.config) and Module Federation remotes.

### Usage and Parameters

| Parameter                                 | Description                                                                             |
|-------------------------------------------|-----------------------------------------------------------------------------------------|
| `FILE or FOLDER`                          | file/project to parse                                                                   |
| `-o, --output-file=<outputFile>`          | output file (or empty for stdout)                                                       |
| `-nc, --not-compressed`                   | save uncompressed output file                                                           |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of extensions to analyse only those files (default: all supported) |
| `-e, --exclude=<patterns>`                | comma-separated list of regex patterns to exclude files/folders                         |
| `-ibf, --include-build-folders`           | include build and common resource folders                                               |
| `--bypass-gitignore`                      | disable automatic .gitignore-based file exclusion                                       |
| `--commit=<ref>`                          | analyze the codebase at a specific git commit/tag/branch (creates a temporary worktree) |
| `--verbose`                               | verbose mode                                                                            |
| `--include-tests`                         | analyse test files too (excluded by default)                                            |
| `--max-file-size=<kb>`                    | skip files of at least this size in KB (default: no limit)                              |
| `--file-timeout=<seconds>`                | give up on a file after this many seconds (default: no timeout)                         |
| `--omit-graph-analysis`                   | emit dependencies only, skipping cycle detection and both levelizations                 |
| `-h, --help`                              | displays this help and exits                                                            |

`--base-file` and `--local-changes` are rejected: the dependency graph needs every file of the project, so
there is no per-file result to skip or reuse. A single file is a legal input; it is analysed alone, with its
directory as the project root.

### Tests are excluded by default

A test depends on everything it exercises and nothing depends on it, so including tests shifts every
level and every cycle. `--include-tests` opts back in. Test files are recognized by directory (`test`,
`tests`, `__tests__`, matched on the path *inside* the project) and by each language's
naming convention (`FooTest.java`, `foo_test.go`, `foo.spec.ts`, `test_foo.py`, …).

### When the analysis does not finish

Cycle detection and levelization are both superlinear in the size of the graph, and levelization runs
twice — once per projection. On a repository where they do not finish, `--omit-graph-analysis` emits the
dependencies and their weights alone, leaving every edge unflagged and the lens without levels.

`--file-timeout` bounds a single file's parse. The parse itself is a blocking native call, so the
timeout abandons *waiting* for it: the file is skipped with a warning while the parse runs to completion
in the background.

### Known issues

**Usage kinds are only reported for PHP.** The `usage` list on a leaf edge can name seven kinds, but every
language except PHP — which runs its own queries — reports only `usage`. The underlying extraction
(`TreeSitterExcavationSite`) does separate used types by the position they appear in, but flattens that
away in the type it hands back, so the distinction is lost before this parser sees it. DependaCharta has
the same gap.

### Examples

Analyze a project folder and write a compressed cc.json:

```
ccsh dependencyparser foo/bar/project -o out.cc.json
```

Include the tests, and give up on any file that takes more than ten seconds:

```
ccsh dependencyparser foo/bar/project --include-tests --file-timeout=10 -o out.cc.json
```

If a project is piped into the DependencyParser, the results and the piped project are merged:

```
ccsh unifiedparser foo/bar/project -nc | ccsh dependencyparser foo/bar/project - -o out.cc.json
```
