# Java

Round 3, 2026-10-08. The expected values below were fixed before the parsers ran. Where my own count was wrong it is marked "my miscount".

## Project
- Layout: `src/main/java/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,adapter/cli,application,application/dto}`, `src/main/java/module-info.java`, `src/test/java/.../domain/service/CreatureServiceTest.java`. 34 `.java` files (33 main + 1 test).
- Round 3 adds `domain/service/EncounterResolver.java`, `domain/service/EncounterEdgeCases.java` and `domain/model/Zentaurenhöhle.java` (NFC file name, field `rüstungsklasse`). No older file was changed.
- Stress constructs from rounds 1 and 2 are unchanged: wildcard import, static import, fully qualified references, inheritance, interfaces, generic base, annotation-only use, same simple name in two packages, unused import, stdlib and third-party use, two declarations in one file, file name different from declaration, records, enums, nested class, `module-info.java`, method and constructor references, `instanceof`, array type, anonymous subclass, Javadoc `{@link}`.
- `EncounterResolver`: Java has no nested named function; `initiativeOrder` holds a local class `Ranking` with a method `rank` as the closest idiom. That makes 6 methods instead of the 5 of the README table.
- `EncounterEdgeCases` holds: static and instance initializer, two constructors, enhanced and classic `for`, `do … while`, old `switch` with fallthrough, arrow `switch` expression with `yield`, colon-form `switch` expression, pattern `switch` with a `when` guard and `case null`, `instanceof` type and record patterns, multi-catch, try-with-resources with `throws`, expression lambda, block lambda, method references, a 7-call stream chain, anonymous class, varargs, generic bound with nested generics and an annotated `final` parameter, receiver parameter, labelled `break` / `continue`, nested ternary, `&&` / `||` without `if`, bitwise operators, `assert`, text block holding `//` and `/* */`, comment markers in strings, Javadoc / block / line / inline / trailing comments, `///` Markdown doc comment, cast, class literal, wildcard bound, umlaut identifiers, a record with a compact constructor, an interface with abstract, default and static methods, an enum with constant-specific bodies and an abstract method.
- Not applicable in Java: import alias, barrel / re-export, free function, null-coalescing and optional chaining, `unless` / `until`, `guard` / `defer`, `goto`, exception filters, preprocessor, operator overloads, extension functions, generators, `async` / `await`, default parameters, nested comments.
- Extension variants: none. All three parsers list only `.java` for Java.
- Locale: with `LC_CTYPE=POSIX` all three parsers skip `Zentaurenhöhle.java` without a message (33 instead of 34 files). The results below are from runs with `LC_ALL=C.UTF-8`; the POSIX runs are kept as `output/*-posix-locale.cc.json`.

## Dependency parser
- Commands, both exit 0:
  - `ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json`: 32 files, 38 leaves, 53 file edges, 61 leaf edges, 9 cycles in one strongly connected component.
  - `... --include-tests -o output/dependency-with-tests.cc.json`: 33 files, 39 leaves, 58 file edges, 66 leaf edges.
- Expected 70 file edges without tests (54 from rounds 1 and 2 + 16 new) and 75 with tests. Found 53 and 58, 0 extra.
- Old files: 45 of 54, exactly the edges and the 9 misses of 2026-09-06.

Round 3, expected before the run:

