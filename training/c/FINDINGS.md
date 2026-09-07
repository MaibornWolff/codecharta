# C

## Project
- Layout: `include/de/sots/cellarsandcentaurs/<layer>/*.h` (22 headers) and `src/<layer>/*.c` (8 sources) plus
  `test/creature_service_test.c`, 31 files. snake_case file and function names, PascalCase typedef names, all
  includes relative (`"creature_id.h"`, `"../model/creature.h"`, `"../../../include/de/sots/.../creature.h"`).
- Structs stand in for classes, `typedef struct` with function pointers for the interfaces (`Fightable`,
  `Creatures`), a struct with a `Creature base;` first member for `Centaur extends Creature`, a struct holding the
  `Fightable` vtable for `Creature implements Fightable`, `PersistedCreatures` holding a `Creatures port` for the
  port implementation. `application.h` (includes only) is the barrel, `domain/model/model.h` the umbrella header.
- Stress constructs present: 3 barrel/upward includes (`creature.c`, `armor_class.c`, `persisted_creatures.c`),
  inheritance and interface by composition, alias `typedef CreatureEntity Entity;` (1), umbrella header `model.h`
  (2), macro-generic `REPOSITORY_OF(Entity)` in `repository.h` (5), type only in type position / only in a
  compound literal `(HitPoints){...}` / only through the global `CREATURE_FACADE_STANDARD_CREATURE_TYPE` (6),
  `domain/model/creature.h` and `application/dto/creature.h` both named `Creature` and both used from
  `creature_facade.c` (7), forward declaration `struct Creature;` in `fightable.h` and one `-I`-style include
  `"de/sots/cellarsandcentaurs/domain/model/speed.h"` in `creature_facade.c` as the nearest thing to a qualified
  reference (8), unused `#include "fightable.h"` in `creature_util.h` (9), `<stdlib.h>`, `<string.h>`, `<stdio.h>`,
  `<stddef.h>`, `<assert.h>`, `<syslog.h>`, `<uuid/uuid.h>` (10), `test/creature_service_test.c` (11), `dice.h`
  with `Dice`, `DiceRoll` and the free function `roll_d20`, `movement.h` holding `SpeedType` (12).
- Constructs C does not have: import aliases, wildcard imports, generics, static members, annotations, namespaces,
  qualified names, interfaces, inheritance. Two `struct Creature` definitions in one translation unit do not compile;
  the DTO exists only to see what the parser does with a duplicated simple name.

## Dependency parser
- Commands: the three README commands ran without error (exit 0, no exception in `output/*.log`); a `--verbose` run
  adds nothing per file. Default run: 30 files, `--include-tests`: 31 files, both outputs byte-identical.
- Result: 14 file edges, 19 leaves, 0 cycles, 17 of 31 files in the tree. Every `.c` file, the test file and the
  headers `application.h`, `creature_util.h`, `model.h`, `repository.h`, `creature_repository.h` are missing from
  the tree: the C++ grammar path only creates leaves for `struct`/`enum`/`class` declarations. Function definitions,
  prototypes, `#define`s, `extern` variables and `typedef` aliases create nothing (confirmed with a scratch project:
  `int foo(void) {...}` in `a.c` leaves `a.c` out of the tree). Used types are attached to declarations, so a `.c`
  file that only defines functions cannot carry an edge even when its bodies use ten project types.
- Expected 71 edges (39 between headers, 32 from sources); found 14, of which 12 are right and 2 point at the wrong
  file. Expectation list (written before the first run):

### Expected file-level edges (written before the first parser run)

Paths are relative to `training/c`; `inc` abbreviates `include/de/sots/cellarsandcentaurs`. An edge is listed when
the file references a declaration of the target file (type in a field, parameter, return, cast, compound literal,
forward declaration) or calls a function / uses a constant declared there. Pure `#include` of a header without using
anything from it (`creature_util.h -> fightable.h`) is deliberately not expected. Barrel and umbrella headers are
expected as include edges because in C the include graph is the dependency graph.

