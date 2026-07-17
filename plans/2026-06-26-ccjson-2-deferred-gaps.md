---
name: cc.json 2.0 analysis — deferred gaps
issue:
state: todo
version: 1
---

## Goal

Record the cc.json 2.0 analysis-side gaps surfaced by the post-implementation gap audit
(workflow `wf_0e16918b-f15`, 5 auditors) that are **intentionally deferred**. Each is a real
incompleteness, none is a regression from the review-findings cleanup. The fixed/accepted items are
listed at the bottom for context. Severity is from the perspective of a user producing and merging
real 2.0 files across tools/repos.

## Deferred gaps

| # | Sev | Area | Gap | Why deferred |
|---|-----|------|-----|--------------|
| 4 | major | Merge | Default merge (recursive/union) matches by tree position+name only; cross-tool/cross-repo joins of differently-rooted files need `--leaf`. The full fix is re-pathing incoming overlay edges through the leaf resolver. | The single hard design item; needs a UX decision (point users at `--leaf`, or auto-reconcile) + exposing the leaf path-resolution map to the edge merge. Documented in `dev_docs/cc-json-2.0-format.md`. |
| 9 | minor | Merge | `--leaf` cross-root matching relies on `contentHash`, which only UnifiedParser/RawTextParser emit. Sonar/Coverage/CSV/CodeMaat/Tokei/Git/SVN files can't use the rename/move bridge → fall back to suffix only. | Works-as-intended (importers don't read content). Document, or carry a base file's `contentHash` through importers. |
| 10 | minor | Merge | UNION edge dedup is endpoint-pair only (`distinctBy { from, to }`), so two edges between the same pair with different attributes collapse to the first, losing the second's values. | Low impact in practice; fix = merge attribute maps for duplicate endpoint pairs (like node merge). `DependencyLens.kt:18`. |
| 11 | minor | Merge | `--large` aborts the whole batch if any one input isn't rooted at `root`; it doesn't skip-and-warn like unreadable files do. | Fix = per-file try/catch in `processLargeMerge` (`MergeFilter.kt`). |
| 12 | minor | Reader | `CcJsonV2ToProjectMapper` trusts stored/foreign `id`s without recomputing from tree position and with no duplicate-id guard, so a wrong/duplicated id in hand-written/foreign 2.0 input silently mis-attaches metrics or self-heals on round-trip. | Never triggers for suite-produced ids; only matters at the foreign-input trust boundary. Fix = recompute+warn or dedup-guard in `collectEndpoints`/metrics lookup (`CcJsonV2ToProjectMapper.kt:70,77`). |
| 13 | minor | Validation | The everit schema validates 2.0 via a version-blind `anyOf(1.5, 2.0)` with no `additionalProperties:false` and no `apiVersion` discriminator → muddled cross-version error text, stray/typo'd keys pass. | Accept/reject is correct; only diagnostics/strictness suffer. Fix = validate the branch matching the detected `apiVersion`, add `additionalProperties:false` + an `apiVersion` const per branch. |
| 14 | minor | Tooling | `InspectionTool` is format-agnostic and works on 2.0, but has no 2.0 test fixture (only a 1.3 one) → no regression guard. | Cheap: add a 2.0 fixture + `inspect` test. |
| 15 | minor | Pipeline | The piped-stream JSON extractor (`ProjectInputReader`) counts `{`/`}` without skipping braces inside JSON string values; 2.0's opaque-lens payloads widen the surface for a mis-sliced sub-object. | Pre-existing (1.5 had it); low likelihood given the sync-flag prefix. Fix = make the scan string/escape aware. |
| 16 | minor | Tests | `golden_test.sh` omits the two newest 2.0 producers (UnifiedParser, DependaCharta) from the end-to-end CLI→2.0→schema harness. | Cheap: add `check_unifiedparser`/`check_dependacharta` + a DependaCharta 2.0 golden fixture. |
| 17 | minor | Tests | The hand-maintained 2.0 everit schema (`ValidationTool/.../cc.json`) has no DTO-drift guard against `CcJsonV2`, and diverges from the visualization's generated (1.5) schema. | Fix = a round-trip test that serializes a representative 2.0 `Project` and validates it against the schema, so DTO additions the schema misses fail a test. Schema unification waits on the viz migration. |
| — | nit | Importers | Sonar `--use-path` roots one level too shallow vs other producers (`getCuttedPath` always cuts the first segment), so the same file gets a different id under `--use-path`. | Pre-existing Sonar quirk; only matters if cross-tool Sonar joins are a target. Gate the first-segment cut on `usePath`. |

## Fixed / done in this pass (for context, not deferred)

- **Fixed #3** — `NodeMaxAttributeMerger` now carries `contentHash` through a merge when nodes agree
  (null only on genuine conflict), so a merged 2.0 file stays `--base-file`/content-match usable.
- **Fixed #5** — merge now unions+dedupes edges from every input regardless of strategy, so `--leaf`
  no longer silently drops incoming dependency edges. (Re-pathing differently-rooted overlay edges is
  gap #4 above.)
- **Done #7** — added a cross-tool id-reproducibility guardrail test (two producers, same file ⇒ same id).
- **Done #8** — CHANGELOG entry for the breaking 2.0 flip + a "Known limitations" section in
  `dev_docs/cc-json-2.0-format.md`.

## Accepted as-is (no action, per maintainer)

- **Viz can't read 2.0 + no 1.5 output flag** — intentional (2.0 is analysis-first; viz migrates
  separately). Documented in CHANGELOG + dev_docs.
- **Filters drop `opaqueLenses`/`clusters`** — latent and harmless while those slots are always empty
  in production; revisit when a real `domain`/`security`/`clusters` lens lands (it would need threading
  through `ProjectBuilder.fromLenses`/`build()` and `ProjectMerger`).
- **`blacklist` lost on 1.5→2.0** — by design (visualization view state, off the 2.0 wire). Documented.
