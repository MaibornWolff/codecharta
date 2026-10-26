# Rust

Report of 2026-10-08 (round 3). All numbers come from the runs in `output/` made on that day with the
built CLI; the 2026-09-06 claims were re-checked against this output, see "Changed since 2026-09-06".

## Project
- Layout: `Cargo.toml` (package `cellars_and_centaurs`, edition 2021), `src/lib.rs`, the four layers as
  directories with `mod.rs` barrels, `tests/creature_service_test.rs` as integration test. 37 `.rs`
  files. The project parses but was never compiled.
- Round 3 added three files and wired them into the barrels:
  `src/domain/service/encounter_resolver.rs` (`EncounterResolver`),
  `src/domain/service/encounter_edge_cases.rs` (`EncounterEdgeCases`, 62 functions, one construct each),
  `src/domain/model/zentaurenhoehle.rs` (`Zentaurenhöhle` with field `rüstungsklasse`). The file is
  named with `oe` because rustc refuses to load a non-ASCII module name from a file (E0754); type and
  field keep their umlauts. `git check-ignore -v` reports none of the three as ignored.
- Extension variants: none apply. All three parsers register only `.rs` for Rust.
- Stress constructs of rounds 1 and 2 are unchanged (aliased import, glob import, `mod.rs` barrels,
  trait implementations, generic `Repository<T>`, same simple name in two modules, fully qualified
  path, unused import, std / third-party usage, test file plus inline `#[cfg(test)] mod tests`, several
  declarations per file, 2018-style `lair.rs` + `lair/`, `#[path]`, `macro_rules!`, `extern crate`).
- Not in the language: class inheritance (`Centaur` holds a `Creature` and implements `Deref`), a type
  referenced only in an attribute, a ternary operator (the `if` expression is used), `try` / `catch` /
  `finally` (`safe_roll` uses a `match` on a `Result`, the `Err` arm stands in for the catch), `do …
  while`, `goto`, fallthrough, default and variadic parameters (only `extern "C"` declarations may be
  variadic), property accessors, generators (an `Iterator` implementation is the idiom), a root
  namespace (the crate is the root).
- `safe_roll` deviates from the shared table by one branch: the `Ok` arm is a second `case`, so the
  expected logic complexity is 3 where a language with `try` / `catch` has 2. `is_empty` ends in a tail
  expression, not a `return`, which is the Rust idiom.

## Dependency parser
- `dependencyparser -nc … -e "output,FINDINGS.md"` with and without `--include-tests`: exit 0. Default
  run scans 36 files and writes 32 file nodes, 51 file edges, 100 leaves; `--include-tests` 37 files,
  33 nodes, 51 edges, 102 leaves. `--verbose` adds only the phase timings, there is still no
  diagnostic for an unresolved import or type.
- Probe crates in the scratchpad were used to separate causes; results are quoted where relevant.

Round 3, new files (expected written before the run):

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| `encounter_resolver.rs`: `&Creature` parameters, `Dice` parameter | -> creature.rs, -> dice.rs | both | ok |
| `encounter_resolver.rs`: `SpeedType::Flying` only in the body of `resolve` | -> speed_type.rs | none | missing (function bodies are not read) |
| `zentaurenhoehle.rs`: field `rüstungsklasse: ArmorClass` in `Zentaurenhöhle` | -> armor_class.rs | found | ok |
| `encounter_edge_cases.rs`: `use super::encounter_resolver::EncounterResolver`, field type | -> encounter_resolver.rs | found | ok (`super::` import) |
| unimported relative path `&dyn super::creatures::Creatures` in `relative_path_type` | -> creatures.rs | found | ok |
| const type `pub const STARTING_ARMOR: Option<ArmorClass>` | -> armor_class.rs | found | ok |
| tuple struct `Pack(pub Vec<Centaur>)` | -> centaur.rs | found | ok |
| tuple variant `Outcome::Slain(CreatureId)` | -> creature_id.rs | found | ok |
| struct variant `Outcome::Fled { lair: Lair }` with `use crate::domain::model::Lair` (barrel `pub(crate) use lair::Lair` in `model/mod.rs`) | -> lair.rs | none | missing. The variant is not the cause (probe: a struct-variant field resolves with the direct path `…::lair::Lair`). The barrel import is: see "barrels" below |
| type alias `type SpeedTable = HashMap<SpeedType, u32>` | -> speed_type.rs | found | ok |
| associated type `type Output = HitPoints` in `impl Add<u32> for Pack` | -> hit_points.rs | found | ok |
| return type `impl Iterator<Item = Creature>` in `wandering` | -> creature.rs | none | missing: a type named only in an associated-type binding `Item = …` is not followed (probe: `Box<dyn Iterator<Item = Gamma>>` misses too, `Vec<Gamma>` resolves) |
| where clause `T: Fightable` in `where_bound` | -> fightable.rs | found | ok |
| function pointer `raise: fn(u32) -> NoSuchCreatureException` | -> no_such_creature_exception.rs | found | ok |
| parameter `gewölbe: &Zentaurenhöhle` (non-ASCII type name) | -> zentaurenhoehle.rs | found | ok |
| typed local `let dice: Dice` in `typed_local` | -> dice.rs | none | missing (body) |
| turbofish `Vec::<Speed>::with_capacity` in `turbofish_local` | -> speed.rs | none | missing (body) |
| struct literal `Den { depth: 3 }` in `struct_literal_local` | -> lair/den.rs | none | missing (body) |
| closure parameter `\|kind: CreatureType\|` in `closure_parameter_type` | -> creature_type.rs | none | missing (body) |
| inline `#[cfg(test)] mod tests` with `fn service_size(service: &CreatureService)` | no edge in the default run (test code) | -> creature_service.rs | extra: test code is in the production graph |