| from | to |
| --- | --- |
| inc/domain/model/creature.h | creature_id.h, creature_type.h, armor_class.h, hit_points.h, speed.h, movement.h, fightable.h |
| inc/domain/model/fightable.h | creature.h (forward declaration `struct Creature;`, no include) |
| inc/domain/model/centaur.h | creature.h, creature_id.h |
| inc/domain/model/no_such_creature_exception.h | creature_id.h |
| inc/domain/model/model.h | all 11 other model headers (umbrella) |
| inc/domain/service/creatures.h | model/creature.h, model/creature_id.h |
| inc/domain/service/creature_service.h | creatures.h, model/creature.h |
| inc/adapter/persistence/creature_repository.h | repository.h, creature_entity.h |
| inc/adapter/persistence/persisted_creatures.h | creature_repository.h, service/creatures.h |
| inc/application/creature_facade.h | service/creature_service.h, model/creature.h, model/creature_type.h, model/speed.h, model/armor_class.h |
| inc/application/creature_util.h | model/model.h (umbrella), model/creature.h |
| inc/application/application.h | creature_facade.h, creature_util.h (barrel) |
| src/domain/model/creature.c | inc creature.h, application.h -> creature_facade.h (constant, upward), dice.h and hit_points.h (calls) |
| src/domain/model/armor_class.c | inc armor_class.h, application.h -> creature_util.h (macro, upward) |
| src/domain/model/no_such_creature_exception.c | inc no_such_creature_exception.h, creature_id.h |
| src/domain/service/creature_service.c | inc creature_service.h, creatures.h, creature.h |
| src/adapter/persistence/creature_repository.c | inc creature_repository.h, creature_entity.h (alias `Entity`) |
| src/adapter/persistence/persisted_creatures.c | inc persisted_creatures.h, creature_entity.h, creature.h, creature_id.h, no_such_creature_exception.h, creature_repository.h, application.h -> creature_facade.h (constant, upward) |
| src/application/creature_facade.c | inc creature_facade.h, dto/creature.h, model/creature.h, creature_id.h, hit_points.h, speed.h, movement.h, armor_class.h, service/creature_service.h |
| src/application/creature_util.c | inc creature_util.h, model/creature.h, model/centaur.h |
| test/creature_service_test.c | only with `--include-tests`: inc creature_service.h, creatures.h, creature.h, creature_id.h, creature_type.h, speed.h, dice.h |
| inc/domain/model/initiative.h (round 2) | dice.h (conditional `#ifdef USE_DICE` include, field `DiceRoll roll` under the same `#ifdef`) |
| src/domain/model/stable.c (round 2) | inc stable.h (opaque `typedef struct Stable Stable;` completed by `struct Stable {...}` in the .c) |
| src/domain/model/centaur.c (round 2) | src dice_table.c (`#include "dice_table.c"`, field `DiceTable table`), inc centaur.h, creature.h, creature_id.h (prototype types) |
| src/domain/model/dice_table.c (round 2) | inc dice.h (field `Dice dice` in a struct defined in a .c) |
| inc/domain/model/lair.h (round 2) | hit_points.h (only through the macro `LAIR_REGENERATION_TYPE` used as field type) |
| inc/domain/service/encounter.h (round 2) | model/speed.h (only through the prototype parameter `Speed walking_speed`) |
| inc/domain/model/default_creature.h (round 2) | creature.h (only through `extern const Creature DEFAULT_CREATURE;`) |
| src/domain/model/default_creature.c (round 2) | inc default_creature.h (defines the declared variable), creature.h (type of the definition) |
| inc/domain/model/treasure.h (round 2) | dungeon_limits.h (include of a macro-only header, `DUNGEON_LIMITS_MAX_GEMS` as array size) |

