---
name: move TreeSitterExcavationSite into the analysis build as its own module
issue: none
state: complete
version: 1
---

## Goal

Replace the external JitPack dependency `com.github.MaibornWolff:TreeSitterExcavationSite:v0.12.0` with a
Gradle module `analysis/treeSitterExcavationSite` holding the same code, so the three parsers that use it
build against the module. No logic changes: the module content is the `v0.12.0` tag, package names stay
`de.maibornwolff.treesitter.excavationsite`, and every parser must produce byte-identical output before
and after.

## Decisions

- Location `analysis/treeSitterExcavationSite`, Gradle path `:treeSitterExcavationSite`, next to `model`
  and `dialogProvider`.
- Package name unchanged, so the 43 consumer files keep their imports.
- No `maven-publish`; the GitHub repository remains the published history up to `v0.12.0`.
- Carry over `src/main`, `src/test` (with `src/test/resources/contract`), `libs/tree-sitter-tsx-0.23.2.jar`,
  `libs/tree-sitter-pascal-0.10.2.jar`, `README.md`, `KNOWN_ISSUES.md`, `CHANGELOG.md`. Drop detekt config,
  `.github`, `.claude`, `plans/`, `gradlew`, `sonar-project.properties`, `renovate.json`.
- Source of truth is the `v0.12.0` tag. The checkout in `Ideas/TreeSitterExcavationSite` has identical
  content (its head commit is a local rebase of the same change), so it can be used as the copy source
  after a `git diff 30c7a9e v0.12.0` check, but the tag is what gets recorded.

## Tasks

### 1. Create the module
- `git archive v0.12.0` from the TSE checkout into `analysis/treeSitterExcavationSite/`, then delete the
  files listed under "drop" above.
- Write `analysis/treeSitterExcavationSite/build.gradle.kts` in the style of `model/build.gradle.kts`:
  only a `dependencies` block, `tasks.test { useJUnitPlatform() }`, plus `java { withSourcesJar() }` only
  if something needs it (nothing does; leave it out). The root build already applies kotlin, ktlint, jacoco,
  sonar and `jvmToolchain(17)` to every subproject.
- Keep `kotlin { compilerOptions { allWarningsAsErrors.set(true) } }` in the module file; the code was
  written under it and it costs nothing. Drop it only if Kotlin 2.3.10 (the catalog version, TSE used
  2.3.0) raises a new warning, and record that in the plan notes.
- `api(libs.treesitter)` for the core binding, `implementation(...)` for the grammar bindings, and
  `implementation(files("libs/tree-sitter-tsx-0.23.2.jar"))` / pascal. The ccsh fat jar unpacks every
  runtime classpath entry, so the two local jars end up inside `ccsh.jar` without the `tasks.jar { from(zipTree) }`
  trick TSE used; do not carry that over.
- `include("treeSitterExcavationSite")` in `analysis/settings.gradle.kts`.

### 2. Version catalog
- Add to `analysis/gradle/libs.versions.toml` the entries TSE's catalog has and CodeCharta's lacks:
  `tree-sitter` core 0.26.3, and the bindings for typescript, kotlin, java, csharp, cpp, c, ruby, swift,
  objc, bash, rust, abl (JitPack fork `com.github.ChristianHuehn.tree-sitter-ng`), archunit for the tests.
  Reuse the existing go, javascript, php, python, vue entries; they already match TSE's versions.
- Remove `tree-sitter-excavation-site` from the catalog.
- Keep the JitPack repository in the root build: the ABL grammar still comes from there.
- Rewrite the comment above the go/javascript/php/python/vue pins: they now must match the versions the
  module declares, not "the versions TSE resolves".

### 3. Wire the consumers
- `analysers/parsers/UnifiedParser`, `DomainLanguageParser`, `DependencyParser`: replace
  `implementation(libs.tree.sitter.excavation.site)` with `implementation(project(":treeSitterExcavationSite"))`.
- Add the module to the Sonar and jacoco aggregation only if it is not picked up automatically; the root
  build iterates over all subprojects, so expect nothing to do.
- Add the module to the CycloneDX SBOM implicitly (allprojects); check `create_sbom` output once.

### 4. Style and repository hygiene
- `.editorconfig` of TSE equals the analysis one except three IntelliJ parameter-wrapping keys; run
  `./gradlew :treeSitterExcavationSite:ktlintCheck` and, if anything fails, `ktlintFormat` in a separate
  "style" commit so the move commit stays a pure move.