Rounds 1 and 2, re-verified on the fresh output:

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| 1 aliased import `use …::CreatureEntity as Entity` in `creature_repository.rs` | -> creature_entity.rs | none | missing (probe `use crate::e_file::E as Alias; struct D { e: Alias }` yields nothing) |
| 2 glob `use crate::domain::model::*` in `creature_util.rs` | -> creature.rs, -> speed.rs | both | ok, but through the name-only fallback, see false positives |
| 3 barrel `use crate::application::CreatureFacade` / `CreatureUtil` used as `Type::CONST` in `creature.rs`, `persisted_creatures.rs`, `armor_class.rs` | three upward edges | none | missing (body, and nested barrels do not resolve) |
| 4 `impl Fightable for Creature`, `impl Fightable for Centaur`, `impl Creatures for PersistedCreatures`, field `base: Creature` | 4 edges | all | ok |
| 5 generic `Repository<T: Identified>` | creature_repository.rs -> storage.rs, leaf `Repository -> Identified` | both | ok |
| 6 type position only (facade parameters, return type, field) | creature_facade.rs -> speed.rs, armor_class.rs, creature_type.rs, creature.rs, creature_service.rs | all five | ok |
| 6 constructor / variant / static member only (`CreatureId::new`, `HitPoints::init`, `SpeedType::Walking`, `CreatureEntity::new`, `CreatureType::Monstrosity`) | creature_facade.rs -> creature_id.rs, hit_points.rs, speed_type.rs; persisted_creatures.rs -> creature_entity.rs; centaur.rs -> creature_type.rs | none | missing (body) |
| 7 / 8 fully qualified `crate::application::dto::creature::Creature` next to the imported domain `Creature` in `creature_facade.rs` | -> dto/creature.rs | none, `dto/creature.rs` has 0 incoming | missing / wrong: the simple name wins |
| 9 unused import `Fightable` in `creature_util.rs`, 10 `HashMap`, `Uuid`, `log` | no edge | no edge | ok |
| 11 `tests/creature_service_test.rs` | skipped by default, 7 edges with `--include-tests` | skipped by default; with `--include-tests` the file and its leaves `StableCreatures`, `should_save_creature_to_the_stable` appear with 0 edges | missing: the test imports `cellars_and_centaurs::…`, the package name from `Cargo.toml` is not read |
| 11 inline `mod tests` in `creature_service.rs` | not in the default run | -> creature_id.rs, -> no_such_creature_exception.rs, x2 on -> creature.rs and -> creatures.rs | extra |
| 12 several declarations per file (`dice.rs`, `storage.rs`) | leaves and intra-file leaf edges | all | ok |
| r2 2018-style `lair.rs` + `lair/den.rs` | lair.rs -> lair/den.rs | found | ok |
| r2 `#[path = "creature_naming.rs"] pub mod naming;` | creature_report.rs -> creature_naming.rs | none | missing |
| r2 nested `use …::model::{self, creature::Creature}`, `Vec<Centaur>`, `&impl Fightable` | -> creature.rs, centaur.rs, fightable.rs | all | ok |
| r2 `model::Speed` as return type | -> speed.rs | found | ok |
| r2 `use crate::domain::model::Lair` (barrel) as field type in `creature_report.rs` | -> lair.rs | found | right edge for the wrong reason, see false positives |
| r2 `creature_count!(…)`, `CreatureType::Dragon =>` pattern, `roll_d20()` call | -> creature_macros.rs, creature_type.rs, dice.rs | none | missing (body, macro invocation, function call) |

- Totals, default run: 71 edges expected (41 + 10 + 20), 50 found, 21 missing, 0 edges with a wrong
  target, plus the predicted edge from the inline test module of the edge-case file (51 reported).
- Barrels: a `pub use` is folded only at the crate root. Probe: `lib.rs` with `pub use alpha::Alpha` and
  a consumer `use crate::Alpha` resolves; `sub/mod.rs` with `pub use inner::Inner` or `pub(crate) use`
  and a consumer `use crate::sub::Inner` yields no edge. In the project `use crate::domain::model::Speed`
  and `…::Lair` alone resolve nothing (probes with a reduced `encounter_edge_cases.rs` and
  `creature_report.rs`).
- False positives: none in the project output. By probing: a single qualified usage such as
  `model::Speed` makes every bare type name in the same file resolve to the first project type whose
  path contains `model`. A reduced `creature_report.rs` without any `use` line, holding `-> model::Speed`
  and fields of type `Lair`, `Den`, `DiceRoll`, gets edges to lair.rs, lair/den.rs, dice.rs and speed.rs.
  This is the only reason the round-2 edge creature_report.rs -> lair.rs exists. The same name-only
  fallback (`Node.resolveTypeImport`, `hasOnlyName` branch, a substring test) still gives `f.rs` with
  `use crate::nowhere::E` an edge to `e_file.rs` while `q.rs` gets none.
- Cycles and upward edges: expected creature -> creature_facade -> creature_service -> creature,
  armor_class -> creature_util -> creature -> armor_class and three upward edges. Reported: no file
  edge carries `isCyclic` or `isPointingUpwards`. The log says "Found a total of 1 cycles": it is the
  leaf pair `Dice <-> DiceRoll` inside `dice.rs`, both leaf edges are flagged `isCyclic`, one of them
  `isPointingUpwards`.
