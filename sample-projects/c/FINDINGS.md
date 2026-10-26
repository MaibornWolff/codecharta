# C

Report of 2026-10-08 (round 3). All numbers come from the runs in `output/`; `inc` abbreviates
`include/de/sots/cellarsandcentaurs`. Expected values were written into this file before the first run and are
unchanged, except where a row says "own count corrected".

## Project
- Layout: `inc/<layer>/*.h` (33 headers, one of them `GARGOYLE.H`), `inc/domain/model/creature_types.inc`,
  `src/<layer>/*.c` (16 sources, one of them `LAIR_KEEPER.C`), `test/creature_service_test.c`: 51 files.
  snake_case file and function names, PascalCase typedef names, all includes relative.
- Structs stand in for classes, structs of function pointers for the interfaces (`Fightable`, `Creatures`),
  `Creature base;` as first member for `Centaur extends Creature`, `application.h` (includes only) is the barrel,
  `domain/model/model.h` the umbrella header.
- Round 3 added 9 files: `inc/domain/service/encounter_resolver.h`, `src/domain/service/encounter_resolver.c`,
  `inc/domain/service/encounter_edge_cases.h`, `src/domain/service/encounter_edge_cases.c`,
  `inc/domain/model/zentaurenhoehle.h`, `src/domain/model/zentaurenhoehle.c` and the extension variants
  `inc/domain/model/creature_types.inc` (X-macro fragment), `src/domain/model/LAIR_KEEPER.C`,
  `inc/domain/model/GARGOYLE.H`. `git check-ignore -v` reports none of them.
- Stress constructs present from rounds 1 and 2: barrel / upward includes, inheritance and interface by composition,
  alias `typedef CreatureEntity Entity;`, umbrella header, macro generic `REPOSITORY_OF(Entity)`, type only in a
  prototype / compound literal / global constant, two `Creature` structs (`domain/model/creature.h`,
  `application/dto/creature.h`), forward declaration `struct Creature;`, unused include, system headers, test file,
  `Dice` + `DiceRoll` + `roll_d20` in `dice.h`, conditional include, opaque pointer, `.c` including a `.c`, macro as
  field type, `extern const` global, macro-only header.
- C does not have: import aliases, wildcard imports, generics, static members, annotations, namespaces, qualified
  names, interfaces, inheritance, methods, exceptions, lambdas, nested functions. Stand-ins in `encounter_resolver.c`:
  a struct of function pointers returning the struct for the method chains (`text->append(…)->number(…)…`),
  `setjmp` / `longjmp` with `if` / `else` for `try` / `catch` (no `finally`), a `static` callback `roll_or_throw`
  assigned to a function pointer for the lambda (so the file has 6 named functions instead of 5), no nested function,
  an opaque `struct EncounterResolver` carrying the 6-line doc comment, `encounter_resolver_is_empty(void)` for the
  0-parameter function.
- Extension variants: no parser lists a rarer extension for C than `.c` / `.h` (`.cc .cxx .hh .hxx .h++` belong to
  C++). Added instead what occurs in C code bases: `.inc`, and the upper-case `.C` / `.H`.

## Unified parser
- Command from the README: exit 0, 48 files analysed (32 `.h`, 16 `.c`), message
  `3 Files with the following extensions were ignored as they are currently not supported: [.C, .inc, .H]`.
  Variant runs: `output/unified-resolver-split.cc.json` and `output/unified-edge-cases-split.cc.json` (each top-level
  block of the two files as its own file, used to attribute the numbers per function), both exit 0.

| Extension | unified | dependency | domain |
| --- | --- | --- | --- |
| `.c` | analysed | analysed | analysed |
| `.h` | analysed | analysed | analysed |
| `.C` (`LAIR_KEEPER.C`) | skipped, named in the message | analysed (leaf `LairKeeper`, edge to `lair.h`) | analysed |
| `.H` (`GARGOYLE.H`) | skipped, named in the message | analysed (leaf `Gargoyle`, edge to `hit_points.h`) | analysed |
| `.inc` (`creature_types.inc`) | skipped, named in the message | skipped silently | skipped silently |

### `src/domain/service/encounter_resolver.c`

Expected per function (params, logic, complexity, rloc): `encounter_resolver_resolve` 5 / 11 / 12 / 34,
`encounter_resolver_describe` 1 / 0 / 1 / 4, `roll_or_throw` 1 / 1 / 2 / 4, `encounter_resolver_safe_roll` 1 / 1 / 2 / 8,
`encounter_resolver_initiative_order` 1 / 1 / 2 / 4, `encounter_resolver_is_empty` 0 / 0 / 1 / 1. Own rule fixed before
the run: rloc of a function = code lines strictly between its braces.

| Metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| logic_complexity | 14 | 15 | wrong: `default:` counts like a `case` |
| complexity | 20 | 23 | wrong: +1 `default:`, +1 for `const char *encounter_resolver_describe(…)` (a pointer return type counts the function twice), +1 for the local `int (*roll)(const Dice *)` |
| number_of_functions | 6 | 6 | ok |
| loc | 104 | 104 | ok |
| rloc | 83 | 83 | ok |
| comment_lines | 13 | 13 | ok |
| max / min / mean / median parameters | 5 / 0 / 1.5 / 1 | 5 / 1 / 1.67 / 1 | wrong: `(void)` counts as 1 parameter |
| max / min / mean / median complexity per function | 12 / 1 / 3.33 / 2 | 12 / 0 / 2.67 / 1 | wrong: per function the values are 12, 0, 1, 2, 1, 0, i.e. without the +1 for the function itself, with `default:` and with the function pointer variable; the maximum only matches because two errors cancel |
| max / min / mean / median rloc per function | 34 / 1 / 9.17 / 4 | 34 / 1 / 9.17 / 4 | ok |
| long_method | 1 | 1 | ok |
| long_parameter_list | 1 | 1 | ok |
| message_chains | 1 | 1 | ok (5-call chain counted, 3-call chain not) |
| excessive_comments | 1 | 1 | ok |

