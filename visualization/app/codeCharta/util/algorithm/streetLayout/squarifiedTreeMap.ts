import Treemap from "./treeMap"
import { CodeMapNode } from "../../../codeCharta.model"
import { Vector2 } from "three"
import Rectangle from "./rectangle"
import HorizontalStrip from "./strip/horizontalStrip"
import VerticalStrip from "./strip/verticalStrip"
import Strip from "./strip/strip"
import { TreeMapHelper } from "../treeMapLayout/treeMapHelper"

export default class SquarifiedTreeMap extends Treemap {
    constructor(rootNode: CodeMapNode) {
        super(rootNode)
    }

    layout(margin: number, origin: Vector2 = new Vector2(0, 0)): CodeMapNode[] {
        const rectangle = this.createMarginatedRectangle(origin)
        const rootNode: CodeMapNode = {
            ...this.mapNode,
            value: this.metricValue,
            rect: rectangle,
            zOffset: 0
        }
        const children = this.mapNode.children.filter(child => TreeMapHelper.calculateSize(child, this.metricName) > 0)

        this.treeMapNodes.push(rootNode)

        if (children.length > 0) {
            this.createNodes(children, rectangle, this.metricValue, 1, margin)
        }

        return this.treeMapNodes
    }

    protected createNodes(nodes: CodeMapNode[], rect: Rectangle, rootSize: number, currentTreemapDepth: number, margin: number): void {
        let processedNodesCount = 0
        let currentRect = new Rectangle(new Vector2(rect.topLeft.x, rect.topLeft.y), rect.width, rect.height)
        let currentRootSize = rootSize
        const orderedNodes = this.orderBySizeDescending(nodes)

        do {
            const currentStrip = this.createStrip(currentRect, orderedNodes.slice(processedNodesCount), currentRootSize)
            const stripSize = currentStrip.totalSize(this.metricName)

            if (stripSize > 0) {
                const stripNodes = this.createStripNodes(currentStrip, currentRect, currentRootSize, currentTreemapDepth, margin)
                this.createChildrenNodes(stripNodes, currentTreemapDepth, margin)
                currentRect = this.remainingRectangle(currentRect, currentStrip, currentRootSize, currentRect.area())
                currentRootSize -= stripSize
            }
            processedNodesCount += currentStrip.nodes.length
        } while (processedNodesCount < orderedNodes.length) /* as long as there are children to process */
    }

    protected createStrip(rect: Rectangle, nodes: CodeMapNode[], rootSize: number): Strip {
        const firstNode = nodes[0]
        const currentStrip = rect.isVertical() ? new HorizontalStrip([firstNode]) : new VerticalStrip([firstNode])

        currentStrip.populate(nodes.slice(1), rect, rootSize, this.metricName)

        return currentStrip
    }

    protected remainingRectangle(rect: Rectangle, strip: Strip, parentSize: number, parentArea: number): Rectangle {
        const stripSize = strip.totalScaledSize(strip.nodes, this.metricName, parentSize, parentArea)

        let newOrigin: Vector2
        let width = rect.width
        let height = rect.height

        if (strip instanceof HorizontalStrip) {
            const stripHeight = stripSize / rect.width
            height -= stripHeight
            newOrigin = new Vector2(rect.topLeft.x, rect.topLeft.y + stripHeight)
        } else {
            const stripWidth = stripSize / rect.height
            width -= stripWidth
            newOrigin = new Vector2(rect.topLeft.x + stripWidth, rect.topLeft.y)
        }
        return new Rectangle(newOrigin, width, height)
    }

    protected createStripNodes(
        strip: Strip,
        rect: Rectangle,
        rootSize: number,
        currentTreemapDepth: number,
        margin: number,
        order?: number
    ): CodeMapNode[] {
        const stripNodes = strip.layout(rect, rootSize, this.metricName, currentTreemapDepth, margin, order)
        this.treeMapNodes.push(...stripNodes)
        return stripNodes
    }

    protected createChildrenNodes(stripNodes: CodeMapNode[], currentTreemapDepth: number, margin: number): void {
        for (const node of stripNodes) {
            if (node.children && node.children.length > 0) {
                const children = node.children.filter(child => TreeMapHelper.calculateSize(child, this.metricName) > 0)
                if (children.length > 0) {
                    const size = TreeMapHelper.calculateSize(node, this.metricName)
                    this.createNodes(children, node.rect, size, currentTreemapDepth + 1, margin)
                }
            }
        }
    }

    private orderBySizeDescending(nodes: CodeMapNode[]): CodeMapNode[] {
        return nodes.sort((a, b) => {
            return TreeMapHelper.calculateSize(b, this.metricName) - TreeMapHelper.calculateSize(a, this.metricName)
        })
    }
}
