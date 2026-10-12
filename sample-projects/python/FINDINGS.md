# Python

Round 3, 2026-10-08. Replaces the report from 2026-09-06 (dependency and domain parser only). Every claim below was read from the fresh output in `output/`; nothing was carried over unchecked. What could not be checked is listed under "Not verified".

## Project
- Layout: flat package layout `de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,application,application/dto,infrastructure}` directly under the language folder, `tests/test_creature_service.py` (pytest) beside it. 48 source files: 46 `.py` (8 of them empty `__init__.py`), 1 `.pyw`, 1 `.pyi`.
- Added in round 3 (no older source file touched):
  - `domain/service/encounter_resolver.py`: `EncounterResolver` with `resolve`, `describe`, `safe_roll`, `initiative_order`, `is_empty`.
  - `domain/service/encounter_edge_cases.py`: 54 top-level blocks (53 functions and one class `Ambush` with a nested class), one construct each, plus a module-level `if __name__ == "__main__":`.
  - `domain/model/zentaurenhöhle.py`: `@dataclass class Zentaurenhöhle` with the field `rüstungsklasse`, the German sentence as a `#` comment and the string `"Größe der Höhle"`. Unicode file name, class name and field name, all legal Python.
  - `application/creature_window.pyw` (tkinter window script, imports `CreatureType` and `roll_d20`) and `domain/service/omen_reader.pyi` (stub file with `@overload`, imports `Creature` and `DiceRoll`).
  - `git check-ignore -v` reports none of the five as ignored.
- Closest idioms where Python lacks the construct: the 6-line doc comment on the type is a class docstring; the 2-line block comment is two consecutive `#` lines (PEP 8 "block comment"); the lambda holding one `if` is a lambda holding a conditional expression (a lambda cannot hold a statement); `switch` is `match` with `case _` as default; `&&` / `||` are `and` / `or`; `else if` is `elif`; `is_empty(self)` has `self` as its only formal parameter.
- Stress constructs for the dependency parser (unchanged from rounds 1 and 2): aliased import, wildcard import, `__init__.py` barrels, inheritance, ABC as interface, `Generic[T]` base, `TYPE_CHECKING` import, instantiation only, static member only, decorator only, same simple name in two packages, `import a.b.c` with a fully qualified use, unused import, stdlib / third party, test file, several declarations in one file, `try` / `except ImportError` imports, `importlib.import_module`, string forward references, conditional import, namespace package without `__init__.py`. Not in the language: an import-free fully qualified reference, annotations as a separate concept, a syntactic `interface` / `enum`.
- Locale: the sandbox runs with a POSIX locale. With it all three parsers drop `zentaurenhöhle.py` without a message; the file count is simply one lower (variant runs `output/variants/*-posix-locale.cc.json`). All runs reported below use `LC_ALL=C.UTF-8`.

## Expected values (written before the first parser run)

Hand-counted with the README counting rule. Readings of the rule for Python: `self` / `cls` are not parameters, a bare `*` or `/` is not a parameter, a docstring and a bare string statement are comment lines, a `for` and an `if` inside a comprehension count like a loop and an `if`, a `case` guard counts as an `if`, `case _` is the default, `else` of a loop / `try` and `finally` count nothing, `not` counts nothing, a lambda belongs to the function it is written in, a nested `def` is a function of its own and its lines also belong to the body of the outer function, the rloc of a function is its body without the `def` line.

- `domain/service/encounter_resolver.py`: loc 79, rloc 57, comment_lines 13, number_of_functions 6 (5 methods + nested `initiative_of`), logic_complexity 14, complexity 21, parameters max 5 / min 0 / mean 1.5 / median 1, complexity per function max 12 / min 1 / mean 3.5 / median 1.5 (resolve 12, describe 1, safe_roll 4, initiative_order 2, initiative_of 1, is_empty 1), rloc per function max 26 / min 1 / mean 7.67 / median 5 (26, 3, 7, 8, 1, 1), long_method 1, long_parameter_list 1, message_chains 1, excessive_comments 1.
- `domain/service/encounter_edge_cases.py` (whole file): loc 390, rloc 246, comment_lines 21, number_of_functions 63, logic_complexity 42, complexity 107 (63 functions + 2 lambdas + 42), parameters max 7 / min 0 / mean 1.17 / median 1, rloc per function max 12 / min 1, long_method 2 (`try_except_else_finally`, `long_single_statement`), long_parameter_list 1 (`every_parameter_kind`), message_chains 2 (`chain_with_subscript`, `chain_over_lines`), excessive_comments 1. Per function: see the table in "Unified parser".
- `domain/model/zentaurenhöhle.py`: loc 12, rloc 7, comment_lines 1, number_of_functions 1, complexity 1, parameters 0. `application/creature_window.pyw`: the README lists only `.py` for the unified parser, so expected skipped (if analysed: 2 functions, complexity 3, loc 20). `domain/service/omen_reader.pyi`: expected skipped by all three parsers.
- New dependency edges: `encounter_resolver.py` -> creature, dice, speed_type (3). `encounter_edge_cases.py` -> speed, armor_class, centaur, creature, creature_id, creature_type, errors, fightable, hit_points, speed_type, zentaurenhöhle, dice (12, forms in the dependency table). `zentaurenhöhle.py` -> armor_class (1). `creature_window.pyw` -> creature_type, dice (2, Python source, should be analysed). `omen_reader.pyi` -> creature, dice only if stubs are analysed. With the 61 expected edges of rounds 1 and 2 (66 with tests): 77 for `.py`, 79 with `.pyw`. No new cycle, no new upward edge.
- Domain words: the German seven `zentaurenhöhle`, `verlies`, `rüstungsklasse`, `trefferpunkte`, `kreatur`, `größe`, `höhle` present and uncut; `die`, `unter`, `dem`, `und`, `jeder`, `der`, `zu`, `liegt`, `gehören` ideally absent. Probe words in `encounter_edge_cases.py`, all expected present: wanderer, kind, vanguard, rearguard, prowler, pace, swiftness, lurker, brute, dweller, den, mishap, blunders, ledger, backup, straggler, laggard, outer, inner, ring, nomad, drifter, raiders, omens, bounty, hideout, blessed, cave, tally, threshold, headcount, wraith, crypt, ghoul, catacomb, banshee, spell, snare, tripwire, ambush, ambushers, trap, bestiary, champion, horde, brawler, rüstung, gewölbe, tempo. Expected absent: `async`, `await`, `lambda`, `match`, `case`, `yield`, `assert`, `functools`, `lru`, `cache`, `wraps`, `isinstance`, `typing`, `optional`, `dict`, `main`, `name`, `print`. `.pyw`: bestiary, window, console, caption present; `.pyi`: omen, reader, portents, ominous absent.

