# Training projects

One small "Cellars and Centaurs" project per language, used to check what the `dependencyparser` and the
`domainlanguageparser` of CodeCharta find in each language. The projects do not need to compile. They are
modelled on `Ideas/DC/DependaCharta/exampleProjects/*` and share one domain model so that results are
comparable across languages.

This folder is excluded from Biome and Sonar.

## Layout

```
training/
  README.md                 this spec
  tools/dump_lenses.py      prints the dependency and domain lens of a cc.json as plain text
  <language>/
    FINDINGS.md             report for that language (template below)
    output/dependency.cc.json
    output/domain.cc.json
    <project files in the language's conventional layout>
```

Language folders: `abl`, `bash`, `c`, `cpp`, `csharp`, `delphi`, `go`, `java`, `javascript`, `kotlin`,
`objectivec`, `php`, `python`, `ruby`, `rust`, `swift`, `typescript`, `vue`.

| Parser | Languages |
| --- | --- |
| `dependencyparser` | php, csharp, typescript (+tsx), javascript, java, go, python, c and cpp (one C++ grammar), kotlin, vue, delphi, rust |
| `domainlanguageparser` | kotlin, typescript, javascript, java, python, csharp, go, c, cpp, php, ruby, swift, bash, objectivec, vue, abl, rust |

## The shared domain model

Root namespace `de.sots.cellarsandcentaurs` (where the language has namespaces or packages), four layers
as sub-packages / folders. Use the language's conventional file and identifier casing.

| Layer | Declarations |
| --- | --- |
| `domain/model` | `Creature` (implements `Fightable`), `CreatureId`, `CreatureType` (enum: monstrosity, beast, aberration, celestial, dragon, fiend, humanoid, undead), `ArmorClass`, `HitPoints`, `Speed`, `SpeedType` (enum: walking, flying, swimming, burrowing, climbing), `Fightable` (interface), `NoSuchCreatureException` |
| `domain/model` (stress) | `Centaur` extends `Creature`; `Dice` file holding two declarations `Dice` and `DiceRoll` plus a free function `rollD20` (where the language allows it) |
| `domain/service` | `Creatures` (interface / port), `CreatureService` |
| `adapter/persistence` | `CreatureEntity`, `CreatureRepository` (generic `Repository<T>` base where the language has generics), `PersistedCreatures` implements `Creatures` |
| `application` | `CreatureFacade`, `CreatureUtil`, a barrel / re-export module where the language has one (`index.ts`, `__init__.py`, `mod.rs`, ...) |
| `application/dto` (stress) | `Creature` DTO: same simple name as the domain `Creature`, different package |

Keep the semantics of the DependaCharta examples: the facade creates a creature with speeds for all speed
types, hit points and armor class and saves it through the service; `PersistedCreatures` maps entities to
domain objects and throws `NoSuchCreatureException` when an id is unknown.

## Stress constructs for the dependency parser

Add every construct the language supports and note in FINDINGS.md which ones it does not have.

