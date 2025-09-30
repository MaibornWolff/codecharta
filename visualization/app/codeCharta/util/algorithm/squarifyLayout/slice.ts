import { SquarifyNode } from "./squarify"

export default function layoutNodes(parent: SquarifyNode, x0: number, y0: number, x1: number, y1: number): void {
    const children = parent.children
    const k = parent.value ? (y1 - y0) / parent.value : 0

    for (const element of children) {
        element.x0 = x0
        element.x1 = x1
        element.y0 = y0
        element.y1 = y0 += element.value * k
    }
}
