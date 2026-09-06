# Ruby

## Project
- Layout: conventional gem layout. `cellars_and_centaurs.gemspec`, `Rakefile`, `lib/tasks/creatures.rake`,
  `lib/cellars_and_centaurs.rb` (entry point), `lib/de/sots/cellars_and_centaurs/**` for the four layers
  (`domain/model`, `domain/service`, `adapter/persistence`, `application`, `application/dto`),
  `spec/spec_helper.rb` and `spec/.../creature_service_spec.rb` (RSpec). 28 files, 27 of them carry a
  Ruby extension (`.rb`, `.rake`, `.gemspec`); `Rakefile` has none.
- Namespace: `De::Sots::CellarsAndCentaurs::Domain::Model` etc. in compact form; `version.rb` declares
  the module tree, every file `require_relative`s it (plus its real dependencies).
- All declarations of the README table exist: `Creature` (`include Fightable`), `CreatureId`,
  `CreatureType` / `SpeedType` (modules of symbol constants, Ruby has no enum), `ArmorClass`,
  `HitPoints` (`MAX_HIT_POINTS`), `Speed`, `Fightable` / `Creatures` (modules raising
  `NotImplementedError`, Ruby has no interface), `NoSuchCreatureException` (in `errors.rb`, file name
  differs from the declaration), `Centaur < Creature`, `dice.rb` with `Dice`, `DiceRoll`, constant `D20`
  and module function `Model.roll_d20`, `CreatureService`, `CreatureEntity`, `Repository` base class,
  `CreatureRepository < Repository`, `PersistedCreatures` (`include Creatures`), `CreatureFacade`
  (`STANDARD_CREATURE_TYPE`, `'centaur-stable'`), `CreatureUtil` (module), `Application::Dto::Creature`
  (a `Struct`), barrel file `application.rb`.
- Stress constructs the language has: 1 aliased import as constant alias `Entity = CreatureEntity`
  (`creature_repository.rb`); 2 wildcard import as `include De::Sots::CellarsAndCentaurs::Domain::Model`
  (`creature_util.rb`, then uses bare `D20`); 3 barrel `application.rb` required upward from
  `creature.rb`, `armor_class.rb`, `persisted_creatures.rb`; 4 inheritance `Centaur < Creature`,
  `CreatureRepository < Repository`, mixin `include Fightable` / `include Creatures`; 5 generic base only
  as duck-typed base class `Repository` (no generics in Ruby); 6 static member
  `CreatureFacade::STANDARD_CREATURE_TYPE` in `creature.rb` and `persisted_creatures.rb`, instantiation
  only `CreatureEntity.new` in `persisted_creatures.rb`, "type position" only as YARD tags
  (`@param id [CreatureId]`, `@return [HitPoints]`, `@raise [NoSuchCreatureException]`); 7 two
  `Creature`s used in `creature_facade.rb` (`Model::Creature.new`, `Dto::Creature.new`); 8 fully
  qualified reference without require: `De::Sots::CellarsAndCentaurs::Domain::Model::Speed.new(30)` in
  `creature_facade.rb`; 9 unused `require_relative '../domain/model/fightable'` in `creature_util.rb`;
  10 stdlib `require 'logger'`, `require 'securerandom'`, `Enumerable`, `Struct`, `StandardError`;
  11 `creature_service_spec.rb`; 12 `dice.rb` (three declarations), `errors.rb` (name differs).
- Stress constructs the language does not have: static types (6, type-only position), generics (5),
  annotations / decorators (6), enums and interfaces as syntax (modelled as modules).

## Dependency parser
- Not run: `dependencyparser` has no Ruby grammar (supported: php, csharp, typescript, javascript, java,
  go, python, c/cpp, kotlin, vue, delphi, rust). `applicable = false`.
- What a Ruby-capable run would need: tree-sitter-ruby in the DependencyParser; file resolution for
  `require_relative` (path relative to the file) and `require` (load path / gem name, to be classified as
  external); constant resolution through nested modules and lexical scope (`Model::Creature` after
  `Model = De::...::Model`, bare `D20` after `include Model`); `<` for inheritance, `include` / `extend`
  / `prepend` for mixins as INTERFACE-like edges; constant aliases (`Entity = CreatureEntity`) as
  aliased imports; Zeitwerk naming (`creature_id.rb` <-> `CreatureId`) to map constants to files without
  any require at all; extensions `rb`, `rake`, `gemspec` plus the extension-less `Rakefile` / `Gemfile`;
  `_spec.rb` / `spec/` as tests (the shared `TestFileDetector` already knows these).
