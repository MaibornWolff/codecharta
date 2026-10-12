# OpenEdge ABL (Progress)

> **Decision (2026-10-08): ABL support is dropped completely.** No finding in this report is to be fixed; the
> per-finding decisions further down are superseded by this one.

Report of 2026-10-08 (round 3). It replaces the report of 2026-09-06; every claim below was checked against the
output of this run. `M` = `src/de/sots/cellarsandcentaurs`, `S` = `M/domain/service`.

## Project
- Layout: `M/{domain/model,domain/service,adapter/persistence,adapter/ui,application,application/dto}`, `src/include`
  and `test/de/sots/cellarsandcentaurs/domain/service/CreatureServiceTest.cls`. ABL packages map to directories, one
  class per `.cls`, procedures in lower-case `.p`, one AppBuilder window `.w`, includes in `.i`.
  31 source files: 22 `.cls`, 6 `.p`, 1 `.w`, 2 `.i`.
- Round 3 files: `S/EncounterResolver.cls`, `S/EncounterEdgeCases.cls` (class constructs), `S/encounteredgecases.p`
  (constructs that only exist in procedure files), `M/domain/model/Zentaurenhöhle.cls` (German words, umlauts in file
  name, class name and property name), `src/include/ttencounter.i` (a temp-table include, used by both edge-case
  files). `git check-ignore -v` reports none of them as ignored.
- Extension variants: every extension a parser lists for ABL is present (`.p`, `.cls`, `.w`, `.i`); no further file
  was needed.
- Stress constructs present (rounds 1 and 2, unchanged): wildcard `USING ...model.*`, unused `USING ...Fightable`,
  `INHERITS` / `IMPLEMENTS`, static member access, type-position-only and `NEW`-only use, fully qualified reference
  without `USING`, same simple name `Creature` in two packages, stdlib usage (`Progress.Lang.*`, `OpenEdge.Core.*`),
  the upward cycle through `CreatureFacade`, `RUN file.p [PERSISTENT]`, `{include.i}`, super procedures, `CAST`,
  `TYPE-OF`, `Progress.Lang.Class:GetClass("...")`, a preprocessor-defined type name, ABLUnit `@Test.` annotations.
- Not applicable in ABL: aliased import (`USING` has no `AS`), user-defined generic classes, barrel / re-export
  module, a type referenced only in an annotation, lambdas / closures, nested functions, optional chaining,
  comprehensions, generators, `async` / `await`, operator overloads, extension functions, default and variadic
  parameters, `goto`, fallthrough. `EncounterResolver` therefore has the `if` of the lambda directly in `SafeRoll`
  and no nested function in `InitiativeOrder`; its `try` is the method block with `CATCH` and `FINALLY`, its `for`
  is `DO i = 1 TO n`, its `while` is `DO WHILE`, its `switch` is `CASE` / `WHEN` / `OTHERWISE`, its ternary is the
  `IF ... THEN ... ELSE` expression.

All commands were run as in the README. One addition was needed: `LC_ALL=C.UTF-8`. With an unset locale (POSIX) the
JVM does not see `Zentaurenhöhle.cls` at all: the unified parser reports 30 instead of 31 ignored files and the domain
parser processes 28 instead of 29 files, without any warning (`output/domain-posix-locale.cc.json`). This depends on
the environment (Linux sandbox); not verified on macOS.

## Dependency parser
- `dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md"` and the same with `--include-tests` and `--verbose`:
  exit 0. stderr: `No supported source files found under .../sample-projects/abl` and `No analyzable declarations
  were found, so the dependency lens stays empty. ...`. The output holds one `root` folder, no file nodes,
  `lenses.dependency.edges` is `[]`, no `leaves`, no `leafEdges`, no metric attributes. There is no ABL analyzer
  under `analysis/analysers/parsers/DependencyParser/.../analysis/analyzers/`.
- File edges: expected 67 without tests and 75 with tests, found 0 and 0. "found" is `no` for every row.

