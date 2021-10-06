"use strict"

import { Node } from "../../../../codeCharta.model"

export class FloorLabelHelper {
	static getMapResolutionScaling(mapWidth: number) {
		const canvases = document.getElementsByTagName("canvas")
		const mapCanvas = canvases[canvases.length - 1]
		const displayWidth = mapCanvas.width

		const scalingThreshold = FloorLabelHelper.getScalingThreshold(displayWidth)

		// TODO should we scale by mapWidth only? What is happening for mobile devices?
		return mapWidth > scalingThreshold ? scalingThreshold / mapWidth : 1
	}

	private static getScalingThreshold(displayWidth: number) {
		const fullHdPlusWidth = 2560
		return Math.min(displayWidth * 4, fullHdPlusWidth * 4)
	}

	static isLabelNode(node: Node) {
		return !node.isLeaf && node.mapNodeDepth !== undefined && node.mapNodeDepth >= 0 && node.mapNodeDepth < 3
	}
}
