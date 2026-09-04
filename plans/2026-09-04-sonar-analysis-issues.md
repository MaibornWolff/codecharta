---
name: Fix open SonarCloud issues in analysis
issue: <none>
state: complete
version: 1
---

## Goal

Clear the open SonarCloud issues on `maibornwolff-gmbh_codecharta_analysis`: 1 vulnerability
(missing Gradle lock file) and 4 MAJOR code smells. The 7 INFO `S1135` TODO-comment smells are
only analysed here — the likely outcome is deleting stale comments, decided separately.

## Tasks

### 1. Vulnerability — `text:S8569` on `analysis/build.gradle.kts`
- Sonar wants `gradle.lockfile` or `gradle/verification-metadata.xml`; neither exists.
- Both options pin resolved versions, so every Renovate bump needs a regenerated lock file.
  Renovate has no Gradle lock-file maintenance, which would break auto-merge.
- **Decision: left open.** Both options pin resolved versions, and `renovate.json` automerges
  minor/patch Gradle bumps; Renovate has no Gradle lock-file maintenance, so every bump would
  fail resolution until someone reran `--write-locks`. Revisit when Renovate supports it.
  Security rating stays at C until then.

### 2. MAJOR code smells
- `CodeMaatImporter/CSVRow.kt:15,16` (`S6518`) — use indexed accessor instead of `Map.get`.
- `model/util/InputHelper.kt:63` (`S6510`) — both `if`/`else` branches return; restructure as
  guard clauses, keeping behaviour and log messages identical.
- `UnifiedParser/build.gradle.kts:12` (`S6624`) — hardcoded
  `com.github.MaibornWolff:TreeSitterExcavationSite:v0.12.0`. The catalog already defines
  `tree-sitter-excavation-site` and `DomainLanguageParser` uses it; align UnifiedParser.

### 3. Analyse the 7 `S1135` TODO comments
- GitLogParser: `ProjectConverter.kt:42,69`, `StandardCommitParser.kt:58,85`,
  `VersionControlledFilesInGitProject.kt:9`
- RawTextParser: `IndentationMetric.kt:15,30`
- **Decision: all 7 deleted.** Three were speculative or stale (`Coroutines?`, a question with a
  line reference that had drifted to a blank line, an unexplained tab-stop formula); one was a
  question addressed to a colleague sitting above four explanatory lines, which were kept; three
  described real constraints and were dropped along with the rest.

## Steps

- [x] Complete Task 1: decided to leave the lock-file issue open
- [x] Complete Task 2: fix the 4 MAJOR code smells
- [x] Complete Task 3: analysed the TODOs and deleted all 7

## Notes

- Quality gate on new code is green; all 12 issues predate the 60-day new-code period.
- Task 2 is a pure structural change (Tidy First) — committed separately from the TODO deletions.
- Removing the trailing `// TODO Coroutines?` let ktlint pull `vcFile ->` back onto the `forEach {`
  line; `ktlintFormat` applied that.
- Verified: `./gradlew build` (2373 unit tests, 0 failures), `ktlintCheck`, and `integrationTest`
  all green. Report-generation and Kotlin-daemon failures seen during the run were container
  filesystem flakes, not test failures — every affected module passed on rerun.
- 11 of the 12 SonarCloud issues are fixed in code; only the `text:S8569` vulnerability remains open.
