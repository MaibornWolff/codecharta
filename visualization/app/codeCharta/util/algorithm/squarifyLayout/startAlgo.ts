import { CodeMapNode, CcState } from "../../../codeCharta.model"
import { getMapResolutionScaleFactor } from "../../codeMapHelper"
import { squarify, SquarifyNode } from "./squarify"
import { LayoutNode } from "../layoutNode"

function convertToSquarifyNode(node: CodeMapNode, areaMetric: string): SquarifyNode {
    return {
        name: node.name,
        value: node.attributes?.[areaMetric],
        children: node.children?.map(child => convertToSquarifyNode(child, areaMetric)).filter(x => x !== null),
        attributes: node.attributes
    }
}

function convertToLayoutNode(node: SquarifyNode, depth: number, parentX: number, parentY: number): LayoutNode {
    const isLeaf = !node.children || node.children.length === 0
    const width = node.x1 - node.x0
    const length = node.y1 - node.y0

    const layoutNode = new LayoutNode(node.name, width, length, depth, isLeaf, node.attributes)
    layoutNode.relativeX = node.x0 - parentX
    layoutNode.relativeY = node.y0 - parentY

    if (!isLeaf) {
        layoutNode.children = node.children.map(child => convertToLayoutNode(child, depth + 1, node.x0, node.y0))
    }

    return layoutNode
}
export function generateSquarifyLayoutNodes(map: CodeMapNode, state: CcState, aimedRatio: number): LayoutNode {
    const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)

    const squarifyNode = convertToSquarifyNode(map, state.dynamicSettings.areaMetric)

    const width = Math.sqrt(squarifyNode.value) * mapSizeResolutionScaling
    squarifyNode.x0 = 0
    squarifyNode.y0 = 0
    squarifyNode.x1 = width
    squarifyNode.y1 = width

    squarify(squarifyNode, aimedRatio)

    return convertToLayoutNode(squarifyNode, 0, 0, 0)
}
