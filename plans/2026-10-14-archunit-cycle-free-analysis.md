---
name: ArchUnit cycle-free analysis
issue: <#issueid>
state: progress
version: -
---

## Goal

Make every analysis module free of package cycles and keep it that way with one ArchUnit rule over all
production classes.

## Tasks

### 1. Cross-check with the DependencyParser
- Run the locally built `ccsh dependencyparser` on `analysis/`
- Compare at package level (leaf edges lifted to namespaces) and at class level (`isCyclic` leaf edges)
  with the 7 ArchUnit tangles; explain every difference

### 2. Failing cycle rule
- ArchUnit test in `ccsh` (sees all modules): every package is a slice, production code only
- Remove the two partial cycle rules of the ExcavationSite `ArchitectureTest`
- Commit red

### 3. Fix the cycles
- One structural commit per tangle (move/extract, no behaviour change):
  model/util/serialization, SonarImporter, DependencyParser analyzers, DomainLanguageParser processing,
  GitLogParser git/helper, ExcavationSite cpp extractors, ExcavationSite javascript

### 4. Full suite
- `./gradlew ktlintCheck test integrationTest`

## Steps

- [ ] Complete Task 1: Cross-check with the DependencyParser
- [ ] Complete Task 2: Failing cycle rule
- [ ] Complete Task 3: Fix the cycles
- [ ] Complete Task 4: Full suite

## Notes

- Branch `tech/archunit-cycle-free` off main, no issue id given
- Real package tangles (Tarjan over ArchUnit's bytecode dependencies, each confirmed by ArchUnit in
  isolation): 16. A repo-wide ArchUnit run lists only a subset of the cycles (9–22 depending on the
  slice pattern) but fails as long as any cycle exists, so it works as a gate, not as a to-do list
- DependencyParser on `analysis/` (`-fe kt,java`): 14 package tangles, 13 shared. Differences:
  - Kotlin top-level functions/values are no leaves (only class/interface/enum; 157 of 747 files emit
    nothing), so uses of `…Kt` facades are lost: dependency analyzers ↔ 7 languages, analyzers.common,
    domainlanguage.keywords, gitlog.converter, svnlog ↔ converter, excavationsite javascript
  - `X::class` literals (code and annotations), `fromJson<X>` type arguments and objects used as values
    (`= Dialog`) are not counted: sonar.filter, gitlog class cycle
  - `NodeMaxAttributeMerger : NodeMergerStrategy` is not recorded (cause not pinned down)
  - ccsh ↔ ccsh.analyser exists only in source: `Ccsh.NO_USABLE_ANALYSER_FOUND_MESSAGE` is a `const val`,
    inlined by kotlinc, so bytecode (ArchUnit) cannot see it. Fixed anyway
  - None of these gaps is documented in the parser docs
