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
  `instantiation`, `argument`, `return_value`, `constant_access`, `friend` for the class a C++ `friend` declaration
  names, and `part_of` from a part that implements a
  declaration in another file (C++, Rust, SQL) to that declaration. A pair carries one kind, the first the
  extractor found, as in DependaCharta. PHP reports every kind; Java, Kotlin and C# report `inheritance`
  and `implementation`, C++ `inheritance`; see [known issues](#known-issues).
- A name declared in several files — a C# partial class, a Go function name reused within a package, two projects
  with the same package — is one leaf per file, with the same key and, where it has one, the same `namespace`. Each
  copy's dependencies leave the file they are written in, while a dependency *on* the name points at the file that
  shares the longest folder path with the file using it, and among equally near files at the first as the scan
  lists them (path order); for SQL at the declaration before an implementation part, then at the latest migration, and
  for C# at every file of the nearest project (the
  folder of a `.csproj`) that declares it, the parts of a partial class; for Go at every file of the package that
  declares it, its build-tag variants; for C and C++ at the copy the include closure of the using file holds, else
  the nearest. A Kotlin `private` top-level copy, a C# `file` type, a C++ or SQL implementation part and a routine only
  an Oracle package body declares count only for the file they are written in.
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

An Angular template (`.html`) depends on each component and directive whose selector matches one of its elements, as
the Angular compiler matches them by tag, attribute and value, property, two-way and event binding, class and, for a
structural directive such as `*ngFor`, its `ng-template` element, and on each pipe it names, as the `@Component`,
`@Directive` and `@Pipe` decorators in the TypeScript files declare them. A selector or pipe name that several classes
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

Go finds an imported package through the `go.mod` files of the analysed folder: the path on a `module` line stands for
the folder of its `go.mod`, a module's `vendor/` folder holds the packages it vendors, and a file under no `go.mod`
finds the folder its import path ends with in at least two segments. A name written through an import, such as
`model.Creature`, means the declaration of that package; a method called on a variable draws no edge, as the parser
does not infer the variable's type.

Python finds an imported module where the interpreter would: below the analysed folder, the folder above each
top-level package (a folder with `__init__.py`, such as `src/`) and the folder of the importing file, the nearest to the
importing file first; a module path none of them holds finds the module it ends with in at least two segments. A name
means what Python binds it to where it is used: a declaration of the own module, an import, also one inside a function
or one in each branch of `try` and `except ImportError`, or a name a wildcard import brings in, as the module's
`__all__` lists it. A class nested in a class is a leaf of its own; a parameter, a local variable, a builtin or a
method called on a variable draws no edge.

C and C++ resolve a name as the compiler does: a file sees only what it declares and what its `#include`s bring in,
directly or through other headers. `#include "p"` means the file `p` beside the including file, else, as for
`#include <p>`, the project file whose path ends with `p`, the nearest to the including file; a header without an
extension or an `.inc` fragment is followed too, and a system header such as `<vector>` declares nothing of the
project. A name is looked up in its class and the class's base classes, then in the enclosing namespaces outwards,
with `using` declarations, `using namespace` directives and namespace aliases where they apply, and `::Name` in the
global namespace; a template parameter or a class declared in a function hides a class of the same name. A forward
declaration such as `struct Creature;` means the class wherever its body is, and `Type::member` is a use of `Type`. A
type alias (`using` or `typedef`) is a leaf of its own, a struct named only by its `typedef` takes that name, and the
member functions a source file defines for the class of a header form a leaf of that file that depends on the header.
A declaration outside every namespace has its name as logical path, so two programs in one folder that both define
`struct Creature` are told apart by their includes. The build's include directories (`-I`, CMake,
`compile_commands.json`) are not read, and macros are not expanded.

PHP resolves a name as the compiler does, from the text of its file: through the `use` declarations of the namespace
block it stands in, aliases and groups included, else in the current namespace; `\A\B` is taken as written and
`namespace\A` below the current namespace. A class name never falls back to the global namespace, while a function
call or a constant does where the current namespace declares none. A class counts wherever the compiler resolves one:
any type, `extends`, `implements`, `new`, `X::member`, `catch`, `instanceof`, an attribute and a trait; function calls
and constant reads count too, and a name matches only in its declared case. The code at the top level of a file is a
leaf `<file>_script`, which an `include` or `require` of the file uses, its path taken relative to the including file;
a computed path draws nothing, and neither `composer.json` nor docblock types are read.

