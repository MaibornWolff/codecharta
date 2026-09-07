"use strict"

import { Node } from "../../../model/codeCharta.model"
import { HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDARY } from "../algorithm/treeMapLayout/treeMapGenerator"

export class FloorLabelHelper {
    /** One canvas of this edge per labelled folder level. Four times a phone's budgeted drawing
     * buffer is 6128, and three such canvases plus their textures is what makes iOS kill the tab. */
    static readonly MAX_LABEL_CANVAS_EDGE = 4096
    private static readonly SHARPNESS_FACTOR = 4

    static getMapResolutionScaling(mapWidth: number) {
        const { width: displayWidth } = <HTMLCanvasElement>document.getElementById("codeMapScene")

        const scalingThreshold = FloorLabelHelper.getScalingThreshold(displayWidth)

        return mapWidth > scalingThreshold ? scalingThreshold / mapWidth : 1
    }

    private static getScalingThreshold(displayWidth: number) {
        return Math.min(displayWidth * FloorLabelHelper.SHARPNESS_FACTOR, FloorLabelHelper.MAX_LABEL_CANVAS_EDGE)
    }

    static isLabelNode(node: Node) {
        return !node.isLeaf && node.mapNodeDepth < HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDARY
    }
}
