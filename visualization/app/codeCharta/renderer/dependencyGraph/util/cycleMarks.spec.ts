import { DrawnBoxes, findCycleMarks, NO_CYCLE_MARKS } from "./cycleMarks"

const ROOT = "/root"
const FOLDER = "/root/app"
const FIRST_FILE = "/root/app/a.ts"
const SECOND_FILE = "/root/app/b.ts"
const FILE_ELSEWHERE = "/root/lib/c.ts"

const BETWEEN_THE_FILES = [`${FIRST_FILE}/One`, `${SECOND_FILE}/Two`]
const WITHIN_THE_FIRST_FILE = [`${FIRST_FILE}/One`, `${FIRST_FILE}/Inner`]
const OUT_OF_THE_FOLDER = [`${SECOND_FILE}/Two`, `${FILE_ELSEWHERE}/Far`]
const CYCLES = [BETWEEN_THE_FILES, WITHIN_THE_FIRST_FILE, OUT_OF_THE_FOLDER]

const fileOf = (path: string) => path.slice(0, path.lastIndexOf("/"))
const PARENTS: Record<string, string | null> = { [ROOT]: null, [FOLDER]: ROOT, "/root/lib": ROOT }
const parentOf = (path: string) => (path in PARENTS ? PARENTS[path] : fileOf(path))

function boxesShowing(representativeOf: (declarationPath: string) => string | undefined): DrawnBoxes {
    const shown = CYCLES.flat().flatMap(path => {
        const representative = representativeOf(path)
        return representative === undefined ? [] : [[path, representative] as const]
    })
    return { representatives: new Map(shown), parentOf, fileOf }
}

describe("findCycleMarks", () => {
    it("should count on a closed file the cycles it keeps to itself apart from those it shares with other files", () => {
        // Arrange
        const everyFileClosed = boxesShowing(fileOf)

        // Act
        const { insideCycles, sharedCycles } = findCycleMarks(CYCLES, everyFileClosed)

        // Assert
        expect([...insideCycles]).toEqual([[FIRST_FILE, 1]])
        expect(sharedCycles.get(FIRST_FILE)).toBe(1)
        expect(sharedCycles.get(SECOND_FILE)).toBe(2)
        expect(sharedCycles.get(FILE_ELSEWHERE)).toBe(1)
    })

    it("should count on a closed folder the cycles of the files in it as inside, and only those that leave it as shared", () => {
        // Arrange
        const folderClosed = boxesShowing(path => (path.startsWith(FOLDER) ? FOLDER : fileOf(path)))

        // Act
        const { insideCycles, sharedCycles } = findCycleMarks(CYCLES, folderClosed)

        // Assert
        expect(insideCycles.get(FOLDER)).toBe(2)
        expect(sharedCycles.get(FOLDER)).toBe(1)
    })

    it("should keep telling on an opened folder or file the cycles that leave it, but none it holds whole", () => {
        // Arrange
        const firstFileOpened = boxesShowing(path => (fileOf(path) === FIRST_FILE ? path : fileOf(path)))

        // Act
        const { insideCycles, sharedCycles } = findCycleMarks(CYCLES, firstFileOpened)

        // Assert
        expect(insideCycles.size).toBe(0)
        expect(sharedCycles.get(FIRST_FILE)).toBe(1)
        expect(sharedCycles.get(FOLDER)).toBe(1)
        expect(sharedCycles.has(ROOT)).toBe(false)
    })

    it("should say of each declaration whether its cycles stay in its file, leave it or both, also of those the graph does not show", () => {
        // Arrange
        const nothingShown = boxesShowing(() => undefined)

        // Act
        const { declarationsInCycles, insideCycles, sharedCycles } = findCycleMarks(CYCLES, nothingShown)

        // Assert
        expect(Object.fromEntries(declarationsInCycles)).toEqual({
            [`${FIRST_FILE}/One`]: { isWithinItsFile: true, isWithOtherFiles: true },
            [`${FIRST_FILE}/Inner`]: { isWithinItsFile: true, isWithOtherFiles: false },
            [`${SECOND_FILE}/Two`]: { isWithinItsFile: false, isWithOtherFiles: true },
            [`${FILE_ELSEWHERE}/Far`]: { isWithinItsFile: false, isWithOtherFiles: true }
        })
        expect([insideCycles.size, sharedCycles.size]).toEqual([0, 0])
    })

    it("should mark nothing while there is no cycle", () => {
        // Arrange
        const noCycles: string[][] = []

        // Act
        const marks = findCycleMarks(noCycles, boxesShowing(fileOf))

        // Assert
        expect(marks).toEqual(NO_CYCLE_MARKS)
    })
})