- Leaf kinds: `struct` -> class, `trait` -> interface, `enum` -> enum, `fn` -> function, `const` ->
  variable: right. `type SpeedTable` / `type XPValue` -> class and `macro_rules! clamp_roll` /
  `creature_count` -> function: debatable. The `extern "C"` declarations `abs` and `printf` are function
  leaves. `impl` methods, trait methods and nested functions (`halve`, `initiative_of`) are not leaves.
  The two `#[cfg]` variants of `platform_bonus` are one leaf. The `static` inside `thread_local!` is no
  leaf. Leaves carry no namespace (`namespace=None` on all 100).
- Files with only `mod` declarations (`src/lib.rs`, `src/adapter/mod.rs`, `src/domain/mod.rs`,
  `src/application/dto/mod.rs`) are absent from the map; the four `mod.rs` files with `pub use` lines
  are present with 0 / 0.
- Language vs. CodeCharta: the module tree and `use` paths are unambiguous in Rust. CodeCharta derives
  the module path from the file system (works for `mod.rs`, 2018-style and `super::` / `crate::`), but
  does not read `Cargo.toml` (crate name), `#[path]`, `use … as`, nested re-exports, or anything inside
  a function body. The body is skipped on purpose: `UsedTypeExtractor` stops at every `block`.
- Known gaps of the name rules (`analysis/analysers/parsers/DependencyParser/docs/name-resolution/rust.md`): listed
  per probe in `regression/rust/known-gaps.md`.

## Unified parser
- `unifiedparser -nc … -e "output,FINDINGS.md"`: exit 0, 37 `.rs` files analysed, including
  `tests/creature_service_test.rs`, every `mod.rs` and the three new files. `Cargo.toml` is reported as
  "1 Files with the following extensions were ignored: [.toml]". The run warns "No .gitignore found at
  root level, excluding common build folders as fallback" because the analysed folder is not the
  repository root.
- A second run over one file per construct (`output/unified-probes.cc.json`, the functions of both new
  files cut into 68 files in the scratchpad) gives the per-construct numbers below; the file-level
  numbers of `encounter_edge_cases.rs` are the sum of them.

`EncounterResolver` (`src/domain/service/encounter_resolver.rs`):

| metric | expected (before the run) | reported | verdict |
| --- | --- | --- | --- |
| loc | 95 | 95 | ok |
| rloc | 77 | 77 | ok |
| comment_lines | 13 | 13 | ok |
| logic_complexity | 15 (resolve 11, safe_roll 3, initiative_order 1) | 16 | wrong: the `_ =>` arm in `resolve` counts |
| complexity | 22 (15 + 6 functions + 1 closure) | 23 | wrong, same arm |
| number_of_functions | 6 (nested `initiative_of` included) | 6 | ok |
| parameters max / min / mean / median | 5 / 0 / 1.5 / 1 | 5 / 0 / 1.6 / 1 | mean wrong: five functions in the statistic, `initiative_of` is folded into `initiative_order` |
| complexity per function max / min / mean / median | 12 / 1 / 3.67 / 1.5 | 12 / 0 / 3.6 / 2 | wrong: the function itself is not counted (`is_empty` is 0), the closure and the nested function are added to their parent (values 12, 0, 4, 2, 0). The max agrees only because the `_` arm replaces the missing +1 |
| rloc per function max / min / mean / median | 27 / 1 / 8.67 / 6.5 | 27 / 1 / 10.2 / 10 | values 27, 3, 10, 10, 1 are right (lines inside the braces); mean and median differ because `initiative_of` has no entry |
| long_method | 1 | 1 | ok |
| long_parameter_list | 1 | 1 | ok |
| message_chains | 1 | 1 | ok (the chain of 5; the chain of 3 is not counted) |
| excessive_comments | 1 | 1 | ok |

`EncounterEdgeCases` (`src/domain/service/encounter_edge_cases.rs`), file level: loc 467 / 467, rloc 378 /
378, comment_lines 14 / 14, logic_complexity expected 43, reported 37; number_of_functions expected 62,
reported 65; complexity expected 113, reported 109; message_chains expected 3, reported 1; long_method
1 / 1 (`labelled_loops`, 13 lines); long_parameter_list 0 / 0; excessive_comments 1 / 1; parameters max 4,
min 0 as expected. L = logic_complexity, C = complexity, F = functions, P = parameters.

