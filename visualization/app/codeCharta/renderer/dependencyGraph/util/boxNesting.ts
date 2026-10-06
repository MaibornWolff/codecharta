import { LayoutBox } from "./levelizedLayout"

export type IsInside = (path: string, containerPath: string) => boolean

/** Whether a box is the container or lies in it, however deep. The layout says so rather than the paths: a file
 * lies in the box of its package, whose path its own does not start with. */
export function nestingOf(boxes: readonly LayoutBox[]): IsInside {
    const parentOf = new Map(boxes.map(box => [box.path, box.parentPath]))
    return (path, containerPath) => {
        for (let current: string | null | undefined = path; current != null; current = parentOf.get(current)) {
            if (current === containerPath) {
                return true
            }
        }
        return false
    }
}