Not expected: `inc/domain/model/dice.h`, `speed.h`, `hit_points.h`, `armor_class.h`, `creature_id.h`, `creature_type.h`,
`movement.h`, `creature_entity.h`, `repository.h`, `dto/creature.h` have no outgoing internal edges. Round 2 adds `stable.h` and
`dungeon_limits.h` without outgoing edges; none of the round-2 files may gain an edge to `application/dto/creature.h`. No edge may point
at `<stdlib.h>`, `<string.h>`, `<stdio.h>`, `<stddef.h>`, `<assert.h>`, `<syslog.h>` or `<uuid/uuid.h>`.

Expected cycles: exactly one, `creature.h <-> fightable.h`. The TypeScript cycle `Creature -> CreatureFacade ->
CreatureService -> Creature` does not close in C because the reference to the facade constant sits in `creature.c`,
not in `creature.h`, and nothing depends on a `.c` file.

Expected upward edges (domain -> application, adapter -> application): `creature.c`, `armor_class.c`,
`persisted_creatures.c` each into `inc/application`.

### Construct table

| # | Construct | Expected edge(s) | Found | Verdict |
| --- | --- | --- | --- | --- |
| 1 | alias `typedef CreatureEntity Entity;` (creature_repository.h) | creature_repository.h -> creature_entity.h, repository.h | file not in tree (alias, macro typedef and prototypes yield no leaf) | missing (C has no import alias; typedef alias unseen) |
| 2 | umbrella `model.h` included by creature_util.h | creature_util.h -> model.h, model.h -> 11 headers | neither file in tree | missing (C has no wildcard import; include-only headers unseen) |
| 3 | barrel `application.h` included by creature.c, armor_class.c, persisted_creatures.c | 3 upward edges into application, then application.h -> creature_facade.h, creature_util.h | none; the 3 `.c` files and application.h are not in the tree | missing |
| 4 | `Centaur { Creature base; }` | centaur.h -> domain/model/creature.h | centaur.h -> application/dto/creature.h `[isPointingUpwards]` | wrong target |
| 4 | `Creature { Fightable fightable; }` | creature.h -> fightable.h | found | ok |
| 4 | `PersistedCreatures { Creatures port; }` | persisted_creatures.h -> creatures.h | found | ok |
| 5 | macro generic `typedef REPOSITORY_OF(Entity) CreatureRepository;` | creature_repository.h -> repository.h | file not in tree | missing (C has no generics; macro unseen) |
| 6 | type only in prototype parameter/return: `CreatureType`, `ArmorClass` in creature_facade.h, `SpeedType` in creature.h | creature_facade.h -> creature_type.h, armor_class.h; creature.h -> movement.h | none | missing (prototypes not analysed) |
| 6 | type only in a struct field: `CreatureService *` in CreatureFacade, `Speed` in CreatureSpeeds | creature_facade.h -> creature_service.h, speed.h | found | ok (fields are the only type position seen) |
| 6 | type only instantiated `(HitPoints){...}` in creature_facade.c | creature_facade.c -> hit_points.h | file not in tree | missing |
| 6 | "static member" `CREATURE_FACADE_STANDARD_CREATURE_TYPE` in creature.c, persisted_creatures.c | -> creature_facade.h | none | missing (C has no static members; a global symbol is invisible) |
| 6 | annotation | none | none | language has no such construct |
| 7 | two `Creature`s used from creature_facade.c | creature_facade.c -> model/creature.h and dto/creature.h | file not in tree; and every other `Creature` reference (centaur.h, creatures.h) resolves to dto/creature.h | wrong: dto wins by scan order, model/creature.h gets 0 incoming |
| 8 | forward declaration `struct Creature;` + `struct Creature *self` in fightable.h | fightable.h -> creature.h | none | missing (tag-style `struct X` references are never seen, see below) |
| 8 | `-I` style `#include "de/sots/cellarsandcentaurs/domain/model/speed.h"` in creature_facade.c | creature_facade.c -> speed.h | file not in tree; the analyzer would map it to `de/sots/.../speed_h`, a path no node has | missing (C has no qualified names) |
| 9 | unused `#include "fightable.h"` in creature_util.h | no edge | no edge | ok, but only because creature_util.h produced no node at all |
| 10 | `<stdlib.h>`, `<string.h>`, `<stdio.h>`, `<stddef.h>`, `<syslog.h>`, `<uuid/uuid.h>` | no internal edge | none | ok |
| 11 | test/creature_service_test.c | absent by default, 7 edges with `--include-tests` | absent in both; `--include-tests` scans it (31 files) but the function-only file yields no node | ok by accident |
| 12 | `Dice`, `DiceRoll`, `roll_d20` in dice.h | leaf edge DiceRoll -> Dice, no file edge | leaves `dice_h.Dice` level 0, `dice_h.DiceRoll` level 1, leaf edge found; `roll_d20` no leaf | ok for the structs, function missing |
| 12 | `SpeedType` in movement.h | leaf `movement_h.SpeedType` | found, kind ENUM | ok |
| add. | `Creature` fields `CreatureId`, `CreatureType`, `ArmorClass`, `HitPoints`, `Speed`, `NoSuchCreatureException.id` | 6 edges | all found | ok |
| add. | `struct B *held;` inside a struct (scratch probe) | c.c -> b.h | none | missing: only typedef names are extracted, `struct X` tags never |