**Corrected after the run (my own miscount, the only change to the values above):** the body of `try_except_else_finally` has 13 code lines, not 12 (I skipped one `outcome =` line), so the expected rloc-per-function maximum of the edge-case file is 13. A second expectation was badly chosen rather than miscounted: `match` cannot be absent from the domain words, because three of my own function names contain it.

## Unified parser
- Command (README "How to run", with `LC_ALL=C.UTF-8`): `unifiedparser -nc … -e "output,FINDINGS.md" -o output/unified.cc.json`, exit 0. stderr: `No .gitignore found at root level, excluding common build folders as fallback...` and `2 Files with the following extensions were ignored as they are currently not supported: [.pyw, .pyi]`. 46 `.py` files analysed, among them `zentaurenhöhle.py`.
- Extension table: `.py` analysed, `.pyw` skipped (named in the log), `.pyi` skipped (named in the log).
- Per-construct numbers come from a variant run in which every top-level block of `encounter_edge_cases.py` is its own file (`output/variants/unified-edge-split.cc.json`, 54 files).

`encounter_resolver.py`:

| Metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| loc | 79 | 79 | ok |
| rloc | 57 | 57 | ok |
| comment_lines | 13 | 13 | ok (docstring 6, `#` lines 6, trailing 1) |
| number_of_functions | 6 | 7 | wrong: the lambda assigned to `clamp` counts as a function |
| logic_complexity | 14 | 19 | wrong: +1 `case _`, +3 list literals (`[]`, `[strongest]`, the `[int]` inside `Callable[[int], int]`), +1 lambda |
| complexity | 21 | 25 | wrong: the same extra points (19 + 6 `def`) |
| max / min / mean / median parameters | 5 / 0 / 1.5 / 1 | 12 / 2 / 5.6 / 4 | wrong: `self`, every type-hint identifier and the return type are counted (`resolve` = self + 5 names + 5 types + `str`) |
| max / min / mean / median complexity per function | 12 / 1 / 3.5 / 1.5 | 12 / 0 / 3.8 / 3 | wrong: the function itself is not counted, so `describe` and `is_empty` have 0; the maximum only matches because `case _` adds what the function point would have |
| max / min / mean / median rloc per function | 26 / 1 / 7.67 / 5 | 26 / 1 / 9 / 7 | max and min ok; mean and median differ because the nested `initiative_of` is no entry of its own (the reported means fit 5 functions, `number_of_functions` says 7) |
| long_method | 1 | 1 | ok |
| long_parameter_list | 1 | 2 | wrong: `initiative_order(self, creatures: List[Creature]) -> List[Creature]` counts 6 |
| message_chains | 1 | 1 | ok |
| excessive_comments | 1 | 1 | ok |

`encounter_edge_cases.py`, per construct (complexity unless stated otherwise):