| Construct | Expected edge | Found | Verdict |
| --- | --- | --- | --- |
| Parameter type, `List<Creature>` (`EncounterResolver`) | `EncounterResolver -> Creature` | yes, x2 | ok |
| Parameter type `Dice` (`EncounterResolver.safeRoll`) | `EncounterResolver -> Dice` | yes | ok |
| Enhanced-`for` variable type `for (Speed speed : …)` | `EncounterResolver -> Speed` | no | missing |
| Parameter types (`EncounterEdgeCases`) | `-> Creature`, `-> CreatureType` | yes | ok |
| `throws NoSuchCreatureException` | `-> NoSuchCreatureException` | yes | ok |
| Static call in a lambda body `() -> Dice.rollD20()` | `-> Dice` | yes | ok |
| Parameter type with non-ASCII name `Zentaurenhöhle höhle` | `-> Zentaurenhöhle.java` | yes (UTF-8 locale only) | ok |
| Field, parameter and return type, same package | `Zentaurenhöhle.java -> ArmorClass` | yes | ok |
| Switch type pattern `case Centaur mare when …` | `-> Centaur` | no | missing |
| Record pattern `instanceof CreatureId(var basilisk)` | `-> CreatureId` | no | missing |
| Generic bound `<T extends Fightable>` | `-> Fightable` | no | missing |
| Method reference `HitPoints::getCurrent` | `-> HitPoints` | no | missing |
| Cast `(ArmorClass) target` | `-> ArmorClass` | no | missing |
| Class literal `Speed.class` | `-> Speed` | no | missing |
| Wildcard bound `List<? extends SpeedType>` | `-> SpeedType` | no | missing |

Rounds 1 and 2, re-verified against the fresh output:

| Construct | Found | Verdict |
| --- | --- | --- |
| Wildcard import, plain fully qualified `Speed`, same-package references, inheritance, interfaces, generic base, type position, `new`, static member, annotation-only, anonymous subclass, types in generic arguments | all edges present | ok |
| `CreatureFacade`: fully qualified `application.dto.Creature` | resolves to `domain/model/Creature`; `dto/Creature` has 0 incoming | wrong |
| `CreatureFacade`: `import static …Dice.rollD20`; `InitiativeOrder`: `import static …Dice.*` | no edge | missing |
| `EncounterCommand`: `import …CreatureFacade.Builder` + `new Builder()` | no edge, 0 outgoing | missing |
| `CreatureFactories`: `Dice::rollD20`, `Centaur::new` | no edge | missing |
| `CreatureInspector`: `creature instanceof Centaur`, `Speed[]` parameter | no edge, 0 outgoing | missing |
| Unused import `Fightable`, Javadoc `{@link Creature}`, stdlib and third-party types | no edge | ok |
| Test file | absent by default; five edges with `--include-tests` | ok |

- Which usages produce an edge (`UsedTypeExtractor.kt`): field type, local variable type, annotation, `new`, method call or field access on a capitalised name, `extends` / `implements`, `throws`, parameter and return types. Nothing else does. A scratch experiment confirms no edge for a catch parameter type, a typed lambda parameter, `instanceof`, an array parameter and the enhanced-`for` variable, and an edge for a local variable type.
- False positives: none.
- Cycles: 12 edges flagged `isCyclic`, one strongly connected component, as before. The new files add none, as expected.
- Upward edges: `ArmorClass -> CreatureUtil` and `Creature -> CreatureFacade`, as before. `PersistedCreatures -> CreatureFacade` is not flagged because `adapter` is level 2 and `application` level 1.
- Levels: `adapter` 2, `application` 1, `domain` 0, `domain/service` 1, `domain/model` 0; `Zentaurenhöhle.java` 1.
- Leaf kinds: `class`, `interface`, `enum`, `annotation`, in lower case. Records (`CreatureId`, `DiceRoll`, `XPValue`, `dto.Creature`, `Ambush`) are `class`. `Scout` is `interface`, `Mood` is `enum`.
- Nested and local types become top-level leaves of the package: `Ambush`, `Scout`, `Mood`, `Builder`, and the local class `Ranking` as `de.sots.cellarsandcentaurs.domain.service.Ranking`. Because `Ranking` is its own leaf, `EncounterResolver -> Creature` counts x2 and `outgoing_dependencies` is 3 for 2 file edges.
- `module-info.java` is not in the dependency tree (32 nodes for 33 main files).
- Native versus resolved: Java gives packages and explicit imports, so single-type imports and same-package names resolve. CodeCharta has to resolve static imports, qualified names, nested-class imports and every usage form inside expressions itself; that is where the misses are.