| construct (function) | expected | reported | verdict |
| --- | --- | --- | --- |
| `match_or_patterns`: `1 \| 2`, `3 \| 4 \| 5`, `_` | L 2 | L 3 | wrong: `_` counts as a case; an or-pattern is one case (right) |
| `match_ranges`: `1..=5`, `6..=19`, `_` | L 2 | L 3 | wrong: `_` counts |
| `match_guards`: two arms `banshee if …`, `_` | L 4 (2 cases + 2 guard `if`) | L 3 | wrong twice: guards are not counted, `_` is |
| `match_without_default`: `Some(true)`, `Some(false)`, `None` | L 3 | L 3 | ok |
| `if_let_else`, `while_let` | L 1 each | L 1 each | ok |
| `if_let_chain`: `if let Some(ghoul) = found && ghoul > limit` | L 2 | L 1 | missing: the `&&` of a let chain |
| `let_else`: `let Some(specter) = found else { return 0; }` | L 1 (a branch; the counting rule does not name it) | L 0 | missing |
| `loop_break_value`: `loop` with `break counter * 2` | L 2 | L 2 | ok |
| `labelled_loops`: `'gauntlet: for`, inner `for`, two `if` with `continue` / `break 'gauntlet` | L 4 | L 4 | ok |
| `question_mark`: two `?` | L 0 by the rule | L 0 | ok by the rule; the two error exits are invisible |
| `question_mark_chain`: six calls separated by three `?` | message_chains 1 | 0 | missing: `?` ends a chain |
| `field_chain`: `warren.burrow.tunnel.depth.min(9)` | message_chains 0 | 0 | ok |
| `iterator_chain`: `.iter().filter(…).map(…).sum()` over four lines | L 0, C 3, message_chains 1 | L 0, C 3, 1 | ok; the iteration is no loop for the metric |
| `closure_expression_body`, `returns_closure` (`move \|value\|`) | C 2 each | C 2 each | ok |
| `closure_block_body`: closure with `if` | L 1, C 3 | L 1, C 3 | ok |
| `closure_parameters`: `\|left: u32, right: u32, carry: u32\|` in a function without parameters | P 0 | P 0 | ok |
| `short_circuit_expression`: `armed && awake \|\| cornered` | L 2 | L 2 | ok |
| `bitwise_is_not_logic`: `flags & mask \| 1` | L 0 | L 0 | ok |
| `nested_conditional_expression`: `if … else if … else` as expression | L 2 | L 2 | ok |
| `DEFAULT_ROUNDS`: `if cfg!(test) { 1 } else { 3 }` in a `const` item | L 1, F 0 | L 1, F 0 | ok |
| `with_rounds` (associated function), `consume(self, …)`, `peek(&self, …)`, `advance(&mut self, …)` | P 2, 1, 1, 1 | P 2, 1, 1, 1 | ok |
| `boxed(self: Box<Self>, bonus: u32)` | P 1 | P 2 | wrong: a typed `self` counts as a parameter |
| `Scarable`: signature `scare`, default method `scare_twice` with `if` | F 1, L 1, C 2 | F 2, L 1, C 3 | debatable: the bodyless signature counts as a function and enters the per-function statistic with rloc 0 |
| `impl Add<u32> for Pack` (`add`), `impl Iterator for Countdown` (`next` with `if`) | F 1 each, P 1 / 0, L 0 / 1 | as expected | ok |
| `generic_where`: `<T, F>` with `where F: Fn(&T, u32) -> u32` | P 2, L 2 | P 2, L 2 | ok |
| `const_generic<const SIZE: usize>(rolls: [u32; SIZE])` | P 1 | P 1 | ok |
| `lifetime_parameters<'a>` | P 2, L 1 | P 2, L 1 | ok |
| `pattern_parameters((low, high): (u32, u32), &limit: &u32, mut rounds: u32, _: u32)` | P 4 | P 4 | ok |
| `async_await`: `async fn`, `async move { }`, two `.await`, one `if` | F 1, L 1, C 2 | F 1, L 1, C 2 | ok |
| `unsafe_block`: `unsafe fn` with `unsafe { }` and `if` | F 1, L 1 | F 1, L 1 | ok |
| `extern "C" { fn abs(…); fn printf(format: *const u8, ...); }` | F 0 | F 2, C 2 | debatable: foreign declarations count as functions |
| `const_function`: `const fn` with `if` | F 1, L 1 | F 1, L 1 | ok |
| `nested_function`: `fn halve` inside, `if` in `halve` | F 2, L 1, C 3 | F 2, L 1, C 3 | ok at file level; one entry in the per-function statistic |
| `macro_rules! clamp_roll`: two rules, two `if`, one `&&` | L 3, F 0 | L 0, F 0 | missing: a macro body is a token tree |
| `macro_hides_and`: `assert!(roll > 0 && roll < 21)` | L 1 | L 0 | missing |
| `macro_hides_if`: `println!("{}", if roll > 10 { … } else { … })` | L 1 | L 0 | missing |
| `macro_hides_chain`: four calls inside `info!(…)` | message_chains 1 | 0 | missing |
| `macro_hides_closure`: closure inside `vec![…]` | C 2 | C 1 | missing |
| `platform_bonus` twice under `#[cfg(target_os = …)]` / `#[cfg(not(…))]` | F 2 | F 2 | ok (both variants count) |
| `cfg_macro_branch`: `if cfg!(debug_assertions)` | L 1 | L 1 | ok |
| `raw_string_markers`: `r#"… "// no comment" and /* none here */"#` | comment_lines 0, rloc 3 | 0, 3 | ok |
| `multi_line_raw_string`: `r##"…"##` over three lines with `//`, `/* */`, `"#` | comment_lines 0, rloc 5 | 0, 5 | ok |
| `string_with_markers`: `"http://…"`, `"… \" // still a string"`, `'/'`, `'"'`, `b"… /* bytes */"` | comment_lines 0, rloc 8 | 0, 8 | ok |
| `doc_test_carrier`: six `///` lines with a doc test holding `if` and `\|\|` | comment_lines 6, L 0 | 6, L 0 | ok |
| `nested_block_comment`: `/* … /* … */ … */` over four lines plus a trailing nested one | comment_lines 5, rloc 3, L 0 | 5, 3, L 0 | ok |
| `doc_attribute`: `#[doc = "…"]` | comment_lines 0 | 0 | ok (an attribute, not a comment) |
| `//!` (2 lines) and `/** */` (1 line) at the top of the file | 3 comment lines | part of the 14 | ok |
| inline `#[cfg(test)] mod tests` with two functions | F 2 | F 2 | ok by the rule; test code is part of the metrics |

