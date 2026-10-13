# Ruby

Round 3, 2026-10-08. All "expected" values were written into this file before the first parser run and
were not changed afterwards; where my own count was wrong it says so.

## Project
- Conventional gem layout, 44 files: 36 `.rb`, 3 `.rake`, 2 `.gemspec`, `config.ru`, and the extension-less
  `Rakefile` and `Gemfile`. `lib/cellars_and_centaurs.rb` is the entry point,
  `lib/de/sots/cellars_and_centaurs/**` holds the four layers, `spec/` the RSpec test.
- Added in round 3: `domain/service/encounter_resolver.rb`, `domain/service/encounter_edge_cases.rb`,
  `domain/model/zentaurenhöhle.rb` (class `Zentaurenhöhle`, attribute `rüstungsklasse`; Ruby and the file
  system accept the umlauts), `config.ru`, `lib/tasks/encounters.rake`, `lib/tasks/stable.gemspec`,
  `Gemfile`. `git check-ignore -v` reports none of them as ignored.
- Namespace `De::Sots::CellarsAndCentaurs::Domain::Model` etc. in compact form; `version.rb` declares the
  module tree and most files `require_relative` it.
- Stress constructs the language has: constant alias `Entity = CreatureEntity` (aliased import), `include
  …::Domain::Model` (wildcard import), barrel `application.rb` required upward from the domain, `<`
  inheritance, `include` / `extend` / `prepend` mixins, `Struct.new` superclass, qualified constant without
  a require, unused `require_relative`, stdlib requires, `autoload`, `load`, `const_get`, a computed
  `require`, two `Creature`s, `dice.rb` with three declarations, `errors.rb` named differently from its
  class, the spec file.
- Not in the language: static types and type-only positions (only YARD tags), generics, annotations,
  enums and interfaces as syntax (modelled as modules), `switch` fallthrough, `goto`, labelled breaks,
  `do … while` as a keyword (`begin … end while` is used), preprocessor.

## Dependency parser
- `dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json`: exit code 0, no
  error. stderr: `WARN No supported source files found under …/sample-projects/ruby` and `WARN No
  analyzable declarations were found, so the dependency lens stays empty. …`. stdout: `Created Project with
  1 leaves.`
- `--include-tests` -> `output/dependency-with-tests.cc.json`: same messages, the file is identical apart
  from the checksum.
- Result: an unsupported language is neither a failure nor silent. The map holds one empty folder `root`,
  no file node, `lenses.dependency.edges` is `[]`, there is no `leaves` / `leafEdges` key,
  `lenses.metrics.attributes` is `{}` (only the descriptors of `incoming_dependencies` /
  `outgoing_dependencies` are written). "Created Project with 1 leaves" counts the empty root folder.
- Expected edges (written before the run) against the result:

| Construct | Expected edge(s) | Found | Verdict |
| --- | --- | --- | --- |
| `require_relative` outside `spec/` | 77, one per statement, e.g. `encounter_resolver.rb` -> `version.rb`, `domain/model/creature.rb`, `domain/model/dice.rb`; `config.ru` -> `lib/cellars_and_centaurs.rb`, `encounter_resolver.rb`; `lib/tasks/encounters.rake` -> `encounter_resolver.rb`; `lib/tasks/stable.gemspec` -> `version.rb` | 0 | missing |
| `require_relative` inside a method | `encounter_edge_cases.rb` (`lazy_require`) -> `domain/model/dice.rb` (one of the 77) | 0 | missing |
| load-path `require` | `encounter_edge_cases.rb` -> `domain/model/speed.rb` (`require 'de/sots/cellars_and_centaurs/domain/model/speed'`, `lib` on the load path) | 0 | missing |
| test files (`--include-tests`) | 5 `require_relative` in `spec/`, `require 'spec_helper'` | 0 | missing |
| `autoload` | `domain/model.rb` -> `domain/model/centaur.rb` | 0 | missing |
| `load` | `lib/tasks/bestiary.rake` -> `domain/model/dice.rb` | 0 | missing |
| `extend` / `prepend` without require | `trap.rb` -> `fightable.rb`, `dragon.rb` -> `lair_bonus.rb` | 0 | missing |
| Zeitwerk-style bare constant | `domain/model/encounter.rb` -> `dice.rb` | 0 | missing |
| `Struct.new` constant as superclass | `application/dto/creature_card.rb` -> `application/dto/creature.rb` | 0 | missing |
| `const_get('Centaur')` | `application/summoner.rb` -> `domain/model/centaur.rb` | 0 | missing |
| qualified constant without require | `creature_facade.rb` -> `speed.rb`; `creatures.rake` -> `creature_type.rb`, `dice.rb` | 0 | missing |
| stdlib / gems | none for `logger`, `securerandom`, `set`, `rspec/core/rake_task` | 0 | ok (trivially) |
| computed `require File.join(__dir__, backend_file)` | none (`backend.rb`) | 0 | ok (trivially) |

