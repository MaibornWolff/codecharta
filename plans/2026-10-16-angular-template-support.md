---
name: Angular template (HTML) support in all three lenses
state: complete
version: 1
---

## Goal

Angular code bases show zero for their `.html` templates. Parse `.html` files with the MIT grammar
dlvandenberg/tree-sitter-angular (extends tree-sitter-html, so plain HTML works too) and feed the
metrics, dependency and domain lenses.

## Tasks

### 1. Grammar jar
- Clone bonede/tree-sitter-ng into a scratch folder, run its `gen` task for tree-sitter-angular v0.9.2
- Commit the jar to `treeSitterExcavationSite/libs/` like tsx/pascal, note its origin in `libs.versions.toml`

### 2. Language in treeSitterExcavationSite
- `Language` entry, registry, `languages/angular/` definition with metric and extraction mappings
- Metrics: control flow (`@if`/`@else`, `@for`, `@switch`/`@case`, `@defer`), structural directives
  (`*ngIf`, `*ngFor`, `*ngSwitchCase`), `&&`/`||`/ternaries in bindings, comments
- Extraction: identifiers in bindings and interpolations, comments, text for the domain lens

### 3. Dependencies
- Template → component edges: element tags matched to the `.ts` file declaring that `selector`
- Pipes → the `.ts` file declaring that `@Pipe` name, if the dependency architecture allows it

### 4. Wiring, samples, docs
- `FileExtension`, UnifiedParser, DependencyParser, DomainLanguageParser registration
- `sample-projects/angular/` (Cellars and Centaurs) with `FINDINGS.md`
- READMEs, docs, `analysis/CHANGELOG.md`

### 5. User-facing attribute texts in the domain lens
- Extract plain attribute values whose name marks user-facing text (`title`, `alt`, `placeholder`, `aria-label`, …,
  and names ending in hint/label/title/text/tooltip/placeholder/description/message); CSS classes and icons stay out

## Steps

- [x] Complete Task 1: Grammar jar
- [x] Complete Task 2: Language in treeSitterExcavationSite
- [x] Complete Task 3: Dependencies
- [x] Complete Task 4: Wiring, samples, docs
- [x] Complete Task 5: User-facing attribute texts in the domain lens

## Notes

- Branch `feature/angular-template-support`, own worktree, committed but not pushed
- Out of scope: inline `template:` strings inside `.ts` files
- `sample-projects/angular/FINDINGS.md` committed separately from the content the implementing subagent handed over
