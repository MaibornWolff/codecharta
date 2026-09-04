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
5. **Levelize.** The physical folder tree is levelized bottom-up, breaking cycles at the edge into the
   node with the least incoming weight, and `isPointingUpwards` follows from the resulting levels.

Levelizing the *folder* tree means levels join straight onto ids the cc.json file tree already has.
Where a language's packages and folders diverge (Java, C#, Go), the result therefore differs from
DependaCharta's namespace levelization.

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
| `--local-changes`                         | only analyze files that differ from the remote tracking branch                                       |
| `-bf, --base-file=<baseFile>`             | base cc.json file with checksums to skip unchanged files                                             |
| `--verbose`                               | verbose mode                                                                                         |
| `--include-tests`                         | analyse test files too (excluded by default)                                                         |
| `--max-file-size=<kb>`                    | skip files of at least this size in KB (default: no limit)                                           |
| `--file-timeout=<seconds>`                | give up on a file after this many seconds (default: no timeout)                                      |
| `--omit-graph-analysis`                   | emit dependencies only, skipping cycle detection and levelization                                    |
| `-h, --help`                              | displays this help and exits                                                                         |

### Tests are excluded by default

A test depends on everything it exercises and nothing depends on it, so including tests shifts every
level and every cycle. DependaCharta's results are calibrated on production code, and this parser keeps
that default; `--include-tests` opts back in. Test files are recognized by directory (`test`, `tests`,
`__tests__`, `spec`, `specs`, matched on the path *inside* the project) and by each language's naming
convention (`FooTest.java`, `foo_test.go`, `foo.spec.ts`, `test_foo.py`, …).

### When the analysis does not finish

Cycle detection and levelization are both superlinear in the size of the graph. On a repository where
they do not finish, `--omit-graph-analysis` emits the dependencies and their weights alone, leaving
every edge unflagged and the lens without levels.

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
