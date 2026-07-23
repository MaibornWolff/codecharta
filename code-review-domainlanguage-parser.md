# Code review: `feature/domainlanguage-parser`

## Verdict

This is a large, coherent feature landing in two halves — a new Kotlin parser module and an Angular routing/view split — and both halves are structurally sound. The parser's pipeline decomposition (extract → weight → split → ngrams → filter → aggregate) is a genuinely good design: each stage is small, pure, and independently testable, and the ~4:1 test-to-source ratio backs it up. On the visualization side, the `EXPLORER_HOST` strategy pair (`DomainExplorerHost`/`MetricsExplorerHost`) is exactly the right seam for sharing `SidebarExplorerComponent` across two views, and extracting `HoverTooltipService` out of `codeMap.tooltip.service.ts` (−102 lines) is a clean structural win. Keep doing both.

The one thing to fix before merge is `visualization/package.json:39` — the new `postinstall: patch-package` hook breaks `npm i codecharta-visualization` for every consumer, and because `.npmrc` sets `ignore-scripts=true`, it never runs locally either. It is broken in both directions.

Beyond that, the dominant theme is **declared-but-unwired surface**: several abstractions were built, tested, and then never connected — most consequentially `Language.keywordFilter`, which means 14 of 17 supported languages get no keyword filtering at all.

---

## Themes

### 1. Wired-up-halfway: abstractions built and tested but never connected

The parser declares per-language capabilities on the `Language` enum, then bypasses the enum with hardcoded literals at the one place it matters. The result is not just duplication — it is a live capability gap that the tests actively conceal, because the tests read the enum property that production never touches.

**`ConfigurationBuilder.kt:49`**
```kotlin
private fun MutableList<LanguageKeywords>.addCoreLanguageKeywords() {
    add(ResourceKeywords("keywords/java-keywords.txt"))
    add(ResourceKeywords("keywords/kotlin-keywords.txt"))
    add(ResourceKeywords("keywords/typescript-keywords.txt"))
}
```
`Language.kt:12` declares `keywordFilter` for all 17 entries and `ConfigurationBuilder.build()` line 19 sets `allowedExtensions = Language.allExtensions()` — so Python, Go, C#, Rust, PHP, Ruby, Swift, C, C++, Bash, ObjC, Vue, ABL and JavaScript files are all *analysed* while their keyword sets are never applied. `python-keywords.txt`, `go-keywords.txt` etc. all ship in `src/main/resources/keywords/`. Meanwhile `grep -rn keywordFilter` finds zero production readers — every read is in `LanguageTest.kt`.

**Fix:** make the enum the single source. Note that `StopWordFilter.kt:18-21` flattens `languageKeywords` into one *global* excluded-word set, so `Language.entries.map { it.keywordFilter }` would let ABL's `cls`/`w` and C's `h` suppress legitimate domain words across all languages. Scope the selection instead — either to the languages actually present in the scanned tree, or per-file via `Language.fromExtension(...)`. Either way, no `"keywords/…"` literal should appear outside `Language.kt`. This is a behavioral change, so give it its own commit.

Same pattern, smaller stakes — dead surface shipped alongside its tests:

- **`domainBar.readWindow.ts:25-33`** — nine per-setting observables (`shape$`, `topN$`, `shrinkToFit$`, …) with zero consumers anywhere in `app/`; the sole client reads only `wordCloudSettings$`. Their nine backing selector files are referenced only by this file. Notably `domainLensSource.readWindow.ts`, added in the same branch, exposes exactly the one observable it needs — so the convention already exists.
- **`viewReadiness.store.ts:43`** — `markStale(view)` has zero references, including in its own spec.
- **`wordCloudOption.builder.ts:83`** — `colors?: WordCloudColorPair` is set only by `wordCloudOption.builder.spec.ts:53`. The doc comment justifies the seam as keeping the builder pure, but the `?? getWordCloudColors()` fallback at line 169 reads the DOM from inside the builder anyway.
- **`AnalysisConfiguration.kt:22`** / **`ParsedArguments.kt:18`** — `outputFile` is always `null` (`DomainLanguageParser.kt:152`) and never read; the real destination is the inherited picocli option at `DomainLanguageParser.kt:115`. `quiet` is likewise write-only — `ProgressReporterFactory.create(quiet = !verbose)` at line 109 carries the flag independently.
- **`WordAnalyzer.kt:5`** — one method, one implementer, no polymorphic consumer (`SourceAnalyzerFactory.create` returns the concrete `SourceAnalyzer`). `WordAnalyzerTest.kt` implements it as an anonymous object to assert the interface exists.
- **`SourceCodePipeline.kt:45`** — `process(sourceCode)` has no production caller, making the `filePath == null` branch at 74-79 unreachable. `PathScopedKeywordProvider.NONE` already supplies the null-object. Delete this overload and `FilterStage.filter(weightedTexts)`, inline `processWithOptionalPath`; leave `StopWordFilter`'s overloads alone (removing them churns ~30 spec call sites for no gain).
- **`wordCloudOption.builder.ts:25`** — `const ROTATE_RATIO = 1` is the value the unpatched library already hardcoded (`patches/echarts-wordcloud+2.1.0.patch` shows `-      rotateRatio: 1,`), so the patch hunk, the type field and the constant together are behaviourally inert. It is also the only one of six adjacent options not read from `settings`. The patch itself earns its keep for the `cancelable: true` and layout-disposal fixes — just drop the `rotateRatio` hunks.

---

### 2. One rule, two copies, already diverged

Three places re-implement logic that already has an owner, and in two of them the copies have drifted — one visibly to users.

**`domainExplorerHost.ts:90`** vs **`wordCloudOption.builder.ts:91`**
```typescript
function scoreOf(word: DomainWord, sizingMode: WordCloudSizingMode): number {
    if (sizingMode === WordCloudSizingMode.tfidf) {
        return word.tfidf ?? 0
    }
    return word.frequency
}
```
The builder's `wordValue` falls back to `word.tfidf ?? word.frequency`. This is reachable: `domain.model.ts:133` declares `tfidf?: number`, and `hasTfidfDataSelector` (`domain.selectors.ts:11-13`) enables tfidf mode if *any single word* has a score. In a mixed dataset, a scoreless word ranks `0` in the tooltip (and renders that `0` to the user) while the cloud sizes it by frequency. The doc comment at `domainExplorerHost.ts:83` — "Ranked the same way the cloud sizes its words, so the tooltip previews what selecting will show" — asserts an invariant the code does not hold.

**Fix:** export one `wordSizingValue(word, sizingMode)` from `model/wordCloud.model.ts` (both files already import `WordCloudSizingMode` from there) with the builder's `?? word.frequency` semantics. The builder is unchanged; the host is corrected. Behavioral commit.

**`navBar.component.ts:51`** — third copy of publish-height-to-CSS-var:
```typescript
document.documentElement.style.setProperty("--cc-bars-height", `${Math.round(height)}px`)
```
`bottomBar.component.ts:18-36` and `fileExtensionBar.component.ts:25-41` have the same measure/publish/observe/disconnect+removeProperty skeleton. The branch is the occurrence that crosses the 3+ threshold, and the comment at line 47 documents the duplication rather than removing it. Extract a `PublishesHeightDirective` in `shared/components/` (next to the `BarShellDirective` this branch already added), variable name as an input. **Caveat:** `bottomBar.component.ts:19-21` measures an inner `<footer>` (`footer ?? host`), not the host — a bare `hostDirectives` application would silently change what it measures. Give the directive an optional target, or apply it to the `<footer>` in the template.

**`color.util.ts:54`** — `hexToRgb`/`rgbToHex` re-implement `ColorConverter.convertHexToColorObject`/`convertColorToHex` (`util/color/colorConverter.ts`), and `gradientCalculator.ts` already composes exactly this interpolation six times as `ColorConverter.convertColorToHex(new Color().lerpColors(a, b, factor))`. No bug today (the `HEX_COLOR` guard handles the shorthand case by falling back deliberately), but it is a second competing hex implementation. Rewrite `interpolateColor` on the converter and keep only the CSS-custom-property guard.

---

### 3. Comments narrating the code instead of explaining it — and two that are wrong

Most of these are cosmetic. Two are not, because they state things the code does not do.

