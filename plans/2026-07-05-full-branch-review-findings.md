# Full Branch Review — `feature/cc-json-2-analysis`

**Date:** 2026-07-05
**Scope:** entire branch vs `main` (merge-base `76da068`, 224 commits, 1157 files, +40k/−25k) — the cc.json 2.0 format flip (analysis/Kotlin, +26k/−21k) and the Slice 1–16 visualization architecture migration (+7.9k/−4.3k plus pure moves).
**Method:** 18-dimension multi-agent workflow review (151 agents): 14 dimension finders + 3 critic-driven gap rounds (cross-side execution, MIMO/`--large` runtime, perf/scale), every non-info finding adversarially verified by independent existence- and attribution-lens agents. Several headline findings were **reproduced by executing the built `ccsh`**, not just code reading.
**Raw result:** 112 findings — **95 CONFIRMED, 2 PLAUSIBLE, 14 info, 1 refuted**. Deduplicated below (several issues were found independently by 2–4 reviewers — treated as one finding each, high confidence).

---

## Verified-green baseline

- `npm run lint:architecture`: **0 violations** (1169 modules, 4605 dependencies; all 33 rules at error).
- Viz Jest: **383/383 suites, 2318 passed, 45/45 snapshots** (fresh run, 29.5s).
- Analysis `./gradlew test`: BUILD SUCCESSFUL (up-to-date against a prior successful run).
- Symbol-level dependency graph (`analysis.cg.json`): **zero cross-file cycles** inside `app/codeCharta`; module matrix matches the intended layering (features → homes/lenses/renderModel; homes near-leaf; util leaf).
- Store-facade dedup progress: 94 → **78** feature `*.store.ts` facades, zero fully-unreferenced stores left.

---

## CRITICAL (3)

### C1. `ccsh merge` silently drops legacy 1.x inputs — partial output, exit 0 (or crash)
`MergeFilter.kt:207-221` — found independently by 4 reviewers, **reproduced at runtime** in plain, MIMO, and `--large` modes.

`readInputFiles()`/`readInputFilesKeepFileNames()` catch *every* deserialization exception with the generic warn "`X is not a valid project file and will be skipped`". Since the branch gates all 1.x reading behind `ccsh convert` (873c6020), **every pre-existing cc.json in the wild now hits this skip path**, and the `Run 'ccsh convert'` hint inside the exception is swallowed. Empirically:

- Plain: `ccsh merge legacy.cc.json new.cc.json -o out` → out **is** new.cc.json, exit 0. Merging an old scan with a new one is *the* headline migration scenario.
- All-legacy: crash with `UnsupportedOperationException: Empty collection`.
- MIMO: a group with 1 valid + 1 legacy emits **no output file for the group**; 2 valid + 1 legacy emits a partial merge presented as complete. All exit 0.
- `--large` all-legacy: aborts with `IllegalArgumentException: kotlin.Unit` — the `require(...) { Logger.warn { … } }` calls pass `Unit` as the lazy message (`MergeFilter.kt:190`).

**Fix:** distinguish the legacy rejection from "unparseable" in the catch, surface `e.message` (it carries the convert hint), and fail non-zero (write nothing) when any named input could not be read / fewer than 2 projects survive.

### C2. Edges-only projects (CodeMaat) lose ALL edges after one 2.0 round-trip
`ProjectToCcJsonV2Mapper.kt:39` + `CcJsonV2ToProjectMapper.kt:29-37` — found by 2 reviewers, **reproduced end-to-end** (`ccsh codemaatimport … | ccsh edgefilter …` → 0 edges).

The 2.0 writer hashes edge endpoints to `NodeId`s without checking a matching file node exists; the reader drops any edge whose id doesn't resolve against the file tree (warn only, two opaque hashes). `CSVProjectBuilder` builds edge-only projects (bare root, `insertEdge` only) — legitimate in 1.5, where `EdgeFilter.insertEmptyNodesFromEdges` materialized endpoint nodes from path strings. In 2.0 the documented README workflow yields an **empty result with every test green** (tests only inspect the importer's own output file, where the dangling edges still sit). The viz loader drops them the same way.

Aggravator: the EdgeFilter regression fixture that existed precisely to cover this (`coupling-empty-nodes.json`) was rewritten during the flip to *include* all endpoint nodes, so the test that would have caught it now passes vacuously (its name is now false).

**Fix:** materialize endpoint file nodes at the writer (the DependaChartaImporter already does this correctly — use it as the template), or fail loudly at write time; restore the empty-tree fixture.

