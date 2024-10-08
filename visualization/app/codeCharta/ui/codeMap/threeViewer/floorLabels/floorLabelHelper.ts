"use strict"

import { Node } from "../../../../codeCharta.model"
import { HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDRY } from "../../../../util/algorithm/treeMapLayout/treeMapGenerator"

export class FloorLabelHelper {
    static getMapResolutionScaling(mapWidth: number) {
        const { width: displayWidth } = <HTMLCanvasElement>document.getElementById("codeMapScene")

        const scalingThreshold = FloorLabelHelper.getScalingThreshold(displayWidth)

        return mapWidth > scalingThreshold ? scalingThreshold / mapWidth : 1
    }

    private static getScalingThreshold(displayWidth: number) {
        const fullHdPlusWidth = 2560
        return Math.min(displayWidth * 4, fullHdPlusWidth * 4)
    }

    static isLabelNode(node: Node) {
        return !node.isLeaf && node.mapNodeDepth < HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDRY
    }
}
