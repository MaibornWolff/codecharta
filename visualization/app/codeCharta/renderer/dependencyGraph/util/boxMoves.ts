import { IsInside } from "./boxNesting"
import { enclosingRectangle, Rectangle } from "./geometry"
import { childIndicesByFolder } from "./layoutHierarchy"
import { lookupsOf } from "./layoutLookups"
import { DependencyGraphLayout, LAYOUT_SPACING, LayoutBox, LevelBand } from "./levelizedLayout"

/** In layout units, from where the layout put the box. */
export type BoxOffset = [number, number]

/** A box never leaves its folder: the folder grows to hold whatever was dragged towards or past its edge, and
 * each level band follows the boxes of its level. */
export function movedLayout(layout: DependencyGraphLayout, offsets: ReadonlyMap<string, BoxOffset>): DependencyGraphLayout {
    if (offsets.size === 0) {
        return layout
    }
    const shiftOf = accumulatedShifts(offsets, lookupsOf(layout).isInside)
    const boxes = layout.boxes.map(box => shifted(box, shiftOf(box.path)))
    growFoldersAroundTheirChildren(boxes)
    const byPath = new Map(boxes.map(box => [box.path, box]))
    return { ...layout, boxes, bands: layout.bands.map(band => spanningItsBoxes(band, byPath)) }
}

/** The root stays, so its empty space pans the view instead. */
export function isDraggable(layout: DependencyGraphLayout, path: string): boolean {
    const box = layout.boxes.find(candidate => candidate.path === path)
    return box !== undefined && box.depth > 0
}

function accumulatedShifts(offsets: ReadonlyMap<string, BoxOffset>, isInside: IsInside) {
    const moves = [...offsets]
    return (path: string): BoxOffset =>
        moves
            .filter(([movedPath]) => isInside(path, movedPath))
            .reduce<BoxOffset>(([sumX, sumY], [, [dx, dy]]) => [sumX + dx, sumY + dy], [0, 0])
}

/** Boxes come parents first, so walking them backwards settles every folder's children before the folder. */
function growFoldersAroundTheirChildren(boxes: LayoutBox[]): void {
    const childrenOf = childIndicesByFolder(boxes)
    for (let index = boxes.length - 1; index >= 0; index--) {
        const children = childrenOf.get(index)
        if (children) {
            const folder = boxes[index]
            boxes[index] = { ...folder, ...enclosingRectangle([folder, ...children.map(child => roomAround(boxes[child]))]) }
        }
    }
}

function roomAround(child: Rectangle): Rectangle {
    const { padding, headerHeight } = LAYOUT_SPACING
    return {
        x: child.x - padding,
        y: child.y - padding - headerHeight,
        width: child.width + 2 * padding,
        height: child.height + 2 * padding + headerHeight
    }
}

function spanningItsBoxes(band: LevelBand, byPath: ReadonlyMap<string, LayoutBox>): LevelBand {
    const folder = byPath.get(band.containerPath)
    const members = enclosingRectangle(band.memberPaths.map(path => byPath.get(path)))
    return { ...band, x: folder.x, width: folder.width, y: members.y, height: members.height }
}

function shifted<T extends { x: number; y: number }>(item: T, [dx, dy]: BoxOffset): T {
    return dx === 0 && dy === 0 ? item : { ...item, x: item.x + dx, y: item.y + dy }
}
