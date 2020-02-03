import { CCFile, Edge } from "../../../../codeCharta.model"
import { getUpdatedPath } from "../../../../util/nodePathHelper"

export function getMergedEdges(inputFiles: CCFile[], withUpdatedPath: boolean): Edge[] {
	let edges: Edge[] = []

	if (inputFiles.length == 1) {
		return inputFiles[0].settings.fileSettings.edges
	}

	for (let inputFile of inputFiles) {
		if (inputFile.settings.fileSettings.edges) {
			for (let oldEdge of inputFile.settings.fileSettings.edges) {
				let edge: Edge = {
					fromNodeName: withUpdatedPath
						? getUpdatedPath(inputFile.fileMeta.fileName, oldEdge.fromNodeName)
						: oldEdge.fromNodeName,
					toNodeName: withUpdatedPath ? getUpdatedPath(inputFile.fileMeta.fileName, oldEdge.toNodeName) : oldEdge.toNodeName,
					attributes: oldEdge.attributes,
					visible: oldEdge.visible
				}
				const equalEdgeItem = edges.find(e => e.fromNodeName == edge.fromNodeName && e.toNodeName == edge.toNodeName)

				if (equalEdgeItem) {
					for (let key in edge.attributes) {
						equalEdgeItem.attributes[key] = edge.attributes[key]
					}
				} else {
					edges.push(edge)
				}
			}
		}
	}

	return edges
}
