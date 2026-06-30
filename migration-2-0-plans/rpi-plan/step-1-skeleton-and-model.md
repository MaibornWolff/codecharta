---
name: skeleton-ccjson-2-model-types-and-scoped-dep-cruiser
issue:
state: complete
version: 2
---

## Goal

Lay down the structural skeleton for Slice 1: add the cc.json 2.0 domain types under
`visualization/app/codeCharta/model/`, create the empty target dirs (`fileStore/`,
`lenses/metrics/{repos,store,features}`), and add the dependency-cruiser boundary rules for the
dirs that exist this slice (at `warn`). Structural only — no existing runtime behavior changes.

> **Slice-1 decision (locked):** the visualization does **not** compute node ids. The analysis side
> already writes a stable string `id` into `files[]` and `lenses.metrics.attributes`; the viz just
> **reads that string `id`** as the join key. No `nodeId.ts`, no sha-256 in the viz this slice.

## Tasks

### 1. cc.json 2.0 domain types (`model/ccjson2.model.ts`)

TS port of the analysis-side wire shape (`analysis/.../serialization/dto/CcJsonV2.kt`) expressed as
the visualization *domain* types — the single source of the 2.0 shape (step 2 reuses these; it does
**not** redeclare them in `codeCharta.api.model.ts`). Reuse existing enums from `model/domain.model.ts`.

- `CcJson2 { meta: Meta2; files: FileNode[]; lenses: Lenses }` (`files` = exactly one root folder).
- `Meta2 { projectName: string; apiVersion: string; checksum: string; commitHash?: string }`.
- `FileNode { id: string; name: string; type: NodeType; children?: FileNode[]; contentHash?: string; link?: string }`
  — reuse `NodeType` (`File`/`Folder`) from `domain.model.ts`; mirrors the analysis `FileDto`.
- `Lenses { metrics?: MetricsLensData; dependency?: DependencyLensData; opaqueLenses?: Record<string, unknown> }`
  (domain/security stay inside `opaqueLenses`, round-tripped verbatim).
- `MetricsLensData { attributes: Record<string, Record<string, number | number[]>>; attributeDescriptors: AttributeDescriptors; attributeTypes: Record<string, AttributeTypeValue>; clusters?: unknown[] }`
  — `attributes` keyed by the string node `id`; flat metric→type map (not the legacy nodes/edges split).
- `DependencyLensData { edges: DependencyEdge[]; attributeTypes: Record<string, AttributeTypeValue>; attributeDescriptors: AttributeDescriptors }`,
  `DependencyEdge { fromId: string; toId: string; attributes: Record<string, number> }`
  (introduced now only so step 2's reader can map `lenses.dependency.edges` into today's
  `fileSettings.edges`; the dependency *lens* is not built this slice — one-sentence forward note).
- Reuse `AttributeDescriptors` / `AttributeTypeValue` from `domain.model.ts`. New names (`Meta2`,
  `DependencyEdge`) avoid clashing with the existing `Edge`/`FileMeta`. Note the known
  reuse caveat: the viz `AttributeDescriptor` has **no `analyzers` field**, so the 2.0 schema's
  `analyzers` is dropped on read (acceptable for Slice 1 — flag in Notes); and `attributes` values may
  be `number[]` (list-valued, e.g. authors) which today's `KeyValuePair` does not model — step 2 must
  strip/ignore non-numeric values before they reach `CodeMapNode.attributes`.
