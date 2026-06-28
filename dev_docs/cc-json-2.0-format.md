# cc.json 2.0 — `{ meta, files, lenses }`

> Status: **implemented on the analysis (`ccsh`) side.** `ccsh` emits 2.0 only; the whole pipeline reads
> 2.0 only, and the legacy 1.x format is read solely by `ccsh convert` (which upgrades it). The
> visualization still consumes 1.5 and migrates in its own story. See
> [ADR 12](adr/2026-06-25-ADR_12_separate_file_structure_from_analysis_lenses.md).
>
> **Machine-readable schema:** [`cc-json-2.0.schema.json`](cc-json-2.0.schema.json) (JSON Schema draft-07).
> `ccsh check` validates against the bundled copy in `ValidationTool`; a drift-guard test keeps the two in sync.

## Why

The 1.5 format conflated three concerns: file **identity**, analysis **signals** (metrics, edges),
and visualization **view state** (blacklist). Identity was *positional* — merge matched nodes by
walking the tree from the root down — so heterogeneous tools that root their trees differently (a
backend and a frontend built separately, or a coverage report rooted by package) never lined up.
2.0 splits structure from signals and makes identity reproducible, so additive suite lenses
(dependency, domain, security, …) can join the file tree without bloating the core.

## Shape

```json
{
  "meta": { "projectName": "p", "apiVersion": "2.0", "checksum": "<md5 of files+lenses>", "commitHash": "a1b2c3d" },
  "files": [
    { "id": "<sha256(/)[:16]>", "name": "root", "type": "Folder", "children": [
      { "id": "<sha256(/src)[:16]>", "name": "src", "type": "Folder", "children": [
        { "id": "<sha256(/src/App.kt)[:16]>", "name": "App.kt", "type": "File", "contentHash": "<xxhash64>" }
      ] }
    ] }
  ],
  "lenses": {
    "metrics":    { "attributes": { "<id>": { "rloc": 120, "mcc": 8 } }, "attributeDescriptors": {}, "attributeTypes": {}, "clusters": [] },
    "dependency": { "edges": [ { "fromId": "<id>", "toId": "<id>", "attributes": { "pairingRate": 42 } } ], "attributeTypes": {}, "attributeDescriptors": {} },
    "domain":     {},
    "security":   {}
  }
}
```

- **`files`** is the identity layer: exactly one root folder, nested `children`, each node carrying a
  stable `id` and an optional `contentHash`. No metrics live on the node.
- **`lenses`** are additive overlays joined to `files` by `id`. `metrics` and `dependency` are
  concrete; `domain` and `security` are reserved. **Unknown top-level lenses are preserved verbatim**
  on round-trip, so a newer tool's lens survives an older tool.
- **`meta.checksum`** is an MD5 over the serialized `files` + `lenses` payload (folded into `meta`,
  unlike the 1.5 `{ checksum, data }` wrapper). `commitHash` is an optional short git SHA.

## Identity: the `id` and the canonical path

A node's `id` is the first **16 hex chars** of `sha-256(canonicalPath)`, computed by the single
`NodeId` owner in `model`. The canonical path is the node's **tree position**:

- segments are the names from the root's children down — **`root` is excluded**;
- `/`-separated and prefixed with `/` (the root itself canonicalizes to `"/"`);
- empty segments dropped, `.` removed, `..` collapsed;
- **Unicode NFC-normalized** (macOS stores NFD, Linux NFC — without this the same file hashes
  differently across operating systems);
- **case preserved**.

`NodeId.fromEndpoint("/root/src/App.kt")` strips the synthetic `root` and applies the same rules, so
an edge endpoint and the file node it points at always resolve to the same `id`.

