/**
 * Public surface of the structure lens — the ONLY thing outsiders import (`store/` stays private,
 * enforced by `lens-external-access-only-via-public-surface`). The structure lens is a read-only
 * projection of the cc.json `files`: it owns the unified file tree. The metrics lens owns node
 * metrics, the dependency lens owns edge metrics; this lens owns the STRUCTURE they hang off.
 *
 * Slice 14d extracted the undecorated-tree build (previously inlined in `accumulatedData`) here so
 * `accumulatedData` becomes a pure composing selector above the lenses — it reads `structureTree`
 * downward, then layers metrics + blacklist + aggregation on a clone. `id -> node` resolution lives in
 * renderModel (`idToNode.selector`), keyed on the ids of that already-decorated tree, so this lens no
 * longer re-derives them from a second clone + structure pass.
 */
export { structureTreeSelector } from "./store/structureTree.selector"