| Construct (function) | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| `if` / `elif` / `elif` / `else` (`elif_chain`) | 4 | 4 | ok |
| `for … else` with `if` (`for_else`) | 3 | 3 | ok |
| `while … else` (`while_else`) | 2 | 2 | ok |
| `match` with `"cellar" \| "dungeon"`, one more case, `case _` (`match_or_pattern`) | 3 | 4 | wrong: `case _` counts as a case; the `\|` alternative adds nothing |
| `case value if value > 15`, `case _` (`match_guard`) | 3 | 4 | wrong: `case _` again; the guard is counted |
| class, mapping and sequence patterns, `case _` (`match_class_pattern`) | 4 | 9 | wrong: nested sub-patterns count as further cases, plus `case _` |
| `a if c else b` (`conditional_expression`) | 2 | 2 | ok |
| nested conditional expression (`nested_conditional_expression`) | 3 | 3 | ok |
| `and`, `or`, `not` (`boolean_operators`) | 3 | 3 | ok |
| `a and b and c` (`boolean_chain`) | 3 | 3 | ok |
| `1 < roll < 20` (`chained_comparison`) | 1 | 1 | ok |
| list comprehension with `if` (`list_comprehension`) | 3 | 3 | ok |
| dict comprehension with `if` (`dict_comprehension`) | 3 | 3 | ok |
| set comprehension without `if` (`set_comprehension`) | 2 | 2 | ok |
| generator expression with `if` (`generator_expression`) | 3 | 3 | ok |
| comprehension with two `for` and two `if` (`nested_comprehension`) | 5 | 5 | ok |
| `try` with three `except`, `else`, `finally` (`try_except_else_finally`) | 4; rloc of the body 12, corrected to 13 | 4; 13 | ok |
| `except*` twice (`exception_groups`) | 3 | 1 | missing: `except*` is not counted |
| `with` with two items (`with_statement`) | 1 | 1 | ok |
| two lambdas (`lambda_functions`) | complexity 3, functions 1 | complexity 3, functions 2, logic_complexity 2 | wrong: the assigned lambda is a function, the inline one is not; both land in `logic_complexity` |
| nested `def` two levels deep (`nested_def`) | 3 functions, complexity 3 | 3 functions, complexity 3; per-function maximum 2 | ok for the file; the nested functions are added to the outer one per function |
| two stacked decorators (`decorated`) | 1 | 1 | ok |
| `async def`, `async with`, `async for`, `await` (`async_await`) | 2, parameters 2 | 2, 2 | ok |
| async comprehension with `if await` (`async_comprehension`) | 3 | 3 | ok |
| `yield` in a loop (`generator`) | 2 | 2 | ok |
| `yield from` (`delegating_generator`) | 1 | 1 | ok |
| `*raiders, **omens` (`variadic`), parameters | 2 | 2 | ok |
| `roll, *, bonus, terrain` (`keyword_only`), parameters | 3 | 3 | ok |
| `roll, bonus, /, terrain` (`positional_only`), parameters | 3 | 3 | ok |
| `roll, bounty=0, hideout: str = "cave", *, blessed: bool = False` (`defaults`), parameters | 4 | 6, long_parameter_list 1 | wrong: `str` and `bool` are counted |
| three typed parameters and a return type (`type_hints`), parameters | 3 | 9, long_parameter_list 1 | wrong: `Creature`, `Dict`, `SpeedType`, `int`, `Optional`, `HitPoints` are counted |
| seven parameters of every kind (`every_parameter_kind`), parameters | 7 | 9 | wrong: two `int` hints are counted (long_parameter_list 1 is right) |
| PEP 695 `def first_of[Champion](horde: list[Champion]) -> Champion`, parameters | 1 | 5, long_parameter_list 1 | wrong: type parameter, hint and return type are counted |
| methods of `Ambush` (`self`, `cls`, static), parameters max / min / mean | 2 / 0 / 0.75 | 3 / 1 / 1.62 | wrong: `self` and `cls` are counted |
| `Ambush`: `__init__`, property, setter, classmethod, staticmethod, `__add__`, `__len__`, method of a nested class | 8 functions, complexity 8 | 8, 8 | ok |
| walrus in an `if` (`walrus`) | 2 | 2 | ok |
| `assert` with message (`assertion`) | 1 | 1 | ok |
| `"""…"""` docstring (`docstring_double_quotes`) | comment 1, rloc 2 | 1, 2 | ok |
| `'''` docstring over three lines (`docstring_single_quotes`) | comment 3, rloc 2 | 3, 2 | ok |
| raw docstring `r"""…"""` (`docstring_raw`) | comment 1, rloc 2 | 1, 2 | ok |
| `#` inside `"…"` and `'…'`, one trailing comment (`hash_in_string`) | comment 1, rloc 4 | 1, 4 | ok |
| `#` inside an f-string (`hash_in_fstring`) | comment 0, rloc 2 | 0, 2 | ok |
| bare triple-quoted string as block comment, with `if … and …` inside (`triple_quoted_block_comment`) | comment 4, rloc 3, complexity 1 | 4, 3, 1 | ok |
| triple-quoted string assigned to a name, with `#` and `if … and … or …` inside (`multiline_string_value`) | comment 0, rloc 6, complexity 1 | 0, 6, 1 | ok |
| `#`, trailing `#`, `#:`, `##`, bare `#` (`comment_forms`) | comment 5, rloc 3 | 5, 3 | ok |
| `a.b.c.f().g()` (`chain_with_attributes`), message_chains | 0 | 0 | ok |
| `xs[0].f().g().h().i()` (`chain_with_subscript`), message_chains | 1 | 1 | ok |
| four calls over six lines in parentheses (`chain_over_lines`), message_chains | 1 | 1 | ok |
| `x.f().g().value.h().i()` (`chain_broken_by_attribute`), message_chains | 0 | 1 | differs: an attribute access between calls does not break the chain. Wrong by the README wording ("consecutive calls"), defensible as a design choice |
| 6 code and 6 comment lines in the body (`long_only_with_comments`), long_method | 0 | 0 | ok |
| one `return dict(...)` over 12 lines (`long_single_statement`), long_method | 1 | 1 | ok |
| `local_import`, `module_alias_from_import`, `isinstance_check`, `unicode_identifiers` | 1 each | 1 each | ok |
| module-level `if __name__ == "__main__":` | +1 | +1 (whole-file sums agree) | ok |

Whole file `encounter_edge_cases.py`:

| Metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| loc / rloc / comment_lines | 390 / 246 / 21 | 390 / 246 / 21 | ok |
| number_of_functions | 63 | 64 | wrong: assigned lambda `by_value` |
| logic_complexity | 42 | 49 | wrong: +3 `case _`, +4 sub-patterns, -2 `except*`, +2 lambdas |
| complexity | 107 | 112 | wrong: +3 `case _`, +4 sub-patterns, -2 `except*` |
| message_chains | 2 | 3 | differs: `chain_broken_by_attribute` |
| long_method | 2 | 2 | ok |
| long_parameter_list | 1 | 4 | wrong: `defaults`, `type_hints`, `first_of` added |
| parameters max / min / mean / median | 7 / 0 / 1.17 / 1 | 9 / 0 / 1.52 / 1 | wrong: hints, `self`, `cls` |
| rloc per function max / min | 12 (corrected to 13) / 1 | 13 / 1 | ok after my correction |
| excessive_comments | 1 | 1 | ok |