- Import these types directly (per the `codeCharta.model.ts` barrel note "new code may import
  directly"); do **not** add to the barrel.

### 2. Empty target dirs

- `fileStore/` and `lenses/metrics/{repos,store,features}` — create with `.gitkeep`; populated in
  steps 3–5. No code moves here yet. (No `components/` dir — `features/shared`→`components/` is a
  later slice, so no `components` rules are added this slice.)

### 3. Scoped dependency-cruiser rules (`visualization/.dependency-cruiser.js`) — at `warn`

Add the boundary rules from `Ideas/dependency-cruiser.2.0.cjs` that reference dirs existing this slice,
**alongside** the current `features/` rules (do not replace the file). All at `severity: "warn"`
(non-blocking while dirs are under construction); step 7 flips the **7 lens-internal** rules to `error`
and **keeps `metrics-lens-ngrx-guard` + `new-must-not-import-legacy` at `warn`** (documented temporary
bridges). Enumerate them so step 7 can flip-or-keep each one explicitly:

- `lens-no-ui-dependency`
- `lens-cross-lens-only-via-facade`
- `lens-external-access-only-via-public-surface`
- `lens-feature-cross-only-via-public-api`
- `feature-components-go-through-services`
- `feature-services-read-repos-not-store`
- `filestore-has-no-upward-deps`
- **`metrics-lens-ngrx-guard`** (new, staged here at `warn`): lens code may import `@ngrx/store` only
  from `lenses/[^/]+/(repos|store)/` (or `lenses/[^/]+/features/[^/]+/(stores|selectors)/`). Staged now so
  step 7 only *flips* it (never jumps straight to `error`).
- **`new-must-not-import-legacy`** (migration boundary, staged at `warn`): the **new** structure
  (`lenses/`, `fileStore/`; later `renderers`/`shell`/`interaction`/`appearance`/`components`) must not
  import the **legacy** `features/` or `state/`. Kept at `warn` this slice because real transitional edges
  exist: the legend's `features/sidebarInspector/facade` import, `errorDialog` from
  `features/shared/components/`, `fileStore`'s `loadInitialFile` dispatching into `state/store/*`, and the
  metrics store reading `blacklistMatcherSelector` from `state/`. It flips to `error` only when `state/`
  becomes `interaction`/`appearance` and the inspector dependency relocates. **`util/` + `model/` are the
  shared kernel — exempt** (both worlds import them). *The reverse direction* (legacy → new) is the
  migration mechanism (legacy consumers read the new lens facade) and is **allowed**, already governed by
  `lens-external-access-only-via-public-surface`.

**Explicitly NOT this slice:** all `renderers/*` + `page-uses-engine-public-api`, `shared-state-is-leaf`,
`components-are-dumb-primitives` (no `components/` dir), and the broad
`only-state-holders-import-ngrx-store` (it has no `features/` exemption → would break every existing
`features/*/stores`). Keep the existing `feature-only-stores-can-import-ngrx-store` and
`wire-dto-only-in-serialization-boundary` untouched (fileStore is not a loader until step 3; the new
`model/` types must not import `codeCharta.api.model.ts`, which that rule already enforces).

## Steps

- [x] Complete Task 1: add `model/ccjson2.model.ts` cc.json 2.0 domain types (reusing domain enums)
- [x] Complete Task 2: create empty `fileStore/` and `lenses/metrics/{repos,store,features}` (`.gitkeep`)
- [x] Complete Task 3: add the 9 scoped dep-cruiser rules (incl. `metrics-lens-ngrx-guard` + `new-must-not-import-legacy`) at `warn`
- [x] Verify: `npx tsc -p tsconfig.json --noEmit` (from `visualization/`); `npm run lint:architecture` (no new `error`); `npm run format` **from the repo root** (biome lives in root `package.json`, not `visualization/`)

## Review Feedback Addressed

1. **NodeId dropped (C3)**: removed the `nodeId.ts` sha-256 port and the `js-sha256` dep. Slice 1 uses
   the string `id` from the file; the type source is `model/ccjson2.model.ts` only (step 2 reuses it).
2. **dep-cruiser staging (C4)**: enumerated all 8 warn rules including `lens-no-ui-dependency`, staged
   the new `metrics-lens-ngrx-guard` at `warn`, and dropped the `components-are-dumb-primitives` rule
   (no `components/` dir this slice) so step 1 and step 7 agree on scope.
3. **Descriptor/list-value fidelity**: documented the dropped `analyzers` field and the `number[]`
   attribute path so step 2 handles them.
4. **Verification (C7)**: `npm run format` runs from the repo root, not `visualization/`.

## Notes

- **Tidy First:** entirely structural — new pure types, empty dirs, additive `warn` lint rules; no
  existing file's runtime behavior changes. Commit as one structural unit.
- **Join key = the string `id`** carried in `files[]`/`lenses.metrics.attributes` (computed upstream by
  `analysis/.../NodeId.kt`). The viz never recomputes it.
- `model/ccjson2.model.ts` is an orphan until step 2 imports it; `no-orphans` is `info`, so lint stays
  green (it reports the file at info level only).
- The 2.0 reference shape lives at the **repo root**: `dev_docs/cc-json-2.0.schema.json` +
  `dev_docs/cc-json-2.0-format.md` (one level above `visualization/`, a sibling of it).
- **Rollback:** purely additive (new files, empty dirs, additive `warn` rules) — `git revert` the
  single structural commit; zero runtime impact.
