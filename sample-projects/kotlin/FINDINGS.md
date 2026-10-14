# Kotlin

> Correction (2026-10-08, cross-check with one identifier per file): the digit split is attributed the wrong way
> round wherever this report mentions it. `d20Roll` gives `20` + `roll` (the leading `d` is dropped), `rollD20` gives
> `roll` + `d20`, `roll_d20` gives `roll` + `20`. Both identifiers sit in the same file here, so the file's word list
> could not tell them apart.

Round 3, 2026-10-08. All numbers below come from the runs of that day; the expected values were written into this
file before the first run and are repeated unchanged in the "expected" columns. Where an expected value of mine was
wrong it is marked as corrected, never silently adjusted.

## Project
- Layout: `build.gradle.kts`, `settings.gradle.kts`, `scripts/RollInitiative.kts`,
  `src/main/kotlin/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,adapter/persistence/archive,adapter/web,application,application/dto}`,
  `src/test/kotlin/.../domain/service/CreatureServiceTest.kt`. 38 files: 34 main `.kt`, 1 test `.kt`, 3 `.kts`.
- Added in round 3: `domain/service/EncounterResolver.kt`, `domain/service/EncounterEdgeCases.kt` (59 constructs, one
  function each), `domain/model/Zentaurenhöhle.kt` (unicode file name, class name, property `rüstungsklasse`, backticked
  function `` `zählt die bewohner` ``), `scripts/RollInitiative.kts` (extension variant: a script holding a class). None of
  them is git-ignored (`git check-ignore -v` exits 1 for all four).
- Stress constructs present from rounds 1 and 2: aliased import, wildcard import, inheritance, interface implementation,
  generic base class, type only in type position / only instantiated / only through a companion member / only in an
  annotation, same simple name in two packages, fully qualified reference without import, unused import, stdlib and
  third-party usage, test file, two classes plus a top-level function and constant in one file (`Dice.kt`), file name
  differing from the declaration (`Ports.kt`), typealias, `is` check, interface delegation, extension function, function
  import, class literal, nested class import, function type.
- Not available in Kotlin: a barrel / re-export module, `static` (companion object / `object` instead), a ternary (the
  conditional expression is `if (..) a else b` used as a value), `switch` (`when`), `goto`, fallthrough, preprocessor.
- Environment: the sandbox runs with `LC_CTYPE=POSIX`. Every command was run twice, once as is and once with
  `LC_ALL=C.utf8`; the numbers in this report are from the UTF-8 runs. The difference is a finding of its own (see
  "German words" and the verdict).

## Dependency parser

Commands, all exit 0:

```
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" --include-tests -o output/dependency-with-tests.cc.json
ccsh dependencyparser -nc <scratch project> -o output/dependency-probes.cc.json     (29 one-construct files, see below)
```

Every run logs `No .gitignore found at root level, excluding common build folders as fallback`: the `.gitignore` is
looked up in the scanned folder, not in the repository root.

Default run: 37 files scanned (test excluded), 33 file nodes, 36 declaration leaves, **57 file edges**, 62 leaf edges, 1
strongly connected component, "8 cycles" in the log. With tests: 38 files, 34 file nodes, 37 leaves, 62 file edges.
Expected were 79 file edges without tests and 85 with (44 round 1 + 18 round 2 + 17 round 3, + 6 test edges). All 57 / 62
reported edges are in the expected list; 22 / 23 expected edges are missing.

Four files have no node at all: `build.gradle.kts`, `settings.gradle.kts`, `adapter/persistence/archive/Entity.kt` (only a
`typealias`) and `application/CreatureDtoMapper.kt` (only a top-level extension function).

### Construct table (rounds 1 and 2 re-verified, round 3 added)

`M` = `domain/model`, `S` = `domain/service`, `P` = `adapter/persistence`, `PA` = `adapter/persistence/archive`,
`W` = `adapter/web`, `A` = `application`.

| # | construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- | --- |
| 1 | aliased import `import ...CreatureEntity as Entity` (`P/CreatureRepository.kt`) | `-> P/CreatureEntity.kt` | no, only `-> P/Repository.kt` | missing |
| 2 | wildcard import `domain.model.*` (`A/CreatureUtil.kt`) | `-> M/Creature.kt`, `-> M/HitPoints.kt` | both | ok |
| 2b | top-level constant `DEFAULT_DIE_SIDES` via wildcard (`A/CreatureUtil.kt`) | `-> M/Dice.kt` | no | missing |
| 3 | barrel / re-export | n/a | n/a | not in the language |
| 3b | cycle `Creature -> CreatureFacade -> CreatureService -> Creature` | 3 edges, cyclic | all three, `isCyclic` | ok |
| 4 | inheritance `Centaur : Creature`, implementation `Creature : Fightable`, `PersistedCreatures : Creatures` | 3 edges | all three | ok |
| 5 | generic base `Repository<Entity>` | `P/CreatureRepository.kt -> P/Repository.kt` | yes | ok |
| 6a | type only in type position (`Speed`, `ArmorClass` in `CreatureFacade.create`) | 2 edges | both | ok |
| 6b | type only instantiated (`CreatureId(...)`, `CreatureEntity(...)`) | 2 edges | both | ok |
| 6c | companion member only (`CreatureFacade.STANDARD_CREATURE_TYPE`, `CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION`) | 3 edges | all three | ok |
| 6d | annotation only, on a class (`@Roams` on `Centaur`) | `M/Centaur.kt -> M/Roams.kt` | yes, leaf kind `annotation` | ok |
| 7 | same simple name, DTO referenced fully qualified (`A/CreatureFacade.kt`) | `-> M/Creature.kt`, `-> A/dto/Creature.kt` | only the first; the DTO has 0 incoming | missing (no wrong target) |
| 8 | fully qualified reference without import (`S/CreatureService.kt`) | `-> M/Speed.kt` | no | missing |
| 9 | unused import `Fightable` (`A/CreatureUtil.kt`) | no edge | no edge | ok |
| 10 | `java.util.UUID`, `kotlin.random.Random`, slf4j, mockk, `kotlin.test`, `Map`, `List` | no internal edge | none | ok |
| 11 | test file | absent by default, 6 edges with `--include-tests` | absent by default; 5 edges with the flag | ok |
| 11b | `mockk<Creatures>(relaxed = true)` in the test | `-> S/Ports.kt` | no | missing |
| 12 | two declarations in `M/Dice.kt` | leaves `Dice`, `DiceRoll` | both, leaf edge `Dice -> DiceRoll` | ok |
| 12b | top-level function `rollD20()` called in `M/Creature.kt` | `-> M/Dice.kt` | no | missing |
| 12c | `S/Ports.kt` holding `interface Creatures` | edges resolve to `Ports.kt` | yes | ok |
| r2 | `typealias Entity = CreatureEntity` (`PA/Entity.kt`) | `-> P/CreatureEntity.kt` | no, file has no node | missing |
| r2 | alias used as a type (`PA/CreatureArchive.kt`) | `-> PA/Entity.kt` | no, 0 outgoing | missing |
| r2 | `candidate is Centaur` (`S/CentaurDetector.kt`) | `-> M/Centaur.kt` | no, 0 outgoing | missing |
| r2 | delegation `: Creatures by PersistedCreatures(CreatureRepository())` (`P/AuditedCreatures.kt`) | `-> S/Ports.kt`, `-> P/PersistedCreatures.kt`, `-> P/CreatureRepository.kt` | the two instantiations, not `Ports.kt` | missing (supertype) |
| r2 | top-level extension `fun Creature.toDto()` (`A/CreatureDtoMapper.kt`) | `-> M/Creature.kt`, `-> A/CreatureFacade.kt`, `-> A/dto/Creature.kt` | no, file has no node | missing (3) |
| r2 | `import ...application.toDto` + call (`W/CreaturePresenter.kt`) | `-> A/CreatureDtoMapper.kt` | no, only `-> M/Creature.kt` | missing |
| r2 | `import ...domain.model.rollD20` + call (`S/Initiative.kt`) | `-> M/Dice.kt` | no, 0 outgoing | missing |
| r2 | `Dice::class` (`S/DiceInspector.kt`) | `-> M/Dice.kt` | no, 0 outgoing | missing |
| r2 | nested class import `import ...CreatureFacade.Builder` (`W/CreatureController.kt`) | `-> A/CreatureFacade.kt` | yes, leaf edge `CreatureController -> Builder` | ok |
| r2 | function type `(Speed) -> Unit` (`S/SpeedVisitor.kt`) | `-> M/Speed.kt` | no, only `-> M/Creature.kt` | missing |
| r3 | imports + parameter types (`S/EncounterResolver.kt`) | `-> M/Creature.kt`, `-> M/Dice.kt` | both | ok |
| r3 | enum constant `SpeedType.FLYING` (`S/EncounterResolver.kt`) | `-> M/SpeedType.kt` | yes | ok |
| r3 | parameter types (`S/EncounterEdgeCases.kt`) | `-> M/Creature.kt`, `-> M/SpeedType.kt` | both | ok |
| r3 | parameter type of a secondary constructor, `constructor(..., höhle: Zentaurenhöhle)` | `-> M/Zentaurenhöhle.kt` | no | missing |
| r3 | `catch (missing: NoSuchCreatureException)` in `multipleCatch` | `-> M/NoSuchCreatureException.kt` | no | missing |
| r3 | `candidate as? Centaur` in `castOnly` | `-> M/Centaur.kt` | no | missing |
| r3 | `emptyList<CreatureId>()` in `callTypeArgument` | `-> M/CreatureId.kt` | no | missing |
| r3 | `val pace: Speed? = null` in `localVariableType` | `-> M/Speed.kt` | yes | ok |
| r3 | `{ roll: DiceRoll -> ... }` in `lambdaParameterType` | `-> M/Dice.kt` | no | missing |
| r3 | return type `List<ArmorClass>` in `genericReturnType` | `-> M/ArmorClass.kt` | yes | ok |
| r3 | `where T : Fightable` on `strongest` | `-> M/Fightable.kt` | no | missing |
| r3 | `@Roams` on the function `annotatedFunction` | `-> M/Roams.kt` | yes | ok |
| r3 | same-package types of constructor properties (`M/Zentaurenhöhle.kt`) | `-> M/ArmorClass.kt`, `-> M/Centaur.kt` | both | ok |
| r3 | script with a class (`scripts/RollInitiative.kts`) | `-> M/Dice.kt` | yes, leaf `InitiativeScript` without namespace | ok |

Round 3: 11 of 17 expected edges found. `EncounterEdgeCases.kt` has 5 of its 11.

The six round-3 misses and the older ones were isolated in a scratch project (`output/dependency-probes.cc.json`, package
`a` with `Target`, package `b` with one file per form, each importing `a.Target`):

| form | edge |
| --- | --- |
| plain import + constructor property; nullable local value type; `Map<String, List<Target>>` return type; `vararg targets: Target`; `object Singleton { val t: Target? }`; `object : Target() {}`; `ArrayList<Target>()`; parameter type `Höhle` (unicode class in a unicode file) | yes |
| `import a.Target as Alias`; `a.Target` fully qualified as return type, constructor call and property type; `emptyList<Target>()`; `import a.freeFunction`; `import a.FREE_CONSTANT`; secondary-constructor parameter; `catch (failure: Target)`; `as? Target`; `is Target`; lambda parameter type; `where T : Target`; `<T : Target>` on a class and on a function; `Target::class`; `(Target) -> Unit`; extension receiver `fun Target.run()` inside a class | no |
| file holding only a top-level function; file holding only a `typealias` | no node, no edge |
| `Target` only inside a string; unused import | no edge (correct) |

So the missing edge to `Zentaurenhöhle.kt` is caused by the secondary constructor, not by the umlaut: the same unicode
type as an ordinary parameter resolves. A call type argument is only seen when the callee starts with an upper-case letter
(`ArrayList<Target>()` yes, `emptyList<Target>()` no).

Classification from the source (`languages/kotlin/extractors/UsedTypeExtractor.kt`, `DeclarationExtractor.kt`): used types
are collected from supertype lists, property and class-parameter types, parameter and return types of
`function_declaration`, annotations, and call / navigation expressions whose first child starts with an upper-case letter.
Nothing is collected from `secondary_constructor`, `catch`, `as`, `is`, lambda parameters, type constraints, type-parameter
bounds, callable references, function types or receiver types. Declarations are `class_declaration` and
`object_declaration` only, so top-level functions, properties and typealiases are neither leaves nor targets, and a file
without a class has no node. The import extractor reads the path only; the alias name is not kept.

### Round 4 probes (2026-10-14)

Running the dependency parser over CodeCharta's own `analysis/` (for the ArchUnit cycle check) missed two package
cycles that the probes above do not cover. Both were isolated in a scratch project (package `a` declares, package `b`
uses, one file per form):

