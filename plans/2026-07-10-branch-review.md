---
name: Branch review — feature/cc-json-2-analysis
issue: <#issueid>
state: progress
version: 2
---

## Goal

Collect review findings for the `feature/cc-json-2-analysis` branch and record the architecture
decisions taken while reviewing. Living document — findings get appended as review continues.

## Corrections (2026-07-10, after verification)

Five claims below were checked against the code and did not survive. They are left in place for the
record, with the correction attached to each finding.

1. **Finding 6 is wrong on mechanism.** Dropping the spec globs from knip's `entry` is a **no-op**.
   knip's Jest plugin re-registers `*.spec.ts` as entries, its Playwright plugin re-registers
   `*.e2e.ts` via `testMatch`, and the `*.po.ts` files are imported by those e2e files. Zero findings
   before and after. The diagnosis (a test-only-alive export counts as used) is right; the lever is
   `knip --production`, which needs `!` production-suffixes on **both** `entry` and `project` or it
   silently analyzes nothing.
2. **Finding 5 was never knip-detectable.** `downloadCurrentMap` is a static class member, and knip 6
   has no `classMembers` issue type at all (`ERROR: Invalid issue type: classMembers`). It cannot be
   finding 6's worked example.
3. **`ts-jest` is not unused.** `jest-preset-angular`'s `NgJestTransformer` does `require("ts-jest")`
   and `extends TsJestTransformer` — it *is* the TypeScript transformer. Removing the direct
   devDependency is safe (jest-preset-angular declares `ts-jest@^29.4.0` itself), but not because
   nothing references it.
4. **The readonly count is off by one.** `codeMap.render.service.ts` has *three* never-reassigned
   siblings without `readonly` (`threeSceneService` L37 was missed), not two.
5. **The `loadInitialFile` TODO is a complete sentence**, not truncated mid-clause, and the two
   CHANGELOG entries called "misfiled under Fixed 🐞" already live under `Chore 👨‍💻 👩‍💻`.

One finding was added: **`@jest/globals` is a genuine unlisted dependency**, imported by exactly one
spec (`stores/rootStore/store.spec.ts:1`) out of ~200 and declared nowhere.

## Decisions

Taken during review on 2026-07-10. These tighten the existing dependency-cruiser fences.

**Status: deferred.** Decisions 1–3 are a refactor (~156 imports, ~62 dispatch sites, 8 effect files),
not a cleanup. They want their own branch and their own review; none of the work below was done.

1. **Only the top-level `stores/` band may import `@ngrx/store`.**
   Allowed: `app/codeCharta/stores/*/store/**`. Feature-level `stores/`, lens `store/`, and
   `renderer/threeViewer/stores/` lose their ngrx access and must reach state through home facades.

2. **No `@ngrx/store` import at all outside that band — `createSelector` included.**
   The pure-combinator carve-out is rejected. `renderer/renderModel/`'s selector modules and the
   lens selectors either move into `stores/` or get named exemptions.

3. **Dispatch lives only in `stores/`.** Effects do not dispatch either. This is stricter than
   idiomatic ngrx (effects returning actions is the normal pattern) and the 8 effect files that
   dispatch today must be reworked.

## Findings

### 1. `views/` is not fenced against ngrx — `codeCharta.component.ts` injects `Store` and dispatches

There is no single "only stores may import ngrx" rule. There are three, each scoped to one band by
`from.path`:

| Rule | `from.path` |
|---|---|
| `feature-only-stores-can-import-ngrx-store` | `^app/codeCharta/features/[^/]+/` |
| `metrics-lens-ngrx-guard` | `^app/codeCharta/lenses/` |
| `state-home-only-stores-import-ngrx` | the five `stores/<home>/` paths |

`views/` matches none, so dependency-cruiser never evaluates the component against any ngrx guard.
`npm run lint:architecture` passes clean (1165 modules, 0 violations) — the import is permitted by
construction, not by an exemption anyone wrote. Same gap covers `renderer/`, `load/`, and `util/`.

### 2. The dispatch guard is bypassable by injecting `Store` directly

`display-components-cannot-dispatch` forbids a component from **importing a write facade**. It does
not forbid injecting `Store`. `CodeChartaComponent` does exactly that:

```ts
constructor(private readonly store: Store, ...) {}
ngOnInit(): void {
    this.store.dispatch(setIsLoadingFile({ value: true }))
```

Two independent holes: the rule's `from.path` is `^app/codeCharta/features/.*\.component\.ts$`
(so `views/` escapes it), and the rule fences an import path rather than the injectable, so any
component reaching for `Store` escapes it regardless of band.

`views/` appears to have been carved out in the reorg with only its **inbound** edge fenced
(`nothing-imports-views`); the outbound ngrx and dispatch constraints were never extended to it.

### 3. Blast radius of the three decisions

Measured on the branch, non-spec files only, allowed path = `^app/codeCharta/stores/[^/]+/store/`.

**156 files import `@ngrx/store` from outside the allowed path:**

| Band | Files |
|---|---|
| `features/` | 118 |
| `renderer/` | 21 (18 are `createSelector`-only in `renderModel/`) |
| `load/` | 5 |
| `lenses/` | 5 |
| `stores/` (outside `store/`) | 3 |
| `util/` | 2 |
| `views/` | 1 |
| `app/app.config.ts` | 1 |

**62 `.dispatch(` sites sit outside the allowed path** — `features/` 57, plus one each in `views/`,
`util/`, `stores/`, `renderer/`, `load/`.

**Zero dispatches currently live inside `stores/*/store/`.** Under decision 3 as literally stated,
every dispatch site in the app is a violation. The only dispatch in the `stores/` band at all is
`stores/fileStore/repos/files.repo.ts` (3 calls), and it is in `repos/`, not `store/` — so either
`repos/` joins the allow-list or the repo stops dispatching.

