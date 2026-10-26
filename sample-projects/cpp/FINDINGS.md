# C++

> Correction (2026-10-08, cross-check with one identifier per file): the digit split is attributed the wrong way
> round wherever this report mentions it. `d20Roll` gives `20` + `roll` (the leading `d` is dropped), `rollD20` gives
> `roll` + `d20`, `roll_d20` gives `roll` + `20`. Both identifiers sit in the same file here, so the file's word list
> could not tell them apart.

Report of 2026-10-08 (round 3). Every claim below was re-checked against the output of this day's runs; the expectations
in the appendix were written before the parsers ran and are kept unchanged, corrections to them are marked as such.

## Project

- Layout: `CMakeLists.txt`, `src/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,application,application/dto,variants}`
  with `.hpp` headers and `.cpp` sources, `test/de/sots/cellarsandcentaurs/domain/service/CreatureServiceTest.cpp` (gtest).
  47 files under `src/`, 1 test file, `CMakeLists.txt`: 49 project files. Namespaces `de::sots::cellarsandcentaurs::...`
  mirror the folders; `#include "..."` uses relative paths, the test uses include-root paths.
- Dependency stress constructs of rounds 1 and 2 (unchanged): alias `using Entity = CreatureEntity;`, `using namespace`,
  umbrella header `Application.hpp` as barrel, inheritance and pure virtual classes as interfaces, `template <typename T>
  class Repository`, type-position / instantiation / static-member-only uses, `domain::model::Creature` vs
  `application::dto::Creature`, fully qualified reference, unused include, std / boost / spdlog / gtest, test file,
  `Dice.hpp` with `Dice`, `DiceRoll` and the free function `rollD20`; round 2: forward declaration, using-declaration,
  namespace alias, typedef, friend class, casts, template argument, catch type, `#ifdef` member, explicit specialization.
- Round 3 adds 11 files:
  - `domain/service/EncounterResolver.hpp`: header-only class with the five shared methods.
  - `domain/service/EncounterEdgeCases.hpp` / `.cpp`: 59 constructs, each preceded by a
    `// case: <construct> | functions F, parameters P, complexity C` line that holds its expected value. The `.cpp` also
    holds `EncounterWitness` (one dependency construct per method) and the planted words for the domain parser.
  - `domain/model/Zentaurenhöhle.hpp`: class `Zentaurenhöhle`, field `rüstungsklasse`, German comment and string. C++
    accepts UTF-8 identifiers and the file system the umlaut file name, so no ASCII fallback was needed.
  - `variants/`: `GriffinNest.cc`, `BasiliskNest.cxx`, `ChimeraNest.c++`, `ManticoreNest.hh`, `CockatriceNest.hxx`,
    `HippogriffNest.h++`, `OwlbearNest.h` - the same class with one method, one `if`, one `domain::model::Speed`
    parameter and one planted word each. `.h` is added because C++ projects use it and the parsers disagree about it.
  - `git check-ignore -v` reports none of the new files as ignored.
- Not available in C++: `finally` (`safeRoll` has `try` / `catch` only), nested named functions (`initiativeOrder` holds
  the named lambda `strongerFirst`; `EncounterEdgeCases.cpp` adds a local class with a method), annotations that
  reference a type, a module system with re-exports, an `interface` keyword, null-coalescing / optional chaining,
  pattern guards, comprehensions, `defer`, labelled breaks, exception filters, extension functions, property accessors,
  nested comments.
- Run environment: the sandbox shell has the POSIX locale. With it all three parsers drop `Zentaurenhöhle.hpp` without
  any message (unified 46 instead of 47 files, dependency 43 instead of 44, domain 45 instead of 46). All results below
  are from runs with `LC_ALL=C.utf8`, where the file is analysed.

## Unified parser

- Command: `ccsh unifiedparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/unified.cc.json`, exit 0. Messages:
  `No .gitignore found at root level, excluding common build folders as fallback...` (the `.gitignore` of the repository
  root is not looked up when a sub-folder is analysed) and `2 Files with the following extensions were ignored as they
  are currently not supported: [.txt, .h++]`. With stderr redirected the progress bar prints one line per file and the
  counter runs backwards in between (`23/46` followed by `18/46`).
- 47 files analysed: all `.cpp .hpp .cc .cxx .c++ .hh .hxx .h`. Skipped: `HippogriffNest.h++` and `CMakeLists.txt`, both
  named in the message. `OwlbearNest.h` is analysed with the C grammar (see below). The output also carries an empty
  `dependency` lens (`edges: []`).

### `EncounterResolver.hpp`

| metric | expected | reported | verdict |
| --- | --- | --- | --- |
| logic_complexity | 14 | 15 | wrong: `default:` of the `switch` in `resolve` is counted like a `case` |
| complexity | 21 | 22 | wrong: same `default:` |
| number_of_functions | 5 | 7 | wrong: the lambda variables `capped` and `strongerFirst` are counted as functions |
| loc | 99 | 99 | ok |
| rloc | 77 | 77 | ok |
| comment_lines | 13 | 13 | ok |
| max / min / mean / median parameters per function | 5 / 0 / 1.6 / 1 | 5 / 0 / 1.6 / 1 | ok (computed over the 5 methods, not over the 7 "functions") |
| max / min / mean / median complexity per function | 12 / 1 / 3.8 / 2 | 12 / 0 / 3.4 / 2 | different definition: the function's own +1 is left out (isEmpty and describe are 0), a nested lambda adds +1 to its enclosing function, and `default:` adds +1; values are resolve 12, describe 0, safeRoll 3, initiativeOrder 2, isEmpty 0. The max only matches by coincidence |
| max / min / mean / median rloc per function | 36 / 3 / 12.4 / 8 | 34 / 1 / 10.4 / 6 | my count was off by 2 per function: I included the signature line and the closing brace, the parser counts the lines between the braces, which is what the README means by "its body". Corrected expectation 34 / 1 / 10.4 / 6 = reported |
| long_method | 1 | 1 | ok |
| long_parameter_list | 1 | 1 | ok |
| message_chains | 1 | 1 | ok (the chain of 5 counts, the chain of 3 does not) |
| excessive_comments | 1 | 1 | ok |

### `EncounterEdgeCases.hpp` / `.cpp`

File totals:

| file | metric | expected | reported | verdict |
| --- | --- | --- | --- | --- |
| EncounterEdgeCases.hpp | number_of_functions | 11 | 14 | +3 defaulted / deleted members |
| EncounterEdgeCases.hpp | complexity | 16 | 27 | +11, all explained by the rows below |
| EncounterEdgeCases.hpp | logic_complexity | 5 | 5 | ok |
| EncounterEdgeCases.hpp | loc / rloc / comment_lines | 89 / 52 / 18 | 89 / 52 / 18 | ok |
| EncounterEdgeCases.hpp | max_parameters_per_function | 2 | 2 | ok |
| EncounterEdgeCases.cpp | number_of_functions | 55 | 61 | +5 lambda variables, +1 function under `#if 0` |
| EncounterEdgeCases.cpp | complexity | 91 | 104 | +13, all explained by the rows below |
| EncounterEdgeCases.cpp | logic_complexity | 31 | 33 | +1 `default:`, +1 `if` under `#if 0` |
| EncounterEdgeCases.cpp | loc / rloc / comment_lines | 402 / 301 / 53 | 402 / 301 / 53 | ok |
| EncounterEdgeCases.cpp | max_parameters_per_function | 3 | 4 | function pointer parameter, see below |