- Expected file-level edges, written before any run (relative to `lib/de/sots/cellars_and_centaurs`
  unless noted; `version.rb` edges are the namespace require and would be a noisy but real edge):

| From | To (expected) |
| --- | --- |
| `lib/cellars_and_centaurs.rb` | `version.rb`, `application.rb`, `adapter/persistence/persisted_creatures.rb` |
| `lib/tasks/creatures.rake` | `lib/cellars_and_centaurs.rb`, `domain/model/creature_type.rb`, `domain/model/dice.rb` |
| `cellars_and_centaurs.gemspec` | `version.rb` |
| `spec/spec_helper.rb` | `lib/cellars_and_centaurs.rb` (test) |
| `spec/.../creature_service_spec.rb` | `creature_service.rb`, `creatures.rb`, `creature.rb`, `creature_id.rb`, `speed.rb` (test, only with `--include-tests`) |
| `domain/model/armor_class.rb` | `version.rb`, `application.rb` (upward) -> `application/creature_util.rb` |
| `domain/model/errors.rb` | `version.rb`, `creature_id.rb` |
| `domain/model/creature.rb` | `version.rb`, `fightable.rb`, `creature_id.rb`, `creature_type.rb`, `armor_class.rb`, `speed_type.rb`, `speed.rb`, `hit_points.rb`, `dice.rb`, `application.rb` (upward) -> `creature_facade.rb` |
| `domain/model/centaur.rb` | `creature.rb`, `creature_type.rb`, `speed.rb`, `speed_type.rb` |
| `domain/model/{fightable,creature_id,creature_type,speed_type,speed,hit_points,dice}.rb` | `version.rb` only |
| `domain/service/creatures.rb` | `version.rb`, `creature.rb`, `creature_id.rb`, `errors.rb` |
| `domain/service/creature_service.rb` | `version.rb`, `creatures.rb`, `creature.rb` (not `logger`) |
| `adapter/persistence/creature_entity.rb` | `version.rb` (not `securerandom`) |
| `adapter/persistence/repository.rb` | `version.rb` (not `Enumerable`) |
| `adapter/persistence/creature_repository.rb` | `version.rb`, `repository.rb`, `creature_entity.rb` |
| `adapter/persistence/persisted_creatures.rb` | `version.rb`, `creature_repository.rb`, `creature_entity.rb`, `domain/service/creatures.rb`, `domain/model/creature.rb`, `creature_id.rb`, `errors.rb`, `application.rb` (upward) -> `creature_facade.rb` |
| `application.rb` | `version.rb`, `application/creature_facade.rb`, `application/creature_util.rb`, `application/dto/creature.rb` (re-exports) |
| `application/creature_util.rb` | `version.rb`, `creature.rb`, `fightable.rb` (unused require, still a file edge), `dice.rb` |
| `application/creature_facade.rb` | `version.rb`, `creature_service.rb`, `creature.rb`, `creature_id.rb`, `creature_type.rb`, `hit_points.rb`, `speed_type.rb`, `armor_class.rb`, `dto/creature.rb`, `speed.rb` (qualified, no require; not `securerandom`, `logger`) |
| `application/dto/creature.rb` | `version.rb` |
| `domain/model.rb` (round 2) | `domain/model/centaur.rb` (`autoload :Centaur, 'de/sots/.../centaur'`, load-path relative) |
| `lib/tasks/bestiary.rake` (round 2) | `domain/model/dice.rb` (`load 'lib/de/.../dice.rb'`, cwd relative, with extension) |
| `domain/model/trap.rb` (round 2) | `domain/model/fightable.rb` (`extend Fightable`, no require) |
| `domain/model/dragon.rb` (round 2) | `domain/model/lair_bonus.rb` (`prepend LairBonus`, no require) |
| `domain/model/lair_bonus.rb` (round 2) | none (new domain module, target of the prepend) |
| `domain/model/encounter.rb` (round 2) | `domain/model/dice.rb` (Zeitwerk style: bare `Dice.new`, YARD `[DiceRoll]`, no require) |
| `adapter/persistence/backend.rb` (round 2) | `adapter/persistence/creature_repository.rb` (`require File.join(__dir__, backend_file)`, only by evaluating the default of `ENV.fetch`; no edge is acceptable, a wrong file is not) |
| `application/dto/creature_card.rb` (round 2) | `application/dto/creature.rb` (`CreatureCard < Creature`, superclass is the `Struct.new` constant; not `domain/model/creature.rb`) |
| `application/summoner.rb` (round 2) | `domain/model/centaur.rb` (`Model.const_get('Centaur')`, string lookup) |

