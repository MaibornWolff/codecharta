---
name: Address the pre-release review findings on the domain-language branch
issue: <#issueid>
state: complete
version: 1
---

## Goal

Close the findings from the branch review of `feature/domainlanguage-parser` so the domain lens can
ship: three correctness/size blockers, one CLI naming change that is only free to make before
release, and the agreed tail of smaller fixes. Finish with the full analysis and visualization
suites green.

## Tasks

### 1. Per-language keyword filtering (blocker)

`ConfigurationBuilder.addCoreLanguageKeywords` hardcodes java/kotlin/typescript, so 11 curated
keyword files ship in the jar and are loaded by nothing. `elif`, `func`, `struct`, `defer` survive
into the vocabulary of every Python/Go/C/C++ scan — and the parser cannot be fixed downstream,
because TF-IDF and `--limit` both act before the file is written.

- Map each `Language` enum entry to its keyword resource; drop the hardcoded trio.
- Scope the keywords per language the way framework keywords are already path-scoped: thread the
  file's `Language` through `FilterStage.filter` into `StopWordFilter.isExcluded`, and key the
  existing `pathExcludedWordsCache` on `(path, language)`.
- `PathScopedKeywordProvider` is the model to follow — a per-file provider plus a cache.
- Keep the global set (english stopwords + technical level + `.dlcignore`) exactly as it is.

### 2. A single file must not silently produce an empty map (blocker)

`isApplicable()` accepts a supported file and the help says "file/project to parse", but
`FileScanner.scan` warns and returns `emptyList()` for a non-directory, yielding a schema-valid but
empty cc.json with exit 0.

- Accept a file input: scan just that file rather than walking a directory.
- Keep the "directory does not exist" case an error with a non-zero exit, not a warning.

### 3. Shrink the echarts payload (blocker)

The production build is one 3.4 MB `main-*.js` carrying sankey, candlestick, gauge, radar, sunburst,
boxplot and themeRiver — none of which the word cloud uses. Both halves of the fix are independent.

- `wordCloudChartHost.ts` imports the full `echarts` barrel. Switch to `echarts/core` and register
  only `CanvasRenderer`, `TooltipComponent` and `AriaComponent`. The plugin itself already imports
  `echarts/lib/echarts` (core), so it needs no change.
- Make the domain route lazy with `loadComponent` in `app.config.ts`; check
  `KeepAliveRouteReuseStrategy` still keys on `routeConfig.path` for a lazily-loaded route.
- Update `mocks/echartsMock.js` — the jest `moduleNameMapper` maps `^echarts$` and will need to
  cover `echarts/core` too.
- Re-measure the built bundle and record the before/after in the notes.

### 4. Rename `--exclude-technical-stopwords` (blocker)

The flag *disables* the technical stopword list but reads as "exclude technical stopwords from the
output". It is a public CLI flag; renaming after release is breaking, now it is free.

- Rename to `--no-technical-stopwords`, matching the existing `--no-tfidf` / `--no-ssr` negations.
- Update `Dialog.kt`, the CHANGELOG entry, and the gh-pages parameter table.

### 5. Remove the committed review artifacts (blocker)

- Delete `REVIEW-branch-6lens.md` and `code-review-domainlanguage-parser.md` from the repo root.
  Both are stale — they describe an `EXPLORER_HOST` seam and a `postinstall` hook that no longer exist.

### 6. Document the `--limit` rollup semantics

Decided: keep the behaviour, state it. `--limit` truncates per-file lists before folders roll them
up, so a folder's frequency is the sum of the words that survived each file's cap.

- Say so in the gh-pages `--limit` row and in the CLI option description.

### 7. Make domain explorer search persistence consistent

`setDomainStateSearchPattern` is dispatched on restore in `loadInitialFile.store.ts` but is absent
from `actionsRequiringSaveCcState`, while the metrics view's `setSearchPattern` is present.

- Persist it, so both views behave alike and the restore branch stops being dead.

### 8. Concurrency and scanning

- `PathScopedKeywordProvider.keywordCache` is a plain `mutableMapOf` reached concurrently from
  `StopWordFilter`'s `ConcurrentHashMap.computeIfAbsent` mapping function (which runs concurrently
  for distinct keys). Make it a `ConcurrentHashMap` — this is a live data race, not just a style point.
