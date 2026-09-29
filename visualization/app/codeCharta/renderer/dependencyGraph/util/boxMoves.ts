import { childIndicesByFolder } from "./layoutHierarchy"
import { DependencyGraphLayout, LAYOUT_SPACING, LayoutBox, LevelBand } from "./levelizedLayout"

/** How far a box was dragged from where the layout put it, in layout units. */
export type BoxOffset = [number, number]

interface Rect {
    x: number
    y: number
    width: number
    height: number
}

/** The layout with every dragged box, and everything inside a dragged folder, shifted by its offset. A box
 * never leaves its folder: the folder grows to hold whatever was dragged towards or past its edge, and each
 * level band follows the boxes of its level. */
export function movedLayout(layout: DependencyGraphLayout, offsets: ReadonlyMap<string, BoxOffset>): DependencyGraphLayout {
    if (offsets.size === 0) {
        return layout
    }
    const shiftOf = accumulatedShifts(offsets)
    const boxes = layout.boxes.map(box => shifted(box, shiftOf(box.path)))
    growFoldersAroundTheirChildren(boxes)
    const byPath = new Map(boxes.map(box => [box.path, box]))
    return { ...layout, boxes, bands: layout.bands.map(band => spanningItsBoxes(band, byPath)) }
}

/** A file or closed folder is dragged anywhere on it, an open folder by its header, so the space inside an
 * open folder still pans. The root stays where it is. */
export function canDragBoxAt(layout: DependencyGraphLayout, path: string, [, y]: BoxOffset): boolean {
    const box = layout.boxes.find(candidate => candidate.path === path)
    if (!box || box.depth === 0) {
        return false
    }
    return !box.isExpanded || y <= box.y + LAYOUT_SPACING.headerHeight
}

function accumulatedShifts(offsets: ReadonlyMap<string, BoxOffset>) {
    const moves = [...offsets]
    return (path: string): BoxOffset =>
        moves
            .filter(([movedPath]) => path === movedPath || path.startsWith(`${movedPath}/`))
            .reduce<BoxOffset>(([sumX, sumY], [, [dx, dy]]) => [sumX + dx, sumY + dy], [0, 0])
}

/** Boxes come parents first, so walking them backwards settles every folder's children before the folder. */
function growFoldersAroundTheirChildren(boxes: LayoutBox[]): void {
    const childrenOf = childIndicesByFolder(boxes)
    for (let index = boxes.length - 1; index >= 0; index--) {
        const children = childrenOf.get(index)
        if (children) {
            boxes[index] = {
                ...boxes[index],
                ...enclosing(
                    boxes[index],
                    children.map(child => boxes[child])
                )
            }
        }
    }
}

function enclosing(folder: Rect, children: Rect[]): Rect {
    const left = Math.min(folder.x, ...children.map(child => child.x - LAYOUT_SPACING.padding))
    const top = Math.min(folder.y, ...children.map(child => child.y - LAYOUT_SPACING.padding - LAYOUT_SPACING.headerHeight))
    const right = Math.max(folder.x + folder.width, ...children.map(child => child.x + child.width + LAYOUT_SPACING.padding))
    const bottom = Math.max(folder.y + folder.height, ...children.map(child => child.y + child.height + LAYOUT_SPACING.padding))
    return { x: left, y: top, width: right - left, height: bottom - top }
}

/** A band stretches across its folder and from the highest to the lowest of its boxes, wherever they were
 * dragged. */
function spanningItsBoxes(band: LevelBand, byPath: ReadonlyMap<string, LayoutBox>): LevelBand {
    const folder = byPath.get(band.folderPath)
    const members = band.memberPaths.map(path => byPath.get(path))
    const top = Math.min(...members.map(member => member.y))
    const bottom = Math.max(...members.map(member => member.y + member.height))
    return { ...band, x: folder.x, width: folder.width, y: top, height: bottom - top }
}

function shifted<T extends { x: number; y: number }>(item: T, [dx, dy]: BoxOffset): T {
    return dx === 0 && dy === 0 ? item : { ...item, x: item.x + dx, y: item.y + dy }
}
