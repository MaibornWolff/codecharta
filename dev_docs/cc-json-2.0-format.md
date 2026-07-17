# cc.json 2.0 — `{ meta, files, lenses }`

> Status: **implemented on both the analysis (`ccsh`) and the visualization side.** `ccsh` emits 2.0
> only; every `ccsh` command reads 2.0, and the legacy 1.x format is read solely by `ccsh convert`
> (which upgrades it). The visualization reads 2.0 natively and still opens legacy 1.x files by
> normalizing them to 2.0 on load. See
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
    { "id": "<sha256(Folder/)[:16]>", "name": "root", "type": "Folder", "children": [
      { "id": "<sha256(Folder/src)[:16]>", "name": "src", "type": "Folder", "children": [
        { "id": "<sha256(File/src/App.kt)[:16]>", "name": "App.kt", "type": "File", "contentHash": "<xxhash64>" }
      ] }
    ] }
  ],
  "lenses": {
    "metrics":    { "attributes": { "<id>": { "rloc": 120, "mcc": 8 } }, "attributeDescriptors": {}, "attributeTypes": {} },
    "dependency": { "edges": [ { "fromId": "<id>", "toId": "<id>", "attributes": { "pairingRate": 42 } } ], "attributeTypes": {}, "attributeDescriptors": {} },
    "clusters":   { "clusterings": { "author-ownership": { "title": "Author ownership", "membership": "weighted", "weightBasis": "rloc", "analyzers": ["gitlogparser"], "clusters": [ { "id": "author-a", "name": "Author A", "members": [ { "nodeId": "<id>", "weight": 0.62 } ] } ] } } },
    "domain":     {},
    "security":   {}
  }
}
```

- **`files`** is the identity layer: exactly one root folder, nested `children`, each node carrying a
  stable `id` and an optional `contentHash`. No metrics live on the node.
- **`lenses`** are additive overlays joined to `files` by `id`. `metrics` and `dependency` are
  concrete; `clusters` is optional and fully defined by the schema but has no producer or
  visualization support yet — see [the `clusters` lens](cc-json-2.0-clusters-lens.md) for its full
  definition and merge semantics; `domain` and `security` are reserved. **Unknown top-level lenses
  are preserved verbatim** on round-trip, so a newer tool's lens survives an older tool.
- **`meta.checksum`** is an MD5 over the serialized `files` + `lenses` payload (folded into `meta`,
  unlike the 1.5 `{ checksum, data }` wrapper). `commitHash` is an optional short git SHA.

## Identity: the `id` and the canonical path

A node's `id` is the first **16 hex chars** of `sha-256(type.name + canonicalPath)`, computed by the
single `NodeId` owner in `model`. The identity is the node's **tree position and its `NodeType`**. The
canonical path is the tree position:

- segments are the names from the root's children down — **`root` is excluded**;
- `/`-separated and prefixed with `/` (the root itself canonicalizes to `"/"`);
- empty segments dropped, `.` removed, `..` collapsed;
- **Unicode NFC-normalized** (macOS stores NFD, Linux NFC — without this the same file hashes
  differently across operating systems);
- **case preserved**.

The **type name is prepended** to the canonical path before hashing (`"File" + "/src/App.kt"`). This is
what lets a File and a Folder legally share a name under one parent without their `id`s colliding; the
preimage stays injective because a canonical path always begins with `/` and a `NodeType` name never
contains `/`. The type is mixed in only at the hash, never into the canonical path itself, which also
renders edge-endpoint strings and error messages.

`NodeId.fromEndpoint("/root/src/App.kt")` strips the synthetic `root` and applies the same rules; an
endpoint carries no type on the wire, so it defaults to **`File`** (a producer whose edge targets a
non-File node resolves that node's real type from the tree). An edge endpoint and the file node it
points at therefore resolve to the same `id`.

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

1. **exact `id`** (same tree position and type),
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
  branch is strict — `apiVersion` major 2, exactly one root, no unknown keys).

## Versioning & compatibility

2.x is **downward-compatible and additive-only**:

- **Readers accept any major-2 version**, not exactly `2.0`. `apiVersion` matches `^2\.\d+$` in the
  schema; the analysis reader and the viz both gate on the *major* being `2`.
- **Minors may only add.** A new minor (`2.1`, `2.2`, …) may introduce **optional** fields. Existing
  fields are never removed, renamed, or repurposed, and their types don't change. So the newest tools
  can always read every older 2.x file (**downward compatible**).
- **Not upward compatible — by design.** `additionalProperties: false` stays on every object, so an
  *older* tool meeting a *newer* file that uses a field it doesn't know cleanly **rejects** it rather
  than loading partial data. The fix is to update CodeCharta; there is no "load the newer file anyway"
  path. (A newer file that only bumped the version but added nothing still loads.)
- **Breaking change ⇒ new major (`3.0`).** The day a field must be removed or repurposed, that is a
  `3.0`, which major-2 tools reject.

Practical rule for contributors: to extend 2.x, add an **optional** field (or a whole new lens — the
`lenses` object already preserves unknown lenses verbatim) and bump the minor; never touch the meaning
of an existing field. When you add a field, update all three schema copies (this file's schema, the
viz-vendored `ccJson2Schema.json`, and the `ccsh check` `cc.json`) so `EveritValidatorTest` and the
viz drift guard stay green.

## What left the format

`blacklist` and `markedPackages` are visualization view state and are **not** in 2.0. `blacklist`
remains on the analysis domain as a filter-time concept (MergeFilter dedup, StructureModifier and
LargeMerge path rewrites); a project read from 2.0 carries an empty blacklist.

## Known limitations

These are deliberate gaps — see `plans/2026-06-26-ccjson-2-deferred-gaps.md`:

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
  the 2.0 wire shape. There is no 1.5 **writer**; legacy 1.x input is read only on the `ccsh convert`
  on-ramp and immediately upgraded to the domain model.
- `MergeResolverStrategy` — the only place node matching happens.
- `Lens.merge()` per lens — the only place a lens's data is combined.