```kotlin
// a/Strategy.kt
fun interface Strategy { fun run(value: Int): Int }        // reported: no leaf at all    expected: leaf, kind interface

// a/FunImplNoCtor.kt
class FunImplNoCtor : Strategy { ... }                      // reported: no edge           expected: -> Strategy
// a/FunHolder.kt
class FunHolder(val strategy: Strategy)                     // reported: no edge           expected: -> Strategy
// b/FunImplOtherPackage.kt (import a.Strategy)
class FunImplOtherPackage(var flag: Boolean = false) : Strategy { ... }   // reported: no edge   expected: -> Strategy

// a/PlainImplWithCtor.kt, same shape with `interface Plain`
class PlainImplWithCtor(var flag: Boolean = false) : Plain { ... }        // reported: -> Plain   (ok)
```

```kotlin
// b/ObjectAsValue.kt (import a.Single, `object Single : Plain`)
fun single(): Plain = Single                                // reported: -> Plain only     expected: -> Single as well
// b/CompanionAsValue.kt (import a.Dialog, `class Dialog { companion object : Plain }`)
fun dialog(): Plain = Dialog                                // reported: -> Plain only     expected: -> Dialog as well
// b/ObjectAsArgument.kt
fun pass(): List<Any> = listOf(Single)                      // reported: no edge           expected: -> Single
```

- A `fun interface` is never a leaf, so nothing can point at it: same package or imported, as supertype or property
  type. The declaration extractor accepts `class_declaration` and `object_declaration` only; how tree-sitter-kotlin
  parses `fun interface` was not inspected, so the exact node is an assumption (it is evidently not a
  `class_declaration`). In `analysis/` this hid `NodeMaxAttributeMerger : NodeMergerStrategy` and the property
  `MutableNode.nodeMergingStrategy`; the only `NodeMergerStrategy` leaf in that run was the plain `interface` of the same
  name in `mergefilter`.
- An object or a companion referenced by its bare name as a value is not a used type, because only call and navigation
  expressions with an upper-case first child are collected (`Single.run(1)` resolves, `Single` alone does not). In
  `analysis/` this hid `GitLogParser.getDialog() = Dialog`. Not documented in the parser README, the docs page or
  `KNOWN_ISSUES.md`.

### False positives, cycles, upward edges
- False positives: none in the project and none in the probes.
- Cycles: 1 strongly connected component `{Creature, CreatureFacade, CreatureService, Creatures, ArmorClass, CreatureUtil}`;
  `isCyclic` on the same 10 edges as expected. The log's "8 cycles" counts declaration-level loops including
  `CreatureFacade <-> Builder` inside one file.
- Upward edges: `M/Creature.kt -> A/CreatureFacade.kt` and `M/ArmorClass.kt -> A/CreatureUtil.kt` flagged, as expected.
  `P/PersistedCreatures.kt -> A/CreatureFacade.kt` is not flagged because `adapter` is levelled above `application`
  (levels: `domain` 0, `application` 1, `adapter` 2; `scripts` 1 above `src` 0).
- Metrics: `outgoing_dependencies` counts declaration-level edges, not target files: `EncounterEdgeCases.kt` reports 6 for 5
  target files (`EncounterEdgeCases -> Creature` and `Resolvable -> Creature`), `CreatureFacade.kt` 9 for 8.

### Leaf kinds
`CreatureType`, `SpeedType` `enum`; `Fightable`, `Creatures`, `Resolvable` `interface`; `Roams` `annotation`; everything else
`class`, including `data class`, `value class` and `object CreatureUtil`. Right, except that `object` is not distinguishable.
Nested declarations are leaves keyed by their simple name (`Builder`, `Resolvable`) with the namespace of the file; the
enclosing class is not recorded. `InitiativeScript` (script, no `package`) has no namespace. Every leaf edge has
`usage: ["usage"]`; inheritance and instantiation are not told apart.

### What Kotlin offers and what CodeCharta resolves
Kotlin has packages, explicit imports (single, wildcard, aliased), fully qualified names without import, and packages that
need not match directories. The parser matches the simple names of used types against the imports plus the file's own
package. Same-package references without import, wildcard imports and nested-class imports work. There is no alias table,
no handling of dotted qualified types and no symbol other than classes and objects.

## Unified parser

Commands, all exit 0:

```
ccsh unifiedparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/unified.cc.json
ccsh unifiedparser -nc <scratch>/probes -o output/unified-probes-edgecases.cc.json   (each construct of EncounterEdgeCases as its own file)
ccsh unifiedparser -nc <scratch>/p2     -o output/unified-probes-extra.cc.json       (24 follow-up probes)
```

38 of 38 files analysed. **`.kts` is analysed** although the unified parser's README lists only `.kt`
(`shared/domain/Language.kt`: `KOTLIN(".kt", otherExtensions = setOf(".kts"))`): `scripts/RollInitiative.kts` reports
functions 1, logic 1, complexity 2, loc 13, rloc 10, comment_lines 1, all correct; `build.gradle.kts` reports complexity 3 and
0 functions (the three DSL lambdas), `settings.gradle.kts` complexity 0. My expectation "skipped" was wrong.
The test file is analysed like any other. The log shows the same `.gitignore` warning as above.

### EncounterResolver.kt

Correction of my own count: the expected table written before the run said `logic_complexity` 13 with 10 for `resolve`.
The listed items of `resolve` (`if`, `else if`, `for`, `if`, `&&`, `while`, three `when` branches, conditional expression,
`||`) are 11, not 10; I added them up wrongly. The corrected expected values are in their own column.

| metric | expected (before the run) | corrected | reported | verdict |
| --- | --- | --- | --- | --- |
| loc | 89 | | 89 | ok |
| rloc | 69 | | 69 | ok |
| comment_lines | 13 | | 13 | ok |
| logic_complexity | 13 | 14 | 15 | wrong: the `else ->` branch of `when` counts |
| complexity | 20 | 21 | 22 | wrong, same cause (15 + 6 functions + 1 lambda) |
| number_of_functions | 6 | | 7 | wrong: `val clamp = { ... }` in `safeRoll` counts as a function |
| max / min / mean / median parameters | 5 / 0 / 1.5 / 1 | | 5 / 0 / 1.6 / 1 | mean wrong: 5 entries, the nested `initiativeOf` has none |
| max / min / mean / median complexity | 11 / 1 / 3.33 / 1.5 | 12 / 1 / 3.5 / 1.5 | 12 / 0 / 3.4 / 2 | wrong: values are 12, 0, 3, 2, 0 (see below) |
| max / min / mean / median rloc | 26 / 1 / 8.17 / 5.5 | | 26 / 1 / 9.6 / 8 | max, min ok; mean, median over 5 entries (26, 3, 10, 8, 1) |
| long_method | 1 | | 1 | ok |
| long_parameter_list | 1 | | 1 | ok |
| message_chains | 1 | | 1 | ok |
| excessive_comments | 1 | | 1 | ok |

