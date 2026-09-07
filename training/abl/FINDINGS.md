# OpenEdge ABL (Progress)

## Project
- Layout: `src/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,adapter/ui,application,application/dto}`
  plus `test/de/sots/cellarsandcentaurs/domain/service/CreatureServiceTest.cls`. ABL packages map to directories, one
  class per `.cls`, procedures in lower-case `.p`, one AppBuilder window `.w`. 22 files, none larger than 80 lines.
- Declarations: all of the README table. `CreatureType` and `SpeedType` are `ENUM` types, `Fightable` and `Creatures`
  are `INTERFACE`s, `NoSuchCreatureException INHERITS Progress.Lang.AppError`, `Centaur INHERITS Creature`,
  `Creature IMPLEMENTS Fightable`, `PersistedCreatures IMPLEMENTS Creatures`. `dice.p` holds two temp-tables
  (`Dice`, `DiceRoll`), the free function `rollD20` and the internal procedure `rollInitiative` (file name differs
  from its declarations; a `.cls` may only hold one class, so a procedure file is the ABL way to do this).
- Stress constructs present: wildcard `USING de.sots.cellarsandcentaurs.domain.model.*` (CreatureUtil, creaturestable.p,
  test), unused `USING ...Fightable` (CreatureUtil), inheritance and interface implementation, static member access
  `CreatureFacade:STANDARD_CREATURE_TYPE` (Creature, PersistedCreatures), type-position-only use (`AS Creatures`),
  instantiation-only use (`NEW CreatureEntity(...)`), fully qualified reference without USING
  (`de.sots.cellarsandcentaurs.application.dto.Creature` in CreatureFacade), same simple name `Creature` in
  `domain.model` and `application.dto` both used from CreatureFacade, standard library / framework usage
  (`Progress.Lang.AppError`, `Progress.Lang.Object`, `Progress.Json.ObjectModel.JsonObject`, `LOG-MANAGER`,
  `GUID(GENERATE-UUID)`, `OpenEdge.Core.Assert`), the upward cycle `Creature -> CreatureFacade -> CreatureService ->
  Creatures -> Creature` and `ArmorClass -> CreatureUtil`, `PersistedCreatures -> CreatureFacade`, procedure-level
  dependencies via `RUN de/sots/.../dice.p PERSISTENT SET hDice` and `RUN .../creaturebrowser.w`, ABLUnit
  annotations `@Setup.` / `@Test.` in the test.
- Not applicable in ABL: aliased import (`USING` has no `AS`), generics (`Repository<T>` — user classes cannot be
  generic; `CreatureRepository` is a plain class backed by a temp-table), barrel / re-export module (no such
  concept; the upward dependency goes straight to `CreatureFacade` / `CreatureUtil`), a type referenced only in an
  annotation (ABL annotations are bare names such as `@Test.`, they cannot name a type).

## Dependency parser
- Not run: `dependencyparser` has no ABL grammar. It would need the extensions `.p`, `.cls`, `.w` (and ideally
  `.i` include files) and a resolver for `USING package.Class FROM PROPATH`, `USING package.*`, fully qualified
  type names, `INHERITS` / `IMPLEMENTS`, `NEW Type(...)`, `Type:StaticMember`, and the procedure-level
  `RUN path/name.p` / `RUN name.p PERSISTENT SET h` / `{include.i}` forms. Names resolve by PROPATH (a search path),
  not by relative file paths, so package-to-directory mapping is the only thing CodeCharta could do without a
  PROPATH.
- Expected file-level edges, written before any run so an ABL front end can be checked against them
  (`M` = `src/de/sots/cellarsandcentaurs`):