- Line counting: loc, rloc and comment_lines are right in all three new files (`zentaurenhoehle.rs`
  12 / 9 / 1) and in every probe; comment markers inside strings, raw strings, byte strings and char
  literals never produce a comment line; nested block comments close correctly; a trailing comment
  counts for both.
- Other files: the bodyless trait signatures count as functions and pull the per-function minimum to 0
  (`fightable.rs` F 1 with rloc per function 0, `creatures.rs` F 2 with 0 / 0 / 0 / 0, `storage.rs` min 0).
  `creature_facade.rs` reports long_parameter_list 1 (`create`, 8 parameters without `self`) and
  long_method 1 (14 lines): right. `creature_entity.rs` complexity 2 with one function: the closure in
  `unwrap_or_else`. `creature_macros.rs`: 0 functions, the macro is invisible.
- The progress bar written to a pipe repeats and goes backwards ("59% 22/37" followed by "48% 18/37").

## Domain language parser
- `domainlanguageparser -nc … -e "output,FINDINGS.md"`: exit 0, 37 files. Variant runs, all exit 0, in
  `output/domain-*.cc.json`: `--stop-word-level MINIMAL`, `AGGRESSIVE`, `--exclude-tests`,
  `--no-technical-stopwords`, `--ngrams 2`, `--comment-weight=1`, `--string-weight=5`.
  `--comment-weight 0` still ends in `IllegalArgumentException: --comment-weight must be positive, got 0`
  with a stack trace.
- The lens holds one node per file (37) and nothing else: there is no word list for the root or for a
  folder. The frequencies below are the sums over all files (321 distinct words).
- Expected words: all 17 appear. creature 164, roll 56, speed 54, hit 37, points 34, armor 32, stable 22,
  dice 18, encounter 18, lair 18, treasure 14, damage 11, initiative 11, centaur 9, cellar 9, dungeon 5,
  hoard 5. Weights are visible as identifier 3, comment 2, string 1.
- Keyword leakage: none of `fn`, `pub`, `struct`, `impl`, `self`, `let`, `mut`, `use`, `crate`, `mod`,
  `match`, `async`, `await`, `unsafe`, `const`, `static`, `trait`, `where`, `loop`, `move`, `extern`,
  `u32`, `usize`, `bool`, `Vec`, `Option`, `String`, `Some`, `None`, `Ok`, `Err`, the derive traits,
  `assert`, `println`. `class` 28 is `ArmorClass` and right for Rust. `cfg`, `local`, `iterator`,
  `function`, `parameter` come from the function names of the edge-case file, not from keywords.
- Technical leakage at MODERATE: `id` 57, `new` 48 (the constructor convention), `value` 39,
  `repository` 15, `one` 12, `key` 9, `all` 8, `such` 7, `entity` 6, `facade` 6, `dto` 6, `persisted` 6,
  `fmt` 3, `formatter` 3, `deref` 3, `target` 3, `uuid` 3, `init` 3, the layer names `adapter`,
  `application`, `domain`, `model`, `persistence`, `storage` (3 each) and the bare number `20` 9.
  `service`, `save`, `find`, `set`, `create`, `base`, `exception`, `index`, `default` are filtered and
  come back with MINIMAL. AGGRESSIVE removes `repository`, `entity`, `facade`, `dto`, `adapter`, `model`,
  `init`, `value(s)`, `function`, `parameter(s)`, `iterator`. `--no-technical-stopwords` additionally
  brings `name` 18, `util` 6, `tests` 6 and `temporary` 6: `temporary` (the field of `HitPoints`) and
  `name` are removed at MODERATE although they are domain words here. Wrong for Rust: `new`, `id`, `fmt`,
  `formatter`, `deref`, `target`, `uuid` are not in the Rust keyword list. `repository`, `entity`,
  `facade` survive MODERATE although the README expects them filtered.

| form | identifier | words found |
| --- | --- | --- |
| snake_case | `walking_speed` | walking, speed |
| camelCase | `walkingSpeed` (test file) | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points |
| PascalCase | `ArmorClass` | armor, class |
| Acronym | `XPValue`, `xp_value` | xp, value |
| Digit | `d20_roll`, `roll_d20`, `d20Roll` | roll and the bare number `20`; `d20` is lost |
| Kebab in string | `"centaur-stable"` | centaur 1, stable 1 |
| Non-ASCII | `Zentaurenhöhle`, `rüstungsklasse`, `gewölbe` | zentaurenhöhle 3, rüstungsklasse 3, gewölbe 3 (kept whole) |

- Comments and strings: the four planted sentences and both strings are counted (`creature.rs` roams,
  cellar, centaurs, beasts, dragons, share 2 each; `hit_points.rs` drop, takes, recover, rests, lair;
  `creature_facade.rs` rolls, initiative, every, dungeon, before, encounter, starts; `creature_util.rs`
  counts, treasure, hoard, guards). `--comment-weight=1` lowers every comment word by one per
  occurrence, `--string-weight=5` raises `centaur` 9 -> 21 and `dungeon` 5 -> 17. No stemming:
  `creature` 164 and `creatures` 38, `speed` and `speeds`, `roll` and `rolls` are separate words.
- Planted in `encounter_edge_cases.rs`:

