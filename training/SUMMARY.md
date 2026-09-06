# Summary across languages

Generated 2026-09-06 from the 18 `FINDINGS.md` reports. Each language folder holds the same
"Cellars and Centaurs" model plus the stress constructs from `README.md`; the numbers below are what the
language's own report counted (expected edges include test edges where the report says so).

## Overview

| Language | Dependency parser: expected / found file edges | Domain parser: expected words found (of 17) | Biggest issue |
| --- | --- | --- | --- |
| abl | not supported | 17 | qualified `CLASS de.sots...Creature:` header yields no class name; temp-table fields not extracted |
| bash | not supported | 17 | `::` in function names deleted (`creatureset`), `# shellcheck source=` and `dirname` path noise dominate |
| c | 71 / 14 | 17 | `#include` never becomes an edge; `.c` files and declaration-less headers vanish; `Creature` resolves to the dto |
| cpp | 40 / 35 | 17 | dto `Creature` never resolved; `using Entity = ...` alias invisible; hpp/cpp pairs collapse onto the `.cpp` |
| csharp | 47 / 41 | 17 | property declaration types give no edge; `using Entity = ...`, `using static`, `global using`, `is` pattern ignored |
| delphi | 52 / 32 | not supported | alias-only unit `Api.pas` and the `.dpr` vanish (with both cycles); same-named `TCreature` resolves to first `uses` entry |
| go | 49 / 36 | 17 | dot import resolves nothing; package consts are neither leaves nor usages, so the cycle and upward edges vanish |
| java | 44 / 42 | 17 | FQN `application.dto.Creature` resolved to the imported domain `Creature`; `import static ...rollD20` gives no edge |
| javascript | 43 / 25 | 17 | JSDoc-only dependencies invisible (15 edges); `export *` barrel is a dead leaf; strings in exported declarations not counted |
| kotlin | 44 / 39 | 17 | `import ... as Entity` alias and FQN-without-import give no edge; top-level `fun rollD20` invisible |
| objectivec | not supported | 17 | `.h` parsed as C: `interface`, `end`, `protocol`, `nonnull` leak, header declarations lost |
| php | 50 / 33 | 17 | constructor property promotion gives no edge (hides the 3-cycle); namespace not split at `\` (`desotscellars` is word #2) |
| python | 52 / 51 | 17 | `src/` layout drops every absolute import (51 -> 24 edges); stdlib decorators counted as domain words |
| ruby | not supported | 17 | `should_save_creature_to_the_stable` in a string yields no words; namespace segments are the top words |
| rust | 41 / 31 | 17 | types used only in function bodies (`CreatureId::new`) give no edge, so all upward edges and cycles vanish |
| swift | not supported | 17 | `Package.swift` treated as source; `*Tests.swift` not recognised as test |
| typescript | 49 / 47 | 17 | second import of the same original name (`Creature as CreatureDto`) dropped; `export { default as }` has no outgoing edge |
| vue | 62 / 60 | 17 | `.vue` components only reachable from same-folder `.vue` files (`@/` alias default import lost); only first `<script>` read |

## What works everywhere

- No false-positive file edge in any of the 12 dependency-parser languages with the round-1 constructs
  (round 2 found some in cpp and typescript, see below). Standard library and third-party packages never
  become internal edges, an unused import never produces an edge.
- Cycles and upward edges are flagged correctly whenever the underlying edges exist.
- All 17 planted domain words reach the root node in all 17 domain-parser languages.
- No language keyword leaks into the word list in any language.
- camelCase, snake_case, SCREAMING_SNAKE, PascalCase, the acronym `XPValue` and the kebab string
  `centaur-stable` split correctly everywhere.
- Comments and strings are weighted identifier 3 / comment 2 / string 1 as documented (with the exceptions below).
- Tests are skipped by default in the dependency parser and included by default in the domain parser, and the
  directory-based rules (`test/`, `tests/`, `spec/`) work.

## Dependency parser: defects ranked by impact

1. **Same simple name in two packages collapses to one target.** The second import, alias, FQN or qualified
   reference to `application.dto.Creature` resolves to the domain `Creature` (or the first-seen declaration).
   Seen in typescript, javascript, vue, java, kotlin, rust, go, php, python, delphi, cpp and c. The dto file
   ends with 0 incoming edges in every one of them.
2. **Usages inside function bodies and static members are not extracted in several analyzers.** Rust path
   expressions (`CreatureId::new`, `SpeedType::Walking`, `CreatureFacade::STANDARD_CREATURE_TYPE`), C++ static
   calls inside bodies, Go package consts, C# `is` pattern / `typeof`. Because the planted upward dependency is a
   static-member access, those languages report no cycle and no upward edge at all.
3. **Type aliases and aliased imports are not followed.** `import ... as Entity` (kotlin), `use ... as Entity`
   (rust), `using Entity = ...` (csharp, cpp), `TEntity = TCreatureEntity` (delphi), `type Fightable = model.Fightable`
   (go, becomes leaf `application.unknown`). PHP, TypeScript, JavaScript and Python aliases work.
4. **Free functions, top-level constants and static imports are neither leaves nor edge sources.** Kotlin
   top-level `fun rollD20`, C++ free functions and gtest bodies, Java `import static ...Dice.rollD20`, PHP
   `use function`, Delphi `RollD20`, all C functions. Only PHP, Rust, Go and Vue/TS report FUNCTION leaves.
5. **Files without a class-like declaration vanish from the map.** All nine `.c` files and include-only headers,
   the C++ umbrella header, Rust `lib.rs` and every `mod.rs`, Delphi `Api.pas` and the `.dpr`, Vue `main.ts` and
   the spec. Barrels and include graphs cannot be judged when the file is gone, and `--include-tests` then has no
   effect (c, vue).
6. **C is effectively unsupported.** `#include` lines never produce edges, `struct X *` tag references are not
   extracted (the only cycle is missed), 14 of 71 expected edges found, all of them struct-field types.
