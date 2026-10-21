# Dependency Parser

**Category**: Parser (takes in source code and outputs cc.json)

> **Experimental:** the output and options of this parser may still change between releases.

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

- `dependencies` is the edge weight: how many declaration-level dependencies the edge stands for. A
  declaration that uses another counts once, however many times it references it, as in DependaCharta.
- `isCyclic` — the edge takes part in a dependency cycle.
- `isPointingUpwards` — the edge runs against the levelized flow, i.e. its target sits at the same
  level as or above its source. A dependency between a class and a declaration nested in it does so only
  when the two form a cycle, and then only the edge from the nested declaration back to its host.

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
summed weights of the edges leaving and entering that file, i.e. how many declarations it depends on and
how many depend on it.

**The logical layer.** The same analysis a second time, at declaration level — the model DependaCharta
works in. `leaves` are the individual declarations, `namespaces` the packages containing them, and
`leafEdges` the dependencies between declarations:

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

- **`leaves`** groups the declarations under the id of the file node they are declared in, each under a
  key unique within that file: the declaration's name, or its dotted logical path where two declarations
  of one file share a name, in which case `name` is written beside it. A leaf is addressed by file node id
  and key, so it follows its file through every re-pathing filter, and the key is never parsed.
- **`namespace`** is written only where the language has packages apart from its files — Java, Kotlin,
  C#, PHP and C++ — and there only for a declaration that sits in one. Everywhere else the logical
  path is the re-encoded file path, so the leaf carries no `namespace` and no namespace is listed: the
  file tree already is that hierarchy. A nested declaration is a leaf of its own in the package of the
  declaration around it, with only its own uses as dependencies; the schema's `parent` is not written yet.
- **`namespaces`** lists the packages with their level and their `parent`, the package containing them.
  The hierarchy comes from `parent`, never from the dots of a key.
- **`language`** is the language the declaration is written in, lower case: `java`, `kotlin`, `csharp`,
  `cpp`, `go`, `php`, `python`, `typescript`, `javascript`, `vue`, `delphi`, `rust`, `angular` or `sql`.
- **`usage`** names how the source declaration uses the target: `usage`, `inheritance`,
  `implementation`, `instantiation`, `argument`, `return_value`, `constant_access`. A pair carries one
  kind, the first the extractor found, because a used type is identified by its name alone — the same
  rule DependaCharta applies, and why a pair weighs 1 at declaration level unless the source is declared
  more than once in its file, when each declaration that references the target counts once. **Only PHP reports
  every kind today**: its extractor in `TreeSitterExcavationSite` classifies a type by the clause it
  appears in and says so in `UsedType.usage`. Java and Kotlin report `inheritance` and `implementation`,
  which their name resolution needs for inherited member types. The extractors of Java, Kotlin and C# make the other
  distinctions internally — separate `extractInheritanceTypes`, `extractParameterTypes`, `extractReturnTypes`,
  `extractObjectCreationTypes` passes — but do not fill `usage` yet. DependaCharta has the same gap.
- A name declared in several files — a C# partial class, a Go function name reused within a package, two
  projects with the same package — is one leaf per file, with the same key and, where it has one, the same
  `namespace`. Each copy's dependencies leave the file they are written in, in both layers, while a dependency
  *on* the name points at the file that shares the longest folder path with the file using it, and among
  equally near files at the first as the scan lists them (path order); for SQL at the latest migration, and
  for C# at the first file. A Kotlin `private` top-level copy counts only for the file it is written in.
- `kind` is the declaration kind: `class`, `valueclass`, `interface`, `annotation`, `enum`, `function`,
  `variable`, `reexport`, `script` or `unknown`.
- `leafEdges` is a list of its own rather than a widened `Edge`, because `edges` is what the edge-metric
  machinery, `edgefilter` and the 3D map read. Leaving `edges` untouched is what keeps the physical view
  working unchanged.

Both projections ship on every run. The logical one carries the two signals the physical one cannot: a
dependency between two declarations of the *same* file (which disappears when edges fold onto files) and
the kind of use each dependency is. Levels of the two disagree by design where a language's packages and
folders diverge — folder levels are not a projection of namespace levels, so both are levelized
separately.

Size on `visualization/app` (1034 files, 3290 declarations, 7115 declaration edges): 520 KB → 2.0 MB
uncompressed, 83 KB → 207 KB gzipped. Output is gzipped by default, so the cost lands mostly in viewer
memory. `--omit-graph-analysis` skips both levelizations and both cycle passes, leaving both projections
without levels and with every edge unflagged, and the logical one without namespaces, since a namespace
entry needs its level.

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

On the `cpp` sample the *file* edges also differ in name only: DependaCharta labels a merged
header/source pair `Creature.cpp/.h` under the logical package path, while this parser keeps the
physical path of the first file of the pair, `src/.../Creature.cpp`; the pairs themselves are the same.

Beyond the self-edge, the parser deliberately deviates from DependaCharta where the original loses
edges on common project layouts; every item below is a bug in DependaCharta that this port fixes:

- A tsconfig `baseUrl` and `paths` inherited through `extends` are read relative to the config that
  defines them, as TypeScript does; DependaCharta reads them relative to the child. An `extends`
  without `.json` finds its parent, and the longest matching `paths` prefix wins.
- tsconfig and bundler alias targets drop their source extension, so `src/core/index.ts` joins onto
  the node `src.core.index`.
- A wildcard re-export from a file with a dot in its name (`export * from './user.service'`) is
  expanded; DependaCharta probes for `user_service.ts` and gives up.
- A Vue component pairing a plain `<script>` with a `<script setup>` has both blocks analysed.
- An explicit import wins over a same-package type of the same name, as Java's single-type import does.
- Every PHP grouped `use` contributes, not only the first in the file.
- A Module Federation producer is looked up in name order, preferring a federation-name match over a
  directory-name match, so the result does not depend on how the file system lists directories.
- A file that fails to parse or exceeds `--file-timeout` is reported in a warning per cause naming the files;
  a tsconfig or package.json that fails to parse is warned about as well.

## How it works

1. **Extract.** Every source file is parsed with tree-sitter into the declarations it contains and the
   types they use. Imports are resolved through the language's own rules, plus tsconfig/jsconfig path
   aliases, bundler aliases (webpack, vite, vue.config) and Module Federation remotes.
2. **Resolve.** Used types are matched against the declarations the whole project offers, with a
   per-language standard-library filter so `java.util.List` does not become a project dependency. A name is
   matched only against languages that can refer to each other by name (`SupportedLanguage.nameScope`): Java
   with Kotlin, TypeScript with JavaScript, Vue and Angular, C with C++, every other language alone.
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

Java, Kotlin, C#, C/C++, Go, Python, PHP, TypeScript, JavaScript, Vue, Delphi, Rust, Angular templates and SQL.

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

### Files that cannot be analysed

A file whose analysis fails is left out of the map. Once the analysis is over, the parser warns once per cause, with
the number of files it hit and the first five of them; a file that takes longer than `--file-timeout` is such a file,
with the timeout as its cause. It ends with an error and exit code 1, and writes no map, when no file could be analysed
at all, or when a grammar or the native tree-sitter library cannot be used.

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
