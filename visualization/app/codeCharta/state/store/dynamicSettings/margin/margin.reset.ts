import { CodeMapNode } from "../../../../codeCharta.model"
import { hierarchy, HierarchyNode } from "d3-hierarchy"

const MIN_MARGIN = 15
const MAX_MARGIN = 100
const MARGIN_FACTOR = 4

export function getResetMargin(dynamicMargin: boolean, map: CodeMapNode, areaMetric: string): number {
	if (dynamicMargin && map) {
		return calculateMargin(map, areaMetric)
	}
}

function calculateMargin(map: CodeMapNode, areaMetric: string): number {
	let leaves = hierarchy<CodeMapNode>(map).leaves()
	let numberOfBuildings = 0
	let totalArea = 0

	leaves.forEach((node: HierarchyNode<CodeMapNode>) => {
		numberOfBuildings++
		if (node.data.attributes && node.data.attributes[areaMetric]) {
			totalArea += node.data.attributes[areaMetric]
		}
	})

	let margin: number = MARGIN_FACTOR * Math.round(Math.sqrt(totalArea / numberOfBuildings))
	return Math.min(MAX_MARGIN, Math.max(MIN_MARGIN, margin))
}