| from | expected edge(s) | found |
| --- | --- | --- |
| M/domain/model/Creature.cls | CreatureId, CreatureType, ArmorClass, HitPoints, Speed, SpeedType, Fightable, application/CreatureFacade.cls (upward, cyclic) | no |
| M/domain/model/ArmorClass.cls | application/CreatureUtil.cls (upward) | no |
| M/domain/model/NoSuchCreatureException.cls | model/CreatureId.cls | no |
| M/domain/model/Centaur.cls | model/Creature.cls, CreatureId.cls, CreatureType.cls | no |
| M/domain/model/Speed.cls | src/include/constants.i (`{include/constants.i}`) | no |
| M/domain/model/dice.p | src/include/constants.i | no |
| M/domain/service/Creatures.cls | model/Creature.cls, model/CreatureId.cls | no |
| M/domain/service/CreatureService.cls | model/Creature.cls, service/Creatures.cls, model/Fightable.cls (`TYPE-OF`) | no |
| M/domain/service/creaturerules.p | model/Speed.cls (`&SCOPED-DEFINE SPEED-CLASS` + `AS {&SPEED-CLASS}`) | no |
| M/adapter/persistence/CreatureRepository.cls | persistence/CreatureEntity.cls | no |
| M/adapter/persistence/PersistedCreatures.cls | CreatureRepository, CreatureEntity, service/Creatures, model/Creature, CreatureId, NoSuchCreatureException, application/CreatureFacade.cls (upward) | no |
| M/application/CreatureFacade.cls | service/CreatureService, model/Creature, CreatureId, CreatureType, HitPoints, Speed, SpeedType, ArmorClass, application/dto/Creature.cls (fully qualified), model/Centaur.cls (`GetClass("...")` string) | no |
| M/application/CreatureUtil.cls | model/Creature, Speed, SpeedType (wildcard USING), model/Centaur.cls (`CAST`) | no |
| M/application/creaturestable.p | CreatureFacade, CreatureService, PersistedCreatures, CreatureRepository, model/Creature, CreatureType, Speed, ArmorClass, model/dice.p (RUN), adapter/ui/creaturebrowser.w (RUN) | no |
| M/application/encounter.p | model/dice.p (`RUN dice.p PERSISTENT`), service/creaturerules.p (super procedure) | no |
| M/application/startup.p | service/creaturerules.p, application/encounter.p | no |
| M/adapter/ui/creaturebrowser.w | model/Creature.cls, SpeedType.cls, dice.p (RUN), Centaur.cls (`AS CLASS Centaur`, no USING) | no |
| test/.../CreatureServiceTest.cls (tests only) | CreatureService, PersistedCreatures, CreatureRepository, model/Speed, Creature, CreatureId, CreatureType, SpeedType | no |
| (round 3) S/EncounterResolver.cls | model/Creature.cls (`USING` + `AS Creature`); `DYNAMIC-FUNCTION("rollD20" IN pDice)` names no file: no edge | no |
| (round 3) S/EncounterEdgeCases.cls | model/Creature.cls (`AS Creature`, `List<Creature>`), model/HitPoints.cls (`USING` + fully qualified `NEW`), src/include/ttencounter.i (`{include/ttencounter.i}` inside the class body) | no |
| (round 3) S/encounteredgecases.p | src/include/ttencounter.i (`{include/ttencounter.i &ACCESS-MODE=PRIVATE}`), model/dice.p (`RUN ... PERSISTENT SET hDice`); `RUN VALUE(cRitualProgram)` and `PUBLISH` / `SUBSCRIBE` name no file: no edge | no |
| (round 3) Zentaurenhöhle.cls, ttencounter.i | none | - |

- False positives: none (no edges at all). Cycles and upward edges: expected the cycle `Creature -> CreatureFacade ->
  CreatureService -> Creatures -> Creature` and the upward edges `Creature -> CreatureFacade`, `ArmorClass ->
  CreatureUtil`, `PersistedCreatures -> CreatureFacade`; reported none.
- Leaf kinds: expected CLASS, INTERFACE (`Fightable`, `Creatures`), ENUM (`CreatureType`, `SpeedType`); reported
  none. Procedure files would need kinds for temp-table, function and internal procedure.
- What the language offers: packages are directories resolved through PROPATH (a search path), `USING package.Class`
  and `USING package.*`, includes and `RUN` targets are PROPATH-relative paths. CodeCharta would have to map packages
  to directories itself, index simple class names project-wide and expand `{&NAME}` preprocessor references.

## Unified parser
- `unifiedparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/unified.cc.json`: exit 0. stderr: `31 Files with the
  following extensions were ignored as they are currently not supported: [.p, .cls, .w, .i]` and `No files with
  specified file extension(s) were found within the given folder - generating empty output file!`. The output holds
  one `root` folder, no file nodes and no metric attributes. No file of any extension was analysed, including
  `Zentaurenhöhle.cls`.
