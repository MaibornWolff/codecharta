# Name resolution: Rust

Follows the Rust Reference, chapters "Crates and source files", "Modules" (with the `path` attribute), "Paths", "Use
declarations", "Names" (scopes, namespaces, preludes), "Implementations", "Macros by example" (textual and path-based
scope) and "Conditional compilation", and the Cargo book on targets and package names; every rule was checked with
rustc 1.99. Rust resolves every name at compile time from the module tree of its crate, so the parser can follow the
compiler exactly, except where only type inference or macro expansion would tell. The rules shared by every language
are in [README.md](README.md).

## Crates

- A Cargo package is a folder with a `Cargo.toml` that has a `[package]` table. Its crate roots are the targets Cargo
  finds: `src/lib.rs` (the library), `src/main.rs` and `src/bin/*.rs` or `src/bin/*/main.rs` (binaries),
  `tests/*.rs`, `examples/*.rs`, `benches/*.rs`, and the `path` of a `[lib]`, `[[bin]]`, `[[test]]`, `[[example]]`
  or `[[bench]]` table.
- A crate's name (decision 1): for the library `[lib] name`, else `[package] name` with `-` written `_`; for
  `src/main.rs` the package name too; for any other target its `name` or its file name (`tests/creature_test.rs` is
  `creature_test`).
- Without a `Cargo.toml` above it, a `lib.rs` or `main.rs` directly in a folder `src` is a crate root whose name is the
  folder that holds `src`, as before.
- The edition is the package's `edition` (also through `edition.workspace = true`), 2015 where it is missing, as
  Cargo; a crate without a `Cargo.toml` is read as 2021.

## Modules

- The module tree is the one the compiler builds (decision 2): from each crate root, `mod m;` loads `m.rs` or
  `m/mod.rs` in the folder of the declaring module, which is the folder of a crate root or `mod.rs`, and the folder
  `a/` for a file `a.rs`. Inside an inline `mod x { mod m; }` the folder gets `x/` appended. `#[path = "p"] mod m;`
  loads `p` relative to the folder of the declaring file, or inside an inline module relative to the folder the
  inline module stands for.
- A file's module path is the crate name plus the module names on the way: `src/domain/model/creature.rs`, reached by
  `mod domain;`, `mod model;`, `mod creature;`, is `cellars_and_centaurs::domain::model::creature`. An inline
  `mod tests { … }` adds `tests` for what it holds.
- A file that two crate roots reach (`mod model;` in `lib.rs` and in `main.rs`) belongs to the first of: the library,
  the binaries, tests, examples, benches (decision 12).
- A file that no `mod` reaches, which the compiler does not compile, keeps the path from the file system: the crate
  name, the folders below `src`, and the file name without `.rs` unless it is `mod.rs`, `lib.rs` or `main.rs`.
- Test code (decision 6): an item with `#[cfg(test)]`, as the usual `#[cfg(test)] mod tests { … }`, and the module a
  `#[cfg(test)] mod m;` loads count only in a run with tests; otherwise they declare nothing and use nothing. A run
  counts as one with tests when it analyses a Rust file in a test folder (`tests/`, `test/`, as the scanner tells test
  files), since only the scanner knows `--include-tests`.

## Declarations

- A struct, enum, union, trait, type alias, function, const, static and `macro_rules!` macro is a declaration, and so
  is a function or static of an `extern` block. Its logical path is its module path plus its name:
  `cellars_and_centaurs.domain.model.creature.Creature`.
- No declarations of their own: modules, which are the namespace; enum variants, fields, and the methods, associated
  types and constants of an `impl` or `trait`, which belong to their type (decision 11); an item inside a function
  body or block, which no other declaration can name (decision 8): its names are uses of the declaration around it.
- A `use` with a visibility (`pub use`, `pub(crate) use`, `pub(super) use`, `pub(in …) use`) is a re-export: a
  declaration of the kind re-export at its module path plus the name it binds, which uses what it names (decision 7).
  A glob re-export `pub use m::*;` makes one such declaration per name `m` offers that the module does not bind itself.
  A `use` without a visibility declares nothing, nor does a re-export of a module (`pub use self::creature;`): a path
  through it walks on into the module.
- An `impl` block (decision 3): in the file that declares its type, its uses are uses of the type. In any other file
  it is the implementation part of the type: a leaf with the type's path in that file, whose uses are the uses of the
  impl, and which uses the type. An `impl` of a project trait for a type the project does not declare
  (`impl Fightable for Vec<Creature>`, `impl<T: Identified> Fightable for T`) is an implementation part of the trait
  (decision 14).
