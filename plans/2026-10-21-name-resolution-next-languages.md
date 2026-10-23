---
name: dependency parser name resolution, the remaining languages
state: progress
version: 1
---

## Goal

Bring every language of `ccsh dependencyparser` to the state Java and Kotlin reach in
`plans/2026-10-21-name-resolution-spec.md`: its name rules written down, probes derived from them, and the resolver
following them, in small commits Christian reviews one by one. Branch `fix/dependency-name-resolution`.

## Resume here (for a fresh agent)

- **State:** Java, Kotlin, C#, Go and Python are done. Branch `fix/dependency-name-resolution-python` (cut from
  `fix/dependency-name-resolution-go`) holds the Python commits; Christian pushes it and reviews it on GitHub. Next:
  ask Christian which language comes next (AskUserQuestion), or pick one when he leaves it to you.
- **Branches, stacked:** one branch per language, cut from the previous language's branch once Christian has pushed
  it (`git switch -c fix/dependency-name-resolution-<language>` on top of it), never from `main`. Small commits, one
  per item of the announced numbered list; Christian reviews the branch as a whole when the language is done. Tell him
  then, with the commit list, the checks and the regressions; he pushes.
- **Rules from Christian:** ask before every modelling decision, with a drawn example; one commit per change, test
  first; structural changes in their own `refactor` commit before the behaviour change; a language's rules in its own
  folder; report every regression as "correct but regression" (the new output follows the spec) or "bad and
  regression" (fix it before the commit); commit only in an `&&` chain behind the green checks; diff every edit of a
  `known-gaps.md` against HEAD before committing.
- **Tools** (`.claude/name-resolution-tools/`, git-ignored): `ccsh-baseline` (the release build), `cp-probes` (the
  197 checkpoint probes) with `cp-compare.py`, `edgediff.py`, `lines.py`, and two scripts that take build tags; a
  build tag is a copy of `analysis/build/install/codecharta-analysis` in `ccsh-<tag>`, and `ccsh-py12` is the head
  of the Python branch, the comparison build for the first commit of the next language:
  - `accept.sh <prev> <new>`: edge diffs on samples, `analysis/`, `visualization/app`; the probes against their
    expectations; the checkpoint probes against the release; the gate on both parts.
  - `xcheck.sh <prev> <new>`: the whole output of both builds on every sample, probe, checkpoint probe, `analysis/`
    and `visualization/app`; for a refactor it must say 0 differences, otherwise only the language's files may differ.
- **One commit, the chain** (`chain.sh <prev> <new>` in the tools folder runs all of it): `cd analysis &&
  ./gradlew ktlintCheck test && ./gradlew distTar installDist && ./gradlew integrationTest`, copy the build to
  `ccsh-<tag>`, `npm run format:check`, `accept.sh`, `xcheck.sh`, then commit. A run with `--bypass-gitignore` also reads `build/` copies of test resources; edges between such copies are
  no regression of real code.

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
- A copy rule follows the using file's language, never the logical path: `CopyRules` per language, `NearestCopy` by
  default, `SqlCopyRules` (latest migration) and `CSharpCopyRules` (every file of the nearest project) in their folders.
- A language's own rules live next to its analyzer (`analyzers/<language>/`): `NameRules` (lookup order, step after
  resolution), `CopyRules`; `processing/dependencies/LanguageRules` picks them. Shared code changes only when it is
  good for every language and the cross-language check shows the others unchanged; Christian says yes first.
- In `treeSitterExcavationSite`, `shared/domain` holds only what every language uses; a helper of a language family
  lives in one language's folder (`kotlin` uses `java`'s `LocalTypeScopes`, `cpp` uses `c`).
- An existing test that encodes behaviour a spec decision changed is rewritten to the decision, with its name.

## Order and state

- Done: Java, Kotlin (see the plan above), C#, Go, Python. Next, by Christian's choice when asked: TypeScript and
  JavaScript (with Vue and Angular templates), C and C++, PHP, Rust, Delphi, SQL.
- Material: the checkpoint branch `fix/nearest-file-for-shared-logical-path` holds an earlier, unreviewed attempt and
  its reviewer probes; use them for ideas and as the regression net, not as code to copy.

## C# (done, 2026-10-22)

Spec `docs/name-resolution/csharp.md` (decisions 1–6), 39 probes under `sample-projects/regression/csharp/`, no gap
left. The first part is on `main`; the rest (`file` types, copies by project) is on branch
`fix/dependency-name-resolution-csharp`, waiting for Christian's push and review. Checkpoint probes worse than the
release by decision: `java/r1-jnest` (nested = own leaf), `csharp/r3-cs2proj`, `r3-csmix`, `r3-csnested` (copies
without a `.csproj` are one project).

## Go (done, 2026-10-22)

