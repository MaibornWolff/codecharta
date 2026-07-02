---
name: ccjson-2-0-ingestion-reader-and-validator
issue:
state: complete
version: 2
---

## Goal

Make the visualization load **cc.json 2.0** (`{ meta, files, lenses }`) by auto-detecting the
`apiVersion` major in the existing `features/loadFile` pipeline, validating against the 2.0 JSON
Schema, and mapping into **today's** internal `CCFile` so the map renders identically. The 1.5 path
stays byte-for-byte unchanged; nothing downstream of `getCCFile` changes.

## Tasks

Scope guard (from `00-roadmap.md`): only ingestion. No FileStore/lens extraction, no new selectors;
`lenses.dependency.edges` is written into the existing `fileSettings.edges`. The 2.0 read types are
**reused from `model/ccjson2.model.ts` (step 1)** — do **not** declare a parallel type set.

Key shape facts (from the real files):
- Internal `CCFile` (`model/domain.model.ts`): `map: CodeMapNode` tree, `fileMeta`,
  `settings.fileSettings { attributeTypes, attributeDescriptors, blacklist, edges, markedPackages }`.
- Internal `Edge` uses **path** endpoints `fromNodeName`/`toNodeName` like `/root/Parent/leaf` — the
  node's `path` after `NodeDecorator.decorateMapWithPathAttribute` (runs in `fileParser.addFile`).
- The 2.0 string `FileNode.id` is the join key into `lenses.metrics.attributes[id]` and
  `lenses.dependency.edges[].fromId/toId`. **The viz never re-hashes** (Slice-1 decision): it maps each
  `id` → that node's `/root/...` path while walking the tree.
- The string `id` is consumed during ingestion only; it is **not** stored on `CodeMapNode`
  (`CodeMapNode.id` stays the numeric id `NodeDecorator` assigns later).
- Reference mapping authority: `analysis/.../serialization/CcJsonV2ToProjectMapper.kt`.

### 1. Version detection + `NameDataPair.content` union
- In `codeCharta.api.model.ts`: add `"2.0"` to `APIVersions`, and widen
  `NameDataPair.content` to `ExportCCFile | CcJson2` (importing `CcJson2` from `model/ccjson2.model.ts`
  — `api.model` → `model/` is a downward import and allowed; the existing
  `wire-dto-only-in-serialization-boundary` rule governs *who imports `api.model`*, not what it imports).
  Do not re-declare any 2.0 types here.
- Export `detectApiVersionMajor(content): number` in `fileValidator.ts` (reuse `getAsApiVersion`):
  `content?.meta?.apiVersion` → 2; else `content?.apiVersion` → 1.x major; else invalid.

### 2. Vendor the 2.0 JSON Schema (the default, not a fallback)
- The schema lives at the **repo root** `dev_docs/cc-json-2.0.schema.json` — one level above
  `visualization/` (a sibling of `visualization/`), outside the npm package, so a direct import would
  pull a repo-root file into the shipped bundle. **Vendor a copy** at `app/codeCharta/util/ccJson2Schema.json`
  and add a **drift-guard** spec asserting the copy deep-equals the source (the drift-guard reads the
  source at `../../../../dev_docs/cc-json-2.0.schema.json`; single source of truth stays in `dev_docs`,
  mirroring the analysis-side drift guard).
- Validate with the existing `Ajv({ allErrors: true, strict: false })` (ajv@8, draft-07 `if/then`+`const`).

### 3. Validate 2.0 in `fileValidator.ts` (branch by version, 1.5 untouched)
- `removeAuthorsAttributes`, `checkErrors`, `checkWarnings` branch on `detectApiVersionMajor`. Major 1 →
  existing path verbatim. Major 2 → `checkErrors2_0` (Ajv against the vendored schema + `getValidationMessage`,
  plus `FileNode.id` uniqueness across the tree, reusing the unique-walk idea). The schema's `const "2.0"`
  already rejects any other version, so a separate `checkWarnings2_0` is **omitted** (it would be dead code).
- `removeAuthorsAttributes` for 2.0 returns `[]` (authors are metric attributes in 2.0; out of scope).
- Signature ripple: `checkErrors`/`checkWarnings`/`removeAuthorsAttributes` are typed `(file: ExportCCFile)`
  today — widen their parameter to `ExportCCFile | CcJson2` (and narrow per branch); update the few callers.

### 4. Add the 2.0 → CCFile reader and wire it in
- New `features/loadFile/util/ccJson2/ccJson2ToCCFile.ts` `mapCcJson2ToCCFile(file: CcJson2, ndp): CCFile`:
  - `fileMeta`: `projectName`/`apiVersion`("2.0")/`fileChecksum`(`meta.checksum`) from `meta`;
    `exportedFileSize` from `ndp.fileSize`; `repoCreationDate: ""`. (`meta.commitHash` has no `FileMeta`
    home — ignore; note below.)
  - `map`: walk `files[0]` → `CodeMapNode { name, type, link, children }` with
    `attributes` = the **numeric-only** subset of `lenses.metrics?.attributes?.[node.id] ?? {}` (strip
    `number[]`/non-numeric values so `KeyValuePair`/metric math stay valid); build
    `idToPath[node.id] = parentPath + "/" + name` (root = `"/" + name`) in the same walk.
  - `settings.fileSettings`:
    - `attributeTypes = { nodes: lenses.metrics?.attributeTypes ?? {}, edges: lenses.dependency?.attributeTypes ?? {} }`
    - `attributeDescriptors` = merge of metrics+dependency descriptors mapped to today's `AttributeDescriptor`
      (known fields; `analyzers` dropped — note).
    - `edges` = `lenses.dependency?.edges` → `{ fromNodeName: idToPath[fromId], toNodeName: idToPath[toId],
      attributes }`; drop + `console.warn` on unresolved endpoints (mirrors the Kotlin mapper).
    - `blacklist: []`, `markedPackages: []`.