Rust resolves a name as the compiler does, through the module tree of its crate. A crate is named by its `Cargo.toml`
(`my-game` is `my_game`), and a file's module is where the `mod` declarations from `lib.rs`, `main.rs`, `tests/` and the
other crate roots put it, `#[path]` included; a file no `mod` reaches keeps the path of its folders. A name means an
item of its module, what a `use` of the module binds, what a glob import brings in (a name two globs offer means
nothing), another crate of the project by its name, or nothing for the prelude and libraries such as `std`; `crate::`,
`self::` and `super::` start where Rust starts them. A `pub use` is a leaf of its own that the code importing through
it points at, an `impl` block in another file than its type a leaf of that file, and a path into a type or enum, such
as `Creature::new()` or `SpeedType::Walking`, is a use of the type. Function bodies, calls, constants and macros count,
the arguments of a macro read as the expressions they almost always are; a method called on a variable draws no edge.
Code under `#[cfg(test)]` counts only in a run that analyses a Rust file in a test folder, so with `--include-tests`.

Delphi resolves a name as the compiler does, through the units of the analysed folder by their unit name, wherever the
file lies. A name means a local declaration, a parameter or `Result` first, then a member of its class, of the class's
ancestors in the project and of the classes around it, then a declaration of the own unit, then of the units of the
`uses` clauses, the last listed first; the implementation section sees its own `uses` before those of the interface,
and another unit only offers what its interface declares. `Unit.Name` means the declaration of the unit the longest
prefix names, and `[Table]` means `TableAttribute` before `Table`. Every type, free routine, constant and variable is a
leaf, a member type below its outer type, while an enum value, a field or a method is a use of its type; a program's
main block and a unit's `initialization` and `finalization` are a leaf `<unit>_script`. A name matches only in the case
of its declaration, as written in the `uses` entry too; library units such as `System.SysUtils`, unit scope names from
the `.dproj`, include files and members of a value or a `with` draw no edge.

TypeScript and JavaScript find an imported module where the compiler would: a relative path from the importing file,
or a bare specifier through the `paths` and `baseUrl` of the nearest `tsconfig.json` or `jsconfig.json`, a bundler
alias, a Module Federation remote, a workspace package of that `package.json` name or a `declare module` block; each
with the endings TypeScript tries, a `.js` specifier finding the `.ts` file, and a folder by its `package.json` or its
`index` file. A name means what the module binds it to: a declaration of the own module or of a namespace around it,
an import of any form (named, renamed, default, namespace, `require`, `import x = require`, `import()` and an import
type `import('./m').A`), or a global declaration of a script file or of `declare global`. A re-export such as
`export { A } from` or `export *` is a leaf of the barrel that points on at what it re-exports. Every top-level
declaration is a leaf, exported or not, and so is each member a namespace exports and the code at the top level of a
file (`main_script`), which a side-effect import uses. A parameter, a local variable, a name from a library or a
method called on a variable draws no edge.

A Vue component is named after its file and uses what its scripts use, what its template expressions read from
`<script setup>`, and the component each tag names, looked up as Vue does: a binding of `<script setup>`, the
`components` option, a global `app.component` registration, else the one component of the project of that name.

SQL has no imports: the SQL files of the analysed folder are read as one database, and every object is found by its
name, whatever file creates it and in whatever dialect. Tables, views, synonyms, sequences, types, domains, routines,
triggers and packages are leaves at their schema plus their name (`sales.orders`), or their name alone when created
without a schema; `SET search_path` and `ALTER SESSION SET CURRENT_SCHEMA` give the objects after them their schema.
A name without a schema means a variable, a common table expression, a temporary table or a trigger's rows first,
then, inside an Oracle package, a member of the package, then the object of the same schema, then one created without
a schema, then the one object of that name in any other schema (several draw no edge). A name with a schema
(`dbo.orders`) finds the object of that schema, or else one created without a schema; `pricing.total` a member of the
package `pricing`. The place of a name tells which kind of object it means: `FROM audit` a table or view, `audit()`
a routine, the type of a column a type, a domain or a table's row type, `NEXTVAL` a sequence. What a package
specification declares are leaves below the package; the routines of the package body, an object type body and an
`ALTER TABLE`, `CREATE INDEX` or `COMMENT ON` of a table another file creates are leaves of their own file that point
at what they implement or change. Names compare without regard to case, like the database does with unquoted names
and with names in brackets or backticks; a name in double quotes keeps its case (`"Orders"` is not `orders`), unless
it is written all in one case (`"orders"`, `"ORDERS"`), which is how PostgreSQL and Oracle store an unquoted name. An
object created in several files, such as a view that migrations recreate, is one leaf per file, and a use points at
the last of these files, the latest migration: paths are ordered folder by folder and name by name, with the numbers
in them compared as numbers, so `V10__orders.sql` comes after `V9__orders.sql`, and a later folder wins over an
earlier one whatever the file names. Flyway's repeatable migrations (`R__views.sql`) come after the versioned ones of
their folder, as Flyway runs them last. Statements in strings, `USE` and `DROP` are not read.

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

**Usage kinds are only reported for PHP and partly for Java, Kotlin, C# and C++.** The `usage` list on a leaf edge can
name seven kinds, but every language except PHP — which runs its own queries — reports only `usage`, apart from
`inheritance` and `implementation` in Java, Kotlin and C# and `inheritance` in C++. The underlying extraction
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