**Must be exempt or the app cannot boot:**
- `app/app.config.ts` — `provideStore`
- `stores/rootStore/store.ts`, `stores/rootStore/state.actions.ts` — the ngrx composition root

**Enforceability note:** decision 2 is expressible in dependency-cruiser as-is (it matches modules).
Had `createSelector` been exempted, depcruise could not have expressed it — it does not see imported
symbol names — and it would have needed an eslint `no-restricted-imports` rule instead. Decision 3
(no dispatch) is *not* expressible in depcruise either way: `.dispatch()` is a method call, not an
import. It needs an eslint rule or a lint script.

### 4. knip gates dead code but masks one real unused dependency

> **Corrected.** `ts-jest` is **not** unused — it is the transformer, reached through
> `jest-preset-angular`'s `NgJestTransformer` (`require("ts-jest")`, `extends TsJestTransformer`). The
> direct devDependency was still removed (we do not import it; jest-preset-angular declares it), but
> the reasoning here was wrong. There are 13 dependency findings, not 13-of-which-12-are-false: 11 are
> false positives from `app.scss` / `angular.json` / `tailwind.css` / `script/*.js`, and the 13th,
> **`@jest/globals`, is a genuine unlisted import** in `stores/rootStore/store.spec.ts:1`.

`visualization/knip.json` turns off `dependencies`, `devDependencies`, and `unlisted` — three of
knip's ~14 issue types. All the dead-code rules (`files`, `exports`, `types`, `enumMembers`,
`duplicates`, `unresolved`) are still at their default `error`. `npm run lint:deadcode` exits 0.

Re-running with those three rules enabled yields 13 findings, 12 of which are genuine false
positives — packages reached from `app.scss`, `angular.json`, `app/tailwind.css`, or `script/*.js`,
none of which are in knip's `project` glob (`app/**/*.ts`).

The exception: **`ts-jest` has no reference anywhere outside `package.json`.** The project uses
`jest-preset-angular`, which brings its own transformer. Real unused devDependency, currently masked.

Also worth noting: `project` is `app/**/*.ts`, so `script/`, `electron/`, and the root config files
are never analyzed. Dead code there is not caught. Defensible for a first gate, but neither
`knip.json` nor the commit message says so.

### 5. `fileDownloader.ts` — dead export, and the duplicated intersection type it drags along

`FileDownloader.downloadCurrentMap` has **no production caller**. The only callers are its own spec
(6 call sites). Production imports `FileDownloader` in exactly two places
(`features/3dPrint/.../export3DMapDialog.component.ts`, `features/scenarios/.../scenarioImportExport.service.ts`)
and both call only `downloadData`.

Cause is not the reorg: commit `0633424c3` *"Remove download button #3157"* (2023-11-07) deleted
`downloadButton.component.ts` + `downloadDialog.component.ts` (397 lines) and with them the last
call site. Orphaned since. `main` has no caller either.

**Dead (reachable only from the spec):** `downloadCurrentMap`, `getProjectDataAsCCJsonFormat`,
`getBlacklistToDownload`, `getAttributeTypesForJSON`, `getAttributeDescriptorsForJSON`,
`getFilteredBlacklist`, `undecorateMap`, `undecorateEdges`, and the exported type
`DownloadableSetting` — roughly lines 21–114 of a 127-line file. `downloadData` is all that survives.

**The type smell that surfaced it.** Lines 27 and 39 repeat inline:

```ts
FileSettings & MetricsLensSource & { blacklist: BlacklistItem[]; markedPackages: MarkedPackage[] }
```

which is a copy of `CCFile.settings.fileSettings` (`model/domain.model.ts:25-27`), minus the
`DependencyLensSource` term. That omission is a no-op — `DependencyLensSource` is
`{ attributeTypes: AttributeTypes }` and `MetricsLensSource` already contributes the same key, as
the comment at `domain.model.ts:23` states. So the two shapes resolve identically and the file
duplicates a documented type three times (twice in source, once in the spec).

Resolution: delete the dead methods rather than name the type. `CCFile.settings.fileSettings` is then
the sole site, and its inline intersection is already documented in place. (If a name is still wanted
there: `CCFileSettings`.)

**Bonus — tightens an existing fence.** `fileDownloader.ts` is one of only three modules
`wire-dto-only-in-filestore-boundary` permits to import `codeCharta.api.model`, and its `ExportCCFile`
import (line 2) exists solely for `getProjectDataAsCCJsonFormat`. Deleting the dead code shrinks that
rule's allow-list from three entries to two.

### 6. knip's spec entry points mask test-only exports — decision: drop specs from `entry`

> **Corrected — the prescribed fix is a no-op.** Removing the globs changes nothing: knip's Jest
> plugin re-registers `*.spec.ts` as entries, its Playwright plugin re-registers `*.e2e.ts` from
> `playwright.config.ts`'s `testMatch`, and every `*.po.ts` is imported by an e2e file. Verified by
> running it: zero findings before, zero after.
>
> The *diagnosis* holds — a production export whose only consumer is its own test does count as used —
> but the lever is `knip --production`, which needs `!` production-suffixes on **both** `entry` and
> `project` or it silently analyzes nothing and exits 0. With them it reports 21 unused files,
> 56 unused exports and 2 unused types, most of it deliberate test scaffolding (`*.po.ts`, `mocks.ts`,
> `testUtils/`, `_`-prefixed selectors exported for tests). Not taken on; it is its own triage.
>
> Finding 5 also cannot be this finding's worked example: `downloadCurrentMap` is a static class
> member and knip 6 has no `classMembers` issue type.
>
> **Done instead:** the redundant `entry` key was deleted (the Angular plugin already supplies
> `app/main.ts`) and the config now documents what the gate does and does not catch. It was renamed
> `knip.json` → `knip.jsonc` to hold those comments: knip tolerates them in a `.json`, but Biome —
> which formats the repo on commit — parses `.json` strictly and rejects them.