`encounter_resolver.h`: expected 0 functions, complexity 0, loc 40, rloc 30, comment_lines 0; reported 0 / **9** / 40 /
30 / 0. The 9 are the 6 prototypes and the 3 function pointer fields of `struct TextBuilder`.

### `src/domain/service/encounter_edge_cases.c`

Expected and reported as params / logic / complexity; reported values from the split run. Own rules fixed before the
run: preprocessor conditions add nothing, code under `#if 0` adds nothing, a function-like macro is no function but
the `if` / loop / `?:` in its replacement text count once at the `#define`, `...` is no parameter, `f(void)` and `f()`
have 0 parameters.

| Construct (function) | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| prototype `static int edge_forward_declared(int roll);` | no function, complexity 0 | no function, complexity 1 | wrong: a prototype adds 1 to complexity |
| `do … while` (`edge_do_while`) | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `goto` + label (`edge_goto`) | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `switch`, stacked labels, fallthrough, 4 `case` + `default` (`edge_switch_fallthrough`) | 1 / 4 / 5 | 1 / 5 / 6 | wrong: `default:` counted |
| `#ifdef` / `#else`, each with an `if`, one `&&` (`edge_ifdef_branches`) | 1 / 3 / 4 | 1 / 3 / 4 | ok (both branches counted) |
| `#if defined(…) && … #elif … \|\| …` (`edge_if_defined`) | 0 / 0 / 1 | 1 / 2 / 3 | wrong: `&&` and `\|\|` of the preprocessor conditions counted; `(void)` = 1 parameter |
| `#if 0` around `edge_disabled` | no function | 1 function, 1 / 1 / 2 | wrong: disabled code is counted like live code |
| macro invocations (`edge_macro_user`) | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| `EDGE_DEFINE_GETTER(depth)` generating `edge_get_depth` | 1 function, 1 / 0 / 1 | no function, 0 | missing |
| function pointer parameter `int (*compare)(int, int)` (`edge_function_pointer_parameter`) | 3 / 0 / 1 | 5 / 0 / 2 | wrong: the inner `(int, int)` adds 2 parameters and 1 complexity; the file gets `long_parameter_list` 1 from it |
| callback target (`edge_compare_rolls`) | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| callback passed to `qsort` (`edge_callback`) | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| function returning a function pointer (`edge_returns_function_pointer`) | 1 / 1 / 2 | 3 / 1 / 3 | wrong: parameters of the returned type counted, declarator counted twice |
| `f(void)` (`edge_void_parameter`) | 0 / 0 / 1 | 1 / 0 / 1 | wrong: 1 parameter |
| `f()` (`edge_empty_parameter_list`) | 0 / 0 / 1 | 0 / 0 / 1 | ok |
| variadic `(int count, ...)` (`edge_variadic`) | 1 / 1 / 2 | 1 / 1 / 2 | ok (`...` not a parameter) |
| K&R definition (`edge_knr_definition`) | 2 / 1 / 2 | 0 / 1 / 2 | wrong: 0 parameters; the function itself is found |
| definition after its prototype (`edge_forward_declared`) | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| array parameters (`edge_array_parameters`) | 3 / 2 / 3 | 3 / 2 / 3 | ok |
| `__attribute__((unused))` (`edge_attribute`) | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| comment inside the parameter list (`edge_commented_parameters`) | 2 / 0 / 1, 1 comment line | same | ok |
| one-line definition (`edge_one_liner`) | 1 / 1 / 2, rloc 0 | 1 / 1 / 2, rloc 1 | ok; rloc 1 is the better answer than my 0 |
| `{}` (`edge_empty_body`) | 0 / 0 / 1, rloc 0 | 1 / 0 / 1, rloc 0 | wrong parameter count (`void`) |
| nested `?:` (`edge_nested_ternary`) | 1 / 2 / 3 | 1 / 2 / 3 | ok |
| bitwise `&`, `\|`, `^`, address-of (`edge_bitwise_operators`) | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `&&`, `\|\|` in an assignment (`edge_short_circuit_assignment`) | 3 / 2 / 3 | 3 / 2 / 3 | ok |
| `for (;;)` with `if` / `break` (`edge_infinite_loop`) | 1 / 2 / 3 | 1 / 2 / 3 | ok |
| `if` / `else if` / `else if` / `else` (`edge_else_if_chain`) | 1 / 3 / 4 | 1 / 3 / 4 | ok |
| Duff's device (`edge_duffs_device`) | 1 / 5 / 6 | 1 / 5 / 6 | ok |
| `_Generic` with `default:` (`edge_generic_selection`) | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| comment markers in strings (`edge_comment_markers_in_strings`) | 0 / 1 / 2, 0 comment lines | 1 / 1 / 2, 0 comment lines | comments ok; `(void)` = 1 |
| backslash-continued `//` comment, string, statement (`edge_line_continuation`) | 1 / 0 / 1, 2 comment lines | same | ok |
| adjacent, escaped, format, wide strings (`edge_string_forms`) | 1 / 1 / 2 | 1 / 1 / 3 | wrong: `const char *` return type counts the function twice |
| six comment syntaxes, two trailing comments (`edge_comment_syntaxes`) | 0 / 0 / 1, 7 comment lines | 1 / 0 / 1, 7 comment lines | comments ok; `(void)` = 1 |
| `struct Lair *`, `enum SpeedType` parameters (`edge_tag_reference`) | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| cast, `sizeof(union …)` (`edge_cast_and_sizeof`) | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| compound literal (`edge_compound_literal`) | 0 / 0 / 1 | 1 / 0 / 1 | `(void)` = 1 |