## Unified parser
- Command: `ccsh unifiedparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/unified.cc.json`, exit 0, 34 of 34 files analysed, including `module-info.java` (rloc 6, no functions) and the test file.
- It prints `No .gitignore found at root level, excluding common build folders as fallback`: the repository's `.gitignore` is not consulted when the project is a subfolder.
- Conventions of the hand count where the README rule is open:
  - rloc of a function = code lines strictly between signature line and closing brace.
  - A lambda's +1 and its branches belong to the enclosing method.
  - A method of a local or anonymous class is a function of its own.
  - Abstract methods are no functions; constructors and compact constructors are.
  - `when` guard +0, `case A, B ->` one case, `default` +0.
  - Initializer blocks are no functions.

`EncounterResolver` (6 methods: `resolve`, `describe`, `safeRoll`, `initiativeOrder`, `Ranking.rank`, `isEmpty`):

| Metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| loc | 94 | 94 | ok |
| rloc | 74 | 74 | ok |
| comment_lines | 13 | 13 | ok |
| logic_complexity | 14 | 15 | wrong: `default:` counts (`switch_label`) |
| complexity | 21 | 22 | wrong, same cause |
| number_of_functions | 6 | 6 | ok |
| parameters max / min / mean / median | 5 / 0 / 1.5 / 1 | 5 / 0 / 1.6 / 1 | mean wrong: `rank` is not in the per-function list (8 / 5) |
| complexity per function max / min / mean / median (12, 1, 4, 2, 1, 1) | 12 / 1 / 3.5 / 1.5 | 12 / 0 / 3.4 / 2 | wrong: the parser's list is 12, 0, 3, 2, 0 (own +1 left out, `default` and nested function added) |
| rloc per function max / min / mean / median (32, 3, 10, 8, 1, 1) | 32 / 1 / 9.17 / 5.5 | 32 / 1 / 10.8 / 8 | mean and median wrong: `rank` missing (54 / 5) |
| long_method | 1 | 1 | ok |
| long_parameter_list | 1 | 1 | ok |
| message_chains | 1 | 1 | ok |
| excessive_comments | 1 | 1 | ok |

`EncounterEdgeCases`, file level:

| Metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| loc / rloc / comment_lines | 324 / 262 / 20 | 324 / 262 / 20 | ok |
| logic_complexity | 32 | 36 | wrong: 4 `default` labels |
| complexity | 77 | 84 | wrong: 4 `default` + 2 abstract methods + 1 static initializer |
| number_of_functions | 40 | 42 | wrong: 2 abstract methods |
| parameters max / min / mean / median | 3 / 0 / 0.75 / 1 | 3 / 0 / 0.66 / 1 | mean wrong: varargs 0, `compare` dropped, 41 entries |
| complexity per function max / min / mean / median | 5 / 1 / 1.875 / 2 | 4 / 0 / 0.95 / 1 | wrong: own +1 left out |
| rloc per function max / min / mean / median | 14 / 1 / 3.375 / 1.5 | 14 / 0 / 3.17 / 1 | wrong: constructors and abstract methods at 0 |
| long_method | 2 | 2 | ok |
| long_parameter_list | 0 | 0 | ok |
| message_chains | 2 | 2 | ok |
| excessive_comments | 1 | 1 | ok |

`EncounterEdgeCases`, per construct. The reported values come from a scratch copy split into one class per member. Columns are parameters / logic_complexity / complexity / functions.

