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
- [ ] Complete Task 5: Kotlin and Java implementation
- [ ] Complete Task 6: Next languages

## Notes

- One topic per commit, small enough to review in one sitting; each step's reviewer checks it against the spec
- Acceptance per step: ktlintCheck test, all probes, distTar + integrationTest, format:check, gate on both parts,
  diff against the last release explained
- Questions the checkpoint reviews raised, to settle in the specs: does an outer class depend on what its nested
  class uses (Java and C# differ today); a Go module's root package at the analysed root; a Python package folder
  shadows a module file of the same name; `Clock::time_point` depends on the alias `Clock`; flags in `expected.txt`
  follow from the rules, never from today's output
- Also from the checkpoint reviews: a Python import that names another copy of the own logical path by its folder
  path loses the edge between the copies; a dependency ring of 2000+ classes in one package overflows the stack in
  the levelizer's cycle search, as in the release