| File metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| number_of_functions | 35 | 35 | right by accident: `edge_get_depth` missing, `edge_disabled` counted |
| logic_complexity | 31 | 35 | +1 `default:`, +2 preprocessor conditions, +1 `#if 0` |
| complexity | 66 | 74 | the 4 above, +1 prototype, +1 function pointer parameter, +2 pointer-returning functions |
| loc / rloc / comment_lines | 283 / 237 / 10 | 283 / 237 / 10 | ok |
| max / min / mean / median parameters | 3 / 0 / 1.14 / 1 | 5 / 0 / 1.37 / 1 | see rows above (sum 48 instead of 40) |
| max / min / mean / median complexity per function | 6 / 1 / 1.89 / 1 | 5 / 0 / 1 / 1 | own +1 of each function not included |
| max rloc per function | 14 | 15 | own count corrected: `edge_switch_fallthrough` and `edge_duffs_device` both have 15 body lines, I miscounted |
| long_method | 2 | 2 | ok |
| long_parameter_list | 0 | 1 | wrong (`edge_function_pointer_parameter`) |
| message_chains / excessive_comments | 0 / 0 | 0 / 0 | ok (exactly 10 comment lines) |

`encounter_edge_cases.h`: expected number_of_functions 1 (`static inline edge_inline_bonus`), logic 4, complexity 5,
loc 58, rloc 46, comment_lines 0; reported 1 / **1** / **9** / 58 / 46 / 0. Logic: the `?:` in `EDGE_MAX` and the `do`
and `if` in `EDGE_CLAMP_ROLL` are not counted. Complexity: 1 logic + 1 function + 5 prototypes +
`typedef int edge_handler(int roll);` + `typedef int (*EdgeSpeedCallback)(const Speed *speed);`.

### Line counting
- loc, rloc and comment_lines match the hand count in every new file (`encounter_resolver.c` 104 / 83 / 13,
  `encounter_edge_cases.c` 283 / 237 / 10, `zentaurenhoehle.h` 17 / 10 / 3, `zentaurenhoehle.c` 12 / 10 / 0).
- `"// owlbear …"`, `"/* basilisk … */"`, `"http://…"` and `'/'` are not taken for comments. The second line of a
  backslash-continued `//` comment counts as comment, not as code. `/** */`, `/*! */`, `///`, `//!`, a block comment
  holding `//` and a line comment holding `/*` count one line each; a line with code and two trailing comments counts
  once for comment and once for code.

### Other files
- `zentaurenhoehle.c`: expected 2 functions, logic 1, complexity 3; reported 2 / 1 / **4** (`const char
  *zentaurenhoehle_beschreibung` counted twice). `zentaurenhoehle.h`: expected complexity 0, reported 2 (2 prototypes).
  The German comment and string cause no problem.
- 18 headers report complexity with `number_of_functions` 0, from prototypes and function pointer fields:
  `creature.h` 11, `encounter_resolver.h` 9, `armor_class.h` 4, `stable.h` 3, `creature_repository.h` 3,
  `fightable.h` 2, `creatures.h` 2 and 11 more.
- Pointer-returning functions inflate the old sources too: `creature.c` 13 functions, logic 0, complexity 18 (5
  functions return a pointer); `test/creature_service_test.c` 5 functions, logic 1, complexity 7.
- `min_parameters_per_function` is 1 in `dice.h` and `test/creature_service_test.c` although `roll_d20(void)`,
  `main(void)` and both test functions take no parameter.
- The test file is analysed like any other file; no metric marks it as a test.

## Dependency parser
- Commands: both README commands exit 0, no exception. Default run 49 files, `--include-tests` 50 files; the two
  `.cc.json` are byte-identical. `Found a total of 0 cycles`.
- Result: 24 file edges, 34 leaves, 25 leaf edges, 29 of 51 files in the tree. Expected 110 file edges (117 with
  tests): 71 from round 1, 13 from round 2 (recounted from the round-2 table; the 2026-09-06 report said 9) and 26 for
  the round-3 files. Of the 24 found, 21 are right and 3 point at the wrong file.
- Not in the tree (22): the 11 `.c` files without a struct (`creature.c`, `armor_class.c`,
  `no_such_creature_exception.c`, `default_creature.c`, `zentaurenhoehle.c`, `creature_service.c`,
  `encounter_edge_cases.c`, `creature_repository.c`, `persisted_creatures.c`, `creature_facade.c`, `creature_util.c`),
  `test/creature_service_test.c`, the 9 headers without a struct or enum body (`application.h`, `creature_util.h`,
  `model.h`, `repository.h`, `creature_repository.h`, `default_creature.h`, `dungeon_limits.h`, `stable.h`,
  `encounter.h`) and `creature_types.inc`.