- False positives: none in the strict sense, both wrong edges are misdirected real references (`centaur.h` and
  `creatures.h` -> `application/dto/creature.h`, flagged `isPointingUpwards`).
- Cycles: expected 1 (`creature.h <-> fightable.h`), reported 0 (`Found a total of 0 cycles`) because the
  `struct Creature *` side is invisible. Upward edges: expected 3 (`creature.c`, `armor_class.c`,
  `persisted_creatures.c` -> application), reported 2 and both are the wrong-target edges above.
- Metrics: `creature.h` outgoing 6 (expected 7, `movement.h` missing), incoming 0 (expected >= 5);
  `application/dto/creature.h` incoming 2 (expected 1, from `creature_facade.c`); all `.c` files have no metrics.
- Leaf kinds: `typedef struct` -> CLASS (right, C has nothing else), `typedef enum` -> ENUM (right), the function
  pointer structs `Fightable` and `Creatures` -> CLASS (C has no interface, acceptable), `XPValue` typedef,
  `REPOSITORY_OF` macro, `CREATURE_FACADE_STANDARD_CREATURE_TYPE` and all functions produce no leaf although
  `NodeType` has FUNCTION and VARIABLE. Levels are consistent with the reported edges (`DiceRoll` 1 above `Dice`,
  `creature.h` 1, `creature_service.h` 1, packages `adapter` and `application` 1).
- Language vs. CodeCharta: C has no module system, namespaces or qualified names; the `#include` graph is the
  dependency graph and the parser does not turn it into edges (it records includes as `Dependency` entries but edges
  come only from resolved used types). Without namespaces every declaration carries an empty-path wildcard, so a
  type name resolves to the first project declaration with that name regardless of includes, which is why both
  `Creature` references land on the DTO. Test detection for `.c` is directory-based only: `creature_service_test.c`
  and `CreatureServiceTest.c` placed under `src/` were still processed by the domain parser with `--exclude-tests`
  (scratch probe).

## Domain language parser
- Command from the README ran without error (31 files, 51 nodes). Also run: `--exclude-tests`,
  `--stop-word-level MINIMAL`, `AGGRESSIVE`, `--ngrams 2` (all exit 0); `--comment-weight 0` and
  `--string-weight 0` are rejected with `IllegalArgumentException: --comment-weight must be positive, got 0`, so a
  context cannot be switched off. Weights are visible from the counts instead: identifier 3, comment 2, string 1.
- Expected words at the root, all 17 present: creature 471, speed 101, armor 80, hit 61, points 61, centaur 34,
  dice 29, roll 24, damage 11, treasure 8, hoard 8, stable 7, dungeon 3, cellar 2, lair 2, initiative 2, encounter 2.
