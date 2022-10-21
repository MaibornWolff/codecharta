"use strict"

import { Node } from "../../../../codeCharta.model"

const FOLDER_LABEL_TOO_SMALL_PARENT = 0.09

const FOLDER_LABEL_TOO_SMALL_ROOT = 0.009

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

	static isLabelNode(node: Node, parentNode: Node, rootNode: Node) {
		return (
			!node.isLeaf &&
			node.mapNodeDepth < 3 &&
			(parentNode === undefined || node.width / parentNode.width > FOLDER_LABEL_TOO_SMALL_PARENT) &&
			(rootNode === undefined || node.width / rootNode.width > FOLDER_LABEL_TOO_SMALL_ROOT)
		)
	}
}
