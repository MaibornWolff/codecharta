---
name: Update analysis dependencies
state: progress
version: 1
---

## Goal

Bring the analysis dependencies up to date after eight months without updates, taking only versions that are at least
14 days old and have no critical advisory, and clear the advisories in the resolved dependency tree.

## Tasks

### 1. Low-risk updates and security pins
- Newest version at least 14 days old (cutoff 2026-10-27) for Kotlin, coroutines, serialization, gson, snakeyaml,
  commons-lang3, jersey, slf4j, kotlin-logging, everit json-schema, org.json, junit, archunit, mockk, and the
  sonarqube, ktlint, cyclonedx and jacoco tooling; Gradle wrapper 9.8.2
- Pin fixed versions of indirect dependencies that still carry HIGH advisories: jackson and guava on the build
  classpath; httpcore5, httpclient5, jackson and guava on the WireMock test classpath
- Accepted: jetty 11 and handlebars 4.3 under WireMock 3 (jetty is end of life without a fixed release; handlebars
  4.5.2 removes `NumberHelper`, which WireMock 3 loads; both only serve a local stub server in tests) and logback 1.3
  inside the ktlint tool
- Kept at 1.2.1: kotter. 1.3.0 and 1.4.0 make the dialog tests hang until their 120 s timeout (InspectionTool,
  CSVImporter, dialogProvider and more) — a separate follow-up
- Re-check the whole tree against OSV after the update
- Re-check the whole tree against OSV after the update

### 2. tree-sitter core and grammars
- tree-sitter 0.26.6; bash, c, go, java, javascript, php and python grammars
- Golden tests and parser tests decide; investigate every metric change
- Grammar changes found: JavaScript types `default` in import/export specifiers as its own node (handled); Go reads a
  call with one type argument, `New[T]()`, as an index expression and wraps statements in `statement_list` (callee
  and type argument handled as before); C recovers a declaration missing its `;` differently (test input fixed,
  macro calls without `;` unchanged); Python `except*` and Bash `f() (( … ))` now count as they should
- Old/new ccsh compared on sample-projects/{bash,c,go,java,javascript,php,python,regression}: dependency output
  identical, metrics differ only by the two fixes above

### 3. Remove boon
- Declared in five modules but never imported; remove if the build stays green

## Steps

- [x] Complete Task 1: Low-risk updates and security pins
- [x] Complete Task 2: tree-sitter core and grammars
- [ ] Complete Task 3: Remove boon

## Notes

- Each task is its own commit on fix/analysis-dependency-update (branched from fix/npm-audit-angular-22-2), after
  `ktlintCheck test`, `distTar`, `integrationTest`, `format:check` and the analysis gate (installed into a separate
  copy, not `build/install`)
- ktlint-gradle 14.2.0 still does not declare `reporters.bin` as an output, so the workaround in `build.gradle.kts`
  stays