The parser reports file totals only, so the per-construct values come from a scratch copy in which every `// case:` block
is a file of its own (in-class members wrapped in `class EncounterTally { public: ... };`). The sums of those values
equal the reported totals of both files. Columns are functions / max parameters / complexity.

| file | construct | expected | reported | verdict |
| --- | --- | --- | --- | --- |
| hpp | constructor with initializer list holding a ternary | 1 / 2 / 2 | 1 / 2 / 2 | ok |
| hpp | constructor as function try block | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| hpp | defaulted and deleted members | 0 / - / 0 | 2 / - / 3 | wrong by the rule: `= default` and `= delete` are counted as functions, +1 for the `EncounterTally&` return type |
| hpp | destructor | 1 / 0 / 2 | 1 / 0 / 2 | ok |
| hpp | in-class inline method | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| hpp | member declarations defined in the source file | 0 / - / 0 | 0 / - / 2 | wrong: +1 complexity per declaration, although no function is counted |
| hpp | compound assignment operator | 1 / 1 / 1 | 1 / 1 / 2 | wrong: +1 complexity for the reference return type |
| hpp | comparison operator with && | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| hpp | conversion operator with \|\| | 1 / 0 / 2 | 1 / 0 / 3 | wrong: the conversion operator is counted twice |
| hpp | call operator | 1 / 1 / 1 | 1 / 1 / 1 | ok |
| hpp | friend stream operator defined in the class | 1 / 2 / 1 | 1 / 2 / 2 | wrong: +1 complexity for the reference return type |
| hpp | class template with one inline member and one declaration | 1 / 1 / 1 | 1 / 1 / 2 | wrong: +1 complexity for the declaration `int size() const;` |
| hpp | out-of-line member of a class template | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| hpp | pure virtual member and defaulted virtual destructor | 0 / - / 0 | 1 / - / 2 | wrong by the rule: the `= default` destructor is a function, the pure virtual declaration adds +1 |
| cpp | out-of-line member definition | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| cpp | out-of-line static member definition | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| cpp | range based for | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| cpp | do while | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| cpp | classic for with && in its condition | 1 / 1 / 3 | 1 / 1 / 3 | ok |
| cpp | lambda with captures and one && | 1 / 2 / 3 | 2 / 2 / 3 | wrong: the lambda variable `beats` is counted as a function |
| cpp | lambda nested in a lambda, one ternary | 1 / 1 / 4 | 3 / 1 / 4 | wrong: the lambda variables `outer` and `inner` are counted as functions |
| cpp | lambda at namespace scope | 0 / 1 / 1 | 1 / 1 / 1 | wrong by the rule: counted as a function |
| cpp | if constexpr | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| cpp | if with initializer | 1 / 2 / 2 | 1 / 2 / 2 | ok |
| cpp | structured binding and a ternary | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| cpp | function try block | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| cpp | try with three catch clauses | 1 / 1 / 4 | 1 / 1 / 4 | ok |
| cpp | function template with a ternary | 1 / 2 / 2 | 1 / 2 / 2 | ok |
| cpp | explicit specialization of a function template | 1 / 2 / 2 | 1 / 2 / 2 | ok |
| cpp | default arguments | 1 / 3 / 1 | 1 / 1 / 1 | wrong: parameters with a default value are not counted (1 of 3) |
| cpp | variadic template with fold expression | 1 / 1 / 1 | 1 / 0 / 1 | wrong: the parameter pack `Rolls... rolls` is not counted |
| cpp | C style variadic function | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| cpp | one if in each preprocessor branch | 1 / 1 / 4 | 1 / 1 / 4 | ok |
| cpp | function disabled with #if 0 | 0 / - / 0 | 1 / - / 2 | bad: code under `#if 0` is counted as a live function with its `if` |
| cpp | macro definitions holding a ternary and an if | 0 / - / 0 | 0 / - / 0 | ok |
| cpp | function body made of macro calls | 1 / 1 / 1 | 1 / 1 / 1 | ok |
| cpp | comment markers and operators inside string literals | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| cpp | multi line raw string holding code-like text | 1 / 0 / 1 | 1 / 0 / 2 | wrong: +1 complexity for the pointer return type `const char*` |
| cpp | prefixed string literals | 1 / 0 / 1 | 1 / 0 / 2 | wrong: +1 complexity for the pointer return type `const wchar_t*` |
| cpp | character literals and digit separators before a comment | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| cpp | line comment continued with a backslash | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| cpp | co_await and co_return | 1 / 1 / 1 | 1 / 1 / 4 | wrong: +1 complexity for each of the three member declarations of `RollAwaiter` |
| cpp | co_yield in a loop | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| cpp | goto with a label | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| cpp | switch with grouped cases and fallthrough | 1 / 1 / 5 | 1 / 1 / 6 | wrong: `default:` is counted like a `case` |
| cpp | nested ternary | 1 / 1 / 3 | 1 / 1 / 3 | ok |
| cpp | alternative operator tokens and, or, not | 1 / 3 / 3 | 1 / 3 / 3 | ok |
| cpp | local class with a method | 2 / 0 / 2 | 2 / 0 / 2 | ok |
| cpp | trailing return type | 1 / 1 / 1 | 1 / 1 / 1 | ok |
| cpp | function pointer parameter | 1 / 2 / 1 | 1 / 4 / 2 | wrong: the function pointer adds +1 complexity and its two parameter types count as parameters |
| cpp | void parameter list | 1 / 0 / 1 | 1 / 1 / 1 | wrong: `(void)` is counted as one parameter |
| cpp | user defined literal | 1 / 1 / 1 | 1 / 1 / 1 | ok |
| cpp | rvalue reference parameter | 1 / 1 / 1 | 1 / 1 / 1 | ok |
| cpp | requires clause joined with && | 1 / 1 / 1 | 1 / 1 / 1 | ok |
| cpp | attributes and noexcept | 1 / 1 / 1 | 1 / 1 / 1 | ok |
| cpp | enum class | 0 / - / 0 | 0 / - / 0 | ok |
| cpp | doc comment with tags | 1 / 1 / 3 | 1 / 1 / 3 | ok |
| cpp | namespace scope variable and free function with project types | 1 / 1 / 1 | 1 / 1 / 1 | ok |
| cpp | class whose methods each reference one project type | 14 / - / 15 | 15 / - / 19 | wrong: lambda variable `total` counted as function; +1 complexity each for the declarations `tag` and `audit`, the `const char*` return of `name` and the member function pointer parameter of `store` |

Additional single-statement probes (scratch files, not kept) that explain numbers in the round-1 files:

| statement | reported | meaning |
| --- | --- | --- |
| `int declared(int value);` | 0 functions, complexity 1 | every prototype adds +1 complexity |
| `const char* name() { ... }`, `int& first(int& value) { ... }` | complexity 2 | pointer or reference return type adds +1 |
| `void f() { Service service(creatures); }` | complexity 2 | a local variable built with `T name(identifier);` is read as a function declaration, +1 |
| `void f() { Creature creature(CreatureId(generateUuid()), type); }` | complexity 4 | the same with a nested call, +3 |
| `void f() { Speed speed(30); }` | complexity 1 | ok with a literal argument |
| `std::count_if(..., [](int roll) { return roll > 10; })` in a function | 1 function, complexity 2 | a lambda passed as argument is no function, a lambda stored in a variable is |
| `TEST(Suite, name) { if ... }` | 1 function, 2 parameters, complexity 2 | a gtest macro body is a function with the macro arguments as parameters |
| `a.b().c().d().e()` / `a->b()->c()->d()->e()` / `a.b.c.d.e` | message_chains 1 / 1 / 0 | arrow chains count, pure field chains do not |