`knip.json` sets `entry: ["app/**/*.spec.ts", "app/**/*.e2e.ts", "app/**/*.po.ts"]`. Spec files are
therefore entry points, so **any export kept alive solely by its own test counts as used**. Finding 5
is the worked example: eight members and one exported type, dead for two years, and
`npm run lint:deadcode` reports 0.

The gate is weaker than the slice-18b commit message claims — it cannot catch the class of dead code
that is most likely to accumulate (production code whose only remaining consumer is its test).

**Decision:** drop specs from `entry` and let knip's default test-file handling classify them.
Baseline will no longer be 0 until the resulting findings are triaged; the count is unknown until run.

### 7. `MergeResolverStrategy.kt` — a correctness bug, two disjoint halves, and an O(n·m) hot loop

**ALL FIVE PARTS DONE** (7a fix, 7b split, 7c trace, 7d perf, 7e fix). Tracing 7c surfaced a new bug,
7e, which is now also resolved.

File: `analysis/analysers/filters/MergeFilter/src/main/kotlin/de/maibornwolff/codecharta/analysers/filters/mergefilter/MergeResolverStrategy.kt`
(new on this branch).

**Update:** 7a, 7b, 7c, 7d and 7e are all done.

#### 7a. BUG — non-transitive `nodesMatch` duplicates a wildcard node into every match

`nodesMatch` treats `Unknown`/`null` type as a wildcard (its own comment, line 66). So `File "a"` and
`Folder "a"` do not match each other, but **both** match `Unknown "a"` — matching is not transitive.
`mergeOrAppendNode` (line 80) merges the incoming node into *every* match:

```kotlin
return nodeList.map { if (nodesMatch(it, node)) mergeRecursively(it, node) else it }
```

Reproduced against the real class (scratch test, since deleted):

```
input:  [File "a" {m:1}], [Folder "a" {m:2}], [Unknown "a" {wildcard:99}]
result: node name=a type=File   attrs={m=1, wildcard=99}
        node name=a type=Folder attrs={m=2, wildcard=99}
```

The `Unknown` node's attributes and children land in **both** survivors. `nodesMerged` is also
incremented once for two merges, so the stats under-report.

Introduced by `dcbbd3b5a` *"fix(analysis): do not merge a file into a same-named folder"* (2026-07-10,
this branch). Before it, matching was by name alone — an equivalence relation — so at most one node
could match and `.map` was safe. The type guard broke that invariant without changing the `.map`.

**RESOLVED — option 3, *refuse ambiguity*.** Landed with a regression test that reproduces the
duplication above before the fix.

Archaeology settled the choice. On `main` the predecessor `RecursiveNodeMergerStrategy` matched by
**name alone** — an equivalence relation, so at most one sibling could ever match and `.map` merged
into exactly that one. `dcbbd3b5a` is what broke it: refusing the File/Folder pairing let `File "a"`
and `Folder "a"` coexist as siblings for the first time, and the wildcard it deliberately kept lets a
third same-named node match both. So options 1 and 3 are **both byte-identical to `main` on every
input `main` could produce**; they differ only in a case `main` could not construct.

Further facts that decided it:

- The wildcard is **any type that is neither File nor Folder** — `Unknown`, `Package`, `Class`,
  `Interface`, `Method` — not just `Unknown`. No parser or importer ever emits one (every producer
  emits `File` or `Folder`), but a hand-written cc.json carrying `"type":"Package"` parses into one
  via `NodeType.parse`. A `null` type is unreachable from any input.
- **Option 2 strays the most.** Its stated risk (regressing parsers that emit `Unknown`) is refuted —
  none do — but it also stops `Package "a"` folding into `File "a"`, which `main` *did* merge.
- **Option 1 is silent and order-dependent**: the payload lands in whichever of File/Folder happens to
  come first in the accumulator.
- Option 3 is safe to serialize: a 2.0 `NodeId` preimage is `type.name + canonicalPath`, so the
  appended third sibling gets its own id (`Unknown/a`) and passes `ProjectToCcJsonV2Mapper`'s
  `require(seenIds.add(id))` guard.
- No existing test pinned the wildcard behavior, so nothing had to be rewritten.

#### 7b. The class is two disjoint strategies behind a `when (mode)`

`mode` is fixed at construction — `MergeFilter.kt:77,91,92` pick one and never switch. So the `when`
is a runtime branch for a compile-time choice. The halves barely overlap:

| Member | UNION | OVERLAY |
|---|---|---|
| `nodesMatch`, `isFileFolderClash` | used | **dead** |
| `addUnmatchedNodes`, `nodesUnmatched`, `keepOrDrop` | **dead** | used |
| the 8 leaf-resolution helpers | **dead** | used |
| `namesMatch`, `ignoreCase`, `nodesProcessed`, `nodesMerged` | used | used |

`recursive()` (line 223) passes `addUnmatchedNodes = true`, a value UNION never reads.

Candidate: split into `UnionMergeResolver` + `OverlayMergeResolver` over a small shared base, keeping
`recursive()`/`leaf()` as the public factories so `MergeFilter.kt` is untouched. Lesser option: keep
one class and rename the factories to `union()`/`overlay()` to match the `Mode` enum they construct.

**DONE — the split.** `MergeResolverStrategy` is now a `sealed` base holding what both modes share (the
name fold, the fold-and-merge skeleton, and its two counters), with the per-node step and the stats line
abstract. The `Mode` enum is deleted — nothing outside the class ever referenced it. Purely structural:
`MergeFilter.kt` and all four test classes are unchanged, and both stats strings are byte-identical.
The helper count in the table above undercounts: OVERLAY owns ten leaf-resolution helpers, not eight.

