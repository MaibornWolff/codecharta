# Dependencies Feature

## Overview

The dependencies feature extracts structural dependency information from source files: package declarations, imports, class/interface/enum declarations, and the types each declaration uses. This data is consumed by DependaCharta (DC) to build dependency graphs, detect cycles, and assign architectural levels.

Java, Kotlin, C#, C++, TypeScript, JavaScript, Go, Python, PHP, Vue, Delphi, Rust, Angular templates, and SQL are implemented.

## Architecture

Follows the vertical slice pattern used by metrics and extraction, but without a port/adapter layer since no transformation is needed between the domain mapping and the collector:

```text
API                          Integration                    Languages
┌──────────────────────┐     ┌────────────────────────┐     ┌──────────────────────────┐
│ TreeSitterDependencies│────>│ DependenciesFacade     │     │ languages/java/          │
│   .analyze()         │     │   ↓                    │     │   JavaDependencyMapping   │
│                      │     │ DependencyCollector     │     │   extractors/            │
│ Validates language   │     │   calls lambdas from   │     │     PackageExtractor      │
│ support, delegates   │     │   LanguageDependency-  │<────│     ImportExtractor       │
│ to facade            │     │   Mapping directly     │     │     DeclarationExtractor  │
└──────────────────────┘     └────────────────────────┘     │     UsedTypeExtractor     │
                                                            └──────────────────────────┘
```

### Data flow

```text
Source code string
  → TreeSitterDependencies.analyze(code, Language.JAVA)
    → DependenciesFacade applies preprocessor, passes mapping to collector
      → DependencyCollector parses with the FFM binding (FfmSyntaxTree.parse)
        → LanguageDependencyMapping lambdas called:
          1. extractPackagePath()  → ["com", "example", "service"]
          2. extractImports()      → [ImportDeclaration(path, isWildcard, namespacePath, kind)]
          3. extractDeclarations() → [Declaration(name, type, usedTypes)]
  → DependencyResult
```

### Key files

| File | Purpose |
|---|---|
| `api/TreeSitterDependencies.kt` | Public API — validates language support, delegates to facade |
| `integration/dependencies/DependenciesFacade.kt` | Entry point — applies preprocessor, passes mapping to collector |
| `integration/dependencies/DependencyCollector.kt` | Parses AST, calls mapping lambdas, assembles result |
| `shared/domain/DependencyMapping.kt` | `LanguageDependencyMapping` data class + `DependencyMapping` wrapper |
| `shared/domain/DependencyResult.kt` | Result types: `DependencyResult`, `Declaration`, `ImportDeclaration`, `UsedType` |

## Domain model

```kotlin
data class DependencyResult(
    val packagePath: List<String>,          // ["com", "example", "service"]
    val imports: List<ImportDeclaration>,
    val declarations: List<Declaration>,
    val embedded: List<EmbeddedDeclarations> = [] // what the embedded sources of declarations declare, see below
)

data class ImportDeclaration(
    val path: List<String>,                 // ["java", "util", "List"]
    val isWildcard: Boolean,                // true for "import java.util.*"
    val namespacePath: List<String> = [],   // namespace scope: [] = global, ["My", "Namespace"] = scoped to that namespace
    val kind: ImportKind = STANDARD         // see "Import kinds"
)

enum class ImportKind {
    STANDARD,  // e.g., Java `import`, Kotlin `import`, C# `using`, C++ `using namespace`/`using X::Y`
    INCLUDE,   // C++ `#include`, PHP `require`/`include` — the adapter resolves the path
    REEXPORT,  // Rust `pub use`
    MEMBER     // Python `from module import name` — the last path segment is the imported name
}

data class Declaration(
    val name: String,                       // "MyService"
    val type: DeclarationType,              // CLASS, INTERFACE, ENUM, RECORD, ANNOTATION, FUNCTION, VARIABLE, REEXPORT, SCRIPT
    val usedTypes: Set<UsedType>,           // types referenced inside this declaration
    val parentPath: List<String> = [],      // namespace/package path: ["com", "example"]
    val angular: AngularDeclaration? = null, // what an Angular decorator declares: templateNames, templateUrl, imports, ...
    val isFileScoped: Boolean = false       // only its own file can name it: Kotlin `private` top level, a C# `file` type
)

