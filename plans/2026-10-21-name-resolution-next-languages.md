---
name: dependency parser name resolution, the remaining languages
state: progress
version: 1
---

## Goal

Bring every language of `ccsh dependencyparser` to the state Java and Kotlin reach in
`plans/2026-10-21-name-resolution-spec.md`: its name rules written down, probes derived from them, and the resolver
following them, in small commits Christian reviews one by one. Branch `fix/dependency-name-resolution`.

## How one language is done

1. **Spec.** `analysis/analysers/parsers/DependencyParser/docs/name-resolution/<language>.md`, one page, in the shape
   of `java.md`: declarations and their logical path; where a simple name is looked up, in order, first match wins,
   from the language's specification; qualified names; what is not supported; open questions. Ask Christian every
   open question (AskUserQuestion, with a drawn example when it is about modelling), write the answers into the page
   as decisions. Christian reviews the page before any code.
2. **Probes.** One per rule and per collision of two rules, under `sample-projects/regression/<language>/spec-<rule>/`
   (`src/`, `expected.txt` whose first line names the rule). The expected edges come from the rule, never from the
   parser's output; keep probes free of cycles unless a rule is about cycles. Run them; every deviation becomes a
   section of `sample-projects/regression/<language>/known-gaps.md` (why, then `missing`/`extra` lines), and
   `FINDINGS.md` of the language points at that file. Add a table rule → probe → ok/gap to the spec page.
3. **Implementation.** One commit per group of gaps, test first: delete the gap lines, see the probe fail, fix, see
   it pass. Change only that language (or its name scope); a structural change goes into its own `refactor` commit
   before the behaviour change.

## Acceptance of every commit

- `./gradlew ktlintCheck test`, then `./gradlew distTar installDist` **as a command of its own** (a failing test
  stops Gradle before `installDist`, and a stale `ccsh` falsifies every measurement), `./gradlew integrationTest`,
  `npm run format:check`, `ccsh gate analysis --quiet` and `ccsh gate visualization --quiet` (the latter in a clean
  worktree) with 0 errors and no new warnings.
- `python3 sample-projects/tools/compare_dependency_builds.py <ccsh>`: 0 differing.
- Edge diff against the previous commit's build on `sample-projects` (`-e regression`), `analysis/` and
  `visualization/app`, file edges and leaf edges; explain every change in the commit message. Edges of files the
  commit itself adds or changes are expected.
- The checkpoint's 197 reviewer probes, `git archive b4a6bb8af sample-projects/regression | tar -x -C <dir>`, run
  against the release build and the new one: no probe may lose a correct line or gain a wrong one, unless a decision
  in a spec page says the probe's expectation is outdated (state which).
- CHANGELOG (one bold title and one sentence, Added for new things, Fixed for fixes), the README and
  `gh-pages/.../dependency.md` where the behaviour is described, the spec page's table.

## Conventions learned so far

- Shared rules live in `docs/name-resolution/README.md` and change every language; say so in the commit and measure
  all languages.
- A copy rule follows the using file's language, never the logical path: C# keeps the first declaring file until its
  spec exists (partial classes, `file` types, `.csproj`), SQL the latest migration.
- In `treeSitterExcavationSite`, `shared/domain` holds only what every language uses; a helper of a language family
  lives in one language's folder (`kotlin` uses `java`'s `LocalTypeScopes`, `cpp` uses `c`).
- An existing test that encodes behaviour a spec decision changed is rewritten to the decision, with its name.

## Order and state

- Done or in progress: Java, Kotlin (see the plan above). Next, by Christian's choice when asked: C#, TypeScript and
  JavaScript (with Vue and Angular templates), Python, Go, C and C++, PHP, Rust, Delphi, SQL.
- Material: the checkpoint branch `fix/nearest-file-for-shared-logical-path` holds an earlier, unreviewed attempt and
  its reviewer probes; use them for ideas and as the regression net, not as code to copy.

## C# (in progress, 2026-10-22)

Done: spec (`beee1e14b`), probes (`3775f95a9`), items 1–7 of the gap list (nested type own leaf, type parameters,
base-list kinds, nested types first, aliases, namespace lookup order). Cross-language check after them: only edges
between `.cs` files changed.

Decided 2026-10-22 (Christian): a language's name rules live next to its analyzer, behind one interface; shared code
changes only when the cross-language check proves every other language unchanged.

- [x] refactor: `NameRules` interface in `analysis/model` (resolve the names of one declaration; a step after all
  nodes are resolved), `DefaultNameRules` = today's behaviour for every language; `DependencyResolverService` picks the
  rules per language as it picks the standard library (`c8151e304`)
- [x] refactor: `Dependency.declaredIn` becomes the language-neutral `scope` (where an import is written) (`1fc9db813`)
- [x] refactor: C# into `analyzers/csharp/CSharpNameRules` (namespace lookup, nested types, implemented interfaces) (`d4f586e1e, fix f98e47117`)
- [x] refactor: Java and Kotlin into `analyzers/java/JavaNameRules` (packages, star imports, qualified names) (`0eec50f0e`)
- [x] fix: item 8, qualified names relative to the enclosing namespaces and `global::`, in `CSharpNameRules`
- [x] item 9, attributes by the compiler's choice (decision 6): spec and probes `72914313e` (gap section restored in
  `df781e4fe`), `ProjectNames` per language `d3e9b3ed0`, parser `151de7d2c`, extractor `e777e7328`
- [ ] item 10, `file` types: extractor `isFileScoped` done; next: `CSharpAnalyzer` passes it on (closes `spec-file-type`)
- [ ] items 11–12: copies to the nearest file, partial types per `.csproj` (behind a C# hook, not in `DeclaringFiles`)

## Steps

- [x] Ask Christian which language comes next: C# (2026-10-22)
- [ ] For each language: spec, probes, implementation commits, acceptance
