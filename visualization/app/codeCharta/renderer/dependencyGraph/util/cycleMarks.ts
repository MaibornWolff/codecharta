import { DependencyBoxBadge } from "../../../model/dependencyGraph.model"

export interface DeclarationCycles {
    isWithinItsFile: boolean
    isWithOtherFiles: boolean
}

export interface CycleMarks {
    /** Per closed box, the cycles that stay within one file it hides. */
    cyclesInsideFiles: ReadonlyMap<string, number>
    /** Per closed box and per opened file, the cycles between different files that run through it. */
    cyclesBetweenFiles: ReadonlyMap<string, number>
    declarationsInCycles: ReadonlyMap<string, DeclarationCycles>
}

export const NO_CYCLE_MARKS: CycleMarks = { cyclesInsideFiles: new Map(), cyclesBetweenFiles: new Map(), declarationsInCycles: new Map() }

/** A badge the reader switched off counts nothing, so neither its box nor the box's tooltip tells it. */
export function shownCycleMarks(marks: CycleMarks, shownBoxBadges: readonly DependencyBoxBadge[]): CycleMarks {
    const isShown = (badge: DependencyBoxBadge) => shownBoxBadges.includes(badge)
    return {
        cyclesInsideFiles: isShown("insideFiles") ? marks.cyclesInsideFiles : NO_CYCLE_MARKS.cyclesInsideFiles,
        cyclesBetweenFiles: isShown("betweenFiles") ? marks.cyclesBetweenFiles : NO_CYCLE_MARKS.cyclesBetweenFiles,
        declarationsInCycles: isShown("declaration") ? marks.declarationsInCycles : NO_CYCLE_MARKS.declarationsInCycles
    }
}

export interface DrawnBoxes {
    /** The box a declaration is drawn as or hidden in. */
    representatives: ReadonlyMap<string, string>
    /** The box around a drawn box; none around the outermost. */
    parentOf: (boxPath: string) => string | null | undefined
    fileOf: (declarationPath: string) => string | undefined
}

/** Each cycle is given as the paths of the declarations it runs through. An opened folder counts nothing, since
 * the boxes in it count for themselves, and a cycle within an opened file is on screen. */
export function findCycleMarks(cycles: readonly (readonly string[])[], boxes: DrawnBoxes): CycleMarks {
    const cyclesInsideFiles = new Map<string, number>()
    const cyclesBetweenFiles = new Map<string, number>()
    const declarationsInCycles = new Map<string, DeclarationCycles>()
    for (const declarationPaths of cycles) {
        const filePathsOfCycle = new Set(declarationPaths.map(boxes.fileOf))
        const isBetweenFiles = filePathsOfCycle.size > 1
        noteDeclarations(declarationPaths, isBetweenFiles, declarationsInCycles)
        const representativesOfCycle = new Set(declarationPaths.map(path => boxes.representatives.get(path)))
        for (const box of boxesHolding(declarationPaths, boxes)) {
            const hidesPartOfTheCycle = representativesOfCycle.has(box)
            const isOpenedFileOfTheCycle = !hidesPartOfTheCycle && filePathsOfCycle.has(box)
            if (isBetweenFiles && (hidesPartOfTheCycle || isOpenedFileOfTheCycle)) {
                countOneMore(cyclesBetweenFiles, box)
            } else if (!isBetweenFiles && hidesPartOfTheCycle) {
                countOneMore(cyclesInsideFiles, box)
            }
        }
    }
    return { cyclesInsideFiles, cyclesBetweenFiles, declarationsInCycles }
}

function noteDeclarations(declarationPaths: readonly string[], isWithOtherFiles: boolean, noted: Map<string, DeclarationCycles>): void {
    for (const declarationPath of declarationPaths) {
        const known = noted.get(declarationPath) ?? { isWithinItsFile: false, isWithOtherFiles: false }
        noted.set(declarationPath, {
            isWithinItsFile: known.isWithinItsFile || !isWithOtherFiles,
            isWithOtherFiles: known.isWithOtherFiles || isWithOtherFiles
        })
    }
}

/** The boxes holding a declaration of the cycle, the boxes around a box included; a declaration drawn as itself
 * is no box that holds it. */
function boxesHolding(declarationPaths: readonly string[], { representatives, parentOf }: DrawnBoxes): Set<string> {
    const holding = new Set<string>()
    for (const declarationPath of declarationPaths) {
        const representative = representatives.get(declarationPath)
        const innermostBox = representative === declarationPath ? parentOf(declarationPath) : representative
        for (let box = innermostBox; box; box = parentOf(box)) {
            holding.add(box)
        }
    }
    return holding
}

function countOneMore(counts: Map<string, number>, key: string): void {
    counts.set(key, (counts.get(key) ?? 0) + 1)
}
