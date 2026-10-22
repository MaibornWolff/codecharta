# Name resolution: Go

Follows the Go language specification, sections "Declarations and scope", "Qualified identifiers", "Selectors",
"Import declarations" and "Packages", and the Go modules reference for `go.mod` and `vendor`. The rules shared by
every language are in [README.md](README.md).

## Declarations

- A package is the set of files of one folder that share a package clause. A package-level type (struct, interface,
  any other named type, alias) or function has the logical path of its folder below the analysis root plus its name:
  `domain/model/creature.go` declares `domain.model.Creature`. A file directly in the analysis root has its package
  name in place of the folder.
- An external test package (`package store_test` in the folder of `package store`) is a package of its own; its
  logical path is the folder plus its package name: `store.store_test.setup`.
- A method belongs to its receiver type: its uses are the type's uses.
- A type declared inside a function is no target: no other declaration can name it.
- Several files of one package may declare the same name when build constraints keep them apart (`open_linux.go`,
  `open_windows.go`); a use of that name points at every one of these files.

## Import paths

An import path means the first of these folders that exists:

1. The folder of the module whose path the import path starts with, in whole segments, followed by the rest of the
   import path. A module is the folder of a `go.mod` in the analysed folder, and its path is the one on the `module`
   line; the longest matching module path wins. With `module example.com/shop` in `src/go.mod`,
   `example.com/shop/domain/model` means `src/domain/model` and `example.com/shopx/domain` does not match.
2. For a file of a module, `vendor/` plus the import path below that module's folder.
3. For a file under no `go.mod`, the folder whose path below the analysis root the import path ends with, in whole
   segments and at least two of them: `example.com/shop/domain/model` means `domain/model`, and
   `example.com/shop/util` alone means no folder `util`. The longest ending wins, and of equally long ones the first
   folder in path order.
4. None: a library package, such as `fmt`, `github.com/google/uuid` or the cgo pseudo-package `C`. A name through it
   draws no edge.

An import binds a name in its file: the alias of `import m "path"`, else the name in the package clause of the
imported package, which need not be the last segment of its path (`mismatch-dir` can declare `package mismatched`,
`lib/v2` declares `package lib`). `import _ "path"` binds no name; `import . "path"` is a dot import, see rule 3.

## A simple name `N`

Looked up in this order; the first match wins:

1. A type parameter, parameter, result, variable, constant or type `N` declared in the enclosing function: no edge.
2. A declaration `N` of the own package, in any file of the package.
3. An exported declaration `N` of a package the file dot-imports. Two dot-imported packages that both declare `N` make
   the name ambiguous: no edge.
4. A predeclared identifier (`error`, `any`, `int`, `len`, `make`, …): no edge.

A declaration of the own package and a dot-imported one of the same name, or two dot-imported ones, do not compile;
the order settles such code.

## A selector `p.N`

- If `p` is a name an import of the file binds and no declaration in the enclosing function hides it, `p.N` is the
  declaration `N` of that package: `model.Creature`, `model.NewDice()`, `m2.User`. The package itself is no
  dependency.
- Otherwise `p` is a value (a variable, parameter, receiver, field or call result), and `p.N` is a field or method of
  its type, which the parser does not infer: no edge. The same holds for longer chains such as `a.b.C()`.

## Probes

Each rule is tested by a probe under `sample-projects/regression/go/`. "Gap" means the parser does not follow the
rule yet; `sample-projects/regression/go/known-gaps.md` says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |
| Declarations: the package folder, several files | `spec-own-package` | ok |
| Declarations: a method belongs to its receiver type | `spec-method-of-receiver` | ok |
| Declarations and 1: a type declared in a function | `spec-local-type` | ok |
| Declarations, decision 3: build-tag variants | `spec-build-tag-variants` | gap |
| Declarations, decision 4: external test package | `spec-external-test-package` | gap |
| Import paths 1: module path of `go.mod` | `spec-module-path` | ok |
| Import paths 1: the longest module path | `spec-longest-module-path` | ok |
| Import paths 1: whole segments only | `spec-module-whole-segments` | ok |
| Import paths 1: another module of the analysed folder | `spec-other-module` | ok |
| Import paths 2: `vendor/` | `spec-vendor` | ok |
| Import paths 3: under no `go.mod`, suffix of two segments | `spec-no-go-mod` | ok |
| Import paths 4: library package | `spec-library-import` | ok |
| Import paths: an alias binds the name | `spec-alias-import` | ok |
| Import paths: the package clause binds the name | `spec-package-clause-name` | ok |
| Import paths: a blank import binds no name | `spec-blank-import` | ok |
| 1. type parameter | `spec-type-parameter` | ok |
| 1. variable of the enclosing function | `spec-local-declaration` | ok |
| 2. own package | `spec-own-package` | ok |
| 3. dot import | `spec-dot-import` | ok |
| 3. two dot imports: ambiguous | `spec-ambiguous-dot-imports` | ok |
| 3. a dot import brings in exported names only | `spec-dot-import-exported-only` | ok |
| 2 and 3: own package over a dot import | `spec-package-beats-dot-import` | ok |
| 4. predeclared identifier | `spec-predeclared` | ok |
| 2 and 4: own package over a predeclared identifier | `spec-package-shadows-predeclared` | ok |
| Selector through an import name | `spec-qualified-through-import` | ok |
| Selector: the import name picks the package | `spec-qualifier-picks-package` | ok |
| Selector: a local declaration hides an import name | `spec-import-hidden-by-local` | ok |
| Selector on a value, decision 5 | `spec-selector-on-value` | ok |
| Shared rule 1, name scope | `spec-name-scope` | ok |
| Shared rule 4, self | `spec-self` | ok |

## Not supported

- `replace` directives and `go.work`: a module is found through its own `go.mod` in the analysed folder only, so a
  `replace` towards a folder whose `go.mod` names another module path is not followed. A `go.mod` above the analysis
  root is not read.
- Build constraints are not evaluated: every file counts, for every platform.
- `internal/` packages and unexported names are visible from every package.
- Package-level variables and constants are no declarations, and a method value (`reroll := dice.Roll`) is no use:
  extraction coverage, recorded in `sample-projects/go/FINDINGS.md`.

## Decisions

1. An import path is mapped through the `go.mod` files and `vendor/` folders of the analysed folder; a file under no
   `go.mod` falls back to the folder the import path ends with (decided 2026-10-22).
2. The logical path is the folder below the analysis root, not the import path, so the namespace view stays
   independent of the module name and two modules stay apart (decided 2026-10-22).
3. A name that build-tag variants of one package declare means every file that declares it (decided 2026-10-22).
4. An external test package is a package of its own, with the logical path folder plus package name (decided
   2026-10-22).
5. A selector on a value draws no edge, also where the method's name matches a type of the project (decided
   2026-10-22).
