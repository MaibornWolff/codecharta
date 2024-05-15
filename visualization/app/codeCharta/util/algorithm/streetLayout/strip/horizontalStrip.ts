import Strip from "./strip"
import Rectangle from "../rectangle"
import { Vector2 } from "three"
import { CodeMapNode } from "../../../../codeCharta.model"

export enum HorizontalOrder {
    leftToRight,
    rightToLeft
}

export default class HorizontalStrip extends Strip {
    constructor(nodes: CodeMapNode[]) {
        super(nodes)
    }

    layout(
        rect: Rectangle,
        rootSize: number,
        metricName: string,
        currentTreemapDepth: number,
        margin: number,
        order: HorizontalOrder = HorizontalOrder.leftToRight
    ): CodeMapNode[] {
        let offsetX = rect.topLeft.x

        if (order !== HorizontalOrder.leftToRight) {
            this.nodes.reverse()
        }
        const nodes = this.nodes

        const rootArea = rect.area()
        const width = rect.width
        const height = this.totalScaledSize(nodes, metricName, rootSize, rootArea) / width
        const stripNodes: CodeMapNode[] = []

        for (const node of nodes) {
            const nodeSize = this.scaledSize(node, rootSize, rootArea, metricName)
            const nodeWidth = height > 0 ? nodeSize / height : 0
            const newRect = new Rectangle(new Vector2(offsetX, rect.topLeft.y), nodeWidth, height)
            stripNodes.push({
                ...node,
                value: node.type === "File" ? rootSize : 0,
                rect: this.applyNodeMargin(newRect, margin),
                zOffset: currentTreemapDepth
            })
            offsetX += nodeWidth
        }
        return stripNodes
    }

    worstAspectRatio(nodes: CodeMapNode[], rect: Rectangle, rootSize: number, metricName: string): number {
        const width = rect.width
        const rootArea = rect.area()
        const totalSize = this.totalScaledSize(nodes, metricName, rootSize, rootArea)
        const stripMin = this.min(nodes, metricName, rootSize, rootArea)
        const stripMax = this.max(nodes, metricName, rootSize, rootArea)
        const widthSquared = Math.pow(width, 2)
        const totalSizeSquared = Math.pow(totalSize, 2)

        return Math.max((widthSquared * stripMax) / totalSizeSquared, totalSizeSquared / (widthSquared * stripMin))
    }
}
