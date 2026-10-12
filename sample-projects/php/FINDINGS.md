# PHP

Report of 2026-10-08 (round 3). The section below was written before any parser ran and is kept unchanged.

## Expected values for round 3 (written 2026-10-08 before any parser run)

Counted by hand with the README rule. rloc of a function = code lines strictly inside its braces (signature and brace lines not counted).
A closure / arrow function adds +1 to the complexity of the named function that holds it; a nested named function is its own function.

### EncounterResolver.php
loc 106, blank 9, comment_lines 13 (6 doc + 3 line + 2 block + 1 trailing + 1 commented-out), rloc 85 (106 - 9 - 12 comment-only),
logic_complexity 14 (resolve 11, safeRoll 2, initiativeOrder 1), number_of_functions 6 (5 methods + nested initiativeOf), complexity 21 (14 + 6 + 1 closure).
Per function (params / complexity / rloc): resolve 5/12/33, describe 1/1/3, safeRoll 1/4/13, initiativeOrder 1/2/10, initiativeOf 1/1/1, isEmpty 0/1/1.
parameters max 5 min 0 mean 1.5 median 1; complexity max 12 min 1 mean 3.5 median 1.5; rloc max 33 min 1 mean 10.17 median 6.5.
long_method 2 (resolve, safeRoll), long_parameter_list 1, message_chains 1, excessive_comments 1.

### EncounterEdgeCases.php
loc 388, blank 51, comment_lines 13 (4 class docblock + 2 `#` + 6 method docblock + 1 trailing block), rloc 325, number_of_functions 46
(43 methods incl. 2 of the anonymous class, + CountsRolls::countRoll, Rollable::rollWith (no body), Outcome::label), lambdas 3,
logic_complexity 34, complexity 83, long_method 1 (alternativeLoops, 11), long_parameter_list 1 (defaultArguments), message_chains 3, excessive_comments 1.
Logic complexity per construct: label (match, 2 arms, no default) 2; enum `case HIT = 'hit'` 0; foreachLoop 1; forLoop 1; doWhile 1; elseifKeyword 2;
elseIfTwoWords 2; alternativeIf 2; alternativeLoops 3; alternativeSwitch 2; switchFallthrough 2; matchExpression 3 (arms, one arm has two conditions);
matchTrue 2; nullCoalescing 0; nullCoalescingAssignment 0; nullsafe 0; shortTernary 1; wordOperators 2 (`and`, `or`; `xor` 0); unionCatch 1; multipleCatch 2;
closureWithUse 1; arrowFunction 1; variadic 1; generator 1; inline HTML `<?php if (): ?>` after the class 1; everything else 0
(heredoc / nowdoc text with `if`, `&&`, `||`, `?`, `case`, `catch` inside: 0).

### Zentaurenhöhle.php
loc 16, rloc 11, comment_lines 1, functions 1, complexity 1.

### templates/creature-card.phtml (if analysed)
loc 20, comment_lines 1, logic_complexity 2 (`if:`, `foreach:`), functions 0.

### Dependency edges
EncounterResolver.php -> Creature, Dice (parameter types). RuntimeException: none.
EncounterEdgeCases.php -> Transactional (`#[Transactional]` only), Alignment (`Alignment::tryFrom` only), Boss and Describable (`Boss&Describable` only),
Fightable (`new class implements Fightable` only), NoSuchCreatureException (`catch (NoSuchCreatureException | RuntimeException $failure)` only),
Speed (`Speed ...$speeds` only), Zentaurenhöhle (`new Zentaurenhöhle()` only), Creature (`?Creature` parameter), Dice (parameter, `new Dice(6)` in arrow fn),
HitPoints (promoted `protected ?HitPoints $pool`, `HitPoints::init`), SpeedType (parameter, `SpeedType::WALKING`). 12 edges.
Leaves of the file: CountsRolls (trait), Rollable (interface), Outcome (enum), EncounterEdgeCases (class); leaf edge EncounterEdgeCases -> CountsRolls.
Zentaurenhöhle.php -> ArmorClass (`private ?ArmorClass $rüstungsklasse`).
templates/creature-card.phtml -> src/Application/CreatureFacade.php (`CreatureFacade::STANDARD_CREATURE_TYPE`), if `.phtml` is analysed.
16 new file edges, none new with --include-tests.

### Domain words
German: zentaurenhöhle 5 (identifier 3 + comment 2), rüstungsklasse 5, verlies 2, trefferpunkte 2, kreatur 2, größe 1, höhle 1; `die`, `unter`, `dem`, `und`, `jeder`, `der`, `zu` must not appear.
Markers: griffin (class docblock), kobold (method docblock), wyvern (`#` comment), ogre + vault (heredoc), goblin + tunnel (nowdoc), blow (match arm strings),
bestiary (`.phtml` comment), tavern (`.phtml` HTML text), minotaur (inline HTML text in .php), basilisk (HTML comment in .php) - the last three are not PHP text, reported either way.
EncounterResolver: encounter, resolver, attacker, defender, terrain, armor, damage, reach, swamp, cellar, dungeon, lair, initiative, dice.