| from | to |
| --- | --- |
| M/domain/model/Creature.cls | CreatureId, CreatureType, ArmorClass, HitPoints, Speed, SpeedType, Fightable (all model), application/CreatureFacade.cls (upward, cyclic) |
| M/domain/model/ArmorClass.cls | application/CreatureUtil.cls (upward) |
| M/domain/model/NoSuchCreatureException.cls | model/CreatureId.cls (`Progress.Lang.AppError` is stdlib: no edge) |
| M/domain/model/Centaur.cls | model/Creature.cls, model/CreatureId.cls, model/CreatureType.cls |
| M/domain/model/dice.p | none |
| M/domain/service/Creatures.cls | model/Creature.cls, model/CreatureId.cls |
| M/domain/service/CreatureService.cls | model/Creature.cls, service/Creatures.cls |
| M/adapter/persistence/CreatureRepository.cls | persistence/CreatureEntity.cls (`Progress.Lang.Object`, `JsonObject` are stdlib: no edge) |
| M/adapter/persistence/PersistedCreatures.cls | CreatureRepository, CreatureEntity, service/Creatures, model/Creature, model/CreatureId, model/NoSuchCreatureException, application/CreatureFacade.cls (upward) |
| M/application/CreatureFacade.cls | service/CreatureService, model/Creature, CreatureId, CreatureType, HitPoints, Speed, SpeedType, ArmorClass, application/dto/Creature.cls (fully qualified, no USING) |
| M/application/CreatureUtil.cls | model/Creature, model/Speed, model/SpeedType (via wildcard USING); the `Fightable` USING is unused: no edge |
| M/application/creaturestable.p | CreatureFacade, service/CreatureService, persistence/PersistedCreatures, persistence/CreatureRepository, model/Creature, CreatureType, Speed, ArmorClass, model/dice.p (RUN), adapter/ui/creaturebrowser.w (RUN) |
| M/adapter/ui/creaturebrowser.w | model/Creature.cls, model/SpeedType.cls, model/dice.p (RUN) |
| test/.../CreatureServiceTest.cls | service/CreatureService, persistence/PersistedCreatures, persistence/CreatureRepository, model/Speed, Creature, CreatureId, CreatureType, SpeedType (`OpenEdge.Core.Assert` is stdlib) |
| (round 2) M/domain/model/Speed.cls | src/include/constants.i (textual include `{include/constants.i}`, `{&SPEED-LIMIT}` used in a property INITIAL) |
| (round 2) M/domain/model/dice.p | src/include/constants.i (textual include `{include/constants.i}`, `{&D20-SIDES}` used in `maxRoll`) |
| (round 2) M/application/encounter.p | model/dice.p (`RUN dice.p PERSISTENT SET hDice` with a bare PROPATH name, then `RUN rollInitiative IN hDice`) |
| (round 2) M/application/encounter.p | service/creaturerules.p (`RUN applyDamage (...)` resolved only through the session super procedure; no file is named) |
| (round 2) M/application/startup.p | service/creaturerules.p (`RUN de/sots/.../creaturerules.p PERSISTENT SET hRules` + `SESSION:ADD-SUPER-PROCEDURE(hRules)`), application/encounter.p (`RUN de/sots/.../encounter.p`) |
| (round 2) M/adapter/ui/creaturebrowser.w | model/Centaur.cls (`DEFINE VARIABLE oCentaur AS CLASS Centaur NO-UNDO.` with no USING for Centaur) |
| (round 2) M/application/CreatureUtil.cls | model/Centaur.cls (`CAST(pCreature, Centaur)` is the only usage; resolved through the wildcard USING) |
| (round 2) M/domain/service/CreatureService.cls | model/Fightable.cls (`TYPE-OF(pCreature, Fightable)` is the only usage, USING added) |
| (round 2) M/application/CreatureFacade.cls | model/Centaur.cls (`Progress.Lang.Class:GetClass("de.sots.cellarsandcentaurs.domain.model.Centaur"):New(pId)` string lookup, no USING) |
| (round 2) M/domain/service/creaturerules.p | model/Speed.cls (`&SCOPED-DEFINE SPEED-CLASS de.sots...Speed` + `AS {&SPEED-CLASS}` parameter type, no USING) |

- Expected cycle: `Creature -> CreatureFacade -> CreatureService -> Creatures -> Creature` (plus `CreatureFacade -> Creature`
  directly). Expected upward edges: `Creature -> CreatureFacade`, `ArmorClass -> CreatureUtil`, `PersistedCreatures -> CreatureFacade`.
- Expected leaf kinds: CLASS (13), INTERFACE (Fightable, Creatures), ENUM (CreatureType, SpeedType), no REEXPORT;
  `dice.p` would need kinds for temp-table / function / procedure, which the current kind set does not have.

## Domain language parser
- Commands (all from the README, `LANG_DIR=training/abl`, stderr in `output/*.stderr.log`); all exit 0 unless noted:
  - `domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json` (22 files, 41 nodes)
  - `--exclude-tests` -> `output/domain-exclude-tests.cc.json`
  - `--comment-weight 0` and `--string-weight 0` fail with `IllegalArgumentException: --comment-weight must be positive, got 0`
    (a weight cannot be switched off); `--comment-weight 3` / `--string-weight 3` were used instead
  - `--stop-word-level MINIMAL`, `--stop-word-level AGGRESSIVE`, `--no-technical-stopwords`, `--verbose` (no extra output
    beyond the default log; no parse warnings for any file, including the `.w`)