### C3. Viz: cc.json 2.0 files do not survive a page reload — map replaced by sample files
`fileParser.ts:16-19` / `loadInitialFile.service.ts:53,124` — found by 3 reviewers, **confirmed by execution**.

On rehydrate, persisted CCFiles are re-serialized via `getExportCCFile`, which always emits the **legacy 1.x flat shape** but copies `fileMeta.apiVersion` verbatim — `"2.0"` for a 2.0-loaded file. On next start the content has no `meta`, so `isCcJson2` = false, the 1.x branch compares major 2 against `package.json codecharta.apiVersion "1.5"` → `ERROR_MAJOR_API_VERSION_OUTDATED` → `NO_FILES_LOADED` → **sample files replace the user's map**. Since ccsh now emits *only* 2.0, this hits every fresh analysis a user loads.

**Fix:** persist/re-emit the 2.0 envelope for 2.0-origin files (or clamp the re-exported apiVersion to the 1.x shape actually written), plus a round-trip spec: load 2.0 → `getNameDataPair` → re-validate. No spec on either side exercises this path today — which is exactly why 383 green suites didn't catch it.

---

## MAJOR (by theme)

### Analysis — wire format & identity
1. **Viz download of a 2.0-loaded map is unreadable by BOTH sides** — `fileDownloader.ts:43`. Same mechanism as C3: legacy-flat file stamped `apiVersion "2.0"`. The viz refuses it (major 2 > 1.5) and every ccsh command except `convert` rejects it (detects major "1", or the "2.0" stamp confuses detection). The primary export button emits an artifact no tool in the suite consumes. *(Execution-confirmed on the analysis side.)*
2. **NodeId omits node type** — `NodeId.kt:48`. 1.x legally allows a File and a Folder with the same name under one parent (viz validator keys on `path|type`). Both hash to the same id: converts/merges either crash (both carry attributes) or silently write duplicate-id files the viz rejects. Same-family issue in the viz's 1.x normalizer (below).
3. **Ids are canonicalized but the tree is not** — `ProjectToCcJsonV2Mapper.kt:64`. Producers never canonicalize tree shape (`PathFactory` keeps `.`/`..` as literal folder nodes; only DependaCharta calls NodeId pre-build), so distinct tree positions can share one id; the duplicate-id guard fires only when the collider carries attributes. `csvimport` with `.`-segments triggers it today; `ccsh check` passes files the viz rejects.
4. **NFC/NFD collision crashes serialization after merge** — `ProjectToCcJsonV2Mapper.kt:64` (latent). `MergeResolverStrategy.namesMatch` is code-point equality, so NFD (macOS walkers) + NFC (git parsers) sources keep `Café.ts` twice; NodeId NFC-normalizes both to one id → write-time `require` crash after a successful in-memory merge.
5. **2.0 read canonicalizes edge endpoints but not tree names** — `CcJsonV2ToProjectMapper.kt:78` (latent). After a round-trip of NFD-named trees, endpoint strings no longer equal `/root/` + node path; EdgeFilter's exact-string matching silently stops aggregating and inserts ghost NFC-named duplicate nodes.

### Analysis — merge correctness
6. **Content-hash overlay matching can mis-merge / silently discard leaves** — `MergeResolverStrategy.kt:93`. Uniqueness is checked only on the reference side: byte-identical but distinct files (configs, license boilerplate) merge onto unrelated positions, and two incoming leaves resolving to the same reference path silently overwrite each other.
7. **Merged output mis-routes edge attributeDescriptors into the metrics lens** — `ProjectMerger.kt:17`. Typed merged lenses are flattened into the legacy `ProjectBuilder` constructor; `LensSet.fromLegacy` re-splits by `attributeTypes["edges"]` membership, so 2.0 inputs with descriptors but no attributeTypes (both optional on the wire) come out relocated. Fix is one line: use the already-computed `ProjectBuilder.fromLenses`.
8. **`--large` merge corrupts id-keyed lens payloads** — `LargeMerge.kt:20` (latent, **runtime-confirmed**). Re-pathing changes every NodeId, but `clusters` and opaque lenses are carried verbatim → all their ids dangle; additionally ProjectMerger unions opaque lenses keep-first, so the second project's opaque lens is dropped entirely.
9. **`LensSet.fromLegacy` loses shared node/edge descriptors** — `LensSet.kt:56`. `ccsh edgefilter` output registers the same metrics in both `attributeTypes.nodes` and `.edges`; conversion routes the descriptor only to the dependency lens, so node metrics lose their metadata (visible in viz sidebar/legend).