#### 7c. OVERLAY skips the File/Folder clash guard — scope or oversight?

`overlayNodeOntoReference` (line 92) calls `namesMatch`, not `nodesMatch`, so `dcbbd3b5a`'s clash
guard never applies in OVERLAY mode. The commit message scopes itself to "UNION merging matched nodes
by name alone", so this may be deliberate. **Unresolved** — needs a trace of whether a File/Folder
root collision is reachable in OVERLAY before deciding to add the guard or document its absence.

**RESOLVED — deliberate at that call site, and the trace found a real bug elsewhere.**

The guard does not belong on `overlayNodeOntoReference`. That method only ever sees *project roots*:
`ProjectMerger.mergeProjectNodes` folds one singleton `listOf(rootNode)` per project, and unlike
UNION's `mergeRecursively`, the OVERLAY step never re-enters `mergeNodeLists`. There is no sibling
there to keep a clashing node apart from, and the method's `else` branch **drops** rather than appends
— so refusing a root clash would silently discard the entire incoming project. Every ccsh writer roots
a project at a `Folder` named `root` (`ProjectBuilder.kt:10`), so two roots of differing types require
a hand-written 2.0 file, and `NodeMaxAttributeMerger.createType` already warns when handed more than
one concrete type. Documented in place.

#### 7e. NEW BUG — OVERLAY nests a leaf inside a same-named *file*, producing a File with children

Found while tracing 7c. A File/Folder clash **is** reachable in OVERLAY, just not at the root.
`mergeLeavesIntoReference` re-inserts each resolved leaf with `root.insertAt(...)`, and
`NodeInserter.insertByPath` resolves parents **by name only** (`getNode(root, name)`), with no type
check. So an incoming leaf under a folder `foo` is nested inside a same-named reference *file* `foo`.

Reproduced against the real class, on the exact input shape the existing UNION clash test uses — two
ordinary tool outputs, no hand-crafting, no File root:

```
reference: /src/foo        (File,  {a: 1.0})
incoming:  /src/foo/bar.kt (File,  {b: 2.0})   →  foo becomes a Folder in the incoming tree

UNION   (correct): src → [ foo File {a}, foo Folder → bar.kt ]     # two siblings
OVERLAY (wrong):   src → [ foo File {a} → bar.kt ]                 # a File that owns a child
```

`NodeMaxAttributeMerger.createType` does warn (`conflicting types [Folder, File]; using File`), so it
is not silent — but the emitted tree is structurally invalid, and which node survives depends on the
insertion order of the resolved-leaves map.

**RESOLVED — option (b), type-aware `NodeInserter`.** Landed in `49b2a6225`, with a regression test on
`OverlayMergeResolver` reproducing this exact repro plus a matching `NodeInserter.insertByPath` unit
test (plan: `plans/2026-07-15-overlay-merge-file-folder-fix.md`).