- The uses of a declaration are the names the compiler resolves in it (decision 4): every type, in the signature and
  in the body; paths in expressions and patterns (`Creature::new()`, `SpeedType::Walking`, `Den { depth: 3 }`); calls
  of functions, reads of constants and statics; macro invocations. A name inside a nested declaration is that one's.

## A simple name `N`

A name lives in one of three namespaces: types (struct, enum, union, trait, type alias, module, crate), values
(function, const, static, the constructor of a tuple or unit struct) and macros. A type position looks `N` up among
types, an expression or a pattern among values, `N!(…)` among macros. In its namespace, `N` means the first of:

1. A generic parameter or `Self` of the enclosing item, a local variable (parameter, `let`, closure parameter, a
   name a pattern binds), or an item or `use` declared in an enclosing block, innermost first. A local name and a
   block item are no target: no edge. `Self` in an `impl` means its type.
2. An item of the current module, or a name a `use` of the current module binds. The current module is the file's
   module or the inline `mod` the name stands in; a parent module's names do not count (Rust has no "same package").
3. A name a glob import of the current module (`use a::*;`) binds: every name `a` offers that is visible to the
   current module. Two globs that offer `N` from different declarations make it ambiguous: no edge.
4. A crate name: a crate of the analysed project by its name, even one a library crate shares such as `core`
   (decision 9), a name `extern crate x as y;` binds, a dependency `y = { package = "x" }` of `Cargo.toml`. Any other
   crate (`std`, `core`, `alloc`, `uuid`): no edge.
5. The standard prelude (`Vec`, `Option`, `String`, `Box`, `Result`, `Some`, `Ok`, `Clone`, …) and the primitive types
   (`i32`, `str`, `bool`): no edge. They come last, so a project `Result` that the module declares or imports wins.

An identifier pattern that starts with a lower-case letter or `_` binds a new local name, any other is a path
(`match x { MAX => … }`), by Rust's naming conventions. The compiler decides by what steps 1 to 3 find (a const, a
static, a unit struct or variant makes it a path); the two differ only for code that silences the naming lints.

## A path `a::b::C`

- The first segment: `crate` is the root module of the own crate, `self` the current module, `super` its parent
  (`super::super` the grandparent), `$crate` in a macro the root of the macro's crate, `::x` the crate `x` (in
  edition 2015 the own crate root). Otherwise the first segment is looked up as a simple name among types: a module,
  a crate, a type or a trait.
- Each further segment is looked up in what the path so far names. In a module: its items, its `use` bindings and its
  glob imports, as for a simple name in that module. In a type or trait: an enum variant or an associated item, so the
  path means the type (`SpeedType::Walking`, `Creature::new`, `<Creature as Fightable>::attack` are uses of
  `SpeedType`, `Creature`, and `Creature` and `Fightable`).
- A path through a re-export means the re-export declaration, which uses what it names (decision 7):
  `model::Creature` with `pub use creature::Creature;` in `model/mod.rs` means `….model.Creature`, the re-export, not
  `….model.creature.Creature`. Written inside the re-exporting module or below it (`crate::model::Creature` in
  `model/arena.rs` or in `model/creature.rs` itself), it means what the re-export names (decision 16). A path through a
  `use` without a visibility (`super::Helper` where the parent imports `Helper`) means what that `use` names.
- In a `use` declaration the path is resolved the same way (edition 2018 and later); in edition 2015 a `use` path
  starts at the crate root.
- The path means the project declaration of exactly the path found, or none: `std::collections::HashMap` or
  `uuid::Uuid` draws no edge.

## Macros

- `m!(…)` means, first, the `macro_rules! m` that is in textual scope where it stands: one defined before it in the
  same file, in its module or an enclosing one, or before the `mod` declaration that leads to the file in an ancestor
  module; `#[macro_use]` on a `mod` keeps that module's macros in scope after it. Then, as a path in the macro
  namespace: a `macro_rules!` with `#[macro_export]` is an item of its crate's root module (`crate::m!`, `other::m!`),
  and `pub(crate) use m;` makes it an item of the module that writes it. Library macros (`vec!`, `println!`) draw no
  edge.
- The arguments of a macro invocation are read as the expressions they almost always are (decision 5): `A::b` and a
  plain name are paths looked up as in code, a name after `.` is a field or method, a name a local variable binds
  hides the item.
- The body of a `macro_rules!` draws no edge: its names are resolved where it expands.

## Which file

A path that several files declare means the nearest copy (shared rule 2), a declaration before an implementation part
of its path. A library and a binary of one package both have the crate name, so an item that `lib.rs` and `main.rs`
both declare is two copies of one path, and both `crate::Config` and `cellars_and_centaurs::Config` in `main.rs` mean
the nearest (decision 15). Two `#[cfg]` variants of one item in one file are one declaration.

## Probes