### Expected file-level edges

An edge is expected when the file references a declaration of the target file (type in a field, parameter, return,
cast, compound literal, forward declaration) or calls a function / uses a constant or macro declared there. A bare
`#include` without use (`creature_util.h -> fightable.h`) is not expected; barrel and umbrella headers are. Member
access through a field (`defender->armor_class.total`) is not expected as an edge.

| from | to | found |
| --- | --- | --- |
| inc/domain/model/creature.h | creature_id.h, creature_type.h, armor_class.h, hit_points.h, speed.h, movement.h, fightable.h | 6 of 7 (`movement.h` missing) |
| inc/domain/model/fightable.h | creature.h (forward declaration) | 0 of 1 |
| inc/domain/model/centaur.h | creature.h, creature_id.h | 0 of 2; wrong edge to `application/dto/creature.h` |
| inc/domain/model/no_such_creature_exception.h | creature_id.h | 1 of 1 |
| inc/domain/model/model.h | 11 model headers | 0 of 11 |
| inc/domain/service/creatures.h | model/creature.h, creature_id.h | 1 of 2; wrong edge to `application/dto/creature.h` |
| inc/domain/service/creature_service.h | creatures.h, model/creature.h | 1 of 2 |
| inc/adapter/persistence/creature_repository.h | repository.h, creature_entity.h | 0 of 2 |
| inc/adapter/persistence/persisted_creatures.h | creature_repository.h, creatures.h | 1 of 2 |
| inc/application/creature_facade.h | creature_service.h, creature.h, creature_type.h, speed.h, armor_class.h | 2 of 5 |
| inc/application/creature_util.h | model.h, creature.h | 0 of 2 |
| inc/application/application.h | creature_facade.h, creature_util.h | 0 of 2 |
| 8 round-1 `.c` files | 32 edges | 0 of 32 |
| test/creature_service_test.c (`--include-tests`) | 7 edges | 0 of 7 |
| inc/domain/model/initiative.h | dice.h | 1 of 1 |
| src/domain/model/stable.c | stable.h | 0 of 1 |
| src/domain/model/centaur.c | dice_table.c, centaur.h, creature.h, creature_id.h | 1 of 4 |
| src/domain/model/dice_table.c | dice.h | 1 of 1 |
| inc/domain/model/lair.h | hit_points.h (macro as field type) | 0 of 1 |
| inc/domain/service/encounter.h | speed.h | 0 of 1 |
| inc/domain/model/default_creature.h, default_creature.c | creature.h; default_creature.h, creature.h | 0 of 3 |
| inc/domain/model/treasure.h | dungeon_limits.h | 0 of 1 |
| inc/domain/service/encounter_resolver.h (round 3) | model/creature.h, dice.h | 0 of 2; wrong edge to `application/dto/creature.h` |
| src/domain/service/encounter_resolver.c (round 3) | encounter_resolver.h, creature.h, dice.h, movement.h, hit_points.h | 0 of 5 (file is in the tree with 0 outgoing) |
| inc/domain/service/encounter_edge_cases.h (round 3) | speed.h, treasure.h, initiative.h, armor_class.h, hit_points.h, lair.h, movement.h, creature.h | 3 of 8 (`treasure.h`, `initiative.h`, `hit_points.h`) |
| src/domain/service/encounter_edge_cases.c (round 3) | encounter_edge_cases.h, centaur.h, creature.h, lair.h, movement.h, speed.h | 0 of 6 |
| inc/domain/model/zentaurenhoehle.h (round 3) | armor_class.h | 1 of 1 |
| src/domain/model/zentaurenhoehle.c (round 3) | zentaurenhoehle.h, armor_class.h | 0 of 2 |
| src/domain/model/LAIR_KEEPER.C (round 3) | lair.h | 1 of 1 |
| inc/domain/model/GARGOYLE.H (round 3) | hit_points.h | 1 of 1 |

### Construct table

