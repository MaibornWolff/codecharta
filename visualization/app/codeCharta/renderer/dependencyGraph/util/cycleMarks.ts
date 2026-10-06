export interface CycleMarks {
    /** Per closed box, the cycles between declarations that run through something it hides. */
    hiddenCycles: ReadonlyMap<string, number>
    declarationsInCycles: ReadonlySet<string>
}

export const NO_CYCLE_MARKS: CycleMarks = { hiddenCycles: new Map(), declarationsInCycles: new Set() }

/** A cycle is on screen once all of its declarations are. Until then every closed box hiding one of them counts
 * it, so the count leads the reader to the cycles a box keeps from view, and is the number the box tells of
 * itself when asked. Each cycle is given as the paths of the declarations it runs through. */
export function findCycleMarks(cycles: readonly (readonly string[])[], representatives: ReadonlyMap<string, string>): CycleMarks {
    const hiddenCycles = new Map<string, number>()
    const declarationsInCycles = new Set<string>()
    for (const declarationPaths of cycles) {
        const hidingBoxes = new Set<string>()
        for (const declarationPath of declarationPaths) {
            declarationsInCycles.add(declarationPath)
            const box = representatives.get(declarationPath)
            if (box !== undefined && box !== declarationPath) {
                hidingBoxes.add(box)
            }
        }
        for (const hidingBox of hidingBoxes) {
            hiddenCycles.set(hidingBox, (hiddenCycles.get(hidingBox) ?? 0) + 1)
        }
    }
    return { hiddenCycles, declarationsInCycles }
}