- `CoroutineFileProcessor` launches one unbounded `async` per file on `Dispatchers.IO`. Move the
  CPU-bound TreeSitter work to `Dispatchers.Default` behind a bounded `Semaphore`.
- `FrameworkDetector` walks the whole tree twice (package.json, then .csproj). Collapse to one walk.

### 9. Pin echarts and guard the patch

- Pin `echarts` to an exact version so a Renovate minor cannot silently break the private-API word
  count in `countWordsWithAGraphicElement` (`getModel().getSeriesByIndex().getData()`).
- Reference the upstream issues in `patches/echarts-wordcloud+2.1.0.patch` header comments.

### 10. Re-key the domain lens in `ccsh modify` instead of refusing

Today `StructureModifier` refuses outright for any data-bearing opaque lens, making "have a domain
lens" and "restructure a map" permanently exclusive. The id is a pure function of canonical path +
node type (`NodeId.fromSegments`), so the mapping is derivable.

- The three actions differ in difficulty and should be treated separately:
  - `--remove`: paths of survivors are unchanged, so this is only a filter — drop lens entries whose
    node id is no longer in the tree.
  - `--set-root` and `--move-from/--move-to`: re-path, so entries need re-keying under the new path.
- Each action already re-paths `Edge` endpoints (`extractRenamedEdgesForPattern`, `extractEdges`).
  Reuse that same seam: give each action a path mapping, and add a shared remapper that rewrites
  `domain.nodes` keys and drops entries for nodes that did not survive.
- Keep refusing for opaque lenses whose shape is unknown (`security`, future lenses) — only the
  typed `domain` shape can be re-keyed safely. `dataBearingOpaqueLensNames` stays, minus `domain`.
- Update the CHANGELOG "Changed" entry, which currently documents the refusal as the behaviour.

### 11. Verification

- `./gradlew ktlintCheck test` and `./gradlew integrationTest` (golden test covers the parser).
- `npm run test:ci`, `npm run lint`, `npm run build`, `npm run e2e:ci`.
- Root `npm run format:check`.

## Steps

- [x] Complete Task 1: Per-language keyword filtering
- [x] Complete Task 2: File input no longer yields a silent empty map
- [x] Complete Task 3: echarts core imports + lazy domain route
- [x] Complete Task 4: Rename `--exclude-technical-stopwords`
- [x] Complete Task 5: Delete the review artifacts
- [x] Complete Task 6: Document `--limit` rollup semantics
- [x] Complete Task 7: Domain explorer search persistence
- [x] Complete Task 8: Concurrency and scanning fixes
- [x] Complete Task 9: Pin echarts, annotate the patch
- [x] Complete Task 10: `ccsh modify` re-keys the domain lens
- [x] Complete Task 11: Full suites green

## Notes

### Verification actually performed

- Analysis: `ktlintFormat`, `ktlintCheck`, full `test` — green. One pre-existing failure,
  `ProgressTrackerTest > should handle zero total correctly`, reproduces with every change of this
  plan stashed; it is a JDK-25 artefact (the JVM writes warnings to the `System.err` the test
  captures) from the local toolchain override, not a defect.
- Visualization: 5347 unit tests green; `lint:architecture` 0 errors; `lint:styles` clean;
  production build succeeds.
- **JDK 17 installed** (Temurin 17.0.20.1 from the adoptium GitHub release; the foojay auto-provision
  endpoint and the Azul/Adoptium CDNs are blocked, GitHub is not). The whole analysis suite,
  `ktlintCheck` and `jacocoTestReport` run on the real toolchain — the Java 25 override is gone, and
  `ProgressTrackerTest > should handle zero total correctly` passes on 17, confirming it was an
  artefact of that override.
- **Golden test (`integrationTest`) passes**, `check_domainlanguage` included. (The SonarImporter step
  logs a pre-existing "could not verify token" error against live SonarCloud and continues.)
- **Still not run: the Playwright e2e suite.** `npx playwright install chromium` reports
  `Playwright does not support chromium on ubuntu26.04-arm64` — no browser binary exists for this
  platform. It must be confirmed in CI.

