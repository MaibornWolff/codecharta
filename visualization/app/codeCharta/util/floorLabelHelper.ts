"use strict"

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
}