- Round-2 files deliberately skip `require_relative '../../version'`; a resolver that maps the compact
  `module De::Sots::CellarsAndCentaurs::Domain::Model` line (or the qualified module path in
  `summoner.rb`) to `version.rb` would add that edge to each of them.
- Expected cycles: `creature.rb -> application.rb -> creature_facade.rb -> creature.rb`,
  `creature.rb -> application.rb -> creature_facade.rb -> creature_service.rb -> creatures.rb -> creature.rb`,
  `armor_class.rb -> application.rb -> creature_util.rb -> creature.rb -> armor_class.rb`.
  Expected upward edges: `domain/model/creature.rb`, `domain/model/armor_class.rb`,
  `adapter/persistence/persisted_creatures.rb` -> `application.rb`.
- The `domain.cc.json` written by the domain parser carries an empty `lenses.dependency` (0 edges) and an
  empty `lenses.metrics.attributes`; no `incoming_dependencies` / `outgoing_dependencies` are available
  for Ruby.

## Domain language parser
- Commands (all from the README, `LANG_DIR=training/ruby`, stderr redirected to `output/*.stderr.log`):
  - `domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json`: ok,
    "27 files processed", 27 leaves.
  - `--exclude-tests` -> `output/domain-exclude-tests.cc.json`: ok, 25 leaves.
  - `--stop-word-level MINIMAL` / `AGGRESSIVE`, `--verbose`: ok. `--verbose` prints nothing beyond the
    default run (only the gitignore fallback warning and the JDK native-access warning).
  - `--comment-weight 0` and `--string-weight 0` crash before scanning:
    `java.lang.IllegalArgumentException: --comment-weight must be positive, got 0`
    (`DomainLanguageParser.validateOptions`, `DomainLanguageParser.kt:141/142`). The README suggests 0 to
    isolate comments / strings; the parser rejects it. Weights were read off the data instead:
    identifier 3, comment 2, string 1 (e.g. `errors.rb`: `such(4)` = class name 3 + string 1,
    `dungeon(1)` string only; `hit_points.rb`: `damage(5)` = `take_damage` 3 + doc comment 2).
- `Rakefile` (no extension) is not analysed; `.rake` and `.gemspec` are.
- Expected words at the root node (all 17 present):

| word | freq | source |
| --- | --- | --- |
| creature | 116 | identifiers everywhere (plus `creatures` 15, not merged) |
| centaur | 5 | `Centaur` class, `'centaur-stable'`, `'centaur-1'` (plus `centaurs` 66 from the namespace, not merged) |
| cellar | 2 | doc comment on `Creature` only (plus `cellars` 64 from the namespace) |
| dungeon | 4 | facade line comment 2, `errors.rb` string 1, `.rake` desc string 1 |
| armor | 15 | `ArmorClass`, `armor_class`, `'Natural Armor'` |
| hit / points | 21 / 21 | `HitPoints`, `hit_points`, `MAX_HIT_POINTS`, comments |
| speed | 37 | `Speed`, `*_speed` params, `walking_speed` |
| damage | 5 | `take_damage` 3 + comment 2 |
| lair | 2 | `HitPoints` doc comment only |
| initiative | 13 | `initiative` methods + comments |
| encounter | 2 | facade line comment only |
| treasure | 2 | `=begin` block comment in `creature_util.rb` |
| hoard | 5 | block comment 2 + `hoard_size` 3 |
| stable | 4 | `STABLE_NAME` 3 + `'centaur-stable'` 1 (the spec string contributes nothing, see below) |
| dice | 16 | `Dice`, `DiceRoll`, `dice` attribute |
| roll | 13 | `roll`, `roll_d20`, `DiceRoll`, `d20Roll` |