| Construct | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| static initializer with `if` | - / 1 / 1 / 0 | - / 1 / 2 / 0 | wrong: +1 like a function |
| instance initializer with `for` | - / 1 / 1 / 0 | - / 1 / 1 / 0 | ok |
| `EncounterEdgeCases()` with `this(1)` | 0 / 0 / 1 / 1, body rloc 1 | 0 / 0 / 1 / 1, body rloc 0 | wrong: constructor body not seen |
| `EncounterEdgeCases(int)` with `if` | 1 / 1 / 2 / 1, body rloc 4 | 1 / 1 / 2 / 1, body rloc 1, per-function complexity 0 | wrong: only the `if` block is taken as the body |
| `enhancedFor`, `classicFor`, `doWhile` | 1 / 1 / 2 / 1 each | same | ok |
| `fallthroughSwitch` (3 labels + `default`) | 1 / 3 / 4 / 1 | 1 / 4 / 5 / 1 | wrong: `default` |
| `arrowSwitch` (`case BEAST, DRAGON ->`, `case FIEND -> { yield }`, `default ->`) | 1 / 2 / 3 / 1 | 1 / 3 / 4 / 1 | wrong: `default` |
| `colonSwitchExpression` | 1 / 2 / 3 / 1 | 1 / 3 / 4 / 1 | wrong: `default` |
| `patternSwitch` (`when` guard, `case null`, `default`) | 1 / 3 / 4 / 1 | 1 / 4 / 5 / 1 | wrong: `default`; the guard adds nothing, as the rule says |
| `instanceofPattern` (`if`, `&&`, record pattern) | 1 / 2 / 3 / 1 | same | ok |
| `multiCatch` (`A \| B`) | 1 / 1 / 2 / 1 | same | ok |
| `tryWithResources` | 1 / 1 / 2 / 1 | same | ok |
| `expressionLambda` | 0 / 0 / 2 / 1 | same | ok |
| `blockLambda` with `if` | 0 / 1 / 3 / 1 | same | ok |
| `methodReference` (4-call chain) | 1 / 0 / 1 / 1, chain 1 | same | ok |
| `streamChain` (7 calls on 7 lines, 2 lambdas) | 1 / 0 / 3 / 1, chain 1 | same | ok |
| `anonymousClass` + `compare(left, right)` | 0 and 2 / 0 / 2 / 2 | max parameters 0, 0 / 2 / 2 | wrong: the nested method's 2 parameters are lost |
| `varargs(int... rolls)` | 1 | 0 | wrong: `spread_parameter` is no parameter |
| `genericBound(Map<String, List<T>> parties, @Deprecated final String name)` | 2 | 2 | ok |
| `receiverParameter(EncounterEdgeCases this)` | 0 | 0 | ok |
| `labelledBreak` | 1 / 4 / 5 / 1, body rloc 14 | same | ok |
| `nestedTernary` | 1 / 2 / 3 / 1 | same | ok |
| `shortCircuit` (`&&`, `\|\|`) | 3 / 2 / 3 / 1 | same | ok |
| `bitwiseOperators` (`&`, `\|`, `^`) | 2 / 0 / 1 / 1 | same | ok |
| `assertion` (`assert a && b`) | 1 / 1 / 2 / 1 | same | ok |
| `textBlock` | body rloc 4, comment lines 0 | same | ok |
| `commentMarkersInStrings` | body rloc 3, comment lines 1 | same | ok |
| `commentSyntaxes` | body rloc 2, comment lines 13 | same | ok |
| `markdownDocComment` (`///` x 2) | comment lines 2 | same | ok |
| `cast`, `classLiteral`, `wildcard`, `unicodeIdentifiers` | complexity 1, 1 function each | same | ok |
| `record Ambush`: compact constructor with `if`, `none()` | 0 / 1 / 3 / 2, body rloc 3 and 1 | same | ok |
| `interface Scout`: abstract `scout()`, default `scoutTwice()`, static `none()` with lambda | 0 / 1 / 4 / 2 | 0 / 1 / 5 / 3 | wrong: abstract method counted |
| `enum Mood`: two constant bodies, abstract `bonus()` | 0 / 0 / 2 / 2 | 0 / 0 / 3 / 3 | wrong: abstract method counted |