| source | word(s) | found |
| --- | --- | --- |
| `//!` inner doc, `/** */`, nested `/* /* */ */` | griffin, hydra, basilisk | 2 each (comment weight) |
| doc test inside `///` | gargoyle | 6: code in a doc comment is counted as comment text |
| raw string `r#"…"#`, string inside `info!(…)` | wyvern, manticore | 1 each |
| byte string `b"mimic …"` | mimic | counted (4 = `let mimic` 3 + string 1) |
| `#[doc = "The lich guards its phylactery."]` | lich, phylactery | 1 each: weighted as a string, not as a comment |
| `"ooze\ngolem …"` | ooze, golem | ooze 1, golem 0, `ngolem` 1: the escape `\n` is not decoded |
| `let Some(specter) = found else` | specter | 3 |
| `for kobold in grid`, `if let Some(wraith)`, `while let Some(zombie)`, `if let Some(ghoul) … &&`, match arm binding `banshee if …` | kobold, wraith, zombie, ghoul, banshee | 0 each: only `let`, parameters and closure parameters are read |
| `thread_local! { static TROLL_BRIDGE: … }` | troll, bridge | 0: a declaration inside a macro invocation |
| loop label `'gauntlet` | gauntlet | 0 (not expected) |

- Test file handling: `tests/creature_service_test.rs` is included by default (stabled 3, walking 3,
  stable 6). `--exclude-tests` drops it (36 files, `stabled` disappears, `creature` 164 -> 155) but keeps
  the inline `#[cfg(test)] mod tests`: `creature_service.rs` still lists memory 3 and saved 3.
- `--ngrams 2`: `hit points` 30, `armor class` 24, `attack bonus` 12, `xp value` 9, `walking speed` 6,
  `encounter resolver` 6, and the artefact `20 roll` 6.

- German words (`zentaurenhoehle.rs`): 5 of 7 appear. zentaurenhöhle 3 and rüstungsklasse 3 come from the
  identifiers only; verlies 2, trefferpunkte 2, kreatur 2 from the comment. größe 0 and höhle 0. In the
  comment and the string every umlaut and `ß` ends the word: `Zentaurenhöhle` -> `zentaurenh` 2 + `hle`,
  `Rüstungsklasse` -> `stungsklasse` 2, `gehören` -> `geh` 2 + `ren` 2, `Größe der Höhle` -> `der` 1 +
  `hle` (3 in total with the comment); `gr` and the single letters are dropped. The cause is the prose
  pattern `[a-zA-Z]` in `SplitStage`, identifiers go through a Unicode-aware path. German stop words leak:
  die 2, unter 2, dem 2, und 2, jeder 2, der 1, liegt 2 (only an English stop word list exists). The
  unified parser (12 loc, 9 rloc, 1 comment line, 1 function) and the dependency parser (leaf
  `Zentaurenhöhle`, one edge out, one in) handle the file.

## Changed since 2026-09-06
- No longer true: "the barrel import `use crate::domain::model::Lair` is folded like `pub use`" and
  "glob imports resolve through the `pub use` re-exports". Re-exports are folded only in `lib.rs`; the
  edges creature_report.rs -> lair.rs and creature_util.rs -> creature.rs / speed.rs exist because of
  the name-only fallback.
- No longer true: "0 false positives" as a property of the parser. The project output still has none,
  but a qualified usage like `model::Speed` turns every bare type name of the file into an edge.
- Changed: the domain lens has no root or folder node any more (it had a root word list of 96 words);
  the output holds file nodes only.
- Changed: the dependency run reports one cycle and sets `isCyclic` / `isPointingUpwards`, on the leaf
  edges `Dice <-> DiceRoll` inside `dice.rs`; file edges are still never flagged.
- Changed: leaf kinds are written in lower case (`class`, not `CLASS`); leaves of an inline test module
  are listed without the `tests.` path when the name is unique in the file.
- Unchanged, re-verified: the 37 edges of rounds 1 and 2 are all present with the same multiplicities;
  the aliased import, every body-only usage, the DTO with the same simple name, `#[path]`, the macro
  invocation, the three upward edges and both cycles are still missing; the integration test still has
  0 edges with `--include-tests`; the inline test module is still in the production graph; `lib.rs` and
  the `mod`-only files are still absent; `--verbose` still adds nothing; `--comment-weight 0` still
  throws; `new`, `id`, `fmt`, `repository`, `entity`, `facade` and the bare `20` still leak; all 17
  words still appear.
- New on the old files: the unified parser was not part of the earlier report. Trait signatures count
  as functions (`fightable.rs`, `creatures.rs`, `storage.rs`), `temporary` and `name` are removed as
  technical words.
- Own corrections: after the first run the parameter of `unicode_parameter` was renamed from `höhle` to
  `gewölbe`, because the identifier produced a `höhle` count that the German sentence does not produce;
  all runs were repeated. The expected values of the new files were not changed after the run.

## Verdict

### Unified parser
- Missing: 1. everything inside a macro: the two `if` and the `&&` in `macro_rules! clamp_roll`, the `&&`
  in `assert!(…)` (`macro_hides_and`), the `if` in `println!(…)` (`macro_hides_if`), the closure in
  `vec![…]` (`macro_hides_closure`), the four-call chain in `info!(…)` (`macro_hides_chain`). 2. the `&&`
  of a let chain (`if_let_chain`). 3. `let … else` (`let_else`). 4. match guards (`match_guards`). 5. a
  message chain interrupted by `?` (`question_mark_chain`); `?` itself adds no complexity
  (`question_mark`). **Decisions derived from Java: accept — 4 (match guards).** **Decision derived from Objective-C: ignore — 1, the body of the `macro_rules!` definition.** **Decisions: ignore — 1 (code inside a macro invocation); accept — 2 (let chain), 3 (`let … else`), 5 (a chain interrupted by `?`); ignore — 5 (`?` adds no complexity).**