| Construct | Expected edge(s) | Found | Verdict |
| --- | --- | --- | --- |
| alias `typedef CreatureEntity Entity;`, macro generic `typedef REPOSITORY_OF(Entity) CreatureRepository;` (`creature_repository.h`) | -> creature_entity.h, repository.h | file not in tree | missing |
| umbrella `model.h`, barrel `application.h` | include edges, 3 upward edges from `creature.c`, `armor_class.c`, `persisted_creatures.c` | none of the files in tree | missing |
| `Centaur { Creature base; }` (`centaur.h`) | -> domain/model/creature.h | -> application/dto/creature.h `[isPointingUpwards]` | wrong target |
| `void (*save)(void *self, Creature *creature)` field (`creatures.h`) | -> domain/model/creature.h | -> application/dto/creature.h `[isPointingUpwards]` | wrong target |
| `const Creature *creature;` field (`encounter_resolver.h`, round 3) | -> domain/model/creature.h | -> application/dto/creature.h `[isPointingUpwards]` | wrong target |
| struct fields `Fightable`, `Creatures port`, `CreatureService *`, `Speed`, `CreatureId`, `CreatureType`, `ArmorClass`, `HitPoints` | 12 edges | 12 | ok |
| type only in a prototype (`creature.h -> movement.h`, `creature_facade.h -> creature_type.h`, `armor_class.h`; `encounter_resolver.h -> dice.h`; `encounter_edge_cases.h -> creature.h`) | edges | none | missing |
| compound literal, global constant, function call, macro use in a `.c` file | edges from the `.c` files | files not in tree | missing |
| forward declaration `struct Creature;` + `struct Creature *self` (`fightable.h`) | fightable.h -> creature.h, the cycle | none | missing |
| tag references `struct Lair *`, `enum SpeedType` in a prototype (`encounter_edge_cases.h`) | -> lair.h, movement.h | none | missing |
| unused `#include "fightable.h"` (`creature_util.h`) | no edge | no edge, file not in tree | ok by accident |
| system headers | no edge | none | ok |
| `Dice`, `DiceRoll`, `roll_d20` in `dice.h`; `SpeedType` in `movement.h` | 2 class leaves, leaf edge, enum leaf | found; `roll_d20` no leaf | ok for the types |
| field under `#ifdef USE_DICE` (`initiative.h`) | -> dice.h | found | ok (treated as unconditional) |
| opaque `typedef struct Stable Stable;` completed in `stable.c`; `typedef struct EncounterResolver EncounterResolver;` completed in `encounter_resolver.c` | `.c` -> `.h` | leaves `stable.c#Stable`, `encounter_resolver.c#EncounterResolver`, no edge; `stable.h` not in tree | missing |
| `.c` including a `.c` (`centaur.c`, `dice_table.c`) | centaur.c -> dice_table.c | found | ok (by type name, not by include) |
| macro as field type (`lair.h`), macro as array size (`treasure.h`), `extern const Creature` (`default_creature.h`) | 3 edges | none, no false edge either | missing |
| union members `TreasureHoard hoard; Initiative initiative;` (`union EdgePayload`, round 3) | -> treasure.h, initiative.h | found, leaf `EdgePayload` kind `class` | ok |
| array field `HitPoints hit_points[2];` (`struct EdgeRoom`, round 3) | -> hit_points.h | found | ok |
| field of a nested anonymous struct `struct { ArmorClass armor; } guard;` (`struct EdgeRoom`, round 3) | -> armor_class.h | none | missing |
| function pointer typedef `typedef int (*EdgeSpeedCallback)(const Speed *speed);` (round 3) | -> speed.h | none, no leaf | missing |
| type inside a macro body, `const Lair *lair` in `EDGE_DEFINE_GETTER` (round 3) | -> lair.h | none | missing |
| self reference `const struct CreatureQueue *next;` (round 3) | no edge | none | ok |
| cast `(const Centaur *)`, `sizeof(union EdgePayload)`, compound literal `(Speed){…}`, function passed as callback (`encounter_edge_cases.c`, round 3) | 6 edges | file not in tree | missing |
| `struct TextBuilder {…}` after `typedef struct TextBuilder TextBuilder;`, `typedef enum Terrain` (round 3) | leaves | `TextBuilder` class, `Terrain` enum | ok |

- False positives: no edge without a real reference behind it. The three wrong edges are real `Creature` references
  resolved to `application/dto/creature.h`; that file has 3 incoming edges (expected 1, from `creature_facade.c`),
  `domain/model/creature.h` has 0 incoming.
- Cycles: expected 1 (`creature.h <-> fightable.h`), reported 0. Upward edges: expected 3 (`creature.c`,
  `armor_class.c`, `persisted_creatures.c` -> application), reported 3, all three the wrong-target edges.
- Leaf kinds: `typedef struct` and plain `struct X {…}` -> `class`, `typedef enum` -> `enum`, `union` -> `class`
  (no kind of its own). No leaf for functions, prototypes, macros, `extern` variables, `typedef` aliases, function
  pointer typedefs. `namespace` is `None` on every leaf. Levels are consistent with the reported edges.
- Language vs. CodeCharta: C has no module system; the `#include` graph is the dependency graph and is not turned
  into edges. Every edge in the output starts at a field of a struct or union and ends at a type of that name
  somewhere in the project, which is why a duplicated name lands on one file regardless of the includes.
- Known gaps of the name rules (`analysis/analysers/parsers/DependencyParser/docs/name-resolution/cpp.md`): listed
  per probe in `regression/c/known-gaps.md`.
- Tests: `test/creature_service_test.c` is dropped by default (49 instead of 50 files) but has no struct, so
  `--include-tests` changes nothing. Scratch probe (`output/probe-dependency.cc.json`): a struct-holding
  `src/wyvern_test.c`, `src/WyvernTest.c` and `src/test_wyvern.c` are analysed in the default run, `test/roost_check.c`
  is not; detection is by directory only. Same probe: `struct Roost *held;` gives no edge to `roost.h`, a
  function-only `.c` is not in the tree.

## Domain language parser
- Commands: README command exit 0, 50 files (all but `creature_types.inc`), 50 nodes. Variants in `output/`:
  `--exclude-tests` (49 nodes), `--stop-word-level MINIMAL`, `AGGRESSIVE`, `--no-technical-stopwords`, `--ngrams 2`,
  all exit 0. `--comment-weight 0` exits 1 with `IllegalArgumentException: --comment-weight must be positive, got 0`
  and a stack trace, so a context cannot be switched off.
- The lens holds a word list per file only (`lenses.domain.nodes` has 50 entries, the tree has 70 nodes); the root
  and the folders have none. The README check "must appear in the root node's word list" cannot be done on the
  output; the numbers below are sums over the 50 file lists.
