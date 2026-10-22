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

- **State:** Java, Kotlin and C# are done; Go is in progress on branch `fix/dependency-name-resolution-go`, cut from
  `fix/dependency-name-resolution-csharp`. See the section "Go" below for where it stands.
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
  build tag is a copy of `analysis/build/install/codecharta-analysis` in `ccsh-<tag>`, and `ccsh-csharp` is the head
  of the C# branch, the comparison build for the first commit of the next language:
  - `accept.sh <prev> <new>`: edge diffs on samples, `analysis/`, `visualization/app`; the probes against their
    expectations; the checkpoint probes against the release; the gate on both parts.
  - `xcheck.sh <prev> <new>`: the whole output of both builds on every sample, probe, checkpoint probe, `analysis/`
    and `visualization/app`; for a refactor it must say 0 differences, otherwise only the language's files may differ.
- **One commit, the chain:** `cd analysis && ./gradlew ktlintCheck test && ./gradlew distTar installDist &&
  ./gradlew integrationTest`, copy the build to `ccsh-<tag>`, `npm run format:check`, `accept.sh`, `xcheck.sh`, then
  commit. A run with `--bypass-gitignore` also reads `build/` copies of test resources; edges between such copies are
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

- Done: Java, Kotlin (see the plan above), C#; in progress: Go. Next, by Christian's choice when asked: TypeScript
  and JavaScript (with Vue and Angular templates), Python, C and C++, PHP, Rust, Delphi, SQL.
- Material: the checkpoint branch `fix/nearest-file-for-shared-logical-path` holds an earlier, unreviewed attempt and
  its reviewer probes; use them for ideas and as the regression net, not as code to copy.

## C# (done, 2026-10-22)

Spec `docs/name-resolution/csharp.md` (decisions 1–6), 39 probes under `sample-projects/regression/csharp/`, no gap
left. The first part is on `main`; the rest (`file` types, copies by project) is on branch
`fix/dependency-name-resolution-csharp`, waiting for Christian's push and review. Checkpoint probes worse than the
release by decision: `java/r1-jnest` (nested = own leaf), `csharp/r3-cs2proj`, `r3-csmix`, `r3-csnested` (copies
without a `.csproj` are one project).

## Go (in progress, 2026-10-22)

Spec `docs/name-resolution/go.md` (decisions 1–5): import paths through `go.mod` and `vendor/`, folder path as logical
path, build-tag variants mean every file, `x_test` is its own package, a selector on a value draws no edge. 29 probes
under `sample-projects/regression/go/`, 15 with gaps in `go/known-gaps.md`. Waiting for Christian's review of the page,
then the implementation, one commit per item:

1. `refactor`: `GoNameRules` next to the Go analyzer, still the default rules (xcheck: 0 differences).
2. TSE: report a call through a selector with its qualifier (`util.New`), as a qualified type already is.
3. Import paths through `go.mod`, `vendor/` and the suffix fallback (`GoModules`).
4. The name an import binds (alias, package clause), a selector through it, no edge for a selector on a value.
5. Simple names: own package, dot imports (exported only, ambiguous), predeclared identifiers.
6. TSE and rules: declarations of the enclosing function (type parameters, variables, local types) hide names.
7. `GoCopyRules`: build-tag variants, every file.
8. External test package as a package of its own.
9. CHANGELOG, README and `gh-pages/.../dependency.md`, the plan.

## Steps

- [x] Ask Christian which language comes next: C# (2026-10-22)
- [x] Next language: Go (left to Claude by Christian, 2026-10-22)
- [ ] For each language: spec, probes, implementation commits, acceptance
