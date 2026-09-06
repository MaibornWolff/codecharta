# Rust

## Project
- Layout: `Cargo.toml`, `src/lib.rs` (`pub mod adapter; pub mod application; pub mod domain;`), the four
  layers as directories with `mod.rs` barrels (`pub use` re-exports), `tests/creature_service_test.rs`
  as an integration test. 29 `.rs` files + `Cargo.toml`. Cargo package name `cellars_and_centaurs`,
  edition 2021. The project parses but was never compiled. Round 2 added 5 files (34 `.rs`), see
  "Round 2: additional dependency forms" at the end.
- Stress constructs present: 1 aliased import (`use ...::CreatureEntity as Entity` in
  `creature_repository.rs`), 2 glob import (`use crate::domain::model::*` in `creature_util.rs`),
  3 barrels (`application/mod.rs`, `domain/model/mod.rs`, ...) imported upward from `creature.rs`,
  `armor_class.rs` and `persisted_creatures.rs` (`use crate::application::CreatureFacade`), 4 trait
  implementation (`impl Fightable for Creature`, `impl Creatures for PersistedCreatures`), 5 generic
  `Repository<T: Identified>` in `storage.rs`, 6 type-position only (`Speed` parameters in the facade),
  constructor only (`CreatureId::new`, `CreatureEntity::new`), static member only
  (`CreatureFacade::STANDARD_CREATURE_TYPE`, `CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION`),
  7 `domain::model::creature::Creature` and `application::dto::creature::Creature` both used in
  `creature_facade.rs`, 8 fully qualified `crate::application::dto::creature::Creature` without import,
  9 unused `use crate::domain::model::fightable::Fightable` in `creature_util.rs`, 10 `std::collections::
  HashMap`, `uuid::Uuid`, `log::info!`/`debug!`, 11 `tests/creature_service_test.rs` plus an inline
  `#[cfg(test)] mod tests` in `creature_service.rs`, 12 `dice.rs` with `Dice`, `DiceRoll`, `roll_d20`
  and `storage.rs` holding `Repository` and `Identified`.
- Not in the language: class inheritance. `Centaur extends Creature` is modelled as composition
  (`base: Creature`) plus `impl Deref<Target = Creature>` and its own `impl Fightable`. A type
  referenced only in an attribute: Rust attributes take macro names, not types, so `#[derive(Debug,
  Clone, ...)]` (std traits) is the only attribute usage; there is no attribute-only reference to an
  internal type. Namespaces are the module tree itself, so the root namespace
  `de.sots.cellarsandcentaurs` does not exist; the crate is the root.

## Dependency parser
- Commands from the README (`dependencyparser -nc ... -e "output,FINDINGS.md"` with and without
  `--include-tests`) ran without error (exit 0, 24 resp. 25 files). `--verbose` adds nothing beyond
  the phase timings: there is no diagnostic for an unresolved import or type.