- Classification: `AvailableCollectors.kt` of the unified parser has no ABL entry, although the tree-sitter library
  ships one (`treeSitterExcavationSite/.../languages/abl/AblMetricMapping.kt`, registered in `LanguageRegistry.kt`
  with the extensions `.p .cls .w .i`). The domain parser uses that grammar; the unified parser does not offer it.
- `EncounterResolver` (`S/EncounterResolver.cls`), expected values written before the run:

| metric | expected | reported | verdict |
| --- | --- | --- | --- |
| loc | 98 | - | missing |
| rloc | 68 | - | missing |
| comment_lines | 13 | - | missing |
| number_of_functions | 5 | - | missing |
| logic_complexity | 13 | - | missing |
| complexity | 18 | - | missing |
| complexity per function (Resolve 12, Describe 1, SafeRoll 3, InitiativeOrder 1, IsEmpty 1) | max 12, min 1, mean 3.6, median 1 | - | missing |
| parameters per function (5, 1, 1, 1, 0) | max 5, min 0, mean 1.6, median 1 | - | missing |
| rloc per function (29, 5, 10, 3, 1) | max 29, min 1, mean 9.6, median 5 | - | missing |
| long_method | 1 | - | missing |
| long_parameter_list | 1 | - | missing |
| message_chains | 1 | - | missing |
| excessive_comments | 1 | - | missing |

  Complexity is 18 and not 19 as in a language with lambdas: the lambda of `safeRoll` does not exist in ABL.
- `EncounterEdgeCases` (`S/EncounterEdgeCases.cls`), expected per construct; reported is `-` (missing) for all:

| construct (method) | expected complexity | note |
| --- | --- | --- |
| property accessor bodies `GET():` / `SET(...):` (`Morale`) | 2 / 1 | two functions; GET holds an `IF` |
| `CONSTRUCTOR STATIC`, `CONSTRUCTOR PUBLIC ()`, `CONSTRUCTOR PUBLIC (1)` | 1 / 1 / 1 | three functions, overloads |
| `DESTRUCTOR PUBLIC` | 2 | a function with an `IF` |
| event handler `OnAmbushSprung` (subscribed with `AmbushSprung:Subscribe`) | 2 | the ABL substitute for a callback |
| `REPEAT:` with `LEAVE` (`RepeatLoop`) | 3 | loop + `IF` |
| `IF ... THEN DO: END. ELSE DO: END.` (`IfThenDoElseDo`) | 2 | a plain `DO:` block is not a loop |
| `DO TRANSACTION ON ERROR UNDO, LEAVE:` (`TransactionBlock`) | 1 | not a loop |
| `DO i = 10 TO 1 BY -1 WHILE cond:` (`DoToByWhile`) | 2 | one loop |
| `FOR EACH ... WHERE a AND b BY ...` (`ForEachWhere`) | 3 | loop + `AND` in the `WHERE` |
| `FOR FIRST ... WHERE` (`ForFirst`) | 2 | counted as a loop (runs at most once) |
| `OPEN QUERY ... FOR EACH` + `DO WHILE NOT QUERY-OFF-END` (`QueryLoop`) | 2 | the `FOR EACH` of `OPEN QUERY` is not a loop |
| labelled block with `NEXT label` / `LEAVE label` (`LabelledLeave`) | 5 | two loops, two `IF`; 12 rloc = the long method |
| `WHEN "a" OR WHEN "b" THEN` (`CaseOrWhen`) | 4 | three case labels, `OTHERWISE` not counted |
| nested `IF` expression (`NestedIfExpression`) | 3 | two conditional expressions |
| `a AND (b OR c) AND NOT d` (`AndOrNot`) | 4 | |
| lower-case keywords `if a and b then` (`LowerCaseKeywords`) | 3 | ABL is case-insensitive |
| mixed-case keywords `If a And b Or c Then` (`MixedCaseKeywords`) | 4 | |
| `ASSIGN x = 5 WHEN cond.` (`AssignWhen`) | 2 | guarded assignment, counted like an `if` |
| two `CATCH` blocks + `FINALLY` (`CatchTwice`) | 3 | |
| `NO-ERROR` + `IF ERROR-STATUS:ERROR` + `UNDO, THROW` (`NoErrorCheck`) | 2 | |
| `&IF ... &THEN ... &ELSEIF ... &ELSE ... &ENDIF`, `{&MAX-ROUNDS}` (`PreprocessorBranch`) | 1 | compile-time branches |
| `INPUT`, `OUTPUT`, `INPUT-OUTPUT`, `TABLE`, `BUFFER` parameters (`ParameterModes`) | 1 | 5 parameters = the long parameter list |
| parameter without mode (`ImplicitInput`) | 1 | 1 parameter |
| overloads `Heal()` / `Heal(INPUT)` | 1 / 1 | two functions |
| `METHOD PUBLIC STATIC FINAL` (`StaticFinal`) | 1 | |
| comment markers and keywords inside `"..."`, `'...'`, `~"` escape, `:U` (`CommentMarkersInStrings`) | 1 | 0 comment lines |
| string over three lines holding `IF`, `AND`, `//` (`MultiLineString`) | 1 | 3 rloc, 0 comment lines |
| nested comment `/* /* */ */` over 3 lines and as trailing comment (`NestedComment`) | 1 | 4 comment lines |
| ABLDoc `/** ... @param ... */` (`AblDocComment`) | 1 | 5 comment lines |
| five property accesses, no call (`PropertyChain`) | 1 | no message chain |
| exactly four calls (`CallChainFour`) | 1 | one message chain |
| handle attributes `SESSION:FIRST-PROCEDURE:NEXT-SIBLING:PRIVATE-DATA` (`HandleChain`) | 1 | no message chain |
| `VAR INTEGER a = 2, b.` and `+=` (`VarStatement`) | 1 | |
| `DEF VAR ... AS INT`, `INIT` (`AbbreviatedKeywords`) | 1 | |
| `List<Creature>` (`GenericCollection`) | 1 | |
| `DYNAMIC-NEW`, `DYNAMIC-INVOKE`, qualified return type (`DynamicTypes`) | 1 | |

  File totals expected: loc 296, rloc 237, comment_lines 13, number_of_functions 40, logic_complexity 32,
  complexity 72, long_method 1, long_parameter_list 1, message_chains 1, excessive_comments 1.
