import { addToGroup } from "./collections"
import { EdgeLook } from "./dependencyGraphEdges"
import { GraphEdge } from "./edgeProjection"
import { EdgeRoute } from "./edgeRouting"
import { Point } from "./geometry"
import { childIndicesByFolder } from "./layoutHierarchy"
import { DependencyGraphLayout, LayoutBox, LevelBand } from "./levelizedLayout"

export type PaintedItem = { kind: "box"; box: LayoutBox } | { kind: "band"; band: LevelBand }

export interface EdgeItem {
    kind: "edge"
    edge: GraphEdge
    route: EdgeRoute
    look: EdgeLook
}

/** Painted apart from its open folder so that it lies over the edges. */
export interface TitleItem {
    kind: "title"
    box: LayoutBox
}

export type GraphItem = PaintedItem | TitleItem | EdgeItem

/** Each folder, then its level bands, then its children, so a folder dragged over another covers all of it.
 * Among siblings, the dragged ones come last, the most recently dragged on top. */
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

/** The open folders and level bands lie under the edges, the closed boxes and the open folders' names over them,
 * so no edge hides a name. */
export function aroundEdges(painted: PaintedItem[]): { underEdges: PaintedItem[]; overEdges: (PaintedItem | TitleItem)[] } {
    const underEdges: PaintedItem[] = []
    const overEdges: (PaintedItem | TitleItem)[] = []
    for (const item of painted) {
        if (item.kind === "box" && !item.box.isExpanded) {
            overEdges.push(item)
            continue
        }
        underEdges.push(item)
        if (item.kind === "box") {
            overEdges.push({ kind: "title", box: item.box })
        }
    }
    return { underEdges, overEdges }
}

export function boxAtPoint(layout: DependencyGraphLayout, raisedPaths: readonly string[], point: Point): string | null {
    const { underEdges, overEdges } = aroundEdges(paintOrder(layout, raisedPaths))
    return topmostBoxAt([...underEdges, ...overEdges], point)
}

/** The box painted on top is the one the reader sees and means to click. */
export function topmostBoxAt(items: (PaintedItem | TitleItem)[], [x, y]: Point): string | null {
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
        addToGroup(byFolder, band.containerPath, band)
    }
    return byFolder
}
