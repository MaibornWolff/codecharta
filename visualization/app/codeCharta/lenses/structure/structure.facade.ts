/**
 * Public surface of the structure lens — the ONLY thing outsiders import (`store/` stays private,
 * enforced by `lens-external-access-only-via-public-surface`). The structure lens is a read-only
 * projection of the cc.json `files`: it owns the unified file tree. The metrics lens owns node
 * metrics, the dependency lens owns edge metrics; this lens owns the STRUCTURE they hang off.
 *
 * Slice 14d extracted the undecorated-tree build (previously inlined in `accumulatedData`) here so
 * `accumulatedData` becomes a pure composing selector above the lenses — it reads `structureTree`
 * downward, then layers metrics + blacklist + aggregation on a clone. Slice 14e-3 added ownership of
 * `id -> node` resolution (`idToNodeSelector`): the lens runs the deterministic, view-state-independent
 * structure pass (id + mergeFolderChain) on its own undecorated tree, so it resolves nodes for the
 * highlight consumers without reaching up to the composing layer — the structural break of CF #1.
 */
export { structureTreeSelector } from "./store/structureTree.selector"
export { idToNodeSelector } from "./store/idToNode.selector"