- `S/encounteredgecases.p`, expected: loc 63, rloc 47, comment_lines 4, number_of_functions 3 (`criticalDamage`,
  `startAmbush`, `onAmbushSprung`; `FUNCTION ... FORWARD`, `FUNCTION ... IN hDice` and `PROCEDURE ... EXTERNAL` are
  declarations), logic_complexity 6 (`IF` in the `ON CHOOSE` trigger, `REPEAT`, `IF`, `OR`, `IF` expression, `IF`),
  complexity 10 (3 functions + the anonymous trigger block), parameters 1 / 3 / 1 (`DEFINE INPUT PARAMETER`
  statements inside the procedure). Reported: nothing.
- Line counting, functions, parameter counts in the other files: nothing is reported for any file.
- Not verifiable without ABL being wired into the unified parser; read from `AblMetricMapping.kt` only: `do_block`
  is mapped to logic complexity without a condition (the plain `DO:` blocks of `IfThenDoElseDo` and
  `TransactionBlock` would count), `case_statement` and `case_otherwise_clause` are both mapped (`Resolve` would get
  5 instead of 3 for its `CASE`), `binary_expression` only accepts the spellings `AND`, `OR`, `and`, `or`
  (`MixedCaseKeywords` would lose 2), and there is no entry for destructors, property accessors or `ON` triggers.

## Domain language parser
- Commands (`LC_ALL=C.UTF-8`, logs in `output/*.stderr.log`, word lists in `output/*.dump.txt`):
  - `domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json`: exit 0, `29 files
    processed`, 29 nodes. The two `.i` files are not scanned (`Language.kt` lists `p`, `cls`, `w`).
  - `--verbose`: exit 0, no additional output. `--stop-word-level MINIMAL` / `AGGRESSIVE`, `--no-technical-stopwords`,
    `--ngrams 2`, `--comment-weight 3`, `--string-weight 3`: exit 0. `--exclude-tests`: exit 0, 28 files.
  - `--comment-weight 0`: exit 1, `IllegalArgumentException: --comment-weight must be positive, got 0`.
- The lens holds file nodes only, with `frequency` and `tfidf` per word. There is no root node and no folder node,
  so "must appear in the root node's word list" cannot be read from the output; the numbers below are the sums over
  the 29 file nodes.