- Keyword leakage: no C keyword leaks (`struct`, `typedef`, `int`, `void`, `const`, `char`, `static`, `inline`,
  `return`, `enum`, `unsigned`, `sizeof` are all absent). `class` 80 appears; it is not a C keyword and comes from
  `ArmorClass` / `armor_class`, so keeping it is right for C.
- Technical leakage at MODERATE: `repository` 73, `facade` 45, `entity` 30 leak; they sit only in the AGGRESSIVE
  list, so the parser is consistent with its lists but not with the README expectation. `util`, `exception`,
  `test` are filtered at MODERATE (`exception` 36 reappears at MINIMAL), `mock` is filtered because it is in the
  English stop-word list. Structural noise that is wrong for C: the include guards
  `DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_X_H` are counted as identifiers twice per header, giving `sots` 162,
  `cellarsandcentaurs` 162, `de` 132, `domain` 113, `model` 104, `application` 39, `adapter` 27, `persistence` 27,
  `dto` 13 (rank 2 to 7 at the root); the `#include "../../../include/de/sots/..."` paths are counted as string
  literals, giving `include` 29 and more `sots`/`cellarsandcentaurs`. `type` 114, `id` 87, `new` 60 (`_new`
  constructor idiom), `self` 33 (`void *self`), `count` 15, `value` 15, `init` 6 and the number `20` 15 also leak;
  `all` 2 shows the English list lacks "all". AGGRESSIVE removes `type`, `model`, `repository`, `facade`, `entity`,
  `value`, `count`, `adapter`, `dto` but keeps `domain`, `application`, `persistence`, `include` and the guard
  fragments; MINIMAL adds `service` 64, `exception` 36, `set` 30, `get` 27, `save` 24, `base` 18, `find` 15.
- Identifier splitting:

| Form | Identifier | Words found |
| --- | --- | --- |
| camelCase | `walkingSpeed` (test) | walking, speed |
| snake_case | `walking_speed` (creature_facade.h) | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points |
| PascalCase | `ArmorClass` | armor, class |
| Acronym | `XPValue` / `xp_value` | xp, value (both forms) |
| Digit | `d20Roll` / `d20_roll` / `roll_d20` | 20, roll (the `d` is dropped as a one-letter word; `20` survives as a word) |
| Kebab in string | `"centaur-stable"` | centaur 1, stable 1 |
| Test method | `should_save_creature_to_the_stable` | creature, stable (`should`, `to`, `the` English stop words, `save` MODERATE stop word) |

- Comments and strings: all planted sentences are counted. `creature.h` doc comment gives cellar 2, roams 2,
  beasts 2, dragons 2, share 2; `hit_points.h` lair 2, recover 2, rests 2; `creature_facade.c` line comment
  initiative 2, encounter 2, dungeon 2, rolls 2; `creature_util.h` block comment treasure 2 + hoard 2 (5 each with
  the identifier); string `"No such creature in the dungeon: "` dungeon 1, such 1; `"centaur-stable"` 1 each.
  Not counted: `"Natural Armor"` inside `#define CREATURE_UTIL_STANDARD_ARMOR_CLASS_DESCRIPTION` (`natural`
  absent) while `#include` path strings are counted, so preprocessor lines are handled inconsistently.
- `--ngrams 2`: `armor class` 78, `hit points` 57, `creature type` 42, `speed type` 36, `creature facade` 36 are
  good, but `de sots` 132, `sots cellarsandcentaurs` 132, `cellarsandcentaurs domain` 84, `domain model` 72 from the
  guards rank above them.
- Test file: included by default (`test/creature_service_test.c`: creature 13, 20 6, roll 6, walking 3, stable 3,
  centaur 2, `mock` and `test` filtered); `--exclude-tests` removes it (49 nodes, root creature 458). A `_test.c`
  or `Test.c` file outside a `test/` directory is not recognised as a test.

