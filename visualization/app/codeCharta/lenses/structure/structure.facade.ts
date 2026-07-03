/**
 * Public surface of the structure lens — the ONLY thing outsiders import (`store/` stays private,
 * enforced by `lens-external-access-only-via-public-surface`). The structure lens is a read-only
 * projection of the cc.json `files`: it owns the unified file tree. The metrics lens owns node
 * metrics, the dependency lens owns edge metrics; this lens owns the STRUCTURE they hang off.
 *
 * Slice 14d extracted the undecorated-tree build (previously inlined in `accumulatedData`) here so
 * `accumulatedData` becomes a pure composing selector above the lenses — it reads `structureTree`
 * downward, then layers metrics + blacklist + aggregation on a clone. Ownership of `id -> node`
 * resolution (which today needs the decoration-time ordinal id) follows in Slice 14e once the
 * renderer-agnostic PATH id survives load, giving the lens a decoration-independent id to key on.
 */
export { structureTreeSelector } from "./store/structureTree.selector"
