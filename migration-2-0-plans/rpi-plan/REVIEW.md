# REVIEW (v2) — Viz 2.0, Slice 1 plan set

Re-assessment of `00-roadmap.md` + `step-1…7`. The prior review's five structural blockers
(C1–C4, DoD vocab, C8) are essentially cleared and verified against real viz code. Two **new
cross-plan defects** surfaced as the tail of those fixes — both gate-breaking if the plans are
executed verbatim. Verdict: **NO-GO**, pending two small reconciliations.
**[v3 update: both reconciliations + the should-fix nits have since been applied — see the Addendum at
the bottom. Verdict is now GO.]**

## Per-step verdict

| Step | Verdict | Top residual (or "resolved") |
|------|---------|------------------------------|
| 1 — skeleton + model + dep-cruiser | **solid** | resolved (C3 dup-types/NodeId, C4 rule-set). Tail: the `model/ccjson2.model.ts` range types it seeds feed the step-4/5/6 field-name split below — not a step-1 fault. |
| 2 — cc.json 2.0 ingestion | **solid** | resolved (all 4 prior). Cosmetic: "two levels above visualization/" miscount (`dev_docs/` is the repo root = one level / four `../`); add a one-line note that `checkErrors/checkWarnings/removeAuthorsAttributes` signatures widen to `CcJson2|ExportCCFile`. |
| 3 — FileStore module | **solid** | resolved (spec-importer enumeration, facade-delete, golden vocab). Minor: `files.actions` **prod** consumers are 7, not 5 (missing `searchPattern.reducer.ts` + `dynamicSettings.actions.ts`); grep-checklist mitigates. |
| 4 — Metrics-lens core | **needs-work** | range shape is `{values,min,max}` but the canonical `selectedColorMetricDataSelector` is `{values,minValue,maxValue}`; Task 5's "rangeOf value-**equals** selectedColorMetricDataSelector" overclaims — it is equal only under a `min↔minValue`/`max↔maxValue` remap. Root of N2. |
| 5 — Legend into metrics lens | **needs-work** | **MATERIAL (N1):** `LegendService` reads 7 view/appearance settings via `store.select` from `…/features/legend/services/`, expecting `metrics-lens-ngrx-guard` to **stay at `warn`** — but step 7 flips that rule to `error`. As written, step 7's gate fails on this service. |
| 6 — Repoint metric consumers | **needs-work** | **MATERIAL (N2):** repoints `colorBandRow`/`colorSettingsHeader`/`metricColorRangeValues.selector` (which read `.minValue/.maxValue`) onto the facade's `{min,max}` shape **without** the remap step 5 included → literal execution yields `undefined` min/max ⇒ wrong color ranges, breaking the parity the step promises. Plus the inspector `{nodeMetricData: […]}` array-wrap is unstated. |
| 7 — Enforce + verify | **needs-work** | flipping `metrics-lens-ngrx-guard`→`error` collides with step 5 (N1). Minor: `model/` is wrongly listed in the reconciled `codeCharta.api.model` wire-DTO allow-list (no file under `model/` imports it; step 1 forbids it) — remove it. |

## Blocker resolution (C1–C8 + DoD)

- **C1 — MetricsLens facade contract inconsistent across 4/5/6:** **RESOLVED (partial tail).** Step 4
  now owns three surfaces (injectable sync+reactive facade, re-exported public ngrx selectors); steps
  5/6 consume exactly those. Residual tail = the `{min,max}` vs `{minValue,maxValue}` field-name split
  (now tracked as **N2**, not a contract gap).
- **C2 — step 6 routed edge data through the node-only facade:** **RESOLVED.** Edge reads
  (`accumulatedData`, `metricNamesSelector`, `hasEdgeMetric`, popover edge branch) stay on the canonical
  `metricDataSelector`; `MetricDataStore` is kept, not deleted. Only node-metric duplicates removed.
- **C3 — duplicate 2.0 types + stranded NodeId/sha-256:** **RESOLVED.** Single source
  `model/ccjson2.model.ts`; step 2 reuses it (no `*2` redeclare); `nodeId.ts`/`js-sha256` dropped; the
  string `id` is the join key, mapped `id→/root/path` by tree walk, never re-hashed.
- **C4 — dep-cruiser warn→error staging inconsistent:** **RESOLVED for the rule set / OPEN as N1.** Steps
  1 and 7 enumerate the identical 8 rules and flip them one-for-one. But one of those staged rules
  (`metrics-lens-ngrx-guard`) is flipped to `error` while step 5 deliberately introduces a `warn`-level
  violation it expects to survive — the new contradiction below.
- **C5 — schema location / wire-DTO boundary:** **RESOLVED.** 2.0 schema vendored under `app/` with a
  drift guard; step 7 reconciles the real `api.model` importer set. Minor wording nits only (step 2
  "two levels" miscount; step 7 stray `model/` in the allow-list).
- **C6 — reactive-vs-sync facade impedance:** **RESOLVED.** Legend reads the facade's observable forms
  (`selectedColorMetricData$`, `descriptors$`); components are already `toSignal`-reactive.