- `Zentaurenhöhle.java`: loc 20, rloc 13, comment_lines 3, complexity 3, 3 functions, parameters 1 / 0 / 0.33 / 0 as expected. rloc per function is 1 / 0 / 0.67 / 1 instead of 1 / 1 / 1 / 1, because the constructor body counts 0.
- Line counting is right in all three new files: loc, rloc, comment lines, a line with code and a comment counts for both, comment markers inside strings and text blocks are not comments, `///` and inline `/* */` are.
- Other files:
  - `Fightable.java` (1 function) and `Creatures.java` (2 functions) report bodiless interface methods as functions with complexity 1 each.
  - `rloc_per_function` minimum is 0 in every class with a constructor (`HitPoints`, `ArmorClass`, `Speed`, `Creature`, `NoSuchCreatureException`).
  - `Trap.java` reports per-function complexity 1 for the method that holds the anonymous class.
  - `Persisted.java` (annotation elements) and `dto/Creature.java` (record without body) report 0 functions.
- Scratch experiment: a lambda assigned to a local variable counts as a function (1 method + 2 lambda variables = 3), a lambda that is returned or passed does not.

## Domain language parser
- Command: `ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json`, exit 0, 34 files, 280 distinct words.
- Variant runs:
  - Exit 0: `--stop-word-level MINIMAL`, `--stop-word-level AGGRESSIVE`, `--no-technical-stopwords`, `--exclude-tests`, `--ngrams 2`, `--string-weight 5`, `--identifier-weight 1`.
  - Exit 1: `--string-weight 0` and `--comment-weight 0`, with `IllegalArgumentException: … must be positive, got 0`.
- The lens holds one node per file and none for folders or the root. The numbers called "root" below are sums over the files. Each word carries `frequency` and `tfidf`.
- Expected words, all 17 present: creature 145, hit 40, armor 37, speed 35, roll 35, points 34, damage 25, initiative 24, encounter 24, centaur 22, lair 18, dice 12, stable 8, treasure 5, hoard 5, cellar 4, dungeon 4.
- Weights: declared identifier 3, comment word 2, string word 1. Confirmed by `--string-weight 5` (`dungeon` 4 -> 12) and `--identifier-weight 1` (`creature` 145 -> 59).
- New files against the expectation:
  - `EncounterResolver.java`: encounter 5, damage 11, lair 3, cellar 1, dungeon 1, attacker 7, defender 7, terrain 7, bonus 3, all as expected. Commented-out code counts as comment text (`damage` twice at weight 2).
  - `EncounterEdgeCases.java`: found at 3 each: `minion`, `torch`, `mare`, `wyvern`, `drake`, `basilisk`, `mishap`, `scroll`, `failure`, `ogre`, `troll`, `goblin`, `kobold`, `skittish`, `furious`, `mood`, `höhle`, `größe`. Also `tally` 6, `threat` 6, `banshee` 5, `raiders` 4. Comment words at 2: `catacomb`, `gargoyle`, `wails`, `chimera`. String words at 1: `portcullis`, `drawbridge`, `sarcophagus`, `crypt`, `kicking`, `roaming`, `graze`, `miss`.
  - My miscounts: `ambush` is 5, not 3 (I overlooked the class Javadoc); `scout` is 9, not 3 (interface, `scout()`, `scoutTwice()`).
  - Missing: the label `corridor` is not extracted.
  - Constructor names count as declarations (`encounter`, `edge`, `cases` 9 each); the compact constructor name does not.