data class UsedType(
    val name: String,                       // "List"
    val genericTypes: List<UsedType> = [],  // [UsedType("String")] for List<String>
    val namespacePrefix: List<String> = [], // ["A", "B"] for A::B::Settings; [] for unqualified
    val usage: TypeUsage = USAGE,           // how the declaration uses the type; only PHP tells the ways apart
    val alternativeName: String? = null,    // "ObsoleteAttribute" for the C# attribute [Obsolete]; null elsewhere
    val fallbacks: List<UsedType> = []      // what the use means, in order, when it names nothing; Python only
)
```

### Import kinds

`ImportDeclaration.kind` distinguishes imports that share the same shape but require different downstream handling:

| Kind | Source | Adapter handling |
|---|---|---|
| `STANDARD` (default) | Java `import`, Kotlin `import`, C# `using`, C++ `using namespace` / `using X::Y`, Rust `use` | Consumed as-is — the `path` is already the canonical reference |
| `INCLUDE` | C++ `#include "…"` or `#include <…>`, PHP `require`/`include` (and their `_once` forms) of a single-quoted path directly behind the keyword, not in parentheses | Adapter resolves relative paths (`./`, `../`): for C++ against the file's physical path, rewriting the final segment's `.` → `_` to match DC's node-naming convention; for PHP against the namespace of the file plus its file name, or the physical path where it has no namespace, dropping the `.php` ending |
| `REEXPORT` | Rust `pub use module::Type` (incl. `pub(crate) use`) | Adapter models it as a forwarding node — a crate flattens its public API via `pub use`, so consumers import the short `crate::Type` path; the forwarding node `crate::Type` points at the real `crate::module::Type` so the consumer's reference resolves transitively |
| `MEMBER` | Python `from module import name` and `from module import *` | The last path segment is the imported name (none for a wildcard). A relative module starts with one `.` segment per leading dot, which the adapter resolves against the module path of the file. A name can live in `module.py` or in `module/__init__.py`, so the adapter emits a dependency on both |

Without the `INCLUDE` tag, a C++ DC adapter cannot tell `#include "foo"` (needs path normalization) from `using foo;` (must not be normalized) — both produce the same `(path, isWildcard, namespacePath)` triple. TSE extractors tag the AST source; adapters branch on `kind`.

Java, Kotlin, C#, TypeScript, JavaScript, Go, Delphi and Vue leave the field at its default (`STANDARD`).

### Namespace-prefix handling

`UsedType.namespacePrefix` captures the scope segments that appear *before* a type name at the use site. For `A::B::Settings` it is `["A", "B"]`; for an unqualified `Settings` it is `[]`.

**Why it exists — and why it's essentially a C++ concern:**

| Language | Typical style | Does `namespacePrefix` carry info? |
|---|---|---|
| Java, Kotlin, C# | Import types at the top, use short names inline. Qualified inline usage (`com.other.Settings s`) is rare and idiomatically discouraged. | No — always empty. The import list already carries the neighborhood info the resolver needs. |
| C++ | `using namespace` is discouraged in headers because it pollutes scope. Writing `cppcheck::Settings` inline is **the normal way** to reference cross-namespace types. | Yes — populated on every qualified inline reference. |
| TypeScript, JavaScript, Go, Vue | Import-aliased usage (`pkg.Type`) is idiomatic but stored as a dotted string in `UsedType.name`; the resolver splits on `.`. | No — always empty. |
| Python | `import shop.orders` followed by `shop.orders.Order` is how a module import is used. | Yes — every attribute access `a.b.C` is the used type `C` with the prefix `[a, b]`; the adapter keeps those whose prefix is an imported module or its alias. |
| PHP | Has namespaces similar to C++. A declared type (return, parameter, property) is taken as written, qualifier included, in `UsedType.name`; a qualified base class, interface or instantiated class is left out. | No — always empty. |
| Rust | A `use` brings most types into scope, but fully-qualified inline references (`crate::a::Foo`, `super::B`) without a `use` are legal and common. | Yes — populated for `scoped_type_identifier` references (the scope segments before the final name, verbatim incl. `crate`/`self`/`super`). |

**How a DC-side adapter consumes it:** when building a node's `dependencies` set, emit a synthetic `Dependency(Path(namespacePrefix), isWildcard = true)` per `UsedType` that has a non-empty prefix. This mirrors what DC's legacy C++ analyzer did implicitly via `TypeExtractionService.extractTypeWithFoundNamespacesAsDependencies`: for every qualified usage, add a wildcard pointing at the type's neighborhood so the resolver can match the short name against classes declared there.