### Line counting

- loc, rloc and comment_lines equal my own count in all 47 analysed files (checked with a separate line classifier).
- `EncounterEdgeCases.cpp`: `//`, `/* */`, `&&`, `||` and `?` inside `"..."`, inside `R"(...)"` and inside the four-line
  `R"scroll(...)scroll"` are neither comments nor logic; the raw string lines count as rloc. `'"'` followed by a trailing
  comment and `1'000'000` are handled. The line after `// ... \` is counted as a comment line, not as code.
- `///`, `//!`, `/*! */` and `/** */` all count as comment lines. A line with code and a trailing comment counts for both.
- Lines under `#if 0` count as rloc, and the function in them as function and complexity (construct table).
- Per-function rloc is the number of code lines between the braces; `{}` and one-line bodies give 0 or 1.

### Other files

- `variants/`: `.cc .cxx .c++ .hh .hxx` all report the expected 1 function, complexity 2, 1 parameter, loc / rloc 16 / 12
  or 18 / 13. `OwlbearNest.h` reports 2 functions, complexity 4, 0 parameters for the identical class: `.h` is always
  parsed as C. `HippogriffNest.h++` is not analysed.
- `Zentaurenhöhle.hpp`: 2 functions, complexity 2, loc / rloc / comment_lines 17 / 10 / 1, as expected.
- Headers that only declare get complexity without functions: `CreatureFacade.hpp` 0 functions / complexity 4,
  `PersistedCreatures.hpp` 0 / 3, `CreatureService.hpp` 0 / 3. `Creature.hpp`: 10 inline methods, complexity 16
  (+4 declarations, +2 for `const CreatureId&` and `const std::map<...>&` return types). `ArmorClass.hpp`: 4 / 9.
- `CreatureFacade.cpp`: 4 functions, logic 2, complexity 9 instead of 6; the 3 extra come from
  `domain::model::Creature creature(domain::model::CreatureId(generateUuid()), type);`. `max_parameters_per_function` 8
  and `long_parameter_list` 1 for `create` are right.
- `CreatureServiceTest.cpp`: 4 functions (two methods, two `TEST` bodies), logic 2, complexity 9; the 3 extra come from
  the constructor-call declarations in the `TEST` bodies (not broken down further).
- `Fightable.hpp`, `Creatures.hpp`: 1 function each, which is the `= default` virtual destructor.

## Dependency parser

- Commands (both exit 0, only the `.gitignore` warning):
  - `ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json` -> 44 files in the tree,
    46 leaves, 62 file edges, 63 leaf edges, `Found a total of 5 cycles`
  - `... --include-tests -o output/dependency-with-tests.cc.json` -> 45 files, 47 leaves, 66 file edges
- Not in the tree and not mentioned: `Application.hpp` and `CentaurRepository.hpp` (no declaration), `HippogriffNest.h++`.
- General behaviour, unchanged: one declaration is one leaf keyed by namespace path; a header / source pair shares the
  leaf and it is attached to the `.cpp`, so `Creature.hpp`, `ArmorClass.hpp`, `CreatureService.hpp`,
  `CreatureFacade.hpp`, `PersistedCreatures.hpp` and now `EncounterEdgeCases.hpp` (for `EncounterTally`) have no edge of
  that class. Types resolve by simple name; an `#include` alone never makes an edge.

Rounds 1 and 2, re-verified on today's output:

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| `using Entity = CreatureEntity;` (`CreatureRepository.hpp`) | CreatureRepository -> CreatureEntity | only -> Repository | missing |
| `typedef CreatureEntity Entity;` (`EntityMapper.hpp`) | EntityMapper -> CreatureEntity | file is 0 / 0 | missing |
| `using namespace ...domain::model` (`CreatureUtil.hpp`) | -> Creature, HitPoints | both | ok |
| umbrella header `Application.hpp` | Creature.cpp -> CreatureFacade, ArmorClass.cpp -> CreatureUtil | both, resolved by name; the header itself is absent | ok / barrel invisible |
| inheritance (`Centaur`, `Creature`, `PersistedCreatures`) | -> Creature, Fightable, Creatures | all | ok, usage kind is `usage` for every leaf edge |
| `Repository<Entity>` | CreatureRepository -> Repository | found | ok |
| type position / instantiation (`CreatureFacade`) | -> Speed, CreatureId | both | ok |
| static member in a member initializer (`Creature.cpp`, `ArmorClass.cpp`) | -> CreatureFacade, CreatureUtil | both, flagged upward | ok |
| static member / static call in a body (`PersistedCreatures.cpp`, `CreatureFacade.cpp`) | -> CreatureFacade, HitPoints | neither | missing |
| `domain::model::Creature` and `dto::Creature` in `CreatureFacade` | -> both | only domain model | missing |
| relative qualifier in namespace `application` (`CentaurInspector`, `CreatureDescriber`, `SafeCreatureLookup`) | -> domain/model/Creature | -> application/dto/Creature.hpp, three times | wrong target |
| unused include, std / boost / spdlog / gtest | no edge | none | ok |
| test file | skipped by default; with `--include-tests` -> CreatureService and 7 more | skipped; with tests -> Creature, CreatureId, NoSuchCreatureException, Creatures only | the edge to `CreatureService` is missing |
| free function `rollD20` (`Dice.hpp`), called in `Creature.cpp` | leaf, Creature -> Dice | no leaf, no edge | missing |
| forward declaration (`Lair.hpp`), `friend class` (`TreasureLedger.hpp`), casts (`CentaurInspector.hpp`), template argument (`CentaurHerd.hpp`), member under `#ifdef` (`CreatureTrace.hpp`) | one edge each | all found | ok |
| namespace alias (`SpeedMapper.hpp`) | -> Speed | found | ok (round 2 showed it resolves by a substring accident; not re-probed) |
| `catch (const NoSuchCreatureException&)` (`SafeCreatureLookup.hpp`) | -> NoSuchCreatureException | no | missing |
| `template <> class Repository<Centaur>` (`CentaurRepository.hpp`) | -> Repository, Centaur | file absent | missing |

Round 3:

| construct | expected edge | found | verdict |
| --- | --- | --- | --- |
| `EncounterResolver.hpp`: parameter types | -> Creature.cpp, Dice.hpp | both | ok |
| `EncounterResolver.hpp`: `model::SpeedType::WALKING` in bodies only | -> SpeedType.hpp | no | missing |
| `EncounterWitness::summon`: `std::make_unique<model::Centaur>()` in a body | -> Centaur.hpp | yes | ok |
| `EncounterWitness::weigh`: `sizeof(model::HitPoints)` | -> HitPoints.hpp | yes | ok |
| `EncounterWitness::stride`: local variable `model::Speed pace(30);` | -> Speed.hpp | yes | ok |
| `EncounterWitness::lastRoll`: trailing return type `-> model::DiceRoll` | -> Dice.hpp#DiceRoll | yes | ok |
| `EncounterWitness::dig`: `new model::Lair(nullptr)` | -> Lair.hpp | yes | ok |
| `EncounterWitness::herd`: `alignof(CentaurHerd)` | -> CentaurHerd.hpp | yes | ok |
| `EncounterWitness::tag`: default argument `model::CreatureId("none")` | -> CreatureId.hpp | yes | ok |
| `friend int audit(const EncounterResolver&);` | -> EncounterResolver.hpp | yes | ok |
| `EncounterWitness::name`: `typeid(model::Fightable)` | -> Fightable.hpp | no | missing |
| `EncounterWitness::isDragon`: `model::CreatureType::DRAGON` in a body | -> CreatureType.hpp | no | missing |
| `EncounterWitness::walking`: `using enum model::SpeedType;` | -> SpeedType.hpp | no | missing |
| `EncounterWitness::armored`: lambda parameter `const model::ArmorClass&` | -> ArmorClass | no | missing |
| `EncounterWitness::cast`: temporary `model::Dice{6}` | leaf edge -> Dice | no (the file edge to `Dice.hpp` exists only through `DiceRoll`) | missing |
| `EncounterWitness::depth`: pointer to member `&model::Zentaurenhöhle::rüstungsklasse` | -> Zentaurenhöhle.hpp | no | missing (probe: also with an ASCII type; a `model::Höhle` field does resolve, so it is the construct, not the umlaut) |
| `EncounterWitness::store`: parameter `int (CreatureService::*counter)() const` | -> CreatureService | no | missing |
| `template <std::derived_from<Creatures> Port>` | -> Creatures.hpp | no | missing |
| free function `freeFunctionUse(const model::NoSuchCreatureException&)` | -> NoSuchCreatureException.hpp | no | missing (free functions have no leaf) |
| namespace-scope variable `static const model::Creature* lastAttacker` | -> Creature | no | missing |
| out-of-line `EncounterTally::misses` / `::empty` | .cpp -> own header | no edge; the `EncounterTally` leaf sits on the `.cpp` | header / source fold |
| `variants/*.cc .cxx .c++ .hh .hxx .h` | -> Speed.hpp each | all 6 | ok |
| `variants/HippogriffNest.h++` | -> Speed.hpp | file not analysed | missing |

- Count for the new files: I wrote "27 at most" before the run; that was an addition error, the list holds 28
  (3 + 18 + 7). 16 are reported, all in the expected set, 12 are missing. Whole project: 62 file edges = the 46 of round 2
  plus these 16; with tests 66 = 50 + 16.
- False positives: the three `-> application/dto/Creature.hpp` edges of round 2, nothing new.
- Cycles and upward edges: unchanged. `isCyclic` on the edges among `Creature.cpp`, `CreatureFacade.cpp`,
  `CreatureService.cpp`, `Creatures.hpp`, `ArmorClass.cpp`, `CreatureUtil.hpp`; `isPointingUpwards` on
  `ArmorClass.cpp -> CreatureUtil.hpp` and `Creature.cpp -> CreatureFacade.cpp`. `PersistedCreatures.cpp -> application`
  is still missing as third upward edge. No new cycle and no new upward edge, as expected.
- Leaf kinds: `class` for classes, structs, templates and pure virtual classes, `enum` for `CreatureType`, `SpeedType`
  and `Outcome`. New and questionable: `EncounterEdgeCases.hpp#Pool<Combatant>` is a second leaf next to `Pool`,
  created by the out-of-line member definition `int Pool<Combatant>::size() const`; `EncounterEdgeCases.cpp#Counter`
  is the function-local struct of `localClass()`. The forward declaration `struct Task;` makes no leaf (right). No leaf
  for free functions, lambdas, aliases, variables or macros.
- Test detection: only by directory. Probe: `NamedTest.cpp` and `named_test.cpp` outside a `test` folder are analysed in
  the default run.
- What the language offers: no module system in this project style; `#include` is textual, namespaces are independent
  of folders. CodeCharta resolves by simple type name with the namespace path as key. That works for types in
  signatures, fields, base lists, local variable declarations, `new`, `sizeof` / `alignof`, casts, template arguments
  and default arguments; it does not see `Type::member` expressions in bodies, `typeid`, braced temporaries, lambda
  parameters, pointers to members, constrained template parameters, aliases, catch types, or anything outside a class.
- Known gaps of the name rules (`analysis/analysers/parsers/DependencyParser/docs/name-resolution/cpp.md`): listed
  per probe in `regression/cpp/known-gaps.md`.

## Domain language parser

- Commands, all exit 0: default -> `output/domain.cc.json`; `--stop-word-level MINIMAL` / `AGGRESSIVE`,
  `--exclude-tests`, `--no-technical-stopwords`, `--ngrams 2`, `--comment-weight 1 --string-weight 1
  --identifier-weight 1` -> `output/domain-<variant>.cc.json`. `--comment-weight 0` exits 1 with a Java stack trace
  (`IllegalArgumentException: --comment-weight must be positive, got 0`).
- 46 files, 46 nodes: the lens holds one node per file and nothing else. There is no root node and no folder node, so
  "the root node's word list" does not exist; the numbers below are the sum over all file nodes. Every word carries
  `frequency` and `tfidf`.
- Not analysed and not mentioned: `ManticoreNest.hh`, `ChimeraNest.c++`, `CMakeLists.txt`.

Expected words (sum over all files, all 17 present):

| word | freq | word | freq | word | freq |
| --- | --- | --- | --- | --- | --- |
| creature | 187 | hit | 58 | lair | 9 |
| speed | 95 | armor | 56 | initiative | 5 |
| roll | 93 | points | 44 | stable | 4 |
| encounter | 31 | dice | 22 | dungeon | 3 |
| centaur | 27 | damage | 15 | cellar | 2 |
| treasure | 11 | hoard | 11 | | |

- Keyword leakage: none of the C++ keywords, STL names, attribute names or preprocessor words appears (`class`, `std`,
  `vector`, `constexpr`, `noexcept`, `nullptr`, `nodiscard`, `pragma`, `include`, `define`, `co_await` parts ...).
  Leaks: `public(3)` and `variants(3)` in `OwlbearNest.h`, because `.h` is treated as C; `brief(2)` and `param(2)` from
  the `@brief` / `@param` tags in `EncounterEdgeCases.cpp`. `await`, `yield`, `fallthrough`, `cast`, `once`, `defined`
  in the lists come from my own identifiers and comments, not from keywords.
- Technical words at MODERATE: `hpp(91)`, `model(55)`, `domain(36)`, `sots(6)`, `cellarsandcentaurs(6)` come mostly from
  `#include "..."` paths, which are counted as string literals (probe: a file with only
  `#include "de/sots/Creature.hpp"` yields `creature, hpp, sots`). `entity(27)`, `repository(21)`, `facade(11)`,
  `dto(7)`, `type(59)`, `value(33)` stay at MODERATE and go at AGGRESSIVE, which also removes `model, init, result,
  trace, method, call, arguments, param, parameter(s)`; `id(90)` stays at every level. `util, exception, test, service,
  get, find, save, create, base` do not appear at MODERATE; MINIMAL brings back `get(50), service(37), find(33),
  base(30), save(27), error(12), index(6), create(6)`, `--no-technical-stopwords` additionally `name, util, temporary`.
  `such(11)` from `NoSuchCreatureException`, `mapper, inspector, describer, lookup` are not on any list.
- The top of the summed list is `creature 187, complexity 120, functions 120, parameters 104, speed 95, roll 93, hpp 91,
  id 90`; `complexity / functions / parameters` are the words of my `// case:` comment lines, not a parser defect.

Identifier splitting:

| form | identifier | where | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | `Centaur.hpp` | walking(9), speed(10) |
| snake_case | `walking_speed` | test file | walking(3), speed(4) |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `HitPoints.hpp` | max(15), hit(11), points(11) |
| PascalCase | `ArmorClass` | `ArmorClass.hpp` | armor(9); `class` removed |
| acronym | `XPValue` | `Centaur.hpp` | xp(3), value(3) |
| digit | `d20Roll` | `Dice.hpp` | d20(3), roll |
| digit | `rollD20` | `Dice.hpp` | roll, 20(3): the `d` is lost |
| kebab in string | `"centaur-stable"` | `CreatureFacade.hpp` | centaur(1), stable(4 = 3 from `STABLE_NAME` + 1) |
| user-defined literal | `operator""_fathoms` | `EncounterEdgeCases.cpp` | fathoms(3) |
| enum values | `CRITICAL_HIT, GLANCING_BLOW, FUMBLE` | `EncounterEdgeCases.cpp` | critical, hit, glancing(3), blow(3), fumble(3) |
| macro name | `TROGLODYTE_BONUS`, `RETURN_ZERO_IF_FUMBLED` | `EncounterEdgeCases.cpp` | none: neither `#define` names nor macro calls are extracted |

- Comments and strings: all planted sentences of rounds 1 and 2 are counted, comment words with weight 2, string words
  with weight 1, identifiers with weight 3 (`Creature.hpp`: `roams(2) cellar(2) beasts(2) dragons(2)`; `HitPoints.hpp`:
  `damage(8) lair(2)`; `CreatureFacade.cpp`: `initiative(2) dungeon(2) encounter(2)`; `CreatureUtil.hpp`:
  `treasure(5) hoard(5)`; `NoSuchCreatureException.hpp`: `dungeon(1)`).
- Round 3 strings in `EncounterEdgeCases.cpp`: raw string `wyvern(1)`, multi-line raw string `ogre(2) troll(1)` (the
  delimiter `scroll` is not counted), `u8"minotaur"(1)`, `L"kobold"(1)`, adjacent literals `hydra(1) gorgon(1)`,
  attribute string `phoenix(1)`, doc comment `sphinx(2)`. Wrong: `"ghoul\nbanshee\tspectre"` yields `ghoul(1),
  nbanshee(1), tspectre(1)`; the escape letter is glued to the next word and `banshee` / `spectre` are missing.
- Commented-out code is text like any comment: `// int cover = defender.getCover();` in `EncounterResolver.hpp` gives
  `cover(4)`.
- Extension variants: griffin(5), basilisk(5), cockatrice(5), hippogriff(5), owlbear(5) are found; `manticore` (`.hh`)
  and `chimera` (`.c++`) are missing because those files are skipped.
- Test file handling: included by default (`creature(10), creatures(7), centaur(6), walking(3), ...`), removed by
  `--exclude-tests` (45 nodes; `assert, cellarsandcentaurs, memory, saved, sots, unknown` disappear). The gtest name
  `should_save_creature_to_the_stable` is not extracted (probe: a file with only that `TEST` yields `saved`), so the
  test file has no `stable`. `memory(3)` comes from the class name `InMemoryCreatures`.
- `--ngrams 2` adds `hit points(36)`, `per round(24)`, `feet per(24)`, `walking speed(18)`, `encounter tally(15)`,
  `critical hit(6)`, `dice roll(6)`, `glancing blow(3)` and others; the single words stay.
- German words (`Zentaurenhöhle.hpp`): 5 of the 7 appear, 2 of them only through identifiers.

  | word | found | how |
  | --- | --- | --- |
  | zentaurenhöhle | 6 | class name and constructor (identifier weight 3 each); the comment occurrence is cut into `zentaurenh(2)` + `hle` |
  | rüstungsklasse | 6 | field and parameter; the comment occurrence becomes `stungsklasse(2)` |
  | verlies | 2 | comment |
  | trefferpunkte | 2 | comment |
  | kreatur | 2 | comment |
  | größe | - | string `Größe der Höhle` yields only `der(1)` and `hle(1)` |
  | höhle | - | cut to `hle` |

  Identifiers keep their umlauts; comments and strings are split at every `ä ö ü ß`, and pieces shorter than three
  letters vanish (`gehören` -> `geh(2)`, `ren(2)`). The include path `"../model/Zentaurenhöhle.hpp"` in
  `EncounterEdgeCases.cpp` is cut the same way (`zentaurenh(1)`, `hle(1)`). German stop words are not filtered:
  `die(2)`, `unter(2)`, `dem(2)`, `und(2)`, `jeder(2)`, `der(1)`, also `liegt(2)`; only the two-letter `zu` is gone.

## Extension variants

| extension | unified parser | dependency parser | domain language parser |
| --- | --- | --- | --- |
| `.cpp`, `.hpp` | analysed | analysed | analysed |
| `.cc` | analysed | analysed | analysed |
| `.cxx` | analysed | analysed | analysed |
| `.c++` | analysed | analysed | skipped silently |
| `.hh` | analysed | analysed | skipped silently |
| `.hxx` | analysed | analysed | analysed |
| `.h++` | skipped, named in the "not supported" message | skipped silently | analysed |
| `.h` | analysed as C: wrong values | analysed as C++: edge found | analysed as C: `public`, `variants` leak |

## Changed since 2026-09-06

- The domain lens no longer has folder and root nodes. The earlier report read the 17 words and all leakage from the
  root node (37 files, 55 nodes); today the lens has exactly one node per file (46), so project-level numbers have to be
  summed by the reader. Words now carry a `tfidf` value. `--no-technical-stopwords` and `--ngrams` were not covered
  before.
- Corrected: `memory(3)` was attributed to `#include <memory>`; it comes from `InMemoryCreatures`. System includes in
  angle brackets are not counted (probe).
- Leaf kinds are written in lower case (`class`, `enum`); the earlier report quoted `CLASS` / `ENUM` (the earlier raw
  output is not available, so whether the casing changed is not verified).
- Everything else of the earlier dependency report still holds: the 46 file edges of round 2 are all present with the
  same flags (62 = 46 + 16 new), the same expected edges are missing, the same 3 edges point to `dto/Creature.hpp`,
  `Application.hpp` and `CentaurRepository.hpp` are still absent from the tree, the test file still yields 4 edges and
  none to `CreatureService`, test detection is still by directory only.
- Still true for the domain parser: weight 0 aborts with a stack trace, include paths are counted (`hpp` 65 -> 91 with
  the new files), `rollD20` loses its `d`, the gtest test name is not extracted.
- New on old files (the unified parser was not part of the earlier report): complexity of declaration-only headers,
  `CreatureFacade.cpp` and `CreatureServiceTest.cpp` complexity inflated by constructor-call declarations.

## Verdict

### Unified parser

- Missing:
  1. `variants/HippogriffNest.h++`: the extension is not supported (reported in the run message). **Decision: accept.**
  2. `EncounterEdgeCases.cpp` `defaultArguments(int roll, int bonus = 2, bool advantage = false)`: parameters with a
     default value are not counted (1 instead of 3). **Decision: accept (derived from JavaScript).**
  3. `EncounterEdgeCases.cpp` `variadicTemplate(Rolls... rolls)`: a parameter pack is not counted (0 instead of 1). **Decision: accept (derived from Java).**
