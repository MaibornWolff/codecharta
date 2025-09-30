import * as d3 from "d3"
import { CcState, CodeMapNode } from "../../../codeCharta.model"
import { LayoutNode } from "../layoutNode"

type PackedNode = d3.HierarchyCircularNode<CodeMapNode>

export function generateCirclePacking(codeMapNode: CodeMapNode, state: CcState): LayoutNode {
    const areaMetric = state.dynamicSettings.areaMetric
    const margin = state.dynamicSettings.margin

    const root = d3.hierarchy(codeMapNode).sum(d => d.attributes[areaMetric])
    const width = 1000
    const height = 1000

    const packedRoot = d3.pack<CodeMapNode>().size([width, height]).padding(margin)(root) as PackedNode

    const layoutNode = new LayoutNode(packedRoot.data.name, packedRoot.r, packedRoot.r, 0, false, packedRoot.data.attributes)

    function createChildNodes(children: PackedNode[], depth: number, parentX: number, parentY: number): LayoutNode[] {
        if (!children || children.length === 0) {
            return []
        }

        return children.map(child => {
            const childNode = new LayoutNode(child.data.name, child.r, child.r, depth, !child.children, child.data.attributes)
            childNode.relativeX = child.x - parentX
            childNode.relativeY = child.y - parentY
            childNode.children = createChildNodes(child.children, depth + 1, child.x, child.y)
            return childNode
        })
    }

    layoutNode.relativeX = packedRoot.x
    layoutNode.relativeY = packedRoot.y
    layoutNode.children = createChildNodes(packedRoot.children, 1, packedRoot.x, packedRoot.y)

    return layoutNode
}