**`NgramsStage.kt:116`** — the KDoc is factually wrong:
```kotlin
/**
 * Checks if the longer word list contains the shorter word list as a contiguous subsequence.
 * Uses joinToString for the actual comparison to avoid character-by-character iteration.
 */
```
The body joins both lists and does a raw `String.contains`, which matches across word boundaries: `["superuser","profile"]` joins to `"superuser profile"`, which contains `"user profile"` — so the n-gram "user profile" is wrongly dropped by SSR. Fix the code to match the contract: `longer.windowed(shorter.size).any { it == shorter }` (which also makes the `shorter.size >= longer.size` guard meaningful). Delete the performance sentence — `joinToString` allocates two strings and `contains` still scans characters.

**`SourceAnalyzer.kt:132`**
```kotlin
// appears in "all" files), so we warn but still compute.
private const val MIN_FILES_FOR_TFIDF = 2
```
`TfIdfCalculator.calculate()` returns `emptyMap()` when `totalDocuments <= 1` (lines 16-18), pinned by `TfIdfCalculatorTest.kt:23` with the note "IDF is undefined for single document". So in every case the warning fires, nothing is computed. The guard is correct — fix the comment to say TF-IDF is skipped below two files.

**`FileAnalyzer.kt:10`** — `* Supports Kotlin, TypeScript, and JavaScript using tree-sitter AST parsing.` The class dispatches through `Language.fromExtension`, which covers 17 languages. Point at `[Language]` as the source of truth so the list never needs syncing.

The rest is narration to delete. Strongest cases:
- **`SourceCodePipeline.kt:61,64,67,70,73,81`** — six `// Stage N:` comments each restating the call below (`// Stage 1: Extract` above `extractStage.extract(...)`), duplicating the class KDoc at 17-23. Delete; keep the Stage-5 parenthetical about path-scoped filtering reworded, or drop it since the KDoc has it too.
- **`NgramsStage.kt:46-56` + inline markers** — a 7-step KDoc plus six `// Step N:` markers that have already drifted apart (there is no `// Step 6:`; the one labelled 7 is the sixth). See theme 4 for the real fix.
- **`DirectoryWordAggregator.kt:13,18,22,25`** — `// Get all parent directories` sits on `getParentDirectories(filePath)`. Keep line 34 (`caller handles sorting` is a real contract) and add a why-comment for the `"."` root key at line 45.
- **`FrameworkDetector.kt:78`** — restates the two lines beneath it. Meanwhile `FrameworkDetector.kt:61`'s `!it.path.contains("node_modules")` exclusion has no explanation, and `findCsprojFiles` (89-94) has no equivalent exclusion at all — worth a why-comment.
- **`PathUtils.kt:3`** — six `@param`/`@return` lines restating three one-line signatures. Only 9 of 328 Kotlin main sources use `@param` KDoc, and 4 of those 9 are from this branch. Contrast `ResourceKeywords.kt:7-9`, which explains *why* — that one stays (minus its two-line historical note; see the table).
- **`wordCloud.model.ts:36,52`** and **`indexedDBWriter.ts:412`** — "DLC" / "DLC-parity" is expanded nowhere in shipped code, only in `plans/`. Expand on first use: "DomainLanguageCharta, the tool this renderer was ported from".

---

### 4. Long methods and duplicated test fixtures

**`NgramsStage.kt:58`** — `applyStatisticalSubstringReduction` runs 58-113 (56 lines) and is held together by the numbered step markers from theme 3. The comments are a symptom: each step is a pure map/filter over locals and extracts cleanly. Replace them with `sumFrequenciesByText(...)`, `groupNgramsByWordCount(...)`, `findRedundantNgrams(...)`, leaving a ~6-line composition. Trim the KDoc's 7-step list to the SSR invariant it genuinely explains.

**`ConfigurationBuilderTest.kt:21`** — all 15 tests construct the full 11-argument literal inline:
```kotlin
val parsedArgs =
    ParsedArguments(
        directory = "/path",
        limit = null,
        bypassGitignore = false,
        ...
```
About 190 of the file's 475 lines are this boilerplate, and each test varies exactly one field. `ParsedArguments.kt` gives no defaults to its first 11 params, which is why. Add a private factory with defaults — the same branch already establishes the pattern at `DomainProjectGeneratorTest.kt:17` (`private fun sampleResult(): DomainAnalysisResult = ...`).