- Wrong:
  1. Complexity of declarations: every function prototype adds +1 complexity without being a function
     (`EncounterEdgeCases.hpp` `int misses() const noexcept;`, `static EncounterTally empty();`, `int size() const;`,
     `virtual int score() const = 0;`; `CreatureFacade.hpp` 0 functions / complexity 4). `complexity` is therefore not
     `logic_complexity` + functions in any header. **Decision: ignore.**
  2. Pointer and reference return types add +1 complexity: `const char* multiLineRawString()`,
     `const wchar_t* prefixedStrings()`, `EncounterTally& operator+=`, `std::ostream& operator<<`,
     `Creature.hpp` `const CreatureId& getId()`. **Decision: accept.**
  3. Local variables constructed with parentheses are read as function declarations: `CreatureFacade.cpp`
     `domain::model::Creature creature(domain::model::CreatureId(generateUuid()), type);` adds +3 complexity,
     `CreatureService service(creatures);` in the test +1. **Decision: ignore.**
  4. `OwlbearNest.h`: a C++ header with the `.h` extension is parsed as C and reports 2 functions, complexity 4 and
     0 parameters instead of 1 / 2 / 1. **Decision: accept.**
  5. `default:` counts as a branch: `EncounterResolver.hpp` `resolve` (logic 15 instead of 14),
     `EncounterEdgeCases.cpp` `switchFallthrough`. **Decision: ignore (derived from Java).**
  6. Lambdas stored in a variable count as functions (`capped`, `strongerFirst`, `beats`, `outer`, `inner`,
     `criticalHit`, `total`): `EncounterResolver.hpp` number_of_functions 7 instead of 5. A lambda passed directly as
     an argument does not, and the per-function statistics ignore both. **Decision: accept (derived from Java).**
  7. `EncounterEdgeCases.cpp` `functionPointerParameter(int (*combine)(int, int), int roll)`: 4 parameters and +1
     complexity; `EncounterWitness::store` likewise. `voidParameterList(void)`: 1 parameter. **Decisions derived from Objective-C: accept — a function pointer parameter adds its own parameters; ignore — `(void)`.**
  8. `EncounterEdgeCases.hpp` `explicit operator bool() const`: complexity 3 instead of 2. **Decision: accept.**
  9. `EncounterEdgeCases.hpp` `= default`, `= delete` and the defaulted destructor of `Scorable` count as functions
     (also `Fightable.hpp`, `Creatures.hpp`). **Decision: ignore.**
- Bad:
  1. `*_complexity_per_function` leaves out the function's own +1 while `complexity` includes it, and adds +1 for a
     nested lambda: `isEmpty` has 0, `safeRoll` 3. The two metrics cannot be compared. **Decision: ignore (derived from Java).**
  2. `EncounterEdgeCases.cpp` `disabledRoll` under `#if 0` is counted as function, complexity and rloc. **Decision: ignore.**
  3. With a non-UTF-8 locale `Zentaurenhöhle.hpp` is dropped without a message. **Decision: accept (derived from Java).**
  4. The `.gitignore` of the repository is not used when a sub-folder is analysed; redirected progress output is
     one line per file with a counter that jumps back. **Decision derived from Kotlin: ignore — `.gitignore` of the repository not used.** **Decision derived from JavaScript: ignore — progress output.**
- Good: loc, rloc and comment_lines are exact in all 47 files, including comment markers in strings and raw strings,
  char literals, digit separators, backslash-continued comments and all four doc comment syntaxes. `if`, `else if`,
  `if constexpr`, `if` with initializer, range-for, classic `for`, `while`, `do … while`, `case`, ternary and nested
  ternary, `&&`, `||`, `and`, `or`, every `catch` including function try blocks of functions and constructors, `goto`
  loops, `co_yield` loops, all three `#if` branches. `&&` in `requires` and in rvalue references is not counted.
  Constructors, destructors, operators, user-defined literals, templates, specializations, out-of-line members, local
  class methods are functions. `long_method`, `long_parameter_list`, `message_chains` (5 yes, 3 no),
  `excessive_comments`, rloc per function and the parameter statistics of `EncounterResolver.hpp` are right.
  `.cc .cxx .c++ .hh .hxx` behave like `.cpp`.

### Dependency parser

- Missing:
  1. `Type::member` in a function body: `EncounterResolver.hpp` `model::SpeedType::WALKING`, `EncounterWitness::isDragon`
     `model::CreatureType::DRAGON`, `PersistedCreatures.cpp` `CreatureFacade::STANDARD_CREATURE_TYPE`,
     `CreatureFacade.cpp` `HitPoints::init(...)`. **Decision: accept (derived from Java).**
  2. Everything outside a class: free functions (`rollD20`, `freeFunctionUse`), namespace-scope variables
     (`lastAttacker`), gtest `TEST` bodies; with `--include-tests` the edge `CreatureServiceTest -> CreatureService`. **Decision: accept (derived from Kotlin).**
  3. Aliases: `using Entity = CreatureEntity;` (`CreatureRepository.hpp`), `typedef` (`EntityMapper.hpp`). **Decision: accept (derived from Kotlin).**
  4. `EncounterWitness`: `typeid(model::Fightable)`, `using enum model::SpeedType;`, lambda parameter
     `const model::ArmorClass&`, temporary `model::Dice{6}`, pointer to member `&model::Zentaurenhöhle::rüstungsklasse`,
     member function pointer parameter `int (CreatureService::*)() const`, constrained template parameter
     `std::derived_from<Creatures>`. **Decision: accept (derived from Java).**
  5. `catch (const NoSuchCreatureException&)` (`SafeCreatureLookup.hpp`). **Decision: accept (derived from Java).**
  6. `template <> class Repository<Centaur>` (`CentaurRepository.hpp`): no leaf, no edge, file absent. **Decision: accept.**
  7. `variants/HippogriffNest.h++`: not analysed, no message. **Decision: accept.**
  8. Test detection by file name (`*Test.cpp`, `*_test.cpp`). **Decision: accept.**
- Wrong:
  1. `CentaurInspector.hpp`, `CreatureDescriber.hpp`, `SafeCreatureLookup.hpp`: `domain::model::Creature` resolves to
     `application/dto/Creature.hpp`; `CreatureFacade` never reaches `dto::Creature`. **Decision: accept (derived from Java).**
  2. `EncounterEdgeCases.hpp`: the out-of-line definition `int Pool<Combatant>::size() const` creates a leaf
     `Pool<Combatant>` next to `Pool`. **Decision: accept.**
  3. Files without a declaration (`Application.hpp`, `CentaurRepository.hpp`) are absent from the tree. **Decision: accept (derived from Java).**
- Bad:
  1. Header / source fold: the leaf sits on the `.cpp`, the header of the pair is a 0 / 0 node (`Creature.hpp`,
     `ArmorClass.hpp`, `CreatureService.hpp`, `CreatureFacade.hpp`, `PersistedCreatures.hpp`; `EncounterTally` sits on
     `EncounterEdgeCases.cpp`). **Decision: ignore.**
  2. `EncounterEdgeCases.cpp#Counter`: a function-local struct is a leaf. **Decision: accept (derived from Java).**
  3. Every leaf edge has usage `usage`; inheritance is not distinguished. **Decision: ignore — documented (derived from Kotlin).**
  4. With a non-UTF-8 locale `Zentaurenhöhle.hpp` is dropped without a message. **Decision: accept (derived from Java).**
- Good: no new false positive. Types in signatures, fields, base lists, template arguments (also of a call in a body),
  local variable declarations, `new`, `sizeof`, `alignof`, casts, default arguments, trailing return types, friend
  declarations and forward declarations resolve. Umlaut type names resolve. std / boost / spdlog / gtest never leak.
  Cycles and upward edges are flagged as expected. `.cc .cxx .c++ .hh .hxx .h` are analysed as C++.

### Domain language parser