Spec `docs/name-resolution/go.md` (decisions 1–5), 29 probes under `sample-projects/regression/go/`, no gap left; all
on branch `fix/dependency-name-resolution-go`, waiting for Christian's push and review. Import paths go through
`GoModules` (`go.mod`, `vendor/`, suffix fallback), `GoImports` writes a selector through an import as the full path,
`GoNameRules` resolves it and simple names (own package, dot imports, predeclared), `GoCopyRules` points at every
build-tag variant, `LocalNames` in the extractor hides what a function declares. Checkpoint probe worse than the
release by decision: `go/r3-g1` (`LocalType -> closure.go#util`, a function-local type is no target). The go.mod
mapping and `GoNameRules` had to go into one commit, and the external test package before the copy rule: either alone
drew wrong edges.

## Python (done, 2026-10-23)

Spec `docs/name-resolution/python.md` (decisions 1–5), 40 probes under `sample-projects/regression/python/`, each
checked in CPython 3.14, no gap left; all on branch `fix/dependency-name-resolution-python`, waiting for Christian's
push and review. Christian: "do it like the interpreter does it, else like the other languages". The extractor finds
the binding Python sees for every name (`LocalScopes`, `ModuleBindings`, `ScopeBindings` with branches, `PythonUses`)
and reports a use as module prefix (`.` per leading dot, last `*` for a wildcard import) plus dotted name, with
`fallbacks` for wildcard imports; the analyzer writes the paths it can have (`ModuleCandidates` over the import roots
of `PythonModules`, `WildcardExports` reading `__all__`), and `PythonNameRules` takes the first that is a declaration.
Shared change, approved by Christian: `UsedType.fallbacks` (TSE) and `Type.fallbacks` (parser, tried by
`NodeResolution`). Checkpoint probes worse than the release by decision: `python/r1-pyroot` (the file's folder and
the suffix fallback are roots), `r3-p4` (package before module), `r5-nested-class-shadow` (a nested class is a leaf of
its own; `Outer.Node` is no use of `Outer`). Order lessons: the import roots had to wait until a name behind a module
alias resolved through it and attribute names stopped being plain names, or `am.Model` lost to the bare `Model`; a
decision asked mid-way (5, alternatives) went in as spec, probes, then the implementation.

## TypeScript, JavaScript, Vue and Angular templates (in progress, 2026-10-23)

Branch `fix/dependency-name-resolution-typescript`, cut from the pushed Python branch; comparison build of the first
commit `ccsh-py12`, then `ccsh-ts<n>`. Christian chose all four at once and decisions 2 to 6 of
`docs/name-resolution/typescript.md`; 7 to 9 follow Java, Python and Go. 78 probes under
`sample-projects/regression/{typescript,javascript,vue,angular}/`, 39 gaps at the start. Every TypeScript probe compiles
in tsc 6.0.3 (`visualization/node_modules/.bin/tsc`, moduleResolution bundler).

Target design, as Python: the extractor finds the binding of every name (scopes in TSE `languages/javascript`) and
reports a use as its module specifier plus the exported name and the members behind it; the analyzer (`typescript/`,
shared by JavaScript and Vue) resolves the specifier to a file (`ModuleFiles`), the name to what that module exports
(`ModuleExports`, read per file and cached per analysis root, as Python's `WildcardExports`) or to a global
(`GlobalDeclarations`), and writes the exact path; the name rules then take a path only as written.

Steps, one commit each:

1. [ ] refactor: TypeScript, JavaScript and Vue get name rules of their own, the default ones for now
2. [ ] a top-level declaration that a module does not export is file-scoped
3. [ ] a module specifier means the file the compiler finds (endings, `.js` for `.ts`, `package.json`, `index`)
4. [ ] a bare specifier means the workspace package of that name
5. [ ] default exports: a named one under its own name, an anonymous one `default`, a default import finds it
6. [ ] `export { A as B }` without `from` names the own declaration
7. [ ] an imported name exported again is a re-export
8. [ ] `export *` without the default export, unexported and ambiguous names
9. [ ] `export * as ns` is a module, a chain through it walks on
10. [ ] names a function, block, class or type parameter binds hide the module's
11. [ ] a lower-case JSX tag is no name; every name through a namespace import is one
12. [ ] a name bound by destructuring is a declaration
13. [ ] what a namespace exports is a leaf of its own
14. [ ] top-level code is a script leaf
15. [ ] a side-effect import or unbound `require` uses the script leaf
16. [ ] a name read from a dynamic import's result
17. [ ] globals of script files and `declare global`
18. [ ] CommonJS: `require` binds the module, `module.exports` is the default export
19. [ ] resolve a name only through the binding the compiler sees (the heuristics go)
20. [ ] Vue: a default import of a `.vue` file names its component
21. [ ] Vue: tags by binding, `components`, global registration, the one component
22. [ ] Vue: template expressions are uses, an import alone is none
23. [ ] Vue: named exports of a plain `<script>`
24. [ ] Angular: attribute directives
25. [ ] changelog, README, gh-pages, plan

## Steps

- [x] Ask Christian which language comes next: C# (2026-10-22)
- [x] Next language: Go (left to Claude by Christian, 2026-10-22), done 2026-10-22
- [x] Next language: Python (left to Claude by Christian, 2026-10-23), done 2026-10-23
- [ ] Next language: TypeScript, JavaScript, Vue and Angular templates (left to Claude by Christian, 2026-10-23)
- [ ] For each language: spec, probes, implementation commits, acceptance
