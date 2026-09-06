# Bash

## Expected (written before running any parser)

File-level `source` edges in the project as written (paths relative to `training/bash`):

| from | to |
| --- | --- |
| bin/cellars.sh | lib/application/index.sh, lib/adapter/persistence/persisted_creatures.sh, lib/domain/model/dice.sh |
| test/creature_service_test.sh | lib/domain/service/creature_service.sh, lib/adapter/persistence/persisted_creatures.sh |
| lib/domain/model/creature.sh | fightable.sh, creature_id.sh, creature_type.sh, armor_class.sh, speed_type.sh, speed.sh, hit_points.sh, lib/application/index.sh (upward) |
| lib/domain/model/armor_class.sh | lib/application/index.sh (upward) |
| lib/domain/model/centaur.sh | creature.sh |
| lib/domain/service/creatures.sh | creature.sh, creature_id.sh, no_such_creature_exception.sh |
| lib/domain/service/creature_service.sh | creatures.sh, creature.sh |
| lib/adapter/persistence/creature_repository.sh | repository.sh, creature_entity.sh |
| lib/adapter/persistence/persisted_creatures.sh | creature_repository.sh, creature_entity.sh, creatures.sh, creature.sh, creature_id.sh, no_such_creature_exception.sh, lib/application/index.sh (upward) |
| lib/application/creature_util.sh | every lib/domain/model/*.sh (glob source, 11 files), fightable.sh (explicit, unused) |
| lib/application/creature_facade.sh | creature_service.sh, creature.sh, creature_id.sh, creature_type.sh, hit_points.sh, speed_type.sh, armor_class.sh, dto/creature.sh; speed.sh is called (`speed::new`) but not sourced |
| lib/application/index.sh | creature_facade.sh, creature_util.sh |

Round 2 additions (one row per added dependency form, written before the parser was rerun):

| from | to | form |
| --- | --- | --- |
| tools/roll.sh | lib/domain/model/dice.sh | `. path` short form of source (`. "$(dirname "${BASH_SOURCE[0]}")/../lib/domain/model/dice.sh"`) |
| tools/hoard.sh | lib/application/creature_util.sh | `source "$LIB_DIR/application/creature_util.sh"` through a variable |
| tools/check_model.sh | every lib/domain/model/*.sh (11 files) | glob source relative to the cwd after `cd "$(dirname "${BASH_SOURCE[0]}")/.."`: `for model_script in lib/domain/model/*.sh; do source "$model_script"; done` |
| bin/encounter.sh | bin/cellars.sh | `exec bash "$SCRIPT_DIR/cellars.sh" "$@"` (exec of another script, interpreter in front of the path) |
| bin/cellars.sh | tools/roll.sh | called by path without sourcing: `"$SCRIPT_DIR/../tools/roll.sh"` |
| tools/roll.sh | bin/encounter.sh | `encounter::announce` is defined and `export -f`-ed in encounter.sh and called in roll.sh (guarded by `declare -F encounter::announce`) |
| tools/hoard.sh | lib/domain/model/creature.sh | `command -v creature::id` is the only reference; creature.sh is never sourced by hoard.sh |

Expected cycle: creature.sh -> index.sh -> creature_facade.sh -> creature_service.sh -> creature.sh
(and the shorter armor_class.sh -> index.sh -> creature_facade.sh -> armor_class.sh).

Expected domain words at the root: creature, centaur, cellar, dungeon, armor, hit, points, speed, damage,
lair, initiative, encounter, treasure, hoard, stable, dice, roll.

## Project
- Layout: `bin/cellars.sh` (entry point), `lib/domain/model`, `lib/domain/service`, `lib/adapter/persistence`,
  `lib/application`, `lib/application/dto`, `test/`. 23 `.sh` files, all `bash -n` clean; `bin/cellars.sh` and
  `test/creature_service_test.sh` run green with `bash`.
- Bash has no namespaces, so `de.sots.cellarsandcentaurs` is only the folder tree below `lib/`. Declarations are
  files with `snake_case` function groups (`creature::new`, `hit_points::init`, ...), the entity map is the
  associative array `CREATURES` in `creature.sh`, enums are readonly arrays (`CREATURE_TYPES`, `SPEED_TYPES`).
- Stress constructs and how they were modelled:

| # | Construct | In Bash | Where |
| --- | --- | --- | --- |
| 1 | aliased import | not applicable: `source` has no `as`. Closest idiom: wrapper functions `entity::new() { creature_entity::new "$@"; }` | `lib/adapter/persistence/creature_repository.sh` |
| 2 | wildcard import | glob source `for f in .../domain/model/*.sh; do source "$f"; done` | `lib/application/creature_util.sh` |
| 3 | barrel + upward dependency + cycle | `lib/application/index.sh` sources facade and util; `creature.sh`, `armor_class.sh` and `persisted_creatures.sh` source `index.sh` | cycle creature.sh -> index.sh -> creature_facade.sh -> creature_service.sh -> creature.sh |
| 4 | inheritance / interface | no classes. `centaur.sh` sources `creature.sh` and reuses/overrides its functions; `fightable.sh` checks with `declare -F` that `<ns>::attack` and `<ns>::take_damage` exist (`fightable::assert_implemented creature`); `persisted_creatures.sh` registers itself on the `creatures` port by function-name indirection | model + persistence |
| 5 | generic base | no generics. `repository.sh` binds any associative array by name with `local -n store="$1"` | `lib/adapter/persistence/repository.sh` |
| 6 | type-position only / new only / static member only / annotation only | no types, no annotations. "static member only": `$CREATURE_FACADE_STANDARD_CREATURE_TYPE` used in `creature.sh` and `persisted_creatures.sh`; "instantiated only": `creature_id::new` in the facade | model, persistence, application |
| 7 | same simple name, different package | `lib/domain/model/creature.sh` and `lib/application/dto/creature.sh` (functions `dto::creature::*` because Bash functions are global) | facade uses both |
| 8 | fully qualified reference without import | Bash equivalent: `creature_facade.sh` calls `speed::new` without sourcing `speed.sh` (works because `creature.sh` sourced it) | `lib/application/creature_facade.sh` |
| 9 | unused import | `source .../fightable.sh` in `creature_util.sh`, never used | `lib/application/creature_util.sh` |
| 10 | stdlib / third party | external commands `uuidgen`, `logger`, `date`, `tr`, `dirname`; `declare -A` as the Map | facade, service, everywhere |
| 11 | test file | `test/creature_service_test.sh` with `should_save_creature_to_the_stable` | `test/` |
| 12 | two declarations in one file, file name differs from declaration | `dice.sh` holds `dice::*`, `dice_roll::*` and the free function `roll_d20`; `repository.sh` holds the generic base used by `creature_repository.sh` | model, persistence |

- Planted texts: all seven placed verbatim. The block comment in `creature_util.sh` uses the Bash idiom
  `: <<'BLOCK_COMMENT' ... BLOCK_COMMENT` (a no-op heredoc), because Bash has no block comment syntax.
- Identifier forms: `walking_speed` (facade), `walkingSpeed` and `XPValue` (test file, as the README asks for a
  snake_case language), `MAX_HIT_POINTS` (hit_points.sh), `xp_value` (creature.sh), `d20Roll` (dice.sh),
  `ArmorClass` only in comments (Bash uses `armor_class`), `centaur-stable` (facade string).

## Dependency parser
- Not run. `dependencyparser` has no Bash support (README table: php, csharp, typescript, javascript, java, go,
  python, c/cpp, kotlin, vue, delphi, rust). A `bash` extension would need: the tree-sitter-bash grammar
  (already shipped for the domain parser), `source` / `.` statements with `"$(dirname "${BASH_SOURCE[0]}")/..."`
  and `"$SOME_LIB/..."` path resolution (variable-prefixed paths, `..` segments, glob sources like
  `*.sh`), `# shellcheck source=` directives as a second, static source of the same edge, function
  declarations `name::sub()` as leaves (kind FUNCTION, with `::` and `_` prefixes as the pseudo-namespace), calls
  of `ns::fn` as leaf edges, and a test-file rule for shell (`test/` directory, `*_test.sh`, `test_*.sh`, `*.bats`).
- The expected edge list above documents what such a parser should find in this project; the `speed::new`
  call without `source` (construct 8) and the `${CREATURES_PORT_IMPL}::save` indirection (construct 4) are
  the two edges no static parser can find from `source` lines alone.

## Domain language parser
Commands (all from the README, LANG_DIR = this folder, stderr redirected to a file; every run exited 0):

```
ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json
ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" --exclude-tests -o output/domain-exclude-tests.cc.json
ccsh domainlanguageparser ... --stop-word-level MINIMAL | AGGRESSIVE | --no-technical-stopwords | --verbose   (scratch files)
```

`--comment-weight 0` and `--string-weight 0` are rejected: `IllegalArgumentException: --comment-weight must
be positive, got 0` (exit 1, stack trace on stderr, `DomainLanguageParser.validateOptions`). The weights were
judged from the default run instead (identifier 3, comment 2, string 1 are visible in the counts, see below).
`--verbose` adds nothing Bash-specific (only "No .gitignore found ... excluding common build folders").

### Expected words at the root node (default run, 34 nodes, 23 files)

| word | frequency | note |
| --- | --- | --- |
| creature | 318 | |
| speed | 67 | |
| hit | 42 | |
| armor | 37 | |
| points | 33 | |
| dice | 25 | |
| centaur | 23 | |
| damage | 20 | |
| roll | 12 | |
| stable | 10 | `mock_stable`, `CREATURE_FACADE_STABLE_TAG`, `should_save_creature_to_the_stable`, string `centaur-stable` |
| hoard | 4 | 3 from the function name `treasure_hoard`, 1 from the heredoc |
| dungeon | 3 | 2 from the line comment (weight 2), 1 from the string in `no_such_creature_exception.sh` |
| initiative | 3 | 2 comment + 1 string (`echo "initiative: ..."`) |
| cellar | 2 | doc comment on Creature, counted once with weight 2 |
| lair | 2 | doc comment on HitPoints, weight 2 |
| encounter | 2 | line comment in the facade, weight 2 |
| treasure | 1 | only the heredoc; the function name `creature_util::treasure_hoard` became `utiltreasure` (see `::` below) |

All 17 appear. Domain words that only live in comments sit at the bottom of the list with frequency 2.

### Keyword and technical-word leakage at the root (MODERATE)
- Bash keywords and builtins do not leak: `local`, `source`, `declare`, `readonly`, `printf`, `echo`, `return`,
  `function`, `if`, `for`, `read`, `set`, `shift`, `export` are all absent. The keyword list works.
- `class(25)` appears. That is right for Bash: `class` is not a shell keyword, the word comes from `armor_class`.
- Technical words filtered as expected: `util`, `exception`, `service`, `mock` (in the English stop list),
  `save`, `find`, `test`, `main`, `default`, `index`, `base`.
- Technical words that leak at MODERATE: `entity(26)`, `dto(12)`, `port(10)`, `repository(9)`, `adapter(8)`,
  `facade(6)`, `persistence(6)`, plus the generic `id(36)`, `value(22)`, `new(19)`. `entity`, `repository`,
  `facade`, `dto`, `adapter` are not in `technical-moderate.txt` (they are in AGGRESSIVE), so this is the
  configured behaviour, but for a hexagonal-layout project it is noise.
- Bash-specific leakage, all wrong:
  - `shellcheck(82)` is the second most frequent word of the whole project. It comes from the tooling directive
    `# shellcheck source=...` / `# shellcheck disable=...` in front of every `source`. Tooling directives in
    comments (`shellcheck`, `noqa`, `eslint-disable`, `pragma`) should not count as domain vocabulary.
  - `dirname(40)`, `lib(20)` and the folder names `model(52)`, `domain(48)`, `application(17)`, `adapter(8)`,
    `persistence(6)` come from the `source "$(dirname "${BASH_SOURCE[0]}")/../domain/model/x.sh"` strings
    (weight 1 each) and again from the `# shellcheck source=../domain/model/x.sh` comments (weight 2 each).
    In `creature_facade.sh` `domain(21)` = 7 comments x 2 + 7 strings x 1. Import paths are skipped in
    languages with import statements; for Bash the argument of `source` / `.` should be treated the same way.
  - Numbers survive as words: `20(6)` at the root from `roll_d20` and `d20Roll` (`dice.sh`).
- `--stop-word-level MINIMAL` adds back `base default find index main save service` at the root;
  `AGGRESSIVE` removes `adapter argument dto entity facade init model repository result types value` compared
  with MODERATE (and would also remove the path noise `model`/`adapter`). `--no-technical-stopwords` equals
  MINIMAL plus `expected helpers impl implementation name temporary tests util`.

### Identifier splitting

| form | identifier | file | words found | verdict |
| --- | --- | --- | --- | --- |
| snake_case | `walking_speed` | creature_facade.sh | walking(3), speed | ok |
| camelCase | `walkingSpeed` | test file | walking(5), speed(6) | ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | hit_points.sh | max(18), hit, points | ok |
| PascalCase | `ArmorClass`, `CreatureEntity` (comments only) | armor_class.sh, creature_entity.sh | armor(2)+class(2), creature+entity | ok, PascalCase inside comments is split |
| acronym | `XPValue` | test file | xp(4), value(4) | ok |
| acronym | `xp_value` | creature.sh | xp, value | ok |
| digit | `d20Roll`, `roll_d20` | dice.sh | roll, `20`(6); the `d` is dropped | partly wrong: `20` is kept as a word, `d20` is lost |
| kebab in string | `centaur-stable` | creature_facade.sh | centaur(1), stable(1) | ok, hyphen splits |
| Bash namespace `::` | `creature::set_type`, `hit_points::init`, `armor_class::description`, `dice_roll::new`, `creature_util::treasure_hoard` | everywhere | `creatureset(12)`, `pointsinit(3)`, `classdescription(3)`, `rollnew(3)`, `utiltreasure(3)`, `typeis(3)`, `exceptionraise(3)`, `facadecreate(3)` ... | wrong: `::` is deleted instead of splitting, gluing the last word of the prefix to the first word of the function name. 40+ such garbage tokens at the root; `treasure` loses 3 of its 4 counts to `utiltreasure` |

Function *definitions* (`name() {`) are counted as identifiers with weight 3. Calls of `ns::fn` functions are
not counted at all (`creatureid` = 3 although `creature::id` is called about twenty times), while plain
command names such as `dirname`, `logger`, `uuidgen` are counted with weight 1. Both are consistent with
tree-sitter-bash: a definition is a `function_definition` with a `word` name, a call is a `command_name`.

### Comments and strings
- Doc comments and line comments (`#`) are counted with weight 2: `cellar(2)`, `lair(2)`, `encounter(2)`,
  `initiative(2)` and `dungeon(2)` in the files that hold them. Right.
- String literals are counted with weight 1: `dungeon(1)` in `no_such_creature_exception.sh`, `ididid(1)`,
  `centaur(1)` in the facade, `natural(1)` from `"Natural Armor"`. Right.
- The Bash block-comment idiom `: <<'BLOCK_COMMENT'` is parsed as a heredoc string, so
  `Counts the treasure hoard a creature guards.` is counted with the string weight 1 (`treasure(1)`,
  `hoard(1)`, `counts(1)`, `guards(1)`), not the comment weight 2. Defensible (it *is* a string to bash), but a
  reader comparing across languages will see the block comment at half weight.
- Weights are visible and the defaults match `ExtractionWeights` (identifier 3, comment 2, string 1);
  setting a weight to 0 is not allowed, so a "comments off" run is impossible.

### Test file handling
- Default run: `test/creature_service_test.sh` is included (34 nodes: `test` folder + file). Its words are
  `centaur(9), creature(9), lib(9), code(6), speed(6), stable(6), walking(5), ...`; `should`, `save`, `to`,
  `the` and `mock` are filtered, so `should_save_creature_to_the_stable` contributes only `creature` and `stable`.
- `--exclude-tests`: the `test` folder disappears (32 nodes). Detection is by directory name only.
- Cross-check in a scratch copy with the same file placed at `lib/creature_service_test.sh`: `--exclude-tests`
  keeps it (33 nodes). `TestFileDetector` has file-name rules for kt/java/cs/php, ts/js, py, go and rb but none
  for `sh`, so `*_test.sh`, `test_*.sh` and `*.bats` outside a `test/` directory are never recognised as tests.

## Round 2: additional dependency forms

Added without touching any round-1 line: `bin/encounter.sh`, `tools/roll.sh`, `tools/hoard.sh`, `tools/check_model.sh`
(27 `.sh` files now), plus two lines in `bin/cellars.sh` (`SCRIPT_DIR` and the call of `tools/roll.sh`) and the
function `creature_util::hoard_of_xp` in `lib/application/creature_util.sh`. All files are `bash -n` clean;
`bin/cellars.sh`, `bin/encounter.sh`, `tools/*.sh` and the test run green. `exec` had to be written as
`exec bash "$SCRIPT_DIR/cellars.sh"` because `cellars.sh` is not executable (a bare `exec "$SCRIPT_DIR/cellars.sh"`
fails with "Permission denied"); that is a realistic variant a parser must handle (interpreter before the path).

No dependency parser exists for Bash, so "found" is "no" everywhere; the table records what a future parser has to find.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| `. path` short form of source | tools/roll.sh | tools/roll.sh -> lib/domain/model/dice.sh | no (no Bash dependency parser) | `. "$(dirname "${BASH_SOURCE[0]}")/../lib/domain/model/dice.sh"`; second `.` in the project after creature.sh -> index.sh |
| `source "$LIB_DIR/..."` through a variable | tools/hoard.sh | tools/hoard.sh -> lib/application/creature_util.sh | no | `LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../lib" && pwd)"`; needs the same `cd ... && pwd` resolution as `CELLARS_LIB` in cellars.sh and the test |
| glob source | tools/check_model.sh | tools/check_model.sh -> all 11 lib/domain/model/*.sh | no | `cd "$(dirname "${BASH_SOURCE[0]}")/.."` then `for model_script in lib/domain/model/*.sh; do source "$model_script"; done`: the glob is relative to the cwd set by `cd`, not to the file (round-1 glob in creature_util.sh is file-relative) |
| `exec` of another script | bin/encounter.sh | bin/encounter.sh -> bin/cellars.sh | no | `exec bash "$SCRIPT_DIR/cellars.sh" "$@"`; the target is the second argument because of the interpreter |
| call by path without sourcing | bin/cellars.sh | bin/cellars.sh -> tools/roll.sh | no | `"$SCRIPT_DIR/../tools/roll.sh"` as a plain command, with a `..` segment; no `source`, so functions of roll.sh never enter cellars.sh |
| `export -f` function | bin/encounter.sh (exporter), tools/roll.sh (caller) | tools/roll.sh -> bin/encounter.sh | no | `encounter::announce` is defined and exported in encounter.sh and called in roll.sh (guarded by `declare -F encounter::announce` so roll.sh also runs without the launcher); the edge is invisible to a `source`-only parser and only resolvable through the function name |
| `command -v creature::id` only | tools/hoard.sh | tools/hoard.sh -> lib/domain/model/creature.sh | no | creature.sh is never sourced by hoard.sh (it arrives transitively through creature_util.sh); the only textual reference is the `command -v` guard |

Not possible: nothing was skipped; every form exists in Bash.

Domain parser after round 2 (`output/domain.cc.json` overwritten, exit 0, 39 nodes instead of 34, 27 files):
- Round-1 nodes are unchanged except the two edited files: `creature_util.sh` gains `utilhoard(3)`, `xp(+3)`,
  `value(+3)`, `creature(+1)` from `creature_util::hoard_of_xp`; `cellars.sh` gains `dirname(4)`, `dir(3)`, `script(3)`,
  `roll(1)`, `tools(1)` from `SCRIPT_DIR` and the `tools/roll.sh` path string. The test node is identical. No word was lost.
- Root: all 17 expected words still present; `initiative` 3 -> 6, `encounter` 2 -> 7, `treasure` 1 -> 3, `hoard` 4 -> 6,
  `roll` 12 -> 14, `dice` 25 -> 26 (the tool scripts talk about the domain in their comments and echo strings).
- New leaked words at the root: `dir(9)` and `script(16, was 5)` from splitting `SCRIPT_DIR` / `LIB_DIR` (technical
  path variables, wrong); three more `::` garbage tokens `encounterannounce(3)`, `rollannounce(3)`, `utilhoard(3)`
  (same defect as round 1); path noise grows with every new `source` (`dirname` 40 -> 48, `lib` 20 -> 28, `model` 52 -> 61,
  `shellcheck` 82 -> 86); `exec`, `bash`, `export`, `cd`, `unset` and `command` do not leak (right); the `.` short form
  and the cwd-relative glob path are counted exactly like a `source` path string (`dice(1)`, `model(1)`, `lib(1)` in
  roll.sh), so treating `source` arguments as import paths must cover `.` and glob loops too.
- `command -v creature::id` and the calls `creature_util::hoard_of_xp`, `encounter::announce` are not counted, like
  every `ns::fn` call in round 1.

## Verdict
- Good: the parser runs clean on all 23 scripts; all 17 expected words are at the root; Bash keywords and
  builtins never leak; `class` correctly survives (not a keyword in Bash); snake_case, camelCase,
  SCREAMING_SNAKE, PascalCase-in-comments, the `XP` acronym and the hyphen in `centaur-stable` all split
  correctly; comments (2) and strings (1) are weighted as documented; `test/` is excluded by `--exclude-tests`.
- Wrong:
  1. `::` in function names is deleted instead of treated as a separator (`creature::set_type` ->
     `creatureset`, `creature_util::treasure_hoard` -> `utiltreasure`, `hit_points::init` -> `pointsinit`):
     dozens of garbage tokens and lost domain words (`treasure` 1 instead of 4). Every `lib/**/*.sh` file.
  2. `# shellcheck source=` / `disable=` directives are counted as comment text: `shellcheck(82)` is the second
     most frequent word of the project.
  3. Path segments of `source "$(dirname "${BASH_SOURCE[0]}")/../domain/model/x.sh"` (string) and of the
     matching shellcheck comment are counted: `dirname(40)`, `model(52)`, `domain(48)`, `lib(20)`,
     `application(17)`. The `source` argument should be treated like an import path.
  4. The numeric token `20` from `roll_d20` / `d20Roll` (`dice.sh`) is kept as a word and the `d` is dropped.
  5. `--comment-weight 0` / `--string-weight 0` crash with a stack trace instead of switching that source off
     (or failing with a one-line message).
  6. (round 2) `SCRIPT_DIR` / `LIB_DIR` are split into `script`, `lib`, `dir` (`dir(9)`, `script(16)` at the root):
     shell path variables are technical vocabulary, not domain words.
- Missing:
  1. No file-name rule for shell tests (`*_test.sh`, `test_*.sh`, `*.bats`); only the `test/` directory works.
  2. Calls of `ns::fn` functions are not counted as identifiers (only definitions are), so a heavily used
     domain function weighs the same as an unused one.
  3. `entity`, `repository`, `facade`, `dto`, `adapter` leak at MODERATE (configured, but noisy for a layered
     project); no dependency parser for Bash (see above).
  4. (round 2) A Bash dependency parser has to find seven more forms besides `source path`: `. path`,
     `source "$VAR/..."`, cwd-relative glob loops after `cd`, `exec [bash] path`, plain execution by path,
     functions passed with `export -f`, and `command -v ns::fn` probes (see "Round 2"); the last two are edges by
     function name, not by path.