- Default weights observed: identifier 3, comment 2, string 1.
- Expected words at the root node: all 17 present. creature(95), speed(46), armor(18), hit(18), points(18),
  stable(15), dice(15), initiative(13), roll(13), damage(8), centaur(6), cellar(5), treasure(5), dungeon(3),
  lair(2), encounter(2), hoard(2).
- What the ABL grammar extracts (checked with probe files outside the project): only *declarations* are counted —
  variable, parameter, property, method, constructor, procedure, function, temp-table and enum member names, plus a
  simple (unqualified) class name. Not counted: type references (`AS Creature`, `INHERITS`, `IMPLEMENTS`), method
  calls and object references (`oCreature:SetSpeed(...)`, `CreatureFacade:STANDARD_CREATURE_TYPE`), `NEW Type()`,
  `RUN` targets, `USING` statements, numeric literals, single-letter tokens, preprocessor names (`&Scoped-define`).
- Keyword and technical-word leakage (default level MODERATE):
  - ABL keywords (`CLASS`, `DEFINE`, `METHOD`, `NO-UNDO`, `CHARACTER`, `INTEGER`, `PUBLIC`, `STATIC`, `OVERRIDE`, ...)
    do not leak at all: right, the grammar does not emit them. `class(17)` and `string(3)` come from the identifiers
    `ArmorClass` / `STANDARD_ARMOR_CLASS_DESCRIPTION` and `ToString`, not from keywords; acceptable for `class`
    (armor class is domain), `string` is noise.
  - `de(6)` is the first segment of the package name in `ENUM de.sots.cellarsandcentaurs.domain.model.CreatureType:`
    (only for ENUM headers, and only the first segment): wrong, that is a package prefix.
  - `app(3)` from `INHERITS AppError`: the keyword list contains `AppError`, but matching happens after splitting, so
    only `error` (technical stop word) is removed and `app` stays: wrong. Same mechanism removes `json` from `ToJson`
    because `Json` is a listed keyword, which is right by accident.
  - Architecture words that leak at MODERATE: `entity(12)`, `repository(9)`, `facade(9)`, `dto(3)`, `persisted(3)`,
    `standard(6)`, `description(9)`, `value(9)`, `type(18)`, `init(3)`, `info(2)` (the LOG-MANAGER level string). Of
    these `entity`, `repository`, `facade`, `dto`, `type`, `value`, `init`, `info` are filtered at AGGRESSIVE. Filtered
    correctly at MODERATE: `save`, `find`, `create`, `get`, `set`, `service`, `exception`, `base`, `name`, `temporary`
    (they reappear with `--no-technical-stopwords`, and `save`, `find`, `service`, `exception`, `set`, `get`, `create`,
    `base` reappear at MINIMAL).
  - ABL naming prefixes leak when they are two letters: `tt(6)` (temp-tables `ttSpeed`, `ttCreature`), `fi(6)`
    (fill-ins `fiCreatureId`, `fiWalkingSpeed`); one-letter prefixes (`o`, `p`, `h`, `i`) are dropped. Wrong for ABL,
    where `tt`, `fi`, `btn`, `cb`, `bf`, `tb` prefixes are the convention.
  - File header comments leak: `file(8)`, `purpose(8)`, `cls(4)`, `connected(2)`, `databases(2)` (AppBuilder /
    Developer Studio template headers). Not a parser bug, but a real-world ABL project will have these in every file.
  - Others: `such(4)` (`NoSuchCreatureException`), `up(3)` (`setUp`), `one(3)` (`FindOne`), `max(3)`, `20(3)` (see below).
  - MINIMAL vs AGGRESSIVE in one line: MINIMAL adds `save(15) service(12) base(9) find(9) set(6) create(3) exception(3)
    get(3)`; AGGRESSIVE removes `type entity facade repository value dto init info` from the MODERATE list and nothing else.
- Identifier splitting:

| form | identifier | words found |
| --- | --- | --- |
| camelCase | `walkingSpeed` (CreatureFacade.cls) | walking, speed |
| snake_case | `walking_speed` (CreatureServiceTest.cls) | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` (HitPoints.cls) | max, hit, points |
| PascalCase | `ArmorClass` | armor, class |
| Acronym | `XPValue` (Creature.cls) | xp, value |
| Digit | `d20Roll` (dice.p) | `20`, roll — the `d` is dropped as a one-letter token and the bare number `20` becomes a word |
| Digit (other side) | `rollD20` (dice.p) | roll, d20 — inconsistent with `d20Roll`: lower-case letter before a digit splits, upper-case does not |
| Kebab in string | `"centaur-stable"` (CreatureFacade.cls) | centaur, stable |
| Prefix convention | `ttSpeed`, `fiCreatureId` | tt, speed / fi, creature, id |
| Qualified class header | `CLASS de.sots.cellarsandcentaurs.domain.model.Creature` | nothing — the class name is lost (see Wrong) |

- Comments and strings: all planted sentences are counted. Doc comment on `Creature` (roams(2), cellar(2), share(2),
  beasts(2), dragons(2), centaurs(2)), doc comment on `HitPoints` (damage(2 of 8), lair(2), rests(2), recover(2),
  drop(2)), line comment in `CreatureFacade:Create` (initiative(2), dungeon(2), encounter(2), rolls(2)), block comment
  in `CreatureUtil` (treasure(2), hoard(2), guards(2), counts(2)), the string `"No such creature in the dungeon: "`
  (dungeon(1), such(1)) and `"centaur-stable"` (centaur(1), stable(1)). Weights are visible: `--comment-weight 3`
  moves the comment-only words from 2 to 3 (`roams`, `lair`, `encounter`, ...), `--string-weight 3` moves `dungeon`
  in NoSuchCreatureException from 1 to 3 and `centaur` / `stable` in CreatureFacade from 1 to 3. `//` line comments
  and `/* */` block comments are both recognised; the AppBuilder `&ANALYZE-SUSPEND` header lines are ignored.
- Test file handling: `test/.../CreatureServiceTest.cls` is included by default (creature(6), repository(3), speed(3),
  stable(3), up(3), walking(3), centaur(2)); `--exclude-tests` drops the whole `test/` subtree (0 nodes). It is only
  recognised as a test because of the `test/` directory: `TestFileDetector` checks the `Test` name suffix only for
  kt/java/cs/php, so a `CreatureServiceTest.cls` next to its production class (also common in ABL projects) would not be
  excluded. `should_save_creature_to_the_stable` splits into creature, stable (`should`, `to`, `the` are English stop
  words, `save` is technical); `setUp` leaves `up`; the `@Test.` / `@Setup.` annotations are not counted, and the word
  `test` never appears because the qualified class name is lost anyway.

## Verdict
- Good: all 17 expected words reach the root; no ABL keyword leaks; comments (`//` and `/* */`) and strings are
  counted with visible weights; camelCase, snake_case, SCREAMING_SNAKE, PascalCase and the acronym split cleanly;
  hyphenated strings split; `USING`, type references, numeric literals and one-letter prefixes are ignored;
  `.p`, `.cls` and `.w` files all parse without warnings; `--exclude-tests` works through the `test/` directory.
- Good (round 2): the include reference `{include/constants.i}`, the preprocessor references `{&SPEED-LIMIT}` /
  `{&D20-SIDES}` / `{&SPEED-CLASS}` and the `&SCOPED-DEFINE` line do not disturb parsing of `.cls` / `.p`; the three
  new procedure files parse without warnings; all 17 expected words are still at the root and none was lost.
- Wrong:
  1. `CLASS de.sots.cellarsandcentaurs.domain.model.Creature:` (every `.cls` in the project) — a fully qualified
     class, interface or enum name yields no word at all, so the single most important identifier of each file is
     missing (`creature` in Creature.cls comes only from constructors and the comment). An unqualified `CLASS Wyvern:`
     is counted. For `ENUM` headers only the first package segment survives (`de(6)`).
  2. `DEFINE TEMP-TABLE Dice ... FIELD sides ... FIELD label` (dice.p, Creature.cls `ttSpeed`, CreatureRepository.cls
     `ttCreature`) — temp-table field names are not extracted; only the table name is. Fields are where ABL keeps
     its domain vocabulary.
  3. `d20Roll` -> `20`, `roll` vs `rollD20` -> `roll`, `d20` (dice.p) — digit boundary splitting depends on the case of
     the preceding letter, and a bare number leaks as a word.
  4. `INHERITS AppError` (NoSuchCreatureException.cls) -> `app(3)`: compound entries in `abl-keywords.txt` (`AppError`,
     `JsonObject`, `ProDataSet`, ...) never match because the token is split before the keyword filter.
  5. `ttSpeed`, `fiCreatureId`, `btnRoll` — the two-letter ABL prefixes `tt` and `fi` leak (`btn` is not counted at
     all, see Missing); they are noise in every ABL code base.
  6. (round 2) `Progress.Lang.Class:GetClass("de.sots.cellarsandcentaurs.domain.model.Centaur")` (CreatureFacade.cls) —
     a dotted type name inside a string is split on the dots, so the package segments `sots`, `cellarsandcentaurs`,
     `domain`, `model` leak as words (weight 1); `de` is dropped because two-letter tokens from strings and comments are
     discarded while two-letter identifiers (`tt`, `fi`, `de` from ENUM headers) are kept — inconsistent.
