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
- Gaps: attribute directives (`[ccGlow]`) and inline `template:` draw no edge; no compilation scope, so a selector declared
  twice resolves to neither; no template↔own-component edge.

## Unified parser
- All 33 files analysed; all 9 HTML files match the expected table exactly; function metrics 0.
- Comment markers inside attribute values/strings were lexed as comments by tree-sitter-angular 0.9.2 (first run: 2 comment
  lines in edge cases) — fixed on the branch.
- Grammar limits, not fixed: `(window:resize)` is a local parse error; identifiers are ASCII only.
- Every `.html` (plain pages, reports) is measured; exclude with `-e` where unwanted.

## Domain language parser
- Expected words all files / templates only: creature 108/76, centaur 5/2, cellar 7/5, dungeon 6/6, armor 31/14, hit 40/21,
  points 37/18, speed 51/30, damage 10/5, lair 3/1, initiative 10/7, encounter 10/4, treasure 12/6, hoard 1/1, stable 6/3,
  dice 2/0, roll 29/9.
- German in templates: zentaurenhöhle 3, verlies 3, rüstungsklasse 1, trefferpunkte 1, kreatur 1, größe 1, höhle 1; stop
  words die/dem/unter/liegt/und/jeder leak. Missing: identifiers of `höhle.rüstungsklasse` (grammar is ASCII-only).
- true/false and `emit` leaked in the first run, now in the template keyword list; length/value/class left in on purpose.
- Not extracted by design: binding targets, ngIf/ngFor names, $event/$index, plain attribute values, control-flow keywords.

## Verdict
Unified: Good – all templates measured, counts exact. Bad – every .html is measured. Missing – ICU cases not counted.
Dependency: Good – 13/13 template edges, no false positive, ambiguous names stay unresolved. Missing – attribute directives,
inline templates, compilation scope.
Domain: Good – template vocabulary is the component's domain. Wrong – non-ASCII identifiers cut apart. Bad – German stop words
leak.