The resolver itself needs no changes — the existing wildcard-matching loop in `Node.resolveTypeImport` already prepends wildcards to type names and looks for project matches.

### Usage of a type

`UsedType.usage` says how a declaration uses a type: `INHERITANCE`, `IMPLEMENTATION`, `CONSTANT_ACCESS`,
`RETURN_VALUE`, `INSTANTIATION`, `ARGUMENT`, or `USAGE` for any other way. Only the PHP extractor fills it; every
other language leaves it at `USAGE`. Two used types that differ only in `usage` are two entries of the set. DC
identifies a type by its name alone, so its adapter keeps the first: the order of the set decides which usage a
dependency gets.

### Declarations without a name of their own

- `DeclarationType.SCRIPT` (PHP): a file that declares nothing is one declaration with an empty name that carries
  what the whole file uses. The adapter names it `<file>.script`.
- `DeclarationType.SCRIPT` (SQL): the statements outside any `CREATE` of a file, such as an `INSERT … SELECT` of a
  migration, are one declaration with an empty name next to the objects the file creates.
- A Vue component is one `CLASS` named `DEFAULT_EXPORT`, like the default export of a JavaScript file. Its used types
  are the components its template names. The adapter names it after the file.
- An Angular template is one `SCRIPT` with an empty name. Its used types are its elements, but for Angular's own
  `ng-container`, `ng-template` and `ng-content`, and the names of the pipes it uses; the adapter resolves the ones a
  component or pipe declares and drops the rest, such as plain HTML elements.

### Template names

An Angular template refers to a component by the element its selector names (`<app-cave-map>`) and to a pipe by its
pipe name (`| goldCoins`), not by the class name. The TypeScript extractor reads them off the `@Component` and `@Pipe`
decorators into `Declaration.angular.templateNames`: every element of a selector list, lowercased, and the pipe name. Attribute
and class selectors name no element and are left out. The adapter matches the used types of a template against them.

### Embedded sources

A file can hold sources in another language: a Vue component its script blocks, an Angular component in TypeScript
its inline template. An `EmbeddedSourceMapping` finds them as `EmbeddedSource(content, language, owner)`: the one of
`LanguageDependencyMapping.embeddedSources`, or else the one of `LanguageDefinition.embeddedSources`. TypeScript
registers its inline templates once, in the definition, so they count for metrics and text extraction as well; Vue
registers its script blocks in the dependency mapping only, as its metrics and text extraction read the script through
a preprocessor. `DependenciesFacade` analyses each source in its own language:

- A source without an owner, such as a script block, belongs to the file: its imports are appended to the imports of
  the file, and what it declares is dropped.
- A source with an owner, such as an inline template, belongs to the declaration of that name: what it declares becomes
  an `EmbeddedDeclarations(owner, language, declarations)` of `DependencyResult.embedded`. The adapter makes the
  template a node of its own inside the component, `<Component>.template`.

Metrics and text extraction parse only the script of a Vue file, with the JavaScript grammar and a preprocessor that
cuts the script out. Dependency extraction needs the template as well, so `VueDependencyMapping` sets
`grammarOfWholeFile` to the Vue grammar: the whole, unprocessed file is then parsed with it.

### Bundler aliases

`TreeSitterDependencies.bundlerAliases(configuration)` reads `resolve.alias` of a webpack, vite or vue-cli
configuration. An alias is a name, the path parts and where the path starts (`AS_WRITTEN`, `CONFIG_DIRECTORY`,
`WORKING_DIRECTORY`); the adapter joins the parts on the file system.

### Primitive and sized-type representation

For languages with built-in primitive types (currently C++; relevant whenever a new language adds support), TSE emits the trimmed source text of the AST node verbatim — no semantic normalization.

| AST shape | Emitted `UsedType.name` |
|---|---|
| `void`, `int`, `bool`, `char`, `double`, `size_t`, `int64_t`, … (`primitive_type`) | `"void"`, `"int"`, `"bool"`, … (the literal source token) |
| `unsigned int`, `signed long` (`sized_type_specifier` with primitive child) | `"unsigned int"`, `"signed long"` (the full source span) |
| Bare `unsigned`, bare `signed` (`sized_type_specifier` without primitive child) | `"unsigned"`, `"signed"` |