### Analysis — legacy/convert UX
10. **Piped legacy input: exit 0, no output, no hint, whole file dumped to stderr** — `ProjectDeserializer.kt:44`. The InputStream overload catches everything; every parser/importer that merges piped projects silently continues without the pipe. The convert pointer never reaches any stdin path.
11. **`modify`/`inspect` on a legacy file exit 0 while writing no output** — `StructureModifier.kt:96`, `InspectionTool.kt:49`; `set -e` scripts and CI sail past. ConvertTool's own catch swallows `e.message` ("skipped" for a single input).
12. **`ccsh convert` silently drops blacklist + markedPackages** — `ConvertTool.kt:47` (**execution-confirmed**). Deliberate wire decision, but the mandated migration path says nothing while discarding user curation — and it's inconsistent with the viz, whose 1.x normalize path *preserves* blacklist/markedPackages.

### Visualization
13. **1.x normalizer synthesizes bare-path ids → File/Folder same-name siblings collapse** — `normalizeToCcJson2.ts:48` (2 reviewers). Legal 1.x input: second node's attributes clobber the first's in `attributesByNodeId`; both nodes then read the same bag (folder inherits leaf metrics or vice versa). Fix: key by `${path}|${type}`.
14. **Blacklist-guard rejection soft-locks the app behind the loading spinner** — `addBlacklistItemsIfNotResultsInEmptyMap.effect.ts:18` (latent; mechanism predates branch but the seam was re-homed in Slice 15d untested). `dispatchAfterPaint` sets `isPendingHeavyDispatch$` and only a successful render clears it; a guard-rejected exclude (root/last building, or an exclude-all search pattern) never renders → permanent full-screen spinner.
15. **Rehydrate coverage regressed** — `loadInitialFile.service.spec.ts:343`. Main had 3 "set all differing" rehydrate tests; the branch keeps 2 (sharedView, preferences). `applyMapState` (29 keys) and both lens-source appliers have **zero** specs — exactly the surfaces the v3–v15 IndexedDB migrations feed.

### Architecture rules / CI / contract
16. **`threeViewer/` is invisible to every dep-cruiser boundary rule, both directions** — `.dependency-cruiser.js` (its name appears only in comments). Nothing constrains what the branch's own new top-level engine layer may import, and nothing forces others through a facade. Related staleness: three rules + one exemption still fence the abandoned `lenses/*/features/` shell; leaf rules fence phantom dirs (`renderers/`, `shell/`, `interaction/`); `filestore-has-no-upward-deps` was never extended to sharedView/preferences.
17. **CI never runs either schema drift guard when `dev_docs/` changes** — `test_visualization.yml` / `test_analysis.yml` path filters cover `visualization/**` and `analysis/**` only. A PR editing only the declared source of truth (`dev_docs/cc-json-2.0.schema.json`) runs neither guard.
18. **No within-2.x evolution channel** — `cc-json-2.0.schema.json:28` (latent). `apiVersion: const "2.0"` + `additionalProperties:false` on Meta/FileNode/lenses means the very move this branch just made (adding `analyzers` to AttributeDescriptor) would hard-brick older viz builds if made post-release; and unlike 1.x there is no graceful warning path. Decide + document the policy before 2.0 files spread.

