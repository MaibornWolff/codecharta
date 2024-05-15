import Strip from "./strip"
import Rectangle from "../rectangle"
import { Vector2 } from "three"
import { CodeMapNode } from "../../../../codeCharta.model"

export enum VerticalOrder {
    topToBottom,
    bottomToTop
}

export default class VerticalStrip extends Strip {
    constructor(nodes: CodeMapNode[]) {
        super(nodes)
    }

    layout(
        rect: Rectangle,
        rootSize: number,
        metricName: string,
        currentTreemapDepth: number,
        margin: number,
        order: VerticalOrder = VerticalOrder.topToBottom
    ): CodeMapNode[] {
        let offsetY = rect.topLeft.y

        if (order !== VerticalOrder.topToBottom) {
            this.nodes.reverse()
        }
        const nodes = this.nodes
        const rootArea = rect.area()
        const height = rect.height
        const width = this.totalScaledSize(nodes, metricName, rootSize, rootArea) / height
        const stripNodes: CodeMapNode[] = []

        for (const node of nodes) {
            const nodeSize = this.scaledSize(node, rootSize, rootArea, metricName)
            const nodeHeight = width > 0 ? nodeSize / width : 0
            const newRect = new Rectangle(new Vector2(rect.topLeft.x, offsetY), width, nodeHeight)
            stripNodes.push({
                ...node,
                value: node.type === "File" ? rootSize : 0,
                rect: this.applyNodeMargin(newRect, margin),
                zOffset: currentTreemapDepth
            })
            offsetY += nodeHeight
        }
        return stripNodes
    }

    worstAspectRatio(nodes: CodeMapNode[], rect: Rectangle, rootSize: number, metricName: string): number {
        const height = rect.height
        const rootArea = rect.area()
        const totalSize = this.totalScaledSize(nodes, metricName, rootSize, rootArea)
        const stripMin = this.min(nodes, metricName, rootSize, rootArea)
        const stripMax = this.max(nodes, metricName, rootSize, rootArea)

        const heightSquared = height ** 2
        const totalSizeSquared = totalSize ** 2

        return Math.max((heightSquared * stripMax) / totalSizeSquared, totalSizeSquared / (heightSquared * stripMin))
    }
}