The expected file edges of rounds 1 and 2 are those of the 2026-09-06 report; they are repeated in the dependency table.

## Project

- Layout: `composer.json` (PSR-4 `De\Sots\CellarsAndCentaurs\` -> `src/`), 36 `.php` files under
  `src/{Domain/Model,Domain/Service,Adapter/Persistence,Application,Application/Dto,Application/Annotation}`, one PHPUnit
  test `tests/Domain/Service/CreatureServiceTest.php`, one template `templates/creature-card.phtml`. 38 source files.
- Added in round 3: `src/Domain/Service/EncounterResolver.php`, `src/Domain/Service/EncounterEdgeCases.php`,
  `src/Domain/Model/Zentaurenhöhle.php` (unicode class name, file name and property `$rüstungsklasse`),
  `templates/creature-card.phtml`. `git check-ignore -v` reports none of them as ignored.
- `EncounterResolver` deviations from the shared spec: the loop over the speeds is a `foreach` (the idiom; a classic `for`
  is in `EncounterEdgeCases::forLoop`), the lambda is a closure assigned to a variable, the nested named function
  `initiativeOf` is legal PHP but not idiomatic, `safeRoll` has a `finally`.
- `EncounterEdgeCases` holds one method per construct: `foreach`, `for`, `do … while`, `elseif`, `else if`, alternative
  syntax (`if: … endif;`, `foreach: … endforeach;`, `for: … endfor;`, `while: … endwhile;`, `switch: … endswitch;`), switch
  fallthrough, `match` with and without subject, `??`, `??=`, `?->`, `?:`, `and` / `or` / `xor`, union catch, multiple
  catch + finally, closure with `use`, arrow function, `static fn`, first-class callable `$this->forLoop(...)`, variadic,
  default and named arguments, generator (`yield`, `yield from`), intersection type, static call on an enum, unicode
  class instantiation, anonymous class, `__call`, `__toString`, three chains (multi-line, `?->`, starting with `::`),
  heredoc, nowdoc, `#` comments, `#[Transactional]`, docblock, constructor property promotion, static method; plus a
  trait, an interface, a backed enum with a method, and inline HTML after `?>`.
- Not available in PHP: wildcard import, re-export / barrel, native generics, pattern guards, comprehensions, `async`,
  operator overloads, extension functions, preprocessor, nested comments. `goto` exists and was not added.
- No `php` binary on this machine, the files were not syntax-checked by PHP.
- The sandbox runs with `LC_CTYPE=POSIX`. The outputs named in the README were produced with `LC_ALL=C.UTF-8`; the same
  three runs under the POSIX locale are kept as `output/*-posix-locale.cc.json` (see "Unicode file name" below).

## Dependency parser

```
ccsh dependencyparser -nc sample-projects/php -e "output,FINDINGS.md" -o output/dependency.cc.json                  exit 0, 36 files, 43 leaves, 49 file edges, 54 leaf edges
ccsh dependencyparser ... --include-tests -o output/dependency-with-tests.cc.json                                   exit 0, 37 files, 55 file edges
```

Both print `No .gitignore found at root level, excluding common build folders as fallback` (the analysed folder has no
`.gitignore` of its own). Extensions: `.php` is analysed; `templates/creature-card.phtml` is not in the tree and no
message says so.

| Construct (file) | Expected edge | Found | Verdict |
| --- | --- | --- | --- |
| parameter type `Creature`, `Dice` (EncounterResolver) | -> Creature, Dice | yes, `argument`; the nested function is its own leaf `initiativeOf` (function) with an edge to Creature | ok |
| `use CreatureEntity as Entity`, return type `?Entity` (CreatureRepository) | -> CreatureEntity | yes, `return_value` | ok |
| `use Dto\Creature as CreatureDto`, return type `CreatureDto` (CreatureFacade) | -> Application/Dto/Creature.php | no; leaf edge `CreatureFacade -> Domain/Model/Creature usage=return_value`, and no method of the facade returns the domain `Creature`. Dto/Creature.php has 0 incoming | wrong target |
| `use ...\Domain\Model;` + `Model\Creature`, `Model\HitPoints` (CreatureUtil) | -> Creature, HitPoints | none, outgoing 0 | missing |
| `require_once` (PersistedCreatures, bootstrap.php), `include` / `require` (helpers.php) | -> bootstrap, CreatureFacade, CreatureUtil, Dto/Creature, Transactional | none; both script leaves have 0 outgoing | missing |
| `Centaur extends Creature`, `CreatureRepository extends Repository` | inheritance | yes | ok |
| `Creature implements Fightable`, `PersistedCreatures implements Creatures` | implementation | yes | ok |
| `use HasSpeeds;` in Creature, `use CountsRolls;` in EncounterEdgeCases | -> trait | yes, `usage` (the second as an edge inside the file) | ok |
| `new class implements Fightable` (EncounterEdgeCases::anonymousClass) | -> Fightable | none | missing |
| `enum Alignment: string implements Describable` | -> Describable | none | missing |
| `interface Boss extends Fightable, Describable` | -> Fightable, Describable | none | missing |
| promoted constructor parameter `private Creatures $creatures` (CreatureService; same in CreatureFacade, PersistedCreatures) | -> Creatures, CreatureService, CreatureRepository | none | missing |
| `Boss&Describable $boss` (EncounterEdgeCases::intersectionType) | -> Boss, Describable | none | missing |
| `Speed ...$speeds` (EncounterEdgeCases::variadic) | -> Speed | none | missing |
| `?Creature $creature` (EncounterEdgeCases::nullsafe, nullsafeChain) | -> Creature | not by this form; the edge comes from `Creature $creature` in `fluentChain` | missing (masked) |
| `catch (NoSuchCreatureException \| RuntimeException $failure)` (EncounterEdgeCases::unionCatch), `catch (NoSuchCreatureException $e)` (CreatureLookup) | -> NoSuchCreatureException | none | missing |
| `$candidate instanceof Centaur` (CentaurSpotter) | -> Centaur | none, outgoing 0 | missing |
| `#[Transactional]` (CreatureFacade::create, EncounterEdgeCases::attributed) | -> Transactional | none, Transactional has 0 incoming | missing |
| FQN `\De\...\Model\Speed` parameter type (CreatureFacade::create) | -> Speed | none | missing |
| `use function ...\rollD20;` + call (CreatureFacade), `rollD20()` (Creature) | -> Dice.php | none | missing |
| docblock only `@var Speed` (SpeedRecord), `@throws` (Creatures) | debatable | none | ok / debatable |
| `new CreatureEntity`, `new NoSuchCreatureException` (PersistedCreatures), `static fn () => new Dice(6)` | instantiation | yes for PersistedCreatures; for Dice the edge exists but shows `argument` only | ok |
| `new Zentaurenhöhle()` (EncounterEdgeCases::unicodeClass) | -> Zentaurenhöhle.php | yes, `instantiation` | ok |
| `private ?ArmorClass $rüstungsklasse` (Zentaurenhöhle) | -> ArmorClass | yes, `usage` | ok |
| `CreatureFacade::STANDARD_CREATURE_TYPE` (Creature, PersistedCreatures), `SpeedType::WALKING` in match arms | constant access | yes, `constant_access` | ok |
| `HitPoints::init(...)` (CreatureFacade, EncounterEdgeCases::staticChain), `Alignment::tryFrom(...)` | static call | yes, `usage` | ok |
| `use const ...\MAX_HIT_POINTS` (HitPointCap) | -> HitPoints.php | yes, leaf `MAX_HIT_POINTS` (variable) | ok |
| `Centaur::class` (CreatureFactory), closure parameter `HitPoints` (HitPointTally) | -> Centaur, HitPoints | yes | ok |
| unused `use Fightable` (CreatureUtil), stdlib / vendor (`RuntimeException`, `Generator`, `Countable`, `Uuid`, `LoggerInterface`) | no edge | no edge | ok |
| test file | default: absent; `--include-tests`: 6 edges | absent; 6 edges | ok |
| `CreatureFacade::STANDARD_CREATURE_TYPE` in `templates/creature-card.phtml` | -> CreatureFacade | file not analysed | missing |

Round 3 in numbers: 9 of the 16 expected new file edges are found (EncounterResolver 2 of 2, EncounterEdgeCases 6 of
12, Zentaurenhöhle 1 of 1, `.phtml` 0 of 1). The 40 file edges of round 2 are all still there, 40 + 9 = 49.

- False positives: none besides the wrong target `CreatureFacade -> Domain/Model/Creature` for the aliased DTO.
- Cycles: 1 reported (`Creature <-> CreatureFacade`, both edges `isCyclic`). The expected 3-cycle through CreatureService
  and the cycle `ArmorClass -> CreatureUtil -> Creature -> ArmorClass` are not reported, their edges are missing
  (promoted parameter, namespace import).
- Upward edges: `Creature -> CreatureFacade` and `ArmorClass -> CreatureUtil` are flagged. `PersistedCreatures ->
  CreatureFacade` is not flagged; folder levels are `src/Domain` 0, `src/Application` 1, `src/Adapter` 2.
- Leaf kinds: class, interface, enum, function, script, variable (namespace constant) are right. Trait `HasSpeeds` and
  trait `CountsRolls` are reported as `class`, and neither has an outgoing edge although `HasSpeeds` uses `Speed` and
  `SpeedType` in its methods. The anonymous class is no leaf.
- Usage kinds: each of the 54 leaf edges carries exactly one usage. `EncounterEdgeCases -> Dice` shows `argument`
  although the class is also instantiated, `-> SpeedType` shows `constant_access` although it is also a parameter type.
- Metrics follow the edges: `incoming_dependencies` is 0 for Transactional, Dto/Creature, bootstrap.php, helpers.php,
  Boss, Describable, SpeedRecord.
- Classification from the source (`languages/php/extractors/UsedTypeExtractor.kt`, `DeclarationExtractor.kt`): the
  extractor's own description lists a union type, a nullable parameter type, a qualified name and the body of a trait
  as left out; inheritance and implementation are only taken when the parent node is a `class_declaration`; a parameter
  counts only as `simple_parameter`, which excludes promoted and variadic parameters; `catch`, `instanceof` and
  attributes have no role.
- Language vs. CodeCharta: PHP has namespaces and `use`, but no module system; the file-to-class mapping is the PSR-4
  convention. Leaves are matched by namespace name, `composer.json` is not read, and it works although `src/Domain/Model`
  and `De\Sots\CellarsAndCentaurs\Domain\Model` differ. Group use `use ...\Model\{ArmorClass, Creature, ...}` resolves.

## Unified parser

```
ccsh unifiedparser -nc sample-projects/php -e "output,FINDINGS.md" -o output/unified.cc.json      exit 0, 37 files
```

Analysed: all 37 `.php` files. Skipped with a message: `2 Files with the following extensions were ignored as they are
currently not supported: [.phtml, .json]`. The same warning about a missing `.gitignore` as above. To attribute numbers
to single constructs every method of `EncounterEdgeCases` was also run as a file of its own in the scratchpad (not
kept); "isolated" below refers to that.

### EncounterResolver

| Metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| loc | 106 | 106 | ok |
| rloc | 85 | 85 | ok |
| comment_lines | 13 | 13 | ok |
| logic_complexity | 14 | 15 | +1: `default:` of the switch in `resolve` counts (`default_statement`) |
| number_of_functions | 6 | 7 | +1: the closure assigned to `$reroll` counts as a function |
| complexity | 21 | 22 | follows logic_complexity; the closure is in both counts |
| max_parameters_per_function | 5 | 5 | ok |
| min_parameters_per_function | 0 | 0 | ok |
| mean_parameters_per_function | 1.5 | 1.6 | wrong: 8 / 5, the nested `initiativeOf` is no entry |
| median_parameters_per_function | 1 | 1 | ok |
| max_complexity_per_function | 12 | 12 | same number, different content: 11 + `default`, without the +1 of the function |
| min_complexity_per_function | 1 | 0 | wrong: the function itself is not counted (isolated `describe`: 0) |
| mean_complexity_per_function | 3.5 | 3.4 | wrong: values 12, 0, 3, 2, 0 over 5 entries |
| median_complexity_per_function | 1.5 | 2 | wrong, as above |
| max_rloc_per_function | 33 | 33 | ok |
| min_rloc_per_function | 1 | 1 | ok |
| mean_rloc_per_function | 10.17 | 12 | wrong: 33, 3, 13, 10, 1 over 5 entries |
| median_rloc_per_function | 6.5 | 10 | wrong, as above |
| long_method | 2 | 2 | ok (resolve 33, safeRoll 13) |
| long_parameter_list | 1 | 1 | ok |
| message_chains | 1 | 1 | ok (the chain of 5; the chain of 3 is not counted) |
| excessive_comments | 1 | 1 | ok |

The per-function statistics have 5 entries while `number_of_functions` is 7: a function inside a function body (the
closure, `initiativeOf`) is no entry of its own; its lines stay in the enclosing method and it adds +1 to that method's
complexity (isolated `safeRoll`: 3 = `if` + `catch` + closure; isolated `initiativeOrder`: 2 = `if` + nested function).
A method's own +1 is not part of its per-function complexity, so a method without branches reports 0.

### EncounterEdgeCases

File totals: loc 388 / 388 ok; rloc 325 expected, 326 reported; comment_lines 13 / 13 ok; number_of_functions 46 / 46 ok;
logic_complexity 34 expected, 40 reported; complexity 83 expected, 89 reported (40 + 46 + 3 lambdas); message_chains 3
expected, 2 reported; long_method 1 / 1; long_parameter_list 1 / 1; excessive_comments 1 / 1.

| Construct (method) | Expected logic_complexity | Reported (isolated) | Verdict |
| --- | --- | --- | --- |
| `foreach` (foreachLoop), `for` (forLoop), `do … while` (doWhile) | 1 each | 1 each | ok |
| `elseif` (elseifKeyword), `else if` (elseIfTwoWords) | 2 each | 2 each | ok |
| `if: … elseif: … else: … endif;` (alternativeIf) | 2 | 2 | ok |
| `foreach: endforeach;`, `for: endfor;`, `while: endwhile;` (alternativeLoops) | 3 | 3 | ok |
| `switch: … endswitch;`, 2 cases + default (alternativeSwitch) | 2 | 3 | `default:` counts |
| `case 1: case 2:` fallthrough + default (switchFallthrough) | 2 | 3 | `default:` counts |
| `match`, 3 arms + default, one arm with two conditions (matchExpression) | 3 | 4 | `default =>` counts; the two-condition arm is 1 |
| `match (true)`, 2 arms + default (matchTrue) | 2 | 3 | `default =>` counts |
| `match` in the enum, 2 arms, no default (Outcome::label); `case HIT = 'hit';` | 2; 0 | 2; 0 | ok |
| `??` (nullCoalescing) | 0 | 1 | counted, not in the README rule |
| `??=` (nullCoalescingAssignment) | 0 | 0 | ok, but inconsistent with `??` |
| `?->` (nullsafe) | 0 | 0 | ok |
| `?:` short ternary (shortTernary) | 1 | 1 | ok |
| `and`, `or`, `xor` (wordOperators) | 2 | 3 | `xor` counts, it does not branch |
| `catch (A \| B $failure)` (unionCatch) | 1 | 1 | ok |
| two `catch` + `finally` (multipleCatch) | 2 | 2 | ok |
| closure with `use` holding an `if` (closureWithUse) | 1, complexity 3 | 1, complexity 3 | ok |
| arrow function with a ternary (arrowFunction) | 1, complexity 3 | 1, complexity 3 | ok |
| `static fn () => new Dice(6)`, `$this->forLoop(...)` | 0 | 0 (complexity 2 and 1) | ok |
| `for` + `yield`, `yield from` (generator) | 1 | 1 | ok |
| `foreach` over a variadic (variadic) | 1 | 1 | ok |
| heredoc and nowdoc holding `if`, `&&`, `\|\|`, `?`, `case`, `catch`, `//`, `#`, `/* */` | 0, no comment line | 0, no comment line | ok |
| `'# not a comment // nor this /* or this */'` and two `#` comments (hashComment) | 2 comment lines | 2 | ok |
| `#[Transactional]` (attributed) | no comment line | none | ok |
| docblock of 6 lines + trailing `/* */` (docblock) | 7 comment lines | 7 | ok |
| `<?php if ($visible): ?>` in the inline HTML after the class | 1 | 1 | ok |
| `<!-- the basilisk stares -->` | no comment line | none | ok |

| Other metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| parameters of `__construct(private readonly int $seed = 20, protected ?HitPoints $pool = null)` | 2 | 0 (isolated) | wrong: promoted parameters are not counted |
| parameters of `variadic(string $label, Speed ...$speeds)` | 2 | 1 (isolated) | wrong: the variadic parameter is not counted |
| parameters of `defaultArguments` (5, with defaults), long_parameter_list | 5, 1 | 5, 1 | ok |
| chain of 6 over several lines (fluentChain) | 1 | 1 | ok |
| `HitPoints::init(5)->damage(1)->rest()->getMax()` (staticChain) | 1 | 1 | ok |
| `$creature?->getHitPoints()?->rest()?->damage(1)?->getMax()` (nullsafeChain) | 1 | 0 | missing: no `?->` call counts for a chain |
| anonymous class with two methods (anonymousClass) | 3 functions | 3 functions | ok; the two inner methods add +2 to the complexity per function of `anonymousClass` |
| `Rollable::rollWith(int $sides): int;` without body | 1 function, 1 parameter | 1, 1 | ok |
| closure that is returned, not assigned (closureWithUse) | no function | no function | ok, but the assigned one in `EncounterResolver::safeRoll` counts |
| rloc of `alternativeLoops` | 11, long_method | 11, long_method 1 | ok |

### Line counting

- loc and comment_lines are right in all four new files; `//`, `#`, `/* */` and docblocks are comment lines, a trailing
  comment counts as comment and as code, attributes and comment markers in strings, heredoc and nowdoc are code.
- rloc is one too high as soon as a file has inline HTML after `?>`: EncounterEdgeCases 326 instead of 325. Isolated:
  `<?php`, one statement, `?>`, four HTML lines -> loc 7, rloc 8; the same without the HTML -> loc 3, rloc 3. The
  template copied to a `.php` name -> loc 20, rloc 18 with 2 blank lines and 1 comment line (17 expected).
- Zentaurenhöhle.php: loc 16, rloc 11, comment_lines 1, functions 1 as expected; complexity 1.

### Other files

- Promoted constructor parameters are missing everywhere: HitPoints.php (`__construct(private int $current, private int
  $max, private int $temporary = 0)`) reports max_parameters_per_function 1, Dice.php 0, Transactional.php 0.
- `min_complexity_per_function` is 0 in every file of the project that has more than one function, see above.
- `.phtml` is skipped by extension; renamed to `.php` the template is parsed (logic_complexity 2 for `if:` and
  `foreach:`, as expected).

### Unicode file name

Under `LC_CTYPE=POSIX` all three parsers drop `src/Domain/Model/Zentaurenhöhle.php` without a message: unified 36
instead of 37 files, dependency 35 instead of 36 files and 47 instead of 49 edges, domain 37 instead of 38 files. The
unified parser's list of ignored extensions does not name it. With `LC_ALL=C.UTF-8` the file is analysed by all three.
This is the JVM's file-name decoding, not the PHP grammar; the unicode identifiers inside the file are no problem.

## Domain language parser

```
ccsh domainlanguageparser -nc sample-projects/php -e "output,FINDINGS.md" -o output/domain.cc.json     exit 0, 38 files (37 .php + the .phtml)
... --stop-word-level MINIMAL     -> output/domain-minimal.cc.json      exit 0
... --stop-word-level AGGRESSIVE  -> output/domain-aggressive.cc.json   exit 0
... --exclude-tests               -> output/domain-no-tests.cc.json     exit 0, 37 files
... --comment-weight 0            -> exit 1, "--comment-weight must be positive, got 0", no file
```

`lenses.domain.nodes` holds the 38 files only; the root and the folders have no word list. The frequencies below are
the sums over all files (257 distinct words).

Expected words, all 17 present:

| word | freq | word | freq | word | freq |
| --- | --- | --- | --- | --- | --- |
| creature | 203 | points | 61 | encounter | 10 |
| roll | 85 | armor | 35 | lair | 10 |
| speed | 79 | damage | 35 | stable | 10 |
| hit | 69 | initiative | 23 | cellar | 9 |
| centaur | 20 | dice | 18 | treasure, hoard | 8 each |
| | | | | dungeon | 6 |

- Keywords: no PHP keyword appears (`class`, `function`, `public`, `match`, `yield`, `static`, `fn`, `catch`, `enum` as a
  keyword ...). `enum(3)` comes from the method name `staticEnumCall`.
- Technical and noise words at MODERATE:
  - `desotscellars(111)`, `centaursdomainmodel(51)`, `centaursapplication(21)`, `centaursdomainservice(18)`,
    `centaursadapterpersistence(12)` and three more: `namespace De\Sots\CellarsAndCentaurs\...` is not split at `\`.
    `desotscellars` is the second most frequent word of the project.
  - `construct(54)` from `__construct`.
  - Imported names count as identifiers of the importing file: `use RuntimeException` gives `runtime(3)` in
    EncounterResolver.php, the `use` lines of EncounterEdgeCases.php give `transactional`, `alignment`, `describable`,
    `fightable`, `such`, `zentaurenhöhle` with 3 each.
  - Docblock tags `param(10)`, `template(2)`, `throws(2)`.
  - English function words: `such(18)`, `one(15)`, `per(14)`, `all(5)`, `two(5)`, `always(4)`, `only(3)`, `against`,
    `before`, `between`, `every`, `how`, `let`, `over`, `them`, `until`, `nor`, `same` (2 each).
  - `id(78)`, `type(66)`, `total(27)`, `max(21)`, `value(15)`, `entity(14)`, `facade(12)`, `repository(11)`, `logger(9)`,
    `dto(6)`, `model(5)`, `attribute(6)`, `uuid(3)`, `countable(3)`; AGGRESSIVE removes `type`, `value`, `entity`,
    `facade`, `repository`, `param`, `logger`, `arguments`, `call`, `dto`, `model`, `init`, `method`, `template`.
  - `20(3)` from `new Dice(20)` in Dice.php.
  - MINIMAL adds `get(57)`, `exception(29)`, `service(27)`, `find(21)`, `set(21)`, `save(16)`, `base(12)`, `create`,
    `index`, `error`, `factory`, `read`, `update`. `util` and `test` are filtered at every level.
- Identifier splitting:

| form | identifier (file) | words found |
| --- | --- | --- |
| camelCase | `$walkingSpeed` (CreatureFacade) | walking, speed |
| snake_case | `$walking_speed` (CreatureServiceTest) | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` (HitPoints) | max, hit, points |
| PascalCase | `ArmorClass` | armor (`class` filtered) |
| Acronym | `XPValue` (Centaur) | xp(12), value |
| Digit | `$d20Roll`, `rollD20` (Dice) | d20(6), roll |
| Kebab in string | `'centaur-stable'` (CreatureFacade) | centaur(1), stable |
| Namespace | `De\Sots\CellarsAndCentaurs\Domain\Model` | desotscellars, centaursdomainmodel - wrong |
| Magic method | `__construct`, `__call`, `__toString` | construct, call; `string` filtered |
| Unicode | `Zentaurenhöhle`, `$rüstungsklasse` | zentaurenhöhle, rüstungsklasse - kept whole |

- Comments and strings: the planted sentences are counted (Creature.php `roams(2)`, `beasts(2)`, `dragons(2)`;
  HitPoints.php `drop(2)`, `recover(2)`, `lair(2)`; CreatureFacade.php `dungeon(2)`, `encounter(2)`, `starts(2)`;
  CreatureUtil.php `treasure`, `hoard`, `guards`; NoSuchCreatureException.php `dungeon(1)`). Weights are visible:
  identifier 3, comment 2, string 1. New markers: `griffin(2)`, `kobold(2)` (docblocks), `wyvern(2)` (`#` comment),
  `ogre(1)`, `vault(1)` (heredoc), `goblin(1)`, `tunnel(1)` (nowdoc), `blow(2)` (two match arm strings), `bestiary(2)`
  (`.phtml` comment) are all there with the expected weight. The code-like text inside heredoc and nowdoc is counted as
  string text (`comment(8)` in EncounterEdgeCases.php comes from "not a comment" in strings).
- Inline HTML is not read: `minotaur` and `basilisk` (EncounterEdgeCases.php), `tavern`, `notice`, `rare` (the template)
  do not appear. The PHP parts of the `.phtml` are read (`speed(6)`, `facade(3)`, `bestiary(2)`).
- No singularisation: `creatures(31)`, `speeds(21)`, `rolls(16)`, `centaurs(2)` next to their singulars. Names of called
  methods are not extracted (`createMock`, `expects`, `info` leave no word).
- Test file: included by default; `--exclude-tests` removes the file node and `centaurstestsdomainservice(3)`.
  `test_should_save_creature_to_the_stable` leaves `creature` and `stable`.
- German words: 5 of the 7 appear, 2 of them only because of the identifier.

| word | expected | found |
| --- | --- | --- |
| zentaurenhöhle | 5 | 6 = class name 3 + `use` in EncounterEdgeCases.php 3; the comment gives `zentaurenh(2)` + `hle` |
| rüstungsklasse | 5 | 3 from the property; the comment gives `stungsklasse(2)` |
| verlies, trefferpunkte, kreatur | 2 each | 2 each |
| größe | 1 | missing (`Größe` falls apart into pieces that are not kept) |
| höhle | 1 | missing; `hle(3)` = 2 from the comment + 1 from the string |
| gehören | - | `geh(2)`, `ren(2)` |

  In comments and strings a word is cut at every umlaut and at `ß`; identifiers keep them. German stop words leak:
  `unter(2)`, `dem(2)`, `und(2)`, `jeder(2)`, `der(1)`, `liegt(2)`. `die` is absent, and `die` is an entry of
  `php-keywords.txt`; `zu` does not appear.

## Changed since 2026-09-06

- Dependency parser, old files: nothing changed in substance after the port to the tree-sitter excavation site. All 40
  file edges of round 2 are reported again with the same flags, every missing and wrong item of the old report was
  reproduced (see the table), `--include-tests` adds the same 6 edges. Leaf kinds are written in lower case (`class`,
  `script`) in the cc.json.
- Domain parser: the lens no longer has word lists for the root and the folders (old report: 105 words at the root, 47
  nodes for 34 files; now 38 nodes for 38 files), so "expected words at the root node" can only be checked by summing
  the files. Every word entry now carries a `tfidf` value. `.phtml` is confirmed as analysed. All leak findings of the
  old report still hold with higher counts.
- New on old files (unified parser, first run for PHP): promoted constructor parameters are not counted as parameters,
  per-function complexity leaves out the function itself.
- `--comment-weight 0` is still rejected.

## Verdict

### Unified parser

- Missing:
  - `.phtml` files are skipped (`templates/creature-card.phtml`), reported as an unsupported extension. **Decision: accept.**
  - Promoted constructor parameters are not parameters (`EncounterEdgeCases::__construct`, HitPoints.php, Dice.php). **Decision: accept (derived from JavaScript: one per parameter, whatever its form).**
  - Variadic parameter `Speed ...$speeds` is not a parameter (`EncounterEdgeCases::variadic`). **Decision: accept (derived from Java).**
  - A `?->` chain is no message chain (`EncounterEdgeCases::nullsafeChain`, 4 calls). **Decision: accept.**
- Wrong:
  - rloc is one too high when inline HTML follows `?>` (EncounterEdgeCases.php 326 instead of 325; can exceed loc). **Decision: accept.**
  - `default:` and `default =>` count as a branch (`EncounterResolver::resolve`, `alternativeSwitch`, `switchFallthrough`,
    `matchExpression`, `matchTrue`): logic_complexity +1 each. **Decision: ignore (derived from Java).**
  - `xor` counts as a branch (`wordOperators`); `??` counts while `??=` does not (`nullCoalescing`,
    `nullCoalescingAssignment`). **Decisions: ignore — `xor`, the docs list it; accept — `??=` should count like `??` (derived from TypeScript).**
  - Per-function complexity leaves out the function itself (`describe`, `isEmpty` report 0), while the file-level
    `complexity` includes it. **Decision: ignore (derived from Java).**
  - Per-function statistics skip functions nested in a function (closure `$reroll`, `initiativeOf` in
    EncounterResolver.php: mean parameters 1.6 instead of 1.5, mean rloc 12 instead of 10.17) although
    `number_of_functions` counts them. **Decision: accept (derived from Java).**
- Bad:
  - A closure counts as a function only when it is assigned (`$reroll = function ...` yes, `return function ...` in
    `closureWithUse` no), so `number_of_functions` depends on the coding style. **Decision: accept (derived from Java).**
  - Under a POSIX locale `Zentaurenhöhle.php` is dropped without any message. **Decision: accept (derived from Java).**
  - The two-condition `match` arm `SpeedType::WALKING, SpeedType::CLIMBING => 30` counts 1, a `case 1: case 2:`
    fallthrough counts 2. **Decision: ignore — counting per label and per arm is documented.**
- Good:
  - loc, comment_lines and (without inline HTML) rloc are exact; `#` comments, docblocks, trailing comments, attributes,
    comment markers in strings, heredoc and nowdoc are all classified correctly.
  - `foreach`, `for`, `do … while`, `elseif`, `else if`, the whole alternative syntax, `?:`, `and` / `or`, union and
    multiple `catch`, arrow functions, generators, enum cases, bodiless interface methods, anonymous class methods.
  - long_method, long_parameter_list, message_chains (plain and `::` chains) and excessive_comments match.

### Dependency parser

- Missing:
  - Promoted constructor parameters give no edge (CreatureService -> Creatures, CreatureFacade -> CreatureService,
    PersistedCreatures -> CreatureRepository); the idiomatic PHP 8 form, it hides the cycle through CreatureService. **Decision: accept (derived from Java).**
  - `interface Boss extends Fightable, Describable`, `enum Alignment implements Describable`, `new class implements
    Fightable` (EncounterEdgeCases): inheritance and implementation only for named classes. **Decision: accept.**
  - Namespace import `use ...\Domain\Model;` + `Model\Creature` (CreatureUtil) and FQN `\De\...\Speed` (CreatureFacade). **Decision: accept (derived from Java).**
  - Nullable `?Creature`, variadic `Speed ...$speeds` and intersection `Boss&Describable` parameter types
    (EncounterEdgeCases). **Decision: accept (derived from Java).**
  - `catch (NoSuchCreatureException | RuntimeException $failure)` (EncounterEdgeCases), `catch` in CreatureLookup,
    `instanceof Centaur` (CentaurSpotter). **Decision: accept (derived from Java).**
  - `#[Transactional]` (CreatureFacade, EncounterEdgeCases). **Decision: accept.**
  - `use function` + call of `rollD20` (CreatureFacade, Creature). **Decision: accept (derived from Java).**
  - `require_once` / `require` / `include` (bootstrap.php, helpers.php, PersistedCreatures). **Decision: accept — for literal paths.**
  - `.phtml` files are not analysed and not mentioned (`templates/creature-card.phtml`). **Decision: accept.**
  - Trait bodies: `HasSpeeds` has no outgoing edge. **Decision: ignore.**
- Wrong:
  - `use Application\Dto\Creature as CreatureDto` (CreatureFacade) ends on `Domain/Model/Creature.php`; the DTO has no
    incoming edge. **Decision: accept (derived from Java).**
  - Traits `HasSpeeds`, `CountsRolls` are reported as `class`. **Decision: ignore.**
  - `PersistedCreatures -> CreatureFacade` (adapter level 2 -> application level 1) has no `isPointingUpwards`. **Decision: ignore — level 2 -> 1 runs with the flow, as the README defines the flag.**
- Bad:
  - One usage kind per leaf edge: `EncounterEdgeCases -> Dice` reads `argument` although the class is also instantiated. **Decision: ignore — documented (derived from Kotlin).**
  - Under a POSIX locale `Zentaurenhöhle.php` and its two edges vanish without a message. **Decision: accept (derived from Java).**
- Good:
  - No false edge from stdlib or vendor types, unused imports give no edge, the test file is skipped by default.
  - Plain parameter and return types, `new`, `::CONST`, enum case access, static calls, `::class`, `use const`, alias
    of a uniquely named class, group use, class `extends` / `implements`, trait use, closure parameter types.
  - Unicode class name `Zentaurenhöhle` resolves in both directions; several declarations in one file become separate
    leaves (`Dice`, `DiceRoll`, `rollD20`; `EncounterEdgeCases`, `CountsRolls`, `Rollable`, `Outcome`, `initiativeOf`).

### Domain language parser

- Missing:
  - Word lists for the root and the folders. **Decision: ignore (derived from Java).**
  - Inline HTML text (`minotaur`, `basilisk` in EncounterEdgeCases.php, `tavern` in the template). **Decision: accept.**
  - Names of called methods; singularisation. **Decisions derived from Java: ignore — singularisation.** **Decision derived from Kotlin: ignore — names of called methods.**
- Wrong:
  - Namespace names are not split at `\`: `desotscellars(111)` is the second most frequent word. **Decision: accept.**
  - Umlauts and `ß` cut words in comments and strings: `zentaurenh` + `hle`, `stungsklasse`, `geh` + `ren`; `größe` and
    `höhle` are lost (Zentaurenhöhle.php). **Decision: accept (derived from Java).**
  - `construct(54)` from `__construct`; `20(3)` from a number literal (Dice.php). **Decisions derived from Java: ignore — bare `20`.** **Decision: ignore — `construct`.**
- Bad:
  - No German stop words: `unter`, `dem`, `und`, `jeder`, `der`, `liegt` leak; `die` is a PHP keyword and absent. **Decision: ignore (derived from Java).**
  - `use` lines add the imported class names to the importing file with identifier weight (EncounterEdgeCases.php). **Decision: ignore.**
  - Docblock tags `param`, `template`, `throws` and English function words (`such`, `one`, `per`, `all`, `two`,
    `always`, `only`, `before`, `between`, `every`) leak at MODERATE. **Decision: ignore (derived from Java).**
  - Code-like text inside heredoc and nowdoc is counted as prose. **Decision: ignore.**
  - Under a POSIX locale `Zentaurenhöhle.php` is dropped without a message. **Decision: accept (derived from Java).**
- Good:
  - All 17 expected words; no PHP keyword leaks; camelCase, snake_case, SCREAMING_SNAKE, acronym, digit and kebab
    splitting are right; unicode identifiers stay whole.
  - `//`, `#`, `/* */`, docblocks, single-quoted strings, heredoc and nowdoc are all read with the weights 2 and 1.
  - `.phtml` is analysed; test files are included by default and removed with `--exclude-tests`.