Each rule is tested by a probe under `sample-projects/regression/rust/`; every probe compiles with rustc 1.99, which
confirmed the meaning of each name. "Gap" means the parser does not follow the rule yet;
`sample-projects/regression/rust/known-gaps.md` says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |
| Crates, decision 1: the name from Cargo.toml | `spec-crate-name` | ok |
| Crates, decision 1: `[lib] name` | `spec-lib-name` | ok |
| Crates: a crate root without Cargo.toml | `spec-no-cargo` | ok |
| Crates, decision 15: a library and a binary declare one path | `spec-binary-copy` | gap |
| Modules, decision 2: `m.rs` and `m/mod.rs` | `spec-module-files` | ok |
| Modules, decision 2: `#[path]` | `spec-path-attribute` | ok |
| Modules: `mod m;` inside an inline module | `spec-module-in-inline-module` | ok |
| Modules: an inline module | `spec-inline-module` | ok |
| Modules, decision 2: a file no `mod` reaches | `spec-unreached-file` | ok |
| Modules, decision 12: a file two crate roots load | `spec-two-crate-roots` | ok |
| Modules, decision 6: `#[cfg(test)]` with --include-tests | `spec-cfg-test` | ok |
| Declarations, decision 4: a function | `spec-function` | ok |
| Declarations, decision 4: a const and a static | `spec-const-static` | ok |
| Declarations: a type alias | `spec-type-alias` | ok |
| Declarations, decision 3: an `impl` in the type's file | `spec-impl-same-file` | ok |
| Declarations, decision 3: an implementation part | `spec-impl-part` | ok |
| Declarations, decision 14: an `impl` for a library type | `spec-impl-trait-for-foreign-type` | ok |
| Declarations, decision 4: types in a body | `spec-body-types` | ok |
| Declarations, decision 4: a struct literal and pattern | `spec-struct-literal` | ok |
| Declarations, decision 8: an item in a body | `spec-local-item` | ok |
| Declarations, decision 7: a re-export | `spec-reexport` | ok |
| Declarations, decision 7: a glob re-export | `spec-reexport-glob` | ok |
| Declarations, decision 7: `pub(crate) use` | `spec-reexport-crate-visible` | ok |
| Declarations, decision 7: a chain of re-exports | `spec-reexport-chain` | ok |
| A path, decision 16: a re-export used inside its module | `spec-reexport-inside-module` | ok |
| Use declarations: an alias | `spec-use-alias` | ok |
| Use declarations: a group with `self` | `spec-use-group-self` | ok |
| Use declarations: an unused import, `as _` | `spec-unused-use` | ok |
| Simple name 1: a generic parameter | `spec-generic-parameter` | ok |
| Simple name 1: a local variable | `spec-local-variable` | ok |
| Simple name 1: a `use` in a block | `spec-use-in-block` | ok |
| Simple name 2: an item of the current module | `spec-own-module-item` | ok |
| Simple name 2 and 3: an explicit `use` over a glob | `spec-explicit-over-glob` | ok |
| Simple name 2 and 3: an own item over a glob | `spec-item-over-glob` | ok |
| Simple name 3: a glob import | `spec-glob` | ok |
| Simple name 3: a name two globs offer | `spec-glob-ambiguous` | ok |
| Simple name 3: a glob binds only visible names | `spec-glob-private` | ok |
| Simple name 3 and 5: a glob over the prelude | `spec-glob-over-prelude` | ok |
| Simple name 4: a workspace crate | `spec-workspace` | ok |
| Simple name 4, decision 9: a crate that is no dependency | `spec-crate-not-dependency` | ok |
| Simple name 4: a renamed dependency | `spec-dependency-rename` | ok |
| Simple name 4: `extern crate x as y` | `spec-extern-crate-alias` | ok |
| Simple name 5: the prelude | `spec-prelude` | ok |
| Simple name: an identifier pattern | `spec-identifier-pattern` | ok |
| Paths: `crate`, `self`, `super` | `spec-crate-self-super` | ok |
| Paths: `::x` | `spec-leading-colons` | ok |
| Paths, decision 13: edition 2015 | `spec-edition-2015` | ok |
| Paths: a module a `use` binds | `spec-module-through-import` | ok |
| Paths: a qualified path next to an import | `spec-qualified-beats-import` | ok |
| Paths, decision 11: an enum variant | `spec-enum-variant` | ok |
| Paths, decision 11: an associated function | `spec-associated-function` | ok |
| Paths: a trait method by path, `<T as Trait>` | `spec-trait-path` | ok |
| Paths: through a `use` without visibility | `spec-private-use-through-super` | ok |
| Paths: a library path | `spec-library-crate` | ok |
| Decision 10: a method call on a value | `spec-method-call` | ok |
| Macros: textual scope | `spec-macro-textual` | ok |
| Macros: `#[macro_export]` | `spec-macro-export` | ok |
| Macros: `pub(crate) use m;` | `spec-macro-use` | ok |
| Macros, decision 5: the arguments | `spec-macro-arguments` | ok |
| Macros: a `macro_rules!` body | `spec-macro-body` | ok |
| Shared rule 1, name scope | `spec-name-scope` | ok |
| Shared rule 2, copies | `spec-copies` | ok |
| Shared rule 4, self | `spec-self` | ok |