**What TSE does not do:** the DC-legacy C++ analyzer normalized bare `unsigned` and `signed` to `"int"` (the C standard's implicit type). TSE deliberately doesn't replicate that — semantic normalization is a language-quirk concern that doesn't belong in a generic AST extractor, and the resolver doesn't need it (no project class is named `int`/`unsigned` so primitives don't produce dependency edges anyway).

**Resolver impact:** primitives don't resolve to project nodes in any realistic codebase, so they're effectively invisible at the `.cg.json` layer. They do appear in `usedTypes` though, which means test assertions over `usedTypes` need to account for them — write `containsExactlyInAnyOrder(...)` with the primitive included, or filter the collection before asserting if the test only cares about user-defined types.

### Generic types representation

`UsedType` stores generic type arguments **nested only** inside the parameterized type, never duplicated as standalone entries. For `List<String>` an extractor produces a single entry:

```kotlin
UsedType(name = "List", genericTypes = listOf(UsedType(name = "String")))
```

— not two parallel entries (`List` plus a flat `String`). The same rule applies recursively: `Map<Key, Container<Item>>` is one nested tree; the inner `Key`, `Container`, and `Item` do not appear as standalone `UsedType`s in the set.

**Why this differs from DC legacy:** some DC legacy analyzers (notably C++) emitted both forms — the wrapped type **and** flat duplicates of its generic arguments — so their `usedTypes` sets were larger and had redundant entries. TSE represents the AST shape directly.

**Why it's not a behavioral regression:** when DC's pipeline turns `usedTypes` into `Dependency` edges, `Node.resolveTypes` walks each `Type` via `Type.containedTypes()`, which recursively descends into `genericTypes` and treats every contained name as a candidate for resolution. The dependency graph is computed from the flattened view; the storage shape is just the AST one. So `List[String]` still resolves to a dep on a project class `String` (if one exists) — flattening is deferred from extract-time to resolve-time.

**What this means for adapters and tests:**

- DC adapters: nothing to do — the existing `Node.resolveTypes` flattening handles both shapes transparently. Don't add a pre-flattening pass; it would create duplicate edges.
- Test assertions: when checking `usedTypes` in a TSE-backed analyzer test, write the assertion against the nested shape (`Type.generic("List", listOf(Type.simple("String")))`), not against flat-duplicate expectations carried over from DC legacy.


## Adding a new language

### 1. Create the dependency mapping

```kotlin
// languages/newlang/NewLangDependencyMapping.kt
object NewLangDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = PackageExtractor::extract,
        extractImports = ImportExtractor::extract,
        extractDeclarations = DeclarationExtractor::extract
    )
}
```

### 2. Create extractors in `languages/newlang/extractors/`

Each extractor is an `internal object` with an `extract` function. Use direct tree traversal (`TreeTraversal.findAllDescendantsOfType`, `findAllDescendantsGroupedByType`, etc.) — not TSQuery.

Two rules follow from how nodes are stored:

- **Never keep a `SyntaxNode` beyond the `extract` call that received the root**, in a field, a cache or the result. Its memory is reused afterwards, and a kept node then reads as another node without any error. Return names and paths, not nodes.
- **Do not search the whole tree once per declaration.** Every node reached during one `extract` call stays in memory until it returns, so such a search costs memory as well as time: a generated C# file once needed 6.7 GiB that way. Search once and reuse the result.

Required extractors:
- **PackageExtractor** — extracts the package/module path as `List<String>`
- **ImportExtractor** — extracts imports as `List<ImportDeclaration>`
- **DeclarationExtractor** — finds class/interface/enum declarations, delegates to UsedTypeExtractor for each
- **UsedTypeExtractor** — extracts all types used within a declaration

See `languages/java/extractors/` for the reference implementation.

### 3. Register in the language definition

```kotlin
// languages/newlang/NewLangDefinition.kt
object NewLangDefinition : LanguageDefinition {
    override val nodeMetrics = NewLangMetricMapping.nodeMetrics
    override val nodeExtractions = NewLangExtractionMapping.nodeExtractions
    override val dependencyMapping = NewLangDependencyMapping.dependencyMapping
}
```

### 4. Add tests

Create `src/test/kotlin/.../languages/newlang/NewLangDependencyTest.kt` with `@Nested` inner classes for each extraction aspect:

```kotlin
class NewLangDependencyTest {
    @Nested
    inner class PackageExtraction { ... }

    @Nested
    inner class ImportExtraction { ... }

    @Nested
    inner class DeclarationExtraction { ... }

    @Nested
    inner class ApiSupportCheck { ... }
}
```

### 5. Verify with dc-compare

Run dc-compare between DC main (legacy analyzer) and the DC branch integrating TSE for that language. Use the `/dc-compare` command (defined in `.claude/commands/dc-compare.md`).

## Used type concatenation order

When the `UsedTypeExtractor` collects used types for a declaration, it gathers them by category (inheritance, fields, annotations, etc.) and concatenates them into a list before calling `.toSet()`. The **concatenation order must match DC's legacy analyzer** for that language.

### Why order matters

DC's Levelizer breaks dependency cycles by picking the node with the fewest incoming edges. When nodes are tied, `minByOrNull` picks whichever it encounters first. Kotlin's `.toSet()` creates a `LinkedHashSet` that preserves insertion order, so the concatenation order propagates through DC's pipeline and affects which cycle edge gets cut, which determines `level` and `isCyclic` assignments.

A different concatenation order with the same types produces identical dependency data but can change DC's levelization output.

### How to match the order

1. Find DC's legacy analyzer in `DependaCharta/analysis/.../analyzers/<language>/`
2. Look for the `extractUsedTypes` method (or equivalent) where categories are concatenated
3. Use the same concatenation order in TSE's `UsedTypeExtractor`
4. If DC has no legacy analyzer for the language, use whatever order makes sense

### DC legacy concatenation orders

| Language | Order | DC file |
|---|---|---|
| **Java** | inheritance, variables, annotations, methodInvocations, constructorCalls, thrownTypes, fields, methods | `JavaAnalyzer.kt` |
| **Kotlin** | inheritance, properties, parameters, returnTypes, annotations, constructorCalls, callExpressions | `KotlinAnalyzer.kt` |
| **TypeScript** | typeIdentifiers, constructorCalls, memberAccesses, methodCalls, extensions, relevantIdentifiers | `TypeScriptAnalyzer.kt` |
| **PHP** | imported constants, inherited, implemented, constant owners, return, argument, instantiations, properties, static call owners, traits | `UsedTypesExtractor.kt` |
| **C#** | constructors, methods, casts, genericParams, genericConstraints, inherited, variables, objectCreations, memberAccesses, attributes, isTypeChecks | `CsharpAnalyzer.kt` |
| **C++** | processor list order: typeDecl, inheritance, methods, typeDef, alias, generic, define | `BodyProcessor.kt` |
| **Go** | for a function: parameter types, result types, methods called through a selector, functions called directly, package-qualified types; then for every declaration all type identifiers and qualified types in source order. The used types of a method are appended to its receiver type | `GoAnalyzer.kt` |
| **Python** | all identifiers in source order, then all attribute accesses in source order | `PythonAnalyzer.kt` |
| **JavaScript** | Same as TypeScript (shared `UsedTypeExtractor`): typeIdentifiers, constructorCalls, memberAccesses, methodCalls, extensions, relevantIdentifiers, constraintTypes, typeAliasRhsTypes, jsxComponents. DC legacy was imports-only; TSE adds full used-type extraction. | `JavascriptAnalyzer.kt` |
| **Vue** | template components in source order; the script imports are imports, which the adapter appends as used types | `VueAnalyzer.kt` |
| **Angular template** | elements and pipes in source order | N/A — TSE-native, no DC legacy |
| **Delphi** | inheritance, parameters, returnTypes, fieldTypes, propertyTypes, constTypes, variableTypes, constructorCalls, methodCalls, castTypes, attributeTypes, genericConstraintTypes | N/A — TSE-native, no DC legacy |
| **Rust** | supertraits, fields (named + tuple), parameters, returnTypes, genericBounds, whereBounds, associatedBounds, typeAliasRhs, constStaticTypes; then per-target `impl` folding appends the impl'd trait followed by the impl method-signature types | N/A — TSE-native, no DC legacy |
| **SQL** | the objects referenced (`FROM`, `JOIN`, `INTO`, `UPDATE`, `DELETE`, `MERGE`, `USING`, `INSERT`, `TRUNCATE`, `REFERENCES`, `EXEC`, `CALL`, `PERFORM`, the table of a trigger) and the routines called, in source order | N/A — TSE-native, no DC legacy |

### JavaScript vs TypeScript: DEFAULT_EXPORT copy behavior

For `export default function Foo` / `export default class Foo` (named inline default export), JavaScript and TypeScript intentionally diverge:

- **JavaScript**: emits both the named declaration (`Foo`) AND a second `Declaration(name="DEFAULT_EXPORT", type=<same>)`. This matches DC's legacy `JavascriptAnalyzer`, which produced both nodes.
- **TypeScript**: emits only the named declaration (`Foo`). No `DEFAULT_EXPORT` copy. This matches DC's legacy `TypeScriptAnalyzer`.

This asymmetry is a DC legacy compatibility shim, not a principled semantic choice. It is implemented in `JavascriptDependencyMapping.extractJsDeclarations()`.

## Namespace models: single-namespace vs multi-namespace languages

TSE's `DependencyResult` exposes two namespace-related fields: file-level `packagePath` (one list per file) and per-declaration `Declaration.parentPath`. How the two relate depends on the language, because DependaCharta (the sole consumer of the dependencies output) has two distinct models across its analyzers.

### Class 1 — single-namespace languages

One namespace per file. `packagePath` is authoritative; `parentPath` carries only in-file nesting (e.g., Kotlin inner classes) or is unused.

| Language | `packagePath` source | `parentPath` content |
|---|---|---|
| Java | `package_declaration` | empty |
| Kotlin | `package_header` | parent class chain only (package not duplicated) |
| Go | names of the package clauses, not a path; the adapter depends on them as the own package of the file and takes the directory of the file as its package path, where there is one | empty |
| PHP | `namespace` declaration, otherwise empty and the adapter uses the file path | empty |
| Python / JavaScript / Vue | always empty; the adapter uses the file path | empty |
| Delphi | `unit` declaration | empty (top-level types only in v1) |
| SQL | always empty: an object is used by its name alone, without imports | the schema an object is created in, or the package of a routine of a PL/SQL package body |

DC adapters for Class 1 build the node path as `packagePath + parentPath + name` (Kotlin) or `packagePath + name` (Java). The self-wildcard import is emitted once per file from `packagePath`.

### Class 2 — multi-namespace languages

Multiple top-level namespaces per file are legal, and nested namespaces scope their inner members. A single file-level `packagePath` cannot represent this — each declaration needs its own namespace chain.

| Language | `packagePath` source | `parentPath` content |
|---|---|---|
| C# | first declared namespace (informational only) | full namespace chain + parent class chain |
| C++ (planned) | first declared namespace (informational only) | full namespace chain + parent class chain |
| TypeScript ambient modules (planned) | file path | ambient module path per declaration |
| Rust | always empty (file-module path is filesystem-derived; DC derives it from `physicalPath`) | in-file inline-`mod` chain (`mod a { mod b { … } }`) |

DC's C# adapter (`CSharpAnalyzer` on `feat/tse-csharp-integration`) **ignores `result.packagePath`** and derives everything from `declaration.parentPath`: the node's `pathWithName` is `parentPath + name`, scoped imports match on `parentPath`, and the self-wildcard import is emitted **per declaration** from its own `parentPath`. C++ will follow the same pattern when migrated.

### Guidance when adding a new language

- If the language has one namespace per file (Class 1), populate `packagePath`; leave `parentPath` for in-file class nesting only.
- If the language allows multiple or nested namespaces per file (Class 2), populate `parentPath` with the full namespace-plus-parent-class chain. `packagePath` may still be filled in as a best-effort first-namespace hint, but consumers should treat it as informational.
- The DC adapter for a Class 2 language should read `declaration.parentPath` rather than `result.packagePath` for path construction and for emitting the per-declaration self-wildcard import.

## How DC consumes TSE output

DC's `DependencyResolverService` takes the `DependencyResult` and:

1. Builds a project dictionary mapping type names to full paths
2. Calls `Node.resolveTypes()` on each node — resolves used type names to actual project nodes via imports
3. Classifies resolved dependencies as internal vs external
4. Feeds resolved nodes into `CycleAnalyzer` (Tarjan's SCC) for cycle detection
5. Feeds the graph into `Levelizer` for architectural level assignment
6. Exports as cc.json

TSE's job is steps 1-2 of the legacy pipeline (parse + extract). Steps 3-6 remain in DC.