## Round 2: additional dependency forms

Added 11 files (42 files now, no round-1 file changed): `inc/domain/model/initiative.h`, `stable.h`, `lair.h`,
`default_creature.h`, `dungeon_limits.h`, `treasure.h`, `inc/domain/service/encounter.h`, `src/domain/model/stable.c`,
`centaur.c`, `dice_table.c`, `default_creature.c`. The three README commands ran without error (exit 0, 41 / 42 / 42
files). Result: 17 file edges (14 + 3), 25 leaves (19 + 6), 18 leaf edges, still 0 cycles, 23 of 42 files in the
tree. `--include-tests` output is again identical to the default output.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| conditional include `#ifdef USE_DICE` | initiative.h | initiative.h -> dice.h | yes | `Initiative -> DiceRoll` leaf edge; the field `DiceRoll roll` inside `#ifdef USE_DICE` in the struct body is extracted, the `#else int roll;` branch is ignored. The `#include` itself plays no role, the parser treats the conditional field as unconditional (no flag, no `x2`). |
| opaque pointer `typedef struct Stable Stable;` | stable.h, stable.c | stable.c -> stable.h | no | `struct Stable {...}` (no typedef) in stable.c gives leaf `src.domain.model.stable_c.Stable`, so a tag-only definition is seen. `typedef struct Stable Stable;` gives nothing, stable.h is not in the tree, and the completed type is not linked to its declaration. |
| `.c` file `#include "dice_table.c"` | centaur.c, dice_table.c | centaur.c -> dice_table.c | yes | `CentaurCharge -> DiceTable` leaf edge, resolved by name, not by the include; `dice_table.c -> dice.h` (`Dice dice` field) also found. Both `.c` files are in the tree because they hold a struct, `src` gets level 1. centaur.c -> centaur.h, creature.h, creature_id.h (prototype types, `centaur->base.id`) missing as in round 1. |
| macro as field type `LAIR_REGENERATION_TYPE regeneration;` | lair.h | lair.h -> hit_points.h | no | leaf `Lair` exists with 0 outgoing; the macro name is taken as a type name, finds no declaration and is dropped silently. No false positive. |
| prototype-only parameter `int encounter_turn_order(Speed walking_speed);` | encounter.h | encounter.h -> speed.h | no | encounter.h has no struct, so it is not in the tree at all; same as creature_util.h in round 1. |
| global `extern const Creature DEFAULT_CREATURE;` | default_creature.h, default_creature.c | default_creature.h -> creature.h; default_creature.c -> default_creature.h, creature.h | no | neither file in the tree: `extern` declarations and variable definitions with initializers yield no leaf. Side effect: the `Creature` type of the variable is not resolved either, so it does not add a third wrong edge to `dto/creature.h`. |
| include of a macro-only header `dungeon_limits.h` | treasure.h, dungeon_limits.h | treasure.h -> dungeon_limits.h | no | leaf `TreasureHoard` exists with 0 outgoing; `DUNGEON_LIMITS_MAX_GEMS` as array size is not a type reference and `dungeon_limits.h` (macros only) is not in the tree. Same picture as `repository.h` in round 1. |

- Round-1 edges: all 14 round-1 file edges, 15 leaf edges, node levels and metrics are unchanged (the dump diff
  contains only additions, except `dice.h` incoming 0 -> 2 from the new `initiative.h` and `dice_table.c`). Still
  0 cycles, still the same 2 upward edges (`centaur.h` and `creatures.h` -> `dto/creature.h`).
- New false positives: none. The three new edges are all right; `Creature` in `default_creature.h` / `.c` did not
  get a chance to resolve to the DTO because variables produce no leaf.
- New observation: a struct in a `.c` file is a leaf like one in a header (`stable_c.Stable`, `dice_table_c.DiceTable`,
  `centaur_c.CentaurCharge`), so `.c` files enter the tree exactly when they define a struct, and a `.c -> .c` edge
  is produced. A field under `#ifdef` inside a struct is extracted like an unconditional one.