**`shapeSegment.component.ts:15`** — three domainBar segments are the same wrapper three times:
```typescript
export class ShapeSegmentComponent {
    readonly settingsPopoverId = "domain-bar-shape-popover"
    readonly settingsAnchorName = "domain-bar-shape-cog"
    private readonly readStore = inject(DomainBarReadStore)
    readonly settings = this.readStore.settings
}
```
`metricsBar` already solved this with a parameterized `MetricSegmentComponent` taking a `testIdPrefix` input. The copy-paste has already drifted: `wordSizingSegment.component.html:8` stamps `cogTestId="domain-bar-toggle"` while its own anchor is `domain-bar-word-sizing-cog`, forcing `domainBar.po.ts:21` to hardcode the odd id. Extract a `cc-domain-segment` with `label`/`value`/`idPrefix` and `<ng-content>` for the popover; the drifted id collapses into the generated one. (Note the extraction needs `<ng-content>` for the optional body row and a `minWidthClass` input — WordSizing and Rotation each add one computed label signal.)

Same duplication in the store layer, one level up: **`domainBar.reducer.ts:27`** rebuilds `defaultWordCloudSettings` key by key from nine aliases that are each `defaultWordCloudSettings.x`, and **`wordCloudSettings.selector.ts:6`** remaps `domainBar` into a structurally identical `WordCloudSettings`. Both collapse to one line (`= defaultWordCloudSettings`, and `store.select(domainBarSelector)`). This differs from the `mapState` precedent, where each slice owns a genuinely independent literal with no source object to alias. Note TypeScript already prevents the drift you might worry about — both sites carry `: WordCloudSettings` annotations — so this is tidiness, not risk.

---

### 5. Test coverage gaps on the new CLI surface

**`DomainLanguageParser.kt:25`** has no test file at all. All four siblings — GitLog, RawText, SVNLog, Unified — ship *both* a `<Name>ParserTest.kt` and a `DialogTest.kt`. Untested here: `validateOptions()` (line 132, four `require` guards), `isApplicable()` (line 168, blank/file/directory/recursive-walk branches), `buildConfiguration()` (line 143, the `-fe` extension override), `resolvePipedProject()` (line 123, the null warning). The only repo-wide reference is `PicocliAnalyserRepositoryTest.kt:71`, which just instantiates the class to check it appears in the listing. `RawTextParserTest.kt:122-155` is the model to copy for `isApplicable`.

Two existing tests assert less than their names promise:

**`SourceCodePipelineTest.kt:201`** — `should filter Kotlin language keywords` is the only place the pipeline's `stopWordFilter` integration is exercised (line 208 is the file's sole `kotlinKeywordsFilter` use; the other 17 pipelines pass `emptyFilter`). Every assertion checks domain words are *present*; none checks a keyword was removed. The comment admits it:
```kotlin
// Note: These wouldn't be extracted anyway since they're keywords,
// but this test verifies the filter integration
```
Swap in `emptyFilter` and it still passes. Build both pipelines over the same source and assert the keyword keys present under `emptyFilter` are absent under `kotlinKeywordsFilter`.

**`SourceCodePipelineTest.kt:169`** — `assertTrue(result["process"]!! >= 6)` sits directly under `// Total expected: 3 + 3 + 2 + 1 = 9`. It passes if the string weight is dropped (8) or an identifier hit is lost (6). Lines 195 and 258 in the same file use exact `assertEquals`, so the loose form is inconsistent, not house style.

---

## Remaining findings