- Seams (do NOT convert before validation): `getCCFileAndDecorateFileChecksum` (`ccFileHelper.ts`) and
  `urlExtractor.ts` parse + detect; for 2.0 keep `{meta,files,lenses}` as `content`, set checksum
  (`meta.checksum ||= md5(...)`), **and read the name from `content.meta.projectName`** for 2.0 (the
  1.x `content.projectName` read in `urlExtractor.getFileName` is undefined for 2.0 — branch it).
  `getCCFile(file)` branches on version → `mapCcJson2ToCCFile` for 2.0, else the existing body.

### 5. Fixtures, tests, regression, and an automated 2.0 render proof
- Add a 2.0 fixture: a 2.0 twin of the canonical base sample (the base lives in
  `app/codeCharta/assets/sample1.cc.json`; `resources/` holds the `sample1_with_*` variants) →
  `app/codeCharta/assets/sample1.cc2.json` (+ a small mock in `mocks/` for unit specs). The twin's root
  `FileNode.name` must equal the 1.5 root name (`root`) — state this invariant; the edge/path parity
  test depends on it.
- TDD specs: `ccJson2ToCCFile.spec.ts` (attributes-by-id incl. a stripped `number[]`, edge id→path
  resolution + an unresolved-edge drop, node/edge type split, single root); `fileValidator` 2.0 branch;
  drift-guard spec.
- **Parity check**: assert the 2.0 twin produces the same `CCFile.map`/edges/types as the 1.5 sample.
- **Automated render proof (new)**: add an e2e spec **under `app/codeCharta/e2e/`** (the repo's Playwright
  suite — `npm run e2e`; specs live there, not scattered next to sources) that uploads the 2.0 fixture and
  asserts the map renders, plus a render-pipeline **unit** assertion that the decorated map from the 2.0
  twin equals the 1.5 sample — so "renders identically" is proven automatically, not only by a step-7
  manual smoke.

## Steps

- [x] Complete Task 1: `"2.0"` in `APIVersions`, widen `NameDataPair.content` (reuse `CcJson2`), `detectApiVersionMajor`
- [x] Complete Task 2: vendor `ccJson2Schema.json` + drift-guard spec
- [x] Complete Task 3: branch `fileValidator.ts` for 2.0 (schema + id-uniqueness); 1.5 untouched
- [x] Complete Task 4: `mapCcJson2ToCCFile` + wire detection into `ccFileHelper`/`urlExtractor` (+ 2.0 projectName) and `getCCFile`
- [x] Complete Task 5: 2.0 fixture/mock, unit specs, parity check, **e2e 2.0 render spec**, 1.5 specs green
- [x] Verify: `npm test` (unit), `npm run e2e` (2.0 upload renders), `npx tsc --noEmit` / `npm run build`

## Review Feedback Addressed

1. **Type duplication (C3)**: reuses `model/ccjson2.model.ts` for the parsed `CcJson2` content; no
   parallel `*2` types in `api.model.ts`. The viz never re-hashes ids (string `id` join key).
2. **Schema location (C5/should-fix)**: vendoring under `app/` + drift guard is the **default** (the
   schema is at the repo root, outside the package).
3. **Self-contradiction removed**: dropped the "confined to features/loadFile" wording — placement of
   the union on `api.model` is fine; the rule is about importers.
4. **`urlExtractor` projectName gap**: 2.0 name read from `meta.projectName`.
5. **List-valued attributes**: numeric-only subset materialised onto `CodeMapNode.attributes`.
6. **Dead `checkWarnings2_0` removed** (schema `const "2.0"`).
7. **Automated render proof added** (e2e + unit parity), not just a manual smoke.

## Notes
- **Tidy First (behavioral):** the 1.5 path is identical; every change is additive or a version branch.
  Commit (a) additive — schema vendor + drift guard; then (b) behavioral — validator branch + reader.
- Run viz tests with `dangerouslyDisableSandbox: true` (repo CLAUDE.md). The new 2.0 dep-cruiser rules
  are NOT enforced this slice (step 7).
- Known 2.0→1.x gaps (acceptable, samples won't use them): `meta.commitHash`, `AttributeDescriptor.analyzers`,
  and `number[]` attributes are dropped; `blacklist`/`markedPackages` → `[]`.
- `packageJson.codecharta.apiVersion` stays `1.5` (2.0 is detected via `meta.apiVersion`); revisit the
  advertised "latest apiVersion" in a later slice.
- **Rollback:** the design is branch-by-version with the 1.5 path untouched; revert the behavioral
  commit (validator branch + reader wiring) to fully disable 2.0 ingestion, keeping the additive schema
  vendor harmless.