Per-function values, derived from probes of the single functions: the per-function complexity does not include the
function itself, so `describe` and `isEmpty` report 0 and the five values sum to 17 while the file reports 22. A nested
function, a lambda and a `val x = { }` inside a function add 1 to the enclosing function and get no entry of their own
(`MetricPerFunctionCalc` ignores function starts while it is inside a function). `resolve` reports 12 only because the
`else ->` (+1) and the missing own count (-1) cancel. The body-only rloc rule matches (26, 3, 10, 8, 1).

### EncounterEdgeCases.kt

File level: loc 366 ok, rloc 229 ok, comment_lines 75 ok, message_chains 1 ok, long_method 0 ok, long_parameter_list 0 ok,
excessive_comments 1 ok. `logic_complexity` expected 41, reported 48. `complexity` expected 111, reported 123.
`number_of_functions` expected 58, reported 60 (six counted that are not named functions, four named functions not counted).
Parameters max / min / mean / median expected 3 / 0 / 0.9 / 1, reported 3 / 0 / 0.88 / 1. Complexity per function expected
6 / 1 / 1.83 / 1, reported 5 / 0 / 1.05 / 1. rloc per function reported 8 / 0 / 2.23 / 1 (no expectation written).

Per construct, each run as its own file. Columns: logic / named functions / complexity / highest parameter count.

| construct | expected | reported | verdict |
| --- | --- | --- | --- |
| propertyAccessors (`get()` with `if`, `set(value)` with `if`) | 2 / 0 / 2 / - | 2 / 2 / 4 / 0 | getter and setter count as functions |
| initBlock (`init { if }`) | 1 / 0 / 1 / - | 1 / 0 / 2 / 0 | `init` adds 1 to complexity, not a function |
| secondaryConstructor (3 parameters, `if`) | 1 / 0 / 1 / - | 1 / 1 / 2 / 3 | counts as a function; its rloc and complexity per function are 0 |
| whenWithSubject (3 branches + `else`) | 3 / 1 / 4 / 1 | 4 / 1 / 5 / 1 | wrong: `else ->` counted |
| whenMultipleConditions (`1, 2, 3 ->` + `else`) | 1 / 1 / 2 / 1 | 2 / 1 / 3 / 1 | wrong: `else ->` counted; the three conditions count once |
| whenRanges (`in`, `!in`, `else`) | 2 / 1 / 3 / 1 | 3 / 1 / 4 / 1 | wrong: `else ->` counted |
| whenIs (`is` twice, `else`) | 2 / 1 / 3 / 1 | 3 / 1 / 4 / 1 | wrong: `else ->` counted |
| whenWithoutSubject (2 branches, one `&&`, `else`) | 3 / 1 / 4 / 2 | 4 / 1 / 5 / 2 | wrong: `else ->` counted |
| whenExhaustive (5 enum branches, no `else`) | 5 / 1 / 6 / 1 | 5 / 1 / 6 / 1 | ok |
| ifExpression | 1 / 1 / 2 / 1 | 1 / 1 / 2 / 1 | ok |
| ifElseIfExpression | 2 / 1 / 3 / 1 | 2 / 1 / 3 / 1 | ok |
| elvisOperator (`name ?: "nameless"`) | 0 / 1 / 1 / 1 | 1 / 1 / 2 / 1 | `?:` counts (by design, not in the README rule) |
| elvisWithReturn (`?: return 0`) | 0 / 1 / 1 / 1 | 1 / 1 / 2 / 1 | same |
| safeCall (`?.`) | 0 / 1 / 1 / 1 | 0 / 1 / 1 / 1 | ok |
| notNullAssertion (`!!`) | 0 / 1 / 1 / 1 | 0 / 1 / 1 / 1 | ok |
| safeCallLet (`?.let { }`) | 0 / 1 / 2 / 1 | 0 / 1 / 2 / 1 | ok |
| doWhile | 1 / 1 / 2 / 1 | 1 / 1 / 2 / 1 | ok |
| repeatLambda (`repeat(times) { }`) | 0 / 1 / 2 / 1 | 0 / 1 / 2 / 1 | ok (a lambda, not a loop) |
| forEachLambda | 0 / 1 / 2 / 1 | 0 / 1 / 2 / 1 | ok |
| trailingLambda (`fold(0) { sum, creature -> }`) | 0 / 1 / 2 / 1 | 0 / 1 / 2 / 1 | ok, lambda parameters are not counted as parameters |
| anonymousFunction (`val double = fun(value: Int): Int { }`) | 0 / 1 / 2 / 1 | 0 / 2 / 2 / 1 | wrong: counted as a named function |
| scopeFunctionChain (`.let{}.also{}.run{}.takeIf{}`) | 0 / 1 / 5 / 1 | 0 / 1 / 5 / 1 | ok, message_chains 1 |
| expressionBody | 0 / 1 / 1 / 1 | 0 / 1 / 1 / 1 | ok |
| defaultParameters | 0 / 1 / 1 / 3 | 0 / 1 / 1 / 3 | ok |
| varargParameters | 0 / 1 / 1 / 1 | 0 / 1 / 1 / 1 | ok |
| functionTypeParameter | 0 / 1 / 1 / 2 | 0 / 1 / 1 / 2 | ok |
| localFunction (`clamp` with `if` inside) | 1 / 2 / 3 / 1 | 1 / 2 / 3 / 1 | ok at file level; one per-function entry with complexity 2 and rloc 5 |
| suspendFunction | 0 / 1 / 1 / 1 | 0 / 1 / 1 / 1 | ok |
| operatorFunction (`operator fun plus`) | 0 / 1 / 1 / 1 | 0 / 1 / 1 / 1 | ok |
| infixFunction | 0 / 1 / 1 / 1 | 0 / 1 / 1 / 1 | ok |
| labelledReturn (`forEach loop@{ if (..) return@loop }`) | 1 / 1 / 3 / 1 | 1 / 1 / 3 / 1 | ok |
| labelledBreak (`outer@ for`, `for`, `if`, `break@outer`) | 3 / 1 / 4 / 1 | 3 / 1 / 4 / 1 | ok |
| forWithStep (`20 downTo 1 step 2`) | 1 / 1 / 2 / 0 | 1 / 1 / 2 / 0 | ok |
| tryExpression | 1 / 1 / 2 / 1 | 1 / 1 / 2 / 1 | ok |
| multipleCatch | 2 / 1 / 3 / 1 | 2 / 1 / 3 / 1 | ok |
| stringTemplate (`"${if (..) "high" else "low"}"`) | 1 / 1 / 2 / 1 | 1 / 1 / 2 / 1 | ok |
| rawString (`"""` holding `//` and `/* */`) | 0 / 1 / 1 / 0 | 0 / 1 / 1 / 0 | ok, 0 comment lines, 5 rloc in the body |
| commentMarkersInStrings | 0 / 1 / 1 / 0 | 0 / 1 / 1 / 0 | ok, 1 comment line (the trailing one) |
| infixBooleanFunctions (`and` / `or`) | 0 / 1 / 1 / 2 | 0 / 1 / 1 / 2 | ok (not counted, as the rule says) |
| booleanOperators (`&&`, `\|\|`) | 2 / 1 / 3 / 3 | 2 / 1 / 3 / 3 | ok |
| castOnly, callTypeArgument, localVariableType, genericReturnType | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| lambdaParameterType (`val reader = { roll: DiceRoll -> }`) | 0 / 1 / 2 / 0 | 0 / 2 / 2 / 0 | wrong: the lambda property counts as a function |
| genericBound (`fun <T> strongest(..): T? where T : Fightable = ..`) | 0 / 1 / 1 / 1 | 0 / 0 / 1 / 0 | missing: not a function, no parameters |
| annotatedFunction, deprecatedFunction | 0 / 1 / 1 / 0 | 0 / 1 / 1 / 0 | ok |
| objectExpression (`object : Comparator<Creature> { override fun compare(first, second) }`) | 0 / 2 / 2 / 2 | 0 / 2 / 2 / 0 | functions ok; the 2 parameters of `compare` are lost |
| inlineReified (`inline fun <reified T> countOf(..): Int = ..`) | 0 / 1 / 2 / 1 | 0 / 0 / 2 / 0 | missing: not a function, no parameters |
| tailRecursion | 1 / 1 / 2 / 1 | 1 / 1 / 2 / 1 | ok |
| backtickedName | 0 / 1 / 1 / 0 | 0 / 1 / 1 / 0 | ok |
| kDocTags | 0 / 1 / 1 / 1 | 0 / 1 / 1 / 1 | ok, 6 comment lines |
| nestedComment (`/* /* */ */`) | 0 / 1 / 1 / 0 | 0 / 1 / 1 / 0 | ok, 4 comment lines, 1 rloc in the body |
| companionFunction | 0 / 1 / 1 / 0 | 0 / 1 / 1 / 0 | ok |
| interfaceFunctions (one without body, one with) | 0 / 2 / 2 / 1 | 0 / 1 / 2 / 0 | missing: the function without body is in complexity, not in number_of_functions |
| extensionFunction (`fun Creature.isBloodied(): Boolean = ..`) | 0 / 1 / 1 / 0 | 0 / 0 / 1 / 0 | missing: not a function |
| extensionProperty (`val Creature.isFlying get() = .. && ..`) | 1 / 0 / 1 / - | 1 / 1 / 2 / 0 | getter counts as a function |
| whenGuard (`is Creature if roll > 10 ->`, `is Creature ->`, `else ->`) | 3 / 1 / 4 / 2 | 3 / 1 / 4 / 2 | equal by coincidence: `else ->` +1, guard `if` not counted (probe without `else`: 2) |