- Keyword leakage: none. `class`, `public`, `int`, `void`, `return`, `record`, `enum`, `static`, `final`, `var`, `throws`, `assert`, `yield`, `default` are absent. `override` and `deprecated` are absent because annotations are not extracted.
- Technical leakage at MODERATE:
  - Filtered: `util`, `exception`, `service`, `test`, `mock`, `get`, `save`, `find`, `create`, `name`.
  - Leaking: `id` 60 and `type` 45 (2nd and 3rd most frequent), `value` 21, `entity` 12, `repository` 12, `facade` 9, `persisted` 9, `logger` 6, `dto` 3, `init` 3, `such` 7.
  - AGGRESSIVE removes `type`, `value`, `entity`, `repository`, `facade`, `logger`, `method`, `dto`, `command`, `run`, `init`, `parameter`, `types`, `param`; it keeps `id` and `persisted`.
  - MINIMAL adds `get` 42, `service` 27, `find` 15, `save` 15, `base` 9, `create` 6, `builder` 3. `--no-technical-stopwords` adds `name`, `temporary`, `util` on top of that.
- Javadoc tags and URL schemes count as words: `param` 2, `code` 4, `link` 2, `http` 1.

| Form | Identifier | Words found | Verdict |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | walking, speed | ok |
| snake_case | `walking_speed` (test) | walking, speed | ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points | ok |
| PascalCase | `ArmorClass` | armor | ok |
| Acronym | `XPValue` | xp, value | ok |
| Digit | `d20Roll` | 20, roll | wrong: bare number |
| Digit, other position | `rollD20`, `D20_SIDES` | roll, d20 / d20, sides | inconsistent with the row above |
| Kebab in string | `"centaur-stable"` | centaur, stable | ok |
| Umlaut identifier | `rüstungsklasse`, `größe`, `höhle`, `Zentaurenhöhle` | kept whole | ok |
| Test method | `should_save_creature_to_the_stable` | creature, stable | ok |

- Comments and strings: all planted sentences are counted (`roams`, `beasts`, `dragons`, `share`; `drop`, `recover`, `rests`, `takes`; `before`, `starts`; `counts`, `guards`; `dungeon` from the exception string). Text block words are counted and its `//` and `/* */` lines are treated as string text.
- Test file: included by default (`creature` 145, `stable` 8), dropped by `--exclude-tests` (136 and 5, 33 files).
- `module-info.java` is kept with an empty word list.
- `--ngrams 2` adds bigrams such as `hit points` 30, `feet per` 18, `xp value` 15, `centaur stable` 3, `treasure hoard` 3.

- German words, `Zentaurenhöhle.java`:
  - Expected: `zentaurenhöhle` 5 (8 if the constructor counts), `rüstungsklasse` 11, `größe` 4, `höhle` 1, `verlies` 2, `trefferpunkte` 2, `kreatur` 2.
  - Reported: `rüstungsklasse` 9, `zentaurenhöhle` 6, `größe` 3, `verlies` 2, `trefferpunkte` 2, `kreatur` 2, `liegt` 2, plus the fragments `hle` 3, `zentaurenh` 2, `stungsklasse` 2, `geh` 2, `ren` 2.
  - All seven words appear in the project, but `zentaurenhöhle`, `rüstungsklasse`, `größe` and `höhle` only through identifiers (`höhle` only as the parameter in `EncounterEdgeCases`).
  - Comments and strings are matched with `[a-zA-Z]{3,}` (`SplitStage.kt`), so every umlaut and `ß` cuts the word: `Zentaurenhöhle` -> `zentaurenh` + `hle`, `Rüstungsklasse` -> `stungsklasse`, `gehören` -> `geh` + `ren`, `Höhle` -> `hle`, `Größe` -> nothing.
  - German stop words leak: `die` 2, `dem` 2, `und` 2, `unter` 2, `jeder` 2, `der` 1. Only an English stop list exists. `zu` is absent because comment words need three letters.