- Keyword leakage: none. `class`, `module`, `def`, `end`, `self`, `attr_*`, `include`, `require`,
  `new`, `nil`, `raise`, `super`, `true`, `Struct`, `Enumerable`, `Hash`, `String` all filtered. The only
  survivor that looks technical is `block(3)` from the `&block` parameter, which is not a keyword.
  Correct for Ruby.
- Technical-word leakage at MODERATE (root frequencies): `entity(19)`, `repository(12)`, `adapter(15)`,
  `persistence(15)`, `application(12)`, `dto(11)`, `model(42)`, `domain(45)`, `facade(3)`, `logger(10)`,
  `param(4)` (YARD `@param`), `id(56)`, `type(59)`, `value(22)`, `version(3)`, `init(6)`, `all(13)`
  (`ALL` constants), `key(9)`, `row(6)`/`rows(3)`, `implement(5)` (from the `NotImplementedError`
  message strings), `eql(3)`, `keyword(3)` (`keyword_init:`), `lib(3)`, `rake(2)`, `rspec(2)`,
  `assert(2)`, `random(1)`. Filtered correctly at MODERATE: `util`, `exception`, `error`, `service`,
  `save`, `find`, `create`, `base`, `default`, `spec`, `test`, `name`. `entity`, `repository`, `facade`,
  `dto`, `adapter`, `model` are only in the AGGRESSIVE list, so their leakage is by design of the level,
  but the README expects `entity` / `repository` to be gone at MODERATE.
- Namespace words dominate the root: `centaurs(66)`, `cellars(64)`, `sots(64)`, `de(63)` (3 per file
  from the `module De::Sots::CellarsAndCentaurs::...` line, plus `domain(45)`, `model(42)`). This is the
  Ruby equivalent of the Java package line and would look the same in every language; `de` survives
  because the minimum word length is 2.
- No lemmatisation: `creature`/`creatures`, `centaur`/`centaurs`, `cellar`/`cellars`,
  `dragon`/`dragons`, `beast`/`beasts`, `roll`/`rolls`, `rest`/`rests`, `take`/`takes` are separate words.
- Numeric fragments leak: `20(6)` (from `D20` split into `d` + `20`, `d` dropped as too short) and
  `d20(3)` (from `d20Roll`). A pure number is not a domain word.
- Identifier splitting:

| form | identifier | where | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | spec local variable | walking, speed (ok) |
| snake_case | `walking_speed` | `creature.rb` method, `dto/creature.rb` member | walking, speed (ok) |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `hit_points.rb` | max, hit, points (ok) |
| PascalCase | `ArmorClass` | `armor_class.rb` | armor (`class` dropped as keyword, ok) |
| Acronym | `XPValue`, `xp_value` | `creature.rb` | xp, value (ok, both forms) |
| Digit | `d20Roll`, `D20` | `dice.rb` | d20 + roll; `D20` -> `20` (wrong: bare number kept) |
| Kebab in string | `'centaur-stable'` | `creature_facade.rb` | centaur, stable (ok) |
| snake in string | `it 'should_save_creature_to_the_stable'` | spec | nothing (wrong, see below) |

- Comments: `#` line comments, `#` doc comments above `class`, and `=begin ... =end` block comments are
  all counted at weight 2 (`cellar(2)`, `roams(2)`, `lair(2)`, `encounter(2)`, `treasure(2)`,
  `counts(2)`, `guards(2)`). `# Arrange` / `# Act` are English stop words, `# Assert` survives as
  `assert(2)`. YARD tags leak `param(4)`; `@return` / `@raise` are filtered as keywords.
- Strings: single-quoted, double-quoted and interpolated strings count at weight 1 (`natural(1)`,
  `saving(1)`, `implement(5)`, `dungeon(1)`), symbols count as strings (`:random` -> `random(1)`,
  `:rspec` -> `rspec(1)`). `require` / `require_relative` arguments are skipped entirely
  (`lib/cellars_and_centaurs.rb` and `application.rb`, which contain only requires, have an empty word
  list), which is right. Wrong: a string or comment token that contains an underscore yields no words at
  all: `'should_save_creature_to_the_stable'` in the spec contributes neither `creature` nor `stable`
  (spec file words: walking 6, creature 3, speed 3, assert 2, centaur 1, creatures 1; `creature` and
  `centaur` come from the local variable and `'centaur-1'`). Cause: `SplitStage.WORD_PATTERN`
  `\b[a-zA-Z]{3,}\b` requires word boundaries, and `_` is a word character, so `should_save_...` never
  matches. This is common in Ruby (RSpec descriptions, symbols in docs, `# frozen_string_literal: true`
  magic comment, whose only effect here is that it is silently ignored).
