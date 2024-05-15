import Rectangle from "../rectangle"
import { Vector2 } from "three"
import { CodeMapNode } from "../../../../codeCharta.model"
import { TreeMapHelper } from "../../treeMapLayout/treeMapHelper"

export default abstract class Strip {
    nodes: CodeMapNode[] = []

    constructor(nodes: CodeMapNode[]) {
        this.nodes = nodes
    }

    abstract layout(
        rect: Rectangle,
        rootSize: number,
        metricName: string,
        currentTreemapDepth: number,
        margin: number,
        order?: number
    ): CodeMapNode[]

    protected abstract worstAspectRatio(nodes: CodeMapNode[], rect: Rectangle, rootSize: number, metricName: string): number

    totalScaledSize(nodes: CodeMapNode[], metricName: string, rootSize: number, rootArea: number): number {
        return nodes.reduce((total, n) => total + this.scaledSize(n, rootSize, rootArea, metricName), 0)
    }

    totalSize(metricName: string) {
        return this.nodes.reduce((total, n) => total + TreeMapHelper.calculateSize(n, metricName), 0)
    }

    protected min(nodes: CodeMapNode[], metricName: string, rootSize: number, rootArea: number): number {
        return nodes.reduce((min, n) => Math.min(min, this.scaledSize(n, rootSize, rootArea, metricName)), Number.MAX_VALUE)
    }

    protected max(nodes: CodeMapNode[], metricName: string, rootSize: number, rootArea: number): number {
        return nodes.reduce((max, n) => Math.max(max, this.scaledSize(n, rootSize, rootArea, metricName)), Number.MIN_VALUE)
    }

    populate(nodes: CodeMapNode[], rect: Rectangle, rootSize: number, metricName: string) {
        for (const node of nodes) {
            const score = this.worstAspectRatio(this.nodes, rect, rootSize, metricName)
            const newScore = this.worstAspectRatio([...this.nodes, node], rect, rootSize, metricName)

            if (newScore < score) {
                this.nodes.push(node)
            } else {
                /* Node would increase worst aspect ratio, strip is completed */
                break
            }
        }
    }

    protected scaledSize(node: CodeMapNode, parentSize: number, parentArea: number, metricName: string): number {
        const size = TreeMapHelper.calculateSize(node, metricName)
        const scale = parentArea / parentSize
        return scale * size
    }

    protected applyNodeMargin(rect: Rectangle, margin: number): Rectangle {
        const topLeft = new Vector2(rect.topLeft.x + margin, rect.topLeft.y + margin)
        const width = rect.width - 2 * margin
        const height = rect.height - 2 * margin
        return new Rectangle(topLeft, width, height)
    }
}