| file:line | sev | issue | fix |
|---|---|---|---|
| `visualization/package.json:39` | **high** | `"postinstall": "patch-package"` — devDependency + `patches/` not in `files` (18-28), so `npm i codecharta-visualization` runs a missing binary. `.npmrc`'s `ignore-scripts=true` also means it never runs locally, so the patch is silently unapplied in dev/CI. | Drop the hook. Add an explicit `"patch": "patch-package"` invoked from `build`/CI setup (explicit `npm run` is not blocked by `ignore-scripts`). Verify with `npm pack` + clean-dir install. |
| `SplitStage.kt:57` | low | `MIN_WORD_LENGTH = 2` sits beside `Regex("""\b[a-zA-Z]{3,}\b""")` — two length rules, one named, one magic. (They gate different things: the regex gates the pre-split run, the constant the emitted word.) | Name the second: `MIN_MATCHED_RUN_LENGTH = 3`, interpolate into the regex. Do *not* drop the regex length — that admits 1-2 letter runs that currently never reach the splitter. |
| `TfIdfCalculator.kt:23` | low | `tf`/`df` locals in the core scoring expression; the same file spells both out in full at lines 20/21/31/41. | `termCount`/`documentCount`. |
| `FileAnalyzer.kt:37` | low | `clearCache()` clears `stopWordFilter`'s cache, never its own `pipelines` (line 22); `SourceAnalyzer.kt:31` calls it as if resetting the analyzer. (No leak — `pipelines` is enum-bounded and per-run.) | Rename to `releasePerRunCaches()`, or inject `StopWordFilter` into `SourceAnalyzer` and call it directly. |
| `TestFileDetector.kt:50` | low | `listOf(".ts", ".tsx", ".js", …)` duplicates `Language.TYPESCRIPT/JAVASCRIPT.extensions`; same for `.kt`/`.java`/`.py` at 44/56/59. Already drifted: `Language.PYTHON` has `pyw`, the matcher only tests `.py`, so `test_foo.pyw` escapes `--exclude-tests`. | Make `Language.extensions` internal and derive. |
| `PathUtils.kt:9` / `:25` | low | Three bare top-level functions in the module root package — every other shared helper in analysis is an object/class (`object Checksum`, `object Logger`), including this file's own consumer `object DirectoryWordAggregator`. `normalizePath` has zero callers while `TestFileDetector.kt:18` open-codes `file.absolutePath.replace('\\', '/')`. | Wrap in `object PathUtils`, move beside its consumer, and wire `TestFileDetector.kt:18` to `normalizePath`. |
| `ResourceKeywords.kt:6` | low | KDoc says it "replaces all individual language keyword classes (KotlinKeywords, JavaKeywords, etc.)" — grep finds those names only in this comment. | Delete the two-line note; keep the rest. |
| `SourceAnalyzer.kt:18` | low | Four new files declare their own `KotlinLogging.logger {}` while `DomainLanguageParser.kt:19` uses the `util.Logger` facade — 49 main sources use the facade, 1 pre-existing outlier does not. | Route through `util.Logger`; it needs `warn(throwable, …)` and `error(throwable, …)` overloads (four call sites: `FrameworkDetector.kt:52,83`, `FileScanner.kt:60`, `CoroutineFileProcessor.kt:41`). |
| `FileAnalyzerTest.kt:24` | low | Eight manual `createTempDirectory()` with cleanup as the last statement — a failing assertion orphans the dir. Sibling tests (`TestFileDetectorTest.kt:15`, `FileFilterTest.kt`) use `@TempDir`. | `@TempDir tempDir: Path`; delete the eight `deleteRecursively()` lines. |
| `redirectAwayFromDomainView.effect.ts:46` | low | `redirectToMetricsViewWithoutDomainLens$` names one of two triggers; the stream it filters is correctly `isDomainViewUnreachable$` (lens **or** delta mode). Zero other references — one-line rename. | `redirectAwayFromUnreachableDomainView$`. The 20-line comment above is legitimate WHY (guard-vs-effect rationale) — keep it. |
| `loadingFileProgressSpinner.component.ts:25` | low | `isLoading$` is a `Signal<Observable<boolean>>`; the template must write `isLoading$() \| async`. Every other `$` in the codebase is a real Observable — this is the only `readonly x$ = computed(...)`. | Rename to `isLoadingStream`. |
| `domainBar.read.store.ts:15` | low | `inject(Store)` without `<CcState>` in four new stores; ~20 pre-existing stores type it, and `wordCloud.write.store.ts:9` in this same branch does too. Also `domainBar.write.store.ts:22`, `wordCloud.read.store.ts:17`, `viewSwitcher.read.store.ts:9`. | `private readonly store: Store<CcState> = inject(Store)`. |
| `revealSelectedNodeAfterLoad.effect.ts:24` | low | Uses `inject()`; the branch's other new effect (`redirectAwayFromDomainView.effect.ts:34`) uses constructor injection, as do all 14 pre-existing effects. Two new effects, two styles, one PR. | Pick one for both. `inject()` is the Angular 20 idiom, so converting the other new effect is defensible — just don't ship both. |
| `domain.selectors.ts:20` | low | `wordsForSelectedNodeSelector` is a factory named like a plain selector; both call sites double-apply it. The one existing factory is `createBlacklistItemSelector`. | `createWordsForSelectedNodeSelector`; 3 call sites. |
| `viewReadiness.store.ts:23` | low | Plain `BehaviorSubject` service under top-level `stores/`, where every sibling is an ngrx state home with a facade + `store/` folder + `CcState` slot. Its near-twin `routing/activeView.store.ts` — same shape, added by this branch — lives elsewhere, and imports `ViewId` back out of `stores/`. | Move to `routing/viewReadiness.store.ts` beside its twin; also colocates `ViewId`/`VIEW_IDS` with `routePaths.ts`, which its comment says it mirrors. |
| `activeView.store.ts:30` | low | `routePaths.ts:2-4` promises "adding or renaming a view is a single-file change", but `currentView()` hardcodes the mapping and `viewReadiness.store.ts:4-7` re-declares `ViewId`/`VIEW_IDS` under a comment admitting it "Mirrors routePaths". The `: "metrics"` else-branch silently misclassifies unmatched URLs — untested. | `export type ViewId = keyof typeof routePaths` + a `viewIdForLink(url)` helper in `routePaths.ts`. Keep an explicit fallback and test it. |
| `navBar.component.ts:51` | low | (SOLID facet of theme 2) NavBar now owns global CSS-variable publishing alongside nav content. Note the branch *moved* this here — on main it lived in `codeMap.component.ts:49`. | Resolved by the `PublishesHeightDirective` extraction. |
| `settingsInput.ts:3` | low | Comment still says "shared by the metrics-bar settings popover number inputs" after the branch moved the file to `shared/util/` precisely so domainBar could use it. | Reword to the shared scope, or drop the feature names entirely. |
| `queryPreservingHashLocation.strategy.ts:43` | low | `pushState`/`replaceState` overrides + `toAbsoluteUrl` reproduce the base class, which already calls `this.prepareExternalUrl(path + normalizeQueryParams(queryParams))` — virtual dispatch means the override already applies. `toAbsoluteUrl` also hand-reimplements Angular's `normalizeQueryParams`. | Delete all three members; keep only `prepareExternalUrl`. Specs pass unchanged (neither asserts on the overrides), and the dropped `|| pathname` fallback is unreachable. No comment edit needed — lines 22-26 already justify this. |

