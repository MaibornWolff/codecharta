"use strict"

import { Node } from "../../../model/codeCharta.model"
import { HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDARY } from "../algorithm/treeMapLayout/treeMapGenerator"

export class FloorLabelHelper {
    static isLabelNode(node: Node) {
        return !node.isLeaf && node.mapNodeDepth < HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDARY
    }
}