## Changed since 2026-09-06
- The domain lens no longer has a root or folder node; the old report read "89 distinct root words" from one. Totals now have to be summed over the files.
- Each domain word has a `tfidf` value; the CLI has `--no-tfidf`, `--sort-by`, `--limit` and `--ngrams`.
- Leaf kinds are printed in lower case (`class`, `interface`, `enum`, `annotation`); the old report wrote `CLASS`. The old output is gone, so this is not verified as a real change.
- `--no-technical-stopwords` brings back `get`, `service`, `find`, `save`, `name`, `base`, `temporary`, `create`, `util`, `builder`.
- Still true on the old files:
  - 45 of 54 expected file edges with the same 9 misses, no false positive.
  - 12 cyclic and 2 upward edges, 9 cycles.
  - `module-info.java` dropped from the dependency tree.
  - Nested `Builder` is a top-level leaf and `CreatureFacade -> CreatureService` counts x2.
  - Weights 3 / 2 / 1; weight 0 rejected.
  - `id`, `entity`, `repository`, `facade`, `persisted`, `logger`, `dto`, `init`, `such` leak.
  - `d20Roll` gives `20`; `link` is counted.
  - No keyword leaks; no stemming (`creature` 145 next to `creatures` 31).
- New on the old files: the unified parser was not part of the earlier report; its findings on `Fightable.java`, `Creatures.java`, `Trap.java` and the constructors are listed above.
- Not rerun: `--verbose` on the dependency parser.

## Verdict

### Unified parser
- Wrong:
  1. `default` in a `switch` counts as a branch: `EncounterResolver.resolve` (`default:`), `EncounterEdgeCases.fallthroughSwitch`, `arrowSwitch`, `colonSwitchExpression`, `patternSwitch`. logic_complexity and complexity are 1 too high per `default`. **Decision: ignore — the docs list `switch_label` as intended.**
  2. Constructor bodies are not function bodies: `EncounterEdgeCases()` reports 0 body rloc, `EncounterEdgeCases(int)` reports 1 instead of 4 and loses its `if` in the per-function complexity; the same holds for `Zentaurenhöhle`, `HitPoints`, `ArmorClass`, `Speed`, `Creature`, `NoSuchCreatureException` **Decision: accept.**
  3. `EncounterEdgeCases.varargs(int... rolls)` reports 0 parameters. **Decision: accept.**
  4. Abstract methods count as functions with complexity 1: `Scout.scout()`, `Mood.bonus()`, `Fightable.initiative()`, `Creatures.save` / `find`. **Decision: ignore.**
  5. The static initializer in `EncounterEdgeCases` adds +1 complexity like a function; the instance initializer does not. **Decision: ignore — the docs list `static_initializer` as intended.**
  6. Per-function complexity leaves out the function's own +1: `describe` and `isEmpty` report 0, and the per-function values do not sum to the file's complexity. **Decision: ignore — the docs define it as the complexity inside the body.**
- Bad:
  1. Nested functions are counted in `number_of_functions` but have no entry in the per-function statistics: `Ranking.rank` in `EncounterResolver`, `compare(left, right)` in `EncounterEdgeCases.anonymousClass`. Their parameters disappear and mean and median shift. **Decision: accept.**
  2. A lambda assigned to a variable is a function, a returned or passed lambda is not (scratch experiment). **Decision: accept, although the docs state this rule.**
  3. A pattern guard `case Centaur mare when …` adds no complexity. **Decision: accept.**
  4. Under a non-UTF-8 locale `Zentaurenhöhle.java` is skipped without a message. **Decision: accept.**
- Missing: nothing in Java is skipped outright; `module-info.java` is analysed.
- Good: loc, rloc and comment lines in all three new files; text blocks and comment markers in strings; `///`; multi-catch; try-with-resources; `do … while`; labelled `break`; nested ternary; `&&` / `||` against bitwise operators; `assert`; receiver parameter; generics in parameter lists; message chains across lines; long_method; long_parameter_list; compact record constructor; enum constant bodies.