**What the `id` can and cannot promise.** The canonicalizer removes *spurious* divergence (separator,
root name, leading slash, `.`/`..`, Unicode form, trailing slash): the same tree position ⇒ the same
`id` everywhere. It deliberately does **not** reconcile *semantic* divergence — a tool that genuinely
roots the tree at a different depth gives a file a different logical path and therefore a different
`id`. Aligning differently-rooted trees is the merge resolver's job, not the hash's.

**`contentHash`** is the existing per-file checksum (`ChecksumCalculator`, XXHash64) that already
backs the `--base-file` incremental feature. It is a *matching signal*, never the identity, so two
files with identical content (e.g. duplicated `README`) keep distinct `id`s.

## Merge resolver

Merge is a resolver, not positional name-walking. For each incoming leaf it tries, in order:

1. **exact `id`** (same tree position),
2. **unique content hash** (a rename: same `contentHash`, matched only if that hash is unique in the
   reference),
3. **longest path-suffix** (differently-rooted trees),
4. otherwise **keep + warn** (kept only with `-a`/`--add-missing`, else dropped with a warning).

Ambiguous content or suffix matches are skipped, never guessed. The union (recursive) mode keeps the
same-rooting union of all inputs. Each lens owns its own `merge()`, so attribute types/descriptors
combine consistently regardless of which tool produced them.

## Converting and reading

- `ccsh` emits 2.0 only — there is no 1.5 writer.
- Every command reads 2.0 only. Feeding a legacy 1.x file to `merge`/`modify`/`edgefilter`/`inspect`/an
  importer reports that the file is legacy and points at `ccsh convert`. Only `ccsh convert` reads 1.x.
- `ccsh convert <file> [-o out]` upgrades a 1.x (or 2.0) file to 2.0 — the one on-ramp for legacy files.
- `ccsh check <file>` validates either format (the everit schema still accepts both via `anyOf`; the 2.0
  branch is strict — `apiVersion` pinned, exactly one root, no unknown keys).

## What left the format

`blacklist` and `markedPackages` are visualization view state and are **not** in 2.0. `blacklist`
remains on the analysis domain as a filter-time concept (MergeFilter dedup, StructureModifier and
LargeMerge path rewrites); a project read from 2.0 carries an empty blacklist.

## Known limitations (analysis-first staging)

These are deliberate gaps while 2.0 is analysis-only — see `plans/2026-06-26-ccjson-2-deferred-gaps.md`:

- **No 1.5 output / the visualization can't read 2.0 yet.** `ccsh` emits 2.0 by default and there is
  no CLI flag to emit 1.5. The shipped visualization still parses 1.5 only, so a 2.0 file produced by
  `ccsh` cannot be opened in the current visualization. The visualization migrates in its own story.
- **Cross-tool / cross-repo joins need `--leaf`.** The *default* merge is recursive/union, which
  matches purely by tree position and name — differently-rooted trees (e.g. a Sonar import vs a parser
  scan, or two repos) are placed side-by-side, not joined. The content-hash / longest-suffix
  reconciliation that aligns differently-rooted files lives only in the `--leaf` (overlay) strategy,
  and the content-hash bridge requires content-reading producers (UnifiedParser / RawTextParser).
- **`blacklist` does not survive 1.5 → 2.0 conversion.** Converting a 1.5 file with a non-empty
  blacklist to 2.0 silently drops it (it is not on the 2.0 wire), with no path back.

## Where the wire shape lives (single source of truth)

All wire/identity/merge logic lives once in `model`/`serialization`; every parser/importer/filter
*calls* it and never re-implements it:

- `NodeId` — the only builder of a canonical path or `id`.
- `ChecksumCalculator` — the only content-hash routine.
- `CcJsonV2` DTO + `ProjectToCcJsonV2Mapper` / `CcJsonV2ToProjectMapper` — the only code that knows
  the 2.0 wire shape. (`ProjectToCcJson15Mapper` is the explicit 1.5 writer.)
- `MergeResolverStrategy` — the only place node matching happens.
- `Lens.merge()` per lens — the only place a lens's data is combined.