Type-awareness alone at the folder-traversal parent lookup (`getFolderNode`) was not sufficient: the
same clash is also reachable through the terminal same-name merge branch whenever the File and Folder
insertion order is reversed, so `getMergeableNode` (mirroring `UnionMergeResolver.isFileFolderClash`)
now also refuses to merge a File into a Folder or vice versa there, falling through to keeping both as
siblings — for either insertion order. Full `./gradlew test` and `./gradlew integrationTest` pass; the
only pre-existing fixture that relied on the old name-only collision behavior
(`NodeInserterTest`'s "double root insert" case) was a hand-crafted File/Folder merge and was updated
to use two same-typed nodes instead, preserving its original dedup intent.

#### 7d. A comment that contradicts the code — O(n·m) NFC normalization

Line 211 claims `normalizedEdges` normalizes "once per path instead of re-allocating it on every
suffix comparison". But `unambiguousSuffixMatch` calls `normalizedEdges(it)` for every reference path
on *every* incoming leaf, so the whole reference tree is re-normalized once per incoming leaf.
`suffixFit` additionally rebuilds two `Path` objects per comparison.

Fix: hoist the reference-path normalization into `resolveLeaves` (computed once). Separately,
`resolveTargetPath`'s exact-match stage is an O(n) scan with per-edge normalization
(`referenceLeaves.keys.firstOrNull { pathsEqual(...) }`) that could be an O(1) normalized-key map
lookup.

**DONE.** A `ReferenceIndex` built once per merge now backs all three stages: a folded-edge-list map for
exact match (first-wins, so a fold collision resolves the way `firstOrNull` did), a content-hash index,
and the pre-folded paths for suffix matching. `suffixFit` compares the folded lists directly instead of
re-wrapping them in two `Path` objects per comparison, and `pathsEqual` is gone.

The comment was wrong about more than the hoisting. It claimed suffix matching "stays consistent with
the NFC-aware `namesMatch`" — but `namesMatch` folded with `equals(ignoreCase)` and `normalizedEdges`
with `lowercase()`, and those genuinely disagree (`"İ".lowercase()` yields two characters). Both now go
through one `foldedName`, which reproduces `equals(ignoreCase = true)` exactly. With the default
`ignoreCase = false` both were already plain NFC, so nothing changes there.

### 8. SonarCloud — 10 open issues on PR 4505, all `CODE_SMELL`

Source: `sonarcloud.io/project/issues?id=maibornwolff-gmbh_codecharta_visualization&pullRequest=4505&issueStatuses=OPEN,CONFIRMED&sinceLeakPeriod=true`
Pulled via `api/issues/search` and each one verified against the code. Severity split: 1 CRITICAL,
2 MAJOR, 5 MINOR, 2 INFO.

#### 8a. `json:S2260` CRITICAL — false positive, and stale since 2018

`app/codeCharta/resources/sample1_legacy_1_2.cc.json:6` — "A parsing error occurred in this file."
The only CRITICAL in the PR, 30min effort, assigned to `christian-huehn-mw`.

**The file is valid JSON.** Confirmed independently by `python3 -c json.load`, `node JSON.parse`, and
`jq -e .`. No BOM, no CRLF, pure ASCII, 2045 bytes, depth 8.

The same rule fires on three other files project-wide — `assets/sample1.cc.json`,
`sample2.cc.json`, `sample3.cc.json`, all at line 6, all valid JSON. Those issues were **created
2018-02-08 and 2019-05-15**. All four issues carry the identical line hash
`f95b70fdc3088560732a5ac135644506`, which is `md5("{")`. But the assets files' current line 6 is
`},` → `md5` `5da387c9…`. So the three assets issues no longer match the content they point at:
they are stale, tracked forward by hash across seven years.

The PR's file merely has a line 6 that hashes to the same value (`\t\t{`), so Sonar attached the
long-standing false positive to it. Nothing about this branch's code caused it.

Not reproducible from file content: of the 10 `.cc.json` files under `app/`, only these 4 are
flagged, and BOM/CRLF/tabs/size/depth do not distinguish flagged from unflagged.

**Remedy:** mark as false positive in SonarCloud, and add `**/*.cc.json` to `sonar.exclusions` —
they are data fixtures, not source. That also clears the three 2018/2019 zombies.

#### 8b. `typescript:S2933` MAJOR ×2 — genuine, 2min each

- `features/codeMap/codeMap.render.service.ts:41` — `codeMapMouseEventService` never reassigned
- `features/codeMap/arrow/codeMap.arrow.service.ts:35` — `threeSceneService` never reassigned

Both confirmed: no `this.<member> =` anywhere outside the constructor. Add `readonly`.

Note the flagging is arbitrary, not exhaustive. In `codeMap.render.service.ts` the siblings
`codeMapArrowService` and `threeStatsService` are *also* never reassigned and *also* lack `readonly`,
but Sonar's leak period only reports lines the PR touched. A grep for non-`readonly` private members
under `features/` returns ~255 hits. Fix the two flagged; a repo-wide sweep is separate work.

#### 8c. `typescript:S1874` MINOR ×5 — by design; `@deprecated` is the wrong marker

> **DONE — option (b).** The three fields moved onto `CcJson2WithCarryover` / `FileNodeWithCarryover`,
> which the normalizer returns and the reader consumes. `CcJson2` and `FileNode` are the 2.0 shape
> again, and a consumer of them cannot see the carryover fields at all — verified with a compile probe.
> Both directions stay assignable (every carryover member is optional), so no call site, spec or mock
> needed a type change.

- `stores/fileStore/loaders/ccJson/util/ccJson2/ccJson2ToCCFile.ts:39` (`blacklist`), `:40` (`markedPackages`), `:68`, `:69` (`fixedPosition`)
- `stores/fileStore/loaders/ccJson/util/ccJson2/normalizeToCcJson2.ts:72` (`fixedPosition`)

`model/ccjson2.model.ts:25,31,54` tag these with `@deprecated 1.x-normalization carryover — NOT part
of cc.json 2.0`. The 1.x→2.0 normalizer must read them; that is its whole job. So every one of these
five is a self-inflicted false positive.

Root cause: `@deprecated` is a *tooling* signal meaning "stop calling this, it is going away", and
every linter treats it that way. It is being used here to mean "1.x-only, absent in 2.0". Those are
different claims. Options: (a) drop `@deprecated` and state the constraint in prose, (b) move the
carryover fields to a distinct `LegacyCarryover` type the normalizer imports deliberately, or
(c) keep and mark the five false-positive in SonarCloud. (b) is the one that makes the type system
carry the meaning.

#### 8d. `typescript:S1135` INFO ×2 — TODO comments

- `load/loadInitialFile.service.ts:212` — `// TODO: Please make sure that this function works fine on Github pages with`  (sentence is truncated mid-clause)
- `util/metric/unaryMetric.ts:1` — `// TODO: Remove the unary metric.`

Both zero-effort. The first is an unfinished sentence and says nothing actionable — delete or
complete it.

### 9. `sonar-project.properties` — the `w1` ignore key is defined twice, silently dropping one rule

```properties
sonar.issue.ignore.multicriteria=c1,w1,t1
...
sonar.issue.ignore.multicriteria.w1.ruleKey=Web:BoldAndItalicTagsCheck          # line 23
sonar.issue.ignore.multicriteria.w1.resourceKey=**/*.html                       # line 24
...
sonar.issue.ignore.multicriteria.w1.ruleKey=Web:MouseEventWithoutKeyboardEquivalentCheck   # line 34
sonar.issue.ignore.multicriteria.w1.resourceKey=**/*.html                       # line 35
```

`w1` is declared once in the multicriteria list but assigned twice. In a Java properties file the
later assignment wins, so the `Web:BoldAndItalicTagsCheck` exemption on line 23 — with its
explanatory comment about font-awesome `<i>` tags — has no effect. Fix: rename the second block to
`w2` and list it (`multicriteria=c1,w1,w2,t1`).

**Impact currently unproven:** both rules report 0 open issues, so the lost exemption is not masking
anything today. Latent, not active. Pre-existing; not introduced by this branch.

### 10. CHANGELOGs carry internal refactor notes — both must be trimmed to user-facing changes only

**Requirement:** a CHANGELOG entry exists to tell a *user* what changed for them. Internal
restructuring — module moves, state-home reshapes, lint rules, CI wiring — does not belong there, no
matter how large the diff. This matches `CLAUDE.md` ("follow keepachangelog"), whose first principle
is that changelogs are *for humans*, not a commit log.

#### 10a. `visualization/CHANGELOG.md` — 7 of 10 added entries are internal

Six of them say so in their own text: *"No user-facing behavior change (render and metric values are
identical)."*