- Missing:
  1. `DEFINE BUTTON btnRoll` (creaturebrowser.w) — button and other widget definitions are not extracted, nor are
     `&Scoped-define WINDOW-NAME wCreatureBrowser` preprocessor names.
  2. Usages: `oCreature:SetSpeed(...)`, `CreatureFacade:STANDARD_CREATURE_TYPE`, `NEW Speed(40)`, `RUN rollInitiative
     IN hDice`, `Creature.cls` `AS ArmorClass` — no usage of an identifier counts, so word frequencies reflect the
     number of declarations only (`speed(46)` is high only because of many parameters and properties named speed).
  3. `--comment-weight 0` / `--string-weight 0` are rejected, so a source category cannot be switched off for
     comparison.
  4. Name-based test detection for `.cls` / `.p` (`*Test.cls`), only the directory rule applies.
  5. (round 2) `.i` include files are not scanned at all (`Language.kt` lists only `p`, `cls`, `w` for ABL):
     `src/include/constants.i` is missing from the tree (26 files on disk, 25 processed). Real ABL projects keep shared
     temp-table, constant and even class-body definitions in includes, so their vocabulary is lost.
  6. (round 2) `RUN dice.p PERSISTENT SET hDice`, `RUN rollInitiative IN hDice`, `RUN applyDamage` (super-procedure call),
     `SESSION:ADD-SUPER-PROCEDURE`, `CAST(pCreature, Centaur)`, `TYPE-OF(pCreature, Fightable)`, `AS CLASS Centaur` and
     `{&SPEED-CLASS}` contribute no word: `encounter.p` has no `roll` or `apply`, `CreatureUtil.cls` no `centaur`,
     `CreatureService.cls` no `fightable` — confirmed with one-line probe files outside the project.

## Round 2: additional dependency forms
- Added files: `src/include/constants.i` (`&GLOBAL-DEFINE SPEED-LIMIT 120`, `&GLOBAL-DEFINE D20-SIDES 20`),
  `M/domain/service/creaturerules.p` (super procedure with `applyDamage`, `halveSpeed`; `&SCOPED-DEFINE SPEED-CLASS`),
  `M/application/startup.p` (installs the super procedure, runs the encounter), `M/application/encounter.p`
  (bare `RUN dice.p PERSISTENT`, `RUN rollInitiative IN hDice`, `RUN applyDamage` through the super procedure).
  Added declarations: `Speed:SpeedLimit` (`{&SPEED-LIMIT}`), `maxRoll` in dice.p (`{&D20-SIDES}`), `oCentaur AS CLASS Centaur`
  in creaturebrowser.w, `CreatureUtil:BowRangeOf` (`CAST`), `CreatureService:CanFight` (`TYPE-OF`, plus a `USING Fightable`),
  `CreatureFacade:CreateCentaur` (`Progress.Lang.Class:GetClass(...):New(pId)`). No round-1 construct, comment, string or
  identifier was changed. 26 files on disk now; the expected-edge table above carries one `(round 2)` row per form.
