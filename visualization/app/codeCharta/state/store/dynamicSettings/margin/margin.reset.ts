import { CodeMapNode } from "../../../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"

const MIN_MARGIN = 15
const MAX_MARGIN = 100
const MARGIN_FACTOR = 4

export function getResetMargin(dynamicMargin: boolean, areaMetric: string, map?: CodeMapNode) {
	if (dynamicMargin && map) {
		return calculateMargin(map, areaMetric)
	}
	return 0
}

function calculateMargin(map: CodeMapNode, areaMetric: string) {
	let numberOfBuildings = 0
	let totalArea = 0

	for (const node of hierarchy(map)) {
		if (!node.children) {
			numberOfBuildings++
			if (node.data.attributes?.[areaMetric]) {
				totalArea += node.data.attributes[areaMetric]
			}
		}
	}

	const margin = MARGIN_FACTOR * Math.round(Math.sqrt(totalArea / numberOfBuildings))
	return Math.min(MAX_MARGIN, Math.max(MIN_MARGIN, margin))
}