- Totals: 78 `require` / `require_relative` file edges expected (84 with tests) plus 10 that need constant
  resolution; 0 found.
- False positives, cycles, upward edges: none reported. Expected were the upward edges `creature.rb`,
  `armor_class.rb`, `persisted_creatures.rb` -> `application.rb` and the cycle `creature.rb ->
  application.rb -> creature_facade.rb -> creature.rb`.
- Leaf kinds: no leaves at all.
- What the language offers natively: `require` (load path), `require_relative` (file relative), `load`,
  `autoload`; constants resolved at run time through nested modules. A Ruby analyzer would have to resolve
  those four forms to files, treat `rb`, `rake`, `gemspec`, `ru` and the extension-less `Rakefile` /
  `Gemfile` as Ruby, resolve constants lexically (`Model::Creature` after `Model = De::…::Model`, bare
  `D20` after `include Model`), map `<`, `include`, `extend`, `prepend` to inheritance edges and classify
  gem / stdlib names as external.

## Unified parser
- `unifiedparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/unified.cc.json`: exit code 0. It prints
  `WARN No .gitignore found at root level, excluding common build folders as fallback...` (the folder is
  inside the repository; the repository's `.gitignore` is not looked up), then `8 Files with the following
  extensions were ignored as they are currently not supported: [.gemspec, .rake, ., .ru]`.
- Analysed: `.rb` only. Skipped, with that one summary line and no file node: `.rake` (3), `.gemspec` (2),
  `.ru` (1) and the extension-less `Rakefile` and `Gemfile` (shown as `.`).

| Extension | unified | dependency | domain |
| --- | --- | --- | --- |
| `.rb` | analysed | skipped | analysed |
| `.rake` | skipped | skipped | analysed |
| `.gemspec` | skipped | skipped | analysed |
| `.ru` | skipped | skipped | skipped, no message |
| `Rakefile`, `Gemfile` | skipped | skipped | skipped, no message |

- Locale: the sandbox runs with `LC_CTYPE=POSIX`. With the README command as it stands,
  `zentaurenhöhle.rb` is missing from the map without any message (35 leaves, the file is not among the 8
  "ignored" either): `output/unified-posix-locale.cc.json`. Run as `env LC_ALL=C.UTF-8 ccsh …` the file is
  there (36 leaves). `output/unified.cc.json` is the UTF-8 run; the numbers of all other files are the
  same in both.
- Per-construct numbers come from a variant run: every method of the two files copied into a file of its
  own outside the project and parsed (`output/unified-resolver-split.cc.json`,
  `output/unified-edge-cases-split.cc.json`). The per-construct values add up to the file values.

### Counting rule as applied to Ruby (fixed before the run)
- `unless`, `until`, statement modifiers and `begin … end while` count like `if` / loop (+1); `when` and
  `in` clauses +1 each whatever they list, `else` 0; `rescue` clause and `rescue` modifier +1, `ensure` /
  `else` / `retry` 0; `&&`, `||`, `and`, `or` +1; `||=` and `&&=` +1 (my reading: `||` / `&&` with an
  assignment); `&.`, `expr in pattern` and the pattern alternative `:a | :b` 0.
- Lambdas (+1 on `complexity`, not a function): `->`, `lambda`, `proc`, `Proc.new`. A plain block is not a
  lambda and an iterator call is not a loop (0); `loop do` is a loop (+1).
- A nested `def` and `define_method(:name)` are methods; `attr_accessor` and `alias` are not.
- `=begin` / `=end` marker lines and the magic comment are comment lines; lines from `__END__` on are
  neither code nor comment.

### `domain/service/encounter_resolver.rb`
Ruby idioms: `elsif`, `for … in`, `case` / `when` / `else`, `begin` / `rescue` / `ensure`, a `->` lambda,
a nested `def best_of` (legal; closest thing to a nested named function), `empty?` for `isEmpty`. The
2-line block comment needs `=begin` / `=end` on their own lines, so it is 4 comment lines.

Expected per function: `resolve` 5 parameters, complexity 12 (`if`, `elsif`, ternary, `for`, `if`, `&&`,
`while`, 3 `when`, `||`, +1), 29 rloc; `describe` 1 / 1 / 3; `safe_roll` 1 / 4 (`if`, `rescue`, lambda, +1)
/ 14; `initiative_order` 1 / 2 / 8; `best_of` 1 / 1 / 1; `empty?` 0 / 1 / 1.

| Metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| `logic_complexity` | 14 | 15 | wrong: the `else` of `case terrain` counts as a branch |
| `complexity` | 21 | 22 | wrong, same `else` (14 + 6 methods + 1 lambda = 21 otherwise matches) |
| `number_of_functions` | 6 | 7 | wrong by the rule: the lambda assigned to `clamp` counts as a function |
| `loc` | 95 | 95 | ok |
| `rloc` | 73 | 73 | ok |
| `comment_lines` | 16 | 16 | ok |
| parameters max / min / mean / median | 5 / 0 / 1.5 / 1 | 5 / 0 / 1.6 / 1 | mean wrong: 5 entries, nested `best_of` has none |
| complexity per function max / min / mean / median | 12 / 1 / 3.5 / 1.5 | 12 / 0 / 3.4 / 2 | wrong: values are 12, 0, 3, 2, 0 (see below) |
| rloc per function max / min / mean / median | 29 / 1 / 9.33 / 5.5 | 29 / 1 / 11.0 / 8 | max / min ok; mean / median over 5 entries |
| `long_method` | 2 | 2 | ok |
| `long_parameter_list` | 1 | 1 | ok |
| `message_chains` | 1 | 1 | ok (5 calls counted, 3 calls not) |
| `excessive_comments` | 1 | 1 | ok |

- Per-function complexity is the logic complexity inside the function without the +1 for the function
  itself: `describe` and `empty?` report 0, `resolve` 12 (11 + the `case` `else`), `safe_roll` 3 (`if`,
  `rescue`, the lambda), `initiative_order` 2 (`if`, the nested `def`). The reported maximum of 12 equals
  the expected one only because the `else` replaces the missing +1.
- `number_of_functions` is 7 (5 methods, nested `best_of`, the lambda) but the per-function statistics
  have 5 entries; `best_of` and the lambda are folded into their enclosing method.

### `domain/service/encounter_edge_cases.rb`
| File metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| `number_of_functions` | 55 | 54 | `define_method(:dynamic_roll)` missing |
| `logic_complexity` | 39 | 35 | -8 and +4, rows below |
| `complexity` | 98 | 90 | 35 + 54 + 1 (only the `->` lambda) |
| `loc` | 321 | 321 | ok |
| `rloc` | 247 | 253 | wrong: the 5 lines from `__END__` on count as 6 lines of code |
| `comment_lines` | 10 | 10 | ok |
| `excessive_comments` / `long_method` / `long_parameter_list` / `message_chains` | 0 / 1 / 1 / 3 | 0 / 1 / 1 / 3 | ok |
| parameters max / min / mean / median | 7 / 0 / 1.16 / 1 | 7 / 0 / 1.26 / 1 | mean wrong (4 methods over-counted) |
| complexity per function max / min / mean / median | 5 / 1 / 1.78 / 1 | 4 / 0 / 0.65 / 0 | wrong (no +1 per function, `in` not counted) |
| rloc per function max / min | 14 / 1 | 14 / 0 | min wrong: endless methods have 0 |

| Construct (method) | Expected complexity | Reported | Verdict |
| --- | --- | --- | --- |
| `attr_accessor :terrain, :rounds`, `alias charge modifier_if` | 0, 0 functions | 0, 0 functions | ok |
| `initialize(terrain = :cellar)` | 1, 1 parameter | 1, 1 parameter | ok |
| `unless_block` (`unless … end`) | 2 | 1 | wrong: `unless` not counted |
| `until_loop` | 2 | 2 | ok |
| `modifier_if` (`return 20 if …`) | 2 | 2 | ok |
| `modifier_unless` (`return 1 unless …`) | 2 | 1 | wrong: `unless` not counted |
| `modifier_while`, `modifier_until`, `do_while` (`begin … end while`) | 2 each | 2 each | ok |
| `endless_loop` (`loop do` + `break if`) | 3 | 3 | ok (the `do` block is what counts) |
| `elsif_ladder` (`if`, 2 `elsif`, `else`) | 4 | 3 | wrong: the second `elsif` is not counted |
| `one_line_if` (`if … then … else … end`) | 2 | 2 | ok |
| `nested_ternary` | 3 | 3 | ok |
| `case_values_and_ranges` (`when 2, 3, 4`, `when 5..19`, `else`) | 4 | 5 | wrong: `else` of `case` counted; several values in one `when` count once (ok) |
| `case_without_subject` (2 `when`, `&&`, `else`) | 4 | 5 | wrong: `else` of `case` counted |
| `pattern_match` (`case` / 3 `in`, guard `if`, `else`) | 5 | 2 | wrong: no `in` clause counted, only the guard `if` |
| `one_line_pattern` (`creature in { … }`) | 1 | 1 | ok |
| `symbolic_operators` (`&&`, `\|\|`), `word_operators` (`and`, `or`) | 3 each | 3 each | ok |
| `conditional_assignment` (`\|\|=`, `&&=`) | 3 | 1 | not counted (expected by my reading of the rule) |
| `safe_navigation` (`&.` four times) | 1, chain of 4 | 1, 1 message chain | ok |
| `rescue_all` (2 `rescue`, `else`, `ensure`, `retry if`) | 4, long method | 4, long method | ok |
| `rescue_modifier`, `method_level_rescue` | 2 each | 2 each | ok |
| `catch_and_throw` (`catch(:found) do … end`) | 1 | 2 | wrong: the `do` block counts as a branch |
| `brace_block` (`each { }`) | 1 | 1 | ok |
| `do_block` (`each do … end`) | 1 | 2 | wrong: same call as `brace_block`, different result |
| `iterator_chain` (`select { }.map { }.uniq.sort.first`) | 1, chain of 5 | 1, 1 message chain | ok |
| `leading_dot_chain` (4 calls over 5 lines) | 1, chain of 4 | 1, 1 message chain | ok |
| `lambda_keyword` (`lambda { }`) | 2 | 1 | wrong: not a lambda for the parser |
| `stabby_lambda` (`->(roll) { }`) | 2 | 2 | ok |
| `proc_keyword` (`proc { }`), `proc_new` (`Proc.new { }`) | 2 each | 1 each | wrong: not counted |
| `yield_to_block` (`yield … if block_given?`) | 2 | 2 | ok |
| `define_method(:dynamic_roll) { \|dice\| … }` | 1, 1 function | 0, 0 functions | missing |
| `def self.singleton_roll(dice)` | 1, 1 parameter | 1, 2 parameters | wrong: the method name counts as a parameter |
| `class << self` / `def eigenclass_roll`, `private def private_roll` | 1, 1 parameter | 1, 1 parameter | ok |
| `def endless_total(roll, bonus) = roll + bonus` | 1, 2 parameters, rloc 1 | 1, 4 parameters, rloc 0 | wrong: identifiers of the body count as parameters |
| `def endless_verdict(roll) = roll > 10 ? :hit : :miss` | 2, 1 parameter | 2, 2 parameters, per-function complexity 0 | wrong: as above, the ternary is not attributed to the method |
| `default_parameter`, `splat_parameters`, `keyword_parameters`, `block_parameter` | 2 / 3 / 2 / 2 parameters | 2 / 3 / 2 / 2 | ok |
| `every_parameter_kind` (7 kinds) | 7 parameters, long parameter list | 7, long parameter list | ok |
| `+(other)`, `[](index)` | 1 parameter each | 1 each | ok |
| `cover=(value)` | 1 parameter | 2 parameters | wrong: the setter name counts as a parameter |
| `ambushed?`, `reset!` | 0 parameters | 0 | ok |
| `heredoc_with_hash` (`#`, `if`, `&&` inside `<<~TEXT`) | 1, 0 comment lines, 5 rloc | 1, 0 comment lines, 6 rloc | ok; my rloc was miscounted, the method has 6 lines |
| `markers_in_strings` (`'# …'`, `"=begin"`, `'if x && y \|\| z'`) | 1, 0 comment lines | 1, 0 comment lines | ok |
| `interpolated_ternary` (`"#{roll > 10 ? … : …}"`) | 2 | 2 | ok |
| `word_lists`, `variable_sigils`, `lazy_require` | 1 each | 1 each | ok |
| `=begin … =end` holding `if … &&` and a `def` | 0, 5 comment lines | 0, 5 comment lines, 0 rloc | ok |
| `__END__` followed by a `def` with `if` and `\|\|` | 0, 0 functions, 0 rloc | 0, 0 functions, 6 rloc for 5 lines | wrong: data section counted as code, one line too many |

### Line counting
- `loc`, `rloc` and `comment_lines` match in `encounter_resolver.rb` (95 / 73 / 16): `#` comments, the
  `=begin` block with its marker lines, the trailing comment (counted for both), commented-out code and
  the magic comment are all handled as expected.
- Comment markers inside strings and heredocs are not counted as comments (`markers_in_strings`,
  `heredoc_with_hash`); heredoc text lines are code lines.
- `__END__`: the data section counts as code and yields more rloc than it has lines (6 for 5; the
  fragment file has `loc` 5 and `rloc` 6).

### Other files
- `domain/model/zentaurenhöhle.rb` (UTF-8 locale): 2 functions, complexity 2, loc 18, rloc 12, comment
  lines 2, all as expected.
- `def self.x(arg)` reports one parameter too many: `creature_type.rb` (`self.valid?(creature_type)`, max 2
  instead of 1), `summoner.rb` (`self.summon_centaur(id)`), `trap.rb` (`self.attack(target)`),
  `creature_util.rb` (`self.hoard_size(creature)`).
- A default value that calls a method adds a parameter: `creature_service.rb`
  `initialize(creatures, logger = Logger.new($stdout))` reports 3, `encounter.rb`
  `initialize(surprise_dice = Dice.new(6))` 2, `persisted_creatures.rb`
  `initialize(repository = CreatureRepository.new)` 2.
- `creature_repository.rb`: `raise ArgumentError, … unless entity.is_a?(Entity)` is not counted
  (complexity 3 for 3 methods, expected 4).
- `do` blocks count as branches: `application/dto/creature.rb` (`Struct.new(…) do`) complexity 2 with one
  method; `creature_service_spec.rb` complexity 2 with 0 functions (`RSpec.describe … do`, `it … do`);
  `spec_helper.rb` 1 (`RSpec.configure do`).
- RSpec examples (`it '…' do`) are not functions: the spec file has `number_of_functions` 0.
- `lib/tasks/encounters.rake` (`def encounter_terrain`), `lib/tasks/stable.gemspec`, `Gemfile` and
  `config.ru` each hold code with branches; none of it is measured because the files are skipped.

## Domain language parser
- `domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json`: exit code 0,
  `Analysis complete: 41 files processed` under a UTF-8 locale (36 `.rb`, 3 `.rake`, 2 `.gemspec`). Under
  the sandbox's POSIX locale it processes 40 and drops `zentaurenhöhle.rb` without a message
  (`output/domain-posix-locale.cc.json`). `config.ru`, `Rakefile` and `Gemfile` are skipped without a
  message in both.
- Variants, all exit 0: `--exclude-tests` (39 files), `--stop-word-level MINIMAL` / `AGGRESSIVE`,
  `--no-technical-stopwords`, `--ngrams 2`, `--verbose` (prints nothing more than the default run).
  `--comment-weight 0` aborts with a stack trace: `java.lang.IllegalArgumentException: --comment-weight
  must be positive, got 0` (`DomainLanguageParser.validateOptions`).
- `lenses.domain.nodes` holds the 41 file leaves only. There is no entry for the root or any folder, so
  the "root" numbers below are the sum over the files.
- Expected words, summed over all files (17 of 17 present): creature 151, centaur 12, cellar 5, dungeon 5,
  armor 17, hit 28, points 23, speed 40, damage 15, lair 7, initiative 29, encounter 16, treasure 2,
  hoard 5, stable 6, dice 55, roll 93. Not merged with their plurals: `creatures` 41, `centaurs` 96,
  `cellars` 94, `speeds` 14.
- Top of the sum: creature 151, centaurs 96, cellars 94, sots 94, de 93, roll 93, domain 69, model 60,
  id 59, type 59, dice 55. Six of the first eight come from the `module De::Sots::CellarsAndCentaurs::…`
  line of every file.
- Expected words of the new files:
  - `encounter_resolver.rb`: all found except `describe` (it is in the English stop word list, so the
    method name `describe` yields nothing). Symbols `:swamp`, `:cellar`, `:dungeon`, `:lair`, `:stable`
    count 1 each, comment words 2, identifiers 3.
  - `encounter_edge_cases.rb`: found `goblin`, `kobold` (`%w[]`), `basilisk`, `wyvern` (`%i[]`),
    `owlbear`, `den` (regex), `mimic` (`@@`), `griffon` (`$`), `gelatinous`, `cube` (`@`), `charge`
    (`alias`), `ambushed`, `reset`, `gate`, `door`, `portcullis` (heredoc), `remark`, `galloping`,
    `prowling`, `resting`, `fumble`, `graze`. Missing: `dynamic` (`define_method(:dynamic_roll)`), `hidden`,
    `vault` (`def hidden_vault` inside `=begin … =end`). Correctly absent: `phantom` (after `__END__`),
    `begin`, `end`. Present although expected absent: `nodoc` 2 (`# :nodoc:`).
  - Variants: `skirmish`, `catacomb` (`encounters.rake`), `farrier`, `blacksmith`, `horseshoe`,
    `menagerie` (`stable.gemspec`) found; `paddock` (`config.ru`), `tiltyard`, `warhorse` (`Gemfile`)
    absent because the files are skipped.
- Keyword leakage: `class`, `module`, `def`, `end`, `self`, `begin`, `rescue`, `method`, `new`, `proc`
  do not appear. `lambda` 6, `loop` 6, `catch` 3, `throw` 3, `private` 3 and `block` 24 appear; they come
  from the method names of `encounter_edge_cases.rb` (`lambda_keyword`, `endless_loop`, …) and `&block`
  parameters and are not in the Ruby keyword list. The keyword filter also removes words from prose: the
  comment "armor class" keeps `armor` only, and `NoSuchCreatureException` loses `exception` even with
  `--no-technical-stopwords` (`Exception` is in the Ruby keyword list).
- Technical words at MODERATE: filtered `util`, `exception`, `test`, `spec`, `service`, `save`, `find`,
  `create`, `base`, `default`, `name`, `error`. Leaking: `entity` 19, `repository` 12, `adapter` 15,
  `persistence` 15, `application` 18, `dto` 14, `model` 60, `domain` 69, `facade` 3, `logger` 10, `param` 4
  (YARD), `id` 59, `type` 59, `value` 28, `all` 16, `keyword` 12, `key` 9, `init` 6, `implement` 5,
  `resolver` 3, `version` 3, `lib` 3, `parser` 2, `rake` 2, `rspec` 2, `assert` 2. AGGRESSIVE removes
  `entity`, `repository`, `adapter`, `dto`, `model`, `facade`, `logger`, `param`, `type`, `value`, `init`
  and keeps `domain`, `application`, `persistence`, `id`, `de`, `sots`. MINIMAL adds `service` 24, `find`
  19, `save` 17, `base` 10, `create` 6, `default` 6, `error` 3. The README expects `entity` and
  `repository` to be gone at MODERATE; they are not.
- Identifier splitting:

| Form | Identifier | Where | Words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | spec local variable | walking, speed (ok) |
| snake_case | `walking_speed` | `creature.rb` | walking, speed (ok) |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `hit_points.rb` | max, hit, points (ok) |
| PascalCase | `ArmorClass` | `armor_class.rb` | armor (`class` dropped as keyword) |
| Acronym | `XPValue`, `xp_value` | `creature.rb` | xp, value (ok) |
| Digit | `d20Roll`, `D20` | `dice.rb` | d20, roll; `D20` -> `20` (a bare number as a word) |
| Kebab in string | `'centaur-stable'` | `creature_facade.rb` | centaur, stable (ok) |
| snake_case in string | `it 'should_save_creature_to_the_stable'` | spec | nothing |
| snake_case symbol | `define_method(:dynamic_roll)` | `encounter_edge_cases.rb` | nothing |
| sigils | `@@mimic_count`, `$griffon_seen`, `@gelatinous_cube` | `encounter_edge_cases.rb` | mimic, count, griffon, seen, gelatinous, cube (ok) |
| `?` / `!` / `=` suffix | `ambushed?`, `reset!`, `cover=` | `encounter_edge_cases.rb` | ambushed, reset, cover (ok) |

- Comments and strings: `#` comments, doc comments and `=begin` blocks count at weight 2, strings,
  symbols, `%w[]` / `%i[]` elements, regex literals and heredoc text at weight 1, declared identifiers at
  3 (`zentaurenhöhle` 3 from the class name, `verlies` 2 from the comment, `der` 1 from the string). All
  planted sentences are counted. Lines after `__END__` are not read. Deviations:
  - A token with an underscore inside a comment, string or symbol yields no word at all
    (`'should_save_creature_to_the_stable'`, `:dynamic_roll`, `hidden_vault` in the `=begin` block, the
    magic comment). `SplitStage.WORD_PATTERN` is `\b[a-zA-Z]{3,}\b` and `_` is a word character.
  - An `attr_reader` / `attr_accessor` symbol counts twice, as identifier and as string: `attr_reader
    :sides` alone gives `sides` 4 in a test file; `dice.rb` has `sides` 10.
  - The heredoc end tag is counted as a word: `<<~TEXT … TEXT` adds `text` 1; the interpolated `#{roll}`
    inside the heredoc adds `roll` 1.
  - `require`, `require_relative` and `load` paths are skipped (`lib/cellars_and_centaurs.rb` and
    `application.rb` have empty word lists); the `autoload` path in `domain/model.rb` is not (`centaur` 1).
  - `describe` is an English stop word; `def describe` in `encounter_resolver.rb` and `creature_util.rb`
    leaves no trace.
- Test file handling: `spec/spec_helper.rb` and `creature_service_spec.rb` are included by default and
  removed by `--exclude-tests` (41 -> 39 files; `assert` and `random` disappear, `creature` 151 -> 148).
  The spec file yields walking 6, creature 3, speed 3, assert 2, centaur 1, creatures 1; the example name
  contributes nothing.
- `--ngrams 2`: the most frequent bigrams are identifier pairs (`creature id` 21, `hit points` 15, `creature type`
  12, `walking speed` 9, `xp value` 9, `20 roll` 3).

- German words (`domain/model/zentaurenhöhle.rb`, UTF-8 locale): 5 of 7 appear as whole words:
  `zentaurenhöhle` 3 (class name only), `rüstungsklasse` 9 (attribute, parameter, instance variable),
  `verlies` 2, `trefferpunkte` 2, `kreatur` 2. `größe` and `höhle` (string `'Größe der Höhle'`) do not
  appear. Identifiers keep their umlauts; in comments and strings a word is cut at every umlaut and `ß`
  and pieces shorter than 3 letters are dropped: `Zentaurenhöhle` -> `zentaurenh` 2 + `hle`, `Höhle` ->
  `hle` (3 in total), `Rüstungsklasse` -> `stungsklasse` 3 (comment 2, `attr_reader` symbol 1), `gehören`
  -> `geh` 2 + `ren` 2, `Größe` -> nothing. German stop words leak: `die` 2, `unter` 2, `dem` 2, `und` 2,
  `jeder` 2, `liegt` 2, `der` 1 (`zu` is absent only because it has 2 letters). Under the POSIX locale
  the file is not read and none of the seven appears.

## Changed since 2026-09-06
- Dependency parser: the earlier report did not run it ("applicable = false"). It now runs, exits 0, warns
  twice and writes an empty map.
- Unified parser: not covered before; everything in that section is new.
- Domain parser: the earlier report quoted frequencies of the root node. The current output has no root
  or folder entry in `lenses.domain.nodes`, only file leaves.
- Domain parser: 41 files instead of 36 (5 of the 7 new files are read).
- Still true, re-verified on fresh output: all 17 words present; no keyword leaks from the old files;
  weights 3 / 2 / 1; underscore tokens in strings and comments dropped; `D20` -> `20`, `d20Roll` -> `d20`;
  `--comment-weight 0` throws (now reported at `DomainLanguageParser.kt:140`); `--verbose` adds nothing;
  `entity`, `repository`, `facade`, `dto`, `adapter`, `model` leak at MODERATE; namespace words on top;
  no lemmatisation; `autoload` path counted while `require` / `load` paths are skipped; `Rakefile` not
  analysed; `spec/` and `_spec.rb` handled as tests; `lenses.metrics.attributes` empty in the domain map.
- New on the old files: `attr_*` symbols are counted twice; `describe` (in `creature_util.rb`) is a stop
  word.
- Not re-verified: the `--string-weight 0` crash (only `--comment-weight 0` was run).

## Verdict

### Unified parser
- Missing:
  1. `.rake`, `.gemspec`, `.ru`, `Rakefile`, `Gemfile` are not analysed (`lib/tasks/encounters.rake`
     with `def encounter_terrain`, `config.ru`, `Gemfile`); the domain parser reads `.rake` and `.gemspec`. **Decision derived from C++: accept — `.rake` and `.gemspec`, one extension list for all three parsers.** **Decision: ignore — `.ru`, `Rakefile`, `Gemfile`.**
  2. `encounter_edge_cases.rb`, `pattern_match`: `case … in` clauses are not counted (2 instead of 5). **Decision: accept.**
  3. `encounter_edge_cases.rb`, `unless_block` and `modifier_unless`; `creature_repository.rb`, `raise …
     unless …`: `unless` is not counted in either form. **Decision: accept.**
  4. `encounter_edge_cases.rb`, `lambda_keyword`, `proc_keyword`, `proc_new`: `lambda { }`, `proc { }`,
     `Proc.new { }` are not counted as lambdas; only `->` is. **Decision: accept.**
  5. `encounter_edge_cases.rb`, `define_method(:dynamic_roll) { … }`: no function. **Decision: ignore.**
  6. `encounter_edge_cases.rb`, `conditional_assignment`: `||=` and `&&=` are not counted. **Decision: accept.**
- Wrong:
  1. `encounter_edge_cases.rb`, `do_block` vs `brace_block`; `catch_and_throw`; `dto/creature.rb`
     (`Struct.new … do`); `creature_service_spec.rb`; `spec_helper.rb`: every `do … end` block adds 1 to
     the complexity, the same block written with braces adds 0. **Decision: accept.**
  2. `encounter_resolver.rb`, `resolve`; `encounter_edge_cases.rb`, `case_values_and_ranges`,
     `case_without_subject`: the `else` of a `case` counts as a branch (logic 15 instead of 14). **Decision: ignore (derived from Java).**
  3. `encounter_edge_cases.rb`, `elsif_ladder`: from the second `elsif` on nothing is counted (3 instead
     of 4). **Decision: accept.**
  4. Parameter counts: `def self.singleton_roll(dice)` 2 (also `creature_type.rb`, `summoner.rb`,
     `trap.rb`, `creature_util.rb`), `cover=(value)` 2, `endless_total(roll, bonus) = roll + bonus` 4,
     `endless_verdict(roll) = …` 2, `creature_service.rb` `initialize(creatures, logger =
     Logger.new($stdout))` 3, `encounter.rb` `initialize(surprise_dice = Dice.new(6))` 2. **Decision: accept (derived from JavaScript).**
  5. Per-function complexity leaves out the function itself: `encounter_resolver.rb` reports min 0,
     mean 3.4, median 2 (expected 1 / 3.5 / 1.5); `encounter_edge_cases.rb` median 0. **Decision: ignore (derived from Java).**
  6. `encounter_resolver.rb`: `number_of_functions` 7 counts the nested `def best_of` and the lambda
     `clamp = ->(value) { … }`, the per-function statistics have 5 entries (mean rloc 11.0 instead of 9.33). **Decision: accept (derived from Java).**
  7. `encounter_edge_cases.rb`, `__END__`: the data section counts as code, 6 rloc for 5 lines (file rloc
     253 instead of 247). **Decision: ignore.**
  8. `encounter_edge_cases.rb`, endless methods: rloc per function 0, and the ternary of
     `endless_verdict` is not attributed to the method. **Decisions derived from Java: accept — a function body that is not recognised is measured as empty, as with constructor bodies.**
- Bad:
  1. `zentaurenhöhle.rb` disappears without a message when the process runs under a non-UTF-8 locale. **Decision: accept (derived from Java).**
  2. Skipped files are reported as one line of extensions; the extension-less files show up as `.`. **Decision: ignore.**
  3. `WARN No .gitignore found at root level` for a folder inside a repository that has one. **Decision: ignore (derived from Kotlin).**
  4. Progress output on a redirected stderr is not in order (18/35 printed after 23/35). **Decision: ignore (derived from JavaScript).**
  5. RSpec examples are invisible: `creature_service_spec.rb` has 0 functions and complexity 2. **Decision: ignore.**
- Good: `loc`, `rloc`, `comment_lines` in `encounter_resolver.rb` exact, including `=begin` blocks,
  trailing comments and comment markers in strings and heredocs; `if`, modifier `if`, `elsif` (first),
  `while` / `until` in all forms, `for`, `when`, ternaries (nested and inside `#{}`), `&&` / `||` / `and` /
  `or`, `rescue` in all three forms; `long_method`, `long_parameter_list`, `message_chains` (also through
  `&.`, blocks and line breaks); default, splat, keyword and block parameters; operator methods, `?` /
  `!` methods, `class << self`, `private def`; Unicode identifiers.

### Dependency parser
- Missing:
  1. No Ruby support: 0 of 78 `require` / `require_relative` file edges (84 with tests), 0 of 10
     constant-based edges, no leaves, no cycle, no upward edge, no `incoming_dependencies` /
     `outgoing_dependencies`. **Decision: ignore (derived from Objective-C).**
- Wrong: nothing; no edge is reported.
- Bad:
  1. `Created Project with 1 leaves.` for a map that contains only an empty root folder. **Decision: ignore.**
  2. The warning names no extensions or languages, so it does not say that Ruby is the reason. **Decision: accept (derived from Objective-C).**
- Good: exit code 0 with two clear warnings instead of a crash or a silent empty file; `--include-tests`
  behaves the same.

### Domain language parser
- Missing:
  1. `config.ru`, `Rakefile`, `Gemfile` are skipped without any message. **Decision: ignore.**
  2. No root or folder word list in `lenses.domain.nodes`. **Decision: ignore (derived from Java).**
  3. `zentaurenhöhle.rb`: `größe` and `höhle` from the string `'Größe der Höhle'`. **Decision: accept (derived from Java).**
  4. No German stop words: `die`, `unter`, `dem`, `und`, `jeder`, `liegt`, `der` are counted. **Decision: ignore (derived from Java).**
  5. No lemmatisation (`creature` 151 / `creatures` 41, `speed` 40 / `speeds` 14). **Decision: ignore (derived from Java).**
- Wrong:
  1. `zentaurenhöhle.rb`: words in comments and strings are cut at umlauts and `ß` (`zentaurenh`, `hle`,
     `stungsklasse`, `geh`, `ren`), while the same words as identifiers stay whole. **Decision: accept (derived from Java).**
  2. `creature_service_spec.rb` `'should_save_creature_to_the_stable'`, `encounter_edge_cases.rb`
     `define_method(:dynamic_roll)` and `hidden_vault` in the `=begin` block: a token with an underscore in
     a string, symbol or comment yields no word. **Decision: accept (derived from Vue).**
  3. `dice.rb` `attr_reader :sides` and every other `attr_*` symbol: counted twice (identifier 3 + string 1). **Decision: accept.**
  4. `encounter_edge_cases.rb`, `heredoc_with_hash`: the end tag `TEXT` is counted as the word `text`. **Decision: ignore.**
  5. `dice.rb`: `D20` -> `20`, a bare number as a word. **Decision: ignore (derived from Java).**
  6. `--comment-weight 0` aborts with an `IllegalArgumentException` stack trace. **Decision: accept (derived from Java).**
  7. `domain/model.rb`: the `autoload` path is counted, `require` / `load` paths are not. **Decision: ignore — the path is skipped like `require` paths; `centaur` 1 comes from the symbol `:Centaur`.**
- Bad:
  1. `zentaurenhöhle.rb` is dropped without a message under a non-UTF-8 locale. **Decision: accept (derived from Java).**
  2. Namespace words (`centaurs` 96, `cellars` 94, `sots` 94, `de` 93, `domain` 69, `model` 60) outrank
     every domain word except `creature`. **Decision: ignore.**
  3. `entity`, `repository`, `facade`, `dto`, `adapter`, `model`, `param`, `id`, `type`, `value` leak at
     the default level. **Decision: ignore (derived from Java).**
  4. Stop word and keyword lists hit domain names: `describe` (`encounter_resolver.rb`) and `exception`
     (`NoSuchCreatureException`) vanish; `class` is removed from the comment "armor class". **Decision: ignore (derived from Kotlin).**
  5. `# :nodoc:` leaks `nodoc`. **Decision: ignore (derived from Java).**
- Good: all 17 expected words; no Ruby keyword from the old files; camelCase, snake_case,
  SCREAMING_SNAKE, acronym, kebab, sigils and `?` / `!` / `=` suffixes split correctly; `#`, doc and
  `=begin` comments, strings, symbols, `%w[]` / `%i[]`, regex and heredoc text are read with weights
  3 / 2 / 1; nothing after `__END__` is read; `.rake` and `.gemspec` are analysed; `spec/` and `_spec.rb`
  are tests; Unicode identifiers survive.
