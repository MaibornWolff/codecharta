import { LayoutBox } from "./levelizedLayout"

/** The indices of each open folder's direct children. Boxes come parents first, so a folder's children are the
 * boxes one level deeper that follow it before the next box at its own depth. */
export function childIndicesByFolder(boxes: LayoutBox[]): Map<number, number[]> {
    const childrenOf = new Map<number, number[]>()
    const openFolderAtDepth: number[] = []
    boxes.forEach((box, index) => {
        if (box.depth > 0) {
            const parent = openFolderAtDepth[box.depth - 1]
            childrenOf.set(parent, [...(childrenOf.get(parent) ?? []), index])
        }
        if (box.isExpanded) {
            openFolderAtDepth[box.depth] = index
        }
    })
    return childrenOf
}
