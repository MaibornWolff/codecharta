# Angular

Report of 2026-10-16 (first round), outputs in `output/` from the CLI built on `feature/angular-template-support`.
Before that branch every `.html` file was skipped by all three parsers. This project is about the templates; the
component TypeScript is covered by `sample-projects/typescript`.

## Project
- Angular 20, standalone components: `package.json` (`@angular/core`), `tsconfig.json`, `src/main.ts`, `src/index.html`,
  `src/app/{domain/model,domain/service,ui,ui/pipes,ui/pipes/dice,ui/pipes/legacy}`. 33 files: 24 `.ts` (one `.spec.ts`),
  8 templates, the plain host page `index.html`.
- Components with template files: app (`cc-root`), creature-list, creature-card, speed-badge (`cc-speed-badge, cc-speed-tag`),
  zentaurenhoehle-panel, encounter-resolver, encounter-edge-cases; treasure-chest has an inline `template:`.
  Pipes `hitPoints`, `armorClass`, and `roll` twice (dice/, legacy/); attribute directive `[ccGlow]`.
- Constructs: @if/@else if/@else, @for+track+@empty, @switch/@case/@default, @defer with triggers/@placeholder/@loading/@error,
  @let, *ngIf+else, *ngFor+trackBy, [ngSwitch]/*ngSwitchCase/*ngSwitchDefault, [ngIf] on ng-template, all binding kinds,
  `&&` `||` `?:` `??` `?.` `!` `$any()`, pipes with arguments, ICU, ng-container/ng-content, library elements,
  `<script>`/`<style>`, comment markers in strings.
- Domain texts of the README in creature-card / creature-list templates and the treasure-chest inline template; German in
  zentaurenhoehle.ts and zentaurenhoehle-panel.component.html. Template-irrelevant stress constructs (imports, generics, …)
  belong to the TypeScript sample.

## Expected values (written before the run)
Rule: @if, @else if, @for, each @case, @defer, *ngIf, *ngFor, *ngSwitchCase, [ngIf]/[ngForOf]/[ngSwitchCase], `&&`, `||`,
`?:`, `??` +1; @else/@empty/@default/@placeholder/@loading/@error, *ngSwitchDefault, `?.`, `!`, ICU cases 0;
complexity = logic_complexity.

| file | loc | rloc | comment | logic |
| --- | --- | --- | --- | --- |
| index.html | 10 | 10 | 0 | 0 |
| app.component.html | 14 | 13 | 1 | 1 |
| ui/creature-list.component.html | 11 | 10 | 1 | 1 |
| ui/creature-card.component.html | 19 | 15 | 4 | 6 |
| ui/speed-badge.component.html | 12 | 11 | 1 | 6 |
| ui/zentaurenhoehle-panel.component.html | 5 | 4 | 1 | 0 |
| ui/encounter-resolver.component.html | 34 | 24 | 11 | 11 (excessive_comments 1, ratio 0.46) |
| ui/encounter-edge-cases.component.html | 23 | 22 | 1 | 7 |

Dependencies: index→app; app→5 components (not router-outlet, uppercase); list→speed-badge, hitPoints; card→speed-badge,
hitPoints, armorClass (not titlecase, ambiguous roll, [ccGlow]); panel→armorClass; edge cases→treasure-chest (inside @defer).
13 edges.

## Dependency parser
- Both runs (with/without `--include-tests`) ok; 48 file edges, 13 from templates; spec file declares nothing.
- All 13 expected template edges found, none extra, none cyclic or upwards. Template leaf: kind `script`, named after the
  file with ending (`creature-card_component_html`), language `angular`.
- Unresolved as intended: router-outlet, mat-icon, uppercase, titlecase, ambiguous `roll`.
- Gap: attribute directives (`[ccGlow]`) draw no edge. **Fixed 2026-10-26 (typescript.md decision 14: a template element uses every
  class whose selector matches it).**
- Known gaps of the name rules (`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`): listed
  per probe in `regression/angular/known-gaps.md`.

## Unified parser
- All 33 files analysed; all 9 HTML files match the expected table exactly; function metrics 0.
- Comment markers inside attribute values/strings were lexed as comments by tree-sitter-angular 0.9.2 (first run: 2 comment
  lines in edge cases) — fixed on the branch.
- Every `.html` (plain pages, reports) is measured; exclude with `-e` where unwanted.

## Domain language parser
- Expected words all files / templates only: creature 109/77, centaur 5/2, cellar 8/6, dungeon 7/7, armor 31/14, hit 40/21,
  points 37/18, speed 51/30, damage 10/5, lair 4/2, initiative 10/7, encounter 11/5, treasure 12/6, hoard 1/1, stable 6/3,
  dice 2/0, roll 29/9.
- User-facing attribute values (second round, 2026-10-16): the values of `title`, `alt`, `placeholder`, `aria-label`,
  `aria-description`, `aria-placeholder`, `label` and of every attribute whose name ends in hint, label, title, text, tooltip,
  placeholder, description or message (`hoverHint`, `empty-message`, `pageTitle`) count as strings. Added to the sample:
  `title="Creature of the cellar"` (with `i18n-title`) and `hoverHint="Dash to the lair before the dragon wakes"` in
  creature-card, `aria-label="Dash away from the encounter"` (beside `type="button"`) in speed-badge,
  `aria-label="Dungeon overview"` (beside `class="dungeon"`) in app. They add cellar +1, dungeon +1, lair +1, encounter +1,
  creature +1, dragon +1, and `wakes`, `away`, `overview`; `i18n-title`, `type` and `class` add nothing. Line metrics and
  dependency edges are unchanged.
- German in templates (first round): zentaurenhöhle 3, verlies 3, rüstungsklasse 1, trefferpunkte 1, kreatur 1, größe 1,
  höhle 1; stop words die/dem/unter/liegt/und/jeder leak.
- true/false and `emit` leaked in the first run, now in the template keyword list; length/value/class left in on purpose.
- Not extracted by design: binding targets, ngIf/ngFor names, $event/$index, the values of attributes that hold no
  user-facing text (`class`, `style`, `id`, `icon`, `type`, `href`, `src`, ...), `i18n-*` markers, control-flow keywords.

## Changed by the gap fixes (2026-10-16, tree-sitter-angular 0.9.2-codecharta.1)
- Sample changes: `creature-card.component.html` got `class="creature-card {{ creature.isWounded() ? 'wounded' : 'healthy' }}"`
  on its existing line, the inline template of `treasure-chest.component.ts` an `@if (gold > 100)` around its text.
- Unified: an interpolation inside a plain attribute value is an expression (creature-card logic 6 -> 7); each ICU case
  but `other` counts (encounter-edge-cases 7 -> 9: `=0` and `=1`); `(window:resize)` parses; the inline template adds its
  decisions to `treasure-chest.component.ts` (complexity 0 -> 1). Templates in total: logic complexity 32 -> 35, lines
  unchanged.
- Dependency: 48 -> 56 file edges. Every component with a `templateUrl` points at its template (7 new `.ts -> .html`
  edges); `roll`, declared by two pipes, now resolves through the imports of the component: `creature-card.component.html
  -> pipes/dice/roll.pipe.ts` (template edges 13 -> 14), and the inline template of `treasure-chest.component.ts` reaches
  the same pipe. `legacy/roll.pipe.ts` stays without incoming edge, as it should.
- Domain: text weighs like identifiers in templates and inline templates (3 instead of 1), so the planted sentences and
  attribute texts gain weight; identifiers beyond ASCII are read: `höhle` and `rüstungsklasse` 6 each in
  `zentaurenhoehle-panel.component.html`. Expected words, templates only: creature 84, centaur 6, cellar 10, dungeon 13,
  armor 14, hit 29, points 20, speed 30, damage 9, lair 6, initiative 7, encounter 7, treasure 6, hoard 3, stable 9, roll 9.
  The inline template of `treasure-chest.component.ts` counts for that file: treasure 6, hoard 3, guards 3.

## Changed by the grammar fixes (2026-10-16, tree-sitter-angular 0.9.2-codecharta.2)
- The grammar reads the rest of the expression syntax real templates use: unary `-`, `+` and `typeof`, `?.()`, `?.[]`,
  calls of a call or of `!`, the non-null `!`, any expression as call argument, ternary branch, array element or pipe
  argument, a pipe after the last operand, `attr.x="{{ }}"`, a binding without a value, `@for` lets before `track` and
  structural directives with expression values and trailing lets.
- The sample's numbers are unchanged, it holds none of these. Templates that parse without an `ERROR` node: visualization
  180 -> 184 of 184, Bitwarden 756 -> 811 of 811; `inspectorNodeBadges.component.html` gains the ternary around
  `-count.removed` (logic 5 -> 6).

## Changed by review round 1 (2026-10-16)
- Unified and dependency: the sample's numbers are unchanged.
- Domain: the string literals of template expressions keep the string weight (1 instead of 3), pipe names (`hitPoints`,
  `armorClass`, `roll`) and the exported values of `*ngFor` (`first`) are no identifiers, and `select` of
  `select($event)` is no stop word any more. Expected words, templates only: creature 84, centaur 4, cellar 10,
  dungeon 13, armor 8, hit 21, points 14, speed 30, damage 9, lair 6, initiative 7, encounter 7, treasure 6, hoard 1,
  stable 7, roll 6. The inline template of `treasure-chest.component.ts` no longer adds `roll`.

## Changed by review round 3 (2026-10-16)
- Unified, dependency and the template words are unchanged. The `.ts` files gain the strings of their exported code at
  string weight, which were skipped like module paths: the selectors and `templateUrl`s of the decorators (`card` 3 -> 5
  in `creature-card.component.ts`, `html` 1 in every component with a template file), `providedIn: 'root'`, and the
  string values of exported enums and constants (`dragon` 3 -> 4 in `creature-type.ts`).

## Verdict
Unified: Good – all templates and inline templates measured, counts exact, ICU cases counted. Bad – every .html is measured.
Dependency: Good – every template edge expected, a component points at its template, ambiguous names resolve through the
component's imports or module. Missing – attribute directives (fixed 2026-10-26, decision 14).
Domain: Good – template vocabulary is the component's domain, text weighs like identifiers. Bad – German stop words leak.