- Line counting: `loc`, `rloc` and `comment_lines` match the hand count in the three new `.py` files and in every one of the 54 split files. Docstrings and bare string statements are comment lines and no rloc; a string assigned to a name is code; `#` inside strings and f-strings is never a comment; a line with code and a trailing comment counts for both.
- `zentaurenhöhle.py`: loc 12, rloc 7, comment_lines 1, number_of_functions 1, complexity 1, logic_complexity 0 as expected; parameters 2 instead of 0 (`self` and the return type `str`).
- Other files, same causes:
  - `application/creature_facade.py`: `create` has 8 parameters after `self`, the reported maximum is 18 (self + 8 names + 8 hints + return type).
  - `domain/model/speed.py`: reported parameters max 3 / min 2 for `set_speed(self, speed: int) -> None` and `get_speed(self) -> int`; by hand 1 and 0.
  - `application/__init__.py`, `application/dto/__init__.py`, `domain/model/__init__.py`: `logic_complexity` 1 and `complexity` 1; the only candidate in these files is the `__all__ = [...]` list literal.
  - `domain/service/lair.py` and `stable.py`: `logic_complexity` 1; the only candidate is `= []`.
  - `application/tracing.py`: per-function complexity 1 although the file has no branch (nested `wrapper` inside `traced`).
  - `long_parameter_list` is reported for `armor_class.py` (1), `creature.py` (2), `creature_service.py` (1), where no function has more than 4 parameters by hand, and for `repository.py` (1) and `initiative.py` (1), which I did not hand-count. `creature_facade.py` (1) is right.
- `.gitignore`: the parser looks for one in the scanned folder, finds none in `sample-projects/python` and says so; `-e "output,FINDINGS.md"` is what keeps `output/` out of the run.

## Dependency parser
- Commands (README "How to run", with `LC_ALL=C.UTF-8`): `dependencyparser -nc … -e "output,FINDINGS.md" -o output/dependency.cc.json` and the same with `--include-tests -o output/dependency-with-tests.cc.json`. Both exit 0. stderr: the `.gitignore` warning, progress and timing lines (`Found 2 strongly connected components`, `Found a total of 6 cycles`). Default run: 44 files, 70 file edges, 116 leaves, 84 leaf edges, 12 edges `isCyclic`, 2 `isPointingUpwards`. With tests: 75 file edges, 118 leaves.
- Extension table: `.py` analysed; `.pyw` and `.pyi` not analysed and not mentioned in the log.

Round 3 constructs:

| Construct | Expected edge(s) | Found | Verdict |
| --- | --- | --- | --- |
| `encounter_resolver.py`: relative imports, `Creature` / `Dice` in annotations, `SpeedType.FLYING` | -> creature, dice, speed_type | all three | ok |
| `zentaurenhöhle.py`: field annotation `rüstungsklasse: ArmorClass`, unicode file and class name | -> armor_class | yes; leaf `Zentaurenhöhle` kind `class` | ok |
| unicode module path `from ..model.zentaurenhöhle import Zentaurenhöhle`, `Zentaurenhöhle(rüstung)` in `unicode_identifiers` | -> zentaurenhöhle | yes | ok |
| from-import of a module with alias `from ..model import speed as tempo`, `tempo.Speed(30)` in `module_alias_from_import` | -> speed | yes | ok |
| annotation-only local `armor: ArmorClass` in `type_hints` | -> armor_class | yes | ok |
| class pattern `case Centaur(xp_value=0)` in `match_class_pattern` | -> centaur | yes | ok |
| parameter annotation `creature: Creature` in `type_hints` | -> creature | yes | ok |
| `isinstance(candidate, CreatureId)` in `isinstance_check` | -> creature_id | yes | ok |
| `except NoSuchCreatureException:` in `try_except_else_finally` | -> errors | yes | ok |
| return annotation `Optional[HitPoints]` in `type_hints` | -> hit_points | yes | ok |
| subscript `Dict[SpeedType, int]` in `type_hints` | -> speed_type | yes | ok |
| function-local `from ..model.dice import roll_d20` in `local_import` | -> dice | yes | ok |
| PEP 695 `type Bestiary = list[CreatureType]` (module level) | -> creature_type | no; `Bestiary` is not a leaf either | **missing** |
| `Brawler = TypeVar("Brawler", bound=Fightable)` (module level) | -> fightable | no; `Brawler` is a `variable` leaf without any edge | **missing** |
| `creature_window.pyw` | -> creature_type, dice | file not analysed | **missing** |
| `omen_reader.pyi` | -> creature, dice if stubs count | file not analysed | skipped (acceptable for stubs, but silent) |

Rounds 1 and 2, re-read from the fresh output:

| Construct | Expected edge(s) | Found | Verdict |
| --- | --- | --- | --- |
| 1 aliased import `CreatureEntity as Entity` (`creature_repository.py`) | -> creature_entity | yes | ok |
| 2 wildcard `from ...domain.model import *` (`creature_util.py`) | -> creature, hit_points or -> model/`__init__` | -> `domain/model/__init__.py` x2 | ok (one hop via the barrel) |
| 3 barrel `application/__init__.py` (`persisted_creatures.py`, `creature.py`) | both -> `application/__init__.py`; `__init__` -> creature_facade, creature_util | all four | ok |
| 4 inheritance / ABC (`centaur.py`, `creature.py`, `persisted_creatures.py`) | -> creature, fightable, creatures | all | ok; every leaf edge has `usage=usage` |
| 5 generic base `Repository[Entity]` (`creature_repository.py`) | -> repository | yes | ok; `T` is a `variable` leaf with a leaf edge `Repository -> T` |
| 6a `TYPE_CHECKING` import (`creature_service.py`) | -> creature_id | yes | ok |
| 6b instantiation only (`persisted_creatures.py`) | -> creature_entity | yes | ok |
| 6c static member only `CreatureFacade.STANDARD_CREATURE_TYPE` (`creature.py`, `persisted_creatures.py`) | -> `application/__init__.py` | yes, both | ok |
| 6d decorator only `@traced` (`creature_facade.py`) | -> tracing | yes | ok |
| 7 same simple name `Creature` and `Creature as CreatureDto` (`creature_facade.py`) | -> domain/model/creature and -> application/dto/creature | only the domain edge | **missing** |
| 8 `import de...model.speed` + fully qualified use (`creature_facade.py`) | -> speed | yes | ok |
| 9 unused import `Fightable` (`creature_util.py`) | none | none | ok |
| 10 stdlib / third party | none | none | ok |
| 11 test file `tests/test_creature_service.py` | 5 edges with `--include-tests`, none without | exactly that | ok |
| 12 `dice.py` (3 declarations), `errors.py` | model/`__init__` -> dice x3; -> errors | yes | ok |
| `from ..model import creature` + `creature.Creature` (`creature_service.py`) | -> creature | yes | ok |
| `from . import creature` module object (`initiative.py`) | -> creature | yes | ok |
| `try:` import (`encounter.py`) | -> dice | yes | ok |
| `except ImportError:` fallback import (`encounter.py`) | -> fallback_dice | no | **missing** |
| `importlib.import_module("…speed")` (`speed_loader.py`) | -> speed | no; `speed_module` is a `variable` leaf | **missing** |
| string forward reference `"Creature"` without import (`lair.py`) | -> creature | no | **missing** |
| `import … as speed_module` (`speed_mapper.py`) | -> speed | yes | ok |
| conditional import in `if` (`armory.py`) | -> armor_class | yes | ok |
| `typing.List["Centaur"]` with import (`stable.py`) | -> centaur | no | **missing** |
| namespace package without `__init__.py` (`scheduler.py`) | -> infrastructure/clock | yes | ok |