- Wrong: 1. the `_ =>` arm counts as a case (`resolve`, `match_or_patterns`, `match_ranges`,
  `match_guards`): +1 per `match` with a wildcard. 2. complexity per function leaves out the function
  itself, so `is_empty` has 0 and the file-level complexity is not the sum of the per-function values.
  3. nested functions (`initiative_of`, `halve`) count in number_of_functions but have no entry in the
  per-function statistics, their complexity and lines go to the parent. 4. `self: Box<Self>` counts as a
  parameter (`boxed`). **Decisions derived from Java: accept — 3 (nested functions); ignore — 1 (`_` arm), 2 (per-function complexity without the own +1).** **Decision: ignore — 4 (`self: Box<Self>`).**
- Bad: bodyless trait signatures (`Scarable::scare`, `Fightable`, `Creatures`, `Identified`) and
  `extern "C"` declarations count as functions with rloc 0 and distort min / mean / median; inline test
  modules and the `tests/` file are part of the metrics; iterator chains are no loops; the progress bar
  goes backwards when piped. **Decisions derived from Java: ignore — bodiless signatures counted as functions.** **Decision derived from Java: ignore — `extern "C"` declarations counted as functions.** **Decision derived from JavaScript: ignore — the progress bar.** **Decisions: ignore — test code in the metrics, iterator chains.**
- Good: loc, rloc and comment_lines in every file and probe, including raw strings, byte strings, char
  literals, nested block comments, `//!`, `/** */`, doc tests and trailing comments; `if let`,
  `while let`, `loop`, labelled loops, `else if`, `&&` / `||` outside macros, or-patterns and ranges as
  one case; closures add complexity and no function; closure, const-generic and lifetime parameters are
  not parameters, `self` / `&self` / `&mut self` are not parameters, pattern parameters are; `async`,
  `unsafe`, `const fn`, `#[cfg]` variants; message chains of four calls across lines, field chains not
  counted; rloc per function; long_method, long_parameter_list, excessive_comments.

### Dependency parser
- Missing: 1. every type used only inside a function body: `SpeedType::Flying` (`encounter_resolver.rs`),
  `let dice: Dice`, `Vec::<Speed>`, `Den { … }`, `|kind: CreatureType|` (`encounter_edge_cases.rs`),
  `CreatureId::new`, `HitPoints::init`, `SpeedType::Walking`, `CreatureEntity::new`,
  `CreatureType::Monstrosity`, `CreatureType::Dragon =>`, `CreatureFacade::STANDARD_CREATURE_TYPE`,
  `CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION`; with them all three upward edges and both planted
  cycles. 2. re-exports in a nested `mod.rs`: `use crate::domain::model::Lair` in
  `encounter_edge_cases.rs` (`Outcome::Fled { lair: Lair }`). 3. `use … as Entity`
  (`creature_repository.rs`). 4. the crate name from `Cargo.toml`: `tests/creature_service_test.rs` has
  0 edges with `--include-tests`. 5. associated-type bindings: `impl Iterator<Item = Creature>`
  (`wandering`). 6. `#[path = "creature_naming.rs"]` (`application/mod.rs`). 7. macro invocations and
  function calls (`creature_count!`, `roll_d20()`). 8. `lib.rs` and `mod`-only files as nodes. **Decisions derived from Java: accept — 1 (types used only inside a function body), 8 (files without a type declaration as nodes).** **Decision derived from Kotlin and Java: accept — 7 (function calls and macro invocations in a body).** **Decisions: accept — 2 (re-exports in a nested `mod.rs`), 3 (`use … as`), 4 (crate name from `Cargo.toml`), 5 (associated-type bindings); ignore — 6 (`#[path]`).**
- Wrong: 1. the name-only fallback: one qualified usage (`model::Speed` in `creature_report.rs`) lets
  every bare type name of the file resolve by substring; the edge creature_report.rs -> lair.rs is an
  accident of it, and a file without imports gets edges the same way. 2. `creature_facade.rs`: the fully
  qualified `crate::application::dto::creature::Creature` resolves to the imported domain `Creature`,
  `dto/creature.rs` has no incoming edge. 3. inline `#[cfg(test)] mod tests` are in the default graph
  (`creature_service.rs`: two extra and two doubled edges; `encounter_edge_cases.rs` -> creature_service.rs). **Decisions derived from Java: accept — 2 (fully qualified name resolves to the imported type).** **Decisions: accept — 1 (name-only fallback), 3 (inline test modules).**
- Bad: no diagnostic for an unresolved import even with `--verbose`; the only reported cycle is the
  leaf pair `Dice <-> DiceRoll` inside one file while the planted file cycles are invisible, so the
  layering looks clean; macros and type aliases are `function` / `class` leaves; `extern "C"`
  declarations are leaves, `impl` methods are not. **Decision derived from TypeScript: ignore — no diagnostic with `--verbose`.** **Decision derived from Kotlin: ignore — the cycle count is at declaration level, documented; the planted file cycles come with the body usages of Missing 1.** **Decisions: ignore — macros and type aliases as `function` / `class`; ignore — `extern "C"` declarations as leaves, `impl` methods folded onto their type.**