7. **Barrels are inconsistent.** TypeScript `export { default as X }` and JavaScript `export *` yield a REEXPORT
   leaf without outgoing edge; `.ts` importers stop at `index.ts` while a `.vue` importer of the same barrel is
   resolved straight through; Python `__init__` re-exports have kind UNKNOWN.
8. **Language-specific resolution gaps.** C#: property declaration types, `using static`, `global using`.
   PHP: constructor property promotion, FQN without `use`, namespace import `use ...\Model;`, `require_once`,
   attribute-only usage. Go: dot import, `var _ Iface = (*T)(nil)`. Python: `src/` layout loses absolute
   `de.sots...` imports. Vue: `@/` alias default import of a `.vue`, `.vue` only reachable from the same folder.
   C++: hpp/cpp pairs credited to the `.cpp`, the `.hpp` becomes a 0/0 node. Rust: inline `#[cfg(test)] mod`
   counted as production, `tests/` crate root taken from the directory name instead of the Cargo package.
9. **Test detection is directory-only for c, cpp, delphi, objectivec, swift, bash and abl.** `FooTest.cpp`,
   `*_test.c`, `*Tests.pas`, `*Tests.swift`, `*_test.sh` next to the sources are analysed as production code.
10. **Leaf kinds and usage kinds are coarse.** Records, structs, value classes, named int types, Python `Enum`
    and `ABC`, TypeScript type aliases all report CLASS; every leaf edge has `usage=usage`, inheritance and
    implementation are not distinguished; `export default` adds a synthetic `_DEFAULT_EXPORT` leaf (ts, vue, js).
11. **Upward flag follows inferred levels, not layer names.** `adapter -> application` is not flagged upward in
    java, kotlin, php and vue because levelling puts the adapter above the application layer. Defensible, but
    the hexagonal reading of the training projects expects it flagged.
12. `--verbose` prints timing only; nothing about unresolved imports (typescript, rust).

## Domain language parser: defects ranked by impact

1. **`--comment-weight 0` and `--string-weight 0` abort with an `IllegalArgumentException` stack trace**
   (every language). The spec here suggested 0 to isolate a source; either allow 0 or fail with a one-line
   message. Weight 1 versus a high weight works as a substitute.
2. **Digit splitting is inconsistent and leaks bare numbers.** `rollD20` becomes `roll` + `20` (the `d` is
   dropped, `20` becomes a root word) while `d20Roll` becomes `d20` + `roll`. Every language.
3. **Strings inside declarations are not counted in TypeScript, JavaScript and Vue.** Anything under an
   `export`-prefixed declaration or inside a class body (`'No such creature in the dungeon: '`,
   `'centaur-stable'`) contributes nothing, so string weight is effectively unused there. Rust, Kotlin, Java,
   Python, Go, PHP and the others count them.