40 of 59 constructs as expected (the four listed in one row counted singly, `whenGuard` not counted as ok).

Why functions are missed (`KotlinMetricMapping.kt`): a `function_declaration` counts as a function only when its
`function_body` is the last of 4 to 7 children. Follow-up probes: `fun <T> first(items: List<T>): T = ..` counted (7
children); `private fun <T> first(..): T = ..` not counted (8); `fun String.show() { }` counted; `fun String.shout(): String
{ }` not counted (receiver + return type = 8); `where` clause not counted; a declaration without body never. All of them
still add 1 to `complexity`. In the old files this hits `application/CreatureDtoMapper.kt` (`fun Creature.toDto(): ...`,
functions 0, complexity 1), `domain/service/Ports.kt` (functions 0, complexity 2), `domain/model/Fightable.kt` (0 / 1) and
`adapter/persistence/Repository.kt` (`abstract fun keyOf`, functions 3, complexity 4).

### Line counting
- loc, rloc and comment_lines are exact in all four new files (`Zentaurenhöhle.kt`: 8 / 5 / 1, 1 function, complexity 1, as
  expected).
- Comment markers inside a raw string, a normal string and a char literal are not counted as comments; a trailing comment
  counts for both rloc and comment_lines; nested block comments and KDoc are counted line by line.
- rloc per function is body-only. A function whose expression body is a single identifier reports 0:
  `fun kDocTags(roll: Int): Int = roll`, `suspend fun suspendFunction(roll: Int): Int = roll`, `fun annotatedFunction(): Int =
  seed`, while `= roll * 2` reports 1. That is why `min_rloc_per_function` of `EncounterEdgeCases.kt` is 0.

### Other files
- `domain/model/Dice.kt` functions 3, `ArmorClass.kt` 1, `Centaur.kt` 1: the `get()` of a property counts as a function.
- `adapter/persistence/CreatureEntity.kt`, `Centaur.kt`, `CreatureUtil.kt`, `DiceInspector.kt`: logic 1 from one `?:` each.
- `application/CreatureFacade.kt`: functions 4, parameters max 8, long_parameter_list 1, long_method 1 (12 body lines),
  complexity 6 (4 functions + 2 lambdas). Correct.
- Per-function complexity is 0 for every function without a branch, in all files.

## Domain language parser

Commands:

```
ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json                    exit 0
... --stop-word-level MINIMAL / AGGRESSIVE, --exclude-tests, --no-technical-stopwords, --ngrams 2            exit 0
... --comment-weight 0   exit 1: IllegalArgumentException: --comment-weight must be positive, got 0
... --string-weight 0    exit 1: IllegalArgumentException: --string-weight must be positive, got 0
```

