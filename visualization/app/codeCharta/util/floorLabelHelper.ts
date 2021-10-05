"use strict"
import { Node } from "../codeCharta.model"

export class FloorLabelCollector {
	private floorLabelMap = new Map([
		[0, []],
		[1, []],
		[2, []]
	])

	constructor(nodes: IterableIterator<Node>) {
		this.collect(nodes)
	}

	private collect(nodes: IterableIterator<Node>) {
		for (const node of nodes) {
			if (!node.isLeaf && node.mapNodeDepth !== undefined && node.mapNodeDepth >= 0 && node.mapNodeDepth < 3) {
				this.floorLabelMap.get(node.mapNodeDepth).push(node)
			}
		}
	}

	getLabeledFloorNodes() {
		return this.floorLabelMap
	}
}

export class FloorLabelHelper {
	static getMapResolutionScaling(mapWidth: number) {
		const canvases = document.getElementsByTagName("canvas")
		const mapCanvas = canvases[canvases.length - 1]
		const displayWidth = mapCanvas.width

		const scalingThreshold = FloorLabelHelper.getScalingThreshold(displayWidth)

		// TODO should we scale by mapWidth only?
		if (mapWidth >= scalingThreshold) {
			return scalingThreshold / mapWidth
		}

		return 1
	}

	private static getScalingThreshold(displayWidth: number) {
		const fullHdPlusWidth = 2560
		return Math.min(displayWidth * 4, fullHdPlusWidth * 4)
	}

	static getFloorSurfaceInformation
}
