import { createSelector } from "@ngrx/store"
import { hierarchy } from "d3-hierarchy"
import { CCFile, CodeMapNode } from "../../../codeCharta.model"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { clone } from "../../../util/clone"
import { structureTreeSelector } from "./structureTree.selector"

/**
 * The structure lens's `id -> node` resolution (Slice 14e-3). It runs the deterministic,
 * view-state-independent structure pass (id assignment + mergeFolderChain) on a CLONE of the lens's
 * own undecorated tree and indexes the result by ordinal id. Because the ids and merged shape are
 * deterministic, this map matches the composing layer's fully-decorated tree exactly — yet it needs
 * neither the blacklist/metric decoration nor `accumulatedData`, so the structure lens owns it without
 * a `lenses/ -> state/` edge. That is the structural break of CF #1: the highlight consumers (hover /
 * constant-highlight) that only read `.id` + child structure now resolve nodes through the lens, and
 * no lens ever reaches back up to the composing layer.
 *
 * The clone is mandatory: `structureTreeSelector` is memoized, so its CCFile instance is shared across
 * recomputes and must never be mutated in place (the structure pass mutates id/name/path/children).
 */
export const _calculateIdToNode = (structureTree: CCFile | undefined): Map<number, CodeMapNode> => {
    if (!structureTree?.map) {
        return new Map()
    }

    const map = clone(structureTree.map)
    NodeDecorator.decorateMapWithStructure(map)

    const idToNode = new Map<number, CodeMapNode>()
    for (const { data } of hierarchy(map)) {
        idToNode.set(data.id, data)
    }
    return idToNode
}

export const idToNodeSelector = createSelector(structureTreeSelector, _calculateIdToNode)