4. **Underscore-joined words inside strings and comments are never split.** `should_save_creature_to_the_stable`
   yields no words (ruby, vue) because the word regex `\b[a-zA-Z]{3,}\b` treats `_` as a word character.
5. **Paths and namespace lines pollute the vocabulary.** `#include` paths counted as strings (c, cpp: `hpp` is
   word #4, objectivec), include guards counted as identifiers (c: `sots`, `cellarsandcentaurs` are #2 and #3),
   PHP namespaces not split at `\` (`desotscellars`), Ruby module lines make `de`/`sots`/`cellars`/`centaurs` the
   top words, Bash `::` deleted (`creatureset`) and `$(dirname ...)` source paths counted.
6. **`.h` is always C.** Objective-C headers are parsed with the C grammar and keyword list: `interface`, `end`,
   `protocol`, `ns`, `nonnull` leak, method signatures and protocol names are lost.
7. **Documentation tags and tool directives are counted as words.** JSDoc `param`/`returns`/`typedef` (js),
   docblock tags (php), YARD `param` (ruby), `summary` from XML docs (csharp), `# shellcheck` (bash: word #2).
8. **MODERATE stop-word level lets architecture words through.** `entity`, `repository`, `facade`, `dto`,
   `logger`, `id`, `type`, `new` survive in every language; only AGGRESSIVE removes most of them, and `id` /
   `persisted` survive even there. Whether they are domain words is a policy decision; today `util`, `service`
   and `exception` are filtered at the same level, which is inconsistent.
9. **Language-specific extraction gaps.** Python: stdlib decorators `dataclass`, `abstractmethod`, `property`
   counted as domain words, typed parameters with defaults skipped. Vue: only the first `<script>` block read,
   `defineProps<{...}>()` swallows the following declaration, `CreatureList.vue` comes out empty. ABL: qualified
   class header name lost, temp-table fields skipped. Kotlin: `value` (soft keyword) stripped from `XPValue`.
   Swift: `class` filtered inside the comment "armor class". C: strings inside `#define` not counted.
10. **Only declarations are counted, not usages.** Type references, calls and member accesses add nothing
    (noted for abl, csharp, swift, objectivec, bash, js). Frequencies therefore reflect how often a word is
    declared, not how often the code talks about it. Design decision, but worth stating in the docs.
11. **Test and build-file detection.** `*Tests.swift`, XCTest `<Target>Tests/` (objectivec), `*_test.sh`,
    `*Test.cls`, `*_test.c` are not recognised; `Package.swift` and `.kts` build scripts are analysed as source
    and add `github`, `apple`, `mockk`, `jvm`; extension-less `Rakefile` is skipped; Rust inline `#[cfg(test)]`
    cannot be excluded.
12. **No stemming.** `creature`/`creatures`, `centaur`/`centaurs`, `cellar`/`cellars` are separate words in every
    language.

## Not supported at all

| Parser | Missing languages | What a report says it would need |
| --- | --- | --- |
| dependencyparser | abl, bash, objectivec, ruby, swift | a grammar plus `USING`/`RUN` (abl), `source` path resolution (bash), `#import` + `@class` (objectivec), `require_relative` + nested module constant lookup (ruby), whole-module name resolution (swift) |
| domainlanguageparser | delphi | tree-sitter Pascal grammar, Pascal keyword list, `//`, `{ }`, `(* *)` comments, `T`/`I`/`E` prefix stripping |

## Where to look

Every `training/<language>/FINDINGS.md` starts with the expected edge list written before the parser ran, then
the per-construct table with the exact file and construct, then the domain parser tables. The raw outputs and
the variant runs (`--include-tests`, `MINIMAL`, `AGGRESSIVE`, changed weights) are in `training/<language>/output/`.

## Round 2: the less common dependency forms

Added 2026-09-06 after the first round. Each language got the forms it did not show yet (dynamic loading,
textual includes, type references without an import, alternate module layouts); every language's
`FINDINGS.md` has a "Round 2" table with the file and the exact construct. Round-1 edges stayed unchanged
in every language except C# (see below).

| Language | Round-2 forms found | Missed or wrong |
| --- | --- | --- |
| typescript | dynamic `import()`, `export * as`, `export type {} from`, `export { type X }`, `.js`-suffixed import, `namespace` member access | side-effect import, `import x = require()`, inline `import("…").T` type, triple-slash reference; `declare module "winston"` creates a false edge from `CreatureService.ts` to the `.d.ts`; `export * as` loses the namespace and doubles counts |
| javascript | dynamic `import()`, extension-less import | side-effect import, `export * as`, `export { default } from`, `require("./dir")` and directory imports (no `index.js` probing: the directory import lands on `CreatureFacade.js` by name coincidence) |
| vue | `defineAsyncComponent(() => import())` across folders, `<component :is>` same folder, both script blocks, `<script lang="js">` | `.ts` default-importing a `.vue`, `app.component()` global registration, relative cross-folder `.vue` import |
| java | generic argument `List<Centaur>`, anonymous subclass | nested class import, static wildcard import, method and constructor references, `instanceof`, array type `Speed[]`; nested `Builder` exported as a top-level leaf; `module-info.java` silently dropped |
| kotlin | nested class import | `typealias` (a typealias-only file has no node), `is`, delegation `by`, extension function and its import, top-level function import, `::class`, lambda parameter type; a function-only file vanishes with all its edges |
| csharp | generic argument, interface default method, `using` inside a namespace block, second partial part | `typeof`, `nameof`, `catch` type, lambda parameter, `extern alias`; **partial class maps the leaf to the alphabetically first part, which moved both round-1 incoming edges and dropped all 14 cycle flags** |
| go | `internal/` package, `//go:build` file, generic argument, type switch | `//go:embed`, `replace` directive in `go.mod`, method value `dice.Roll` |
| python | `from . import x`, try-branch import, `import … as module`, conditional import, namespace package | `except ImportError` fallback (first import wins), `importlib.import_module`, string forward reference, `List["Centaur"]` |
| php | `use const`, `new $className` via `::class`, closure parameter type | `instanceof`, `include` and `require`, `catch` type, docblock `@var`, `enum implements`, interface `extends` |
| rust | 2018-style `foo.rs` + `foo/`, `use x::{self, y}`, `pub(crate) use`, generic argument, `impl Trait` argument | `#[path]`, `macro_rules!` invocation, `match` pattern path, `use` inside a function body |
| cpp | forward declaration, `friend class`, casts, template argument, include under `#ifdef` | `typedef` alias, `catch` type, template specialization (file vanishes); using-declaration resolves to the dto `Creature`; **three new false positives: `domain::model::Creature` in a parameter or return type resolves to `application/dto/Creature.hpp`** |
| c | conditional include, `.c` including `.c` (both via struct fields, not via the include) | opaque pointer, macro as field type, prototype-only parameter, extern global, macro-only header |
| delphi | class helper, interface delegation, `ClassName` reference, both `uses` halves, generic argument | `{$I x.inc}` (`.inc` not scanned), `.dpk` (not scanned), `initialization`-only usage |

Only the domain parser exists for ruby, swift, objectivec, abl and bash; their round-2 files record the expected
edges for a future parser. Domain-parser observations from the new files: `.pch` and `.inc` are not mapped to a
language and vanish; `Package.swift` and `//go:build` / `//go:embed` directives add noise; a switch pattern
binding (`case let centaur as Centaur`) is not extracted in Swift.

### What round 2 adds to the ranking

1. **Files without a class-like declaration vanish, now confirmed for typealias-only and function-only
   Kotlin files, C++ template specializations, `module-info.java`, `.inc`, `.dpk`, `.pch`.** This is the
   same root cause as round-1 item 5 and now costs whole edge sets, not just barrels.
2. **Partial classes (C#) break the leaf-to-file mapping and with it cycle detection.** New, high impact for
   any real C# code base.
3. **Simple-name resolution with an own-namespace wildcard produces false positives in C++** whenever two
   types share a name, even with a qualified `domain::model::Creature`. Round 1 saw the wrong target, round 2
   shows it also invents edges.
4. **Expression-level references are consistently ignored across languages**: `instanceof` / `is` / type
   switch (java, kotlin, php; Go and C++ casts do work), `typeof` / `nameof` / `::class`, method references,
   `catch` parameter types (csharp, php, cpp), lambda parameter types, `match` patterns (rust), array types
   (java). A type referenced only this way has no edge.
5. **Module-system details**: no `index.js` probing for directory imports (javascript), `replace` in
   `go.mod` and `#[path]` ignored, TypeScript `import = require` and triple-slash references ignored,
   `export * as` loses its namespace (ts) or is dead (js), `app.component()` registration not followed (vue).
6. **Textual includes and dynamic loading are out of scope by design** (`{$I}`, `.pch`, `importlib`,
   `import.meta.url`, computed `require`), which is acceptable but should be documented per language.

## File view versus logical view

Both views come from one extraction and resolution stage, so the resolution defects (same-name collapse, the
C++ and TypeScript false positives, vanished files, ignored expression-level references) appear identically
in `edges` and in `leaves` / `leafEdges` / `namespaces`. Differences:

- Only the file view: C# partial classes credit all edges to the alphabetically first part (the leaf is
  correct, but the cycle flags are zero in both views); C++ hpp/cpp pairs are credited to the `.cpp`; barrels
  become an extra `index.ts` node in the map.
- Only the logical view: Java nested classes become top-level leaves (`application.Builder`); synthetic
  `_DEFAULT_EXPORT` leaves (ts, js, vue) and VARIABLE leaves for Python module assignments; coarse leaf kinds
  and `usage=usage` everywhere; namespace levels that put `Adapter` above `Application`.

## Where the defects live: TSE or the CodeCharta parser

TreeSitterExcavationSite (TSE, `v0.12.0`) does the extraction for java, kotlin, typescript, tsx, javascript,
csharp, cpp (also used for c), delphi and rust: it returns declarations (name, type, parent path, used types
with a namespace prefix and generics) and imports (path, wildcard flag, namespace path, binding name).
CodeCharta's own tree-sitter analyzers handle php, go, python and vue entirely, so every finding for those four
languages is ours. For the TSE languages, `training/tools/TseProbe.java` shows what TSE delivers; the split
from running it on the defect files:

| Defect | Where | Evidence |
| --- | --- | --- |
| Same simple name collapses (java FQN `application.dto.Creature`, rust `crate::application::dto::creature::Creature`, csharp `Dto.Creature`) | CodeCharta | TSE delivers the qualified name or the prefix; `UsedType.toType()` keeps only the simple name and `Node.resolveTypeImport` prefers the direct import of that simple name |
| C++ false positives for `domain::model::Creature` | CodeCharta | TSE delivers `prefix=[domain, model]`; `CppAnalyzer` turns it into a wildcard that is never joined with the enclosing namespace, and the self-namespace wildcard's substring match wins |
| C# partial classes, hpp/cpp attribution | CodeCharta | TSE returns one CLASS per part with the same parent path; the file mapping is ours |
| Rust `use … as Entity` | CodeCharta | TSE delivers `binding=Entity`; the base analyzer ignores `bindingName` except for default imports |
| Kotlin `import … as Entity`, C# `using Entity = …` | TSE | binding is null (C# even marks the alias as wildcard), so the alias name cannot be mapped back |
| Java nested class as top-level leaf | TSE | Java declarations come with `parent=[]`, while Kotlin gets `parent=[CreatureFacade]` and our `KotlinAnalyzer` uses it |
| Kotlin top-level functions, extension functions, `typealias`; C++ `typedef` / `using X = Y`; Delphi type alias | TSE | no declaration is returned, so the file has nothing to hang edges on |
| `instanceof` / `is`, `typeof`, `catch` types, C++ `struct X *` tag references, Rust body paths (`CreatureId::new`), C# nullable property types, TS aliased binding used as `new CreatureDto()` | TSE | the used-type set of the declaration does not contain the type |
| TS side-effect import, inline `import("…").Speed` type | both | TSE returns the import but no used type; our edges need a used type to resolve, so an import alone never produces one |
| TS `import x = require()`, triple-slash reference, C# namespace alias `using Dto = …` | TSE | not in the import list at all |
| Delphi unit-qualified `dto.Creature.TCreature` | TSE | arrives as the fragments `Creature` and `TCreature` |
| `Speed[]` array type (java) | CodeCharta | TSE returns the name `Speed[]`; we do not strip the brackets |
| RECORD reported as CLASS | CodeCharta | TSE has `DeclarationType.RECORD`; `TseMappings` folds it into CLASS |
| Test detection, extension mapping (`.inc`, `.pch`, `.dpk`), levelling, cycle flags, barrel hops | CodeCharta | after extraction |