- Totals: 70 of 77 expected `.py` edges (75 of 82 with tests), 0 of 2 for `.pyw`. Per new file: `encounter_resolver.py` 3 of 3, `encounter_edge_cases.py` 10 of 12, `zentaurenhöhle.py` 1 of 1. Rounds 1 and 2: 56 of 61.
- False positives: none at file level; every one of the 70 edges is an expected one.
- Cycles: `creature.py -> application/__init__.py -> creature_facade.py -> creature_service.py -> creature.py` with its short cuts is flagged, and `armor_class.py -> creature_util.py -> domain/model/__init__.py` (12 edges in total). `domain/model/__init__.py -> armor_class.py` is not flagged although it closes that file-level cycle. No new cycle from the round-3 files, as expected.
- Upward edges: `armor_class.py -> creature_util.py` and `creature.py -> application/__init__.py`, as expected. None new.
- Leaf kinds: `class` for every class including the `Enum` subclasses and the ABCs; `function` for module-level functions (53 leaves from `encounter_edge_cases.py`, `traced`, `roll_d20`); `unknown` for the `__init__.py` re-export leaves; `variable` for module-level assignments (`logger` x3, `__all__` x3, `T`, `MAX_HIT_POINTS`, `USE_NATURAL_ARMOR`, `speed_module`, `Brawler`). Nested classes, nested functions and methods are not leaves (`Ambush.Trap`, `initiative_of`). A decorator naming a function of the same file gives an intra-file leaf edge (`decorated -> elif_chain`). Too coarse rather than wrong: Python has no `enum` / `interface` syntax.
- Native vs. resolved: Python has modules, packages, absolute and relative imports, but no compile-time types. CodeCharta resolves the names used inside a class or function against the imports of the file. `PythonAnalyzer.toNode` returns a `variable` declaration with empty dependencies and used types, which matches the missing `TypeVar(..., bound=Fightable)` edge; a `type` statement produces no declaration.
- `src/` layout (variant `output/variants/dependency-src-layout.cc.json`, the same sources copied under `src/`): 43 file edges instead of 70, and no edge carries `isCyclic` or `isPointingUpwards`.

## Domain language parser
- Command (with `LC_ALL=C.UTF-8`): `domainlanguageparser -nc … -e "output,FINDINGS.md" -o output/domain.cc.json`, exit 0, `Analysis complete: 47 files processed` (46 `.py` + `creature_window.pyw`). Variants in `output/variants/`, all exit 0: `--stop-word-level MINIMAL`, `--stop-word-level AGGRESSIVE`, `--exclude-tests`, `--identifier-weight 1 --comment-weight 1 --string-weight 1`.
- Extension table: `.py` and `.pyw` analysed, `.pyi` not analysed and not mentioned in the log.
- The domain lens holds one node per file (47 nodes). The root and the folders have no word list in the cc.json, so "at the root" below means the sum over all files, computed by me (317 distinct words).
- Expected words: all 17 present. creature(140), roll(69), speed(60), armor(36), hit(36), points(31), dice(25), damage(23), lair(13), encounter(13), initiative(12), stable(10), centaur(8), dungeon(5), treasure(5), hoard(5), cellar(4). Plurals are separate words: creatures(52), speeds(16), centaurs(2).
- Keyword leakage: none of `class`, `def`, `self`, `cls`, `init`, `str`, `int`, `bool`, `list`, `type`, `async`, `await`, `lambda`, `case`, `yield`, `assert`, `isinstance`, `typing`, `optional`, `dict`, `print`, `name`, `main`, `callable`, `tkinter` appears. `match(9)` comes from the function names `match_or_pattern`, `match_guard`, `match_class_pattern`, which is correct. Leaking stdlib names: `dataclass(21)`, `abstractmethod(12)`, `functools(9)`, `logger(9)`, `classmethod(6)`, `property(6)`, `args(3)`, `kwargs(3)`, `wrapper(3)`, `function(3)`, `pytest(3)`. `staticmethod` is absent (it is in `python-keywords.txt`; `dataclass`, `abstractmethod`, `classmethod`, `property` are not). Of `@functools.lru_cache` and `@functools.wraps` the word `functools` is counted, `lru`, `cache`, `wraps` are not. Numeric token `20(9)` from `roll_d20` / `d20Roll`. That these names count is wrong for the language: they are boilerplate in almost every Python codebase.
- Technical stop words at MODERATE: `util`, `test`, `tests`, `mock`, `exception`, `service`, `save`, `find`, `get`, `create`, `base` are absent. Leaking: `value(36)`, `key(11)`, `one(11)`, `repository(9)`, `entity(9)`, `item(9)`, `standard(6)`, `facade(4)`, `persisted(3)`. AGGRESSIVE removes `repository`, `entity`, `facade`, `logger`, `value`, `args`, `function` and keeps `kwargs(3)`, `wrapper(3)`, `dataclass(21)`. MINIMAL adds `get(21)`, `save(18)`, `find(17)`, `service(9)`, `create(3)`, `base(3)`. The 17 words keep their counts at all three levels.
- Identifier splitting:

| Form | Identifier | Words found |
| --- | --- | --- |
| camelCase | `walkingSpeed` (test file) | walking, speed |
| snake_case | `walking_speed` (`creature_facade.py`) | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` (`hit_points.py`) | hit, points (`max` absent) |
| PascalCase | `ArmorClass` | armor (`class` absent) |
| Acronym | `xp_value` (`creature.py`) | xp(6), value(6) |
| Digit | `d20Roll`, `roll_d20` (`dice.py`) | roll, and a separate token `20(6)` |
| Kebab in string | `"centaur-stable"` (`creature_facade.py`) | centaur(1), stable |
| Unicode | `Zentaurenhöhle`, `rüstungsklasse`, `rüstung`, `gewölbe` | zentaurenhöhle(3), rüstungsklasse(3), rüstung(3), gewölbe(3), uncut |

- Comments and strings: the counts fit the weights identifier 3, comment 2, string 1 (equal-weights run: creature 140 -> 56, zentaurenhöhle 3 -> 1). Docstrings count with the comment weight in every syntax: `wraith(2)`, `crypt(2)` (`"""`), `ghoul(2)`, `catacomb(2)` (`'''`), `banshee(2)` (`r"""`); the bare string used as a block comment too (`bare(2)`, `closest(2)`). The planted sentences: `cellar(2)`, `roams(2)` (`creature.py`), `lair(2)`, `rests(2)` (`hit_points.py`), `initiative(2)`, `encounter(2)`, `dungeon(2)` (`#` comment in `creature_facade.py`), `treasure(5)`, `hoard(5)` (docstring 2 + method name 3 in `creature_util.py`), `such(4)`, `dungeon(1)` (`errors.py`). Commented-out code is read as prose: `# ordered = sorted(creatures, key=initiative_of)` gives `ordered(2)` and `key(2)` in `encounter_resolver.py`. Text inside the `#`-strings and the f-string is counted as string words (`neither(1)`, `still(1)`). The strings in `__all__` are counted (`domain/model/__init__.py`: creature(4), dice(2), such(1)).
- Which declaration forms are extracted (probe words in `encounter_edge_cases.py`, each a name used nowhere else in the project):

| Form | Probe | Found |
| --- | --- | --- |
| `for` variable, `async for` variable | wanderer, nomad | 3, 3 |
| comprehension variables (list, dict, set, generator, nested, async) | prowler, pace, swiftness, lurker, brute, dweller, den, drifter | 3 each |
| `match` captures (sequence, star, mapping) | vanguard, rearguard, kind | 3, 3, 7 |
| `except … as`, `except* … as` | mishap, blunders | 3, 3 |
| `with … as` (two items) | ledger, backup | 3, 3 |
| lambda parameters | straggler, laggard | 3, 3 |
| nested `def` names `outer_ring`, `inner_ring` | outer, inner, ring | 3, 3, 6 |
| `*raiders`, `**omens` | raiders, omens | 3, 3 |
| walrus target | headcount | 3 |
| untyped parameter with default `bounty=0` | bounty | 3 |
| typed parameter without default `tally: Dict[SpeedType, int]` | tally | 3 |
| class-level annotation without value `snare: int` | snare | 3 |
| module-level assignment `Brawler = TypeVar("Brawler", …)` | brawler | 4 (3 + string 1) |
| class and method names | ambush, trap, spring | 6, 3, 3 |
| local variables `spell`, `gewölbe`, parameter `rüstung`, `horde` | spell, gewölbe, rüstung, horde | 3 each |
| string `"cave"` | cave | 1 |
| typed parameter with default `hideout: str = "cave"`, `threshold: "int" = 3` | hideout, threshold | **absent** |
| keyword-only typed parameter with default `blessed: bool = False` | blessed | **absent** |
| attribute assignment `self.tripwire = True` | tripwire | **absent** |
| PEP 695 type parameter `def first_of[Champion]` | champion | **absent** |
| PEP 695 alias `type Bestiary = …` | bestiary | **absent** in this file (the 3 at the root come from `creature_window.pyw`) |
| import alias `speed as tempo` | tempo | absent (acceptable) |

  Identifier usages are not counted, only declarations: each probe is declared once and used once or twice, the count stays 3.
- Test file handling: included by default. `tests/test_creature_service.py` gives creature(6), creatures(6), walking(4), pytest(3), speed(3), stable(3), centaur(1); `test`, `should`, `save`, `mock` are absent. `--exclude-tests` leaves 45 files; the sum loses `pytest`, creature 140 -> 134, speed 60 -> 57, stable 10 -> 7, centaur 8 -> 7.
- `.pyw`: `creature_window.pyw` gives caption(6), creature(6), window(5), bestiary(3), show(3), title(3), console(2), shows(2), without(2), dragon(1). `.pyi`: omen, reader, portents, ominous are absent.