---

## Recommended order of work

**Before merge**

1. `visualization/package.json:39` — the publish hook. It breaks consumer installs and the patch is not being applied in dev either.
2. `NgramsStage.kt:116` — `containsWordSubsequence` drops n-grams across word boundaries. Real output defect.
3. `ConfigurationBuilder.kt:49` + `Language.kt:12` — wire the keyword filters (scoped, not globally pooled) so 14 languages stop shipping unfiltered.
4. `domainExplorerHost.ts:90` — single `wordSizingValue`; the tooltip currently contradicts its own documented invariant and renders `0` to users.
5. `DomainLanguageParser.kt:25` — add `DomainLanguageParserTest.kt` + `DialogTest.kt`. The new CLI surface has four validation guards and a four-branch applicability check with no coverage.
6. `SourceCodePipelineTest.kt:201` and `:169` — make the two vacuous assertions real.

**Follow-up (structural, Tidy First — separate commits, no behavior change)**

7. Delete the dead surface in one pass: `domainBar.readWindow.ts:25-33` + nine selector files, `markStale`, `WordAnalyzer`, `outputFile`/`quiet`, the no-path pipeline overload, `ROTATE_RATIO`, `RenderContext.colors`.
8. Extract `PublishesHeightDirective` (mind bottomBar's `<footer>` target) and `cc-domain-segment` (fixes the `domain-bar-toggle` id drift).
9. `NgramsStage.applyStatisticalSubstringReduction` — extract the six steps; delete the markers as you go.
10. `ConfigurationBuilderTest.kt` — the `parsedArguments(...)` factory. Do this before adding tests in item 5 if those tests touch the same file.
11. The comment sweep (theme 3), the naming/consistency table rows, and `color.util.ts` → `ColorConverter`.