- Add the module to `analysis/NEW_TO_ANALYSIS.md` (module list) and one CHANGELOG line under Unreleased:
  "TreeSitterExcavationSite is now a module of the analysis build instead of an external library".
- Add `training/tools/TseProbe.java` note: compile against the module jar or the fat jar, unchanged.
- Delete `Ideas/TreeSitterExcavationSite` after the move (it is gitignored in Ideas; confirm with the user
  before deleting, the checkout carries the Ideas-local git history).

### 5. Verify no behaviour change
- `./gradlew build` (unit tests of the module and of all parsers) and `./gradlew integrationTest`.
- Rerun the three README commands from `training/README.md` for one TSE language (kotlin) and one
  own-analyzer language (python) and diff `output/*.cc.json` against the committed files: identical apart
  from the checksum field is the acceptance criterion.
- The Delphi test that reads `./spring4d/...` is guarded by an `assumeTrue` and skips when the folder is
  absent; the archunit and golden-file tests use paths relative to the project directory, which Gradle
  sets to the module directory, so they need no change.
- On this container: the build directories are symlinked by the init script in `~/.gradle/init.d`; the new
  module gets its link at `projectsLoaded`, so nothing to do, but check `ls -la analysis/treeSitterExcavationSite/build`
  if the first build fails with `NoSuchFileException`.

## Steps

- [x] Complete Task 1: create the module from `v0.12.0`
- [x] Complete Task 2: version catalog
- [x] Complete Task 3: wire the three consumers
- [x] Complete Task 4: style and hygiene, separate commit if ktlintFormat touches files
- [x] Complete Task 5: verify build, integration tests and identical parser output

## Notes

- Kotlin 2.3.10 raises no new warning, so `allWarningsAsErrors` stayed. `ktlintCheck` passed on the copied
  code, so there is no style commit.
- Beyond the plan: `:ccsh:jar` unpacks the resolved runtime classpath, whose files carry no task
  provenance, so Gradle rejected the build with "uses this output of task ':treeSitterExcavationSite:jar'
  without declaring an explicit or implicit dependency". `tasks.jar { dependsOn(configurations.runtimeClasspath) }`
  declares it for every module the fat jar swallows. The other modules were unaffected because none of them
  is a `java-library` reaching ccsh only transitively.
- Beyond the plan: the root `.gitignore` ignores `*.jar`, so it needed an exception for
  `analysis/treeSitterExcavationSite/libs/*.jar`, and `.gitattributes` normalizes every file to LF, which
  would have corrupted the pascal jar; `*.jar binary` stops that.
- Beyond the plan: the module README described a standalone Gradle build (wrapper, `publishToMavenLocal`,
  a Maven coordinate) and its CHANGELOG stopped mid-history, so both got the module's actual usage.
- On this container the build-dir symlinks made `ArchitectureTest` fail: ArchUnit's `DoNotIncludeTests`
  recognizes a test source set by the substring `/build/classes/<lang>/test/` and the resolved link target
  had no `build` segment, so every test class was imported into the layer rules. Fixed in the machine-local
  `~/.gradle/init.d` script by linking to `<slug>/build` instead of `<slug>`. Nothing in the repository.
- `Ideas/TreeSitterExcavationSite` is deliberately kept: it is gitignored and its git history is the only
  local copy, so it stays available for comparing against the module.
- Verification: `./gradlew build` and `./gradlew integrationTest` green; the module's 3094 tests pass with 4
  skipped (the Delphi `spring4d` ones). The three `training/README.md` commands for kotlin and python
  produce files byte-identical to the committed ones, checksum included. The fat jar carries the tsx and
  pascal natives without the `from(zipTree)` trick, and `cyclonedxbom` lists the module and all 20 grammars.

- Commits: (1) `build(analysis): add TreeSitterExcavationSite v0.12.0 as module` (pure copy plus build
  file and settings), (2) `build(analysis): use the TreeSitterExcavationSite module instead of JitPack`
  (catalog and consumer wiring), (3) optional `style(analysis): ktlintFormat treeSitterExcavationSite`.
- Consumers use exactly three entry points: `TreeSitterDependencies.analyze`, `TreeSitterExtraction.extract`,
  `TreeSitterMetrics.parse`. Nothing else from the library is referenced outside the module.
- Follow-up work (not in this plan): fix the resolver-side defects from `training/SUMMARY.md`, then the
  TSE-side gaps inside the module, then migrate the PHP, Go, Python and Vue analyzers onto TSE mappings.
