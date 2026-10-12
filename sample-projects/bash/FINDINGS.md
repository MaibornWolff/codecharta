# Bash

## Expected (written 2026-10-08 before any parser was run)

Counted by hand with the counting rule of `sample-projects/README.md`. Bash-specific decisions taken here,
before the run:

- A shebang line and every other `#` line is a comment line. A heredoc body, a multi-line string and a no-op
  heredoc (`: <<'NOTE'`) are code, also when a line of them starts with `#`.
- `case` counts +1 per `pattern)` arm, `*)` is the default; alternatives joined by `|` are one arm.
- `&&` / `||` count +1 each wherever they are code: in `[[ ]]`, in `(( ))`, in a command list. `-a` inside
  `[ ]` is the same operator and counts +1. `&` (background) and `|&` do not count. Operators inside a quoted
  string (`trap '...'`) do not count.
- `until`, `select`, `for (( ))`, `for name; do` are loops (+1). `$(( a ? b : c ))` is the conditional
  expression (+1). `${var:-default}` and its siblings are not in the counting rule (+0).
- `cmd || { ...; }` is the `catch` of Bash and counts once (it is one `||`). An anonymous subshell `( ... )`
  stands in for the lambda; it is not a function, so it adds nothing to `complexity`.
- Parameters: Bash has no parameter list. The expected value is the number of positional parameters the
  function reads (`$1` ... `$n`), as the README table prescribes for `EncounterResolver`.
- A pipeline is the method chain of Bash: n commands joined by `|` are a chain of n calls.

### `lib/domain/service/encounter_resolver.sh`

| function | parameters | logic_complexity | complexity | rloc (body) |
| --- | --- | --- | --- | --- |
| `encounter_resolver::resolve` | 5 | 11 (`if`, `elif`, ternary, `for`, `if`, `&&`, `while`, 3 `case` arms, `\|\|`) | 12 | 27 |
| `encounter_resolver::describe` | 1 | 0 | 1 | 3 |
| `encounter_resolver::safe_roll` | 1 | 2 (`\|\| { }` as catch, `if` in the subshell) | 3 | 12 |
| `encounter_resolver::initiative_order` | 1 | 1 (`if` guarding the recursive call) | 2 | 11 (includes the nested function) |
| `encounter_resolver::initiative_of` (nested) | 1 | 0 | 1 | 2 |
| `encounter_resolver::is_empty` | 0 | 0 | 1 | 1 |

| metric | expected |
| --- | --- |
| `logic_complexity` | 14 |
| `complexity` | 20 |
| `number_of_functions` | 6 |
| `loc` | 85 |
| `rloc` | 66 |
| `comment_lines` | 14 (shebang 1, doc comment 6, line comments 3, block 2, commented-out code 1, trailing 1) |
| parameters max / min / mean / median | 5 / 0 / 1.5 / 1 |
| complexity per function max / min / mean / median | 12 / 1 / 3.33 / 1.5 |
| rloc per function max / min / mean / median | 27 / 1 / 9.33 / 7 |
| `long_method` | 3 (`resolve` 27, `safe_roll` 12, `initiative_order` 11) |
| `long_parameter_list` | 1 (`resolve`) |
| `message_chains` | 1 (the pipeline of 5 commands in `describe`; the pipeline of 3 does not count) |
| `excessive_comments` | 1 |

Idioms used because Bash lacks the construct: `elif` for `else if`; `case` for `switch`; `$(( roll >= 20 ? 2 : 1 ))`
for the ternary; `(( ... )) || [[ ... ]]` as the last command for the `||`; pipelines for method chains;
`cmd || { ...; }` plus `trap ... RETURN` for `try` / `catch` / `finally`; an anonymous subshell for the lambda;
two consecutive `#` lines for the block comment.

### `lib/domain/service/encounter_edge_cases.sh`

