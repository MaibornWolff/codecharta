import { createSelector } from "@ngrx/store"
import { hierarchy } from "d3-hierarchy"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { clone } from "../../../util/clone"
import { isLeaf } from "../../../util/codeMapHelper"
import { UNARY_METRIC } from "../../../util/metric/unaryMetric"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { structureTreeSelector } from "./structureTree.selector"

// The tree as the loaded files describe it: stable ids, merged folder chains and file counts, but
// none of the map's view state. Views that must not inherit the map's blacklist read this instead of
// the decorated render model.
export const viewIndependentTreeSelector = createSelector(structureTreeSelector, structureTree => {
    if (!structureTree?.map) {
        return undefined
    }
    const { map } = clone(structureTree)
    NodeDecorator.decorateMapWithStructure(map)
    decorateWithFileCounts(map)
    return map
})

function decorateWithFileCounts(map: CodeMapNode) {
    const root = hierarchy(map)
    for (const { data } of root) {
        data.attributes ??= {}
        data.attributes[UNARY_METRIC] = isLeaf(data) ? 1 : 0
    }
    root.eachAfter(({ data, parent }) => {
        if (parent) {
            parent.data.attributes[UNARY_METRIC] += data.attributes[UNARY_METRIC]
        }
    })
}
