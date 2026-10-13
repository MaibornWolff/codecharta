export interface DeclarationCycles {
    isWithinItsFile: boolean
    isWithOtherFiles: boolean
}

export interface CycleMarks {
    /** Per closed box, the cycles between declarations that run through nothing but what it hides. */
    insideCycles: ReadonlyMap<string, number>
    /** Per file, folder or package, open or closed, the cycles that run through it and through something outside it. */
    sharedCycles: ReadonlyMap<string, number>
    declarationsInCycles: ReadonlyMap<string, DeclarationCycles>
}

export const NO_CYCLE_MARKS: CycleMarks = { insideCycles: new Map(), sharedCycles: new Map(), declarationsInCycles: new Map() }

export interface DrawnBoxes {
    /** The box a declaration is drawn as or hidden in. */
    representatives: ReadonlyMap<string, string>
    /** The box around a drawn box; none around the outermost. */
    parentOf: (boxPath: string) => string | null | undefined
    fileOf: (declarationPath: string) => string | undefined
}

/** A box counts apart the cycles it keeps to itself and those it shares with what lies outside it, so a file that
 * has cycles of its own and is part of a cycle with other files says both. A cycle a box holds whole is counted
 * only while the box is closed: once it is open, the cycle is on screen or counted by a closed box inside.
 * Each cycle is given as the paths of the declarations it runs through. */
export function findCycleMarks(cycles: readonly (readonly string[])[], boxes: DrawnBoxes): CycleMarks {
    const insideCycles = new Map<string, number>()
    const sharedCycles = new Map<string, number>()
    const declarationsInCycles = new Map<string, DeclarationCycles>()
    for (const declarationPaths of cycles) {
        noteDeclarations(declarationPaths, boxes, declarationsInCycles)
        const closedBoxes = new Set(declarationPaths.map(path => boxes.representatives.get(path)).filter(box => box !== undefined))
        for (const [box, heldCount] of declarationsHeldByBox(declarationPaths, boxes)) {
            if (heldCount < declarationPaths.length) {
                countOneMore(sharedCycles, box)
            } else if (closedBoxes.has(box)) {
                countOneMore(insideCycles, box)
            }
        }
    }
    return { insideCycles, sharedCycles, declarationsInCycles }
}

function noteDeclarations(declarationPaths: readonly string[], { fileOf }: DrawnBoxes, noted: Map<string, DeclarationCycles>): void {
    const isWithOtherFiles = new Set(declarationPaths.map(fileOf)).size > 1
    for (const declarationPath of declarationPaths) {
        const known = noted.get(declarationPath) ?? { isWithinItsFile: false, isWithOtherFiles: false }
        noted.set(declarationPath, {
            isWithinItsFile: known.isWithinItsFile || !isWithOtherFiles,
            isWithOtherFiles: known.isWithOtherFiles || isWithOtherFiles
        })
    }
}

/** How many declarations of a cycle each box holds, the boxes around a box included; a declaration drawn as
 * itself is no box that holds it. */
function declarationsHeldByBox(declarationPaths: readonly string[], { representatives, parentOf }: DrawnBoxes): Map<string, number> {
    const heldByBox = new Map<string, number>()
    for (const declarationPath of declarationPaths) {
        const representative = representatives.get(declarationPath)
        const innermostBox = representative === declarationPath ? parentOf(declarationPath) : representative
        for (let box = innermostBox; box; box = parentOf(box)) {
            countOneMore(heldByBox, box)
        }
    }
    return heldByBox
}

function countOneMore(counts: Map<string, number>, key: string): void {
    counts.set(key, (counts.get(key) ?? 0) + 1)
}