### Docs
19. **Analysis CHANGELOG contradicts itself** on the two headline breaking changes (says both "every reader accepts 1.5" and "only convert reads 1.x"; interop note claims the viz can't read 2.0 — false on this very branch). `analysis/CHANGELOG.md:21-41`.
20. **Canonical format doc stale** — `dev_docs/cc-json-2.0-format.md` still says the viz can't read 2.0 and cites the deleted `ProjectToCcJson15Mapper`.
21. **gh-pages user docs untouched** — no page mentions cc.json 2.0 or `ccsh convert`; every workflow page teaches commands that now reject users' files; versioning page still promises 2017 files merge with 2019 files; removed SourceCodeParser still listed.

### Performance (gap round, measured)
22. **2.0 write path ~1.9× slower end-to-end (3.7× write-only)** at 149k nodes — `computeChecksum` serializes the full body via `toJsonTree` + a ~41MB intermediate String for MD5, then the writer serializes again. Fix: single pass through a `DigestOutputStream`-backed writer.
23. **2.0 gzipped output 1.73× larger than 1.5** for identical content (high-entropy hex ids appear twice per node): 9.16MB vs 5.29MB at 150k nodes.
24. **Viz selection recompute +57% at 118k nodes** — now 4 full-tree `klona` passes (2 extra vs main: new clones in `accumulatedData.selector.ts:42` and `idToNode.selector.ts:26`) plus a duplicated structure pass.

---

## MINOR / observations (condensed)

**Analysis** — all 9 done 2026-07-07 (9-agent investigation → sequential fix+test+commit each; full `test` + `integrationTest` + `ktlintCheck` green)
- [x] Legacy-file rejection lottery — residual was `ccsh check`: EveritValidator now legacy-gates before schema validation (wrapped 1.x no longer passes vacuously; unwrapped 1.x gets the convert hint, not a raw stack). Hint DRY'd into `LegacyFileException.CONVERT_HINT` (c603baffd).
- [x] Legacy file without `apiVersion` → `ProjectJsonDeserializer` now defaults to `ApiVersion.ONE_FIVE`, not the flipped current version (590753f8c).
- [x] Sibling-order nondeterminism → canonical sort (NFC name, File before Folder) at the single 2.0 write boundary; 3 order-sensitive golden fixtures regenerated (data identical apart from order+checksum), Tokei assertions made name-based (15294dd90).
- [x] `NodeId.canonicalize` `/`-in-segment → actionable user-facing message naming the value + likely cause (`--path-separator`) instead of an internal precondition (27ca2eec7).
- [x] Orphaned metrics-lens entries → now warn on read, mirroring the edge path (01b136852). Note: the broader `ccsh check` referential-integrity pass (part b) deliberately left as a separate, larger change.
- [x] `DependencyLens.merge(mergeEdges)` dead param removed + KDoc reconciled; sole caller updated (behavioral overlay-edge-union already landed in P2 #6) (f3d2b5ced).
- [x] Same-name node/edge descriptor collision on lens→flat: `LensSet.allAttributeDescriptors()` now unions instead of letting `+` drop the metrics descriptor (complement of #9) (6d6cb46af).
- [x] Golden `convert` test blindness: enriched `legacy_1_5.cc.json` (edges/types/descriptors/blacklist/markedPackages), strengthened `check_convert` (2.0 markers present + legacy absent + edge `fromId` + #12 drop-warning), plus a deterministic ConvertTool unit test pinning lens data survival (87d24e521).
- [x] `analysis/README.md` links — UnifiedParser row + all 16 other pre-existing broken analyser links repointed to real `analysers/...` paths; all 17 resolve (a3b5556a3).

_Deferred / scoping from the 2026-07-07 pass (tracked so it is not lost):_
- [x] **#5 part (b) — `ccsh check` referential integrity** (DONE 2026-07-07). Was: part (a) only warned at read time while `ValidationTool` did pure JSON-schema validation, so a dangling metrics-lens id or edge `fromId`/`toId` still **passed `ccsh check`** (reproduced: both exited 0). Now `EveritValidator.validate()` runs a semantic pass **after** `schema.validate()` (JSON Schema can't express id→tree cross-refs): it collects every `files`-tree node id, then fails with a new `ReferentialIntegrityException` (→ non-zero exit, same propagation as a schema `ValidationException`) listing **every** metrics-lens key or edge endpoint that resolves to no node id. 4 new `EveritValidatorTest` cases (resolvable-passes, dangling-edge, dangling-metric, reports-all). Verified end-to-end through built `ccsh`: dangling edge/metric → exit 1 with a clear message; real `convert` output, a 164-edge `codemaatimport`, and the full `integrationTest` (every analyser output re-`check`ed) → exit 0 (no false positives); tampering a real edge's `fromId` → exit 1. `check` still bypasses `ProjectDeserializer` (raw-JSON pass), so no change to the read-path warn-and-drop contract.
- [x] **#8 — RE-VERIFIED DONE 2026-07-07, no work needed.** Confirmed the golden is fully de-blinded (2.0-vs-legacy structural greps + edge `fromId` + #12 drop-warning in `golden_test.sh:check_convert`, enriched `legacy_1_5.cc.json`, + a deterministic `ConvertToolTest` pinning edges/types/descriptors survive into the 2.0 lenses — all present, all green). The investigation's *alternative* — a committed `convert_gold.cc.json` byte-diff oracle — was **skipped on purpose** to avoid regenerating a gold file on every future convert-output change. Revisit only if a byte-exact convert oracle is wanted.

**Visualization**
- [~] `setShowIncomingEdges`/`setShowOutgoingEdges` + `removeBlacklistItems` (plural) **added to `actionsRequiringSaveCcState`** so those runtime toggles/bulk removals now persist (2026-07-06). `setEdgeAttributeTypes` left out deliberately (load-time only, persisted incidentally via `setState`/`fileActions`).
- [x] `valueOfSelector` + `NodeMetricValueLookup` **deleted** (files + 2 facade exports + spec) — zero consumers, undecorated contract landmine (2026-07-06).
- [ ] `Edge.visible` silently dropped at the 2.0 ingestion boundary → `showOnlyBuildingsWithEdges` gate constant-false with dead plumbing behind it (2 reviewers). *(pre-existing, not a 2.0 regression — out of the tier-B pass.)*
- [x] 2.0 edges with unresolved endpoints now surface in the **load-warnings dialog** (`checkWarnings` → `collectUnresolvedEdgeWarnings`), not only `console.warn` (2026-07-06).
- [x] 2.0 validation now enforces sibling `path|type` uniqueness (`validateAllFileNodesAreUnique` in `checkErrors2_0`); `detectApiVersionMajor` dead export **removed** (2026-07-06).
- [~] Dead, wire-mismatched `Lenses.opaqueLenses` TS field **removed** from `model/ccjson2.model.ts` (2026-07-06). The dep-cruiser fence gap + unknown-top-level-lens drop remain (deliberate domain-type choice, low priority).
- [x] dep-cruiser gaps closed (2026-07-07): `mocks/` + `*.mocks.ts` moved from `exclude` → `doNotFollow` (inbound prod→mock edges now visible) + new `no-prod-import-of-mocks` fence; new back-referenced `state-home-no-cross-home-raw-store` fence (a home reaches a sibling only via facade, `$1` exempts own `store/`); the 7 facade-surface rules' `from.path` broadened `^app/codeCharta/` → `^app/` so `app.config.ts`/`main.ts` are fenced (root-store exempts `app.config.ts`); `render-model` facade-only was already enforced by `161eba44c`. All three new fences proven to fire via throwaway probes; `lint:architecture` 0 violations (1165 modules).
- [ ] Facade dedup unfinished by design: **87** `*.store.ts` remain as of 2026-07-06 (GREW from the cited 78) incl. byte-identical/superset pairs; `AppStatusStore` (sidebarExplorer) named after a state slice this branch deleted; 3 orphaned button components with actively maintained specs (`export3DMapButton`, `changelogButton`, `globalConfigurationButton`); whole-CcState escape hatches (`getValue()`/`getState()`) in ~16 feature facades.
- [x] Tests (2026-07-07): ~~`edges.selector.spec` largely tautological, no delta-mode value case~~ (**done** — 3 self-referential cases replaced with hand-computed values + a delta-mode case pinning raw-union/overwrite/no-prefix); ~~`accumulatedDataSelector`~~ (**done** with #24); ~~v15 migration lacks a dedicated unit test (chain title says v14)~~ (**done** — dedicated `migrateCcStateRecordToV15` describe + chain title now `…+ v14 + v15`); ~~stale "from dynamicSettings" titles in 3dPrint~~ (**done** — 5 renamed → "from mapState"); ~~`loadFiles()` has no service-level 2.0 case~~ (**done** — 2.0 envelope load test asserting id-keyed metrics, resolved edges, split attributeTypes). ~~Remaining sub-item — a **ccsh-produced fixture parsed by a viz test**~~ (**done** — the `ccJson2ToCCFile` render-parity spec now loads the real ccsh-converted `assets/sample1.cc.json` (2.0) against its preserved 1.x source, so a ccsh-produced fixture is parsed by a viz test; the opaque hashed ids also prove the reader's id→path join does not rely on id==path). **→ whole test-gap item closed.**
- [x] Bundled sample files now real cc.json 2.0 (2026-07-07): `sample1..4.cc.json` (both `app/…/assets/` and the served `public/…/assets/` twins) replaced with real `ccsh convert` output (opaque hashed ids, real MD5), so first-run + `?file=` exercise the 2.0 reader. Display fileName kept `*.cc.json` (mapSelector strip + explorer/e2e names unchanged). The hand-written `sample1.cc2.json` was dropped; the original 1.x `sample1` is preserved as `resources/sample1_legacy_1_2.cc.json` for the parity spec.
- [x] Stale v14 migration-chain comments in `indexedDBWriter.ts` corrected → v15; dead `setSortingOrderAscending` action + reducer case + spec **removed** (2026-07-06).

**Repo hygiene / plans**
- [x] `analysis.cg.json` untracked at repo root — `*.cg.json` added to root `.gitignore` (2026-07-07).
- [ ] `CARRIED-FORWARD.md` row #2 contradicts its own notes (CF #2a/2b/2c closed); `2026-06-26-ccjson-2-deferred-gaps.md` lists gaps later commits closed; `slice-13-cqrs-homes.md` still `state: progress`.

---

## What is notably good (verified, not flattery)

- **Opaque-lens forward compatibility** is real: unknown lenses survive verbatim through DTO + domain round-trips, tested at each layer, implemented symmetrically in one place.
- **NodeId** is an exemplary identity module: documented invariants, known-answer sha-256 anchors pinning the hash across OS/JDK, `CrossToolIdReproducibilityTest` driving two real producers through their CLIs to the same id.
- **MergeResolverStrategy** (id → content → suffix with never-guess ambiguity guards) is a clear design win over main's `maxBy` tie-breaking; empty-content hashes return null, pre-empting the worst false-positive class.
- **IndexedDB migration chain (v3–v15)** is exemplary: one frozen transform per version, defensive shape guards, ~50 unit tests, plus a real full-chain upgrade test from a genuine v2 blob.
- **CQRS homes are real, not cosmetic**: read facades verifiably export zero action creators; save-trigger union preserved action-by-action through 10+ re-homings; URL round-trip faithfully re-pathed.
- **Fixture migration discipline**: 65/86 rewritten Kotlin fixtures are semantically byte-equivalent to their 1.5 predecessors (verified with a normalizing comparator) — no metric values were fudged.
- **threeViewer extraction left no debris**: no duplicated helpers, shader paths valid, the Horizontal/Vertical street cycle broken with a clean `reverseOrientation()`.
- **DependaChartaImporter** materializes endpoint nodes so its edges resolve by id — the template the CodeMaat fix (C2) should copy.

---

## Coverage, limits, owed manual checks

- All 18 dimensions produced results; 0 agent failures in the final pass. The completeness critic's three residual concerns (contract never executed end-to-end, MIMO/`--large` never run, no perf probing) were each closed by a dedicated gap round — which is where C3's execution confirmation, the `--large` lens corruption, and the perf numbers came from.
- Not covered: GZIP/large-file behavior beyond the perf benchmarks, Windows-native path handling at runtime (bounded by the NFC/NFD + separator findings), Electron packaging, e2e suite execution.
- **Owed manual smoke tests** (from the migration itself — all passed, user-verified 2026-07-07):
  - [x] WebGL hover/select after the PATH-id switch (three id-resolution mechanisms must agree — `codeMap.mouseEvent.service.ts:361` fast path still runs on ordinal ids)
  - [x] edge/arrow rendering after Slice 15e edge derivation
  - [x] white-background toggle after Slice 16

## Fix checklist (suggested order)

**P0 — before this branch ships (all are silent data loss / broken round-trips):**

- [x] C1 — `ccsh merge` silently drops legacy 1.x inputs (partial output, exit 0 / crash)
- [x] C2 — edges-only projects (CodeMaat) lose ALL edges after one 2.0 round-trip
- [x] C3 — viz: 2.0 files don't survive page reload (sample files replace user's map)
- [x] #1 — viz download of a 2.0-loaded map is unreadable by both sides (`fileDownloader.ts`) — fixed together with C3 (same `toExportApiVersion` clamp)
- [x] #12 — `ccsh convert` silently drops blacklist + markedPackages (warn at minimum) — now warns precisely (blacklist from domain, markedPackages from raw source)
- [x] #17 — CI never runs schema drift guards on `dev_docs/`-only changes — both workflows now watch `dev_docs/cc-json-2.0.schema.json`

**P1 — before 2.0 files spread in the wild (format-frozen decisions):**

- [x] #2 — NodeId omits node type — type folded into the hash (`sha-256(type.name + canonicalPath)`); File/Folder same-name siblings now get distinct ids; edge endpoints resolve their real type from the tree (no folder-edge-drop regression). New cross-tool anchors + 43 golden fixtures regenerated.
- [x] #3 — canonicalize tree shape (`PathFactory` drops `.`/collapses `..`) + unconditional duplicate-id guard at the writer (own `seenIds`, covers attribute-less/folder collisions)
- [x] #18 — cc.json 2.x = **downward-compatible, additive-only** (user decision). Version unpinned (`const "2.0"` → pattern `^2\.\d+$`) in all 3 schema copies; `additionalProperties:false` kept everywhere (no upward compat — old tool rejects newer file's unknown field); readers already gate on major 2 (no code change). Documented in the format doc (§Versioning), both CHANGELOGs, and `CC_JSON_SCHEMA_CHANGELOG.md` (2.0 entry). Tests: accept 2.7 / reject 3.0 (analysis) + accept 2.7 / reject unknown field (viz). 4-dim adversarial verify all SAFE; real `ccsh check` accepts 2.1/2.99, rejects 3.0. Also dropped a dead `TWO_POINT_ZERO="2.0"` enum. **→ P1 tier now fully complete.**
- [x] #7 — merge mis-routed edge descriptors into the metrics lens. Root cause was deeper than "use `fromLenses`" (that factory is a byte-identical legacy round-trip; `build()` always re-derives lenses via `fromLegacy`). Added `ProjectBuilder.buildFromLenses(lenses)` — assembles from the merged typed lenses directly, skipping the lossy flat re-split — and pointed `ProjectMerger` at it (3 flattening helpers deleted). `EdgeProjectBuilder` stays on `build()`. 4-dim adversarial verify all SAFE (merge byte-equivalence, wire round-trip, caller faithfulness, golden checks re-run green).
- [x] #9 — `LensSet.fromLegacy` dropped descriptors shared by node+edge types. Filter now routes a metric registered as both into BOTH lenses (`it in nodeTypes.keys || it !in edgeTypes.keys`); node-only/edge-only routing unchanged. Also fixes `ccsh convert` of `edgefilter` 1.5 output. Verified schema-valid on both lenses.
- [x] #13 — viz 1.x normalizer keys synthesized ids by `path|type` (normalizer-only; edge endpoints qualified via path→type map; shared reader untouched)
- [x] #22 — 2.0 write serialized the body twice (checksum via `toJsonTree`+41MB String+byte[], then the writer again). New `ProjectToCcJsonV2Mapper.writeProject` serializes `{files,lenses}` **once** through a `DigestOutputStream` into a byte buffer and reuses those bytes for output (spliced after `meta`); the hot `serializeProject(OutputStream)` path now uses it. Checksum + output are byte-identical (pinned by 2 new tests: checksum `24d98eb4…` unchanged + stream==DTO-path equality). Measured ~1.53× faster on the serialize+checksum step at 50k nodes (conservative; excludes GC relief at scale). End-to-end verified through built `ccsh` (plain + gzip merge → `check` exit 0). DTO/Writer/String paths unchanged.

**P2 — fast follows:** (all landed 2026-07-06 — design+verify workflow → applied → adversarial-review workflow → review fixes; analysis modules + full viz suite green, dep-cruiser 0 violations, ktlint clean)

- [x] #10 — piped legacy input now surfaces the convert hint (`e.message`) instead of dumping the whole file to stderr; still returns null so an optional/empty pipe stays non-fatal (`ProjectDeserializer.deserializeProject(InputStream)`)
- [x] #11 — `modify`/`inspect` implement `IExitCodeGenerator`, exit non-zero when a **named** input file can't be read (stdin/optional-pipe path still exits 0); `convert` already failed loudly and was left unchanged
- [x] #6 — overlay (leaf) merge no longer silently drops/mis-merges leaves: refuses ambiguous content-hash matches (>1 incoming share a hash) **and** — from review — generalized to refuse ANY resolved-target-path collision (closes the residual path-suffix collapse in `mapKeys`); 3 new tests
- [x] #8 — `--large` fails loudly on data-bearing opaque lenses / non-empty `metrics.clusters` (can't re-path opaque blobs); `ProjectMerger` opaque-lens union now fail-loud on genuine same-name conflict (was keep-first-and-drop), empty slot yields to data-bearing; `carriesData()` helper. Review follow-ups: deleted now-dead `mergeOpaqueLenses` (+ import) from `AttributeMerging.kt`; MIMO terminal message no longer mislabels a non-legacy merge failure as "legacy 1.x file". New `LargeMergeTest` + ProjectMerger trio
- [x] #14 — guard-rejected exclude now calls `clearPendingHeavyDispatch()` so the full-screen spinner clears with the error dialog instead of soft-locking; spec proves the rejection branch clears the subject
- [x] #15 — added rehydrate specs for `applyMapState` (all 30 differing keys, `isLoadingMap` genuinely exercised as skipped via count−1 — mutation-catches removal from `ignoredMapStateKeys`) + both lens-source appliers; `makeAllValuesDiffer` helper
- [x] #16 — added `three-viewer-engine-does-not-import-up` fence; dropped 4 stale rules + phantom `renderers/`/`shell/`/`interaction/` targets fencing the abandoned `lenses/*/features/` shell; extended `filestore-has-no-upward-deps` to `sharedView/`+`preferences/`; `lint:architecture` 0 violations
- [x] #19 — analysis CHANGELOG reconciled: "ccsh emits 2.0 only; 1.x read exclusively by `ccsh convert`; visualization reads 2.0" (removed the "reads both 1.5 and 2.0" / "viz consumes 1.5 only" contradictions)
- [x] #20 — `dev_docs/cc-json-2.0-format.md` stale — header now "both sides", `ProjectToCcJson15Mapper` ref removed (no 1.5 writer), "viz can't read 2.0" limitation dropped
- [x] #21 — gh-pages user docs sweep — new `docs/filter/convert.md` (+ sidebar) documents `ccsh convert`/2.0; versioning + codecharta-shell + merge-filter note the 2.0 breaking change & convert on-ramp; SourceCodeParser→UnifiedParser in netbeans/junit4/junit5. Astro build clean; 6-agent adversarial fact-check green (1 refuted claim on the versioning merge-promise fixed)

**P3 — remaining MAJOR findings:**

- [x] #4 — NFC/NFD collision crashes serialization after merge. New single `NodeId.normalizeName` (NFC) is the source of truth; merge name-matching (`namesMatch` + suffix `normalizedEdges`) is NFC-aware so NFD/NFC siblings merge instead of surviving to trip the writer's duplicate-id `require`. Tested through the real `ProjectMerger`→serialize path (the `tree()`/`NodeInserter` helper's `mergeChildrenList=true` folders masked this at the strategy level).
- [x] #5 — 2.0 read/write name normalization. Names are NFC-normalized at BOTH the write boundary (`ProjectToCcJsonV2Mapper.toFileDto`, self-consistent wire + byte-idempotent round-trip + stable checksum — from review) and the read boundary (`CcJsonV2ToProjectMapper.toNode`, tolerates foreign NFD files) so tree names agree with the NFC edge endpoints EdgeFilter matches on. Round-trip + idempotency + read-isolation tests added; golden/integration green.
- [ ] #23 — 2.0 gzipped output 1.73× larger than 1.5
- [x] #24 — viz selection recompute at 118k nodes. **Design+verify workflow (12 agents: 5 investigators → 2 competing designs → judge → 5 adversarial verifiers, 0 blockers)** chose relocating `id→node` UP into renderModel: deleted `lenses/structure/store/idToNode.selector.ts` (which cloned `structureTree.map` + re-ran the deterministic structure pass just to re-derive ids) and added `renderModel/accumulatedData/idToNode.selector.ts` that indexes the already-decorated `accumulatedData.unifiedMapNode` by `.id` (no clone, no structure pass). Both consumers (`threeScene.store`, `codeMapMouseEvent.store`) repoint to `renderModel.facade`. This is now **id-equality by object identity** with the mesh's `idToBuilding` (same tree the renderer builds from), not merely by determinism. **Partial-but-real:** removes idToNode's clone (#3) + its redundant `decorateMapWithStructure` (structure pass B) on the selection-recompute path — 4→3 clones, 2→1 structure passes. The other two extra clones are **proven non-droppable**: clone #2 (`accumulatedData`) mutates a memoized/shared tree in place; clone #1 (`fileStates`) guards the delta fold paths (`getDeltaFile` 1-file returns a raw store ref; 2-file mutates store nodes via `DeltaGenerator`) — the hinted "drop the fileStates clone" hybrid was **refuted** as unsafe. Design B (keep in lens, single shared pass) was rejected: moving blacklist-classify post-merge flips `isFlattened` on merged folder-chain nodes → behavior change. Legal per `render-model-is-top-derived-layer` (features/threeViewer excluded from its from-set; `valueOf`/`NodeMetricValueLookup` already deleted so no lens needs id→node → no cycle). Also **closed the pre-existing `accumulatedDataSelector` spec gap** (clone-before-decorate + single-pass unique-id + cross-selector mesh-parity) and added a renderModel `idToNode` spec (identity + no-mutation). Full suite 384 suites / 2334 passed / 45 snapshots zero-diff, `lint:architecture` 0 violations, Biome clean. **User-owed WebGL smoke:** hover / single-select / folder constant-highlight on a large map light up the same buildings.

Minor findings are tracked as checkboxes directly in the "MINOR / observations" section above.