38 files processed, including the three `.kts`. **The domain lens holds 38 nodes, all of them files; there is no folder
node and no root node**, so "the root node's word list" does not exist. The numbers called "project" below are my own sum
over the file nodes (318 distinct words). Each word carries `frequency` and `tfidf`.

### Expected words
All 17 appear (project sum / number of files): creature 138 / 20, roll 102 / 5, speed 56 / 11, hit 31 / 7, armor 25 / 6,
initiative 22 / 5, points 22 / 5, dice 20 / 5, centaur 19 / 6, damage 18 / 2, encounter 15 / 3, stable 11 / 4, dungeon 6 / 4,
hoard 6 / 1, treasure 5 / 1, cellar 4 / 3, lair 3 / 2.

Expected words of the new files: `EncounterResolver.kt` has all 19 (encounter 5, resolver 3, attacker 5, defender 5, roll 12,
bonus 5, terrain 5, damage 10, armor 5, creature 8, dungeon 2, initiative 6, dice 3, critical 8, swamp 1, cave 1, hill 1,
lair 1, speed 6). `EncounterEdgeCases.kt` has morale 6, seed 11, encounter 8, edge 6, roll 72, creature 23, centaur 6,
initiative 3. `RollInitiative.kts` has wandering 2, centaur 2, initiative 8, script 3, dice 3, bonus 3.

### Keyword and technical-word leakage
- Kotlin keywords: none. `suspend`, `infix`, `operator`, `tailrec`, `inline`, `reified`, `vararg`, `init`, `constructor`,
  `companion`, `where`, `val`, `when`, `class`, `object`, `override` are absent, also where they stand in a comment
  (`suspendFunction: suspend modifier` leaves only `modifier`). Side effect, unchanged: `XPValue` yields `xp` only, `value` is
  dropped. KDoc tags `@param`, `@return`, `@property`, `@constructor` leave no word.
- Called library names (`println`, `trim`, `lowercase`, `uppercase`, `ordinal`, `toString`) do not appear, because usages are
  not counted at all (see weights).
- Filtered at MODERATE: `util`, `exception`, `service`, `test`, `save`, `find`, `create`, `default`, `base`, `builder`,
  `controller`, `name`, `temporary`.
- Leaking at MODERATE: type 71, id 35, entity 12, logger 9, repository 9, key 9, item 9, dto 6, facade 6, standard 6, store 3,
  mockk 2, assert 2; from the new files function 63, lambda 34, comment 29, expression 29, call 21, parameter 20, string 18,
  boolean 10 (all out of function names and their one-line KDoc in `EncounterEdgeCases.kt`). `repository`, `entity`, `dto`,
  `logger`, `facade` pass while `util`, `service`, `controller` do not.
- English function and number words are not stop words: one 75, two 16, all 11, other 10, three 10, per 8, every 5, such 4,
  never 4, five 4, before 2, between 2, how 2, much 2, through 2, always 2, twenty 2.
- Commented-out code is read as prose: `// val ceiling = minOf(floor, 99)` in `EncounterResolver.kt` gives ceiling 2 and
  min 2.
- A number as a word: `20` 3, from `rollD20` in `Dice.kt`.
- Levels (distinct words over all files): MINIMAL 327 (adds base, builder, controller, create, default, exception, find,
  save, service), MODERATE 318, AGGRESSIVE 303 (removes argument, call, dto, entity, facade, function, logger, method,
  parameter, parameters, repository, run, template, type, visitor). `--no-technical-stopwords` 330 (MINIMAL plus name,
  temporary, util).
- `.kts` noise: `build.gradle.kts` gives mockk 2, api 1, jvm 1, org 1, sots 1; `settings.gradle.kts` cellars 1, centaurs 1.

### Identifier splitting