- Expected words: all 17 appear. creature(110), speed(66), roll(43), encounter(36), damage(33), dice(26), armor(25),
  hit(22), initiative(20), points(19), stable(16), centaur(13), cellar(11), dungeon(5), treasure(5), lair(2), hoard(2).
- Weights observed: identifier 3, comment 2, string 1 (`--comment-weight 3` moves `roams`, `lair`, `basilisk` from 2
  to 3; `--string-weight 3` moves `swamp`, `gargoyle`, `mellon` from 1 to 3).
- Expected words of the new files, expected before the run:

| file | found | not found |
| --- | --- | --- |
| EncounterResolver.cls | resolve, attacker, defender, roll, bonus, terrain, damage, speed, remaining, creature, health, armor, safe, dice, initiative, order, rank, empty, swamp, cave, stable; encounter(4) and resolver(2) from comments only | describe (`describe` is in `english-stopwords.txt`, listed as BDD terminology); the class name as an identifier |
| EncounterEdgeCases.cls | morale, ambush, sprung, torch, potion, arrow, quiver, wound, goblin, smite, rune, gold, silver, copper, scroll, lantern, password, mellon, patrol, summoned, gargoyle, portcullis, basilisk, bow, sling, lance | mimic, wraith (`VAR INTEGER iMimic = 2, iWraith.`) |
| encounteredgecases.p | hit, point, pool, trap, damage, total, ritual, ambush, critical, remote, location, ticks, crypt, goblin | - |
| ttencounter.i | - | ambusher, rounds (file not scanned; `ambusher(3)` in the two edge-case files comes from the parameters `pAmbusher`) |
| Zentaurenhöhle.cls | see German words | |

- What is extracted, checked with one-line probe files outside the project: names of variables (`DEFINE VARIABLE`
  and `DEF VAR`), parameters, properties, methods, constructors, procedures, functions, temp-tables, enum members,
  `CATCH` variables, the record of `FOR EACH` / `FOR FIRST`, the table of an `INPUT TABLE` parameter, and an
  unqualified class name. Not extracted: a qualified class or interface name, type references (`AS Creature`,
  `INHERITS`, `IMPLEMENTS`, `List<Creature>`), every usage (`oCreature:SetSpeed(40)`, `NEW`, `RUN`, `CAST`,
  `TYPE-OF`), `USING`, `{include.i}`, `&SCOPED-DEFINE` / `&GLOBAL-DEFINE` names and `{&NAME}` references.
- Keyword and technical-word leakage at MODERATE:
  - ABL statement keywords in code do not leak. They leak from comments and from identifiers, because
    `abl-keywords.txt` only lists framework terms (`Progress`, `AppError`, `Json`, `Method`, ...): `assign(5)` (2 from
    the commented-out line `// ASSIGN iRemaining = iRemaining * 2.` in EncounterResolver.cls), `end(2)` (comment in
    EncounterEdgeCases.cls), and `repeat`, `case`, `while`, `each`, `else`, `catch`, `var`, `static`, `final`, `input`,
    `leave`, `query`, `transaction` (3 each, from the edge-case method names such as `RepeatLoop`). Leaking from a
    method name is right; `assign` from commented-out code is noise.
  - `param(2)` and `return(2)` come from the ABLDoc tags `@param` / `@return` in EncounterEdgeCases.cls: wrong.
  - `de(6)`: first package segment of `ENUM de.sots....CreatureType:` and `...SpeedType:`: wrong.
  - `app(3)` from `INHERITS AppError` in NoSuchCreatureException.cls: the list holds `AppError`, the filter runs
    after splitting, only `error` is removed: wrong.
  - `tt(12)` (`ttSpeed`, `ttCreature`, `ttEncounter`), `fi(6)` (`fiCreatureId`, `fiWalkingSpeed`): two-letter ABL
    prefixes leak; one-letter prefixes (`p`, `i`, `c`, `o`, `h`, `e`, `b`) are dropped.
  - Header template words: `file(20)`, `purpose(20)`, `cls(8)`, `connected(2)`, `databases(2)`, and the file's own
    name split into words (`creaturestable(2)`, `encounteredgecases(2)`).
  - Architecture words that stay at MODERATE: `type(21)`, `entity(12)`, `repository(9)`, `facade(9)`, `value(9)`,
    `description(9)`, `standard(6)`, `dto(3)`, `persisted(3)`, `init(3)`, `info(2)`. AGGRESSIVE removes `type`,
    `types`, `entity`, `repository`, `facade`, `value`, `dto`, `init`, `info`, `model`, `param`, `call`, `handle`,
    `start` and nothing else. MINIMAL adds `save(15)`, `service(12)`, `base(9)`, `find(9)`, `create(6)`, `get(6)`,
    `set(6)`, `exception(3)`, `index(3)`; `--no-technical-stopwords` adds the same plus `name(19)`, `temporary(6)`.
  - Others: `id(45)`, `one(11)`, `such(4)`, `up(3)` (`setUp`), `20(3)`, `ididid(1)` (the string `"ididid"` in
    CreatureEntity.cls), `sots(1)`, `cellarsandcentaurs(1)`, `domain(1)`, `model(1)` (the dotted class name in the
    `GetClass("...")` string in CreatureFacade.cls).
