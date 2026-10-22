---
name: dependency parser name resolution, spec first and in reviewable steps
state: progress
version: 1
---

## Goal

Rebuild the dependency parser's fixes from `main` in small steps Christian can review one by one: rules written down
per language first, probes derived from the rules, then code for that language only. The checkpoint
`fix/nearest-file-for-shared-logical-path` (`b4a6bb8af`) is material, not a base: probe sources, the comparison
script and the review findings are reused, its code is not copied wholesale.

## Tasks

### 1. Probe harness and comparison script
- `ProbeRegressionTest`, `sample-projects/regression/` layout (`src/`, `expected.txt`, `known-gaps.txt` with
  `missing`/`extra`), `compare_dependency_builds.py` with exit codes
- No parser change; the first probes record what the last release does, gaps marked

### 2. Nearest declaring file for shared logical paths (the original goal)
- A dependency on a logical path declared in several files goes to the nearest declaring file; nothing else
- Probes for it; diff against the last release on the samples, `analysis/` and `visualization/app` explained

### 3. Kotlin and Java: spec
- One page per language under `analysis/analysers/parsers/DependencyParser/docs/name-resolution/`: how a written name
  finds its declaration, in order (local, own and nested types, single-type import and alias, own package, wildcard,
  qualifier, `private` file scope), plus what is deliberately not supported
- Christian reviews before any code

### 4. Kotlin and Java: probes from the spec
- One probe per rule and per collision of two rules; a coverage table in the spec links rule to probe

### 5. Kotlin and Java: implementation
- The rules in that order, in a Kotlin/Java resolver on a small shared core; no change to other languages
- All probes green, diff against the last release explained in the commit

### 6. Next languages
- Same three steps per language, order decided after Kotlin and Java

## Steps

- [x] Complete Task 1: Probe harness and comparison script
- [x] Complete Task 2: Nearest declaring file for shared logical paths
- [x] Complete Task 3: Kotlin and Java spec
- [x] Complete Task 4: Kotlin and Java probes
- [x] Complete Task 5: Kotlin and Java implementation
- [ ] Complete Task 6: Next languages

## State of Task 5 (2026-10-21)

Done, each reviewed by Christian: name scope, C# first file, type parameters and local classes, Java usage kinds,
`TypeImportResolver(ImportingDeclaration, …)`, Java nested paths and member types (3b), qualified names (3c), Kotlin
supertype kinds (4a, `4b0cab4ab`), own package before exactly one star import (4, `2d65485d2`).

Next, one commit each, Christian reviews after each and says "continue":

- [x] 5a (`4c5eea8e5`): Kotlin import alias (`import b.Config as RemoteConfig`: a plain `Config` then means the own package);
  closes `kotlin/spec-import-alias`
- [x] 5b (`ac24c39a8`): `private` top-level declarations visible only in their own file; closes `kotlin/spec-private-top-level` and
  the checkpoint probe `kotlin/r2-ktp`. Decided 2026-10-21: TSE `Declaration.isFileScoped` (default false), set by
  the Kotlin extractor for a private top-level declaration and all nested in it; Node carries it; the resolver drops
  a candidate declared only file-scoped in other files; `DeclaringFiles` points at a file-scoped copy only from its
  own file. A `private` class nested in a class is not supported (counts as public; add to the spec's list)
- [x] 6a (`d6cbd33dd`): an import alias in front of a qualified name (`RemoteConfig.Section`); needed first so 6b
  keeps `ExtractStage -> keywords/Language.kt`; new probe `kotlin/spec-alias-as-qualifier`
- [x] 6b (`d284bd0d7`): Kotlin extractor no longer reports the class a call goes through (`Outer.Node()`,
  `Node.build()`) as a use of its own; closes `kotlin/spec-qualified-constructor-call`,
  `kotlin/spec-extension-through-receiver`. No Java or Kotlin gaps left
- [x] Tick Task 5, then ask which language comes next (`plans/2026-10-21-name-resolution-next-languages.md`): C#

Checkpoint probe worse than the release: `java/r1-jnest`, correct but regression (its `expected.txt` predates decision
"nested = own leaf"). Cross-language check 5a–6b (2026-10-22, `2d65485d2` against `d284bd0d7`, whole output on 269
inputs): every non-Kotlin input identical; the 11 Kotlin inputs that differ are all correct by the spec.
Gate baseline: 0 errors, 45 warnings analysis, 20 visualization. Helper scripts: checkpoint comparison
`cp-compare.py`, release build `ccsh-baseline` and the checkpoint probes `cp-probes` in
`/tmp/claude-1000/-Users-christian-huehn-Projects-Suite-codecharta/00b7a67e-c7f4-4a26-a1ca-7b613c1bd097/scratchpad`;
file and leaf edge diff `edgediff.py` in
`/tmp/claude-1000/-Users-christian-huehn-Projects-Suite-codecharta/e0a83720-4ac2-4bec-a29b-8056382d0173/scratchpad`.

## Notes

- One topic per commit, small enough to review in one sitting; each step's reviewer checks it against the spec
- Acceptance per step: ktlintCheck test, all probes, distTar + integrationTest, format:check, gate on both parts,
  diff against the last release explained; until every language has its spec probes, also the checkpoint's 197 reviewer probes
  (`git archive b4a6bb8af sample-projects/regression`): no probe may come out worse than with the release build
- Questions the checkpoint reviews raised, to settle in the specs: does an outer class depend on what its nested
  class uses (Java and C# differ today); a Go module's root package at the analysed root; a Python package folder
  shadows a module file of the same name; `Clock::time_point` depends on the alias `Clock`; flags in `expected.txt`
  follow from the rules, never from today's output
- Also from the checkpoint reviews: a Python import that names another copy of the own logical path by its folder
  path loses the edge between the copies; a dependency ring of 2000+ classes in one package overflows the stack in
  the levelizer's cycle search, as in the release