- No ABL dependency parser exists, so "found" is `no` for every row; the rows are the acceptance list for a future ABL front end.
  Each edge is the only way its `from` file depends on its `to` file (`M` = `src/de/sots/cellarsandcentaurs`).

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| textual include `{include/constants.i}` (two users) | src/include/constants.i, M/domain/model/Speed.cls, M/domain/model/dice.p | Speed.cls -> constants.i, dice.p -> constants.i | no | resolved by PROPATH, not relative to the includer; `{&SPEED-LIMIT}` / `{&D20-SIDES}` only exist after inclusion. The domain parser does not scan `.i` |
| `RUN dice.p PERSISTENT SET hDice` + `RUN rollInitiative IN hDice` | M/application/encounter.p | encounter.p -> M/domain/model/dice.p | no | bare file name (round 1 used the full `de/sots/.../dice.p` path); the `IN hDice` call names an internal procedure of that file |
| super procedure: `SESSION:ADD-SUPER-PROCEDURE(hRules)` then `RUN applyDamage` with no `IN` | M/application/startup.p, M/domain/service/creaturerules.p, M/application/encounter.p | startup.p -> creaturerules.p (RUN PERSISTENT + ADD-SUPER-PROCEDURE); encounter.p -> creaturerules.p (implicit) | no | the encounter.p edge is only knowable by tracing the session super-procedure stack; a static parser can at best flag `RUN applyDamage` as unresolved. startup.p -> encounter.p is a plain `RUN` |
| `DEFINE VARIABLE oCentaur AS CLASS Centaur` without USING | M/adapter/ui/creaturebrowser.w | creaturebrowser.w -> M/domain/model/Centaur.cls | no | no `USING` names Centaur in that file (only Creature, SpeedType); resolution needs a project-wide simple-name index |
| `CAST(pCreature, Centaur)` as the only usage | M/application/CreatureUtil.cls | CreatureUtil.cls -> M/domain/model/Centaur.cls | no | reached through the wildcard `USING ...model.*`; the type name is a CAST argument, not a declaration |
| `TYPE-OF(pCreature, Fightable)` check | M/domain/service/CreatureService.cls | CreatureService.cls -> M/domain/model/Fightable.cls | no | a `USING Fightable` was added with it; the USING alone must not count (see stress 9), only the TYPE-OF argument makes the edge |
| `Progress.Lang.Class:GetClass("...Centaur"):New(pId)` | M/application/CreatureFacade.cls | CreatureFacade.cls -> M/domain/model/Centaur.cls | no | the type name lives only in a string literal; `Progress.Lang.Class` is stdlib, no edge |
| `&SCOPED-DEFINE SPEED-CLASS ...Speed` + `AS {&SPEED-CLASS}` | M/domain/service/creaturerules.p | creaturerules.p -> M/domain/model/Speed.cls | no | the type is only visible after preprocessor expansion; no USING, no literal `Speed` token outside the define line |

- Domain parser after round 2 (same README command, exit 0, no warnings): 25 files processed (26 on disk, `constants.i`
  skipped), 44 nodes instead of 41; all 17 expected words still at the root, nothing lost, changed counts creature 95->101,
  speed 46->55, centaur 6->13, damage 8->14, initiative 13->17, roll 13->16, dice 15->18, encounter 2->8, dungeon 3->5,
  cellar 5->7. New leaked words: `procedure(6)`, `super(4)`, `rules(7)`, `combat(4)`, `startup(4)`, `starts(4)`,
  `installs(2)`, `runs(2)`, `holding(2)` (all from the three new file-header comments and `hRules`), `remaining(6)`,
  `apply(3)`, `halve(3)`, `limit(3)`, `range(6)`, `bow(6)`, `fight(3)` (new declarations), `sots(1)`,
  `cellarsandcentaurs(1)`, `domain(1)`, `model(1)`, `left(1)` (strings), `file` / `purpose` 8->14, `max` 3->6, `one` 3->5.
- Per form, what the domain parser sees of the new constructs: nothing from the dependency-carrying token itself in every
  case — `{include/constants.i}`, `{&...}` references, the `&SCOPED-DEFINE` line, `RUN` targets, `IN hDice`,
  `SESSION:ADD-SUPER-PROCEDURE`, the `AS CLASS Centaur` type, the `CAST` / `TYPE-OF` type arguments all yield no word
  (probe files: `oObj = CAST(pCreature, Centaur).` and `lOk = TYPE-OF(pCreature, Fightable).` produce an empty word list).
  Only the surrounding declarations count: `oCentaur` -> centaur(3), `BowRangeOf` -> bow, range, `CanFight` -> fight,
  `CreateCentaur` -> centaur(3), `SpeedLimit` -> speed, limit, `maxRoll` -> max, roll, `applyDamage` / `pDamage` ->
  apply, damage(6), `halveSpeed` / `pSpeed` -> halve, speed(6), `hRules` -> rules(3), `iInitiative` -> initiative(3).
  The GetClass string adds centaur(1) plus the package segments (see Verdict, Wrong 6).