- Domain lens (round-2 files only add words, nothing planted in round 1 changed): root `creature` 471 -> 485, `stable`
  7 -> 59, `centaur` 34 -> 53, `dice` 29 -> 52, `initiative` 2 -> 20, `treasure` 8 -> 20, `lair` 2 -> 17, `encounter`
  2 -> 11, `dungeon` 3 -> 15; `use` 6 leaks from `#ifdef USE_DICE`, `limits` 12 from `dungeon_limits.h`.

## Verdict
- Good: struct field types resolve to the right header (12 of 14 edges right, `creature.h` fans out to 6 of its 7
  headers), `Dice`/`DiceRoll` in one file and `SpeedType` in `movement.h` are separate leaves with the right kinds
  and levels, no standard-library or third-party edge, no C keyword leaks in the domain lens, all 17 expected domain
  words and every planted comment and string are counted with visible 3/2/1 weights, identifier splitting works
  for all seven forms.
- Good (round 2): a `.c` file that defines a struct is treated like a header (`stable.c`, `dice_table.c`, `centaur.c`
  are in the tree and `centaur.c -> dice_table.c` is found), a struct field under `#ifdef USE_DICE` is extracted
  (`initiative.h -> dice.h`), and unresolvable names (`LAIR_REGENERATION_TYPE`, `DUNGEON_LIMITS_MAX_GEMS`) are dropped
  without producing a false edge.
- Wrong: `Creature` resolves to `application/dto/creature.h` everywhere (`centaur.h`, `creatures.h`), so the
  domain `Creature` has 0 incoming edges and two false upward edges appear, because the empty-namespace wildcard
  takes the first declaration by scan order and ignores the includes. Tag-style references `struct Creature *`
  (`fightable.h`, scratch `struct B *held`) are never extracted, which hides the only expected cycle. Domain lens:
  include guards and `#include` path strings are the top-7 words after `creature` (`sots`, `cellarsandcentaurs`,
  `de`, `domain`, `model`, `include`); `repository`, `facade`, `entity` pass MODERATE; `"Natural Armor"` in a
  `#define` is not counted while include paths are; `--comment-weight 0` is rejected.
- Missing: everything that is not a struct or enum. Function definitions, prototypes, macros, `extern` constants and
  `typedef` aliases produce no leaf, so all 9 `.c` files, the test file and 5 headers (`application.h`,
  `creature_util.h`, `model.h`, `repository.h`, `creature_repository.h`) are absent from the tree, 57 of the 71
  expected edges are missing, and the barrel/umbrella/alias/macro-generic/static-member/compound-literal
  constructs cannot be judged at all. `#include` lines are not turned into edges, though in C they are the
  dependency graph. Types used only in prototypes (`creature.h -> movement.h`, `creature_facade.h ->
  creature_type.h`, `armor_class.h`) are missed. `--include-tests` changes nothing for C because the test file has
  no struct. Name-based test detection for `.c` does not exist.
- Missing (round 2): 6 of the 9 new expected edges. The opaque pointer type (`typedef struct Stable Stable;` in
  `stable.h`, completed in `stable.c`) is not linked because the forward typedef yields no leaf; a macro that expands
  to a type (`lair.h -> hit_points.h`), a prototype-only parameter in a header without a struct (`encounter.h ->
  speed.h`), an `extern const Creature DEFAULT_CREATURE;` declaration and its definition (`default_creature.h/.c`),
  and the include of a macro-only header (`treasure.h -> dungeon_limits.h`) all produce no edge; the five files
  `stable.h`, `encounter.h`, `default_creature.h`, `default_creature.c` and `dungeon_limits.h` are absent from the
  tree. The conditional `#ifdef` include is found only because the guarded field is treated as unconditional, and the
  `.c`-includes-`.c` edge only because both files happen to hold a struct; the `#include` lines themselves still
  produce nothing.
