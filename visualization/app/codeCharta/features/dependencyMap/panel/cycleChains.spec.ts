import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { cyclesThrough, declarationsOn, findCycleChains } from "./cycleChains"
import { DeclarationIndex, fromPathOf, indexDeclarations, toPathOf } from "./declarationIndex"

const FILE = "/root/game.ts"

function leafEdge(fromLeaf: string, toLeaf: string, isCyclic = true): DependencyLeafEdge {
    return { fromNodeName: FILE, fromLeaf, toNodeName: FILE, toLeaf, attributes: { dependencies: 1 }, usage: ["usage"], isCyclic }
}

function indexOf(leafEdges: DependencyLeafEdge[]): DeclarationIndex {
    const names = new Set(leafEdges.flatMap(edge => [edge.fromLeaf, edge.toLeaf]))
    const leaves = { [FILE]: Object.fromEntries([...names].map(name => [name, { name, kind: "class" }])) }
    return indexDeclarations({ leaves, leafEdges })
}

function namesOf(chains: readonly (readonly DependencyLeafEdge[])[]): string[] {
    return chains.map(chain => [...chain.map(edge => edge.fromLeaf), chain.at(-1).toLeaf].join(" → "))
}

describe("findCycleChains", () => {
    it("should walk the shortest way back for each cyclic dependency, and tell each cycle once however often it is met", () => {
        // Arrange
        const index = indexOf([leafEdge("A", "B"), leafEdge("B", "A"), leafEdge("B", "C"), leafEdge("C", "A"), leafEdge("A", "D", false)])

        // Act
        const { chains } = findCycleChains(index)

        // Assert
        expect(namesOf(chains)).toEqual(["A → B → A", "B → C → A → B"])
    })

    it("should close each cycle: every dependency ends where the next one starts", () => {
        // Arrange
        const index = indexOf([leafEdge("A", "B"), leafEdge("B", "C"), leafEdge("C", "A")])

        // Act
        const [chain] = findCycleChains(index).chains

        // Assert
        expect(chain.every((edge, position) => toPathOf(edge) === fromPathOf(chain[(position + 1) % 3]))).toBe(true)
        expect(declarationsOn(chain)).toEqual(["A", "B", "C"].map(name => `${FILE}/${name}`))
    })

    it("should tell a declaration that depends on itself as a cycle of one", () => {
        // Arrange
        const index = indexOf([leafEdge("A", "A")])

        // Act
        const { chains } = findCycleChains(index)

        // Assert
        expect(namesOf(chains)).toEqual(["A → A"])
    })

    it("should find nothing where a dependency marked cyclic has no way back", () => {
        // Arrange
        const index = indexOf([leafEdge("A", "B")])

        // Act
        const { chains } = findCycleChains(index)

        // Assert
        expect(chains).toEqual([])
    })

    it("should stop after the number of walks it is given and say that it did", () => {
        // Arrange
        const spokes = ["B", "C", "D", "E"].flatMap(name => [leafEdge("Hub", name), leafEdge(name, "Hub")])
        const index = indexOf(spokes)

        // Act
        const tired = findCycleChains(index, 3)

        // Assert
        expect([tired.chains.length, tired.isComplete]).toEqual([3, false])
        expect(findCycleChains(index)).toMatchObject({ chains: { length: 4 }, isComplete: true })
    })
})

describe("cyclesThrough", () => {
    it("should keep the cycles running through one of the declarations asked for", () => {
        // Arrange
        const { chains } = findCycleChains(indexOf([leafEdge("A", "B"), leafEdge("B", "A"), leafEdge("C", "D"), leafEdge("D", "C")]))

        // Act
        const throughB = cyclesThrough(new Set([`${FILE}/B`, `${FILE}/Unrelated`]), chains)

        // Assert
        expect(namesOf(throughB)).toEqual(["A → B → A"])
    })
})
