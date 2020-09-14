import { getUpdatedPath } from "../../../../util/nodePathHelper"
import { CCFile, Edge } from "../../../../codeCharta.model"

export function getMergedEdges(inputFiles: CCFile[], withUpdatedPath: boolean) {
	const edges: Map<string, Edge> = new Map()

	if (inputFiles.length === 1) {
		return inputFiles[0].settings.fileSettings.edges
	}

	for (const inputFile of inputFiles) {
		if (inputFile.settings.fileSettings.edges) {
			for (const oldEdge of inputFile.settings.fileSettings.edges) {
				const edge: Edge = {
					fromNodeName: withUpdatedPath
						? getUpdatedPath(inputFile.fileMeta.fileName, oldEdge.fromNodeName)
						: oldEdge.fromNodeName,
					toNodeName: withUpdatedPath ? getUpdatedPath(inputFile.fileMeta.fileName, oldEdge.toNodeName) : oldEdge.toNodeName,
					attributes: oldEdge.attributes,
					visible: oldEdge.visible
				}
				const equalEdgeItem = edges.get(`${edge.fromNodeName}|${edge.toNodeName}`)

				if (equalEdgeItem !== undefined) {
					for (const key of Object.keys(edge.attributes)) {
						equalEdgeItem.attributes[key] = edge.attributes[key]
					}
				} else {
					edges.set(`${edge.fromNodeName}|${edge.toNodeName}`, edge)
				}
			}
		}
	}
	return [...edges.values()]
}