## Not supported

- A method call or field access on a value (`creature.attack()`, `self.speed`): which type it belongs to needs type
  inference (decision 10). A trait method called by path (`Fightable::attack(&c)`) is a use of the trait.
- Names in a `macro_rules!` body, procedural macros and derives (`#[derive(Serialize)]`), and code that macros or a
  build script generate (`include!`, `OUT_DIR`).
- An item that `lib.rs` and `main.rs` of one package both declare: a use means the nearest copy, not the one of the
  crate it resolved in (decision 15).
- `--include-tests` over Rust code without a test folder: `#[cfg(test)]` code is left out, as the run cannot tell it
  includes tests (decision 6).
- `#[cfg]` conditions other than `test`: every variant counts. Cargo features, `[patch]` and whether a crate is a
  declared dependency are not read (decision 9).
- Names in strings and doc comments (intra-doc links ``[`Creature`]``).

## Decisions

1. The logical path starts with the crate name from `Cargo.toml` (`[lib] name`, else `[package] name` with `-`
   written `_`), as the compiler and the code name it; without a `Cargo.toml` with the folder that holds `src`
   (decided 2026-10-26).
2. A file's module path follows the `mod` declarations from the crate roots, `#[path]` included, as the compiler
   loads them; a file no `mod` reaches keeps the path from the file system (decided 2026-10-26).
3. An `impl` block in another file than its type is an implementation part, as a C++ member function defined outside
   its class's file (cpp.md decision 3); in the type's own file it belongs to the type (decided 2026-10-26).
4. A use is every name the compiler resolves, in signatures and bodies, including function calls, constant reads and
   macro invocations, as PHP decision 4 and Go (decided 2026-10-26).
5. The arguments of a macro invocation are read as expressions, since the parser does not expand macros and the
   standard macros take expressions (decided 2026-10-26).
6. Items with `#[cfg(test)]` count only with `--include-tests`, as test files (decided 2026-10-26); the parser takes a
   run that analyses a Rust file in a test folder as one with tests, rather than passing the flag to every analyzer
   (Christian, 2026-10-27).
7. A `use` with a visibility is a re-export declaration that uses what it re-exports, and a path through it means it,
   as a TypeScript re-export and a Python package's `__init__.py` (typescript.md decision 8, python.md decision 2); a
   glob re-export makes one per name, as `export *` (derived 2026-10-26, confirmed by Christian on 2026-10-27 after the
   prototype showed the sample's barrels as hubs).
8. An item inside a function body or block is no target, as in Java, Go and C++ (cpp.md decision 9, derived
   2026-10-26).
9. A crate name means the project crate of that name whether or not `Cargo.toml` lists it as a dependency, as a bare
   specifier means the workspace package (typescript.md decision 5, derived 2026-10-26).
10. A method call or field access on a value draws no edge, as in Go (go.md decision 5, derived 2026-10-26).
11. Enum variants, methods and associated items belong to their type, and a path to one is a use of the type, as
    `SpeedType::WALKING` in C++ and PHP (derived 2026-10-26).
12. A file that several crate roots reach belongs to the first in the order library, binaries, tests, examples,
    benches (derived 2026-10-26).
13. A crate without a `Cargo.toml` is read as edition 2021, the edition of the code around it today; one with a
    `Cargo.toml` that names none as 2015, as Cargo does (derived 2026-10-26).
14. An `impl` of a project trait for a type the project does not declare is an implementation part of the trait, by
    decision 3 (derived 2026-10-26).
15. A path that two crates of one package declare means the nearest copy, as anywhere else: which crate a use resolved
    in does not reach the step that picks the copy, and only items written in both crate roots collide (Christian
    chose this on 2026-10-27 over a shared change, replacing the derived rule of the copy of the crate).
16. Inside the re-exporting module or below it, a path through a re-export means what it names, so neither a sibling
    (`crate::engine::EngineState` in `engine/stack.rs`) nor the declaration itself goes through `mod.rs`: a Rust `use`
    only resolves names and a module has no load order, so the cycle with `mod.rs` would be none the code has. Python
    and TypeScript keep the barrel, as importing their package runs it (Christian, 2026-10-27, replacing the cycle
    decided earlier that day after the edge check counted 134 such edges in nushell).