- A probe crate in the scratchpad (one file per usage form) was used to separate causes; its results
  are quoted where relevant.

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| 1 aliased import `use ...creature_entity::CreatureEntity as Entity` | creature_repository.rs -> creature_entity.rs | none | missing: the import is recorded under its original path but every use site says `Entity`, the alias is not applied (probe `use crate::a::A as Alias; struct D { x: Alias }` also yields nothing) |
| 2 glob `use crate::domain::model::*` in creature_util.rs | -> creature.rs, -> speed.rs | both | ok, resolved through the `pub use` re-exports in `model/mod.rs` |
| 3 barrel `use crate::application::CreatureFacade` in creature.rs and persisted_creatures.rs, `use crate::application::CreatureUtil` in armor_class.rs | creature.rs -> creature_facade.rs, persisted_creatures.rs -> creature_facade.rs, armor_class.rs -> creature_util.rs | none | missing, but not because of the barrel (probe `use crate::A; struct H { x: A }` resolves through `lib.rs`'s `pub use a::A`). All three usages are `Type::CONST` path expressions, see 6 |
| 4 `impl Fightable for Creature`, `impl Fightable for Centaur`, `impl Creatures for PersistedCreatures` | creature.rs -> fightable.rs, centaur.rs -> fightable.rs, persisted_creatures.rs -> creatures.rs | all three | ok |
| 4 `Centaur` "extends" `Creature` (field `base: Creature` + `impl Deref`) | centaur.rs -> creature.rs | found | ok (via the field type, not via inheritance, which Rust does not have) |
| 5 generic `Repository<T: Identified>` used as `Repository<Entity>` | creature_repository.rs -> storage.rs; leaf Repository -> Identified | both | ok; the generic argument `Entity` is the alias and is lost (see 1) |
| 6 type position only (`Speed`, `ArmorClass`, `CreatureType` parameters, `Creature` return, `CreatureService` field) | creature_facade.rs -> speed.rs, armor_class.rs, creature_type.rs, creature.rs, creature_service.rs | all five | ok |
| 6 constructor only (`CreatureId::new(...)`, `HitPoints::init(...)`, `CreatureEntity::new(...)`, `CreatureType::Monstrosity`) | creature_facade.rs -> creature_id.rs, hit_points.rs, speed_type.rs; persisted_creatures.rs -> creature_entity.rs; centaur.rs -> creature_type.rs | none | missing: only types in signatures, fields, generics and `impl` headers are collected, path expressions in function bodies are ignored (probe `A::new()` and `A::K` both yield nothing) |
| 6 static member only (`CreatureFacade::STANDARD_CREATURE_TYPE`, `CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION`) | the three upward edges of 3 | none | missing, same cause as constructor-only |
| 6 attribute only | none possible in Rust (`#[derive(Debug, Clone)]` names std traits) | no edge | ok (no false positive from derives) |
| 7 same simple name: domain `Creature` (imported) and `crate::application::dto::creature::Creature` (fully qualified) both in creature_facade.rs | creature_facade.rs -> creature.rs AND -> dto/creature.rs | only -> creature.rs (x1) | missing/wrong: the fully qualified DTO reference is resolved by its simple name `Creature`, which the `use` import wins; the DTO file has 0 incoming edges |
| 8 fully qualified without import | see 7 | see 7 | works in isolation (probe `struct F { x: crate::a::A }` resolves), fails when the simple name is also imported |
| 9 unused import `Fightable` in creature_util.rs | no edge | no edge | ok |
| 10 `HashMap`, `Uuid`, `log::info!` | no internal edges | none | ok |
| 11 `tests/creature_service_test.rs` | skipped by default; with `--include-tests` -> creature.rs, creature_id.rs, dice.rs, speed.rs, no_such_creature_exception.rs, creature_service.rs, creatures.rs | default: file absent (ok); `--include-tests`: file present with leaves `StableCreatures`, `should_save_creature_to_the_stable` but 0 outgoing edges | missing: the test imports `cellars_and_centaurs::domain::...` (the Cargo package name) while the node paths are rooted at `rust::...` (the directory before `src/`); `impl Creatures for StableCreatures` does not resolve either |
| 11 inline `#[cfg(test)] mod tests` in creature_service.rs | ideally not counted | counted in the default run: leaves `creature_service.tests.InMemoryCreatures`, `...tests.should_save_creature_to_the_stable`, edges creature_service.rs -> creature_id.rs and -> no_such_creature_exception.rs, x2 on -> creature.rs and -> creatures.rs | extra (test code in the production graph); Rust's idiomatic unit test location is inside the file, `--include-tests` cannot separate it |
| 12 `dice.rs` with `Dice`, `DiceRoll`, `roll_d20`; `storage.rs` with `Repository`, `Identified` | leaves for all five, intra-file leaf edges | all leaves present, leaf edges Dice <-> DiceRoll, roll_d20 -> DiceRoll, Repository -> Identified | ok |

- Totals: 41 file edges expected in the default run (see the pre-run list below), 31 found, 10
  missing, 0 false positives. All 31 found edges are in the expected list.
- Cycles: expected creature -> creature_facade -> creature_service -> creature and armor_class ->
  creature_util -> creature -> armor_class; reported: none (`isCyclic` never set) because the three
  upward edges are missing. Upward edges: expected 3, reported 0. Consequence for the levels:
  `src/domain` level 0, `src/application` and `src/adapter` level 1, which looks like a clean layering
  but only because the deliberate violations are invisible.
- Leaf kinds: `struct` -> CLASS, `trait` -> INTERFACE, `enum` -> ENUM, `fn` -> FUNCTION, `const` ->
  VARIABLE: right. `type XPValue = u32` -> CLASS: debatable (a type alias). `impl` blocks are folded into
  their type, `pub use` re-exports produce no visible REEXPORT leaves (the carriers are folded into the
  definition, which is what the glob test confirms). The `mod tests` chain appears in the leaf path
  (`domain.service.creature_service.tests.InMemoryCreatures`), which is right for Rust.
- Files that contain only `mod` declarations (`src/lib.rs`, `src/adapter/mod.rs`, `src/domain/mod.rs`,
  `src/application/dto/mod.rs`) are dropped from the tree entirely (24 files in the map, 29 on disk);
  `mod.rs` files with `pub use` lines stay, with 0/0 metrics.
- Metrics: `incoming_dependencies` / `outgoing_dependencies` are consistent with the found edges
  (`creature.rs` 7 in / 7 out, `creature_id.rs` 6 in, `creature_service.rs` 6 out because the inline
  test module doubles two edges). They inherit the misses: `creature_facade.rs` and `creature_util.rs`
  show 0 incoming although three files depend on them, `dto/creature.rs` shows 0 incoming.
- Language vs. CodeCharta: Rust has a real module tree rooted at the crate and `use` paths are
  unambiguous, so resolution is mostly mechanical: `crate::`, `super::super::`, `self::` and `mod.rs`
  directory modules all resolved correctly. CodeCharta has to reconstruct the module path from the
  file system (done) and the crate name from `Cargo.toml` (not done: it takes the directory before
  `src/`, which breaks every path that uses the real crate name, i.e. all integration tests, examples,
  benches and every workspace whose crate directory is not named like its package). The parser
  also has to apply `use ... as` aliases itself and to look into function bodies for `Type::item`
  paths; neither happens today.

## Domain language parser
- `domainlanguageparser -nc ... -e "output,FINDINGS.md"` ran without error (29 files, exit 0). Also run
  once each: `--stop-word-level MINIMAL`, `--stop-word-level AGGRESSIVE`, `--exclude-tests`,
  `--no-technical-stopwords`, `--comment-weight=1`, `--string-weight=5`, `--ngrams=2` (all exit 0, output
  in the scratchpad). `--comment-weight 0` and `--string-weight 0` are rejected with
  `IllegalArgumentException: --comment-weight must be positive, got 0` and a stack trace, so a source
  cannot be switched off for a differential run; the weights were made visible with 1 and 5 instead.
- Expected words at the root node (96 words in total): all 17 appear. creature 137, speed 51, hit 34,
  points 34, armor 27, stable 22, roll 15, dice 12, centaur 9, damage 8, treasure 5, hoard 5, dungeon 3,
  cellar 2, lair 2, initiative 2, encounter 2. Default weights are visible as identifier 3, comment 2,
  string 1 (a word that appears once as an identifier scores 3, once in a doc comment 2, once in a
  string 1).
- Keyword leakage: none. `fn`, `pub`, `struct`, `impl`, `self`, `let`, `mut`, `use`, `crate`, `mod`,
  `dyn`, `Box`, `Vec`, `Option`, `String`, `HashMap`, `Some`, `None`, `Ok`, `Err`, the derive traits
  (`Debug`, `Clone`, `PartialEq`, `Eq`, `Hash`, `Copy`), `cfg`, `test`, `allow`, `non_snake_case` and the
  `info!`/`debug!` macros are all absent. `class` (26) is present, which is right for Rust (not a
  keyword) and here it is the domain word from `ArmorClass`.
- Technical leakage at MODERATE: `id` 57, `new` 39 (the conventional constructor name, in every struct),
  `repository` 15, `entity` 6, `facade` 6, `dto` 6, `persisted` 6, `standard` 6, `key` 9, `one` 6 and
  `all` 8 (the residue of the filtered `find_one` / `find_all`), `such` 7 (residue of
  `NoSuchCreatureException` after `no` and `exception` are removed), `fmt` 3, `formatter` 3, `deref` 3,
  `target` 3, `uuid` 3, `init` 3, `item(s)` 3, `20` 9, plus the layer names `adapter`, `application`,
  `domain`, `model`, `persistence`, `storage` (3 each, from `mod` declarations and paths). `service`,
  `save`, `find`, `set`, `create`, `base`, `exception` are correctly filtered (they come back with
  MINIMAL). The README expects `entity`, `repository`, `facade` to be gone at MODERATE; they are only
  in the AGGRESSIVE list, so at the default level they leak. Verdict: wrong for `new`, `id`, `fmt`,
  `formatter`, `deref`, `target`, `uuid` (Rust std/convention names that belong in the Rust keyword
  list); debatable for `repository`/`entity`/`facade`/`dto` (README says MODERATE, list says
  AGGRESSIVE).
- MINIMAL adds save 27, find 24, service 21, base 15, set 15, exception 6, create 3; AGGRESSIVE removes
  repository, value, dto, entity, facade, adapter, init, model, otherwise identical to MODERATE.

| form | identifier | words found |
| --- | --- | --- |
| snake_case | `walking_speed` (facade) | walking, speed |
| camelCase | `walkingSpeed` (test file, `#![allow(non_snake_case)]`) | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points |
| PascalCase | `ArmorClass` | armor, class |
| Acronym | `XPValue` (type alias) and `xp_value` (field) | xp, value (both forms; the acronym is kept as one chunk, not split into letters) |
| Digit | `d20_roll`, `roll_d20`, `d20Roll` (test) | roll and the bare number `20` (9 at root); the `d` is dropped as a one-letter token, so the domain term `d20` is lost and a numeric token leaks as a word |
| Kebab in string | `"centaur-stable"` | centaur 1, stable 1 (hyphen split, string weight 1) |

- Comments and strings: all four planted sentences are counted. `creature.rs`: roams, cellar, centaurs,
  beasts, dragons, share, all (2 each = comment weight 2); `hit_points.rs`: drop, takes, damage, recover,
  rests, lair; `creature_facade.rs`: rolls, initiative, every, dungeon, before, encounter, starts;
  `creature_util.rs`: counts, treasure, hoard, guards. `"No such creature in the dungeon: "` gives
  such, creature, dungeon (1 each); `"centaur-stable"` as above. With `--comment-weight=1` every
  comment word drops by exactly 1, with `--string-weight=5` `centaur` goes 9 -> 21 and `ididid`,
  `natural`, `saving`, `created` go 1 -> 5, so the weights work as documented. English stop words
  (`the`, `in`, `for`, `when`, `it`, `its`, `and`, `a`, `no`) are removed. No stemming: `creature`/
  `creatures`, `centaur`/`centaurs`, `beast`/`beasts`, `dragon`/`dragons`, `roll`/`rolls`, `speed`/
  `speeds` are counted separately.
- Test file handling: `tests/creature_service_test.rs` is included by default (`stabled` 3, `walking` 3
  from `walkingSpeed`, `should_save_creature_to_the_stable` -> `stable` after `should`, `save`, `to`,
  `the` are filtered). `--exclude-tests` drops it (28 files; `stabled` disappears, `stable` 22 -> 16,
  `creature` 137 -> 128) but cannot drop the inline `#[cfg(test)] mod tests` in `creature_service.rs`
  (`memory` 3, `saved` 3 from `InMemoryCreatures` stay). `tests` itself only shows up with
  `--no-technical-stopwords` (3, from `mod tests`).
- `--ngrams=2` gives sensible bigrams: `hit points` 30, `armor class` 24, `attack bonus` 9, `xp value` 9,
  `walking speed` 6, `dice roll` 3, but also `20 roll` 6 and `roll 20` 3 from the digit split.

## Verdict
- Good: module resolution (`crate::`, `super::super::`, `self::`, `mod.rs` directories, `pub use`
  barrels, glob imports through barrels), trait implementations and generic bounds as edges, no
  std/third-party edges, no false positives at all, no keyword leakage in the domain lens, all 17 domain
  words present, comment and string weights work and are visible, the `tests/` directory is skipped
  resp. included as documented. Round 2: the 2018-style `lair.rs` + `lair/` layout, a nested
  `use ...::{self, creature::Creature}` list (both halves), `pub(crate) use`, a type used only as a
  generic argument (`Vec<Centaur>`) and a trait used only as `&impl Fightable` all resolve;
  `extern crate log;` adds no false positive; no round-1 edge changed.
- Wrong: 1. `creature_facade.rs`: the fully qualified `crate::application::dto::creature::Creature`
  resolves to the imported `domain::model::creature::Creature`, so the DTO has no incoming edge and
  the two same-name types collapse into one. 2. `creature_service.rs`: the inline `#[cfg(test)] mod
  tests` is part of the production graph (two extra edges, two doubled edges, two test leaves) and
  cannot be excluded. 3. `tests/creature_service_test.rs` with `--include-tests`: zero edges because
  the crate root is derived from the directory name (`rust`) instead of the Cargo package name
  (`cellars_and_centaurs`). 4. Domain lens: `new` 39, `id` 57, `fmt`/`formatter`/`deref`/`target`/`uuid`
  leak; `d20` becomes the bare number `20`; `repository`/`entity`/`facade` survive MODERATE although
  the README expects them filtered. 5. `--comment-weight 0` / `--string-weight 0` crash with a stack
  trace instead of a one-line message. 6. (round 2, found by probing, not triggered in the project)
  `Node.resolveTypeImport` has a substring fallback: an unresolvable single-name type is attached to
  the first project type whose dotted path merely *contains* the consumer's own module path, so
  `f.rs` with `use crate::nowhere::E;` gets the edge `f.rs -> e_file.rs` while `q.rs` does not. With
  the relative paths the parser sees the crate prefix is empty, so short module names match a lot;
  this is a false-positive generator in real crates.
- Missing: 1. `use ... as Entity` in `creature_repository.rs`: the alias is never applied, so
  `creature_repository.rs -> creature_entity.rs` is missing (and the `Repository<Entity>` argument
  with it). 2. Types used only in function bodies (`CreatureId::new`, `HitPoints::init`,
  `SpeedType::Walking`, `CreatureEntity::new`, `CreatureType::Monstrosity`,
  `CreatureFacade::STANDARD_CREATURE_TYPE`, `CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION`): nine
  edges missing, among them all three upward edges, so the planted cycles
  (creature -> creature_facade -> creature_service -> creature, armor_class -> creature_util ->
  creature -> armor_class) and the upward flags are not reported and the layer levels look clean.
  3. Files with only `mod` declarations (`lib.rs`, `adapter/mod.rs`, `domain/mod.rs`, `dto/mod.rs`) are
  absent from the map. 4. No stemming/lemmatization in the domain lens (`creature` vs `creatures`).
  5. (round 2) `#[path = "creature_naming.rs"] pub mod naming;` is ignored: the module path is taken
  from the file system only, so `crate::application::naming::CreatureNaming` never resolves.
  6. (round 2) Macro invocations (`creature_count!(...)`) and function calls (`roll_d20()`) are never
  edges, so a `macro_rules!` defined in another file and a `use` inside a function body cannot be
  credited; a type used only in a `match` pattern (`CreatureType::Dragon`) misses like every other
  path inside a function body.

## Expected file-level edges (written before the first run)

Paths relative to `training/rust/`, `m/` = `src/domain/model/`, `s/` = `src/domain/service/`,
`p/` = `src/adapter/persistence/`, `a/` = `src/application/`. Barrel re-exports (`pub use` in the
`mod.rs` files) are expected to be folded, so the edge should land on the defining file.

| from | to |
| --- | --- |
| m/creature.rs | a/creature_facade.rs (via `crate::application` barrel, upward, cycle) |
| m/creature.rs | m/armor_class.rs, m/creature_id.rs, m/creature_type.rs, m/fightable.rs, m/hit_points.rs, m/speed.rs, m/speed_type.rs |
| m/armor_class.rs | a/creature_util.rs (via barrel, upward, cycle) |
| m/no_such_creature_exception.rs | m/creature_id.rs |
| m/centaur.rs | m/creature.rs, m/creature_id.rs, m/creature_type.rs, m/fightable.rs |
| s/creatures.rs | m/creature.rs, m/creature_id.rs, m/no_such_creature_exception.rs |
| s/creature_service.rs | m/creature.rs, s/creatures.rs (+ m/creature_id.rs, m/no_such_creature_exception.rs from the inline `#[cfg(test)]` module, which a parser cannot skip) |
| p/creature_repository.rs | p/creature_entity.rs (aliased `as Entity`), p/storage.rs (`Repository<T>`, `Identified`) |
| p/persisted_creatures.rs | p/creature_entity.rs, p/creature_repository.rs, a/creature_facade.rs (via barrel, upward), m/creature.rs, m/creature_id.rs, m/no_such_creature_exception.rs, s/creatures.rs |
| a/creature_facade.rs | m/armor_class.rs, m/creature.rs, m/creature_id.rs, m/creature_type.rs, m/hit_points.rs, m/speed.rs, m/speed_type.rs, s/creature_service.rs, a/dto/creature.rs (fully qualified, no import) |
| a/creature_util.rs | m/creature.rs, m/speed.rs (both via glob `use crate::domain::model::*`); NOT m/fightable.rs (unused import) |
| tests/creature_service_test.rs (only with `--include-tests`) | m/creature.rs, m/creature_id.rs, m/dice.rs, m/speed.rs, m/no_such_creature_exception.rs, s/creature_service.rs, s/creatures.rs |

No edges expected from: `src/lib.rs`, every `mod.rs` (only `mod` declarations and folded re-exports),
`m/creature_id.rs`, `m/creature_type.rs`, `m/speed.rs`, `m/speed_type.rs`, `m/fightable.rs`,
`m/hit_points.rs`, `m/dice.rs`, `p/creature_entity.rs`, `p/storage.rs`, `a/dto/creature.rs`.
No edges to `std`, `log`, `uuid`.

Expected cycles: creature -> creature_facade -> creature_service -> creature (and the direct
creature <-> creature_facade pair); armor_class -> creature_util -> creature -> armor_class.
Expected upward edges: creature.rs -> creature_facade.rs, armor_class.rs -> creature_util.rs,
persisted_creatures.rs -> creature_facade.rs.

### Round 2 additions (written before the second run)

New files: `m/lair.rs` + `m/lair/den.rs` (2018-style layout, no `mod.rs`), `m/creature_macros.rs`,
`a/creature_naming.rs` (loaded as module `naming` through `#[path]`), `a/creature_report.rs` (the
consumer of most forms). New declarations: `extern crate log;` in `src/lib.rs`, `pub mod creature_macros;`,
`pub mod lair;`, `pub(crate) use lair::Lair;` in `m/mod.rs`, `pub mod creature_report;` and
`#[path = "creature_naming.rs"] pub mod naming;` in `a/mod.rs`. Every row is the only way the `from`
file depends on the `to` file.

| from | to | form |
| --- | --- | --- |
| m/lair.rs | m/lair/den.rs | 2018-style module layout: `pub mod den;` in `lair.rs`, file `lair/den.rs`, `use crate::domain::model::lair::den::Den` as field type |
| a/creature_report.rs | a/creature_naming.rs | `#[path = "creature_naming.rs"] pub mod naming;` in `a/mod.rs`, `use crate::application::naming::CreatureNaming` as field type |
| src/lib.rs | (none) | `extern crate log;` must not produce an internal edge |
| a/creature_report.rs | m/creature.rs | nested `use crate::domain::model::{self, creature::Creature}`, `&Creature` parameter |
| a/creature_report.rs | m/speed.rs | the `self` part of the same `use`: `model::Speed` as return type (through the `pub use speed::Speed` barrel) |
| a/creature_report.rs | m/lair.rs | `pub(crate) use lair::Lair;` in `m/mod.rs`, `use crate::domain::model::Lair` as field type |
| a/creature_report.rs | m/creature_macros.rs | `macro_rules! creature_count` + `pub(crate) use creature_count;` in the macro file, `use crate::domain::model::creature_macros::creature_count;` and `creature_count!(...)` in the report |
| a/creature_report.rs | m/centaur.rs | `Centaur` only as generic argument `Vec<Centaur>` (field) |
| a/creature_report.rs | m/creature_type.rs | `CreatureType` only in the match pattern `CreatureType::Dragon =>` |
| a/creature_report.rs | m/fightable.rs | `Fightable` only as `fighter: &impl Fightable` argument |
| a/creature_report.rs | m/dice.rs | `use crate::domain::model::dice::roll_d20;` inside the body of `fn initiative`, then `roll_d20()` |

No edges expected from `m/lair/den.rs`, `m/creature_macros.rs`, `a/creature_naming.rs`. No edge is
expected to land on `m/mod.rs` or `a/mod.rs` (the barrels should stay folded). No round-1 edge should
change; the round-1 misses (aliased import, function-body paths, upward edges, DTO) stay as they are.

## Round 2: additional dependency forms

- Added: `src/domain/model/lair.rs` + `src/domain/model/lair/den.rs` (2018-style layout without
  `mod.rs`), `src/domain/model/creature_macros.rs`, `src/application/creature_naming.rs` (module
  `naming` via `#[path]`), `src/application/creature_report.rs` (the consumer of most forms);
  `extern crate log;` in `src/lib.rs`; the module declarations and `pub(crate) use lair::Lair;` in
  the two barrels. Round-1 files were not changed apart from those added declarations.
- The three README commands ran again without error (exit 0; 33 files in the default run, 34 with
  `--include-tests` and for the domain parser). Result: 37 file edges (31 from round 1 + 6 new),
  32 leaves, 44 leaf edges, 29 files in the map (24 + the 5 new ones; `src/lib.rs` is still absent).
- Probe crates in the scratchpad (one file per variant) were used again to separate causes; the
  relevant results are quoted in the notes. `--verbose` still adds nothing.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| 2018-style module layout (`lair.rs` next to `lair/`, `pub mod den;`) | m/lair.rs, m/lair/den.rs | lair.rs -> lair/den.rs | yes | module path derived correctly: leaves `domain.model.lair.Lair` and `domain.model.lair.den.Den`, folder `src/domain/model/lair` and file `lair.rs` side by side in the tree |
| `#[path = "creature_naming.rs"] pub mod naming;` | a/mod.rs, a/creature_naming.rs, a/creature_report.rs | creature_report.rs -> creature_naming.rs | no | the attribute is not read: the module path comes from the file system only, the leaf is `application.creature_naming.CreatureNaming` and `crate::application::naming::CreatureNaming` matches nothing in the dictionary. Probes that seemed to resolve `#[path]` (`f.rs -> e_file.rs`) turned out to be the substring fallback described below (`f` is contained in `e_file`) |
| `extern crate log;` | src/lib.rs | none | no edge (ok) | no false positive; `lib.rs` stays absent from the dependency map; in the domain lens `lib.rs` counts only `adapter`, `application`, `domain` (3 each), `extern`/`log` do not leak |
| nested `use crate::domain::model::{self, creature::Creature}`, `&Creature` parameter | a/creature_report.rs | -> m/creature.rs | yes | |
| the `self` half of that `use`: `model::Speed` as return type | a/creature_report.rs | -> m/speed.rs | yes | resolved through the `pub use speed::Speed` barrel, no edge to `model/mod.rs` |
| `pub(crate) use lair::Lair;` in the barrel, `use crate::domain::model::Lair` as field type | m/mod.rs, a/creature_report.rs | -> m/lair.rs | yes | `pub(crate) use` is folded like `pub use`; `Lair` gets level 1 |
| `macro_rules! creature_count` + `pub(crate) use creature_count;`, `use crate::...::creature_count;` and `creature_count!(self.herd)` | m/creature_macros.rs, a/creature_report.rs | -> m/creature_macros.rs | no | the definition becomes a leaf `domain.model.creature_macros.creature_count kind=FUNCTION` (debatable, a macro), the invocation is a function-body expression and is not collected. Probe: the `#[macro_use] mod m;` + `mk!()` variant yields nothing either. The `pub(crate) use creature_count;` self re-export produces no extra leaf |
| `Centaur` only as generic argument `Vec<Centaur>` | a/creature_report.rs | -> m/centaur.rs | yes | generic arguments of field types are collected (round 1 lost `Repository<Entity>` only because of the alias) |
| `CreatureType` only in the match pattern `CreatureType::Dragon =>` | a/creature_report.rs | -> m/creature_type.rs | no | same cause as the round-1 constructor / static-member misses: paths inside function bodies are ignored. Probe: a typed local `let value: crate::a::A = ...` and a turbofish `x.is::<A>()` inside a body yield nothing either |
| `Fightable` only as `fighter: &impl Fightable` | a/creature_report.rs | -> m/fightable.rs | yes | argument-position `impl Trait` is collected as a used type |
| `use crate::domain::model::dice::roll_d20;` inside `fn initiative`, then `roll_d20()` | a/creature_report.rs | -> m/dice.rs | no | not attributable to the inner `use`: the probe with the same `use` at file level and the call in the body yields nothing either, so function calls are never edges wherever the `use` sits (`dice.rs` still has 0 incoming edges although three files call `roll_d20`) |

- Totals: 10 edges expected plus one "no edge" check, 6 found, 4 missing, 0 wrong targets, 0 new false
  positives. All 6 new edges are in the round-2 expected list.
- Round-1 edges: unchanged. All 31 round-1 edges are present with the same multiplicities (`x2` on
  `creature_service.rs -> creature.rs` and `-> creatures.rs`), none gained or lost, the 10 round-1
  misses are still missing, `isCyclic` / `isPointingUpwards` are still never set. Metric changes come
  only from the new edges: `creature.rs` 8 in (was 7), `speed.rs` 4 in (was 3), `fightable.rs` 3 in
  (was 2), `centaur.rs` 1 in (was 0), `lair.rs` 1 in / 1 out, `lair/den.rs` 1 in, `creature_report.rs`
  5 out. With `--include-tests` the test file is still present with 0 outgoing edges. In the domain
  lens the new words are plausible (`lair` 14, `treasure` 14, `naming` 12, `den` 9, `depth` 9,
  `herd` 3, `report` 6); `macro`, `rules`, `expr`, `path`, `extern`, `log`, `usize`, `len` do not leak.
- New false positives in the project: none. Found by probing: `Node.resolveTypeImport` ends with a
  `hasOnlyName` wildcard step that accepts the first project type whose dotted path *contains* the
  consumer's own module path (the self wildcard every node carries; the code has a TODO on it).
  Because the parser sees paths relative to the analysed directory, `deriveCrateRoot` finds no
  directory before `src` and the crate prefix is empty, so the wildcard is just the module name:
  `f.rs` or `ile.rs` with `use crate::nowhere::E;` gets `-> e_file.rs`, `k.rs` and `q.rs` do not; `l.rs`
  gets `-> sub/n_file.rs`. This is also why round 1's "node paths are rooted at `rust::`" is not
  quite right: there is no crate prefix at all, which leaves the conclusion (the Cargo package name
  `cellars_and_centaurs` is unknown, so integration-test imports cannot resolve) unchanged.
- Leaf kinds for the new declarations: `Lair`, `Den`, `CreatureNaming`, `CreatureReport` -> CLASS
  (right), `macro_rules! creature_count` -> FUNCTION (debatable).