- Good: `crate::`, `super::` and unimported relative paths, `mod.rs` and 2018-style modules; field,
  tuple-struct, enum-variant, parameter, return, const, type-alias, associated-type, where-clause,
  generic-argument, `&impl Trait`, `&dyn Trait` and function-pointer positions; trait implementations;
  non-ASCII type names; no std or third-party edges; unused imports give no edge; the `tests/` folder is
  skipped by default.

### Domain language parser
- Missing: 1. bindings outside `let`: `for kobold in`, `if let Some(wraith)`, `while let Some(zombie)`,
  the match binding `banshee` (`encounter_edge_cases.rs`). 2. declarations inside a macro invocation:
  `static TROLL_BRIDGE` in `thread_local!`. 3. a word list for the root and for folders. 4. German stop
  words. 5. stemming (`creature` / `creatures`). **Decisions derived from Java: ignore — 3 (root and folder word list), 4 (German stop words), 5 (stemming).** **Decision derived from Swift: accept — 1 (bindings outside `let`).** **Decision: ignore — 2 (declarations inside a macro invocation).**
- Wrong: 1. `zentaurenhoehle.rs`: umlauts and `ß` cut words in comments and strings (`zentaurenh`,
  `hle`, `stungsklasse`, `geh`, `ren`); `größe` and `höhle` never appear. 2. string escapes are not
  decoded: `"ooze\ngolem"` gives `ngolem`. 3. `d20` becomes the bare number `20` (`dice.rs`, test file).
  4. `new` 48, `id` 57, `fmt`, `formatter`, `deref`, `target`, `uuid` pass as domain words;
  `temporary` (`hit_points.rs`) and `name` are removed as technical. 5. `--comment-weight 0` throws
  with a stack trace. **Decisions derived from Java: accept — 1 (umlauts), 5 (weight 0); ignore — 3 (bare `20`), 4 (technical words).** **Decision: accept — 2 (string escapes).**
- Bad: doc-test code counts as comment prose (`gargoyle` 6); `#[doc = "…"]` is weighted as a string;
  `repository`, `entity`, `facade`, `dto` and the layer names survive MODERATE; `--exclude-tests` cannot
  drop inline test modules (`creature_service.rs`: memory, saved); die, unter, dem, und, jeder, der,
  liegt rank as words. **Decisions derived from Java: ignore — technical words, German stop words.** **Decision derived from Go: ignore — doc-test code as comment prose.** **Decisions: ignore — `#[doc = "…"]` weighted as a string; accept — `--exclude-tests` drops inline test modules.**
- Good: all 17 expected words; no Rust keyword leaks; snake_case, camelCase, SCREAMING_SNAKE, PascalCase,
  acronym and kebab splitting; non-ASCII identifiers stay whole; `//`, `///`, `//!`, `/* */`, `/** */`
  and nested block comments, strings, raw strings, byte strings and strings inside macro arguments are
  read; the three weights work as documented; `tests/` is included by default and dropped with
  `--exclude-tests`; bigrams are sensible.

## Expected values (written 2026-10-08 before the first run)

- `encounter_resolver.rs`: loc 95, rloc 77, comment_lines 13, logic_complexity 15 (resolve 11, describe 0,
  safe_roll 3, initiative_order 1), number_of_functions 6, complexity 22, parameters 5 / 0 / 1.5 / 1,
  complexity per function 12, 1, 5, 2, 1, 1, rloc per function (lines inside the braces) 27, 3, 10, 10,
  1, 1, long_method 1, long_parameter_list 1, message_chains 1, excessive_comments 1.
- `encounter_edge_cases.rs`: loc 467, rloc 378, comment_lines 14, logic_complexity 43,
  number_of_functions 62, complexity 113 (43 + 62 + 8 closures), parameters max 4 / min 0,
  message_chains 3, long_method 1, long_parameter_list 0, excessive_comments 1; per construct as in
  the table above.
- New file edges (20, plus 1 from test code): encounter_resolver.rs -> creature.rs, dice.rs,
  speed_type.rs; encounter_edge_cases.rs -> encounter_resolver.rs, armor_class.rs, centaur.rs,
  creature_id.rs, lair.rs, speed_type.rs, hit_points.rs, creature.rs, creatures.rs, fightable.rs,
  no_such_creature_exception.rs, dice.rs, speed.rs, lair/den.rs, creature_type.rs, zentaurenhoehle.rs
  (and -> creature_service.rs only from the inline test module); zentaurenhoehle.rs -> armor_class.rs.
- Domain words: the 17 README words; zentaurenhöhle, verlies, rüstungsklasse, trefferpunkte, kreatur,
  größe, höhle and none of die, unter, dem, und, jeder, der; planted griffin, hydra, basilisk, wyvern,
  lich, phylactery, manticore, gargoyle, mimic, ooze, golem (not ngolem), kobold, wraith, banshee,
  zombie, ghoul, specter, troll, bridge.
- Rounds 1 and 2 (unchanged from the earlier report): 41 + 10 file edges in the default run, 7 more
  from `tests/creature_service_test.rs` with `--include-tests`; cycles creature -> creature_facade ->
  creature_service -> creature and armor_class -> creature_util -> creature -> armor_class; upward edges
  creature.rs -> creature_facade.rs, armor_class.rs -> creature_util.rs, persisted_creatures.rs ->
  creature_facade.rs.
