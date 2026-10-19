---
name: Fix the known gaps of Angular template and SQL support
state: complete
version: 1
---

## Goal

Close the gaps found in review of `feature/angular-and-sql-support`, as decided with the user on 2026-10-16.
Work happens in two parallel worktrees branched from `feature/angular-and-sql-support`; the commits are
cherry-picked back onto it in their order.

## Tasks

### 1. Shared (SQL worktree, first, structural before behavioural)
- Refactor the 21-branch `when`s in `TreeSitterAdapter.kt` and `LanguageRegistry.kt` below the gate limit of 20
- Exclude `**/grammars/**` from the analysis gate (grammar DSL and lexers, like the generated parser)

### 2. Angular grammar, vendored and patched
- Copy tree-sitter-angular 0.9.2 to `analysis/treeSitterExcavationSite/grammars/angular/`, rebuild the jar
- Fix: non-ASCII identifiers, `{{ }}` inside plain attribute values parsed as interpolation, `(window:resize)`
- Add `ANGULAR` to `GrammarLoadingTest`

### 3. Angular lenses
- Inline `template:` strings in `@Component`: complexity, words and selector/pipe edges added to the `.ts` file
- Ambiguous selectors resolve via the owning component's `imports: [...]` / NgModule declarations
- Edge component `.ts` → its `templateUrl` template
- ICU message cases +1 each (`other` not counted)
- Domain: identifiers and text weigh the same in template content; other languages unchanged
- Find and fix why 5 single-declared selectors in the visualization draw no edge (e.g. `cc-distribution-metric`)
- Kept as documented gaps: attribute directives, German stop words, all `.html` measured

### 4. SQL grammar
- Fix as many legacy-code parse errors as possible: `LOOP` as identifier, `OPENROWSET`, MySQL `label:loop`, `#end`,
  backslashes in double quotes, `(.a BIGINT)`, unclosed brackets, Oracle 21c iteration controls, multi-line psql
  `\copy`, `"Spec\"s"`; T-SQL routines without `BEGIN…END` end at `GO` / the next `CREATE`, not the first `;`

### 5. SQL lenses
- Complexity: `IIF`, `EXIT WHEN` / `CONTINUE WHEN` +1; MySQL single-statement functions count as functions
- rloc per function no longer counts the `END` line
- Dependencies: an object created in several files resolves to the last file in path order; quoted names match
  case-sensitively, unquoted ones ignore case
- Domain: filter dialect names, catalog/system-view words and `id`
- Check that the jar rebuilds reproducibly from `grammars/sql/README.md`
- New metrics per file: `number_of_stored_procedures`, `number_of_triggers`, `number_of_views`, `number_of_tables`;
  shown like the existing metrics show for languages that don't support them

## Steps

- [x] Complete Task 1: Shared
- [x] Complete Task 2: Angular grammar, vendored and patched
- [x] Complete Task 3: Angular lenses
- [x] Complete Task 4: SQL grammar
- [x] Complete Task 5: SQL lenses
- [x] Cherry-pick both onto `feature/angular-and-sql-support`, full checks, regenerate the review maps
- [x] Review loop: two reviewer subagents over the whole branch (`main..feature/angular-and-sql-support`; one Angular,
  one SQL + shared) for clean code, SOLID, KISS, comments, simplicity and bugs; from round 2 on the user picks which
  findings get fixed before any fix starts; review again until a round finds nothing

## Notes

- Kept: generated `parser.c` stays in git; native libs verified by the user on macOS, CI covers Linux x64
- Every check before each commit: ktlintCheck test, distTar + integrationTest, format:check, `ccsh gate analysis`
- The 5 missing visualization edges come from the map's input, not the parsers: `-e dist,out,build` (regex, matched
  anywhere in the path) left out every file whose path contains out, build or dist (layoutTab, distributionMetric, routing/,
  streetLayout/, …). Decided: `-e` stays a regex; maps use anchored patterns
- Review loop ran six rounds; the user ended it after round 6. Findings the user did not pick were accepted as they are