- Test file handling: default run includes `spec/spec_helper.rb` and `creature_service_spec.rb`
  (27 leaves); `--exclude-tests` removes both (25 leaves, root loses `assert`, `expectations`, `random`,
  and `walking` drops 18 -> 12, `creature` 116 -> 113). Detection by `spec/` directory and `_spec.rb`
  suffix both work.
- `--stop-word-level`: MINIMAL adds `find(19)`, `service(18)`, `save(17)`, `base(10)`, `create(6)`,
  `default(3)` to MODERATE; AGGRESSIVE additionally removes `type(59)`, `model(42)`, `value(22)`,
  `entity(19)`, `adapter(15)`, `repository(12)`, `dto(11)`, `logger(10)`, `init(6)`, `param(4)`,
  `facade(3)`, `types(1)` but keeps `domain`, `application`, `persistence`, `id`, `de`, `sots`.

## Round 2: additional dependency forms
- Nine files added (37 files, 36 processed; `Rakefile` still skipped), no round-1 file changed. Each new
  file depends on exactly one other file through exactly one form; none of them `require_relative`s
  `version.rb`, so the only file edge a Ruby parser can find is the one in the table.
- No dependency parser exists for Ruby, so "found" records the expectation for a future parser; no run
  was possible.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| `autoload :Centaur, '...'` | `domain/model.rb` | `domain/model.rb -> domain/model/centaur.rb` | no (no parser) | Path is relative to the load path `lib`, no extension; the symbol `:Centaur` names the constant, so both the file edge and the leaf `Centaur` are resolvable statically. |
| `load '...'` | `lib/tasks/bestiary.rake` | `bestiary.rake -> domain/model/dice.rb` | no (no parser) | Path is relative to the working directory and carries `.rb`; `load` is `Kernel#load`, not `require`. The task body also uses `Model::D20`, same target. |
| `extend` of a domain module | `domain/model/trap.rb` | `trap.rb -> domain/model/fightable.rb` | no (no parser) | `extend Fightable` without any require; the constant resolves through the lexical `Model` scope. Same mixin kind as `include`, but on the singleton class. |
| `prepend` of a domain module | `domain/model/dragon.rb`, `domain/model/lair_bonus.rb` | `dragon.rb -> lair_bonus.rb` | no (no parser) | `prepend LairBonus` without any require; `lair_bonus.rb` is a new module with no outgoing edge. |
| Zeitwerk-style constant, no require | `domain/model/encounter.rb` | `encounter.rb -> domain/model/dice.rb` | no (no parser) | Bare `Dice.new(6)` and YARD `@return [DiceRoll]`; the file name `encounter.rb` maps to `Encounter`, `dice.rb` maps to `Dice` but `DiceRoll` lives in the same file, which the naming convention alone cannot tell. |
| `Kernel#require` with a variable path | `adapter/persistence/backend.rb` | `backend.rb -> adapter/persistence/creature_repository.rb` (by the default of `ENV.fetch`) | no (no parser) | `require File.join(__dir__, backend_file)`; statically unresolvable. Acceptable result: no edge; wrong result: any edge to another file. |
| `Struct.new` subclass | `application/dto/creature_card.rb` | `creature_card.rb -> application/dto/creature.rb` | no (no parser) | `class CreatureCard < Creature` inside `Application::Dto`, where `Creature = Struct.new(...)`. Wrong-target trap: `domain/model/creature.rb` has the same simple name; a literal `< Struct.new(...)` superclass has no internal target and must produce no edge. |
| `Module#const_get('Centaur')` | `application/summoner.rb` | `summoner.rb -> domain/model/centaur.rb` | no (no parser) | `De::Sots::CellarsAndCentaurs::Domain::Model.const_get('Centaur').new(id)`; the string is a literal, so it is resolvable by a parser that treats `const_get` with a literal like a constant reference. The qualified module path may additionally resolve to `version.rb`. |