| Section | Entry | Verdict |
|---|---|---|
| Added 🚀 | cc.json 2.0 support | **keep** |
| Changed | cc.json 2.x versioning | **keep** |
| Changed | Metrics lens architecture (Slice 1) | cut — internal |
| Changed | Metrics lens owns the node-metric domain (Slice 2) | cut — internal |
| Changed | Dependency (edge) lens (Slice 3) | cut — internal |
| Changed | Appearance module (Slice 4) | cut — internal |
| Changed | mapState state-home (Slice 5) | cut — internal |
| Fixed 🐞 | cc.json 2.0 map survives reload and download | **keep** (but see 10c) |
| Fixed 🐞 | Metrics-lens aggregator shrink | cut — internal |
| Fixed 🐞 | Metrics-lens boundary enforcement | cut — internal (dependency-cruiser rules) |

Two of the cuts sit under **Fixed 🐞** but are not fixes — an aggregator refactor and a set of lint
rules. Misfiled as well as internal.

The Slice-1..5 narrative is real engineering history and worth keeping — in `migration-2-0-plans/`
or the ADRs, not in the user-facing changelog.

#### 10b. `analysis/CHANGELOG.md` — 1 of 17 added entries is internal

The analysis changelog is in much better shape; the entries are genuinely about `ccsh` behavior
(BREAKING 2.0 default output, `convert`, the 1.5 writer removal, the merge/edgefilter fixes). One cut:

> - CI now runs the 2.0 schema drift guards when only the schema source of truth
>   (`dev_docs/cc-json-2.0.schema.json`) changes: the analysis and visualization test workflows watch
>   that path in addition to their own trees.

A GitHub Actions path filter. Invisible to anyone running `ccsh`.

#### 10c. A kept entry describes a feature that does not exist

The visualization "Fixed 🐞 — cc.json 2.0 map survives reload and download" entry reads:

> Re-exporting a loaded map (for IndexedDB persistence and **for the download button**) now stamps
> the flat export shape with the 1.x `apiVersion` it actually is…

**There is no download button.** It was deleted in 2023 by `0633424c3` (see finding 5). The only
download UI today is 3D-print export and scenario export, both of which call
`FileDownloader.downloadData`, not the dead `downloadCurrentMap` that the re-export path belongs to.

So the entry advertises a fix to a code path no user can reach. Either the fix is real for IndexedDB
persistence only (drop the download clause), or the download feature is meant to come back and the
dead code in finding 5 should not be deleted. **These two findings must be resolved together.**

### 11. Map "bleed" with `age_in_weeks` as area metric — **UNRESOLVED, cause not yet found**

Evidence: `ideas/Problems/bleed.png`, `ideas/Problems/codecharta.new.json.gz` (cc.json 2.0, 3520 nodes,
4.69 MB uncompressed). Reporter's example of a bleeding building: `visualization/script/appZip.js`.

**Status: not reproduced offline.** A first hypothesis (zero-valued leaves → zero-area buildings) was
investigated and then **refuted** — see below. Do not act on it. The cause is still open.

**Probably NOT introduced by this branch.** `treeMapGenerator.ts` is semantically identical to `main`;
the only diff is state-path renames (`dynamicSettings`→`mapState`, `appSettings`→`preferences`/`mapState`).
`age_in_weeks` is an old metric.

#### Refuted hypothesis: "a metric value of 0 makes a zero-area building"

`treeMapGenerator.ts:284` does use a **truthiness** check, so a real `0` is indistinguishable from
*metric absent*, and both fall to line 294 (`experimentalFeaturesEnabled ? 0.5 : 0` → `0` by default):

```ts
if (isLeaf(node) && node.attributes?.[mapState.areaMetric]) {   // <- truthiness, not existence
```

That is a genuine latent defect and worth fixing on its own merits. **But it does not explain this bug:**

- `appZip.js` has **`age_in_weeks: 38`**, not `0`. The zero path never runs for it.
- `complexity` yields **more** zero-extent leaves (1063) than `age_in_weeks` (977), and `loc` yields 243.
  If zero-extent caused the bleed, every metric would bleed.

#### Measurements (real 3520-node tree, real padding fns, real defaults: `margin=50`, `enableFloorLabels=true`)

| area metric | leaves | zero-extent | aspect >10 | aspect >50 | aspect >100 |
|---|---|---|---|---|---|
| `age_in_weeks` | 2545 | 977 (38.4%) | 129 (5.1%) | 35 | 16 |
| `loc` | 2545 | 243 (9.5%) | **201 (7.9%)** | **63** | **42** |
| `rloc` | 2545 | 508 (20.0%) | 138 (5.4%) | 30 | 17 |
| `complexity` | 2545 | **1063 (41.8%)** | 89 (3.5%) | 18 | 11 |

`loc` is *worse* than `age_in_weeks` on aspect ratio and `complexity` is *worse* on zero-extent, yet
neither is reported as bleeding. **Neither statistic discriminates.**

`appZip.js` footprint: `855.1 × 71.1` under `age_in_weeks` (12:1) vs `49.1 × 42.4` under `loc` (1.2:1).
Its ancestors (`script` 1306×990, `visualization` 2674×7146, `root` 10258²) all contain it correctly.

#### Ruled out

- **Not the data.** 3520 node ids, 7413 dependency edges, **zero dangling `fromId`/`toId`**, zero orphan
  metric keys, no `fixedPosition` nodes, values `0..473`, all integers, no negatives.
- **Not out-of-bounds layout coords.** For `age_in_weeks`, `loc`, `rloc`: `nonFinite=0`, `negative w/l=0`,
  `outsideBounds=0`, `maxW=maxL=10258` (exactly the map size).
- **Not a child escaping its parent.** Checked every node against its parent's rect: **0 escapes**, both
  metrics.
- **Not NaN from d3's `squarify`.** `alpha = …/(value * ratio)` is `Infinity` when a folder's subtree sums
  to 0, but d3's `positionNode` clamps `x1 < x0`, so coords stay finite.