- **C7 — verification overclaims / `format` cwd:** **RESOLVED.** "verified present" → "after steps 1–6";
  `npm run format` runs from repo root.
- **C8 — missing rollbacks:** **RESOLVED.** Every step now carries an explicit Rollback line.
- **DoD vocabulary (golden / pixel-identical):** **RESOLVED.** Restated as render-pipeline Jest snapshot
  byte-identity; the three `.snap` files exist and there is no Playwright image-baseline suite.

## New blockers (must reconcile before execution)

- **N1 — `metrics-lens-ngrx-guard` step-5 ↔ step-7 contradiction (gate-breaking).** Step 5's collapsed
  `LegendService` lives at `lenses/metrics/features/legend/services/` and imports `@ngrx/store` to read
  the 7 view/appearance settings (`colorMetric`, `areaMetric`, `heightMetric`, `edgeMetric`,
  `colorRange`, `mapColors`, `isDeltaState`). The rule only permits `@ngrx/store` from a lens's
  `repos|store` dirs. Step 5 documents this as "temporary, allowed at `warn`"; step 7 Task 1 flips the
  rule to `error` and Task 2 gates on zero violations. Executed verbatim, **step 7's `lint:architecture`
  gate fails on `LegendService`.** Fix one of: (a) carve a documented service-level exemption for the 7
  settings reads and flip the rule with that carve-out, (b) keep those reads behind thin settings stores
  in step 5 so no `@ngrx`-in-service is introduced, or (c) leave `metrics-lens-ngrx-guard` at `warn` this
  slice and have step 7 say so explicitly (breaks the "all 8 flip" symmetry but is honest).

- **N2 — range field-name split `{min,max}` vs `{minValue,maxValue}` (parity-breaking in step 6).** Step
  4's facade emits `{values,min,max}`; every metricsBar node-metric consumer step 6 repoints
  (`colorBandRow`, `colorSettingsHeader`→`calculateInitialColorRange`, `metricColorRangeValues.selector`)
  reads `.minValue/.maxValue`. Step 5 added an explicit `min→minValue`/`max→maxValue` remap; step 6 says
  only "re-point" with no remap, so literal execution feeds `undefined` min/max into the color range —
  the exact regression the step promises to avoid. Reconcile once: either step 4 emits
  `{minValue,maxValue}` (drop-in for all canonical-`MetricMinMax` consumers and the legend remap goes
  away), or steps 5 **and** 6 both state the remap. Also fix step 4 Task 5's "value-equals" wording, and
  add the inspector array-wrap note (`nodeMetricDataSelector` returns a bare `NodeMetricData[]` but
  `_calculateMetricRows` expects `{nodeMetricData: […]}`).

## Residual should-fix (non-blocking)

- Step 2: correct "two levels above visualization/" → repo-root sibling (`../../../../dev_docs/…`); add
  the one-line note that the three validator functions widen to the `CcJson2|ExportCCFile` union; place
  the new 2.0 render spec under `app/codeCharta/e2e/` (Playwright), not as a scattered `*.e2e.ts`.
- Step 3: bump the `files.actions` prod-consumer count from 5 to 7.
- Step 7: drop `model/` from the reconciled `codeCharta.api.model` wire-DTO allow-list (no importer there;
  step 1 forbids it).

## Verdict: **NO-GO**

Two real cross-plan defects remain — **N1** (step 5 introduces a `warn`-level `metrics-lens-ngrx-guard`
violation that step 7 promotes to a hard `error`, failing the final gate) and **N2** (step 6 repoints
color-range consumers onto the facade's `{min,max}` shape without the `minValue/maxValue` remap step 5
already proved necessary, silently breaking color ranges). Both are small, local edits, but as written
the plans are mutually contradictory at the enforcement gate and at the metricsBar parity, so they
cannot be executed verbatim. Apply the N1 + N2 reconciliations (and the three should-fix nits) and this
flips to GO; nothing structural remains.

---

## Addendum (v3) — N1 + N2 + nits applied → **GO**

- **N1 (resolved):** step 7 keeps `metrics-lens-ngrx-guard` at **`warn`** (flips **7** rules, not 8). The
  legend's temporary `@ngrx`-in-service read of the 7 view/appearance settings is an accepted bridge until
  `viewState`/`appearance` land; promoted to `error` in that later slice. Step 5 states the same.
- **N2 (resolved):** step 4's `metricRangeSelector`/`rangeOf` now emit the exact `MetricMinMax`
  `{values,minValue,maxValue}` shape → legend/metricsBar/inspector repoints are **drop-in, no field remap**.
  Step 6 adds the inspector `{nodeMetricData: array}` wrap note.
- **Nits:** schema is **one** level above `visualization/` (drift import `../../../../dev_docs/…`); `model/`
  removed from step 7's wire-DTO allow-list; `files.actions` prod consumers corrected to **7**; the 2.0
  e2e spec placed under `app/codeCharta/e2e/`; `checkErrors`/`checkWarnings` signature-widen noted.

**Verdict: GO** — no structural or cross-plan defects remain; the plans can be executed in order.