- Expected words, 17 of 17 present: creature 515, speed 125, roll 96, armor 88, hit 75, encounter 70, points 69,
  dice 66, stable 62, centaur 57, lair 47, initiative 30, dungeon 21, damage 21, treasure 21, hoard 17, cellar 5.
- Keyword leakage: no C keyword appears (`struct`, `typedef`, `int`, `void`, `const`, `char`, `static`, `inline`,
  `return`, `enum`, `union`, `unsigned`, `sizeof`, `if`, `else`, `for`, `while`, `do`, `switch`, `case`, `default`,
  `break`, `goto`, `extern` all 0). From preprocessor lines: `include` 40 (the `#include "…"` path strings) and `use` 9
  (`USE_DICE`). `define` 3, `defined` 3, `ifdef` 3 come from my identifiers `EDGE_DEFINE_GETTER`, `edge_if_defined`,
  `edge_ifdef_branches`, not from directives. `class` 84 comes from `ArmorClass`, right for C.
- Technical words at MODERATE: `repository` 73, `facade` 45, `entity` 30 leak (they are only in the AGGRESSIVE list);
  `util`, `exception`, `service`, `test`, `mock` are filtered. Include guards and include paths dominate: after
  `creature` the top words are `cellarsandcentaurs` 239, `sots` 239, `de` 198, `domain` 190, `model` 172 (each header
  contributes `de`, `sots`, `cellarsandcentaurs` 6 times from its guard). Also `type` 136, `id` 93, `new` 75, `self` 33,
  `count` 27, `value` 24, the number `20` 15. AGGRESSIVE removes `type`, `model`, `repository`, `facade`, `entity`,
  `value`, `adapter`, `dto` but keeps `domain`, `application`, `persistence`, `include`, `count` and the guard
  fragments. MINIMAL adds `service` 84, `exception` 36, `set` 30, `get` 27, `save` 24, `base` 18, `find` 15.
- Identifier splitting:

| Form | Identifier | Words found |
| --- | --- | --- |
| camelCase | `walkingSpeed` (test) | walking, speed |
| snake_case | `walking_speed` (`creature_facade.h`) | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points |
| PascalCase | `ArmorClass` | armor, class |
| Acronym | `XPValue` / `xp_value` | xp, value |
| Digit | `d20Roll` / `d20_roll` / `roll_d20` | 20, roll (`d` dropped) |
| Kebab in string | `"centaur-stable"` | centaur 1, stable 1 |
| Test function | `should_save_creature_to_the_stable` | creature, stable |
| Macro | `#define EDGE_MAX(left, right) …`, `EDGE_DEFINE_GETTER(field)` with `edge_get_##field(const Lair *lair)` | the macro names only (max 3, define 3, getter 3); the parameters `left`, `right`, `field` and the replacement text are not read |

- Comments and strings: the planted sentences are counted with weights identifier 3, comment 2, string 1
  (`creature.h` cellar 2, roams 2; `hit_points.h` lair 2, recover 2; `creature_facade.c` initiative 2, encounter 2;
  `creature_util.h` treasure 5, hoard 5; `no_such_creature_exception.c` dungeon 1).
- Round-3 words in `encounter_edge_cases.c`, expected vs found:

| Construct | Expected | Found | Verdict |
| --- | --- | --- | --- |
| identifier under `#if 0` | mimic | mimic 3 | found (dead code is read like live code) |
| K&R parameters | lich, wyrm | lich 3, wyrm 3 | ok |
| strings holding `//` and `/* */` | owlbear, basilisk | 1 each | ok |
| backslash-continued `//` comment | beholder | beholder 2 | ok |
| backslash-continued string | gelatinous, cube | 1 each | ok |
| adjacent literals `"wandering " "minotaur"` | wandering, minotaur | 1 each | ok |
| `"ooze\ntroll\tkobold"` | ooze, troll, kobold | ooze 1, **ntroll** 1, **tkobold** 1 | wrong: escape sequences are not decoded |
| `"%s the %d wyvern"` | wyvern | wyvern 1, no `s` / `d` | ok |
| `L"griffon"` | griffon | griffon 1 | ok |
| `"http://dungeon.example/lair"` | dungeon, lair | dungeon 1, `http` 1 | `http` leaks |

- Preprocessor text (scratch probe `output/probe-domain-exclude-tests.cc.json`): the string in
  `#define ROOST_LABEL "Molten Nest"` is not counted (in the project: `"Natural Armor"` in `creature_util.h`), nor is
  the text of `#error "…"` and `#pragma message("…")`; the `#include "…"` path is counted as a string.
- `--ngrams 2`: `armor class` 78, `hit points` 63 are found, but `de sots` 198, `sots cellarsandcentaurs` 198,
  `cellarsandcentaurs domain` 150, `domain model` 120 rank above them.
- Test file: included by default (`test/creature_service_test.c`: creature 13, 20 6, roll 6, self 6, stable 3,
  walking 3, centaur 2); `--exclude-tests` removes it (49 nodes, creature 502). In the probe `--exclude-tests` drops
  `test/roost_check.c` but keeps `src/wyvern_test.c`, `src/WyvernTest.c`, `src/test_wyvern.c`.
- `LAIR_KEEPER.C` (keeper 12, portcullis 3) and `GARGOYLE.H` (gargoyle 18, perch 3) are analysed;
  `creature_types.inc` has no node.

