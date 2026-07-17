---
name: DomainLanguageParser — port DLC into ccsh as a cc.json 2.0 parser
issue: <#issueid>
state: complete
version: TBD
---

## Goal

Move `DomainLanguageCharta/analysis` into `codecharta/analysis` as a first-class analyser
(`ccsh domainlanguageparser`) that emits **cc.json 2.0**, placing its word-frequency data into the
reserved **`domain` lens** (keyed by node id) over the standard `files` tree. The visualization is
out of scope; this covers the analysis/output side only.

## Locked decisions (from clarification)

- **Scope:** full ccsh parser (module move + `:model` + output swap + `AnalyserInterface` + `Dialog` + registration).
- **Dependencies:** lift-and-shift first (keep jgit/mordant/kasechange/kotlinx-* to get it green), dedupe jgit + mordant in a follow-up phase.
- **Domain payload:** key by cc.json 2.0 **node id** (`NodeId.fromSegments`) now, not by raw path.
- **Package:** rename to `de.maibornwolff.codecharta.analysers.parsers.domainlanguage` as part of the move.
- **Not a 1:1 port:** DLC's CLI/tool surface is not preserved. The parser adopts codecharta analyser
  conventions (`CommonAnalyserParameters`, `--verbose`, piped input) and keeps only the
  domain-analysis-specific flags. DLC's own `{tree, words}` JSON format and standalone entrypoint are retired.
- **Lens payload = words only, no envelope:** the `domain` lens is a bare map
  `{ "<nodeId>": [{text, frequency, tfidf?}, ...] }` — no config/version header. Analysis parameters
  (ngrams, weights, stopword level, …) live only in the CLI invocation; the front end just needs the words.

## Tasks

### 1. Move the module into the codecharta Gradle build (lift-and-shift)
- Create `analysers/parsers/DomainLanguageParser/` and copy DLC's `src/main`, `src/test`, and `src/main/resources` (keywords/stopwords) into it.
- Rename the Kotlin package `de.maibornwolff.domainlanguagecharta` → `de.maibornwolff.codecharta.analysers.parsers.domainlanguage` across all sources, tests, and imports; move files to the matching directory layout.
- Author a slim module `build.gradle.kts` (template: `UnifiedParser` — it also uses TreeSitter/jitpack):
  - `implementation(project(":model"))`, `":analysers:AnalyserInterface"`, `":dialogProvider"`.
  - Keep DLC's own deps for now: `TreeSitterExcavationSite`, jgit, mordant, kasechange, kotlinx-serialization-json (+ kotlinx-cli temporarily until Phase 4).
  - **Apply `kotlin("plugin.serialization")`** in the module (needed for `@Serializable`; root does not apply it).
  - Drop everything root already provides: ktlint/jacoco/sonar plugins, `jvmToolchain`, kotlin-logging, coroutines, junit/assertj/mockk. Toolchain becomes **JVM 17** (root), down from 23.
- Register in `settings.gradle.kts` (`include("analysers:parsers:DomainLanguageParser")`).
- Get it compiling: `./gradlew :analysers:parsers:DomainLanguageParser:build`.

### 2. Swap the output layer to cc.json 2.0 with a node-id-keyed `domain` lens
- Reuse the existing analysis up to `perFileWordCounts` + `DirectoryWordAggregator` (per-file **and** per-directory word lists). Only the emit step changes.
- New writer builds a `Project` (files tree) and serializes it — template: `RawTextParser/ProjectGenerator.kt`:
  - `ProjectBuilder()` + `insertByPath(Path(parentSegments), MutableNode(name, NodeType.File))` per file (folders created implicitly); set `projectName` from the input dir.
  - Build the domain payload as a Gson `JsonObject`: for every path (file and aggregated directory, incl. root), key = `NodeId.fromSegments(segments, type)` with the **matching `NodeType`** (File for leaves, Folder for directories, `emptyList()` for root); value = `JsonArray` of `{text, frequency, tfidf?}`. That map IS the whole lens — no wrapper object.
  - Deterministic output (the serializer checksums the file and does not canonicalize opaque lenses): emit node keys in canonical files-tree order, sort each word array by the `--sort-by` criterion desc with `text` asc as tiebreak, then apply `--limit` per node.
  - `.withOpaqueLenses(mapOf(LensSet.DOMAIN_KEY to domainJson)).build()`.
  - `ProjectSerializer.serializeToFileOrStream(project, outputFile, System.out, compress)` (gives meta, `apiVersion 2.0`, checksum, canonical ordering for free).
- Retire `HierarchicalOutput`, `TreeNode`, `OutputWriter` (kotlinx JSON output path). DLC's `tree`
  section is fully redundant with the cc.json `files` tree — it has no successor. Preserve the
  omit-`tfidf`-when-null behavior in the Gson payload (`WordFrequency.tfidf` is `@EncodeDefault(NEVER)` today).
- **Correctness check:** the domain keys must resolve against the ids the mapper emits in `files` — verify a sample id matches (same idiom the metrics lens uses).

### 3. Make it a ccsh subcommand (AnalyserInterface + Dialog + registration)
- Create picocli `@CommandLine.Command DomainLanguageParser : CommonAnalyserParameters(), AnalyserInterface` — `name = "domainlanguageparser"`, description, `call()`, `isApplicable()`, `getDialog()`.
- **Inherit** the infrastructure options from `CommonAnalyserParameters` (positional `inputFiles`,
  `-o/--output-file`, `-nc/--not-compressed`, `--bypass-gitignore`, `-e/--exclude`, `--file-extensions`,
  `--verbose`). Do NOT redeclare DLC's `--directory`, `--output`, `--bypass-gitignore`, `--quiet`
  (redeclaring an inherited option is a picocli startup error; `--verbose` replaces `--quiet`).
