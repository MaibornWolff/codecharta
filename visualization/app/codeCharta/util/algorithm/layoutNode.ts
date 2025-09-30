import { Vector3 } from "three"
import { KeyValuePair, Node } from "../../codeCharta.model"

export class LayoutNode {
    public children?: LayoutNode[]
    public relativeX: number
    public relativeY: number
    public updatedValue: number

    private readonly defaultLayoutNodeValues = {
        id: 0,
        mapNodeDepth: 0,
        deltas: {},
        edgeAttributes: {},
        visible: true,
        markingColor: undefined,
        flat: false,
        incomingEdgePoint: new Vector3(0, 0, 0),
        outgoingEdgePoint: new Vector3(0, 0, 0),
        z0: 0,
        color: "",
        link: "",
        height: 10,
        path: ""
    }

    constructor(
        public name: string,
        public width: number,
        public length: number,
        public depth: number,
        public isLeaf: boolean,
        public attributes: KeyValuePair,
        public hasLabel = false
    ) {
        this.relativeX = 0
        this.relativeY = 0
        this.updatedValue = -1
    }

    public toNodeArray(): Node[] {
        return this.toNodeArrayWithOffset(0, 0)
    }

    public toNodeArrayWithOffset(xOffset: number, yOffset: number): Node[] {
        const x0 = this.relativeX + xOffset
        const y0 = this.relativeY + yOffset
        const node: Node = {
            name: this.name,
            width: this.width,
            length: this.length,
            depth: this.depth,
            x0,
            y0,
            isLeaf: this.isLeaf,
            attributes: this.attributes,
            heightDelta: this.updatedValue,
            ...this.defaultLayoutNodeValues
        }
        if (this.isLeaf) {
            return [node]
        }

        return [node, ...this.children.flatMap(child => child.toNodeArrayWithOffset(x0, y0))]
    }

    public hasZeroWidthOrLength(): boolean {
        return this.width <= 0 || this.length <= 0
    }
}
