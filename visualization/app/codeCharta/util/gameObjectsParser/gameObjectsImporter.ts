import md5 from "md5"
import { AttributeTypes, AttributeTypeValue, CodeMapNode, Edge, FixedPosition, NodeType } from "../../codeCharta.model"
import { ExportWrappedCCFile } from "../../codeCharta.api.model"

export interface GameObject {
    name: string
    position: Coordinates
    scale: Coordinates
}

export interface Coordinates {
    x: number
    y: number
    z: number
}

export interface Cycle {
    from: string
    to: string
}

const BASE_NAME = "base"

export function parseGameObjectsFile(data): ExportWrappedCCFile {
    const { gameObjectPositions: gameObjects, cycles = [] } = JSON.parse(data)

    const codeChartaJson: ExportWrappedCCFile = {
        checksum: "",
        data: {
            projectName: "GameObjects",
            fileChecksum: "",
            apiVersion: "1.3",
            nodes: []
        }
    }

    const nodes = [{ name: BASE_NAME, type: NodeType.FOLDER, attributes: {}, children: [] }]
    fixGameObjectsNames(gameObjects)

    const rootGameObject = gameObjects.find(gameObject => gameObject.name === "root")
    const baseGameObject = createBaseGameObjectPosition(rootGameObject.scale)
    gameObjects.push(baseGameObject)

    for (const gameObject of gameObjects) {
        const nodeNames = gameObject.name.split(".")
        if (nodeNames[0] !== BASE_NAME) {
            addNodeRecursively(nodeNames, nodes[0].children, BASE_NAME, gameObject, gameObjects, rootGameObject)
        }
    }

    codeChartaJson.data.nodes = nodes
    codeChartaJson.data.edges = cycles.map(cycle => createEdge(cycle))
    codeChartaJson.data.attributeTypes = createAttributeTypes()
    codeChartaJson.checksum = md5(JSON.stringify(codeChartaJson.data))
    return codeChartaJson
}

function fixGameObjectsNames(gameObjects: GameObject[]) {
    for (const gameObject of gameObjects) {
        if (!gameObject.name.startsWith("root")) {
            gameObject.name = gameObject.name.startsWith(".") ? `root${gameObject.name}` : `root.${gameObject.name}`
        }
    }
}

function addNodeRecursively(
    nodeNames: string[],
    nodes: CodeMapNode[],
    parentNodeName: string,
    gameObject: GameObject,
    gameObjects: GameObject[],
    rootGameObject: GameObject
) {
    if (nodeNames.length === 0) {
        return
    }

    // get current node name and create cc node structure
    const [nodeName] = nodeNames
    let node: CodeMapNode = {
        name: nodeName,
        type: isFile(nodeNames) ? NodeType.FILE : NodeType.FOLDER,
        attributes: {}
    }

    if (isFile(nodeNames)) {
        node = wrapFileInAFolder(nodeName, node, gameObject)
    } else {
        node.children = []
    }

    if (nodeAlreadyExists(nodes, nodeName)) {
        node = nodes.find(singleNode => singleNode.name === nodeName)
    } else {
        nodes.push(node)
    }

    const parentGameObject = gameObjects.find(gameObject => gameObject.name === parentNodeName)
    node.fixedPosition = calculateFixedFolderPosition(node, parentGameObject, gameObject, rootGameObject.name)

    const newParentName = parentNodeName === BASE_NAME ? node.name : `${parentNodeName}.${node.name}`
    addNodeRecursively(nodeNames.slice(1), node.children, newParentName, gameObject, gameObjects, rootGameObject)
}

function isFile(names: string[]) {
    return names.length === 1
}

function nodeAlreadyExists(nodes: CodeMapNode[], name: string) {
    return nodes.some(singleNode => singleNode.name === name)
}

function wrapFileInAFolder(nodeName: string, node: CodeMapNode, gameObject: GameObject): CodeMapNode {
    const childNode = { ...node }
    childNode.attributes = { height: gameObject.scale.y }
    return { name: nodeName, type: NodeType.FOLDER, attributes: {}, children: [childNode] }
}

function calculateFixedFolderPosition(
    node: CodeMapNode,
    parentGameObject: GameObject,
    childGameObject: GameObject,
    rootGameObjectName: string
): FixedPosition {
    let position: FixedPosition

    if (node.type === NodeType.FOLDER) {
        // translate the center point from the middle of the gameObject to the corner (needed for fixedPosition)
        const cornerXofParent = parentGameObject.position.x - parentGameObject.scale.x / 2
        const cornerZofParent = parentGameObject.position.z - parentGameObject.scale.z / 2
        const cornerXofChild = childGameObject.position.x - childGameObject.scale.x / 2
        const cornerZofChild = childGameObject.position.z - childGameObject.scale.z / 2

        const top = round(((cornerXofChild - cornerXofParent) / parentGameObject.scale.x) * 100, 2)
        const left = round(((cornerZofChild - cornerZofParent) / parentGameObject.scale.z) * 100, 2)
        const width = round((childGameObject.scale.z / parentGameObject.scale.z) * 100, 2)
        const height = round((childGameObject.scale.x / parentGameObject.scale.x) * 100, 2)
        position = { left, top, width, height }
    }

    if (node.name === rootGameObjectName) {
        position = getCenteredRootPosition(position)
    }

    return position
}

function round(value: number, decimalPoints: number): number {
    const roundingValue = Math.pow(10, decimalPoints)
    return Math.round(value * roundingValue) / roundingValue
}

function getCenteredRootPosition(rootFixedPosition: FixedPosition): FixedPosition {
    const centeredPosition: FixedPosition = { ...rootFixedPosition }
    centeredPosition.top = Math.floor(50 - centeredPosition.height / 2)
    centeredPosition.left = Math.floor(50 - centeredPosition.width / 2)
    return centeredPosition
}

function wrapFilePath(filePath: string): string {
    const filePathWithSlash = filePath.replaceAll(".", "/")
    const splitFilePath = filePath.split(".")
    const fileName = splitFilePath.slice(-1)
    // add file name again to the end because the file has been wrapped in a folder. (with the same name)
    return `/${BASE_NAME}/${filePathWithSlash}/${fileName}`
}

function createEdge(cycle: Cycle): Edge {
    return {
        fromNodeName: wrapFilePath(cycle.from),
        toNodeName: wrapFilePath(cycle.to),
        attributes: {
            coupling: 100
        }
    }
}

function createAttributeTypes(): AttributeTypes {
    return {
        edges: {
            coupling: AttributeTypeValue.relative
        }
    }
}

function createBaseGameObjectPosition(rootGameObjectScale: Coordinates): GameObject {
    const longEdge = Math.max(rootGameObjectScale.x, rootGameObjectScale.z)
    return {
        name: BASE_NAME,
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        scale: {
            x: longEdge,
            y: 0,
            z: longEdge
        }
    }
}