| # | function | construct | logic_complexity | complexity | other expected value |
| --- | --- | --- | --- | --- | --- |
| 1 | `double_bracket_and` | `if [[ a && b ]]` | 2 | 3 | |
| 2 | `double_bracket_or` | `[[ a \|\| b ]]` as the whole body | 1 | 2 | |
| 3 | `list_and_or` | `cmd && cmd \|\| cmd` | 2 | 3 | |
| 4 | `case_alternatives` | `a \| b \| c)` arms, 2 arms + `*)` | 2 | 3 | |
| 5 | `case_fallthrough` | 3 arms ending in `;&`, `;;&`, `;;` | 3 | 4 | |
| 6 | `until_loop` | `until (( ))` | 1 | 2 | |
| 7 | `select_menu` | `select ... in` | 1 | 2 | |
| 8 | `c_style_for` | `for (( ; ; ))` | 1 | 2 | |
| 9 | `implicit_argument_loop` | `for creature; do` | 1 | 2 | |
| 10 | `labelled_break` | two nested `for`, `if`, `continue 2`, `break 2` | 3 | 4 | |
| 11 | `while_read_or` | `while read ... \|\| [[ ]]; do ... done < <(...)` | 2 | 3 | |
| 12 | `getopts_loop` | `while getopts` + `case` with 2 arms + `*)` | 3 | 4 | |
| 13 | `heredoc_with_hash` | heredoc holding `#` lines, `if`, `&&`, `\|\|` | 0 | 1 | comment_lines 0, rloc 6 |
| 14 | `heredoc_block_comment` | `: <<'NOTE'` holding `while` | 0 | 1 | comment_lines 0, rloc 5 |
| 15 | `multi_line_string` | 3-line string holding `#`, `if`, `&&` | 0 | 1 | comment_lines 0, rloc 4 |
| 16 | `comment_markers_in_strings` | `"# ..."`, `'# ...'`, `$#`, `${#a[@]}`, `${1#prefix}`, `${a[@]/#/x}`, `amulet#ring` | 0 | 1 | comment_lines 0, rloc 4 |
| 17 | `default_expansion` | `${1:-x}`, `${2:=0}`, `${3:+x}`, `${v:?msg}` | 0 | 1 | |
| 18 | `arithmetic_logic` | `(( a && b \|\| c ))` | 2 | 3 | |
| 19 | `arithmetic_ternary` | `$(( a > b ? a : b ))` | 1 | 2 | |
| 20 | `single_bracket_dash_a` | `if [ a -a b ]` | 2 | 3 | |
| 21 | `if_elif_else` | `if !`, 2 `elif`, `else` | 3 | 4 | |
| 22 | `one_liner` | `f() { if ...; fi; for ...; done; }` on one line | 2 | 3 | rloc 1 |
| 23 | `if_in_command_substitution` | `"$(if ...; then ...; else ...; fi)"` | 1 | 2 | |
| 24 | `function_keyword` | `function name {` | 0 | 1 | is a function |
| 25 | `function_keyword_parentheses` | `function name() {` | 0 | 1 | is a function |
| 26 | `subshell_body` | `name() ( ... )` with `cd ... \|\| exit` | 1 | 2 | is a function |
| 27 | `test_body` | `name() [[ ... ]]` | 0 | 1 | is a function, rloc 1 |
| 28 | `roll-initiative` | hyphen in the function name | 0 | 1 | is a function |
| 29 | `trap_string` | `trap 'if ...; then ... && ...; fi' EXIT` | 0 | 1 | |
| 30 | `positional_parameters` | `$1 $2 $3`, `shift 3`, `$#`, `$*` | 0 | 1 | parameters 3 |
| 31 | `long_pipeline` | 6 commands, `\|` at the line ends | 0 | 1 | message_chains 1 |
| 32 | `pipeline_stderr` | 4 commands joined by `\|&` | 0 | 1 | message_chains 1 |
| 33 | `line_continuation` | one command over 4 lines with `\` | 0 | 1 | rloc 4 |
| 34 | `background_and_wait` | `cmd &`, `cmd &`, `wait` | 0 | 1 | |
| 35 | `lazy_source` | `source` inside a function | 0 | 1 | |
| 36 | `arithmetic_body` | `name() (( ... ))` | 0 | 1 | is a function, rloc 1 |
| - | top level | `[[ -r file ]] && source file` | 1 | - | |
| - | top level | `alias ambush='...'` | 0 | - | |

File totals: `number_of_functions` 36, `logic_complexity` 35 (34 in functions + 1 at top level), `complexity` 71,
`loc` 233, `rloc` 193, `comment_lines` 2 (shebang and the header line), `message_chains` 2, `long_method` 0,
`long_parameter_list` 0, `excessive_comments` 0, max parameters 3, max complexity per function 4, min 1.

### Other new files

| file | loc | rloc | comment_lines | functions | logic_complexity | complexity |
| --- | --- | --- | --- | --- | --- | --- |
| `lib/domain/model/zentaurenhöhle.sh` | 19 | 12 | 2 | 3 | 0 | 3 |
| `tools/lair.bash` | 12 | 7 | 2 | 1 | 1 (`if`) | 2 |
| `tools/stable.zsh` | 13 | 8 | 2 | 1 | 1 (`if`) | 2 |
| `bin/cellars` (no extension, shebang) | 13 | 8 | 2 | 1 | 2 (`if`, `&&` in `$(cd ... && pwd)`) | 3 |

### `source` edges a Bash dependency parser would have to find

Rounds 1 and 2 (unchanged files):

| from | to |
| --- | --- |
| bin/cellars.sh | lib/application/index.sh, lib/adapter/persistence/persisted_creatures.sh, lib/domain/model/dice.sh, tools/roll.sh (called by path) |
| bin/encounter.sh | bin/cellars.sh (`exec bash`) |
| test/creature_service_test.sh | lib/domain/service/creature_service.sh, lib/adapter/persistence/persisted_creatures.sh |
| lib/domain/model/creature.sh | fightable.sh, creature_id.sh, creature_type.sh, armor_class.sh, speed_type.sh, speed.sh, hit_points.sh, lib/application/index.sh (upward) |
| lib/domain/model/armor_class.sh | lib/application/index.sh (upward) |
| lib/domain/model/centaur.sh | creature.sh |
| lib/domain/service/creatures.sh | creature.sh, creature_id.sh, no_such_creature_exception.sh |
| lib/domain/service/creature_service.sh | creatures.sh, creature.sh |
| lib/adapter/persistence/creature_repository.sh | repository.sh, creature_entity.sh |
| lib/adapter/persistence/persisted_creatures.sh | creature_repository.sh, creature_entity.sh, creatures.sh, creature.sh, creature_id.sh, no_such_creature_exception.sh, lib/application/index.sh (upward) |
| lib/application/creature_util.sh | every lib/domain/model/*.sh (glob source, now 12 files with `zentaurenhöhle.sh`), fightable.sh (explicit, unused, same target as one glob edge) |
| lib/application/creature_facade.sh | creature_service.sh, creature.sh, creature_id.sh, creature_type.sh, hit_points.sh, speed_type.sh, armor_class.sh, dto/creature.sh |
| lib/application/index.sh | creature_facade.sh, creature_util.sh |
| tools/roll.sh | lib/domain/model/dice.sh (`. path`), bin/encounter.sh (`export -f` function, by name only) |
| tools/hoard.sh | lib/application/creature_util.sh (`source "$LIB_DIR/..."`), lib/domain/model/creature.sh (`command -v`, by name only) |
| tools/check_model.sh | every lib/domain/model/*.sh (cwd-relative glob, 12 files) |

Round 3 (new files):

| from | to | form |
| --- | --- | --- |
| lib/domain/service/encounter_resolver.sh | lib/domain/model/creature.sh, lib/domain/model/dice.sh | `source "$(dirname "${BASH_SOURCE[0]}")/..."` |
| lib/domain/service/encounter_edge_cases.sh | lib/domain/service/encounter_resolver.sh | plain `source` |
| lib/domain/service/encounter_edge_cases.sh | lib/domain/model/zentaurenhöhle.sh | conditional: `[[ -r file ]] && source file`, non-ASCII file name |
| lib/domain/service/encounter_edge_cases.sh | lib/domain/model/centaur.sh | `source` inside the function `lazy_source` |
| lib/domain/model/zentaurenhöhle.sh | lib/domain/model/creature.sh | plain `source` |
| tools/lair.bash | lib/domain/service/encounter_resolver.sh | `source` from a `.bash` file |
| tools/stable.zsh | lib/domain/model/dice.sh | zsh: `source "${0:A:h}/../lib/domain/model/dice.sh"` |
| bin/cellars | bin/cellars.sh | `exec bash "$SCRIPT_DIR/cellars.sh"` from an extension-less script |

Expected cycles: creature.sh -> index.sh -> creature_facade.sh -> creature_service.sh -> creature.sh, and
armor_class.sh -> index.sh -> creature_facade.sh -> armor_class.sh. Expected upward edges: the three
`-> lib/application/index.sh` edges from model and persistence.

### Domain words

- At the root: creature, centaur, cellar, dungeon, armor, hit, points, speed, damage, lair, initiative,
  encounter, treasure, hoard, stable, dice, roll (17 of 17).
- German, from `lib/domain/model/zentaurenhöhle.sh`: zentaurenhöhle, verlies, rüstungsklasse, trefferpunkte,
  kreatur, größe, höhle (7 of 7), each as one uncut word; the stop words die, unter, dem, und, jeder, zu, der
  must not appear.
- `encounter_resolver.sh`: encounter, resolver, attacker, defender, terrain, damage, armor, dice, roll,
  initiative, creature, speed.
- `encounter_edge_cases.sh`: ambush (alias name and string), retreat, torches, weapon, gargoyle, moat,
  potions, trinkets, goblin, kobold, scroll; `roll-initiative` splits into roll + initiative; heredoc and
  multi-line string text counts as string text.
- Extension variants: `portcullis` proves `tools/lair.bash` was read, `paddock` proves `tools/stable.zsh`,
  `drawbridge` proves `bin/cellars`.

## Project
- Layout: `bin/` (entry points), `lib/domain/model`, `lib/domain/service`, `lib/adapter/persistence`,
  `lib/application`, `lib/application/dto`, `test/`, `tools/`. 33 files: 30 `.sh`, `tools/lair.bash`,
  `tools/stable.zsh` and the extension-less `bin/cellars`. All Bash files are `bash -n` clean,
  `bin/cellars.sh`, `tools/lair.bash` and the test run green. `tools/stable.zsh` could not be checked (no
  `zsh` on the machine that ran the parsers).
- Bash has no namespaces, so `de.sots.cellarsandcentaurs` is only the folder tree below `lib/`. Declarations
  are files with function groups (`creature::new`, `hit_points::init`, ...), the entity map is the associative
  array `CREATURES`, enums are arrays (`CREATURE_TYPES`, `SPEED_TYPES`).
- Round 3 files: `lib/domain/service/encounter_resolver.sh`, `lib/domain/service/encounter_edge_cases.sh`,
  `lib/domain/model/zentaurenhöhle.sh`, `tools/lair.bash`, `tools/stable.zsh`, `bin/cellars`. None is
  git-ignored (`git check-ignore -v` prints nothing, exit 1).
- German file: the file name and the function names carry the umlaut (`zentaurenhöhle::new`,
  `zentaurenhöhle::rüstungsklasse`, legal in Bash). Variable names must be ASCII, so the field is the local
  `ruestungsklasse`, the array is `ZENTAURENHOEHLE` and `rüstungsklasse` is its key (a string).
- Dependency stress constructs as modelled in rounds 1 and 2:

| # | Construct | In Bash | Where |
| --- | --- | --- | --- |
| 1 | aliased import | not in the language; wrapper functions `entity::new() { creature_entity::new "$@"; }` | `lib/adapter/persistence/creature_repository.sh` |
| 2 | wildcard import | glob source `for f in .../domain/model/*.sh; do source "$f"; done` | `lib/application/creature_util.sh`, `tools/check_model.sh` |
| 3 | barrel, upward dependency, cycle | `lib/application/index.sh`, sourced by `creature.sh`, `armor_class.sh`, `persisted_creatures.sh` | model, persistence |
| 4 | inheritance / interface | not in the language; `centaur.sh` sources `creature.sh`, `fightable.sh` checks functions with `declare -F` | model |
| 5 | generic base | not in the language; `repository.sh` binds any array with `local -n` | persistence |
| 6 | type position / new only / static member / annotation | no types, no annotations; `$CREATURE_FACADE_STANDARD_CREATURE_TYPE` as the static member | model, persistence |
| 7 | same simple name in two packages | `lib/domain/model/creature.sh` and `lib/application/dto/creature.sh` | facade uses both |
| 8 | qualified reference without import | `creature_facade.sh` calls `speed::new` without sourcing `speed.sh` | application |
| 9 | unused import | `source .../fightable.sh` in `creature_util.sh` | application |
| 10 | stdlib / third party | external commands `uuidgen`, `logger`, `tr`, `cut`, `sed`, `awk` | everywhere |
| 11 | test file | `test/creature_service_test.sh` with `should_save_creature_to_the_stable` | `test/` |
| 12 | two declarations in one file | `dice.sh` holds `dice::*`, `dice_roll::*` and `roll_d20` | model |
| r2 | `. path`, `source "$VAR/..."`, cwd-relative glob, `exec bash path`, call by path, `export -f`, `command -v` | all exist | `tools/`, `bin/` |
| r3 | conditional `[[ -r f ]] && source f`, `source` inside a function, zsh `${0:A:h}`, extension-less launcher | all exist | `encounter_edge_cases.sh`, `tools/stable.zsh`, `bin/cellars` |

- Planted texts: all seven verbatim. The block comment in `creature_util.sh` is the no-op heredoc
  `: <<'BLOCK_COMMENT'`, because Bash has no block comment.
- Identifier forms: `walking_speed` (facade), `walkingSpeed` and `XPValue` (test file), `MAX_HIT_POINTS`
  (`hit_points.sh`), `xp_value` (`creature.sh`), `d20Roll` (`dice.sh`), `ArmorClass` only in comments,
  `centaur-stable` (facade string), `roll-initiative` (function name with a hyphen, `encounter_edge_cases.sh`).

All runs below used `LC_ALL=C.UTF-8`. The first run was made with the machine's default POSIX locale and gave a
different result for one file; that is reported under each parser.

## Dependency parser
- Commands (exit 0 both, also with `--verbose`):
  `ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json` and the same
  with `--include-tests -o output/dependency-with-tests.cc.json`.
- Bash is not supported. The parser does not fail: it logs two warnings, `No supported source files found
  under .../sample-projects/bash` and `No analyzable declarations were found, so the dependency lens stays
  empty. ...`, prints `Created Project with 1 leaves` and writes a 1309-byte map that holds only the `root`
  folder, `lenses.dependency.edges: []` and the two attribute descriptors. No file node, no leaf, no edge.
  Both outputs are byte-identical in content (same checksum `9f457631856f42f4679b80bcbf0b0a2e`).
- "1 leaves" is the empty root folder counted as a leaf.

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| `source "$(dirname "${BASH_SOURCE[0]}")/x.sh"` (rounds 1 and 3) | 38 edges, see the expected tables | 0 | missing |
| `. path` (`creature.sh`, `tools/roll.sh`) | 2 | 0 | missing |
| `source "$VAR/..."` (`bin/cellars.sh`, `tools/hoard.sh`, test file) | 6 | 0 | missing |
| glob source (`creature_util.sh`, `tools/check_model.sh`) | 2 x 12 | 0 | missing |
| conditional `[[ -r f ]] && source f` (`encounter_edge_cases.sh`) | 1 | 0 | missing |
| `source` inside a function (`encounter_edge_cases.sh`, `lazy_source`) | 1 | 0 | missing |
| zsh `source "${0:A:h}/..."` (`tools/stable.zsh`) | 1 | 0 | missing |
| `exec bash path` (`bin/encounter.sh`, `bin/cellars`), call by path (`bin/cellars.sh`) | 3 | 0 | missing |
| by function name only: `export -f` (`tools/roll.sh`), `command -v` (`tools/hoard.sh`) | 2 | 0 | missing |

- The expected tables add up to 78 distinct file edges (the explicit `fightable.sh` source in
  `creature_util.sh` shares its target with a glob edge and is counted once); 0 of 78 were found.
- False positives: none (no edges). Cycles: 2 expected, 0 reported. Upward edges: 3 expected, 0 reported.
  Leaf kinds: no leaves.
- What the language offers: no module system. `source` / `.` executes a path computed at run time, so
  CodeCharta would have to resolve `$(dirname "${BASH_SOURCE[0]}")`, `$VAR` prefixes, `..` segments, globs
  and the `# shellcheck source=` directive itself, and treat `name::fn()` definitions as leaves.

## Unified parser
- Command: `ccsh unifiedparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/unified.cc.json`, exit 0,
  `Created Project with 30 leaves`. It warns `No .gitignore found at root level, excluding common build
  folders as fallback...`: it looks for a `.gitignore` in the analysed folder, not at the repository root.
- Files and extensions:

| file / extension | unified parser | domain parser | dependency parser |
| --- | --- | --- | --- |
| `.sh` (30 files) | analysed | analysed | not supported |
| `.bash` (`tools/lair.bash`) | skipped, reported as ignored extension | analysed | not supported |
| `.zsh` (`tools/stable.zsh`) | skipped, reported as ignored extension | analysed (with the Bash grammar) | not supported |
| no extension, shebang (`bin/cellars`) | skipped, reported as ignored extension `.` | skipped without a message | not supported |

  The message is `3 Files with the following extensions were ignored as they are currently not supported:
  [., .zsh, .bash]`. A single-file run on `tools/lair.bash` or `bin/cellars` exits 0 and writes an empty map
  (`No files with specified file extension(s) were found within the given folder`). `.bash` is skipped
  although `Language.BASH` in `treeSitterExcavationSite` lists it (`otherExtensions = setOf(".bash")`); the
  parser decides by `FileExtension.BASH(".sh")` in the model.
- Locale: with the POSIX locale (`LANG` unset) `lib/domain/model/zentaurenhöhle.sh` is missing from the map
  (`Created Project with 29 leaves`, `output/unified-posix-locale.cc.json`). It is not in the ignored list and
  nothing is logged, exit 0. With `LC_ALL=C.UTF-8` it is analysed. A copy named `zentaurenhoehle.sh` is
  analysed in both locales.

### `encounter_resolver.sh`

| metric | expected | reported | verdict |
| --- | --- | --- | --- |
| `logic_complexity` | 14 | 15 | wrong: the `*)` default arm of the `case` in `resolve` counts (+1) |
| `complexity` | 20 | 21 | wrong, same cause |
| `number_of_functions` | 6 | 6 | ok, the nested `initiative_of` is counted |
| `loc` | 85 | 85 | ok |
| `rloc` | 66 | 66 | ok |
| `comment_lines` | 14 | 14 | ok (shebang counted, trailing comment counted) |
| `max_parameters_per_function` | 5 | 0 | missing: positional parameters are not seen |
| `min` / `mean` / `median_parameters_per_function` | 0 / 1.5 / 1 | 0 / 0 / 0 | missing |
| `max_complexity_per_function` | 12 | 12 | equal by accident: 11 + 1 for the default arm, the function's own +1 is not added |
| `min_complexity_per_function` | 1 | 0 | wrong: per-function complexity leaves out the +1 of the function (`describe`, `is_empty` = 0) |
| `mean_complexity_per_function` | 3.33 | 3.2 | wrong: 16 / 5 (12, 0, 2, 2, 0) |
| `median_complexity_per_function` | 1.5 | 2 | wrong |
| `max_rloc_per_function` | 27 | 27 | ok |
| `min_rloc_per_function` | 1 | 1 | ok |
| `mean_rloc_per_function` | 9.33 | 10.8 | wrong: 54 / 5, the nested function is no entry of its own |
| `median_rloc_per_function` | 7 | 11 | wrong, same cause |
| `long_method` | 3 | 3 | ok |
| `long_parameter_list` | 1 | 0 | missing |
| `message_chains` | 1 | 0 | missing: a pipeline is not a chain for the parser |
| `excessive_comments` | 1 | 1 | ok |

The per-function numbers were confirmed by running the parser on each function as a file of its own
(scratch copies): `resolve` logic 12, `describe` 0, `safe_roll` 2, `initiative_order` 1 with 2 functions and
a per-function complexity of 2 (the `if` plus the nested `function_definition`), `is_empty` 0. So
`number_of_functions` says 6 while the per-function statistics are built from 5 entries. `elif`, the
arithmetic ternary, `&&` in `[[ ]]`, the `(( )) || [[ ]]` list, `cmd || { }` and the `if` inside the anonymous
subshell are all counted as expected.

### `encounter_edge_cases.sh`

File totals: `number_of_functions` 36 (expected 36), `logic_complexity` 36 (expected 35), `complexity` 72
(expected 71), `loc` 233, `rloc` 193, `comment_lines` 2 (all three as expected), `message_chains` 0 (expected
2), `long_method` 0, `long_parameter_list` 0, `max_parameters_per_function` 0 (expected 3),
`max_complexity_per_function` 4 (matches, see `getopts_loop`), `min_complexity_per_function` 0 (expected 1),
`min_rloc_per_function` 0. The reported column below comes from one scratch file per function.

| # | construct | expected logic / complexity | reported | verdict |
| --- | --- | --- | --- | --- |
| 1 | `if [[ a && b ]]` | 2 / 3 | 2 / 3 | ok |
| 2 | `[[ a \|\| b ]]` | 1 / 2 | 1 / 2 | ok |
| 3 | `cmd && cmd \|\| cmd` | 2 / 3 | 2 / 3 | ok |
| 4 | `case` with `a \| b \| c)` arms, 2 arms + `*)` | 2 / 3 | 3 / 4 | wrong: `*)` counts; the `\|` alternatives do not add |
| 5 | `case` with `;&` and `;;&`, 3 arms | 3 / 4 | 3 / 4 | ok |
| 6 | `until` | 1 / 2 | 1 / 2 | ok |
| 7 | `select` | 1 / 2 | 1 / 2 | ok |
| 8 | `for (( ; ; ))` | 1 / 2 | 1 / 2 | ok |
| 9 | `for creature; do` | 1 / 2 | 1 / 2 | ok |
| 10 | nested `for`, `if`, `continue 2`, `break 2` | 3 / 4 | 3 / 4 | ok |
| 11 | `while read \|\| [[ ]]; do ... done < <(...)` | 2 / 3 | 2 / 3 | ok |
| 12 | `while getopts` + `case`, 2 arms + `*)` | 3 / 4 | 4 / 5 | wrong: `*)` counts |
| 13 | heredoc with `#`, `if`, `&&`, `\|\|` | 0 / 1, comments 0, rloc 6 | 0 / 1, 0, 6 | ok |
| 14 | `: <<'NOTE'` with `while` | 0 / 1, comments 0, rloc 5 | 0 / 1, 0, 5 | ok |
| 15 | multi-line string with `#`, `if`, `&&` | 0 / 1, comments 0, rloc 4 | 0 / 1, 0, 4 | ok |
| 16 | `"# ..."`, `$#`, `${#a[@]}`, `${1#prefix}`, `${a[@]/#/x}`, `amulet#ring` | 0 / 1, comments 0, rloc 4 | 0 / 1, 0, 4 | ok |
| 17 | `${1:-x}`, `${2:=0}`, `${3:+x}`, `${v:?msg}` | 0 / 1 | 0 / 1 | ok |
| 18 | `(( a && b \|\| c ))` | 2 / 3 | 2 / 3 | ok |
| 19 | `$(( a > b ? a : b ))` | 1 / 2 | 1 / 2 | ok |
| 20 | `if [ a -a b ]` | 2 / 3 | 1 / 2 | missing: `-a` (and `-o`) in `[ ]` is no operator for the parser |
| 21 | `if !`, 2 `elif`, `else` | 3 / 4 | 3 / 4 | ok |
| 22 | whole function on one line | 2 / 3, rloc 1 | 2 / 3, rloc 1 | ok |
| 23 | `"$(if ...; fi)"` | 1 / 2 | 1 / 2 | ok |
| 24 | `function name {` | function, 0 / 1 | function, 0 / 1 | ok |
| 25 | `function name() {` | function, 0 / 1 | function, 0 / 1 | ok |
| 26 | `name() ( ... )` with `\|\|` | function, 1 / 2, body rloc 2 | function, 1 / 2; per-function complexity 0, per-function rloc 0 | wrong: a subshell body is no function body |
| 27 | `name() [[ ... ]]` | function, 0 / 1, body rloc 1 | function, 0 / 1; per-function rloc 0 | wrong: same |
| 28 | `roll-initiative() {` | function, 0 / 1 | function, 0 / 1 | ok |
| 29 | `trap 'if ...; then ... && ...; fi' EXIT` | 0 / 1 | 0 / 1 | ok |
| 30 | `$1 $2 $3`, `shift 3`, `$#`, `$*` | 0 / 1, parameters 3 | 0 / 1, parameters 0 | missing |
| 31 | pipeline of 6 commands over 6 lines | message_chains 1 | 0 | missing |
| 32 | 4 commands joined by `\|&` | message_chains 1 | 0 | missing |
| 33 | `\` line continuation over 4 lines | 0 / 1, rloc 4 | 0 / 1, rloc 4 | ok |
| 34 | `cmd &`, `wait` | 0 / 1 | 0 / 1 | ok |
| 35 | `source` inside a function | 0 / 1 | 0 / 1 | ok |
| 36 | `name() (( ... ))` | function, 0 / 1, body rloc 1 | function, 0 / 1; per-function rloc 0 | wrong: same as 26 |
| - | top level `[[ -r f ]] && source f` | 1 | 1 | ok |

The file total of 36 is 35 + 2 default arms - 1 `-a`.

### Line counting
- `loc`, `rloc` and `comment_lines` match the hand count in all five analysed new files
  (`encounter_resolver.sh` 85 / 66 / 14, `encounter_edge_cases.sh` 233 / 193 / 2, `zentaurenhöhle.sh`
  19 / 12 / 2).
- The shebang counts as a comment line in every file. A trailing comment counts as code and as comment.
- `#` inside a heredoc, a multi-line string, a quoted string and inside `${#...}`, `$#`, `${x#y}`,
  `${a[@]/#/x}` and `amulet#ring` is never taken for a comment.
- The no-op heredoc used as a block comment (`creature_util.sh`, `heredoc_block_comment`) counts as code,
  not as comment.
- `comment_ratio` is `comment_lines / rloc`: `lib/application/index.sh` has 4 comment lines, 4 rloc and
  the ratio 1.0.

### The other files
- `max` / `min` / `mean` / `median_parameters_per_function`, `long_parameter_list` and `message_chains` are
  0 in all 30 files. `BashMetricMapping` has no node type for parameters or chains.
- `*_complexity_per_function` is 0 for every function without a branch in all files (115 functions in the
  project), because the function's own +1 is only added to the file's `complexity`.
- `logic_complexity` of the 27 older files matches a hand count where checked: `bin/cellars.sh` 2 (two
  `$(cd ... && pwd)`), `tools/hoard.sh` 2, `lib/application/index.sh` 1, `test/creature_service_test.sh` 4,
  `lib/domain/model/creature.sh` 2, `lib/adapter/persistence/persisted_creatures.sh` 1. They hold no `case`.
- `lib/domain/model/zentaurenhöhle.sh`: 3 functions, complexity 3, as expected; the umlauts in the function
  names do not disturb the grammar.

## Domain language parser
- Command: `ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json`, exit 0,
  `Analysis complete: 32 files processed`. Variant runs, all exit 0: `--exclude-tests`
  (`domain-exclude-tests.cc.json`, 31 files), `--stop-word-level MINIMAL` / `AGGRESSIVE`,
  `--no-technical-stopwords`, `--ngrams 2` (`domain-minimal`, `domain-aggressive`, `domain-no-technical`,
  `domain-ngrams2`). `--verbose` adds no line.
- `--comment-weight 0` and `--string-weight 0` exit 1 with `java.lang.IllegalArgumentException:
  --comment-weight must be positive, got 0` and a 15-line stack trace.
- Files: 30 `.sh`, `tools/lair.bash` and `tools/stable.zsh` are analysed. `bin/cellars` (no extension) is
  skipped without a message; run on that file alone the parser exits 1 with `IllegalArgumentException: No
  analysable source files found in ...` and a stack trace.
- Locale: with the POSIX locale the parser reports `31 files processed` and `zentaurenhöhle.sh` is missing
  without a message (`output/domain-posix-locale.cc.json`).
- The lens holds one node per file (32) and none for folders or the root. The root list below is the sum of
  the file nodes; `tools/dump_lenses.py` prints files only.

### Expected words at the root (sum over 32 files, 453 distinct words)

| word | frequency | word | frequency |
| --- | --- | --- | --- |
| creature | 348 | lair | 7 |
| encounter | 136 | hoard | 6 |
| speed | 71 | dungeon | 4 |
| hit | 46 | cellar | 3 |
| damage | 44 | treasure | 3 |
| armor | 42 | initiative | 9 |
| dice | 36 | stable | 10 |
| points | 33 | roll | 24 |
| centaur | 26 | | |

17 of 17 appear. `encounter(136)` is inflated by the file prefix: 107 of them come from
`encounter_edge_cases.sh`, where each of the 36 function names `encounter_edge_cases::...` adds 3. The most frequent words are `creature(348), encounter(136), edge(109),
shellcheck(86), speed(71), model(67), dirname(56), domain(51)`.

### Words of the new files
- `encounter_resolver.sh`: all twelve expected words except `initiative` and `resolver` as words of their
  own: `damage(24), encounter(22), creature(15), defender(13), dice(9), terrain(8), attacker(7), roll(7),
  armor(5), speed(4), resolver(2)`; `initiative` exists only inside `resolverinitiative(6)`.
- `encounter_edge_cases.sh`: `ambush(5)` (alias name 3 + two strings), `weapon(8)`, `torches(6)`,
  `trinkets(5)`, `scroll(4)`, `moat(2)`, `gargoyle(1)`, `goblin(1)`, `potions(1)`, `retreat(1)` are found.
  `kobold` is not: `printf 'goblin\nkobold'` yields `nkobold(1)`, the `n` of the escape sequence is glued on.
  `roll-initiative` gives `roll(3)` and `initiative(3)`.
- `tools/lair.bash`: `portcullis(6)` (identifier 3, comment 2, string 1). `tools/stable.zsh`: `paddock(3)`,
  `centaurs(10)`. `bin/cellars`: `drawbridge` is absent.

### Keyword and technical-word leakage (MODERATE)
- Bash keywords and builtins do not leak: `local`, `source`, `declare`, `printf`, `echo`, `return`,
  `function`, `if`, `for`, `select`, `until`, `case`, `trap`, `alias`, `shift`, `getopts`, `wait`, `exec`,
  `cd`, `usr`, `bin`, `env`, `zsh` are absent, also the zsh builtin `print` in `tools/stable.zsh`. The one
  `print(1)` at the root is the awk program string `'{ print $2 }'` in `long_pipeline`.
- `class(27)` appears and is right: it comes from `armor_class`, `class` is no shell keyword.
- Filtered as intended: `util`, `exception`, `service`, `mock`, `save`, `find`, `test`, `main`, `default`,
  `index`, `base`.
- Leak at MODERATE: `entity(26)`, `dto(12)`, `port(10)`, `repository(9)`, `adapter(8)`, `facade(6)`,
  `persistence(6)`, `id(36)`, `value(27)`, `new(19)`. `entity`, `repository`, `facade`, `dto`, `adapter` are
  only in `technical-aggressive.txt`; `port` and `persistence` are in no list.
- Bash-specific noise:
  - `shellcheck(86)` from the `# shellcheck source=` / `disable=` directives, fourth most frequent word.
  - `dirname(56)`, `lib(30)`, `model(67)`, `domain(51)`, `application(20)` from the `source
    "$(dirname "${BASH_SOURCE[0]}")/../domain/model/x.sh"` strings (weight 1) and the matching shellcheck
    comments (weight 2). Text inside `$( )` and `${ }` within a double-quoted string is counted as string
    words: `mktemp(1)` from `"$(mktemp)"`, `optarg(1)` from `"$OPTARG"`, `attacker` +1 per `"$attacker"`.
  - `dir(9)`, `script(20)` from `SCRIPT_DIR` / `LIB_DIR`.
  - `20(6)` from `roll_d20` / `d20Roll` (`dice.sh`): the number stays, the `d` is dropped.
- `--stop-word-level MINIMAL` adds `base default find index main save service`. `AGGRESSIVE` removes
  `adapter argument arguments dto entity facade init logger method model parameter parameters process
  repository result run types value`. `--no-technical-stopwords` adds `base default expected find helpers
  impl implementation index main name save service temporary tests util`.

### Identifier splitting

| form | identifier | file | words found | verdict |
| --- | --- | --- | --- | --- |
| snake_case | `walking_speed` | creature_facade.sh | walking, speed | ok |
| camelCase | `walkingSpeed` | test file | walking(5), speed(6) | ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | hit_points.sh | max(18), hit(25), points(13) | ok |
| PascalCase | `ArmorClass` (comment) | armor_class.sh | armor, class | ok |
| acronym | `XPValue`, `xp_value` | test file, creature.sh | xp, value | ok |
| digit | `d20Roll`, `roll_d20` | dice.sh | roll, `20(6)` | wrong: `20` is a word, `d20` is lost |
| kebab in string | `centaur-stable` | creature_facade.sh | centaur, stable | ok |
| hyphen in a function name | `roll-initiative` | encounter_edge_cases.sh | roll(3), initiative(3) | ok |
| alias | `alias ambush='...'` | encounter_edge_cases.sh | ambush(3) | ok |
| `select` variable | `select weapon in` | encounter_edge_cases.sh | weapon(3) | ok |
| Bash namespace `::` | `creature::set_type`, `encounter_resolver::resolve`, `encounter_edge_cases::case_alternatives`, `lair::lower_portcullis`, `zentaurenhöhle::new` | every file with functions | `creatureset(12)`, `resolverresolve(3)`, `casescase(6)`, `lairlower(3)`, `zentaurenhöhlenew(3)` | wrong: `::` is deleted, the two words around it are glued. 88 such words among the 453 at the root |

Function definitions count with weight 3. Calls of functions are not counted: `creatureid` is 3 although
`creature::id` is called in most files. A `local name` without an assignment is not counted either.

### Comments and strings
- `#` comments have weight 2 (`lair(2)` in `hit_points.sh`, `dungeon(2)`, `encounter(2)`, `initiative(2)` in
  `creature_facade.sh`), strings weight 1 (`dungeon(1)` in `no_such_creature_exception.sh`).
- Heredoc bodies and multi-line strings count as strings with weight 1: `heredoc(2)`, `gargoyle(1)`,
  `gate(1)`, `sleeps(1)`, `torch(1)` in `encounter_edge_cases.sh`; `treasure(1)`, `guards(1)` from the
  block-comment heredoc in `creature_util.sh`. The planted block comment therefore has half the weight it has
  in languages with a block comment.
- The weights 3 / 2 / 1 are visible in the counts; a weight of 0 is rejected.

### Test file handling
- Default: `test/creature_service_test.sh` is included: `centaur(9), creature(9), lib(9), code(6), speed(6),
  stable(6), walking(5)`. `should`, `save`, `to`, `the` are filtered, so
  `should_save_creature_to_the_stable` leaves `creature` and `stable`.
- `--exclude-tests`: 31 files, the test file is gone (words lost at the root: `assert fail pass plain raise
  runnable saved unknown`).
- Detection works by the `test/` directory only. A scratch folder with `lib/creature_service_test.sh` and
  `lib/test_creature.sh` keeps both with `--exclude-tests` (3 of 3 files processed). `TestFileDetector` has
  no file-name rule for `sh`, `bash`, `zsh`.

- German words (`lib/domain/model/zentaurenhöhle.sh`, node words: `stungsklasse(5), ruestungsklasse(4),
  hle(3), zentaurenhöhlebeschreibung(3), zentaurenhöhlenew(3), zentaurenhöhlerüstungsklasse(3), dem(2),
  die(2), geh(2), jeder(2), kreatur(2), liegt(2), ren(2), trefferpunkte(2), und(2), unter(2), verlies(2),
  zentaurenh(2), creature(1), der(1), dirname(1), zentaurenhoehle(1)`):

| word | found | as |
| --- | --- | --- |
| verlies | yes | verlies(2) |
| trefferpunkte | yes | trefferpunkte(2) |
| kreatur | yes | kreatur(2) |
| zentaurenhöhle | no | comment: `zentaurenh(2)` + `hle`; function names: glued `zentaurenhöhlenew(3)` |
| rüstungsklasse | no | comment and string key: `stungsklasse(5)`; function name: glued `zentaurenhöhlerüstungsklasse(3)` |
| größe | no | nothing (`gr` and `e` are too short) |
| höhle | no | `hle` |

  3 of 7. In comments and strings a word is `[a-zA-Z]{3,}` (`SplitStage.WORD_PATTERN`), so every umlaut and
  `ß` ends the word and the pieces count as words (`geh` and `ren` from `gehören`). Identifiers keep umlauts.
  German stop words leak: `die(2)`, `unter(2)`, `dem(2)`, `und(2)`, `jeder(2)`, `der(1)`, plus `liegt(2)`;
  `zu` is absent. Only `english-stopwords.txt` exists. The path string in `encounter_edge_cases.sh` adds
  `zentaurenh(2)` and `hle(2)` there.

## Changed since 2026-09-06
- The dependency parser was not run then. Run now, it exits 0 and writes an empty map with two warnings.
- The unified parser was not part of the earlier report; everything under "Unified parser" is new.
- The domain lens no longer carries nodes for folders and the root: 34 nodes for 23 files then (39 for 27
  after round 2), 32 nodes for 32 files now. "Words at the root" has to be summed from the files.
- Unchanged on the old files: the node of `test/creature_service_test.sh` is word for word the same; `::`
  still glues (`creatureset(12)`, `utiltreasure(3)`, `pointsinit(3)`); `shellcheck` is still 86; `20(6)`
  still appears; `entity`, `dto`, `port`, `repository`, `adapter`, `facade`, `persistence` still leak at
  MODERATE; `--comment-weight 0` still ends in a stack trace; `--exclude-tests` still knows only the `test/`
  directory; calls of `ns::fn` are still not counted; the MINIMAL and `--no-technical-stopwords` word lists
  are the same as then.
- Root counts that grew only because files were added (round 2 value -> now): `encounter` 7 -> 136,
  `initiative` 6 -> 9, `roll` 14 -> 24, `dice` 26 -> 36, `dirname` 48 -> 56, `model` 61 -> 67, `lib` 28 -> 30.
- New on old ground: `.bash` and `.zsh` are analysed by the domain parser and skipped by the unified parser;
  extension-less scripts are skipped by both; a non-ASCII file name is dropped silently under a POSIX locale.

## Verdict

### Unified parser
- Missing:
  1. Parameters: `max` / `min` / `mean` / `median_parameters_per_function` and `long_parameter_list` are 0 for
     every Bash file (`encounter_resolver::resolve` reads `$1`..`$5`, expected 5 and 1).
  2. `message_chains` is always 0: the pipeline of 5 commands in `encounter_resolver::describe`, the 6-command
     pipeline in `long_pipeline` and the `|&` pipeline in `pipeline_stderr` are not chains.
  3. `tools/lair.bash` is skipped although the grammar library lists `.bash`; `tools/stable.zsh` and the
     extension-less `bin/cellars` (shebang `#!/usr/bin/env bash`) are skipped too.
  4. `-a` / `-o` inside `[ ]` (`single_bracket_dash_a`) add nothing.
- Wrong:
  1. The default arm `*)` of a `case` counts as a branch: `encounter_resolver::resolve` (15 instead of 14),
     `case_alternatives`, `getopts_loop`. **Decision: ignore (derived from Java).**
  2. Per-function complexity omits the function's own +1: `min_complexity_per_function` is 0 where 1 is
     expected (`describe`, `is_empty`); mean 3.2 instead of 3.33, median 2 instead of 1.5. **Decision: ignore (derived from Java).**
  3. A nested function (`encounter_resolver::initiative_of`) is counted in `number_of_functions` but is no
     entry in the per-function statistics; it adds +1 to the complexity of its parent instead (mean rloc 10.8
     instead of 9.33, median 11 instead of 7). **Decision: accept (derived from Java).**
  4. Functions whose body is not `{ }` (`subshell_body`, `test_body`, `arithmetic_body`) get per-function rloc
     0 and complexity 0; the `||` in `subshell_body` reaches the file total only. **Decisions derived from Java: accept — a function body that is not recognised is measured as empty, as with constructor bodies.**
  5. With a POSIX locale `lib/domain/model/zentaurenhöhle.sh` vanishes from the map without a warning. **Decision: accept (derived from Java).**
- Bad:
  1. An extension-less file is reported as ignored extension `.`.
  2. The `.gitignore` is looked up in the analysed folder only; the run warns and falls back to the default
     build-folder exclusion. **Decision: ignore (derived from Kotlin).**
  3. The shebang counts as a comment line in every script; the no-op heredoc block comment counts as code.
- Good: `loc`, `rloc`, `comment_lines` match the hand count in all new files; `#` in heredocs, strings and
  parameter expansions is never a comment; `if`, `elif`, `for`, `for (( ))`, `for x; do`, `while`, `until`,
  `select`, `case` arms with `|`, `;&`, `;;&`, `&&` / `||` in `[[ ]]`, `(( ))` and lists, the arithmetic
  ternary and `if` inside `$( )` are counted; `&`, `|&` and operators inside a `trap` string are not; all five
  function syntaxes are counted as functions; `long_method` and `excessive_comments` are right.

### Dependency parser
- Missing:
  1. No Bash support: 0 of 78 expected file edges, no leaves, no cycle, no upward edge
     (`output/dependency.cc.json` holds only the root folder). **Decision: ignore (derived from Objective-C).**
  2. A Bash analyzer would need: `source` / `.` with `$(dirname "${BASH_SOURCE[0]}")`, `$VAR` and `..`
     resolution, glob sources (`creature_util.sh`, `tools/check_model.sh`), conditional and in-function
     sources (`encounter_edge_cases.sh`), `exec` / call by path (`bin/encounter.sh`, `bin/cellars`,
     `bin/cellars.sh`), zsh `${0:A:h}` (`tools/stable.zsh`), extension-less scripts, and a test rule for
     shell.
- Wrong: nothing; the parser claims nothing.
- Bad: `Created Project with 1 leaves` for an empty result; exit code 0, so a pipeline cannot tell the empty
  map from a real one without reading the warnings. **Decision derived from Objective-C: ignore — exit code 0.**
- Good: no crash, two clear warnings (`No supported source files found under ...`, `No analyzable
  declarations were found ...`), a valid 2.1 map with an empty dependency lens.

### Domain language parser
- Missing:
  1. Umlaut words in comments and strings: `Zentaurenhöhle`, `Rüstungsklasse`, `Größe`, `Höhle`, `gehören`
     (`zentaurenhöhle.sh`) are cut at the umlaut; 3 of 7 German words survive. **Decision: accept (derived from Java).**
  2. German stop words: `die`, `unter`, `dem`, `und`, `jeder`, `der` leak. **Decision: ignore (derived from Java).**
  3. Extension-less scripts (`bin/cellars`) are skipped without a message; `drawbridge` never appears.
  4. No file-name rule for shell tests (`*_test.sh`, `test_*.sh`).
  5. Calls of functions are not counted, only definitions. **Decision: ignore (derived from Kotlin) — every language counts declarations only.**
- Wrong:
  1. `::` in function names is deleted instead of splitting: 88 glued words at the root
     (`creatureset`, `resolverinitiative`, `casesarithmetic`, `lairlower`, `utiltreasure`); `initiative` in
     `encounter_resolver.sh` and `treasure` in `creature_util.sh` lose their identifier counts to them.
  2. Escape sequences in strings: `'goblin\nkobold'` (`while_read_or`) yields `nkobold`.
  3. `20` from `roll_d20` / `d20Roll` (`dice.sh`) is a word. **Decision: ignore (derived from Java).**
  4. `--comment-weight 0` / `--string-weight 0` and a single extension-less file end in a stack trace. **Decisions derived from Java: accept — a weight of 0 is rejected.**
  5. With a POSIX locale `zentaurenhöhle.sh` is dropped without a message. **Decision: accept (derived from Java).**
- Bad:
  1. `shellcheck(86)` from tooling directives is the fourth most frequent word.
  2. `source` paths and their shellcheck twins: `dirname(56)`, `model(67)`, `domain(51)`, `lib(30)`,
     `application(20)`; commands and variables inside `"$( )"` / `"$var"` count as string words.
  3. `SCRIPT_DIR` / `LIB_DIR` give `script(20)`, `dir(9)`.
  4. The file prefix of every function name dominates: `encounter(136)`, `edge(109)`.
  5. `entity`, `dto`, `port`, `repository`, `adapter`, `facade`, `persistence` leak at MODERATE. **Decision: ignore (derived from Java).**
  6. No root or folder node in the lens; the heredoc block comment has string weight. **Decisions derived from Java: ignore — no root or folder node.**
- Good: all 17 expected words are present; `.bash` and `.zsh` are analysed; Bash keywords, builtins and the
  shebang words never leak and `class` rightly stays; snake_case, camelCase, SCREAMING_SNAKE, PascalCase in
  comments, the `XP` acronym, `centaur-stable`, `roll-initiative`, alias names and the `select` variable
  split or extract correctly; heredoc and multi-line string text is read; weights 3 / 2 / 1 are visible;
  `--exclude-tests` removes `test/`.
