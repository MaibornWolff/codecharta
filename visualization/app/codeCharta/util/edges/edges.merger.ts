import { CCFile, Edge } from "../../model/codeCharta.model"
import { clone } from "../../util/clone"
import { getUpdatedPath } from "../../util/nodePathHelper"

export function getMergedEdges(inputFiles: CCFile[], withUpdatedPath: boolean) {
    const edges: Map<string, Edge> = new Map()

    if (inputFiles.length === 1) {
        return inputFiles[0].settings.fileSettings.edges
    }

    for (const inputFile of inputFiles) {
        for (const oldEdge of inputFile.settings.fileSettings.edges ?? []) {
            const edge = copyEdge(oldEdge, inputFile.fileMeta.fileName, withUpdatedPath)
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
    return [...edges.values()]
}

function copyEdge(edge: Edge, fileName: string, withUpdatedPath: boolean): Edge {
    return {
        fromNodeName: withUpdatedPath ? getUpdatedPath(fileName, edge.fromNodeName) : edge.fromNodeName,
        toNodeName: withUpdatedPath ? getUpdatedPath(fileName, edge.toNodeName) : edge.toNodeName,
        attributes: clone(edge.attributes),
        visible: edge.visible
    }
}
