import { createSelector } from "@ngrx/store"
import { hierarchy } from "d3-hierarchy"
import { structureTreeSelector } from "../../../lenses/structure/structure.facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"

/**
 * The files as they came out of the cc.json, before NodeDecorator defaults absent metrics to 0.
 * Metric rules are evaluated at that same point, so every count and distribution shown in the UI
 * has to be read from here — decorated leaves can no longer tell "has no mcc" from "mcc is 0".
 */
export const metricRuleLeavesSelector = createSelector(structureTreeSelector, structureTree => {
    if (!structureTree?.map) {
        return [] as CodeMapNode[]
    }
    return hierarchy(structureTree.map)
        .descendants()
        .map(({ data }) => data)
        .filter(node => isLeaf(node))
})
