import { GraphEdge } from "./edgeProjection"
import { EdgeRoute } from "./edgeRouting"
import { childIndicesByFolder } from "./layoutHierarchy"
import { DependencyGraphLayout, LayoutBox, LevelBand } from "./levelizedLayout"

export type PaintedItem = { kind: "box"; box: LayoutBox } | { kind: "band"; band: LevelBand }

export interface EdgeItem {
    kind: "edge"
    edge: GraphEdge
    route: EdgeRoute
    isDimmed: boolean
    /** Drawn above everything, as the edges of the hovered box are. */
    isOnTop: boolean
}

export type GraphItem = PaintedItem | EdgeItem

type LayoutPoint = [number, number]

/** Back to front: each folder, then its level bands, then its children, so a folder dragged over another covers
 * all of it. Among siblings, the dragged ones come last, the most recently dragged on top. */
export function paintOrder(layout: DependencyGraphLayout, raisedPaths: readonly string[]): PaintedItem[] {
    const { boxes } = layout
    if (boxes.length === 0) {
        return []
    }
    const childrenOf = childIndicesByFolder(boxes)
    const bandsOf = bandsByFolder(layout.bands)
    const raiseRank = (index: number) => raisedPaths.indexOf(boxes[index].path)
    const items: PaintedItem[] = []
    const paint = (index: number) => {
        const box = boxes[index]
        items.push({ kind: "box", box })
        for (const band of bandsOf.get(box.path) ?? []) {
            items.push({ kind: "band", band })
        }
        const children = [...(childrenOf.get(index) ?? [])].sort(
            (childA, childB) => raiseRank(childA) - raiseRank(childB) || childA - childB
        )
        children.forEach(paint)
    }
    paint(0)
    return items
}

/** Each edge paints right after the later of its two ends, so whatever covers both of them covers the edge
 * too: a folder dragged under another takes its edges along. Edges on top paint last. Edges sharing a place
 * keep the order they arrive in. */
export function withEdges(painted: PaintedItem[], edges: EdgeItem[]): GraphItem[] {
    const paintIndexOf = new Map(painted.flatMap((item, index) => (item.kind === "box" ? [[item.box.path, index] as const] : [])))
    const edgesAfter = new Map<number, EdgeItem[]>()
    const onTop: EdgeItem[] = []
    for (const item of edges) {
        if (item.isOnTop) {
            onTop.push(item)
            continue
        }
        const slot = Math.max(paintIndexOf.get(item.edge.fromPath), paintIndexOf.get(item.edge.toPath))
        edgesAfter.set(slot, [...(edgesAfter.get(slot) ?? []), item])
    }
    return [...painted.flatMap((item, index) => [item, ...(edgesAfter.get(index) ?? [])]), ...onTop]
}

export function boxAtPoint(layout: DependencyGraphLayout, raisedPaths: readonly string[], point: LayoutPoint): string | null {
    return topmostBoxAt(paintOrder(layout, raisedPaths), point)
}

/** The box painted on top at a point, which is the one the reader sees and means to click there. */
export function topmostBoxAt(items: PaintedItem[], [x, y]: LayoutPoint): string | null {
    for (let index = items.length - 1; index >= 0; index--) {
        const item = items[index]
        if (
            item.kind === "box" &&
            x >= item.box.x &&
            x <= item.box.x + item.box.width &&
            y >= item.box.y &&
            y <= item.box.y + item.box.height
        ) {
            return item.box.path
        }
    }
    return null
}

function bandsByFolder(bands: LevelBand[]): Map<string, LevelBand[]> {
    const byFolder = new Map<string, LevelBand[]>()
    for (const band of bands) {
        byFolder.set(band.folderPath, [...(byFolder.get(band.folderPath) ?? []), band])
    }
    return byFolder
}