- German words: 3 of 7 appear. `verlies` 2, `trefferpunkte` 2, `kreatur` 2 are whole. The four umlaut words are cut
  at every non-ASCII letter: `Zentaurenhöhle` -> `zentaurenh` 2 + `hle` 2, `Rüstungsklasse` -> `stungsklasse` 2 (the
  `R` is lost), `Höhle` -> `hle` 1 (the `H` is lost), `Größe` -> nothing; also `gehören` -> `geh` 2 + `ren` 2. German
  stop words leak: `die` 2, `unter` 2, `dem` 2, `und` 2, `jeder` 2, `liegt` 2, `der` 1; `zu` is absent. The ASCII
  identifiers come through whole: `zentaurenhoehle` 34, `groesse` 9, `ruestungsklasse` 3, `beschreibung` 6.
  Classified in the source: comment and string words are matched with `[a-zA-Z]{3,}` (which also explains the missing
  `Gr`, `e` and `zu`), and only an English stop-word list exists.

## Changed since 2026-09-06
- Domain lens: the root and folder nodes no longer carry word lists (then 51 nodes for 31 files with a root list,
  now one node per file). The root frequencies of the old report (creature 471 …) cannot be compared; the per-file
  frequencies it quoted are unchanged (`test/creature_service_test.c` creature 13, 20 6, roll 6). Each word now
  carries a `tfidf` value besides `frequency`.
- Dependency lens: leaf kinds are written in lower case (`class`, `enum`; then `CLASS`, `ENUM`). The log line
  `Created Project with 29 leaves` counts files, the lens has 34 leaves.
- Still true, re-verified on fresh output: all 17 round-1/2 file edges are identical (12 + 3 right, 2 wrong target),
  0 cycles, `--include-tests` output identical to the default, files without a struct or enum absent from the tree,
  `struct X *` tag references not extracted, `Creature` resolved to `application/dto/creature.h`, `--comment-weight
  0` rejected, `#define` strings not counted, include guards and include paths counted, `repository` / `facade` /
  `entity` passing MODERATE, directory-only test detection in both parsers, weights 3 / 2 / 1.
- Corrected: the round-2 expectation was 13 edges, not 9 (`centaur.c` has 4 targets, `default_creature.c` 2), so the
  total before round 3 was 84, not 80.
- New on the old files: none in the dependency and domain results. The `Creature` name clash produces a third wrong
  upward edge through the new `encounter_resolver.h`.
- Not re-verified: the old statements that a `-I` style include would map to `de/sots/.../speed_h` and that
  `--verbose` adds nothing per file (not rerun).
- The unified parser was not part of the 2026-09-06 report; everything in its section is new.

## Verdict

### Unified parser
- Wrong: `complexity` counts every function declarator that is not the direct child of a definition. Prototypes
  (`creature.h` complexity 11 with 0 functions, `encounter_resolver.h` 9), function pointer fields (`struct
  TextBuilder`), function pointer variables and parameters (`int (*roll)(const Dice *)` in
  `encounter_resolver_safe_roll`, `int (*compare)(int, int)`), function type typedefs, and every function that returns
  a pointer (`const char *encounter_resolver_describe`, 5 functions in `creature.c`) add 1 each. **Decisions derived from C++: ignore — prototypes; accept — functions that return a pointer.** **Decision: ignore — function pointer fields, variables, parameters and function type typedefs.**
- Wrong: `default:` counts as a `case` (`encounter_resolver_resolve`, `edge_switch_fallthrough`). **Decision: ignore (derived from Java).**
- Wrong: `(void)` is 1 parameter (`encounter_resolver_is_empty`, `roll_d20`, `main`), a K&R definition has 0
  (`edge_knr_definition`), a function pointer parameter adds its own parameters (`edge_function_pointer_parameter`
  5 instead of 3, which sets `long_parameter_list`), as does a returned function pointer
  (`edge_returns_function_pointer` 3 instead of 1). **Decisions derived from Objective-C: ignore — `(void)`; accept — a function pointer parameter adds its own parameters.** **Decision derived from Objective-C: accept — a returned function pointer adds its own parameters.** **Decision: ignore — the K&R definition.**
- Wrong: the `*_complexity_per_function` values leave out the +1 of the function itself, so they do not add up to
  `complexity` (`encounter_resolver.c`: 12 / 0 / 2.67 / 1 instead of 12 / 1 / 3.33 / 2). **Decision: ignore (derived from Java).**
- Wrong: preprocessor conditions are counted as logic (`#if defined(USE_DICE) && !defined(NO_LAIR)`, `#elif … || …`
  in `edge_if_defined`), and code under `#if 0` is counted as a function with complexity (`edge_disabled`). **Decision derived from C++: ignore — code under `#if 0`.** **Decision: ignore — preprocessor conditions.**
- Missing: a function generated by a macro invocation (`EDGE_DEFINE_GETTER(depth)`), and the `?:`, `do`, `if` inside
  function-like macros (`EDGE_MAX`, `EDGE_CLAMP_ROLL` in `encounter_edge_cases.h`). **Decision derived from Objective-C: ignore — logic inside function-like macros.** **Decision: accept — a function generated by a macro invocation.**
- Missing: `.C` and `.H` files are skipped (`LAIR_KEEPER.C`, `GARGOYLE.H`) although the other two parsers read them;
  `.inc` is skipped. **Decision derived from C++: accept — `.C` and `.H` read by every parser.** **Decision: ignore — `.inc`.**
