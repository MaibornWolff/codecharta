# Branch Review — `feature/domainlanguage-parser`

**Scope:** 12 commits vs `main` · 401 files · +23,512 / −971 · new Kotlin `DomainLanguageParser`, new Domain View + word cloud, sidebar-explorer refactor.
**Method:** 6 reviewer lenses, each fanned out over 4 subsystems (analysis parser · domain feature · explorer refactor · cross-cutting infra), synthesized per lens, then every high-severity technical finding adversarially verified. Plus the real frontend tooling gates.

---

## TL;DR

| Lens | Grade |
|---|---|
| Clean Code | **B** |
| SOLID | **B−** |
| DRY | **C** |
| Architecture | **B−** |
| Comment Hygiene | **B+** |
| Brutal Roast | **C** |

**The one thing to fix before merge — a real functional bug (verified by hand):**
Four `DomainState` settings — **`DrawOutOfBound`, `ShrinkToFit`, `SortingOrder`, `SortingOrderAscending`** — are restored on load but **never persisted**. `actionsRequiringSaveCcState.ts` registers a save-trigger for only **7** of the 11 domain setters that `loadInitialFile.store.ts` dispatches on restore. The per-view sort order (the feature this branch's last commits added) silently does not survive a reload.
→ `visualization/app/codeCharta/load/effects/saveCcState/actionsRequiringSaveCcState.ts` vs `visualization/app/codeCharta/load/loadInitialFile.store.ts:258`

**Everything else is quality/design, not correctness.** No critical defects. The recurring story across all lenses: *competent code buried under ceremony* — 11 folder-per-primitive ngrx slices, three parallel hand-maintained registries (persist / restore / merge) that have already drifted, and load-bearing logic copied instead of reusing helpers that already exist and are exported.

---

## Frontend Tooling Gates (actually run on the branch)

| Gate | Result |
|---|---|
| **Unit tests** (`jest`) | ✅ 376 suites / 2546 tests green (2544 pass, 2 todo), 45 snapshots |
| **Knip** (dead code / unused deps) | ✅ clean |
| **lint:styles** (custom) | ✅ clean |
| **Biome** | ❌ 3 auto-fixable `organizeImports` errors — `domainState.read.facade.ts`, `sidebarExplorer/facade.ts`, `explorerSortControl.component.spec.ts` (slipped past the pre-commit hook; `npm run format` clears them) |
| **dependency-cruiser** (`lint:architecture`) | ❌ 3 boundary violations — `navBar`, `fileExtensionBar`, `bottomBar` import `features/shared/.../publishesHeight.directive.ts` **directly** instead of via the shared public API barrel (`feature-cross-feature-only-via-public-api`) |

---

## Verification Highlights

- ✅ **Persistence-drop bug (SOLID/high)** — CONFIRMED by hand: 7 setters saved vs 11 restored.
- ❌ **"cc.json 2.0 schema duplicated in two files will drift" (DRY/high)** — FALSE POSITIVE: `ccJson2Schema.drift.spec.ts` already asserts `toEqual` between the vendored copy and `dev_docs/cc-json-2.0.schema.json`. The duplication is real but guarded.
- The generic-explorer coupling, `domainWords` persistence-asymmetry, and twin-selector findings were all judged technically accurate but **overstated → low** (real coupling, minor impact).

## Adversarial Verification of High-Severity Technical Findings

Every `high`/`critical` non-roast finding was independently re-checked by a skeptic agent instructed to refute it. Net across both verify passes:

- **OVERSTATED → low** — [solid] WordCloudComponent violates its own "reusable presentational component" contract by hard-wiring the domain view
  - `visualization/app/codeCharta/renderer/wordCloud/components/wordCloud/wordCloud.component.ts:81`
  - Every literal claim in the finding checks out: the file is new on this branch; line 81 injects the routing-layer ViewReadinessStore, line 80 injects WordCloudReadStore, lines 152/191 hardcode markReady("domain"), and the docstring at 67-70 uses the phrase "reusable presentational component." The DIP/SRP coupling critique is legitimate — a renderer reaching up into an app-global routing store and baking in a caller-specific "domain" string is genuine cross-layer coupling.

However, "high" severity is not justified. (1) The docstring's "reusable presentational component" claim is explicitly and 
- **FALSE_POSITIVE → none** — [dry] cc.json 2.0 JSON schema maintained verbatim in two files
  - `visualization/app/codeCharta/util/ccJson2Schema.json:47`
  - The two schema files are genuinely byte-identical and both are edited on this branch — that observation is literally true. However, the finding's entire severity rests on the claim that they "will silently drift the first time only one is edited," and that is false. A dedicated guard test, visualization/app/codeCharta/util/ccJson2Schema.drift.spec.ts, imports the vendored copy and reads dev_docs/cc-json-2.0.schema.json, asserting expect(vendoredSchema).toEqual(sourceSchema). This test already exists on main (confirmed via git cat-file -e main:...), is collected by the CI glob (test:ci runs .*\
- **OVERSTATED → low** — [architecture] domainWords is first-class in the type but second-class in persistence, spawning a cascade of defensive workarounds
  - `visualization/app/codeCharta/stores/fileStore/loaders/ccJson/util/fileParser.ts:17`
  - Literally accurate: getExportCCFile (fileParser.ts:17-36) copies edges, markedPackages, blacklist, attributeTypes, attributeDescriptors but NOT domainWords, which is a required member of CCFile.settings.fileSettings (domain.model.ts:25). The named workarounds also exist — visibleFileStatesWithCurrentSettingsSelector (visibleFileStates.selector.ts:74) has an in-code comment describing exactly the domain-less-parse / double-commit interaction. However the severity and framing are overstated. (1) getExportCCFile emits the LEGACY 1.x ExportCCFile shape (codeCharta.api.model.ts:10), which predates 
- **OVERSTATED → low** — [architecture] Two look-alike selectors with divergent memoization encode a correctness constraint in which one you import
  - `visualization/app/codeCharta/stores/fileStore/store/visibleFileStates.selector.ts:74`
  - The code matches the finding's technical description: visibleFileStatesSelector (line 57-59) memoizes via _onlyVisibleFilesMatterComparer, which keys only on visible-file fileChecksums (lines 20-31), so its args-comparer returns true and hands back a stale projection when file entries are replaced by richer objects under the same checksum. visibleFileStatesWithCurrentSettingsSelector (line 74) is a plain createSelector. So two look-alike selectors with divergent memoization genuinely exist. However, this is NOT an active correctness bug. The only consumer that reads per-file fileSettings domai

## Clean Code — Grade: B

This branch is broadly clean and internally consistent: it follows the codebase's established idioms (per-slice key->action mappers, named style/config constants, injected collaborators assembled by factories), and the sub-reviewers surfaced no correctness-threatening Clean Code defects. The one finding with real teeth is a stale migration comment that now lies about the IndexedDB migration range (says v18 while the chain and DB_VERSION reach v19) — a confirmed comment-quality defect that will actively mislead. The rest are honest, low-impact hygiene items clustered around two themes: DRY duplication of load-bearing logic (a word-ranking comparator, path-to-node-name extraction, query-string stripping) copied instead of reused, and a handful of methods/constructors that exceed the project's <25-line and 3-4-parameter rules while mirroring existing patterns. Naming and error handling are largely fine, with only isolated slips (a single-letter loop index, inline magic CSS/px strings). Nothing here blocks merge, but the duplicated comparator and stale comment are worth fixing before they drift.

**Recurring themes:**
- Load-bearing logic duplicated instead of reusing an existing shared/exported function (comparator, path parsing, query-strip) — the copies already differ subtly and can silently drift
- Methods and constructors exceed the project's hard limits (<25 lines, max 3-4 params), mostly mirroring existing codebase idioms rather than introducing new smells
- Magic literals inline (CSS strings, px fallbacks) where the same file/branch already establishes a named-constant pattern
- Stale comments left behind by an otherwise-complete change (migration range v18 vs actual v19)

### 🟡 MEDIUM — Migration comments claim v18 as the latest but the chain reaches v19
`visualization/app/codeCharta/stores/rootStore/indexedDB/indexedDBWriter.ts:466`

Confirmed by reading the file: CCSTATE_RECORD_MIGRATIONS ends at { version: 19, migrate: migrateCcStateRecordToV19 } (line 484) and DB_VERSION is 19, but the comment at line 466 still reads 'a v2 blob runs v3->...->v18; a v17 blob runs only v18' and line 506 says 'Migrate persisted blobs forward through all applicable transforms (v3->...->v18).' Both comments now understate the real migration range by one version. This is exactly the stale-comment defect the Clean Code lens flags: a future reader reasoning about the migration chain will trust an out-of-date upper bound.

**Fix:** Update both comments (lines 466 and 506) to reference v19. Consider deriving the bound from the array rather than hardcoding it in prose so the comment cannot drift again.

### 🟡 MEDIUM — Word-ranking comparator duplicated verbatim instead of reusing exported selectTopWords
`visualization/app/codeCharta/views/domainView/explorer/domainExplorerSelection.ts:72`

Confirmed: domainExplorerSelection.topWords() copies the exact comparator [...words].sort((a, b) => wordSizingValue(b, sizingMode) - wordSizingValue(a, sizingMode)).slice(...) that is already implemented and EXPORTED as selectTopWords in wordCloudOption.builder.ts:122. The method's own doc comment states the intent is to rank 'the same way the cloud sizes its words', yet it duplicates the comparator rather than calling the shared function — so the tooltip ranking and the cloud ranking can silently diverge. The only real difference is the slice count (TOOLTIP_WORD_COUNT vs topN). Violates the project DRY rule for load-bearing logic.

**Fix:** Extract a shared rankWordsBySizing(words, sizingMode) (or call selectTopWords with the tooltip count) so both the view and the renderer share one comparator definition.

### ⚪ LOW — processFilesIndividually / SourceAnalyzer / SourceCodePipeline exceed the max 3-4 parameter rule (recurring)
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/FileProcessor.kt:18`

Recurs across three Kotlin signatures on the branch. processFilesIndividually takes 5 params including two collaborator lambdas (contentReader, processor) plus an optional callback, and the same 5-param shape repeats in CoroutineFileProcessor.kt:14 and SourceAnalyzer.processFilesIndividually (SourceAnalyzer.kt:86). SourceAnalyzer's constructor injects 6 collaborators (SourceAnalyzer.kt:18) and SourceCodePipeline's constructor takes 5 (SourceCodePipeline.kt:25, mixing language/weights/ngrams/stopWordFilter/enableSsr). All exceed CLAUDE.md's 'Max 3-4 parameters'. The constructors are DI seams assembled by factories, so call-site burden is low, but the processFilesIndividually collaborator group is a genuine candidate for a small parameter object.

**Fix:** Group the read/process/report collaborators of processFilesIndividually into one parameter object (fixes all three copies at once); optionally bundle the pipeline-configuration knobs (weights/ngrams/enableSsr) into the existing config object. Constructor DI seams are lower priority.

### ⚪ LOW — Path-to-node-name and query-string-strip idioms re-implemented instead of reusing a single owner
`visualization/app/codeCharta/views/domainView/domainView.component.ts:71`

Two separate DRY slips of the same shape. (1) 'last non-empty path segment' is implemented independently in domainView.component.ts:71 (`selectedNodePath()?.split("/").filter(Boolean).at(-1) ?? ""`) and wordCloud.read.store.ts:32 (`nodePath.split("/").filter(Boolean).at(-1) ?? fileRoot.rootName`); they differ only in fallback, so the collapsed explorer name and the cloud empty-state name can disagree for the same null selection. (2) redirectAwayFromDomainView.effect.ts:60 re-implements query stripping (`this.router.url.split("?")[0] === routeLinks.domain`) that routePaths.ts:33 already owns in viewIdForLink, despite routePaths.ts being documented as the routing topology 'in ONE place'.

**Fix:** Extract a pathToNodeName(path, fallback) helper used by both view and read store; express the route check as viewIdForLink(this.router.url) === "domain" so the query-strip idiom lives only in routePaths.ts.

### ⚪ LOW — Magic pixel and CSS literals inline where a named-constant pattern already exists (recurring)
`visualization/app/codeCharta/features/shared/components/barShell/barShell.directive.ts:13`

Recurs across barShell.directive.ts and sidebarExplorer.component.ts: bar-height fallbacks (32px bottom bar, 17px file-extension bar, 49px combined) are hardcoded in multiple calc() strings across files (32px appears in both barShell.directive.ts:13 and sidebarExplorer.component.ts:42), so changing a default requires editing every string by hand — while BAR_GAP_PX is already a named constant right next to them. Separately, hoverTooltip.service.ts:104/110 hardcodes inline title-row/value-row CSS ('font-weight: 600; margin-bottom: 2px;', 'font-size: 10px; opacity: 0.7;') even though the same file extracts container styling into the named TOOLTIP_STYLE constant. CLAUDE.md's TS rules call out 'no magic numbers'.

**Fix:** Centralise the bar-height fallbacks as named constants (matching BAR_GAP_PX) and extract TOOLTIP_TITLE_STYLE / TOOLTIP_ROW_STYLE to match the TOOLTIP_STYLE pattern the file already establishes.

### ⚪ LOW — Methods exceed the 25-line rule (buildWordCloudOption, mapDomainStateToAction)
`visualization/app/codeCharta/renderer/wordCloud/util/wordCloudOption.builder.ts:156`

Two methods pass the project's hard <25-line limit. buildWordCloudOption runs ~50 lines (156-188), most of it a single declarative echarts series[0] option literal. mapDomainStateToAction (loadInitialFile.store.ts:258) is a ~39-line 11-case dispatch switch with mechanical 'case X: dispatch(setX({ value })); break' repetition; it mirrors the existing mapMetricsLensSourceToAction/mapMapStateToAction idiom but is the longest of them. Both are low cognitive risk (declarative literal / mechanical switch) but exceed the stated bound.

**Fix:** Extract a buildSeries(topWords, settings, context) helper from buildWordCloudOption to separate data mapping from option assembly; consider a table-driven key->action-creator map to collapse mapDomainStateToAction's cases to a lookup (would also fix the sibling mappers).

### ⚪ LOW — detectJavaScriptFrameworks and detectCSharpFrameworks are structurally duplicated
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/FrameworkDetector.kt:34`

Both methods share an identical skeleton: find files -> return emptyMap if none -> iterate -> try { extract refs; identify frameworks; store by parent dir } catch (e) { Logger.warn }. detectCSharpFrameworks (lines 66-87) mirrors detectJavaScriptFrameworks almost verbatim, and the sub-reviewer notes the two copies already diverge subtly in the merge step — the kind of drift duplication invites. Only 2 occurrences (just under the '3+ -> extract' threshold), hence low.

**Fix:** Extract a generic helper parameterised by the file finder, dependency extractor, and framework identifier so the loop/try-catch/accumulate skeleton exists once and the merge step cannot diverge.

### ⚪ LOW — findRedundantNgrams nests 5 levels deep (single-level-of-abstraction violation)
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/pipeline/stages/NgramsStage.kt:80`

The redundancy check stacks for-loop -> for-loop -> asSequence().filter().any() -> nested any() -> boolean predicate in one method, mixing iteration control with the subsequence/frequency comparison at several abstraction levels. CLAUDE.md asks to 'split complex logic into focused helpers' and prefer guard clauses over nesting.

**Fix:** Extract the 'is this shorter n-gram subsumed by any longer one' test into a named helper taking (shorterNgram, shorterWords, shorterFrequency) to flatten the nesting to a single level.

### ⚪ LOW — MetricsExplorerRow spec duplicates the entire projectExplorerRow projection spec
`visualization/app/codeCharta/views/metricsView/explorer/metricsExplorerRow.spec.ts:44`

MetricsExplorerRow.project is a thin adapter forwarding areaMetric/buildingIds/rootUnary into the pure projectExplorerRow lens, yet its spec re-verifies every branch of that lens with byte-identical fixtures and the same seven 'should ...' cases already covered by explorerRow.projection.spec.ts. The same behaviour must now be maintained in two places.

**Fix:** Reduce the adapter spec to assert only the wiring (that injected area metric / building ids / root unary are passed through) and leave projection-logic branches to the lens spec.

### ⚪ LOW — Single-letter loop variable 'i' in getParentDirectories
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/output/DirectoryWordAggregator.kt:41`

CLAUDE.md's 'Expressive Naming' rule requires descriptive names (>2 chars) and 'no single-letter variables'. The index counter here is named 'i'. Isolated slip on an otherwise well-named branch.

**Fix:** Rename to depthIndex (or build the ancestor paths via a running accumulator) to comply with the naming rule.


## SOLID — Grade: B-

The branch shows genuine SOLID intent — it introduced injection-token ports for the generic explorer, an ActiveViewStore abstraction, and a per-view ViewReadinessStore — but repeatedly leaves those abstractions half-applied, which is the branch's defining SOLID weakness. The clearest defect is the WordCloudComponent, which documents itself as a reusable presentational component while injecting a routing store and hard-coding the string \"domain\", making it a domain-bound container that also scrapes undocumented ECharts internals. The explorer port refactor never reached the tree-DATA path or two leaf components, so mapState leaks back in as a concretion. A recurring switch-on-type/OCP smell appears in at least four places (Framework detection, DomainState action mapping with three disagreeing lists, WordCloudSizingMode, TestFileDetector), several with silent runtime-only failure modes. None of these are architecture-breaking and the direction of travel is good, but the consistent pattern of stopping one step short of the abstraction keeps this from a B+.

**Recurring themes:**
- Abstractions introduced but only partially applied — ports/stores exist yet high-level code still reads concretions (mapState in the explorer selector, Router.url instead of ActiveViewStore, hard-coded "domain")
- Switch-on-type/OCP: extending a concept requires coordinated edits across parallel, already-disagreeing lists, often failing only at runtime (Framework x3, DomainState x3, sizing mode, test-file naming)
- God/multi-responsibility units where a name promises one thing: FrameworkDetector, WordCloudComponent, LoadingIndicatorEffect, MetricsExplorerSelection adapter
- DIP: components/builders reaching up into global stores or newing collaborators instead of receiving projected inputs or constructor dependencies

### 🟠 HIGH — WordCloudComponent violates its own "reusable presentational component" contract by hard-wiring the domain view
`visualization/app/codeCharta/renderer/wordCloud/components/wordCloud/wordCloud.component.ts:81`

The class docstring (line 69) claims "the cloud stays a reusable presentational component," yet it injects the routing-layer ViewReadinessStore (line 81), hardcodes the view identity with markReady("domain") in two spots (lines 152, 191), and injects WordCloudReadStore to fetch its own data by path (line 80). A genuinely reusable renderer cannot know it is the "domain" view; this is a DIP/SRP violation where a presentational renderer reaches up into an app-global store and bakes in a caller-specific string. Reused elsewhere it would falsely mark the domain view ready.

**Fix:** Expose a (ready) output the composing DomainViewComponent maps to markReady("domain"), and pass in data via input rather than injecting the read store, so the component is truly view-agnostic.

### 🟡 MEDIUM — Generic explorer port refactor left the tree-data path still bound to mapState (recurs at selector and leaf level)
`visualization/app/codeCharta/features/sidebarExplorer/selectors/explorerTreeNode.selector.ts:15`

The branch's stated goal is a generic sidebarExplorer carrying no map/domain concepts (explorerTreeLevel.component.ts:1941, write-store comment), and selectability/dimming/decoration/title/sort/context-menu were all inverted behind injection tokens. But the DIP inversion is partial in two places: (1) createExplorerTreeNodeSelector — consumed by the shared SidebarExplorerReadStore.rootNodeFor that BOTH views use — still imports areaMetricSelector from mapState directly, so the domain word-cloud view (which has no area metric) still drags in mapState as a concretion; and (2) the leaf explorerTreeItemIcon.component.ts:16 still injects SharedViewReadWindow for markedPackages$ and its sibling ExplorerTreeItemNameComponent injects SidebarExplorerReadStore for searchedNodePaths$, so the same fact (isDimmed) arrives both as a projected input and by the component reading a global store. Recurs across the subsystem: the abstraction was built but not applied to the data path.

**Fix:** Mirror the sort port: pass areaMetric into the shared selector via a port/parameter, and funnel markedPackages/searchResult through the ExplorerRow projection so the generic components read no global slices.

### 🟡 MEDIUM — FrameworkDetector is a god object and adding a framework requires coordinated edits across three places (SRP + OCP)
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/FrameworkDetector.kt:17`

FrameworkDetector has several distinct reasons to change: walking the source tree (findPackageJsonFiles/findCsprojFiles), parsing two unrelated formats (kotlinx JSON for package.json, regex for .csproj XML), and mapping dependencies to frameworks for two ecosystems (JS/TS and C#) via duplicated discover-parse-identify-merge blocks (lines 34-54 vs 66-87). Compounding this, framework knowledge is scattered across three modules that must be edited together for one new framework: the Framework enum (FrameworkDetector.kt:10), the dependency-identification if-chains (FrameworkDetector.kt:113/122), and the framework-to-keyword-resource when in PathScopedKeywordProvider.kt:28. There is no single Framework descriptor owning its detection predicate and keyword resource, so the code is not open for extension without modification.

**Fix:** Introduce a self-contained per-ecosystem detector and a Framework descriptor that owns its detection predicate and keyword resource, so a new framework/ecosystem is added rather than editing an exhaustive when and three parallel lists.

### 🟡 MEDIUM — LoadingIndicatorEffect owns two responsibilities: the loading flag and cross-view readiness orchestration
`visualization/app/codeCharta/features/codeMap/effects/setLoadingIndicator/setLoadingIndicator.effect.ts:36`

SRP: the effect's own doc (line 24) admits it "Owns two distinct things that used to be one overloaded boolean" — the isLoadingFile lifecycle (hideLoadingFileOnCommit$, line 45) and per-view readiness/staleness for ALL routed views (markViewsStaleOnDataChange$ calls viewReadinessStore.markAllStale() at line 62, invalidating the domain word-cloud view; markMetricsReadyOnRender$ at line 79 marks the metrics view ready). A codeMap-feature loading effect thus coordinates the domain view's readiness — a view it otherwise knows nothing about — and its name no longer describes what it does.

**Fix:** Move the data-change→invalidate-all-views orchestration beside ViewReadinessStore in the routing layer, leaving this effect responsible only for the loading flag.

### 🟡 MEDIUM — WordCloudComponent is a god component that also scrapes ECharts private internals
`visualization/app/codeCharta/renderer/wordCloud/components/wordCloud/wordCloud.component.ts:79`

Beyond the routing coupling, the single component owns many axes of change: derived a11y text, chart init/dispose lifecycle, ResizeObserver management, a render debounce, a separate drawn-count debounce, reduced-motion detection, empty-state handling, and view-readiness signalling. The drawn-word-count concern is especially separable: countDrawnWords (line 223) casts the chart to a private EchartsWithModel shape (line 56) and walks getModel().getSeriesByIndex(0).getData().getItemGraphicEl(i) — a deep Law-of-Demeter/DIP coupling to undocumented echarts-wordcloud internals embedded directly in the view.

**Fix:** Extract the EchartsWithModel interface, countDrawnWords, scheduleDrawnCountUpdate, drawnWordCount and droppedWordNotice into a dedicated collaborator so the component is not simultaneously a chart host and an echarts-internals scraper.

### ⚪ LOW — Switch-on-key/type handlers that require synchronized edits across disagreeing lists to extend (recurs in three spots)
`visualization/app/codeCharta/load/loadInitialFile.store.ts:258`

OCP: mapDomainStateToAction is an 11-branch switch over keyof DomainState whose default throws at runtime (line 294) for any unhandled key — adding a DomainState setting is not a compile error, surfacing only when a persisted blob is restored. The same knowledge is duplicated across three hand-maintained lists that already disagree: the DomainState interface (11), this switch (11), and domainStateSaveActions in actionsRequiringSaveCcState.ts (only 7 of 11 — shrinkToFit, drawOutOfBound, sortingOrder, sortingOrderAscending absent). The same anti-pattern recurs: WordCloudSizingMode is handled by a binary ternary + two hardcoded <option>s + a tfidf branch across three files (domainBar.component.ts:33) while its sibling WordCloudShape iterates the enum open-for-extension; and TestFileDetector.hasTestFileName (TestFileDetector.kt:30) dispatches per-language over a hardcoded when covering only 4 of 17 languages.

**Fix:** Replace switch-on-type with a single keyed map (key→action-creator / mode→descriptor / language→pattern) so extending is a one-line, type-checked change and the parallel lists cannot drift.

### ⚪ LOW — MetricsExplorerSelection is a fat adapter aggregating seven collaborators across four concerns
`visualization/app/codeCharta/views/metricsView/explorer/metricsExplorerSelection.ts:32`

The metrics-view ExplorerSelection adapter injects seven collaborators (Store, SharedViewReadWindow, ThreeSceneService, IdToBuildingService, ThreeRendererService, CodeMapMouseEventService, CodeMapTooltipService) and each write method mixes four responsibilities: dispatching sharedView writes, mutating the Three.js scene selection, forcing renderer.render(), and driving the tooltip — exceeding CLAUDE.md's max 3-4 dependencies / single-responsibility guidance. It is defensible as the cohesive 'what selection means on the map' adapter, so severity is low, but the collaborator count signals a further split (a scene-selection facade wrapping scene+renderer+idToBuilding).

**Fix:** Wrap scene+renderer+idToBuilding behind a scene-selection facade so the adapter depends on fewer, higher-level collaborators.

### ⚪ LOW — RedirectAwayFromDomainViewEffect hand-parses Router.url instead of using the ActiveViewStore abstraction built for it
`visualization/app/codeCharta/features/navBar/effects/redirectAwayFromDomainView/redirectAwayFromDomainView.effect.ts:59`

DIP/DRY: the branch ships ActiveViewStore (currentView()/activeView$) and viewIdForLink() as the abstraction for 'which view is the URL on', both of which strip the query string before matching routePaths. This effect bypasses that abstraction, injects the concrete Router, and reimplements the same matching with a raw string split (isOnDomainRoute, line 59: this.router.url.split("?")[0] === routeLinks.domain), re-encoding '?'-splitting and domain routeLink knowledge that viewIdForLink already owns — so a change to route→URL mapping must now be made in two places.

**Fix:** Depend on ActiveViewStore (isOnDomainRoute → this.activeViewStore.currentView() === 'domain') to remove the duplication and the Router coupling.

### ⚪ LOW — ConfigurationBuilder hard-wires FrameworkDetector and DlcIgnoreParser instead of receiving abstractions
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/cli/ConfigurationBuilder.kt:41`

DIP inconsistency: ConfigurationBuilder news up FrameworkDetector() and DlcIgnoreParser() directly inside its methods (detectFrameworks(...) = FrameworkDetector().detectFrameworks(...); loadCustomStopWords news a DlcIgnoreParser) rather than receiving them, unlike SourceAnalyzer/StopWordFilter which take dependencies via constructor. The concretions cannot be substituted or stubbed independently, and the builder is coupled to filesystem-walking behavior at construction time.

**Fix:** Inject FrameworkDetector and DlcIgnoreParser via the constructor, matching the SourceAnalyzerFactory pattern used elsewhere in the module.

### ⚪ LOW — DomainViewComponent mixes view composition with clipboard-copy UI logic
`visualization/app/codeCharta/views/domainView/domainView.component.ts:86`

SRP: the view-composition component (which wires explorer ports, computes the cloud inset, and owns the ephemeral selection) also carries a self-contained clipboard-copy-with-transient-feedback concern: copySelectedPath (line 86) directly calls navigator.clipboard.writeText (a concretion, line 91), toggles a copied signal, and manages a COPY_FEEDBACK_MS timeout it must also tear down in the DestroyRef hook.

**Fix:** Move copy-with-feedback into a small copy-to-clipboard directive/service so the view stays focused on composition.


## DRY — Grade: C

The branch carries one genuinely serious DRY defect — the cc.json 2.0 schema is maintained as two byte-identical files (verified), and this branch edits DomainLens/DomainWord into both — which is a versioned data contract that will drift. Beyond that, most of the duplication is structural boilerplate: nine near-identical domainState reducer/action slices plus the same setting-key set re-enumerated across ~6 files, a key->setter dispatch switch now cloned a 5th time, and a keyword resource-path literal spelled out 27 times. Some of this (the ngrx per-slice style, the ExplorerSort port adapters) honestly mirrors accepted house style and port design rather than new debt, and a few items are eyes-open, comment-acknowledged mirrors. But the branch had clear openings to introduce factories/tables/helpers the codebase never had and mostly did not, and at least two duplications have already drifted (28px vs 32px bar-height fallbacks; the FrameworkDetector merge inconsistency). Net: acceptable but with real, extractable knowledge duplication that should be single-sourced before merge, the schema copy foremost.

**Recurring themes:**
- Knowledge single-sourcing failures: the same fact (cc.json schema, keyword resource path, bar-height fallback px, brand hex, setting-key set) is transcribed in multiple files with no enforced link, and several have already drifted
- Per-setting ngrx boilerplate: identical reducer/action slices, re-enumerated key lists, and cloned key->setter dispatch switches that beg for a factory or data-driven table
- Copy-paste over reuse of an existing single source: hand-rolled word ranking, URL/route parsing, and map-accumulation idioms re-implemented when an exported helper (selectTopWords, viewIdForLink, Map.merge) already exists
- Templated language/framework detection paths (JS vs C#, Kotlin vs Java test patterns) duplicated structurally, one copy introducing an inconsistency
- Much duplication mirrors accepted house style (mapState slices) or justified port adapters — real but partly conventional, lowering severity

### 🟠 HIGH — cc.json 2.0 JSON schema maintained verbatim in two files
`visualization/app/codeCharta/util/ccJson2Schema.json:47`

The cc.json 2.0 schema exists as two byte-identical copies (confirmed: diff reports IDENTICAL): dev_docs/cc-json-2.0.schema.json and visualization/app/codeCharta/util/ccJson2Schema.json. This branch adds the same DomainLens/DomainWord definitions and the same Lenses-description edit to BOTH files. Every future schema change must be hand-mirrored across two locations, and they will silently drift the first time only one is edited. This is the single most impactful DRY defect on the branch: it is a versioned data-contract, not incidental code.

**Fix:** Single-source the schema — generate the visualization copy from dev_docs at build time via the existing schema:generate tooling (or import one from the other), so DomainLens/DomainWord and all future edits live in exactly one file.

### 🟡 MEDIUM — Nine byte-identical domainState reducers + word-cloud setting key set re-enumerated across ~6 files
`visualization/app/codeCharta/stores/domainState/store/gridSize/gridSize.reducer.ts:7`

The branch adds 11 per-setting slices under domainState/store; nine (gridSize, rotationRange, rotationStep, shape, sizeRange, sizingMode, topN, drawOutOfBound, shrinkToFit) are structurally identical 2-line createReducer/setState pairs differing only by the capitalized setting token, with equally templated action files (confirmed 11 slice dirs present). The same nine-key set is then re-transcribed by hand in wordCloudSettings.selector.ts:8-17 (field-by-field just to drop the two sorting keys), domainBar.write.store.ts:25-59 (nine 1:1 setX->dispatch(setDomainStateX) setters), and defaultDomainState/combineReducers in domainState.reducer.ts. Adding one setting means editing ~6 files. Note: this mirrors the established mapState house style (~30 slices written the same way), so it is accepted convention as much as new debt — but the branch could introduce the generalization the codebase never had.

**Fix:** Introduce a createWordCloudSettingSlice(key) factory returning {action, reducer, default}, drive the setters/selector/reducer registration from one key list (pick/spread the WordCloudSettings-shaped subset), so a new setting is a single-line change.

### 🟡 MEDIUM — key->setter dispatch switch duplicated a 5th time in mapDomainStateToAction
`visualization/app/codeCharta/load/loadInitialFile.store.ts:258`

mapDomainStateToAction is an 11-arm switch where every case is the identical shape `case "x": this.store.dispatch(setDomainStateX({ value })); break`. The same boilerplate already exists in mapMapStateToAction (line 359), mapSharedViewToAction (299), mapPreferenceToAction (322) and mapMetricsLensSourceToAction (228); this branch adds the largest new instance, so the structural duplication now spans 5 methods, each with the same `throw new Error('Unhandled key')` tail.

**Fix:** Replace each switch with a data-driven table (Record<keyof State, (v)=>Action>) dispatched by one generic helper, collapsing ~30 near-identical arms across the 5 methods.

### 🟡 MEDIUM — keywords/<lang>-keywords.txt resource-path convention hardcoded 27 times across 3 files
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/Language.kt:14`

The resource-path convention `keywords/<name>-keywords.txt` is spelled as a raw literal in 27 ResourceKeywords("keywords/...") call sites (confirmed: Language.kt 17, ConfigurationBuilder.kt 6, PathScopedKeywordProvider.kt 4). The `keywords/` prefix and `-keywords.txt` suffix are knowledge duplicated far beyond the 3-occurrence threshold; renaming the folder or suffix means editing 27 literals. Matches the lens's 'same magic constant in multiple places' concern directly.

**Fix:** Add a single ResourceKeywords.forLanguage(name) factory (or a shared path constant) that builds the path from the bare name, and call it from all 27 sites.

### 🟡 MEDIUM — Word ranking re-implemented in the domain explorer instead of reusing exported selectTopWords
`visualization/app/codeCharta/views/domainView/explorer/domainExplorerSelection.ts:72`

wordCloudOption.builder.ts exports selectTopWords precisely so every consumer ranks words identically to the canvas (its doc comment requires the 'SAME words in the SAME order'). DomainExplorerSelection.topWords re-implements the exact sort-by-wordSizingValue-descending-then-slice expression by hand for its hover tooltip, so the ranking/tie-break knowledge lives in two places and the tooltip preview can silently diverge from the rendered cloud. wordCloud.component.ts:101 already calls the shared helper, proving the single source exists.

**Fix:** Call the exported selectTopWords(words, sizingMode, TOOLTIP_WORD_COUNT) from the explorer rather than copying its body.

### 🟡 MEDIUM — FrameworkDetector JavaScript and C# detection paths are structural copy-paste (with a merge inconsistency)
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/FrameworkDetector.kt:34`

detectJavaScriptFrameworks (34-54) and detectCSharpFrameworks (66-87) are near-identical templates (find candidate files; empty->emptyMap; iterate in try/catch extracting a dependency set, calling identify*, storing non-empty results under file.parent, warn on failure). findPackageJsonFiles (59-64) and findCsprojFiles (89-94) are the same walkTopDown().filter{}.map{toPath}.toList() differing only in the predicate, and the two identify* methods share the buildSet shape. The copy also introduced an inconsistency: detectCSharpFrameworks merges via `frameworksByPath[dir] = existing + frameworks` (78-80) while the JS path and caller use `.merge(...)`.

**Fix:** Extract a generic detect(files, extractDeps, identify) helper and a walk(root, predicate) helper; this collapses both paths and removes the merge inconsistency.

### 🟡 MEDIUM — Comment/blank-line text-file parsing duplicated between ResourceKeywordLoader and DlcIgnoreParser
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/keywords/ResourceKeywordLoader.kt:9`

The rule for parsing a keyword/stopword text file (read lines, trim, drop blanks and lines starting with '#', collect to a Set) is implemented twice with the same predicate. ResourceKeywordLoader.loadFromResource (9-13) does `map{trim}.filterNot{isEmpty()||startsWith("#")}.toSet()`; DlcIgnoreParser.parseDlcIgnoreFile (17-23) does the identical thing plus a `.map{lowercase()}`. The file/comment format is knowledge that must stay in sync (e.g. if '//' or inline comments are ever added) with nothing enforcing it.

**Fix:** Extract a shared parseWordLines(lines) helper; DlcIgnoreParser layers only the lowercase step on top.

### 🟡 MEDIUM — Bar-height pixel fallbacks duplicated as magic literals and already drifted
`visualization/app/codeCharta/features/shared/components/barShell/barShell.directive.ts:13`

The branch adds a HEIGHT_CSS_VARIABLE/PublishesHeightDirective mechanism to centralize each bar's live height, yet the fallback pixel values are hardcoded as string literals in many consumers. `--cc-bottom-bar-height` falls back to 32px in barShell.directive.ts (10,13), sidebarExplorer.component.ts (42) and fileExtensionBar.component.ts, but to 28px in domainView.component.html (36) — two files added on this branch already disagree on the same variable. `--cc-bars-height` (49px) is repeated across sidebarExplorer, loadingFileProgressSpinner and codeMap. The drift is already present, proving the risk.

**Fix:** Extract per-bar DEFAULT_*_HEIGHT_PX constants alongside HEIGHT_CSS_VARIABLE and build the var() fallbacks from them so a height change updates one place.

### ⚪ LOW — Manual '(map[key] ?: 0) + value' accumulation idiom repeated 3x while Map.merge is already used elsewhere
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/analysis/TfIdfCalculator.kt:33`

The count-into-a-mutable-map idiom `map[key] = (map[key] ?: 0) + delta` appears three times: TfIdfCalculator.countDocumentFrequency (33) and sumTermFrequency (43), and DirectoryWordAggregator (24) — while AggregateStage.kt:15 already expresses the same accumulation cleanly as `wordCounts.merge(text, weight, Int::plus)`. Hits the 3+ rule.

**Fix:** Use Map.merge / groupingBy().fold() (or a shared accumulate helper) at all three sites, matching the existing AggregateStage idiom.

### ⚪ LOW — Duplicated test-name pattern and extension-suffix predicate in the input package
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/input/TestFileDetector.kt:47`

matchesKotlinTestPattern (47-48) and matchesJavaTestPattern (55-56) are byte-for-byte identical apart from the Language constant (`hasExtensionOf(name, LANG) && nameWithoutExtension.endsWith("Test")`). Separately, the 'ends with .<ext> case-insensitive' predicate is implemented independently in TestFileDetector.hasExtensionOf (62-63) and FileFilter.matchesExtension (FileFilter.kt:6-7).

**Fix:** Share one endsWithTestSuffix(name, language) helper and one extension-match predicate across TestFileDetector and FileFilter.

### ⚪ LOW — [min,max] range-tuple update idiom copied across popover components
`visualization/app/codeCharta/features/domainBar/components/rotationSettingsPopover/rotationSettingsPopover.component.ts:28`

The pattern for updating one end of a [min,max] tuple setting is duplicated (modulo setting name) between the rotation and word-sizing popovers: min handler emits [value, settings()[1]], max handler emits [settings()[0], value]. Four handlers, two components (rotationSettingsPopover 29/33, wordSizingSettingsPopover 66/70), with a transposition risk if only one is edited.

**Fix:** Extract a small withMin/withMax (or range-input wrapper) helper so the tuple-index knowledge lives in one place.

### ⚪ LOW — migrateCcStateRecordToV17 and V18 are near-identical seed-default-root boilerplate
`visualization/app/codeCharta/stores/rootStore/indexedDB/indexedDBWriter.ts:400`

migrateCcStateRecordToV17 (400) and migrateCcStateRecordToV18 (413) are structurally identical, differing only in the root key ('domainLensSource' vs 'domainBar') and default value: guard non-object, return unchanged if key present, else spread in the default.

**Fix:** Extract seedRootIfAbsent(state, key, default) so both migrations (and the next one) become a single call.

### ⚪ LOW — Active-route detection re-derives URL parsing that viewIdForLink already owns
`visualization/app/codeCharta/features/navBar/effects/redirectAwayFromDomainView/redirectAwayFromDomainView.effect.ts:60`

isOnDomainRoute re-implements the strip-query-then-compare-to-routeLink logic that routePaths.ts centralizes in viewIdForLink (routePaths.ts:33 does the same url.split("?")[0] match). routePaths.ts advertises itself as the routing topology in ONE place, and this hand-rolled `router.url.split("?")[0] === routeLinks.domain` bypasses it.

**Fix:** Use viewIdForLink(this.router.url) === "domain" to keep URL-shape knowledge in one module.

### ⚪ LOW — Nav-bar divider markup duplicated 3x
`visualization/app/codeCharta/features/navBar/components/navBar/navBar.component.html:10`

The literal divider `<div class="w-px h-4 bg-base-300 self-center mx-1"></div>` appears three times (lines 10, 24, 28) after this branch; any change to divider styling must be edited in three places. Hits the 3+ threshold.

**Fix:** Extract a tiny cc-nav-divider component (or reuse the daisyUI divider already used on line 4).

### ⚪ LOW — Brand color hex values duplicated between color.util.ts and tailwind.css
`visualization/app/codeCharta/renderer/wordCloud/util/color.util.ts:15`

The word-cloud gradient endpoints #e6007e/#0030ff are declared both as --wordCloudColorStart/--wordCloudColorEnd (tailwind.css:50-51) and as DEFAULT_START_COLOR/DEFAULT_END_COLOR in color.util.ts (used as a non-DOM fallback for tests/SSR). Eyes-open duplication acknowledged in a comment, but two literals of the same knowledge can still drift with no compile-time link.

**Fix:** Derive the fallback from a single shared source (e.g. read the CSS var with a constant fallback defined once), or at minimum co-locate and cross-reference the two literals.


## Architecture — Grade: B-

The branch extends the existing architecture coherently rather than reinventing it: the slice-per-knob domainState and the read/write facade split deliberately mirror the established mapState and metrics/dependency source-home conventions, and across all four sub-reviews these are judged consistency-preserving, not new anti-patterns (though domainLensSource carries the full ceremony for a single field). No dependency cycles were found. What pulls the grade down is one genuine architectural root-cause defect on the visualization side — domainWords is a required fileSettings member that the export round-trip silently drops (fileParser.ts:17) — which forced a cascade of defensive workarounds (a duplicate checksum-vs-content selector, a double-commit restore, and a redirect special-case). The slice-per-knob design's real tax also shows up as a ~456-line per-action god-mapper in LoadInitialFileStore that every slice must reach into. On the analysis side there is a real determinism bug (framework path-scoping returns the first HashMap match) plus a dead keywordFilter abstraction with a competing source of truth. Layering is mostly respected apart from view-presentation leaking into lenses/explorerRow. Most remaining findings are contained DRY and cohesion smells.

**Recurring themes:**
- New domain concepts bolted onto existing map concepts (domainWords grafted into fileSettings without export support; 'building'/'selectedBuildingId' vocabulary in a buildingless view; row-presentation leaked into the lenses layer)
- The slice-per-knob store design's recurring tax: a central per-action god-mapper (LoadInitialFileStore) and downstream selectors/writers that must hand-exclude concerns the single home mixes together
- Cross-boundary duplication instead of reusing a single source of truth (selectTopWords re-implemented, WordFrequency+tfidf construction duplicated, DEFAULT_CAPABILITIES literal duplicated, competing keyword-filter lists)
- Correctness knowledge encoded in comments/conventions rather than the type system or code (checksum-vs-content selector choice, fragment-vs-query URL ownership, 'invalidates both views' action set)
- Determinism/reproducibility gaps and dead abstractions on the analysis parser side (HashMap-order framework scoping, unread keywordFilter, unused StopWordFilter overloads)
- Coordination via mutable state outside ngrx read imperatively inside effect streams (ViewReadinessStore)

### 🟠 HIGH — domainWords is first-class in the type but second-class in persistence, spawning a cascade of defensive workarounds
`visualization/app/codeCharta/stores/fileStore/loaders/ccJson/util/fileParser.ts:17`

domainWords was added as a REQUIRED member of CCFile.settings.fileSettings (domain.model.ts:25), parallel to edges/blacklist/markedPackages, but getExportCCFile (fileParser.ts:17-36, verified) copies edges, markedPackages, blacklist, attributeTypes and attributeDescriptors and NOT domainWords, so unlike its siblings the domain lens does not survive the CCFile->ExportCCFile round-trip. This single asymmetry is the architectural root cause of a cluster of downstream band-aids the branch had to add: the double-commit in the IndexedDB restore, the parallel visibleFileStatesWithCurrentSettingsSelector (visibleFileStates.selector.ts:74), and the special-case comment in RedirectAwayFromDomainViewEffect. A model member that is required in the type but silently dropped on export is a leaky abstraction: every consumer must know it 'comes back empty' after a round-trip.

**Fix:** Pick one side of the boundary: either add domainWords to the ExportCCFile shape and round-trip it like edges, or remove it from fileSettings entirely and derive it purely into domainLensSource. Do not leave it required-in-type/absent-in-export; that inconsistency is what forces the compensating selectors and effects.

### 🟠 HIGH — Two look-alike selectors with divergent memoization encode a correctness constraint in which one you import
`visualization/app/codeCharta/stores/fileStore/store/visibleFileStates.selector.ts:74`

visibleFileStatesWithCurrentSettingsSelector and visibleFileStatesSelector run the identical projection (filesSelector, getVisibleFileStates) but memoize differently: the original keys on file CHECKSUMS and keeps handing out a stale projection when a file's entries are replaced by richer objects under the same checksum (the restore case). A consumer that reaches for the checksum-memoized selector gets silently wrong per-file fileSettings with no type error and no runtime failure. Correctness now depends on every future caller knowing the distinction from a doc comment. This is a direct symptom of the domainWords/export asymmetry above (the restore-replaces-under-same-checksum scenario only exists because domain data is grafted back in after load).

**Fix:** Collapse to one selector with a correct change signal (memoize on identity/content that actually changes on restore, or invalidate the checksum-keyed memo on restore) rather than shipping two identical-projection selectors distinguished only by a comment.

### 🟡 MEDIUM — Slice-per-knob domainState turns LoadInitialFileStore into a per-action god-mapper that every slice must reach into
`visualization/app/codeCharta/load/loadInitialFile.store.ts:258`

Because each domain-view knob is its own ngrx slice with its own action, restoring persisted state forces LoadInitialFileStore to enumerate every one: mapDomainStateToAction is an 11-case switch (verified, 258-289), alongside a ~30-case mapMapStateToAction and one mapper per slice, in a single ~456-line class coupled to the write action of essentially every slice in the app. Adding a knob now means touching the reducer, the action, the facade AND this restore switch. This is the concrete maintenance cost of the slice-per-knob design: the restore path cannot be data-driven and must grow a hand-written case per knob, making this class a central coupling hub. On the reviewer's over-engineering question: slice-per-knob is defensibly consistent with the established mapState convention (per-slice independent persist/reset), but this god-mapper is its real, recurring tax and appears across both mapState and domainState.

**Fix:** Make the restore path data-driven (a key->action registry each slice contributes to, or a generic setByKey action) so adding a knob does not require editing a central switch. If slice-per-knob is kept for consistency, at least remove the hand-written per-knob restore branches.

### 🟡 MEDIUM — Framework path-scoping returns first HashMap match instead of a deterministic union, breaking reproducibility
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/PathScopedKeywordProvider.kt:39`

findApplicableFrameworks iterates frameworksByPath (a plain unordered HashMap built via mutableMapOf in FrameworkDetector.kt:19) and returns the frameworks of the FIRST enclosing directory, then stops (PathScopedKeywordProvider.kt:39-46). For a file nested under multiple detected framework directories (monorepo React-at-root + Angular-in-subpackage, or sibling .csproj dirs), which framework's keywords apply depends on HashMap iteration order, not path specificity. This both drops applicable keywords and makes the emitted word set nondeterministic across runs, violating CLAUDE.md 'Metric Accuracy: all metrics must be deterministic and reproducible.'

**Fix:** Union frameworks from all enclosing directories, or pick the most specific (longest matching path), iterating over a deterministically ordered map (sorted by path). Never let output depend on HashMap iteration order.

### 🟡 MEDIUM — New domain concepts bolted onto map concepts / view-presentation leaked into the lenses layer (recurs)
`visualization/app/codeCharta/lenses/explorerRow/store/explorerRow.projection.ts:13`

Two related layering leaks. (1) CLAUDE.md defines lenses as cc.json projections into domain read-models, but explorerRow.projection.ts projects a node into sidebar-explorer UI ROW presentation (isSelectable/isDimmed/isItalic, a hover title, and a preformatted decoration string at line 67) and sits in a store/ subfolder that, unlike every sibling lens store/, contains no store/selector at all. That is view-presentation for one feature living in lenses/; it belongs in the sidebarExplorer feature that already owns the EXPLORER_ROW port. (2) In lenses/domain/store/domain.selectors.ts:20 the parameter is named selectedBuildingId even though the domain view has no 3D map or buildings; the sole caller passes selectedNodePath and the JSDoc has to explain the mismatch away. Both are the map domain's vocabulary/UI grafted onto the new domain concept.

**Fix:** Move explorerRow's row-presentation projection into the sidebarExplorer feature; keep lenses/ for cc.json->domain projections only. Rename selectedBuildingId to selectedNodePath in the domain selector to match its model and callers.

### 🟡 MEDIUM — Language.keywordFilter is a dead abstraction with a competing source of truth for keyword filtering
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/Language.kt:12`

The Language enum declares a per-language keywordFilter for all 17 languages, but nothing reads it (occurrences are declaration/assignment sites only). The actual keyword filtering is wired independently in ConfigurationBuilder.addCoreLanguageKeywords, which hardcodes only three resource files (java/kotlin/typescript). This creates two competing sources of truth for 'which languages get keyword filtering' that can silently drift, plus a dead field shipped across all 17 constants, against CLAUDE.md DRY/no-dead-code.

**Fix:** Make the enum field the single source consumed by ConfigurationBuilder, or remove it until it is actually wired. Do not maintain two independent lists of keyword-filtered languages.

### 🟡 MEDIUM — Cross-boundary duplication of logic that already has a single source of truth (recurs)
`visualization/app/codeCharta/views/domainView/explorer/domainExplorerSelection.ts:72`

Ranking/construction rules are re-implemented instead of reused across layer boundaries, in three places. (1) DomainExplorerSelection.topWords() hand-rolls the rank-by-sizing-value sort that the renderer already exports as selectTopWords in wordCloudOption.builder.ts:122 (byte-for-byte identical body); the explorer's own doc says the tooltip should rank 'the same way the cloud sizes its words,' yet duplicates rather than imports (view->renderer is a permitted downward edge). (2) The tfidf-lookup WordFrequency construction is duplicated between SourceAnalyzer.kt:105 and DirectoryWordAggregator.kt:31. (3) The full-capabilities literal is written inline in metricsView.component.ts:58 and again as DEFAULT_CAPABILITIES in explorerPorts.mocks.ts. Each pair drifts independently if the comparator/shape changes.

**Fix:** Import selectTopWords in the explorer instead of re-sorting; consolidate WordFrequency+tfidf construction in one place; export one DEFAULT_CAPABILITIES constant reused by production wiring and mocks.

### ⚪ LOW — Low-cohesion grab-bag ports and split-concern homes force downstream consumers to hand-exclude the other concern (recurs)
`visualization/app/codeCharta/stores/domainState/store/domainState.reducer.ts:18`

Cohesion smells recurring across the new ports/homes. (1) The domainState home combines 9 word-cloud render controls (consumed by the renderer) with 2 explorer-sort fields (consumed only by the sidebar explorer); no consumer wants all of it, so wordCloudSettingsSelector manually omits the sort fields and DomainBarWriteStore omits the sort setters (routed through DomainExplorerSort). (2) The sort concern is fragmented across two DI tokens: available orderings live in EXPLORER_CAPABILITIES.sortOptions while the current option/order+writes live in EXPLORER_SORT (explorerSort.port.ts:8), and EXPLORER_CAPABILITIES itself mixes three chrome booleans (showRules/showSearch/showCounts) with the unrelated sortOptions array. Both are defensible trades but reduce cohesion.

**Fix:** Consider splitting domainState into a word-cloud-render home and an explorer-sort home so no consumer must exclude a concern; let the sort port own both its offered options and its current selection, and separate chrome flags from sort config in EXPLORER_CAPABILITIES.

### ⚪ LOW — Full source-home ceremony (facades, readWindow, combineReducers) for a single-field store, with inconsistent access paths
`visualization/app/codeCharta/stores/domainLensSource/store/domainLensSource.reducer.ts:8`

domainLensSource holds exactly one field (words) yet ships the complete state-home apparatus: combineReducers over a single child slice, a words/ subfolder, a DomainLensSourceReadWindow class, a top-level selector, and separate read/write facade barrels. Meanwhile the read/write facade split it mirrors is not even a uniform access path: DomainExplorerSort bypasses the DomainStateReadWindow and injects Store + raw selectors directly. On the reviewer's question: the read/write facade split and per-slice structure are consistency-preserving (they mirror the metrics/dependency source-homes), not a new anti-pattern, but domainLensSource gains little beyond uniformity for a one-field payload, and the ReadWindow indirection is undercut when some consumers skip it.

**Fix:** Keep the facade convention for consistency but either slim the single-field home or make the ReadWindow the uniform access path (route DomainExplorerSort through it) so the indirection actually buys encapsulation rather than optional ceremony.

### ⚪ LOW — ViewReadinessStore is a parallel mutable state store read imperatively inside effect streams
`visualization/app/codeCharta/features/codeMap/effects/renderCodeMapEffect/renderCodeMap.effect.ts:56`

View readiness lives in a mutable singleton outside ngrx and is coordinated across effects by imperative reads inside RxJS operators: renderCodeMap$ calls viewReadinessStore.isStale('metrics') inside a filter, while setLoadingIndicator effects call markAllStale()/markReady() in taps. Reading mutable external state inside a stream operator makes effect output order-dependent and invisible from the action/state stream, so two state-management mechanisms now interleave to decide whether a render happens. Justified as transient, but it moves coordination out of the reviewable store.

**Fix:** Back readiness with a transient ngrx slice or an observable-driven gate so effects stay pure and the coordination is visible in one place.

### ⚪ LOW — Cross-cutting 'these actions invalidate both views' knowledge duplicated with no single owner
`visualization/app/codeCharta/features/codeMap/effects/setLoadingIndicator/setLoadingIndicator.effect.ts:69`

markViewsStaleOnDataChange$ hardcodes the four blacklist actions that change what both views show, maintained separately from actionsRequiringRerender (which drives the map render) and from the domain lens's aggregation inputs. Nothing links these lists, so a future node-structure-affecting action must be added here by hand or the hidden view silently keeps a stale projection.

**Fix:** Extract a single shared constant for 'actions that change the node set both views derive from' and reference it from both the rerender and stale-marking paths.

### ⚪ LOW — Split URL ownership rests on a custom framework-fighting LocationStrategy held together by comments
`visualization/app/codeCharta/routing/queryPreservingHashLocation.strategy.ts:37`

Deep-link survival depends on an unenforced invariant: the router must only rewrite the fragment and QueryParamsService must only rewrite the query. It holds only because QueryPreservingHashLocationStrategy overrides prepareExternalUrl to return an ABSOLUTE URL (a workaround for withHashLocation destroying ?file=), where Angular's contract expects a prepared path used by Location comparisons and routerLink hrefs. Two subsystems co-own the address bar with no shared abstraction, and the coupling is spread across three files linked only by comments.

**Fix:** Introduce a single owner/abstraction for address-bar writes (fragment + query) so the ownership split is enforced in code rather than by convention, and confirm prepareExternalUrl's absolute return does not break Location comparisons or routerLink resolution.

### ⚪ LOW — StopWordFilter and other overloads expose public surface with no production callers
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/StopWordFilter.kt:25`

StopWordFilter exposes filter(words), filter(words, filePath) and isExcluded(word) but only the two-arg isExcluded(word, filePath) is called in production (FilterStage.kt:21); the other three are exercised only by tests, inflating the public surface and implying capabilities (bulk filtering, non-path-scoped exclusion) the system does not use.

**Fix:** Remove the unused overloads to tighten cohesion, or wire them if genuinely needed; do not keep test-only public API on a pipeline component.

### ⚪ LOW — Per-emission selector factory discards createSelector memoization on every sort change
`visualization/app/codeCharta/features/sidebarExplorer/selectors/explorerTreeNode.selector.ts:14`

explorerTreeNodeSelector became a factory createExplorerTreeNodeSelector(order, ascending) that builds a fresh createSelector each call; the component subscribes via switchMap(([o,a]) => readStore.rootNodeFor(o,a)), so every sort change instantiates a brand-new memoized selector and discards the previous memoization state, re-cloning (klona) the whole tree on each toggle. Memoization only holds while the sort is stable.

**Fix:** Pass order/ascending as selector props to one stable createSelector (or select the raw tree and sort in the component) so memoization survives sort toggles.


## Brutal Roast — Grade: C

This branch is a masterclass in building cathedrals to house a single boolean. The engineering is competent and the code mostly works — but the ceremony-to-value ratio is comedic. The single most embarrassing artifact is a pair of IndexedDB migrations (V18 seeds `domainBar`, V19 renames it to `domainState` ten lines later) shipped to fix a key that never escaped this same unmerged PR — the code comment literally confesses 'v18 above still writes the old key on purpose.' Close behind: the production CLI dialog wires a no-op named `testCallback()` into all 13 user-facing prompts, a `keywordFilter` field constructed 17 times and read zero times, and an 11-slice ngrx explosion (27 files, 231 lines) to persist eleven primitives — in a branch whose own docstring argues single values don't deserve a slice. Recurring sins: abstractions extracted then not used, strategy patterns whose implementations discard their own parameters, and tests that assert the HTML template back to itself. It clears F because nothing is broken and the genuinely hard bits (the ngram pipeline, the echarts word-fit hack) are honestly commented — but a conference audience would be laughing before the second slide.

**Recurring themes:**
- Ceremony-to-value inversion: multi-file ngrx slices, read-store wrapper classes, and 'port' tokens for single booleans and one-line selectors
- Self-inflicted churn on an unmerged branch: a migration to undo a rename made 15 lines up; two 13-field data classes copied verbatim
- Extract-then-ignore: route-match helpers, sort services, and leaf-name string logic built as reusable abstractions, then re-hand-rolled in a third place
- Coverage theater: tests that re-assert template literals, confirm no-op methods don't throw, or re-litigate a pure function through its 3-line wrapper
- Dead-on-arrival API surface: keywordFilter read nowhere, 3-of-4 StopWordFilter methods unused, domainWords$/getDomainWords with only test callers
- Abstractions that abstract nothing: strategy types whose impls discard a parameter, pipeline stages wrapping a single map/fold, a ViewId threaded through a computation that ignores it
- Comment-to-code ratios north of 3:1, where docstrings are honest apologies for the complexity they guard rather than justifications for it

### 🟠 HIGH — Two IndexedDB migrations (V18 seeds it, V19 renames it) to fix a key that never left this branch
`visualization/app/codeCharta/stores/rootStore/indexedDB/indexedDBWriter.ts:421`

V17/V18/V19 are ALL new on feature/domainlanguage-parser. V18 seeds a persisted root called `domainBar` (line 421: `return { ...record, domainBar: defaultDomainState }`); V19, six lines later, exists solely to rename `domainBar` to `domainState`. No released app ever wrote `domainBar` — it lived only between two unmerged commits of this same PR. So DB_VERSION got bumped 16→19, a rename transform was hand-written, plus three tests, to migrate a key that never escaped the branch. The comment confesses it in writing (line 425): 'v18 above still writes the old key on purpose.' Delete both by having V18 write `domainState` directly. Confirmed by reading the file: V18 and V19 sit ten lines apart, one creating the mess the other cleans up.

**Fix:** Squash the self-inflicted rename before merge: have V18 write `domainState` and delete migrateCcStateRecordToV19 plus its three tests. A branch-only key needs zero migrations.

### 🟠 HIGH — Every keystroke handler in the shipping CLI dialog is a no-op literally named testCallback()
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/Dialog.kt:126`

`internal fun testCallback(): suspend RunScope.() -> Unit = {}` (confirmed at line 126) is an empty lambda factory, and it is wired as `onInputReady` into all 13 real interactive prompts the user hits in production (lines 54-123, e.g. line 123 `onInputReady = testCallback()`). So either the name is a lie — it's production wiring, not test scaffolding — or test scaffolding leaked into main and now greets every user. A shipping dialog whose entire input pipeline is named after tests is the kind of screenshot that ends a conference talk early.

**Fix:** Rename to something honest like `noOp()` / `noInputHook()`, or drop the parameter entirely if the prompt API allows omitting it.

### 🟠 HIGH — Language.keywordFilter: 17 enum entries each construct a keyword provider nothing ever reads
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/Language.kt:12`

`enum class Language(val keywordFilter: LanguageKeywords, ...)` — all 17 entries dutifully build a `ResourceKeywords("keywords/xyz-keywords.txt")`, and a full-repo grep for `.keywordFilter` returns only the declaration plus its 17 assignments — zero read sites. The real language filtering happens in ConfigurationBuilder.addCoreLanguageKeywords(), which hardcodes java/kotlin/typescript keyword files by hand instead of using Language.JAVA.keywordFilter. So it's 17 lines of lazily-constructed providers whose only job is to make the enum look thorough. A field literally named 'keywordFilter' that filters nothing, next to the code that reinvents it manually.

**Fix:** Either wire addCoreLanguageKeywords to read Language.keywordFilter (making the field load-bearing), or delete the field and its 17 assignments.

### 🟡 MEDIUM — The single-boolean / one-selector ngrx ceremony pattern — recurs 3x, most egregiously as 11 folder-per-primitive slices
`visualization/app/codeCharta/stores/domainState/store/domainState.reducer.ts:16`

RECURRING THEME. (1) domainState is an ~11-field settings object exploded into eleven directories, each with its own actions.ts + reducer.ts, recombined by combineReducers — 27 non-spec files and 231 lines to persist eleven primitives. Every reducer is the same rubber stamp: `createReducer(defaultShape, on(setDomainStateShape, setState(defaultShape)))`. (2) ViewSwitcherReadStore (viewSwitcher.read.store.ts:8) is a whole providedIn:root class whose entire body wraps one selector in one signal the component could read inline via toSignal. (3) DomainLensSourceReadWindow (domainLensSource.readWindow.ts:14) ships `domainWords$` and `getDomainWords()` with zero production callers — a test-only API. The branch's OWN docstring in domainSelection.store.ts:15 argues a single value 'doesn't deserve an ngrx slice ... no time-travel need' — wisdom that evaporated eleven times in the folder next door. 'Mirrors mapState' is the defence, which just means the cargo cult built a temple.

**Fix:** Collapse the 11 slices into one domainState reducer keyed by field (or a plain signal service, per the branch's own domainSelection precedent). Inline ViewSwitcherReadStore's toSignal into its one consumer. Delete DomainLensSourceReadWindow's unused domainWords$/getDomainWords.

### 🟡 MEDIUM — Tests that assert the template back to itself, or re-test a pure function through its 3-line wrapper — recurs across both codebases
`visualization/app/codeCharta/features/sidebarExplorer/components/explorerSortControl/explorerSortControl.component.spec.ts:99`

RECURRING THEME. (1) 'should close the menu after acting on it' (line 99) has a `// Act` comment above zero acting — no click, no open — it just loops the buttons re-asserting `popovertarget`/`popovertargetaction="hide"` string literals hard-coded in the template right there. The sibling 'should open its menu' (line 28) checks `hasAttribute('popover')`, i.e. that markup exists. These replaced tests that used to actually click the trigger. (2) SilentProgressReporterTest (SilentProgressReporterTest.kt:7) spends three cases and a straight-faced '// Arrange & Act & Assert - no exceptions' comment confirming that four `= Unit` methods don't throw — not a single assert in the file. (3) metricsExplorerRow.spec.ts re-litigates projectExplorerRow's entire truth table (same fixtures, same '50% / 5' assertion) that explorerRow.projection.spec.ts already covers, through a wrapper whose only job is 'signals are wired'. (4) Eleven near-identical reducer specs re-test the shared setState factory. High test count, near-zero marginal coverage — ceremony masquerading as thoroughness.

**Fix:** Restore behavioral assertions to the popover tests (open → option list visible → click → hidden). Delete the zero-assert SilentProgressReporter suite. Reduce wrapper/reducer specs to one 'forwards to the shared thing' assertion each.

### 🟡 MEDIUM — Hand-forged interface into echarts-wordcloud's undocumented private model to count drawn words
`visualization/app/codeCharta/renderer/wordCloud/components/wordCloud/wordCloud.component.ts:224`

To answer 'how many words actually fit', the component double-casts the chart — `(this.chart as unknown as EchartsWithModel)?.getModel?.()?.getSeriesByIndex(0)?.getData()` (line 224) — and loops `data.getItemGraphicEl(index)` (line 230) counting non-null graphics, through a bespoke EchartsWithModel interface hand-declared at line 56 to model a private surface no public API exposes. `as unknown as` is the type system waving a white flag. One minor echarts bump and the 'N of M words fit' notice silently starts lying. The comment admits it's the 'only way' — the exact sentence that opens every load-bearing-hack post-mortem.

**Fix:** Isolate this behind a single adapter with a defensive fallback (return unknown/undefined rather than garbage when the internal shape changes), pin the echarts-wordcloud version, and add a test that fails loudly if getModel/getSeriesByIndex disappears.

### 🟡 MEDIUM — 18-line prose + six new infra classes to bolt a second tab onto the app
`visualization/app/app.config.ts:24`

Adding one word-cloud view spawned a routing empire: KeepAliveRouteReuseStrategy, QueryPreservingHashLocationStrategy, ActiveViewStore, ViewReadinessStore, routePaths (in TWO spellings), viewNavBarControls, RedirectAwayFromDomainViewEffect, ViewSwitcherReadStore — fronted by an 18-line block comment (lines 24-41) about Location.normalize regex-anchoring and document.baseURI stripping, guarding a two-line route table (lines 42-45). RedirectAwayFromDomainViewEffect adds a 20-line docblock over a 15-line effect. Comment-to-code routinely exceeds 3:1. Each note is individually true; collectively it's a monument to accidental complexity where a plain `withHashLocation()` and a boolean would carry a two-view toggle. Reviewers spend longer on the justification than the feature.

**Fix:** Trim the docblocks to one-line 'why' notes and consolidate the route/view-id/active-view machinery — most of it exists only because the two-view toggle was modeled as an extensible framework.

### 🟡 MEDIUM — The 13-config-knobs grand tour: two identical 13-field data classes and two verbatim copy loops
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/DomainLanguageParser.kt:148`

The data takes a grand tour: 12 @CommandLine.Option fields → hand-copied field-by-field into ParsedArguments (13 fields) by buildParsedArguments (line 148) → hand-copied field-by-field AGAIN into AnalysisConfiguration (13 fields) by ConfigurationBuilder.build. ParsedArguments carries no behavior and no transformation — it's a second AnalysisConfiguration wearing a fake moustache, existing so `limit` can travel from a CLI flag to a config object it could have reached directly. Two bag-of-primitives classes, two copy loops, one purpose that a single object would serve.

**Fix:** Collapse ParsedArguments into AnalysisConfiguration (or map CLI fields straight into it). One transport object for one straight-line hand-off.

### 🟡 MEDIUM — A forked, byte-identical selector added to paper over a double-commit during IndexedDB restore
`visualization/app/codeCharta/stores/fileStore/store/visibleFileStates.selector.ts:74`

visibleFileStatesWithCurrentSettingsSelector (line 74) is byte-for-byte `createSelector(filesSelector, getVisibleFileStates)` — identical to visibleFileStatesSelector at line 57, differing only in memoization. Its 12-line comment (lines 67-73) admits the real bug: restore 'first commits the files re-parsed from the persisted state ... and only then dispatches the persisted file states ... under the very same checksums,' so the checksum-memoized selector serves a stale, domain-less projection. Rather than fix the double-commit or the checksum key, the fix forks a parallel selector and reroutes settings-reading consumers to it. Now every future reader must know which of two identical-looking selectors is the 'honest' one — a trap with a comment taped to it instead of a repair.

**Fix:** Fix the restore ordering or the checksum key so one selector stays correct, then delete the fork. Don't ship two identical selectors distinguished only by a comment.

### ⚪ LOW — isLoading$(view) threads a ViewId that 3 of its 4 inputs ignore, apologized for by a 14-line comment
`visualization/app/codeCharta/features/shared/services/loadingFileProgressSpinner.service.ts:9`

The signature became `isLoading$(view: ViewId)` to sell a per-view spinner, but the body `combineLatest([isStale$(view), isLoadingFile$, isPendingHeavyDispatch$, isApplyingScenario$]).pipe(map(sources => sources.some(Boolean)))` uses `view` in exactly one of four terms; the other three are global. A 14-line comment over the one-line body is essentially an apology: 'Three of the four sources look global but are not a problem, because only the ACTIVE view's spinner is in the DOM' — i.e. the per-view-ness actually lives in DOM attachment, not this signal. Threading a parameter a computation ignores 75% of the time, then writing an essay about it, is ceremony cosplaying as abstraction.

**Fix:** Either make all four sources genuinely view-scoped or drop the `view` param and document the DOM-attachment design in one line.

### ⚪ LOW — Extracted route-match helpers that the branch then declines to use — 3rd hand-rolled copy of query-stripping
`visualization/app/codeCharta/features/navBar/effects/redirectAwayFromDomainView/redirectAwayFromDomainView.effect.ts:60`

RECURRING (do-not-reuse) THEME. The branch built ActiveViewStore.currentView() and routePaths.viewIdForLink() specifically to answer 'which view is the URL on', then RedirectAwayFromDomainViewEffect ignores both and re-implements it by hand: `this.router.url.split("?")[0] === routeLinks.domain` (line 60) — the third copy of the same query-strip. Same pattern in the explorer subsystem: MetricsExplorerSort's own docstring calls itself 'byte-identical' to the deleted ExplorerSortService, and the leaf-name incantation `path.split('/').filter(Boolean).at(-1) ?? fallback` is written out twice (wordCloud.read.store.ts:32 and domainView.component.ts:71). CLAUDE.md says '3+ occurrences → extract'; this branch shipped the extraction AND then didn't use it.

**Fix:** Route this effect through viewIdForLink/currentView, and centralize the leaf-name helper. Use the abstractions you paid to build.

### ⚪ LOW — Strategy-pattern costumes: two-arg 'combine' with an impl that discards an arg; six-class pipeline where two stages wrap one map/fold
`visualization/app/codeCharta/load/effects/reconcileAfterLoad/utils/domainWords.merger.ts:70`

RECURRING THEME: abstractions that abstract nothing. (1) domainWords.merger introduces `type CombineWords = (mergedWord, word) => DomainWord` with two impls, one of which — keepLaterWord (line 70) — ignores its first parameter (`_mergedWord`) and returns a copy of the second, i.e. 'combining' by discarding an input; a plain `if (withUpdatedPath)` overwrite-vs-aggregate split says the same thing without the costume. (2) The domainlanguage pipeline is six stage classes plus three transport DTOs for a straight-line function; AggregateStage.kt:10 earns a class, file, KDoc and a slot in SourceCodePipeline for an 8-line body that is one `forEach { wordCounts.merge(...) }`, and WeightStage wraps a single `when`. Grudgingly, they're small and testable — but they read no better than the inlined lambda.

**Fix:** Replace CombineWords with a boolean branch. Consider inlining the trivial pipeline stages (Aggregate/Weight) while keeping the genuinely complex ones (Ngrams/SSR).

### ⚪ LOW — Redundant twin validations and dead API surface — small crimes, several counts
`analysis/analysers/parsers/DomainLanguageParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/domainlanguage/processing/StopWordFilter.kt:25`

Assorted dead weight in the analysis parser. (1) StopWordFilter ships four public methods; only isExcluded(word, filePath) is called (FilterStage.kt:21) — filter(words) at line 25, filter(words, filePath) at line 27, and isExcluded(word) at line 32 have zero callers, speculative 'someone might someday' API. (2) Weight positivity is validated twice with drifting messages: DomainLanguageParser.kt:133 `require(identifierWeight > 0) { "--identifier-weight must be positive..." }` and ExtractionWeights.kt:5 `require(identifierWeight > 0) { "Identifier weight must be positive..." }` — the second can never be reached without the first throwing, and two messages will drift the moment one is edited. Two sources of truth for one invariant.

**Fix:** Delete StopWordFilter's three unused methods. Keep weight validation in ExtractionWeights (the constructor that owns the invariant) and drop the duplicate parser-level check.

### ⚪ LOW — Five DI-token 'ports' for one pattern that can't agree on their own filename suffix
`visualization/app/codeCharta/features/sidebarExplorer/explorerSort.port.ts:1`

The explorer refactor mints five injection-token strategy files that are the same kind of thing (interface + InjectionToken): explorerCapabilities, explorerContextMenu, explorerRow, explorerSelection, explorerSort. Exactly one earned the `.port.ts` suffix (explorerSort.port.ts); the others are explorerRow.ts, explorerSelection.ts, explorerContextMenu.ts, explorerCapabilities.ts. So `explorerRow.ts` is a port but `explorerRow` is also a lens folder elsewhere, while `explorerSort.port.ts` announces itself. Relatedly, sorting is now split across three artifacts — EXPLORER_CAPABILITIES.sortOptions owns which options appear, EXPLORER_SORT owns the current value, so one menu reads its option list and its selected value from two different tokens (a split brain for one control). When five files from one PR can't agree on a suffix, the abstraction was assembled faster than it was named.

**Fix:** Pick one suffix convention for all five ports, and consider merging the sort option-list token with the sort-value token so one control has one home.

## Comment Hygiene (why-not-what) — Grade: B+

Comment discipline on this branch is strong overall. The reviewers surfaced ~54 notable comments across the four subsystems, of which 33 are exemplary WHY-comments — they document non-obvious rationale a reader could not recover from the code (TF-IDF single-document undefinedness, reproducible-checksum key ordering, echarts async-layout accumulation, the debounceTime(0) race in domain.selectors, the effect-vs-route-guard trade-off, the ABSOLUTE hash-location regression, keep-alive 0-height ResizeObserver clobbering). That is a genuine why-not-what culture. The 21 violations are almost all low-severity narration: data-class section dividers, comments that restate the self-naming method call on the next line, and KDoc that echoes the property/const name. Two are slightly worse than pure noise — indexedDBWriter's "(v3→…→v18)" range is already stale (DB_VERSION is 19) and will keep drifting, and the two effects-array doc blocks are boilerplate duplicated per feature. None are commented-out code. Grade held just below A- because the noise, while minor, clusters predictably in the new analysis parser (section-divider habit) and would be trivial to eliminate.

~54 comments reviewed · **21 violations** (all low-severity narration). Worst offenders: analysis/.../domainlanguage/cli/AnalysisConfiguration.kt (3 pure section-divider noise comments, no redeeming rationale), analysis/.../domainlanguage/processing/FrameworkDetector.kt (2 what-comments restating self-naming detect* calls — though it also holds 2 exemplary why-comments), analysis/.../domainlanguage/processing/pipeline/stages/NgramsStage.kt (2 what-comments narrating the next line), analysis/.../domainlanguage/output/WordFrequency.kt (2 redundant KDoc @property lines echoing field names).

| Verdict | Location | Comment |
|---|---|---|
| noise | `AnalysisConfiguration.kt:9` | // File scanning settings |
| noise | `AnalysisConfiguration.kt:13` | // Pipeline settings |
| noise | `AnalysisConfiguration.kt:20` | // Output settings |
| what | `indexedDBWriter.ts:506` | // Migrate persisted blobs forward through all applicable transforms (v3→…→v18). |
| what | `FrameworkDetector.kt:21` | // Detect JavaScript/TypeScript frameworks from package.json |
| what | `FrameworkDetector.kt:26` | // Detect C# frameworks from .csproj files |
| what | `NgramsStage.kt:29` | // Add all individual words |
| what | `NgramsStage.kt:32` | // Generate n-grams only for identifiers |
| what | `SourceAnalyzer.kt:110` | // Aggregates the per-file words up to every ancestor directory and the root ".". |
| redundant-doc | `navBar.effects.ts:3` | /** The navBar feature's ngrx effects, registered by the app composition root. */ |
| redundant-doc | `domainView.effects.ts:3` | /** The domain view's ngrx effects, registered by the app composition root. */ |
| how | `queryPreservingHashLocation.strategy.ts:36` | /** Resolves the fragment the base strategy would have produced against the CURRENT href.  |
| redundant-doc | `hoverTooltip.service.ts:8` | /** A title line plus any number of muted label/value rows. */ |
| redundant-doc | `WordFrequency.kt:6` | @property text The word text |
| redundant-doc | `WordFrequency.kt:7` | @property frequency The number of occurrences |
| what | `sidebarExplorer.component.ts:56` | // Collapsed → a fixed strip width; expanded → the width the user dragged. |
| what | `explorerTreeLevel.component.ts:46` | // Opens this level when a node below it gets revealed; the target level itself scrolls in |
| what | `DirectoryWordAggregator.kt:29` | // Convert to List<WordFrequency> with TF-IDF scores (caller handles sorting) |
| what | `AggregateStage.kt:8` | * This stage sums up all weights for each unique text to produce the final word frequency  |
| how | `SourceCodePipeline.kt:17` | * This pipeline implements a sequential architecture: 1. Extract ... 2. Weight ... 3. Spli |
| what | `TestFileDetector.kt:38` | // Java: UserTest.java |