- Missing:
  1. No root or folder node: the lens has file nodes only, a project-level word list is not in the output. **Decision: ignore (derived from Java).**
  2. `variants/ManticoreNest.hh` and `variants/ChimeraNest.c++` are skipped without a message. **Decision: accept.**
  3. Macro names: `#define TROGLODYTE_BONUS`, `RETURN_ZERO_IF_FUMBLED` in `EncounterEdgeCases.cpp` yield no word. **Decision: accept.**
  4. gtest name `should_save_creature_to_the_stable` in `CreatureServiceTest.cpp`. **Decision: ignore.**
  5. German stop words: `die, unter, dem, und, jeder, der` in `Zentaurenhöhle.hpp` are not filtered. **Decision: ignore (derived from Java).**
- Wrong:
  1. Umlauts in comments and strings cut the word: `Zentaurenhöhle` -> `zentaurenh` + `hle`, `Rüstungsklasse` ->
     `stungsklasse`, `gehören` -> `geh` + `ren`, `Größe` and `Höhle` -> nothing but `hle`. Identifiers are kept whole. **Decision: accept (derived from Java).**
  2. Escape sequences in strings: `"ghoul\nbanshee\tspectre"` in `EncounterEdgeCases.cpp` -> `nbanshee`, `tspectre`. **Decision: accept.**
  3. `#include "..."` paths are counted as strings: `hpp(91)`, `model`, `domain`, `sots`, `cellarsandcentaurs`. **Decision: accept (derived from Objective-C).**
  4. `OwlbearNest.h` is treated as C: `public(3)` and the namespace segment `variants(3)` leak. **Decision: accept.**
  5. `rollD20` in `Dice.hpp` -> `roll`, `20`, while `d20Roll` -> `d20`, `roll`. **Decision: ignore (derived from Java).**
- Bad:
  1. `--comment-weight 0` / `--string-weight 0` abort with a Java stack trace. **Decision: accept (derived from Java).**
  2. Doc comment tags leak: `brief(2)`, `param(2)` from `@brief` / `@param` in `EncounterEdgeCases.cpp`. **Decision: ignore (derived from Java).**
  3. Commented-out code counts as comment text (`cover(4)` in `EncounterResolver.hpp`). **Decision: ignore (derived from Java).**
  4. With a non-UTF-8 locale `Zentaurenhöhle.hpp` is dropped without a message. **Decision: accept (derived from Java).**
- Good: all 17 expected words are found, no C++ keyword, STL name, attribute or preprocessor directive leaks, raw
  string delimiters are not counted. Raw, multi-line raw, `u8`, `L` and adjacent string literals, attribute strings,
  doc comments, enum values and user-defined literal suffixes are extracted. Weights are visible (identifier 3,
  comment 2, string 1) and configurable. camelCase, snake_case, SCREAMING_SNAKE, PascalCase, acronym and kebab
  identifiers split correctly. `--exclude-tests`, the three stop word levels, `--no-technical-stopwords` and
  `--ngrams 2` work as described. `.cc .cxx .hxx .h++` are analysed as C++.

## Appendix A: expected file-level edges of rounds 1 and 2 (written before those runs, unchanged)

Paths relative to `src/de/sots/cellarsandcentaurs/` unless prefixed with `test/`.

- domain/model/Creature.hpp -> Fightable.hpp, CreatureId.hpp, CreatureType.hpp, ArmorClass.hpp, SpeedType.hpp, Speed.hpp, HitPoints.hpp
- domain/model/Creature.cpp -> Creature.hpp, Dice.hpp, application/Application.hpp, application/CreatureFacade.hpp (static member), CreatureId.hpp, CreatureType.hpp
- domain/model/Centaur.hpp -> Creature.hpp, Speed.hpp, CreatureId.hpp, CreatureType.hpp
- domain/model/ArmorClass.cpp -> ArmorClass.hpp, application/Application.hpp, application/CreatureUtil.hpp (static member)
- domain/model/NoSuchCreatureException.hpp -> CreatureId.hpp
- domain/model/Dice.hpp -> (none)
- domain/service/Creatures.hpp -> Creature.hpp, CreatureId.hpp
- domain/service/CreatureService.hpp -> Creatures.hpp, Creature.hpp, CreatureId.hpp
- domain/service/CreatureService.cpp -> CreatureService.hpp, Creatures.hpp, Creature.hpp, CreatureId.hpp
- adapter/persistence/CreatureRepository.hpp -> CreatureEntity.hpp (alias `Entity`), Repository.hpp (generic base)
- adapter/persistence/PersistedCreatures.hpp -> Creatures.hpp (implements), Creature.hpp, CreatureId.hpp, CreatureRepository.hpp
- adapter/persistence/PersistedCreatures.cpp -> PersistedCreatures.hpp, CreatureRepository.hpp, CreatureEntity.hpp, Creature.hpp, CreatureId.hpp, NoSuchCreatureException.hpp, application/Application.hpp, application/CreatureFacade.hpp (static member)
- application/CreatureUtil.hpp -> Creature.hpp, HitPoints.hpp (Fightable.hpp is included but unused: ideally no edge)
- application/CreatureFacade.hpp -> ArmorClass.hpp, Creature.hpp, CreatureType.hpp, Speed.hpp, CreatureService.hpp, dto/Creature.hpp
- application/CreatureFacade.cpp -> CreatureFacade.hpp, Creature.hpp, CreatureId.hpp, CreatureType.hpp, Speed.hpp, SpeedType.hpp, ArmorClass.hpp, HitPoints.hpp, CreatureService.hpp, dto/Creature.hpp
- application/Application.hpp -> CreatureFacade.hpp, CreatureUtil.hpp (umbrella header = barrel)
- test/.../CreatureServiceTest.cpp -> CreatureService.hpp, Creatures.hpp, Creature.hpp, CreatureId.hpp, CreatureType.hpp, Speed.hpp, SpeedType.hpp, NoSuchCreatureException.hpp (only with --include-tests)

