import { createSelector } from "@ngrx/store"
import { hierarchy } from "d3-hierarchy"
import { structureTreeSelector } from "../../../lenses/structure/structure.facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"

export const metricRuleLeavesSelector = createSelector(structureTreeSelector, structureTree => {
    if (!structureTree?.map) {
        return [] as CodeMapNode[]
    }
    return hierarchy(structureTree.map)
        .descendants()
        .map(({ data }) => data)
        .filter(node => isLeaf(node))
})