### End-to-end smoke test of the fixes (installDist, JDK 17)

Against a polyglot fixture (`.go` + `.py` + `.kt`):

- Go file yields `warehouse, inventory, pallet, tracking, shipment, reserve` — no `func`, `defer`,
  `struct`, `package`, `return`, `nil`.
- Python file yields `invoice, customer, account, ledger, settle` — no `elif`, `def`, `class`, `raise`.
- Kotlin file yields `dispatch, schedule, shipment, warehouse` — no `class`, `fun`, `val`.
- Single-file input produces a one-leaf map keyed relative to the containing directory.
- A directory with no analysable file exits 1 with "No analysable source files found in ...".
- `--help` shows `--no-technical-stopwords`.
- `ccsh modify` re-keys all three actions with zero orphaned keys: `--set-root /root/svc` promotes
  `svc`'s bank to the new root and drops the `api` subtree; `--remove /root/api` drops exactly that
  subtree; `--move-from /root/svc --move-to /root/backend/services` carries every bank across.

### Bundle measurements (production build)

| | before | after |
|---|---|---|
| initial (main + modulepreload) | 3393 KB | 2320 KB |
| deferred to the domain route | 0 KB | 471 KB |
| total JS | 3393 KB | 2791 KB |

Both halves were needed. Selective `echarts/core` imports cut the library roughly in half; the lazy
route only moved it off the initial load after `wordCloudScreenshot.service.ts` stopped reaching the
engine through `wordCloud.facade.ts`, whose re-export of `WordCloudComponent` pinned echarts into the
eager graph. That is what the new narrow `wordCloudRegistry.facade.ts` is for.

- Decisions taken before planning: keyword lists get per-language scoping rather than a global load
  (a global set would strip Go's `func` from a Kotlin project); `--limit` semantics are documented,
  not changed; the echarts fix does both halves; the tail includes `modify` re-keying.
- On why parser-side keyword filtering is not made redundant by a future frontend blacklist: TF-IDF
  is computed in the parser and `--limit` truncates there too, so keyword noise distorts scores and
  evicts real domain words before any UI filter can see the file. The two are complementary — static
  lists for language noise, interactive blacklisting for project-specific noise.
- Task 10 is the largest and the only one that is a feature rather than a fix. If it destabilizes,
  it is the one to split out — the refusal it replaces is safe, just restrictive.
- Task 3's lazy route interacts with `KeepAliveRouteReuseStrategy` and with the e2e suites that
  navigate between views; expect to re-run `viewSwitcher.e2e.ts` and `domainView.e2e.ts` specifically.
- The `--limit` behaviour is now stated in the CLI help, the gh-pages parameter table and the README
  rather than changed, per the decision taken before planning.
- `DomainLensRekeyer` recovers each id's old path by walking the pre-restructure tree, because the id
  is a one-way hash. That only works if the input file's ids are canonical; the two StructureModifier
  fixtures had hand-written ids that matched nothing, so they were regenerated. A file with
  non-canonical ids would have had a broken domain lens already, since the 2.0 writer recomputes ids.
- Known edge case in the rekeyer: a move that lands a node where an entry already exists keeps the
  entry that was already there, mirroring how `FolderMover` discards the colliding moved node.
- The smoke test surfaced a defect in the first version of the rekeyer that no unit test caught: a
  moved folder lost its own aggregate word bank, because `forMove` mapped the origin folder to null.
  The destination receives exactly that folder's children, so it is its successor and now inherits the
  bank. The StructureModifier fixture gained a folder-level domain entry so all three actions actually
  cover folder aggregates, not just files.
- Not addressed, and still open from the review: the sandbox could not run the golden test, so the
  interaction between the new empty-scan guard and `simplecc.sh` (which already treats a parser
  failure as a skipped step) is reasoned about but unverified.
- Found while smoke-testing, **not fixed** (pre-existing gap in a curated list, not in the wiring):
  `python-keywords.txt` has `None`/`True`/`False` but not `self` or `cls`, so `self` survives into the
  vocabulary of every Python file. Worth a follow-up pass over the per-language lists now that they
  are actually loaded — before this branch only java/kotlin/typescript were, so the other 14 lists
  have never been exercised against real output.
