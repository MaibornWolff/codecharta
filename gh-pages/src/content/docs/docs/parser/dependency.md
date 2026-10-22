---
title: "Dependency Parser"
description: "Extract the dependency graph of a codebase with ccsh dependencyparser: file and declaration dependencies, cycles, levels and architecture violations."
sidebar:
  label: "Dependency"
---

:::caution[Experimental]
This parser is experimental: its output and options may still change between releases.
:::

The Dependency Parser extracts the dependency graph of a codebase: which file uses which, how often, where the
dependencies run in circles, and which of them point against the architectural flow. It is a port of
[DependaCharta](https://github.com/MaibornWolff/DependaCharta)'s analysis and writes the `dependency` lens of the
cc.json file, which the visualization shows in its [dependency view](/docs/visualization/user-controls/dependency-view).

## Quick start

```bash
ccsh dependencyparser path/to/project -o dependencies.cc.json
```

This writes `dependencies.cc.json.gz`.

## Options

| Parameter                                 | Description                                                                             |
|-------------------------------------------|-----------------------------------------------------------------------------------------|
| `FILE or FOLDER`                          | file/project to parse. To merge the result with an existing project piped into STDIN, pass a '-' as an additional argument |
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
directory as the project root. It is still judged by extension, size and the test-file rule, while `.gitignore`
and the exclude patterns only apply to a directory walk.

## What it produces

**Edges**, one per ordered pair of files that depend on each other, addressed by node id:

```json
"dependency": {
  "edges": [{ "fromId": "…", "toId": "…", "attributes": { "dependencies": 3 }, "isCyclic": true }],
  "nodes": { "<nodeId>": { "level": 2 } }
}
```

- `dependencies` is the edge weight: how many declaration-level dependencies the edge stands for. A
  declaration that uses another counts once, however many times it references it, as in DependaCharta.
- `isCyclic` — the edge takes part in a dependency cycle.
- `isPointingUpwards` — the edge runs against the levelized flow, i.e. its target sits at the same level
  as or above its source. A dependency between a class and a declaration nested in it does so only when
  the two form a cycle, and then only the edge from the nested declaration back to its host.

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
  "namespaces": { "com": { "level": 0 }, "com.example": { "parent": "com", "level": 0 } },
  "leaves": {
    "<file node id>": { "Creature": { "kind": "class", "language": "java", "namespace": "com.example", "level": 2 } }
  },
  "leafEdges": [
    { "fromId": "<file node id>", "fromLeaf": "Creature", "toId": "<file node id>", "toLeaf": "HitPoints",
      "attributes": { "dependencies": 1 }, "usage": ["inheritance"], "isCyclic": true, "isPointingUpwards": true }
  ]
}
```

- `leaves` groups the declarations under the id of the file node they are declared in, each under a key
  unique within that file: the declaration's name, or its dotted logical path where two declarations of
  one file share a name, in which case `name` is written beside it.
- `namespace` is written only where the language has packages apart from its files — Java, Kotlin, C#,
  PHP and C++. Everywhere else the file tree already is the hierarchy, so the leaf carries no
  `namespace` and no namespace is listed.
- `namespaces` lists the packages with their level and their `parent`, the package containing them.
- `language` is the language the declaration is written in, lower case, such as `java` or `typescript`; an Angular
  template is `angular`.
- `usage` names how the source uses the target: `usage`, `inheritance`, `implementation`,
  `instantiation`, `argument`, `return_value`, `constant_access`. A pair carries one kind, the first the
  extractor found, as in DependaCharta. PHP reports every kind; Java, Kotlin and C# report `inheritance`
  and `implementation`; see [known issues](#known-issues).
- A name declared in several files — a C# partial class, a Go function name reused within a package, two projects
  with the same package — is one leaf per file, with the same key and, where it has one, the same `namespace`. Each
  copy's dependencies leave the file they are written in, while a dependency *on* the name points at the file that
  shares the longest folder path with the file using it, and among equally near files at the first as the scan
  lists them (path order); for SQL at the latest migration, and for C# at the first file. A Kotlin `private`
  top-level copy counts only for the file it is written in.
- `kind` is the declaration kind: `class`, `valueclass`, `interface`, `annotation`, `enum`, `function`,
  `variable`, `reexport`, `script` or `unknown`.

Both projections ship on every run. The logical one carries the two signals the file-level one cannot: a
dependency between two declarations of the *same* file, and the kind of use each dependency is. Their
levels disagree by design where a language's packages and folders diverge — folder levels are not a
projection of namespace levels, so both trees are levelized separately. The file roughly quadruples in
size uncompressed (520 KB to 2.0 MB on this project's own frontend) and grows two and a half times
gzipped; output is gzipped by default.

## Supported languages

Java, Kotlin, C#, C/C++, Go, Python, PHP, TypeScript, JavaScript, Vue, Delphi, Rust, Angular templates and SQL, with
the same file extensions as the [Unified Parser](/docs/parser/unified#supported-languages). C files (`.c`, `.h`) are
read as C++.

An Angular template (`.html`) depends on each component it names by the element of its selector and on each pipe it
names, as the `@Component` and `@Pipe` decorators in the TypeScript files declare them. A name that several classes
declare means the one in the scope of the template's component, as Angular decides it: the `imports` of a standalone
component, or the `declarations` and `imports` of the `@NgModule` that declares the component, where an imported
module adds what it exports, a module it exports in turn included. A class a decorator names is the one its file
imports, so two classes of the same name in different folders are told apart. A name that no class declares, such as a
library component, or that the scope does not decide draws no edge. A component depends on the template file its
`templateUrl` names; the inline `template` of a component is read like a template file, and its edges leave the `.ts`
file of the component. Every `.html` file is read as an Angular template, by this parser as by `unifiedparser` and
`domainlanguageparser`; exclude the `.html` files that are no templates of an Angular application, such as reports or
documentation, with `-e`.

Imports are resolved through each language's own rules, plus tsconfig/jsconfig path aliases, bundler
aliases (webpack, vite, vue.config) and Module Federation remotes.

A name in the code refers only to declarations of a language that can name them: Java and Kotlin share their names,
as do TypeScript, JavaScript, Vue and Angular templates, and C and C++; every other language keeps its own. A
repository with several languages thus draws no edge from a Python name to a SQL table or from a C++ class to a
Python class of the same name.

SQL has no imports: a table, view, synonym, package or routine is found by its name, whatever file creates it and
in whatever dialect. A name with a schema (`dbo.orders`) finds the object of that schema, or else one created
without a schema; a name without one finds the object of the same schema first, then one created without a schema,
then one of any schema. Names compare without
regard to case, like the database does with unquoted names and with names in brackets or backticks; a name in
double quotes keeps its case (`"Orders"` is not `orders`), unless it is written all in one case (`"orders"`,
`"ORDERS"`), which is how PostgreSQL and Oracle store an unquoted name. An object created in several files, such as
a view that migrations recreate, is one leaf per file, and a use points at the last of these files, the latest
migration: paths are ordered folder by folder and name by name, with the numbers in them compared as numbers, so
`V10__orders.sql` comes after `V9__orders.sql`, and a later folder wins over an earlier one whatever the file names.
Flyway's repeatable migrations (`R__views.sql`) come after the versioned ones of their folder, as Flyway runs them
last.

## Tests are excluded by default

A test depends on everything it exercises and nothing depends on it, so including tests shifts every
level and every cycle. `--include-tests` opts back in. Test files are recognized by directory (`test`,
`tests`, `__tests__`, `spec`, `specs`, matched on the path *inside* the project) and by each language's
naming convention (`FooTest.java`, `foo_test.go`, `foo.spec.ts`, `test_foo.py`, …).

## When the analysis does not finish

Cycle detection and levelization are both superlinear in the size of the graph, and levelization runs
twice — once per projection. On a repository where they do not finish, `--omit-graph-analysis` emits the
dependencies and their weights alone, leaving every edge unflagged and the lens without levels.

`--file-timeout` bounds a single file's parse. The parse itself is a blocking native call, so the
timeout abandons *waiting* for it: the file is skipped while the parse runs to completion in the background.
The skipped file is reported like any other
[file the parser cannot analyse](/docs/analysis/codecharta-shell#files-a-parser-cannot-analyse), with the timeout as
its cause.

## Known issues

**Usage kinds are only reported for PHP and partly for Java, Kotlin and C#.** The `usage` list on a leaf edge can name seven
kinds, but every language except PHP — which runs its own queries — reports only `usage`, apart from `inheritance`
and `implementation` in Java, Kotlin and C#. The underlying extraction
(`TreeSitterExcavationSite`) does separate used types by the position they appear in, but flattens that
away in the type it hands back, so the distinction is lost before this parser sees it. DependaCharta has
the same gap.

## Examples

Include the tests, and give up on any file that takes more than ten seconds:

```bash
ccsh dependencyparser foo/bar/project --include-tests --file-timeout=10 -o out.cc.json
```

If a project is piped into the DependencyParser, the results and the piped project are merged:

```bash
ccsh unifiedparser foo/bar/project | ccsh dependencyparser foo/bar/project - -o out.cc.json
```

## Related

- [Dependency view](/docs/visualization/user-controls/dependency-view)
- [Quality gate](/docs/analysis/quality-gate): fail a build on cycles and upward dependencies
- [DependaCharta Importer](/docs/importer/dependacharta)