#### Open leads

1. **`age_in_weeks` is `attributeType: relative`**; `loc`/`rloc` are `absolute` and `complexity` has no
   type. The 7 relative metrics are `number_of_authors`, `range_of_weeks_with_commits`,
   `weeks_with_commits`, `median_coupled_files`, `age_in_weeks`, `semantic_commit_ratio`,
   `hotfix_commit_ratio`. **This is the only property found so far that separates `age_in_weeks` from the
   metrics that do not bleed.** A relative metric is summed by `hierarchy.sum()` up the tree, which is
   meaningless for an average — but bounded, so it is not obviously the bleed either. *Next step: check
   whether the other 6 relative metrics also bleed.*
2. **No minimum building width/depth.** `geometryGenerator.ts:29` defines `MINIMAL_BUILDING_HEIGHT = 1`
   and `ensureMinHeightUnlessDeltaIsNegative` applies it — but there is **no equivalent guard for `width`
   or `depth`**. `setInstanceTransform` calls `matrix.makeScale(width, height, depth)` with the raw
   values, so a `width === 0` building becomes a degenerate instance.
3. **`mapSizeResolutionScaling`.** The file is 4.69 MB, over the 2 MB `MEDIUM_MAP` threshold in
   `getMapResolutionScaleFactor`, so the app does **not** run at scale 1.0 as the probes above did.
   `buildNodeFrom` applies the factor to `height` a second time after `getHeightValue` already applied it.
   Worth checking whether an analogous double- or missing-application affects `width`/`length`.

#### It does not reproduce — and the branch changed no code in this path

Reporter could not reproduce after reloading the page and re-running a scenario. That reframes the bug:
**it is state-dependent, not a pure function of (tree, metric, settings).**

Consistent with that, nothing in the layout→geometry chain differs from `main`:

- `treeMapGenerator.ts` — semantically identical (state-path renames only).
- `geometryGenerator.ts` — 177 lines on both; same `InstancedMesh`, same `makeScale`,
  same `MINIMAL_BUILDING_HEIGHT = 1`, same `count = nodes.length` with every index filled.
- `geometryGenerationHelper.ts` — 428 → 206 lines, but the 224 removed lines are the **dead**
  non-instanced vertex path (`addBoxToVertexData`, `setPositions`, `setVerticesAndFaces`, `sides`)
  swept by slice 18a (`a7e7e3e0a`). Active code identical.
- `codeMapMesh.ts` — 506 → 505 lines.

And the layout is robust across every settings combination tried — **`escapes=0` and `nonFinite=0` in all
six**:

| `invertArea` | `margin` | map | rootValue | nonFinite | child-escapes-parent | appZip.js |
|---|---|---|---|---|---|---|
| false | 50 | 10258 | 47384 | 0 | **0** | 855.1 × 71.1 |
| true | 50 | 10258 | 716038 | 0 | **0** | 166.8 × 271.1 |
| false | 100 | 16191 | 47384 | 0 | **0** | 1383.1 × 95.6 |
| true | 100 | 16191 | 716038 | 0 | **0** | 253.0 × 416.6 |
| false | 0 | 4325 | 47384 | 0 | **0** | 322.0 × 35.0 |
| true | 0 | 4325 | 716038 | 0 | **0** | 75.5 × 119.2 |

#### Suspects investigated and weakened

1. **Stale persisted state** — *audited, no defect found.* `stores/rootStore/indexedDB/indexedDBWriter.ts`:
   `DB_VERSION = 15`, with 13 record transforms (`v3`…`v15`) applied in ascending order by
   `migrateCcStateRecord`. `margin` is re-homed by **v4** (from `dynamicSettings`), `areaMetric` by **v5**,
   `invertArea` by **v3** (from `appSettings`). Every transform seeds its target from `defaultMapState`
   (`{ ...defaultMapState, ...record["mapState"] }`) and guards each copy with `if (key in source)`. So a
   missing key cannot overwrite a default with `undefined` — the mechanism that would have produced a
   `NaN` margin (`width = (mapWidth + nodesPerSide * margin + …)`) and hence infinite geometry.
   Not disproven, but no smoking gun.
2. **Stale render** — the mesh rebuilt against the previous node array on `areaMetric` change, drawing old
   footprints at new positions. Would explain "bleed" literally and would be one-shot. `build()` allocates
   a fresh `InstancedMesh` with `count = nodes.length` and fills every index, so nothing is stale *within*
   a build; the suspect is the effect that decides *when* to rebuild. **Not investigated.**

#### Status: parked as a one-shot

Reporter confirms it has not recurred after reload + scenario re-run. The only durable evidence is
`ideas/Problems/bleed.png` and the attached cc.json. Everything reproducible has been ruled out:
data, layout coords (across 6 settings combinations), child-containment, d3 NaN paths, and the diff
against `main` in the whole layout→geometry chain.

Reopen if it recurs. Capture at that moment: `margin` and `invertArea` from the UI, and whether the
session started from a pre-existing IndexedDB blob (clear it, reload, reload the file — still bleeding?).

**Do not fix `calculateAreaValue` on account of this bug.** The truthiness guard is a real latent defect
(see the refuted-hypothesis section) and worth its own commit, but it is not this.

## Steps

### Done

