import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { findCycleMarks, NO_CYCLE_MARKS } from "./cycleMarks"

const A = "/root/app/a.ts"
const B = "/root/app/b.ts"
const C = "/root/lib/c.ts"

function leafEdge(from: [string, string], to: [string, string], isCyclic = true): DependencyLeafEdge {
    const [fromNodeName, fromLeaf] = from
    const [toNodeName, toLeaf] = to
    return { fromNodeName, fromLeaf, toNodeName, toLeaf, attributes: { dependencies: 1 }, usage: ["usage"], isCyclic }
}

const LEAF_EDGES = [
    leafEdge([A, "One"], [B, "Two"]),
    leafEdge([B, "Two"], [A, "One"]),
    leafEdge([A, "One"], [A, "Inner"]),
    leafEdge([A, "One"], [C, "Three"], false)
]

function representativesWith(shownAs: Record<string, string>): Map<string, string> {
    return new Map(Object.entries(shownAs))
}

describe("findCycleMarks", () => {
    it("should count on a closed file the cyclic dependencies it hides an end of, the one inside it once", () => {
        // Arrange
        const representatives = representativesWith({
            [A]: A,
            [`${A}/One`]: A,
            [`${A}/Inner`]: A,
            [B]: B,
            [`${B}/Two`]: B
        })

        // Act
        const { hiddenCyclicEdges } = findCycleMarks(LEAF_EDGES, representatives)

        // Assert
        expect([...hiddenCyclicEdges]).toEqual([
            [A, 3],
            [B, 2]
        ])
    })

    it("should count on a closed folder every cyclic dependency of the files in it once", () => {
        // Arrange
        const everythingInApp = Object.fromEntries([A, `${A}/One`, `${A}/Inner`, B, `${B}/Two`].map(path => [path, "/root/app"]))

        // Act
        const { hiddenCyclicEdges } = findCycleMarks(LEAF_EDGES, representativesWith(everythingInApp))

        // Assert
        expect([...hiddenCyclicEdges]).toEqual([["/root/app", 3]])
    })

    it("should leave an opened file without a count and keep counting on the closed file at the other end", () => {
        // Arrange
        const representatives = representativesWith({
            [A]: A,
            [`${A}/One`]: `${A}/One`,
            [`${A}/Inner`]: `${A}/Inner`,
            [B]: B,
            [`${B}/Two`]: B
        })

        // Act
        const { hiddenCyclicEdges } = findCycleMarks(LEAF_EDGES, representatives)

        // Assert
        expect([...hiddenCyclicEdges]).toEqual([[B, 2]])
    })

    it("should name the declarations taking part in a cycle, and no other", () => {
        // Arrange
        const nothingShown = representativesWith({})

        // Act
        const { declarationsInCycles, hiddenCyclicEdges } = findCycleMarks(LEAF_EDGES, nothingShown)

        // Assert
        expect([...declarationsInCycles].sort()).toEqual([`${A}/Inner`, `${A}/One`, `${B}/Two`])
        expect(hiddenCyclicEdges.size).toBe(0)
    })

    it("should stand a declaration the graph does not hold by its file", () => {
        // Arrange
        const representatives = representativesWith({ [A]: "/root/app", [B]: "/root/app" })

        // Act
        const { hiddenCyclicEdges } = findCycleMarks(LEAF_EDGES, representatives)

        // Assert
        expect(hiddenCyclicEdges.get("/root/app")).toBe(3)
    })

    it("should mark nothing while there is nothing to mark", () => {
        // Act
        const marks = findCycleMarks([], representativesWith({}))

        // Assert
        expect(marks).toEqual(NO_CYCLE_MARKS)
    })
})
