import { addToGroup } from "./collections"
import { LayoutBox } from "./layoutModel"

/** Boxes come parents first, so a folder's children are the boxes one level deeper that follow it before the
 * next box at its own depth. */
export function childIndicesByFolder(boxes: LayoutBox[]): Map<number, number[]> {
    const childrenOf = new Map<number, number[]>()
    const openFolderAtDepth: number[] = []
    boxes.forEach((box, index) => {
        if (box.depth > 0) {
            addToGroup(childrenOf, openFolderAtDepth[box.depth - 1], index)
        }
        if (box.isExpanded) {
            openFolderAtDepth[box.depth] = index
        }
    })
    return childrenOf
}
