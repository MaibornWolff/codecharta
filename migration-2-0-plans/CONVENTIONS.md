# Migration conventions — the shared definition of "safe"

Every step plan in `rpi-plan/` points here. Two guarantees, enforced by the same two tools:
**characterization tests** (behavior never changes) and **dependency-cruiser fitness functions**
(layout/components stay reusable). The throughline is Tidy First + branch-by-abstraction.

---

## Part 1 — Behavior is never allowed to change

> **The snapshots ARE the behavior contract.** If they don't change, the render didn't change.

### The hard rules
- **Never run `npm run test:updateSnaps` (no `-u`) during the migration.** A snapshot diff = a
  behavior change = a bug to fix in the step. It is never a baseline to re-bless.
- **Commit on green only**, and keep **structural and behavioral changes in separate commits**
  (Tidy First). Small, reversible, bisectable commits.

### The render/behavior contract (what pins it)
| Concern | Pinned by |
|---|---|
| Geometry + building colors | Jest render snapshots: `features/codeMap/rendering/__snapshots__/rendering.spec.ts.snap`, `features/codeMap/__snapshots__/codeMap.render.service.spec.ts.snap`, `util/algorithm/treeMapLayout/__snapshots__/*` |
| Metric values (min/max/values) | parity unit tests (new repo/selector **value-equals** the old selector) |
| 2.0 ingestion | a 2.0 twin of a 1.5 sample produces an **identical** `CCFile.map`/edges/types |
| Interaction flows (upload, select, delta, context menu) | Playwright e2e under `app/codeCharta/e2e/` |
| **Not covered** by the above | label positioning, hover highlight, tooltip text, camera → **manual side-by-side vs `main`** |

### Per-commit acceptance checklist

**A structural commit (a `git mv` + repoint — steps 1, 3, parts of 5):**
- [ ] The moved code is **byte-identical** (only paths/imports changed). If logic changed, it's not structural.
- [ ] `npx tsc -p tsconfig.json --noEmit` clean.
- [ ] `npm test` green **with ZERO snapshot diff and no `-u`.** A snapshot change here means the move wasn't pure → fix it.
- [ ] `npm run lint:architecture` — no new violations.
- [ ] All importers repointed (a `grep` for the old path is the checklist; **include `.spec.ts`** importers).

**A behavioral commit (a data-source swap or new path — steps 2, 4, 6, parts of 5):**
- [ ] **Branch by abstraction:** the new path and the old path coexist and compute **equal values**;
      a parity test asserts it (`facade.x value-equals oldSelector.x`) **before** the old is deleted.
- [ ] `npm test` green with **zero snapshot diff** (the swap changed *where* data comes from, not *what* it is).
- [ ] `npm run e2e` green for the affected flow.
- [ ] **Manual smoke vs `main`** for whatever the snapshots don't cover this step (name them in the plan).
- [ ] Deletion of the old path is a **separate** follow-up commit, only after the swap is green.

**Every step states its rollback** (revert the structural move; or revert the behavioral commit and keep the move).

---

## Part 2 — Layout & components stay reusable

> Reusability isn't a convention you hope holds — it's made **structurally impossible to couple**, and lint enforces it.

1. **Dumb by construction.** Shared components (`modal`, `popover`, `tooltip`, `dialog`, `colorPicker`,
   `spinner`, `errorDialog`) take `@Input()`s and emit `@Output()`s and inject **no** store / lens /
   domain service. **Litmus test:** if it renders in a unit test with only `@Input`s and *no store mock*,
   it's reusable.
2. **Layout = slots, not content.** Workbench / sidebars / bottom bar are **hosts** (`<ng-content>` /
   component outlets); features fill the slots. The shell never imports a feature. The Workbench hosts the
   **active renderer behind the `load/highlight/settings` interface**, so it's reusable across
   CodeMap → Graph → WordCloud **unchanged**.
3. **Presentational/container split.** Extract the dumb piece into `components/`; keep the data-pulling
   service in the feature. e.g. one `<cc-metric-row>` (name + value + descriptor in) reused by legend +
   inspector + fileExtensionBar; each feature's service feeds it.
4. **Public surface only.** Components are consumed via a feature's `facade.ts` / `components/`; internals
   are private. Standalone Angular components with explicit `@Input/@Output`.
5. **Shared theming, not copied SCSS.** DaisyUI/Tailwind tokens (component SCSS is already banned).
6. **Dedupe as you touch.** The duplicate metric-row / popover variants collapse into one `components/`
   version when their owning feature migrates.

---

## Part 3 — The dep-cruiser rule behind each guarantee

(Staged at `warn` in step 1; the 7 lens-internal rules flip to `error` in step 7;
`metrics-lens-ngrx-guard` and `new-must-not-import-legacy` stay `warn` until `viewState`/`appearance` land.)

| Guarantee | Backed by rule |
|---|---|
| Components can't couple to domain (reuse) | `components-are-dumb-primitives` |
| A lens is reached only via its facade | `lens-external-access-only-via-public-surface` |
| Components ← services ← repos (no shortcuts) | `feature-components-go-through-services`, `feature-services-read-repos-not-store` |
| Only state-holders touch ngrx | `metrics-lens-ngrx-guard` (+ existing `feature-only-stores-can-import-ngrx-store`) |
| Renderer engine stays dumb | `renderer-engine-stays-dumb`, `page-uses-engine-public-api` *(later slices)* |
| New world stays clean of legacy | `new-must-not-import-legacy` (`legacy → new` allowed via the lens facade) |
| Wire DTO stays at the load boundary | `wire-dto-only-in-...-boundary` |
| No SCSS / no Angular Material | `no-component-scss-files`, `no-angular-material` |

---

## One-line definition of safe
**A step is safe when:** structural commits produce a zero snapshot diff, behavioral swaps prove
value-equality before deleting the old path, no snapshot was ever re-baselined, `lint:architecture`
is clean, and the things snapshots don't cover were smoked against `main`.
