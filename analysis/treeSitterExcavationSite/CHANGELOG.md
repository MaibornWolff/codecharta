# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Rust code-metrics support (`TreeSitterMetrics.parse(code, Language.RUST)`): complexity (`if`/`while`/`for`/`loop`/`match` arms incl. the `_` wildcard, plus `&&`/`||`), function counts (free fns, impl methods, trait default methods, and bodyless trait signatures; closures add complexity but are not counted as functions), comment lines, parameters (the `self` receiver is excluded), per-function aggregations, and message chains. The `?` operator, match guards, and plain `else` are intentionally not counted, matching the other languages. Rust metrics are now `Stable`.
- Rust dependency analysis support (`TreeSitterDependencies.analyze(code, Language.RUST)`): module/use imports (flattened use-trees incl. globs, aliases, verbatim `crate`/`self`/`super`), declarations (struct/union/enum/trait/type-alias/fn/const/static/macro), per-declaration inline-`mod` `parentPath` (Class-2 namespace model), `impl` folding onto the target type, and signature-level used types with nested generics and qualified-type `namespacePrefix`. `packagePath` is intentionally empty — a `.rs` file's crate-root module path is filesystem-derived and resolved by the consumer (DependaCharta).
- `ImportKind.REEXPORT` — Rust `pub use module::Type` re-exports are tagged so consumers can model the crate's public-API flattening as a forwarding/alias edge (`pub use` previously emitted as a plain `STANDARD` import).
- Rust language support for text extraction (identifiers, comments, and string literals) as the 19th supported language, via the `tree-sitter-rust` grammar.

### Fixed

- Comment-line counting no longer over-counts comments whose AST node includes the trailing newline (its exclusive end point lands at column 0 of the next row, e.g. tree-sitter-rust `///`/`//!` doc comments). The following row is no longer miscounted as a comment line. Verified to leave every existing language's metric golden unchanged.
- JavaScript extraction no longer crashes with `TSException: Node is a null node` when a `method_definition`'s decorator look-behind walk reaches the start of its parent (the `prevSibling` sentinel is now guarded before its type is read).

## [0.9.1] - 2026-06-01

### Added

- `ImportDeclaration.bindingName` to track the local alias for default, wildcard (`* as ns`), and aliased named imports
- CJS destructured `require()` alias resolution: bound names from `const { A, B } = require(...)` are now resolved as usedTypes
- Decorator identifier extraction: decorator names on export declarations are now emitted as usedTypes

### Fixed

- TypeScript/JavaScript: namespace alias member and constructor class names (`ns.Foo`, `new ns.Foo()`) are now extracted as usedTypes
- TypeScript/JavaScript: `as`-expression and `satisfies`-expression types now captured as usedTypes
- TypeScript/JavaScript: generic type arguments now captured as usedTypes
- TypeScript/JavaScript: declare-then-export and `export default <identifier>` patterns handled correctly
- TypeScript: interface `extends` clause types, type alias RHS types, generic type constraints, and `namespace` declarations

## [0.9.0] - 2026-05-11

### Added

- TypeScript and JavaScript dependency analysis including package path, imports, declarations, and used types

## [0.8.0] - 2026-05-04

### Added

- C++ dependency analysis including namespace path, `#include`/`using` directives, declarations, and used types (11 categories)
- `UsedType.namespacePrefix` and `ImportDeclaration.kind` (with `ImportKind` enum) on the public dependency model to support C++ qualified inline references
  and the `#include`/`using` distinction; source- and binary-compatible for non-C++ callers

## [0.7.0] - 2026-04-28

### Added

- Delphi (`.pas`, `.dpr`) language support for metrics, extraction, and dependency analysis. Based on the `tree-sitter-pascal`
  grammar (v0.10.2); covers classes, interfaces, records, enums, helpers, and procedure / function implementations. Pascal's three
  comment styles (`//`, `{ }`, `(* *)`) and single-quoted string literals are handled via custom extractors.

### Changed

- Reorder Delphi used-type concatenation to match Kotlin's category sequence (inheritance → data → callable → annotations → calls).

### Fixed

- PackageExtractor now recovers the unit/program/library name from tree-sitter-pascal parse-error wrapping, so files containing
  unsupported asm/IFDEF combinations no longer produce declarations with an empty package path.

## [0.6.0] - 2026-04-17

### Added
- C# dependency analysis including namespace extraction, using directives with namespace scoping, declarations, and used types (11
  categories)
- Using directives inside nested namespaces or wrapped in preprocessor directives are now extracted with their full aggregated
  namespace path (improvement over DC legacy, which only scans immediate children of the compilation unit and namespace bodies and
  therefore misses these)

## [0.5.0] - 2026-03-31

### Added

- Kotlin dependency analysis including package path, imports, declarations, and used types

## [0.4.1] - 2026-03-26

### Fixed

- Fixed tree-sitter-tsx packaging in build artifact

## [0.4.0] - 2026-03-23

### Added

- Dependencies API: `TreeSitterDependencies.analyze(code, language) -> DependencyResult`
- Java dependency analysis including package path, imports, declarations, and used types
- TSX language support with JSX element and attribute extraction

## [0.3.1] - 2026-01-30

### Added

- ABL support for `.i` include files

## [0.3.0] - 2026-01-29

### Added

- ABL/OpenEdge language support
- Detekt static analysis

## [0.2.0] - 2025-12-18

### Added

- Extraction API: `TreeSitterExtraction.extract(code, language) -> ExtractionResult`

## [0.1.0] - 2025-12-16

### Added

- Initial release
- Metrics API: `TreeSitterMetrics.parse(code, language) -> MetricsResult`
- Support for 14 languages

[unreleased]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.9.1...HEAD

[0.9.1]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.9.0...v0.9.1

[0.9.0]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.8.0...v0.9.0

[0.8.0]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.7.0...v0.8.0

[0.7.0]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.6.0...v0.7.0

[0.6.0]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.5.0...v0.6.0

[0.5.0]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.4.1...v0.5.0

[0.4.1]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.4.0...v0.4.1

[0.4.0]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.3.1...v0.4.0

[0.3.1]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.3.0...v0.3.1

[0.3.0]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.2.0...v0.3.0

[0.2.0]: https://github.com/MaibornWolff/TreeSitterExcavationSite/compare/v0.1.0...v0.2.0

[0.1.0]: https://github.com/MaibornWolff/TreeSitterExcavationSite/releases/tag/v0.1.0
