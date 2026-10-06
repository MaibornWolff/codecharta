import { findCycleMarks, NO_CYCLE_MARKS } from "./cycleMarks"

const FIRST_FILE = "/root/app/a.ts"
const SECOND_FILE = "/root/app/b.ts"

const CYCLES = [
    [`${FIRST_FILE}/One`, `${SECOND_FILE}/Two`],
    [`${FIRST_FILE}/One`, `${FIRST_FILE}/Inner`],
    [`${SECOND_FILE}/Two`, `${SECOND_FILE}/Three`, `${FIRST_FILE}/One`]
]

function representativesWith(shownAs: Record<string, string>): Map<string, string> {
    return new Map(Object.entries(shownAs))
}

const hiddenIn = (box: (path: string) => string) => Object.fromEntries(CYCLES.flat().map(path => [path, box(path)]))
const fileOf = (path: string) => path.slice(0, path.lastIndexOf("/"))

describe("findCycleMarks", () => {
    it("should count on a closed file the cycles running through something it hides, each once", () => {
        // Arrange
        const representatives = representativesWith(hiddenIn(fileOf))

        // Act
        const { hiddenCycles } = findCycleMarks(CYCLES, representatives)

        // Assert
        expect([...hiddenCycles]).toEqual([
            [FIRST_FILE, 3],
            [SECOND_FILE, 2]
        ])
    })

    it("should count on a closed folder every cycle of the files in it once", () => {
        // Arrange
        const representatives = representativesWith(hiddenIn(() => "/root/app"))

        // Act
        const { hiddenCycles } = findCycleMarks(CYCLES, representatives)

        // Assert
        expect([...hiddenCycles]).toEqual([["/root/app", 3]])
    })

    it("should leave an opened file without a count and keep counting on the closed file its cycles also run through", () => {
        // Arrange
        const representatives = representativesWith(hiddenIn(path => (fileOf(path) === FIRST_FILE ? path : SECOND_FILE)))

        // Act
        const { hiddenCycles } = findCycleMarks(CYCLES, representatives)

        // Assert
        expect([...hiddenCycles]).toEqual([[SECOND_FILE, 2]])
    })

    it("should name the declarations taking part in a cycle, also those the graph does not show", () => {
        // Arrange
        const nothingShown = representativesWith({})

        // Act
        const { declarationsInCycles, hiddenCycles } = findCycleMarks(CYCLES, nothingShown)

        // Assert
        expect([...declarationsInCycles].sort()).toEqual([
            `${FIRST_FILE}/Inner`,
            `${FIRST_FILE}/One`,
            `${SECOND_FILE}/Three`,
            `${SECOND_FILE}/Two`
        ])
        expect(hiddenCycles.size).toBe(0)
    })

    it("should mark nothing while there is no cycle", () => {
        // Arrange
        const noCycles: string[][] = []

        // Act
        const marks = findCycleMarks(noCycles, representativesWith({}))

        // Assert
        expect(marks).toEqual(NO_CYCLE_MARKS)
    })
})