- Declare only the domain-specific `@CommandLine.Option`s: `--limit`, `--ngrams`, `--stop-word-level`,
  `--identifier-weight`/`--comment-weight`/`--string-weight`, `--exclude-tests`,
  `--exclude-technical-stopwords`, `--no-tfidf`, `--sort-by`, `--no-ssr` → `AnalysisConfiguration`,
  then invoke `SourceAnalyzerFactory`/`SourceAnalyzer`.
- Add `Dialog : AnalyserDialogInterface` using `dialogProvider` prompts (template: `RawTextParser/Dialog.kt`).
- Retire `Main.kt` + `CliArgumentParser` (kotlinx-cli); ccsh is the sole entrypoint.
- Register (full checklist, per the last analyser added):
  - `ccsh/build.gradle.kts` deps list + `Ccsh.kt` import + `subcommands` array. Interactive mode
    discovers it automatically via `PicocliAnalyserRepository` — no extra registry entry.
  - Update the hardcoded analyser lists in `ccsh` tests: `AnalyserServiceTest.kt` and
    `PicocliAnalyserRepositoryTest.kt` (name/description entries; one test asserts exactly one
    applicable analyser per fixture — write `isApplicable()` so it doesn't claim other parsers' fixtures).
  - Docs: parser table in `analysis/README.md`, module `README.md`, `CHANGELOG.md`,
    `gh-pages/_docs/03-parser/` page + `gh-pages/_data/navigation.yml` entry.
  - Skip `AttributeGeneratorRegistry` — the output is an opaque lens, not numeric metrics (consistent
    with SVNLogParser/UnifiedParser, which also aren't registered).

### 4. Dependency dedupe (follow-up)
- Replace jgit `GitignoreParser`/`GitignoreResolver` with `AnalyserInterface`'s `GitignoreHandler`; drop **jgit**.
- Replace `MordantProgressReporter` with model `ProgressTracker` behind the existing `ProgressReporter` interface; drop **mordant**.
- Drop now-dead **kotlinx-cli** (post-picocli) and **kotlinx-serialization-json** (post-output-swap) if unused elsewhere — and with the latter, the `kotlin("plugin.serialization")` plugin added in Task 1. Also drop DLC's **kotlinx-coroutines-core** and runtime **slf4j-simple** (root/ccsh provide equivalents). **Keep kasechange** (no codecharta equivalent for identifier splitting).

### 5. Verify end-to-end
- `./gradlew :analysers:parsers:DomainLanguageParser:test` + `ktlintFormat`/`ktlintCheck`.
- Build ccsh, run `ccsh domainlanguageparser <dir> -o out.cc.json`, then `ccsh validate out.cc.json` and `ccsh inspect out.cc.json`.
- Confirm the `domain` lens survives a `ccsh mergefilter` round-trip (opaque lenses are merge-aware).

## Steps

- [x] Complete Task 1: Move module into codecharta build (compiles on JVM 17)
- [x] Complete Task 2: cc.json 2.0 output with node-id-keyed `domain` lens
- [x] Complete Task 3: ccsh subcommand + Dialog + registration
- [x] Complete Task 4: Dependency dedupe (dropped jgit, mordant, kotlinx-cli, own slf4j-simple; kept kasechange + kotlinx-serialization-json for FrameworkDetector; serialization plugin removed)
- [x] Complete Task 5: End-to-end verification (parser→validate→inspect→merge round-trip all pass; full `./gradlew build -x integrationTest` SUCCESSFUL)

## Notes

- **Reserved slot:** `LensSet.DOMAIN_KEY = "domain"`; the payload is an opaque `JsonElement` round-tripped verbatim (`CcJsonV2SerializationTest` "reserved domain lens"). Shape is ours to define since viz is deferred.
- **TreeSitter version clash risk:** DLC pins `TreeSitterExcavationSite:v0.10.0`, UnifiedParser pins `v0.12.0`; both land on the ccsh runtime classpath. Align DLC to `v0.12.0` (or verify compatibility) to avoid a duplicate-class conflict in the fat jar.
- **JDK/Kotlin downshift:** DLC (JVM 23 / Kotlin 2.2.20) → codecharta (JVM 17 / Kotlin 2.3.10). Watch for JDK 18+ APIs; run ktlint format for the stricter house config.
- **Node-id keying:** `NodeId.fromSegments` strips `.`/`""` segments and NFC-normalizes, so DLC's `.`-rooted relative paths canonicalize cleanly; the only thing to get right is File-vs-Folder type per node.
- **Resource loading is rename-safe:** `ResourceKeywordLoader` uses resource-root-relative classpath paths (`keywords/…`, `stopwords/…`) that don't contain the Kotlin package — the rename can't break them; just keep the `resources/` layout.
- **Viz follow-up (separate plan):** the visualization currently *accepts* a `domain` lens (reserved slot in `ccJson2Schema.json`) but silently ignores it — `ccJson2ToCCFile.ts` reads only `metrics`/`dependency`, `ccjson2.model.ts` has no `domain` field, and there is no lens-switcher UI. Rendering the domain lens needs its own plan (model field + `lenses/domain/` facade + UI entry point).
- **DLC repo fate:** `DomainLanguageCharta/visualization` (standalone Angular app) consumes the old `{tree, words}` JSON and becomes orphaned by the output swap — retire it in favor of the future codecharta domain lens; the DLC repo can then be archived.
- Follow codecharta's TDD + "structural changes before behavioral" (the rename/move is structural — commit it separately from the output-behavior change).