- German words. Word list of `zentaurenhöhle.py`: `dataclass(3), hle(3), rüstungsklasse(3), size(3), zentaurenhöhle(3), dem(2), die(2), geh(2), jeder(2), kreatur(2), liegt(2), ren(2), stungsklasse(2), trefferpunkte(2), und(2), unter(2), verlies(2), zentaurenh(2), der(1)`.
  - Present, 5 of 7: `zentaurenhöhle(3)` and `rüstungsklasse(3)`, both with the identifier weight only; `verlies(2)`, `trefferpunkte(2)`, `kreatur(2)` from the comment.
  - Absent: `größe` and `höhle`, which occur only in the string and the comment.
  - Umlauts cut words apart in comments and strings, not in identifiers: `Zentaurenhöhle` -> `zentaurenh` + `hle`, `Rüstungsklasse` -> `stungsklasse`, `gehören` -> `geh` + `ren`, `Höhle` -> `hle`, `Größe` -> nothing. Classification from the source: prose is tokenised with `\b[a-zA-Z]{3,}\b` (`SplitStage.WORD_PATTERN`), identifiers are split by case and keep every letter.
  - German stop words leak: `die(2)`, `unter(2)`, `dem(2)`, `und(2)`, `jeder(2)`, `liegt(2)`, `der(1)`. The resources hold only `english-stopwords.txt`. `zu` is absent (two letters, below the pattern's minimum of three).

## Changed since 2026-09-06
- No longer holds: the domain cc.json has no root or folder word lists. The earlier report read the 17 words from "the root node" and counted 56 nodes for 43 files; now there are 47 nodes for 47 files.
- No longer holds: leaf kinds are written in lower case (`class`, `function`, `variable`, `unknown`); the earlier report quotes `CLASS`, `FUNCTION`, `VARIABLE`, `UNKNOWN`. The set of kinds is the same: no `enum`, no `interface`, no re-export kind.
- New: the whole unified parser section (the earlier report had none), including the findings on old files: the `logic_complexity` point in the three `__init__.py` files with `__all__`, in `lair.py` and `stable.py`, and the parameter counts including `self` and type hints.
- New: `.pyw` is analysed by the domain parser only; `.pyi` by none; a POSIX locale drops `zentaurenhöhle.py` in all three parsers.
- Still holds after the port of the Python dependency extraction to the tree-sitter excavation site: 56 of the 61 expected file edges of rounds 1 and 2, with the same five missing (DTO `Creature` in `creature_facade.py`, `except ImportError` fallback in `encounter.py`, `importlib.import_module` in `speed_loader.py`, the string hints in `lair.py` and `stable.py`), 12 `isCyclic` and 2 `isPointingUpwards` flags, 5 test edges, `domain/model/__init__.py -> armor_class.py` not flagged cyclic, `variable` leaves for module-level assignments, `usage=usage` on every leaf edge. The `src/` layout still loses edges (then 51 -> 24, now 70 -> 43).
- Still holds for the domain parser: all 17 words, the same leaking decorator names and technical words, typed parameters with a default and `self.` attribute assignments not extracted, usages not counted, weights 3 / 2 / 1, the test file word list (identical to the earlier one). Counts grew with the new files (creature 100 -> 140, encounter 8 -> 13, entity 6 -> 9).

## Not verified
- macOS behaviour for the unicode file name (the runs were on Linux); only the POSIX-locale loss and the `C.UTF-8` success were observed.
- How `kind(7)` in `encounter_edge_cases.py` is composed (capture 3 + string key 1 leaves 3 unexplained).
- Whether the `.gitignore` warning already appeared on 2026-09-06.
- The scratch variants of the earlier report that edit round-1 files (module alias for the DTO, `except`-only import, unquoted hints without import) were not re-run, so its explanation "first matching import wins" for the DTO and the fallback edge is not re-confirmed; only the missing edges are.
- `long_parameter_list` in `repository.py` and `initiative.py` was not hand-counted.
- The per-function statistics are file aggregates; which function holds which value is inferred from the split run and from sums, not read from the output.

## Verdict

### Unified parser
- Wrong: parameter counts. Every identifier in a signature counts: `self` / `cls` (`Ambush` 3 / 1 / 1.62 instead of 2 / 0 / 0.75), type hints (`type_hints` 9 instead of 3, `defaults` 6 instead of 4, `every_parameter_kind` 9 instead of 7), return types, PEP 695 type parameters (`first_of` 5 instead of 1). `resolve` in `encounter_resolver.py` is reported with 12 instead of 5, `CreatureFacade.create` with 18 instead of 8, `is_empty(self) -> bool` with 2 instead of 0. `long_parameter_list` follows: 2 instead of 1 in `encounter_resolver.py`, 4 instead of 1 in `encounter_edge_cases.py`, and raised in `armor_class.py`, `creature.py`, `creature_service.py` without a function over 4 parameters.
- Wrong: a list literal adds 1 to `logic_complexity` and `complexity` (the metric mapping lists the node type `list`): `resolved: List[str] = []`, `[strongest]` and the `[int]` inside the type hint `Callable[[int], int]` in `encounter_resolver.py`; `__all__ = [...]` in three `__init__.py` files; `= []` in `lair.py` and `stable.py`.
- Wrong: `match`. `case _` counts as a case (`resolve`, `match_or_pattern`, `match_guard`), and nested sub-patterns count as further cases (`match_class_pattern` 9 instead of 4). **Decisions derived from Java: ignore — `case _` counts as a case.**
- Missing: `except*` is not counted (`exception_groups` 1 instead of 3).
- Wrong: per-function complexity leaves out the function itself, so a branch-free function has 0 (`encounter_resolver.py` minimum 0), while file-level `complexity` adds 1 per function. A nested `def` raises the per-function complexity of the file that holds it (`tracing.py` 1, `nested_def` 2). **Decision: ignore (derived from Java).**
- Wrong: lambdas. A lambda assigned to a name is a function in `number_of_functions` (`clamp` in `safe_roll`, `by_value` in `lambda_functions`), an inline lambda is not; both are booked as `logic_complexity`. **Decision: accept (derived from Java).**
- Bad: nested functions count in `number_of_functions` but the per-function statistics have fewer entries (`encounter_resolver.py`: 7 functions, means that fit 5). **Decision: accept (derived from Java).**
- Bad: `message_chains` counts calls separated by an attribute access as one chain (`chain_broken_by_attribute`).
- Bad: `.pyw` is not analysed (named in the log), although it is ordinary Python source (`creature_window.pyw`).
- Bad: with a POSIX locale `zentaurenhöhle.py` vanishes from the result without a message. **Decision: accept (derived from Java).**
- Good: `loc`, `rloc`, `comment_lines` in the three new files and all 54 split files, including docstrings in three syntaxes, bare strings as block comments, `#` in strings and f-strings, multi-line string values, `#:`, `##`, bare `#` and trailing comments. `if` / `elif`, `for … else`, `while … else`, conditional expressions, `and` / `or`, comprehensions with nested `for` and `if`, `try` / `except`, `async for`, walrus, guards, generators, decorators, `long_method`, `excessive_comments`, the count of `def`s including nested, async and class methods, untyped `*args` / `**kwargs` / keyword-only / positional-only parameters. Unicode identifiers and file names with a UTF-8 locale.

### Dependency parser
- Missing: `.pyw` files are not analysed and nothing says so (`creature_window.pyw`, 2 edges).
- Wrong: `application/creature_facade.py` imports `Creature` from the domain and `Creature as CreatureDto` from the DTO package; only the domain edge exists, `application/dto/creature.py` has no incoming edge from the facade. **Decision: accept (derived from Java).**
- Wrong: the `src/` layout variant keeps 43 of 70 edges and no cycle or upward flag.
- Missing: string type hints: `"Creature"` in `domain/service/lair.py`, `typing.List["Centaur"]` in `domain/service/stable.py`.
- Missing: the `except ImportError:` fallback import in `application/encounter.py` (-> `fallback_dice.py`).
- Missing: module-level statements carry no usages in `encounter_edge_cases.py`: `Brawler = TypeVar("Brawler", bound=Fightable)` gives no edge to `fightable.py`, PEP 695 `type Bestiary = list[CreatureType]` gives no edge to `creature_type.py` and no leaf.
- Missing: `importlib.import_module("de.sots.cellarsandcentaurs.domain.model.speed")` in `application/speed_loader.py`.
- Wrong: `domain/model/__init__.py -> armor_class.py` is not flagged `isCyclic` although `armor_class.py -> creature_util.py -> domain/model/__init__.py` is.
- Bad: module-level assignments become `variable` leaves (`logger`, `__all__`, `T`, `MAX_HIT_POINTS`, `USE_NATURAL_ARMOR`, `speed_module`, `Brawler`) with intra-file leaf edges; `Enum` subclasses and ABCs are plain `class`, `__init__.py` re-exports are `unknown`; every leaf edge has `usage=usage`.
- Bad: with a POSIX locale `zentaurenhöhle.py` and its edges vanish without a message. `.pyi` is skipped silently (`omen_reader.pyi`). **Decisions derived from Java: accept — file dropped under a POSIX locale.**
- Good: 70 of 77 expected `.py` edges, no false positive. In the new files: unicode module path and class name (`zentaurenhöhle.py`), class pattern in `match`, `isinstance`, `except` clause, function-local import, annotation-only local, return annotation, subscript annotation, from-import of a module with alias, all three edges of `encounter_resolver.py`. Tests skipped by default and exactly 5 edges with `--include-tests`. Main cycle and both upward edges flagged; unused import, stdlib and third party never appear.

### Domain language parser
- Wrong: umlauts cut words in comments and strings of `zentaurenhöhle.py` (`zentaurenh` + `hle`, `stungsklasse`, `geh` + `ren`); `größe` and `höhle` from `"Größe der Höhle"` do not appear. Identifiers with umlauts are kept whole, so `zentaurenhöhle` and `zentaurenh` / `hle` stand side by side. **Decision: accept (derived from Java).**
- Missing: German stop words; `die`, `unter`, `dem`, `und`, `jeder`, `liegt`, `der` are counted (`zentaurenhöhle.py`). **Decision: ignore (derived from Java).**
- Missing: typed parameters with a default value (`hideout: str = "cave"`, `blessed: bool = False`, `threshold: "int" = 3` in `encounter_edge_cases.py`), `self.` attribute assignments (`self.tripwire`), PEP 695 type parameters and `type` aliases (`Champion`, `Bestiary`).
- Wrong: stdlib decorator and helper names count as domain words: `dataclass(21)`, `abstractmethod(12)`, `functools(9)`, `logger(9)`, `classmethod(6)`, `property(6)`, `args(3)`, `kwargs(3)`, `wrapper(3)`.
- Bad: commented-out code is counted as comment prose (`ordered`, `key` in `encounter_resolver.py`). **Decision: ignore (derived from Java).**
- Bad: `value(36)`, `key(11)`, `repository(9)`, `entity(9)`, `item(9)`, `facade(4)` pass the MODERATE list; the numeric token `20(9)`; singular and plural are separate words (`creature` 140, `creatures` 52). **Decision: ignore (derived from Java).**
- Bad: no root or folder word list in the cc.json; `.pyi` skipped without a message; with a POSIX locale `zentaurenhöhle.py` vanishes without a message. **Decisions derived from Java: accept — file dropped under a POSIX locale; ignore — no root or folder word list.**
- Good: all 17 expected words; no Python keyword or builtin leaks; all seven identifier forms split correctly and unicode identifiers stay whole; loop, comprehension, `match` capture, `except … as`, `with … as`, lambda, walrus, `*` / `**` and nested-function names are extracted; docstrings in all three syntaxes and bare block-comment strings count with the comment weight; `.pyw` is analysed; tests included by default and removable with `--exclude-tests`.