Expected upward edges: Creature.cpp, ArmorClass.cpp and PersistedCreatures.cpp -> application/*.
Expected cycle (declaration level): Creature -> CreatureFacade -> CreatureService -> Creature; at file level it only closes if the
parser treats Creature.hpp and Creature.cpp as one unit.
No internal edge expected for: std::*, boost::uuids::*, spdlog::*, gtest.

### Round 2 additions to the expected file-level edges (written before the round-2 run)

Every form lives in a new header-only file so that the form is the only path from that file to its target (`#include`s
are neutral, see #9: an include alone never yields an edge). Paths as above.

- domain/model/Lair.hpp -> Creature.hpp (forward declaration `class Creature;`, `Creature*` member, no include)
- application/CreatureDescriber.hpp -> domain/model/Creature.hpp (using-declaration `using domain::model::Creature;`, then unqualified `Creature`)
- adapter/persistence/SpeedMapper.hpp -> domain/model/Speed.hpp (namespace alias `namespace model = de::sots::cellarsandcentaurs::domain::model;`, then `model::Speed`)
- adapter/persistence/EntityMapper.hpp -> CreatureEntity.hpp (`typedef CreatureEntity Entity;`, then `Entity` in a signature)
- application/TreasureLedger.hpp -> application/CreatureUtil.hpp (`friend class CreatureUtil;`, nothing else)
- application/CentaurInspector.hpp -> domain/model/Centaur.hpp (`dynamic_cast<const Centaur*>` / `static_cast<Centaur*>` only); also -> Creature.hpp (parameter type, not a new form)
- domain/service/CentaurHerd.hpp -> domain/model/Centaur.hpp (`std::vector<model::Centaur>` member only)
- application/SafeCreatureLookup.hpp -> domain/model/NoSuchCreatureException.hpp (`catch (const NoSuchCreatureException&)` only); also -> Creature.hpp, CreatureId.hpp, domain/service/CreatureService.hpp (signature types, not new forms)
- application/CreatureTrace.hpp -> domain/model/Dice.hpp (`#include` and a `Dice` member both under `#ifdef CELLARS_TRACE_ROLLS`)
- adapter/persistence/CentaurRepository.hpp -> Repository.hpp and -> domain/model/Centaur.hpp (`template <> class Repository<domain::model::Centaur>`; the file name differs from the declaration, and the leaf key collides with the primary template's)

No new cycle and no new upward edge is expected. No round-1 edge should change; the one open risk is the duplicate leaf key
`adapter.persistence.Repository` (primary template plus specialization), which could move the `Repository` leaf or the
`CreatureRepository -> Repository` edge, and the forward declaration in `Lair.hpp`, which could be taken for a second
`domain.model.Creature` declaration.

## Appendix B: round 3 expectations (2026-10-08, written before any parser ran, unchanged)

### Unified parser: `domain/service/EncounterResolver.hpp`

Header-only class, five in-class methods. C++ has no nested named function and no `finally`: `initiativeOrder` holds a
named lambda (`strongerFirst`) instead, `safeRoll` a `try` / `catch` only. Per-function rloc is counted from the signature
line to the closing brace, comment-only lines left out. Logic inside a lambda is credited to the enclosing function, the
lambda's own +1 only to the file.

| metric | expected |
| --- | --- |
| logic_complexity | 14 (resolve 11: if, else if, for, if, &&, while, 3 case, ternary, \|\|; safeRoll 2: if, catch; initiativeOrder 1: if) |
| complexity | 21 (14 + 5 methods + 2 lambdas) |
| number_of_functions | 5 |
| loc / rloc / comment_lines | 99 / 77 / 13 (10 blank, 12 comment-only, 1 line with code and trailing comment) |
| parameters per function max / min / mean / median | 5 / 0 / 1.6 / 1 |
| complexity per function max / min / mean / median | 12 / 1 / 3.8 / 2 (resolve 12, describe 1, safeRoll 3, initiativeOrder 2, isEmpty 1) |
| rloc per function max / min / mean / median | 36 / 3 / 12.4 / 8 (resolve 36, describe 5, safeRoll 8, initiativeOrder 10, isEmpty 3) |
| long_method | 1 (resolve) |
| long_parameter_list | 1 (resolve) |
| message_chains | 1 (the chain of 5 in describe; the chain of 3 must not count) |
| excessive_comments | 1 |

### Unified parser: `EncounterEdgeCases.hpp` / `.cpp`

Every construct is preceded by a `// case: <construct> | functions F, parameters P, complexity C` line; that line is the
expectation (C = logic + named functions + lambdas of the construct). File totals:

| file | functions | complexity | logic | loc / rloc / comment_lines | max parameters |
| --- | --- | --- | --- | --- | --- |
| EncounterEdgeCases.hpp | 11 | 16 | 5 | 89 / 52 / 18 | 2 |
| EncounterEdgeCases.cpp | 55 | 91 | 31 (91 - 55 functions - 5 lambdas) | 402 / 301 / 53 (1 line both) | 3 |

Judgement calls in these numbers: `= default`, `= delete`, pure virtual and plain declarations are no functions; the three
`if`s in the `#if` / `#elif` / `#else` branches all count; the function inside `#if 0` counts neither as function nor as
complexity, its lines count as rloc; the ternary and the `if` inside `#define` bodies count nothing and neither do the
macro calls; `&&` in a `requires` clause and in `std::vector<int>&&` is no logic; `and` / `or` are logic like `&&` / `\|\|`;
the `...` of a C variadic function is no parameter; text inside string and raw string literals is code, never a comment;
the line after a `// ... \` comment is a comment line.

Other new files: `Zentaurenhöhle.hpp` 1 function (constructor) + 1 (`beschreibung`) = 2 functions, complexity 2,
loc / rloc / comment_lines 17 / 10 / 1. Each of the seven `variants/*Nest.*` files: 1 function, complexity 2, 1 parameter,
comment_lines 1, loc / rloc 16 / 12 (`.cc .cxx .c++`) or 18 / 13 (`.hh .hxx .h++ .h`).

### Dependency parser: expected file edges of the new files

- domain/service/EncounterResolver.hpp -> Creature (parameter type), Dice.hpp (parameter type), SpeedType.hpp (`model::SpeedType::WALKING` in a body only)
- domain/service/EncounterEdgeCases.cpp, class `EncounterWitness`, one construct per target:
  Centaur.hpp (`std::make_unique<model::Centaur>()`), HitPoints.hpp (`sizeof`), Fightable.hpp (`typeid`), Speed.hpp (local
  variable), CreatureType.hpp (`model::CreatureType::DRAGON` in a body), SpeedType.hpp (`using enum`), ArmorClass (lambda
  parameter), Dice.hpp (`model::Dice{6}` temporary and `-> model::DiceRoll` trailing return type), Lair.hpp (`new`),
  Zentaurenhöhle.hpp (pointer to member), CentaurHerd.hpp (`alignof`), CreatureService (member function pointer
  parameter), Creatures.hpp (concept argument `std::derived_from<Creatures>`), CreatureId.hpp (default argument),
  EncounterResolver.hpp (friend function declaration)
- domain/service/EncounterEdgeCases.cpp outside a class: NoSuchCreatureException.hpp (parameter of the free function
  `freeFunctionUse`), Creature (namespace-scope variable `lastAttacker`), EncounterEdgeCases.hpp (out-of-line
  `EncounterTally::misses` / `::empty`, expected to fold into one unit with the header)
- variants/GriffinNest.cc, BasiliskNest.cxx, ChimeraNest.c++, ManticoreNest.hh, CockatriceNest.hxx, HippogriffNest.h++,
  OwlbearNest.h -> domain/model/Speed.hpp each (7 edges)
- Zentaurenhöhle.hpp and EncounterEdgeCases.hpp: no outgoing edge

That is 3 + 17 (16 `EncounterWitness` / free targets to other files, `Dice.hpp` counted once, plus the own header) + 7 = 27
new file edges at most; no new cycle, no new upward edge. Expected leaves: EncounterResolver, EncounterTally, Pool,
Scorable, RollAwaiter, EncounterWitness (CLASS), Outcome (ENUM), Zentaurenhöhle, the seven `*Nest` classes.

### Domain language parser: expected words of the new files

- the 17 shared words stay at the root
- German (`Zentaurenhöhle.hpp`): zentaurenhöhle, verlies, rüstungsklasse, trefferpunkte, kreatur, größe, höhle, each as
  one uncut word; `die`, `unter`, `dem`, `und`, `jeder` should not appear
- one planted word per variant file: griffin (.cc), basilisk (.cxx), chimera (.c++), manticore (.hh), cockatrice (.hxx),
  hippogriff (.h++), owlbear (.h)
- `EncounterEdgeCases.cpp`: wraith, wyvern (raw string), ghoul / banshee / spectre (around `\n` and `\t`), hydra / gorgon
  (adjacent literals), ogre / troll (multi-line raw string), minotaur (`u8""`), kobold (`L""`), troglodyte (macro name),
  sphinx (doc comment with tags), phoenix (attribute string), fathoms (user-defined literal), glancing / blow / fumble
  (enum values)
- must not appear: nbanshee, tspectre, scroll (raw string delimiter), brief, param, nodiscard, maybe, unused, deprecated,
  fallthrough, co, await, yield, constexpr, noexcept, typename, template, requires, nullptr, sizeof, typeid, alignof,
  pragma, once, include, define, endif, elif, defined