- Identifier splitting:

| form | identifier | words found |
| --- | --- | --- |
| camelCase | `walkingSpeed` (CreatureFacade.cls) | walking, speed |
| snake_case | `walking_speed` (CreatureServiceTest.cls) | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` (HitPoints.cls) | max, hit, points |
| PascalCase | `ArmorClass` | armor, class |
| Acronym | `XPValue` (Creature.cls) | xp, value |
| Digit | `d20Roll` (dice.p) | `20`, roll: the `d` is dropped, the bare number becomes a word |
| Digit (other side) | `rollD20` (dice.p) | roll, d20 |
| Kebab in string | `"centaur-stable"` (CreatureFacade.cls) | centaur, stable |
| Hyphenated ABL name | `hit-point-pool`, `trap-damage-total` (encounteredgecases.p) | hit, point, pool / trap, damage, total |
| Prefix convention | `ttSpeed`, `fiCreatureId` | tt, speed / fi, creature, id |
| Umlaut identifier | `rüstungsklasse` (Zentaurenhöhle.cls) | rüstungsklasse |
| Qualified class header | `CLASS de.sots.cellarsandcentaurs.domain.model.Creature` | nothing |

- Comments and strings: all planted sentences are counted. Creature.cls doc comment: roams, cellar, share, beasts,
  dragons, centaurs (2 each). HitPoints.cls: drop, lair, rests, recover, takes (2 each). CreatureFacade.cls line
  comment: rolls, initiative, dungeon, encounter, every, before, starts (2 each). CreatureUtil.cls block comment:
  counts, hoard, guards (2 each), treasure. NoSuchCreatureException.cls string: dungeon(1), such(+1).
  `"centaur-stable"`: centaur, stable. In EncounterEdgeCases.cls the strings with comment markers are counted as
  strings (`neither(1)`, `said(1)`, `tilde(1)`, `escapes(1)`, `quote(1)`), the three-line string is counted
  (`gargoyle(1)`, `whispers(1)`, `portcullis(1)`), the nested comment is counted as one comment (`outer(4)`,
  `inside(2)`), the ABLDoc comment is counted (`basilisk(2)`). Not counted: the string argument of
  `DYNAMIC-FUNCTION("rollD20" IN pDice)` (EncounterResolver.cls) and the library name in `PROCEDURE GetTickCount
  EXTERNAL "kernel32.dll":` (encounteredgecases.p).
- Test file handling: `test/.../CreatureServiceTest.cls` is included by default (creature(6), repository(3),
  speed(3), stable(3), up(3), walking(3), centaur(2)). `--exclude-tests` removes it (28 files) because of the `test`
  directory. A probe `GoblinTest.cls` outside a test directory stays in with `--exclude-tests`: `TestFileDetector`
  knows the `Test` suffix only for `kt`, `kts`, `java`, `cs`, `php`. `should_save_creature_to_the_stable` yields
  creature, stable (`should`, `to`, `the` are stop words, `save` is technical).

- German words (Zentaurenhöhle.cls reports beschreibung(3), hle(3), rüstungsklasse(3), dem(2), die(2), geh(2),
  jeder(2), kreatur(2), liegt(2), ren(2), stungsklasse(2), trefferpunkte(2), und(2), unter(2), verlies(2),
  zentaurenh(2), der(1)): 4 of 7 appear.

| word | found | how |
| --- | --- | --- |
| zentaurenhöhle | no | comment -> `zentaurenh(2)` + `hle`; the qualified class name is not extracted |
| verlies | yes (2) | comment |
| rüstungsklasse | yes (3) | from the property name only; the comment occurrence becomes `stungsklasse(2)` |
| trefferpunkte | yes (2) | comment |
| kreatur | yes (2) | comment |
| größe | no | string `"Größe der Höhle"` -> `gr` and `e`, both too short, nothing left |
| höhle | no | -> `hle` (2 from the comment, 1 from the string) |

  Comments and strings are tokenised with `[a-zA-Z]{3,}` (`SplitStage.kt`), so every umlaut and `ß` cuts the word;
  `gehören` becomes `geh(2)` and `ren(2)`. Identifiers keep umlauts (probe: `CLASS Zentaurenhöhle:` with a property
  `Größe` yields `zentaurenhöhle(3)`, `größe(3)`). German stop words leak: `die(2)`, `unter(2)`, `dem(2)`, `und(2)`,
  `jeder(2)`, `der(1)`; only `english-stopwords.txt` exists. `zu` is dropped because it has two letters.

## Changed since 2026-09-06
- Domain parser: the lens no longer holds folder and root nodes (2026-09-06: 44 nodes for 25 files; now one node per
  file, 29 for 29). Aggregated words have to be summed by the reader.
- Domain parser: every word now carries a `tfidf` value besides `frequency`.
- Domain parser: the per-file word lists of the 25 old files are unchanged. Summed over the old files the expected
  words give the numbers of the earlier report (creature 101, speed 55, centaur 13, damage 14, initiative 17, roll 16,
  dice 18, encounter 8, dungeon 5, cellar 7, armor 18, stable 15, treasure 5, lair 2, hoard 2), except hit and points:
  19 each, not 18. The extra 1 is the string `"hit points left"` in encounter.p; the earlier report had not added it.
- Still true: qualified class names yield nothing, `de` from ENUM headers, `app` from `AppError`, `tt` / `fi`
  prefixes, `d20Roll` -> `20`, temp-table fields and `DEFINE BUTTON` / `DEFINE FRAME` names not extracted, usages not
  counted, `.i` not scanned, `--comment-weight 0` rejected, test detection by directory only, package segments from
  the `GetClass` string.
- Dependency parser: it was not run on 2026-09-06. It now runs, exits 0, warns and writes an empty lens.
- Unified parser: not part of the earlier report. It ignores all ABL files.
- New on the old files: none beyond the above.

## Verdict

**Decision (2026-10-08): ABL support is dropped completely. Everything below is kept as a record only.**

### Unified parser
- Missing: ABL is not analysed at all. All 31 files (`.p`, `.cls`, `.w`, `.i`) are listed as unsupported and the
  output has no file node and no metric, although `AblMetricMapping.kt` exists in the tree-sitter library.
- Wrong: nothing to judge.
- Bad: exit code 0 and a written `unified.cc.json` although nothing was analysed; only the stderr warning says so.
- Bad: with a non-UTF-8 locale the count of ignored files is 30, `Zentaurenhöhle.cls` is not even listed. **Decision: accept (derived from Java).**
- Good: the message names the ignored extensions and the file count.

### Dependency parser
- Missing: no ABL analyzer. 0 of 67 expected file edges (0 of 75 with tests), no leaves, no cycle, no upward edge.
- Wrong: nothing to judge.
- Bad: exit code 0 and an output file with an empty lens.
- Good: two clear warnings (`No supported source files found`, `No analyzable declarations were found`).

### Domain language parser
- Missing:
  1. `CLASS de.sots.cellarsandcentaurs.domain.service.EncounterResolver:` (every `.cls`): a qualified class or
     interface name yields no word. `resolver` in EncounterResolver.cls comes from the header comment only.
  2. `src/include/ttencounter.i`, `src/include/constants.i`: `.i` files are not scanned (31 files, 29 processed).
  3. `DEFINE TEMP-TABLE ... FIELD round / damage / ambusher / INDEX idxRound` (ttencounter.i, dice.p, Creature.cls):
     field and index names are not extracted, only the table name.
  4. `VAR INTEGER iMimic = 2, iWraith.` (EncounterEdgeCases.cls `VarStatement`): the OpenEdge 12 variable statement
     yields nothing.
  5. `DEFINE PUBLIC EVENT AmbushSprung SIGNATURE VOID (INPUT pAmbusher AS CHARACTER).` (EncounterEdgeCases.cls):
     neither the event name nor its parameter.
  6. `SET(INPUT pMorale AS INTEGER):` (EncounterEdgeCases.cls property `Morale`): accessor parameters are not
     extracted. `DESTRUCTOR PUBLIC EncounterEdgeCases ()`: the destructor name is not extracted.
  7. `DEFINE BUTTON btnAmbush`, `DEFINE FRAME fAmbush` (encounteredgecases.p, creaturebrowser.w), `DEFINE QUERY
     qEncounter`, `BUFFER pEncounter FOR ttEncounter` as a parameter: no word.
  8. `DYNAMIC-FUNCTION("rollD20" IN pDice)` (EncounterResolver.cls) and `EXTERNAL "kernel32.dll"`
     (encounteredgecases.p): these strings are not counted.
  9. Usages (`pCreature:GetHitPoints()`, `NEW`, `RUN startAmbush`, `CAST`, `TYPE-OF`, `AS Creature`): frequencies
     reflect declarations only. **Decision: ignore (derived from Kotlin) — every language counts declarations only.**
  10. German stop words: there is no list. **Decision: ignore (derived from Java).**
  11. Name-based test detection for `.cls` / `.p` (`GoblinTest.cls` probe).
  12. `--comment-weight 0` / `--string-weight 0` are rejected. **Decision: accept (derived from Java).**
- Wrong:
  1. Zentaurenhöhle.cls comment and string: words are cut at umlauts and `ß` (`zentaurenh`, `hle`, `stungsklasse`,
     `geh`, `ren`; `Größe` vanishes). The identifier `rüstungsklasse` stays whole, so the same word appears in two
     forms. **Decision: accept (derived from Java).**
  2. `METHOD PUBLIC CHARACTER Describe` (EncounterResolver.cls): `describe` is removed as an English stop word. **Decision: ignore (derived from Kotlin: stop and keyword lists removing ordinary words).**
  3. `ENUM de.sots....CreatureType:` -> `de(6)`; `INHERITS AppError` -> `app(3)`.
  4. `FUNCTION criticalDamage RETURNS INTEGER (INPUT pRoll AS INTEGER) FORWARD.` (encounteredgecases.p): the file
     reports critical(6), i.e. the name is counted twice. A probe with only the prototype lines yields `roll(3)` and
     no function name, so the result of a prototype depends on what follows it. Cause not traced.
  5. `d20Roll` -> `20`, `roll` (dice.p): a bare number becomes a word. **Decision: ignore (derived from Java).**
  6. `@param` / `@return` in the ABLDoc comment (EncounterEdgeCases.cls) -> `param(2)`, `return(2)`. **Decision: ignore (derived from Java).**
- Bad:
  1. No root or folder node in the lens. **Decision: ignore (derived from Java).**
  2. Under a POSIX locale `Zentaurenhöhle.cls` is dropped silently (28 instead of 29 files, no warning). **Decision: accept (derived from Java).**
  3. Header template words dominate real ABL files: `file(20)`, `purpose(20)`, `cls(8)`, plus the file name.
  4. `tt(12)`, `fi(6)`: two-letter ABL prefixes are kept, one-letter prefixes are dropped.
  5. `// ASSIGN iRemaining = iRemaining * 2.` (EncounterResolver.cls): commented-out code counts like prose
     (`assign(2)`, `remaining(+2)`). **Decision: ignore (derived from Java).**
  6. `Progress.Lang.Class:GetClass("de.sots.cellarsandcentaurs.domain.model.Centaur")` (CreatureFacade.cls): package
     segments `sots`, `cellarsandcentaurs`, `domain`, `model` become words.
- Good: all 17 expected words are found; ABL statement keywords in code do not leak; lower-case and mixed-case
  keywords, abbreviated `DEF VAR ... AS INT`, hyphenated names, generics in a type position, preprocessor lines,
  `{include.i}` references and `&IF` blocks do not disturb extraction of the surrounding declarations; `//`,
  `/* */`, nested and ABLDoc comments, single- and double-quoted strings, `~"` escapes, `:U` attributes and
  multi-line strings are recognised, comment markers inside strings are not taken for comments; weights are visible;
  `.p`, `.cls`, `.w` (also upper-case `.P`, probe) are processed; `--exclude-tests` works through the `test` directory.