| form | identifier | words found | verdict |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | walking, speed | ok |
| snake_case | `walking_speed` (test) | walking, speed | ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS`, `FAST_FEET_PER_ROUND` | max, hit, points; fast, feet, per, round | ok |
| PascalCase | `ArmorClass` | armor (`class` dropped as keyword) | ok |
| Acronym | `XPValue` | xp (`value` dropped) | `value` lost |
| Digit | `d20Roll` | d20, roll | ok |
| Digit | `rollD20` | roll, 20 | wrong: same token split differently by position, bare number as a word |
| Kebab in string | `"centaur-stable"` | centaur 1, stable 1 | ok |
| Test idiom | `should_save_creature_to_the_stable` | creature, stable | ok |
| Backticked | `` `should roll initiative for every centaur` `` | roll, initiative, every, centaur, 3 each | ok, `should` and `for` dropped |
| Backticked, German | `` `zählt die bewohner` `` | zählt, die, bewohner, 3 each | words intact, `die` leaks |
| Unicode | `Zentaurenhöhle`, `rüstungsklasse`, `höhle` | zentaurenhöhle, rüstungsklasse, höhle | ok |

### Comments and strings
- Weights visible in the counts: a declared identifier 3, a comment word 2, a string word 1. A usage counts 0:
  `EncounterResolver.kt` has creature 8 = two parameters named `creature` (3 + 3) + one comment (2), although `creature` and
  `Creature` are used many more times; in `EncounterEdgeCases.kt` `fightable` 2, `roams` 2 and `dice` 2 come from the KDoc
  sentences only, not from the import or the usage.
- Planted sentences: `Creature.kt` cellar 2, centaurs 2, beasts 2, dragons 2; `HitPoints.kt` damage 8 (3 + 3 + 2), lair 2,
  recover 2; `CreatureFacade.kt` initiative 2, dungeon 2, encounter 2; `CreatureUtil.kt` treasure 5, hoard 6;
  `NoSuchCreatureException.kt` such 4, dungeon 1; `"centaur-stable"` centaur 1. All counted.
- Raw string in `rawString`: its text is read as a string (either 1, cellar 1, http 1), not as a comment. The string argument
  of `@Deprecated("Use the encounter resolver instead")` is read too (use 1, instead 1, resolver 1).
- `--comment-weight 0` and `--string-weight 0` are rejected, so comments or strings cannot be switched off.
- No stemming: creature / creatures, roll / rolls, centaur / centaurs, parameter / parameters stay separate.
- `--ngrams 2`: 80 bigrams, e.g. `hit points` 18, `walking speed` 12, `treasure hoard` 3, `zählt die` 3; `armor class` cannot
  form because `class` is dropped.

### Test file handling
`CreatureServiceTest.kt` is included by default (creature 12, creatures 3, speed 3, stable 3, walking 3, xp 3, assert 2,
centaur 1). `--exclude-tests` drops it: 37 nodes, the project loses `xp` and `assert`.

### German words
`Zentaurenhöhle.kt` reports: bewohner 6, die 5, beschreibung 3, hle 3, rüstungsklasse 3, zentaurenhöhle 3, zählt 3, dem 2,
geh 2, jeder 2, kreatur 2, liegt 2, ren 2, stungsklasse 2, trefferpunkte 2, und 2, unter 2, verlies 2, zentaurenh 2, der 1.

| word | found | where it comes from |
| --- | --- | --- |
| zentaurenhöhle | 3 | the class name only; the comment occurrence is cut into `zentaurenh` 2 + `hle` |
| rüstungsklasse | 3 | the property name only; the comment occurrence becomes `stungsklasse` 2 |
| verlies | 2 | comment |
| trefferpunkte | 2 | comment |
| kreatur | 2 | comment |
| größe | no | the string `Größe der Höhle` yields only `der` 1 and `hle` 1 |
| höhle | not in this file | appears as höhle 3 in `EncounterEdgeCases.kt`, from the parameter name `höhle` |

Five of seven in the file, six of seven in the project, `größe` nowhere. Identifiers keep their umlauts; **comments and
strings are cut at every umlaut and at `ß`**, which produces the fragments `zentaurenh`, `hle`, `stungsklasse`, `geh`, `ren`
(from `gehören`). The German stop words `die` 5, `dem` 2, `jeder` 2, `und` 2, `unter` 2, `der` 1 all leak; `zu` is absent.

With the POSIX locale of the sandbox (`sun.jnu.encoding = ANSI_X3.4-1968`) **all three parsers drop `Zentaurenhöhle.kt`
without a message**: unified 37 files instead of 38, dependency 55 file edges instead of 57, domain 37 nodes and 19 words
fewer; every other file is unchanged (`output/*-posix-locale.cc.json`). With `LC_ALL=C.utf8` the file is handled by all
three. This is the JVM's file-name decoding, not the parsers' logic, but nothing in the output tells that a file is missing.

## Changed since 2026-09-06
- Domain lens: the earlier report counted 45 nodes and read the words "at the root" (95, then 111 distinct words). Now
  the lens has file nodes only (38) and no root or folder word list. Words now carry `tfidf`.
- Domain weights: the earlier report listed "an identifier usage 1". The output shows 0 for usages; declaration 3,
  comment 2, string 1 still hold.
- Domain AGGRESSIVE now also removes argument, call, function, method, parameter, parameters, run, template, visitor
  (earlier: type, repository, entity, logger, dto, facade).
- Dependency leaf kinds are lower-case (`class`, `interface`, `enum`, `annotation`; earlier `CLASS`, ...). The nested class is
  the leaf `Builder`; the earlier report showed it as `application.CreatureFacade.Builder` with its parent path.
- `.kts`: the earlier report said scripts yield no declarations. Still true for the two build scripts; a script holding a
  class (`scripts/RollInitiative.kts`, new) gets a node, a leaf and its edge.
- Unchanged, re-verified: all 46 file edges of the old files with the same `isCyclic` / `isPointingUpwards` flags, the same
  16 missing edges (alias import, fully qualified references, call type argument, top-level function and constant,
  typealias, `is`, `::class`, function type, delegated supertype, function imports, the two files without a node), no false
  positive, 1 component and "8 cycles", the same levels; in the domain parser the 17 words, no keyword leak, `value` lost
  from `XPValue`, `rollD20` -> `roll` + `20`, the leak of `repository` / `entity` / `dto` / `logger` / `facade`, the unlisted
  English function words, the rejected weight 0, test handling.
- Not re-run: the `HTTPServer` probe of the earlier identifier table.
- New on the old files (the earlier report had no unified section): see "Other files" above.

## Verdict

### Unified parser
- Missing: functions with more than seven syntax children are not counted in `number_of_functions`, though they add to
  `complexity`: extension functions with a return type (`fun Creature.isBloodied(): Boolean`, `EncounterEdgeCases.kt`;
  `fun Creature.toDto(): ...`, `CreatureDtoMapper.kt`), generic functions with a modifier or a `where` clause
  (`inline fun <reified T> countOf`, `fun <T> strongest ... where T : Fightable`). Their parameters and rloc are lost too. **Decision: accept.**
- Missing: functions without a body (`Resolvable.resolveAll`, `Creatures.save` / `find` in `Ports.kt`, `Fightable.attack`,
  `abstract fun keyOf` in `Repository.kt`) are in `complexity` but not in `number_of_functions`. **Decision: ignore — works as documented.**
- Missing: nested functions and object-expression methods get no per-function entry; the parameters of
  `objectExpression`'s `compare(first, second)` and of `initiativeOf(creature)` are not counted, and mean / median are
  computed over fewer functions than `number_of_functions`. **Decision: accept (derived from Java).**
- Wrong: the `else ->` branch of every `when` counts as a decision (`EncounterResolver.resolve`, `whenWithSubject`,
  `whenMultipleConditions`, `whenRanges`, `whenIs`, `whenWithoutSubject`, `whenGuard`), +1 per `when`. **Decision: ignore (derived from Java).**
- Wrong: `val clamp = { ... }` (`EncounterResolver.safeRoll`), `val reader = { roll: DiceRoll -> ... }` and
  `val double = fun(value: Int): Int { ... }` count as named functions; property getters and setters and the secondary
  constructor count as functions as well. **Decisions derived from Java: accept — a lambda counts as a function only when assigned to a variable.** **Decision: accessors and secondary constructors counting as functions is documented, ignore; accept — the secondary constructor body is measured as empty.**
- Wrong: per-function complexity leaves out the function itself, so a function without branches reports 0
  (`describe`, `isEmpty`) and the per-function values do not add up to `complexity`. **Decision: ignore (derived from Java).**
- Wrong: rloc per function is 0 for an expression body that is a single identifier (`fun kDocTags(roll: Int): Int = roll`). **Decision: accept.**
- Wrong: a guard condition on a `when` branch (`is Creature if roll > 10 ->`, `whenGuard`) adds nothing. **Decision: accept (derived from Java).**
- Bad: `?:` counts as a decision while `?.` and `!!` do not; defensible, but it is not in the README's counting rule and
  raises `logic_complexity` of plain data classes (`CreatureEntity.kt`). **Decision: ignore — documented.**
- Bad: `.kts` files are analysed although the README lists only `.kt`; Gradle build scripts get a complexity from their DSL
  lambdas (`build.gradle.kts` 3). **Decision: accept — the parser README should list `.kts`; build scripts being measured is fine.**
- Bad: the `.gitignore` is searched in the scanned folder only (warning in every run); whether an ignored file in a
  sub-folder scan is analysed was not tested. **Decision: ignore.**
- Good: loc, rloc and comment_lines are exact in every checked file, including raw strings with `//` and `/* */`, a char
  `'/'`, nested block comments, KDoc and a trailing comment. `if` as expression, `else if`, `for`, `while`, `do while`,
  labelled `break` / `return`, `try` as expression, several `catch`, `&&` / `||`, an `if` inside a string template, lambdas
  (trailing, `forEach`, scope-function chain), default / vararg / function-type parameters, `suspend`, `operator`, `infix`,
  `tailrec`, backticked names, `message_chains`, `long_method`, `long_parameter_list`, `excessive_comments` are all as
  expected.

### Dependency parser
- Missing: 22 of 79 expected file edges (23 of 85 with tests). Six are new in round 3, all in `EncounterEdgeCases.kt`: the
  parameter type of a secondary constructor (`höhle: Zentaurenhöhle`), `catch (missing: NoSuchCreatureException)`,
  `candidate as? Centaur`, `emptyList<CreatureId>()`, the lambda parameter type `{ roll: DiceRoll -> }`,
  `where T : Fightable`. Probes add: type-parameter bounds `<T : Target>` and extension receivers inside a class. **Decision: accept (derived from Java).**
- Missing, unchanged: aliased import (`CreatureRepository.kt`), fully qualified references (`CreatureService.kt`,
  `CreatureFacade.kt`, so `application/dto/Creature.kt` has 0 incoming), `is Centaur` (`CentaurDetector.kt`), `Dice::class`
  (`DiceInspector.kt`), `(Speed) -> Unit` (`SpeedVisitor.kt`), the delegated supertype `: Creatures by ...`
  (`AuditedCreatures.kt`), `mockk<Creatures>()` (test), every use of a top-level function, constant or typealias
  (`rollD20`, `DEFAULT_DIE_SIDES`, `toDto`, `Entity`). **Decision: accept (derived from Java).**
- Missing: files without a class or object have no node (`Entity.kt`, `CreatureDtoMapper.kt`, the two Gradle scripts), so
  their own dependencies vanish as well. **Decision: accept (derived from Java).**
- Missing (round 4): a `fun interface` is no leaf, so every edge into it is lost, also as supertype and property type
  (probe `a/Strategy.kt`; in `analysis/` `NodeMaxAttributeMerger : NodeMergerStrategy`). **Decision: accept.**
- Missing (round 4): an object or companion used by its bare name as a value gives no edge (`fun single(): Plain = Single`,
  `listOf(Single)`; in `analysis/` `getDialog() = Dialog`), while a member access `Single.run(1)` does. **Decision: accept.**
- Wrong: nothing; no reported edge is false, no edge points to the wrong `Creature`.
- Bad: nested declarations are leaves under their simple name without the enclosing class (`Builder`, `Resolvable`);
  `object` is kind `class`; every leaf edge has the usage `usage`; `outgoing_dependencies` counts declaration-level edges
  (`EncounterEdgeCases.kt` 6 for 5 files); the log's "8 cycles" for one component. **Decisions derived from Java: accept — nested declarations exported without their enclosing class, dependency counts per declaration.** **Decision: `object` as `class`, the single usage kind and the declaration-level cycle count are documented, ignore.**
- Good: plain and wildcard imports, same-package references, inheritance, interface implementation, generic base class and
  nested generic arguments, nullable types, local value types, `vararg`, annotations on classes and functions, companion
  and enum-constant access, constructor calls, object expressions, nested-class import, unicode class names and file names
  (under a UTF-8 locale), a `.kts` script with a class, test exclusion by default, cyclic and upward flags.

### Domain language parser
- Missing: no root or folder node in the lens; the 17 expected words can only be confirmed by summing the file nodes. **Decision: ignore (derived from Java).**
- Missing: `größe` (string `Größe der Höhle`, `Zentaurenhöhle.kt`) never appears; no German stop words; no way to turn
  comments or strings off (weight 0 rejected); usages of identifiers are not counted. **Decisions derived from Java: accept — `größe` lost at the umlaut, a weight of 0 is rejected; ignore — German stop words.** **Decision: usages not counted, ignore — every language counts declarations only.**
- Wrong: words in comments and strings are cut at umlauts and `ß` (`zentaurenh`, `hle`, `stungsklasse`, `geh`, `ren` in
  `Zentaurenhöhle.kt`), while the same words as identifiers stay whole, so one word shows up under two or three spellings. **Decision: accept (derived from Java).**
- Wrong: `rollD20` -> `roll` + `20` while `d20Roll` -> `d20` + `roll` (`Dice.kt`); `XPValue` loses `value`
  (`CreatureServiceTest.kt`). **Decisions derived from Java: ignore — bare `20`.** **Decision: `XPValue` losing `value`, ignore.**
- Bad: `die` 5, `dem`, `jeder`, `und`, `unter`, `der` leak from the German comment; English function and number words leak
  (`one` 75, `two`, `all`, `other`, `per`, `every`, `such`); `repository`, `entity`, `dto`, `logger`, `facade` pass MODERATE
  while `util`, `service`, `controller` do not; commented-out code is read as prose (`ceiling`, `min` in
  `EncounterResolver.kt`); Gradle scripts add `mockk`, `api`, `jvm`, `org`, `sots`. **Decisions derived from Java: ignore — German stop words, technical words, commented-out code.** **Decision: English function words and Gradle script words, ignore.**
- Good: all 17 expected words and every expected word of the new files; no Kotlin keyword leaks, also not from comments;
  camelCase, snake_case, SCREAMING_SNAKE, acronym, kebab-in-string and backticked names split correctly; unicode
  identifiers stay whole; raw strings and annotation arguments are read as strings; weights 3 / 2 / 1 are consistent; the
  test file is included by default and removed with `--exclude-tests`; `.kts` files are analysed.

### All three
- Bad: under a POSIX locale `Zentaurenhöhle.kt` is skipped silently by all three parsers, with exit 0 and no warning. **Decision: accept (derived from Java).**