### Dependency parser
- Missing:
  1. `EncounterResolver.java`: the type of the enhanced-`for` variable (`for (Speed speed : …)`) gives no edge. **Decision: accept.**
  2. `EncounterEdgeCases.java`: no edge for the switch type pattern `case Centaur mare`, the record pattern `instanceof CreatureId(var basilisk)`, the generic bound `<T extends Fightable>`, the method reference `HitPoints::getCurrent`, the cast `(ArmorClass) target`, the class literal `Speed.class`, the wildcard `List<? extends SpeedType>`. **Decision: accept.**
  3. Unchanged: `CreatureInspector.java` (`instanceof Centaur`, `Speed[]`), `CreatureFactories.java` (`Dice::rollD20`, `Centaur::new`), `InitiativeOrder.java` and `CreatureFacade.java` (static imports), `EncounterCommand.java` (import of the nested `Builder`). **Decision: accept.**
  4. Scratch experiment: catch parameter type and typed lambda parameter give no edge. **Decision: accept.**
  5. No record leaf kind; no leaf or edge for `module-info.java`. **Decision: accept, although mapping records to `class` is deliberate in the code.**
- Wrong:
  1. `CreatureFacade.java`: the fully qualified `de.sots.cellarsandcentaurs.application.dto.Creature` resolves to the imported domain `Creature`. **Decision: accept.**
- Bad:
  1. Nested and local types are exported as top-level leaves of the package: `Ranking` (local class in `EncounterResolver.initiativeOrder`), `Ambush`, `Scout`, `Mood`, `Builder`. Same-named nested types in one package would collide, and `EncounterResolver` reports 3 outgoing dependencies for 2 file edges. **Decision: accept.**
  2. Under a non-UTF-8 locale `Zentaurenhöhle.java` and its two edges disappear without a message. **Decision: accept.**
- Good: no false positive in 53 edges; parameter, return, field and local variable types, `new`, static calls (also inside a lambda), `throws`, annotations, inheritance, generic arguments and a non-ASCII type name resolve; cycle and upward flags are stable; tests are skipped by default.

### Domain language parser
- Wrong:
  1. `Zentaurenhöhle.java`: words in comments and strings are cut at umlauts and `ß` (`zentaurenh` + `hle`, `stungsklasse`, `geh` + `ren`; `Größe` vanishes). Identifiers are not affected. **Decision: accept.**
  2. `Dice.java` / `CreatureFacade.java`: `d20Roll` yields the bare number `20`, while `rollD20` and `D20_SIDES` yield `d20`. **Decision: ignore.**
  3. `id` 60 and `type` 45 are the second and third most frequent words; `entity`, `repository`, `facade`, `persisted`, `logger`, `dto`, `init`, `such` pass MODERATE; AGGRESSIVE keeps `id` and `persisted`. **Decision: ignore.**
- Missing:
  1. No German stop list: `die`, `dem`, `und`, `unter`, `jeder`, `der` are counted. **Decision: ignore.**
  2. No root or folder word list in the lens. **Decision: ignore — documented as deliberate.**
  3. `EncounterEdgeCases.labelledBreak`: the label `corridor` is not extracted. **Decision: accept.**
  4. No stemming. **Decision: ignore.**
- Bad:
  1. Javadoc tags and URL schemes are words: `param` and `code` in `EncounterEdgeCases.commentSyntaxes`, `link` in `LairGuide.java`, `http` from `"http://crypt.example/sarcophagus"`. **Decision: ignore.**
  2. Commented-out code counts as comment text (`// damage = damage * 2;` in `EncounterResolver`). **Decision: ignore.**
  3. `--string-weight 0` and `--comment-weight 0` are rejected, so a source cannot be switched off. **Decision: accept.**
  4. Under a non-UTF-8 locale `Zentaurenhöhle.java` is skipped without a message. **Decision: accept.**
- Good: all 17 expected words; no Java keyword; every declaring construct in `EncounterEdgeCases` except the label is extracted (pattern, lambda, catch, resource and loop variables, record components, enum constants, varargs); text block and string words are counted; weights 3 / 2 / 1 are visible and adjustable; camelCase, snake_case, SCREAMING_SNAKE, acronym and kebab splitting; umlaut identifiers stay whole; tests are included by default and removable.