- Good: `number_of_functions`, loc, rloc, comment_lines, rloc per function, `long_method`, `message_chains`,
  `excessive_comments` match the hand count in `encounter_resolver.c`; `do … while`, `goto`, fallthrough, `for (;;)`,
  `else if` chains, Duff's device, nested `?:`, `&&` / `||` outside conditions, bitwise operators, `_Generic`,
  variadic `...`, `f()`, `__attribute__`, array parameters, `static inline` in a header, both `#ifdef` branches,
  comment markers in strings and backslash-continued comments are counted as expected; skipped extensions are named
  in the output.

### Dependency parser
- Missing: everything that is not a field of a struct or union. `#include` lines, prototypes, function bodies,
  macros, `extern` variables, `typedef` aliases and function pointer typedefs give no leaf and no edge; 22 of 51
  files (11 `.c` files, the test, 9 headers, the `.inc`) are absent from the tree and 89 of 110 expected edges are
  missing, among them every barrel, umbrella and upward edge. **Decisions derived from Kotlin: accept — everything outside a struct, `typedef` aliases.** **Decision derived from Java: accept — files without a declaration absent from the tree.** **Decision derived from Delphi: accept — function pointer typedefs.** **Decision derived from Objective-C: accept — the skipped `.inc` is named.** **Decision: ignore — reading `.inc`.**
- Wrong: `Creature` resolves to `application/dto/creature.h` in `centaur.h`, `creatures.h` and
  `encounter_resolver.h`; the domain `Creature` has 0 incoming edges and the only 3 upward edges reported are false. **Decisions derived from Java: accept — a type identified by its simple name resolves to the wrong declaration.**
- Missing: tag references (`struct Creature *self` in `fightable.h`, `struct Lair *`, `enum SpeedType` in
  `encounter_edge_cases.h`), which hides the one expected cycle; the field of a nested anonymous struct
  (`struct EdgeRoom { struct { ArmorClass armor; } guard; }`); the link between an opaque typedef and its completion
  (`stable.h` / `stable.c`, `encounter_resolver.h` / `.c`). **Decisions: accept — tag references; accept — the field of a nested anonymous struct; ignore — the opaque typedef and its completion.**
- Bad: `--include-tests` has no effect for C, and a test outside a `test/` directory is not recognised. A `union`
  is reported as `class`. A struct-holding `.c` file is in the tree with 0 outgoing edges
  (`encounter_resolver.c`), which reads as "no dependencies". **Decision derived from C++: accept — a test outside a `test/` directory is not recognised.** **Decisions derived from Kotlin: accept — `--include-tests` without effect; accept — the `.c` file with 0 outgoing edges (both follow from everything outside a struct).** **Decision derived from Go: ignore — `union` as `class`.**
- Good: field types of structs and unions, including pointer, array and `#ifdef`-guarded fields, resolve to the
  right header when the name is unique (21 edges); `Dice` / `DiceRoll` in one file are separate leaves; no edge to a
  system header; unresolvable macro names produce no false edge; `.C` and `.H` are read.

### Domain language parser
- Wrong: comment and string words are cut at non-ASCII letters (`zentaurenhoehle.h`: `zentaurenh` + `hle`,
  `stungsklasse`, `geh` + `ren`; `"Größe der Höhle"` leaves only `der` and `hle`); 4 of the 7 German words are lost. **Decision: accept (derived from Java).**
- Wrong: escape sequences in strings are not decoded (`"ooze\ntroll\tkobold"` gives `ntroll`, `tkobold`). **Decision: accept (derived from C++).**
- Bad: include guards and `#include` paths are the top words after `creature` (`cellarsandcentaurs`, `sots`, `de`,
  `domain`, `model`, `include`), and `--ngrams 2` ranks `de sots` above `armor class`. **Decision derived from Objective-C: accept — `#include` paths.** **Decision: ignore — include guards; the `--ngrams 2` ranking follows from both.**
- Bad: no root or folder word list in the lens; the project-level vocabulary has to be summed by the reader. **Decision: ignore (derived from Java).**
- Bad: German stop words are not filtered (`die`, `unter`, `dem`, `und`, `jeder`, `liegt`, `der`); `repository`,
  `facade`, `entity` pass MODERATE; `type`, `id`, `new`, `self`, `20`, `http` leak. **Decision: ignore (derived from Java).**
- Bad: preprocessor text is handled unevenly: `#include` paths are counted, macro bodies and strings in `#define`,
  `#error` and `#pragma` are not, code under `#if 0` is (`mimic`). `--comment-weight 0` is rejected, so comments or
  strings cannot be switched off. **Decisions derived from Java: accept — a weight of 0 is rejected.** **Decision derived from Objective-C: accept — `#include` paths are counted.** **Decisions: accept — strings in `#define`, `#error` and `#pragma message` and macro replacement text; ignore — code under `#if 0`.**
- Missing: `.inc` files; name-based test detection (`*_test.c`, `test_*.c`) for `--exclude-tests`. **Decision derived from C++: accept — name-based test detection.** **Decision: ignore — `.inc`; skipped without a message (derived from Objective-C).**
- Good: all 17 expected words are present; no C keyword leaks; camelCase, snake_case, SCREAMING_SNAKE, PascalCase,
  acronym, digit and kebab forms split correctly; weights 3 / 2 / 1 are visible; comment markers in strings,
  continued comments and strings, adjacent, wide and format strings, K&R parameters and macro names are read
  correctly; `.C` and `.H` are analysed.