1. Aliased import (`import { CreatureEntity as Entity }`, `use ... as`, `import x as y`, ...), in `CreatureRepository`.
2. Wildcard / namespace import (`import ...model.*`, `import * as model`, `use model::*`, `using namespace`), in `CreatureUtil`.
3. Re-export / barrel module in `application` that the persistence adapter imports from (the deliberate upward dependency and the cycle `Creature -> CreatureFacade -> CreatureService -> Creature` from the TypeScript example).
4. Inheritance (`Centaur extends Creature`) and interface implementation (`Creature implements Fightable`, `PersistedCreatures implements Creatures`).
5. Generic base class or generic function (`Repository<T>`), used by `CreatureRepository`.
6. A type used only in a type position (parameter / return / field type), a type only instantiated (`new`), a type only used through a static member (`CreatureFacade.STANDARD_CREATURE_TYPE`), and a type only referenced in an annotation / attribute / decorator where the language has them.
7. Two declarations with the same simple name in different packages (`domain.model.Creature` and `application.dto.Creature`) both used from `CreatureFacade`.
8. A fully qualified reference without an import, where the language allows it (`de.sots.cellarsandcentaurs.domain.model.Speed` in Java).
9. An unused import (`Fightable` imported in `CreatureUtil` and never used).
10. Standard library and third-party usage (`UUID`, `Map`, `List`, a logging library) that must not appear as internal edges.
11. A test file (`CreatureServiceTest` or the language's naming convention) that references `CreatureService`. The dependency parser skips tests by default and the domain parser includes them by default.
12. Multiple declarations in one file (`Dice` and `DiceRoll`) and a file whose name differs from the declaration it holds.

## Stress content for the domain language parser

Place these texts verbatim (in the language's comment / string syntax) so word counts are comparable:

| Where | Text |
| --- | --- |
| Doc comment on `Creature` | `A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.` |
| Doc comment on `HitPoints` | `Hit points drop when the creature takes damage and recover when it rests in its lair.` |
| Line comment in `CreatureFacade.create` | `Rolls initiative for every creature in the dungeon before the encounter starts.` |
| Block comment in `CreatureUtil` | `Counts the treasure hoard a creature guards.` |
| String literal in `NoSuchCreatureException` | `No such creature in the dungeon: ` |
| String literal in `CreatureFacade` | `centaur-stable` (a hyphenated identifier inside a string) |
| Test file | method name `should_save_creature_to_the_stable` (or the language's idiom) |

Identifier forms to use somewhere in the project, so identifier splitting can be judged:

| Form | Identifier |
| --- | --- |
| camelCase | `walkingSpeed` |
| snake_case | `walking_speed` (in a language that uses camelCase, put it in the test file) |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` |
| PascalCase | `ArmorClass` |
| Acronym | `XPValue` / `xp_value` |
| Digit | `d20Roll` |
| Kebab in string | `centaur-stable` |

Expected domain words (must appear in the root node's word list): creature, centaur, cellar, dungeon, armor,
hit, points, speed, damage, lair, initiative, encounter, treasure, hoard, stable, dice, roll.

Words that must not appear: language keywords (`class`, `public`, `def`, `func`, `fn`, `let`, `var`,
`string`, `int`, `override`, ...) and the technical stop words at the default level `MODERATE` (`util`,
`facade`?, `entity`, `repository`, `exception`, `test`, `mock`, ...). Report which of these leak through and
say whether that is right or wrong for the language.

## How to run

The built CLI is `analysis/build/install/codecharta-analysis/bin/ccsh`. Both parsers need absolute paths,
so the commands below derive them from the repository root and work from any directory. Do not rebuild the
CLI and do not change anything under `analysis/` or `visualization/`.

```bash
REPO=$(git rev-parse --show-toplevel)
CCSH="$REPO/analysis/build/install/codecharta-analysis/bin/ccsh"
LANG_DIR="$REPO/training/<language>"
mkdir -p "$LANG_DIR/output"
"$CCSH" dependencyparser -nc "$LANG_DIR" -e "output,FINDINGS.md" -o "$LANG_DIR/output/dependency.cc.json"
"$CCSH" dependencyparser -nc "$LANG_DIR" -e "output,FINDINGS.md" --include-tests -o "$LANG_DIR/output/dependency-with-tests.cc.json"
"$CCSH" domainlanguageparser -nc "$LANG_DIR" -e "output,FINDINGS.md" -o "$LANG_DIR/output/domain.cc.json"
python3 "$REPO/training/tools/dump_lenses.py" "$LANG_DIR/output/dependency.cc.json"
python3 "$REPO/training/tools/dump_lenses.py" "$LANG_DIR/output/domain.cc.json" --words 40
```

Options worth a second run when judging a finding: `--verbose` on both parsers, `--stop-word-level MINIMAL`
/ `AGGRESSIVE`, `--no-technical-stopwords`, `--ngrams 2`, `--exclude-tests` on the domain parser.

The `.cc.json` uses API version 2.0: `files` holds the tree, `lenses.dependency.edges` the file-level edges
(with `isCyclic` and `isPointingUpwards` flags), `lenses.dependency.leaves` / `leafEdges` the
declaration-level graph, `lenses.metrics.attributes` the per-file `incoming_dependencies` /
`outgoing_dependencies`, and `lenses.domain.nodes` the word list per file and folder.

## FINDINGS.md template

```markdown
# <Language>

## Project
- layout, file count, which stress constructs exist in the language and which do not

## Dependency parser
- command(s) and whether they ran without error
- table: construct | expected edge(s) | found | verdict (ok / missing / wrong / extra)
- false positives (edges that should not exist), cycles and upward edges: expected vs. reported
- leaf kinds (CLASS, INTERFACE, ENUM, REEXPORT, ...): right or wrong
- what the language offers natively (module system, namespaces) and what CodeCharta has to resolve itself

## Domain language parser
- command(s) and whether they ran without error
- expected words: which of the 17 appear at the root node, with frequency
- keyword and technical-word leakage: which appear, and whether that is right
- identifier splitting: table form | identifier | words found
- comments and strings: are the planted sentences counted, are weights visible
- test file handling

## Verdict
- Good: ...
- Wrong: ... (most important first, with the file and the exact construct)
- Missing: ...
```