- [x] Cut the 7 internal entries from `visualization/CHANGELOG.md`; Slice narrative relocated to `migration-2-0-plans/INTERNAL-CHANGELOG.md` (finding 10a)
- [x] Cut the CI schema-drift entry from `analysis/CHANGELOG.md` (finding 10b) — it moved to the internal changelog too
- [x] Reconcile finding 10c with finding 5: **the download path is dead.** The kept Fixed entry lost its download clause and now claims only the IndexedDB-persistence fix
- [x] Add `readonly` to the S2933 members (finding 8b) — all five in the two files, not just the two Sonar flagged. The specs reassigned them, so they now use the `Object.defineProperty` idiom the same files already used for `labelSettingsFacade`
- [x] Exclude `**/*.cc.json` from sonar analysis (finding 8a)
- [x] Fix the duplicate `w1` key in `sonar-project.properties` (finding 9) — second block renamed `w2` and listed
- [x] Resolve the two TODO comments (finding 8d) — both had load-bearing content and were rewritten as prose, not deleted
- [x] **Finding 7a** `nodesMatch` fix landed as *refuse ambiguity*, with a regression test that fails against the old code
- [x] **Finding 7b** `MergeResolverStrategy` split into a sealed base + `UnionMergeResolver`/`OverlayMergeResolver`; the `Mode` enum is gone, the factories and every caller are untouched
- [x] **Finding 7c** Traced: the guard is correctly absent from the overlay step, and its absence is documented there. The trace turned up a real bug at a different site — see finding 7e
- [x] **Finding 7d** Reference leaves now indexed once per merge (`ReferenceIndex`); exact match is a map lookup, `suffixFit` no longer allocates two `Path`s per comparison. Also unified the two disagreeing case folds — see below
- [x] **Finding 8c** `@deprecated` replaced by `CcJson2WithCarryover`/`FileNodeWithCarryover`; the pure 2.0 types can no longer see the 1.x fields (verified with a compile probe)
- [x] Delete `downloadCurrentMap` + 7 helpers + `DownloadableSetting`; the whole spec went with them (every test drove dead code), plus the orphaned `TEST_FILE_DATA_DOWNLOADED` mock and the stale `apiVersion.ts` doc comment
- [x] Remove `util/fileDownloader.ts` from the `wire-dto-only-in-filestore-boundary` allow-list — down from three entries to two
- [x] Rework knip's `entry` (finding 6) — the proposed change was a no-op; the redundant key was deleted and the gate's real limits documented in `knip.jsonc` (renamed from `knip.json` so Biome accepts the comments)
- [x] Remove `ts-jest` from `package.json` — and from `package-lock.json`; it still resolves transitively
- [x] Remove the stray `@jest/globals` import (new finding) — the one genuine `unlisted` dependency

Verified: `npm test` 383 suites / 2333 tests green (was 384 / 2339 — exactly the deleted spec),
`tsc --noEmit` clean, `npm run lint` (architecture + deadcode) clean, `npm run format:check` clean,
`./gradlew test` and `./gradlew ktlintCheck` green.

**A fold bug surfaced by 7d.** `namesMatch` folded case with `String.equals(ignoreCase = true)` while
`normalizedEdges` used `String.lowercase()`. Those disagree — `"İ".lowercase()` is two characters — so
exact-position matching saw `İstanbul.kt` and `istanbul.kt` as one file and suffix matching did not,
even though `normalizedEdges`' own comment claimed consistency with `namesMatch`. Both now fold through
`foldedName`, verified equivalent to `equals(ignoreCase = true)` over an adversarial name set (882/882
pairs, including `ß`/`ẞ` and the Turkish dotted I). Pinned by a regression test.

### Not taken on

- [ ] **Finding 7e (NEW, open)** OVERLAY nests an incoming leaf inside a same-named reference *file*, emitting a File node that owns children. Reproduced. Fix options in the finding; `NodeInserter` is shared model code, so this needs its own decision
- [ ] **Finding 11 (PARKED — one-shot, did not recur)** Reopen only if it happens again; capture `margin`/`invertArea` and whether IndexedDB was pre-existing
- [ ] **Finding 11 (separate, latent)** `calculateAreaValue` truthiness guard conflates "metric is 0" with "metric absent" — fix on its own merits, NOT as a fix for the bleed
- [ ] **Finding 11 (separate, latent)** `geometryGenerator` enforces `MINIMAL_BUILDING_HEIGHT` but has no minimum width/depth; a zero-area leaf becomes a degenerate instance
- [ ] Mark `json:S2260` false-positive in the SonarCloud UI (finding 8a) — cannot be done from the repo; the `sonar.exclusions` half is done
- [ ] Triage the 21 files / 56 exports / 2 types that `knip --production` reports (finding 6)
- [ ] **ngrx fences (decisions 1–3), deferred as a refactor of its own:**
  - [ ] Confirm the `repos/` question: does `stores/fileStore/repos/` join the dispatch allow-list, or does `files.repo.ts` stop dispatching?
  - [ ] Decide `renderModel/` fate: move its 18 selector modules into `stores/`, or exempt them by name
  - [ ] Widen the three ngrx rules into one rule fencing every band outside `stores/*/store/`
  - [ ] Add the boot exemptions (`app.config.ts`, `stores/rootStore/`)
  - [ ] Replace `display-components-cannot-dispatch` with a check that catches `Store` injection, not just write-facade imports
  - [ ] Add an eslint rule for the no-dispatch-outside-stores constraint (depcruise cannot express it)
  - [ ] Rework the 8 dispatching effect files
  - [ ] Record the `views/` scope decision in the rule comments

## Notes

- Verification performed: `npm run lint:architecture` (clean), `npm run lint:deadcode` (clean),
  knip re-run with dependency rules enabled (13 findings), grep counts for ngrx imports and
  dispatch sites across `app/**/*.ts` excluding `*.spec.ts`.
- Decisions 1–3 are a large refactor, not a cleanup. The lenient reading of decision 1 (any folder
  named `stores/`/`store/` at any depth) would have been ~6 outliers; the chosen reading is ~156
  files for the import rule and ~62 for the dispatch rule.
- The `readonly` fix is a reminder that Sonar's leak period only reports lines the PR touched: a
  repo-wide sweep of non-`readonly` private members under `features/` is ~255 hits and is separate work.