- Domain parser on the added files (`domain.cc.json` overwritten, 36 leaves): every new file contributes
  its declared names at identifier weight (`trap`, `dragon`, `lair`/`bonus`, `encounter`, `surprise`,
  `card`, `title`, `summon`/`summoner`, `backend`/`file`) plus the 6 namespace words; root moves
  `creature` 116 -> 119, `centaur` 5 -> 10, `dice` 16 -> 28, `initiative` 13 -> 22, `roll` 13 -> 19,
  `lair` 2 -> 5, `encounter` 2 -> 5, `dragon` 4 -> 7, `centaurs`/`cellars`/`sots`/`de` +21 (7 more
  module lines). Nothing was lost. New leaks: `surprise(12)`, `backend(3)`, `file(3)`, `card(3)`,
  `title(3)`, `bestiary(2)`, `once(1)` - all real words, none technical. Observations on the forms:
  the `load '...'` path and the `require File.join(...)` expression are skipped like `require_relative`
  paths (`bestiary.rake` has no `lib`/`domain`/`model` words, `backend.rb` counts `backend_file` once,
  not twice); the `autoload` path string is not skipped but yields only `centaur(1)` (its last segment;
  `cellars_and_centaurs` is dropped by the underscore rule, `de` is too short, `sots`/`domain`/`model`
  do not appear either); `const_get('Centaur')` counts as a string (`centaur(1)`); the constants named
  in `extend Fightable`, `prepend LairBonus`, `< Creature` and `Dice.new` are not counted at all, which
  matches round 1 (`centaur.rb` has no `creature`, only declarations, parameters and locals are words);
  `ENV.fetch('CREATURE_BACKEND', 'creature_repository')` yields nothing because both strings contain an
  underscore (round-1 wrong item 1 again).

## Verdict
- Good: all 17 expected words reach the root; no Ruby keyword leaks; every identifier form except the
  digit case splits correctly, including `XPValue`, `MAX_HIT_POINTS` and the kebab string; `#`, doc and
  `=begin` comments and all string forms are counted with visible weights 3/2/1; `require` paths are
  skipped; `.rake` and `.gemspec` are analysed; `spec/` and `_spec.rb` are recognised as tests and
  included by default / removed with `--exclude-tests`.
- Wrong:
  1. Strings and comments with snake_case tokens are dropped completely (`creature_service_spec.rb`,
     `it 'should_save_creature_to_the_stable'` -> no `creature`, no `stable`; `SplitStage.WORD_PATTERN`).
  2. Bare numbers survive as words (`dice.rb`, `D20` -> `20(6)`; `d20Roll` -> `d20(3)`).
  3. `--comment-weight 0` / `--string-weight 0` crash with `IllegalArgumentException` instead of
     disabling that source (the README recommends these runs).
  4. `entity`, `repository`, `facade`, `dto`, `adapter`, `model` leak at MODERATE (only AGGRESSIVE
     removes them); `param` leaks from YARD tags; `id`, `type`, `value`, `all`, `one`, `per`, `such`
     leak everywhere.
  5. Namespace segments (`de`, `sots`, `cellars`, `centaurs`, `domain`, `model`) are the top words of
     the root; the module path is counted once per file at identifier weight (round 2: +21 each for 7
     new files).
  6. Round 2: the `autoload` path string is counted (`domain/model.rb` -> `centaur(1)`) while
     `require`, `require_relative` and `load` paths are skipped; a path string should be skipped
     regardless of the loader method.
- Missing:
  1. Dependency parser: no Ruby support (see the list of what it would need above). Round 2 adds the
     forms a Ruby parser must also handle: `autoload` (load-path relative), `load` (cwd relative, with
     extension), `extend` / `prepend` as mixins, Zeitwerk constant-to-file mapping (fails for the second
     declaration in `dice.rb`), `require` with a computed path (must yield no edge, not a wrong one), a
     `Struct.new` constant as superclass with the same-name trap `Dto::Creature` vs `Model::Creature`,
     and `const_get` with a literal string (`training/ruby/FINDINGS.md`, "Round 2").
  2. `Rakefile` (extension-less Ruby) is not analysed.
  3. No lemmatisation (`creature`/`creatures`, `cellar`/`cellars`, `centaur`/`centaurs` stay separate).
  4. No per-file metrics for Ruby (`lenses.metrics.attributes` is empty, `incoming_dependencies` /
     `outgoing_dependencies` absent).
