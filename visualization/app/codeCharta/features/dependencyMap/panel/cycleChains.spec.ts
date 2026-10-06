import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { findCycleChains } from "./cycleChains"
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
    it("should walk the shortest way back for each cyclic dependency leaving the declaration", () => {
        // Arrange
        const index = indexOf([leafEdge("A", "B"), leafEdge("B", "A"), leafEdge("B", "C"), leafEdge("C", "A"), leafEdge("A", "D", false)])

        // Act
        const chains = findCycleChains([`${FILE}/A`], index)

        // Assert
        expect(namesOf(chains)).toEqual(["A → B → A"])
    })

    it("should find the longer way round when no shorter one closes the cycle", () => {
        // Arrange
        const index = indexOf([leafEdge("A", "B"), leafEdge("B", "C"), leafEdge("C", "A")])

        // Act
        const chains = findCycleChains([`${FILE}/B`], index)

        // Assert
        expect(namesOf(chains)).toEqual(["B → C → A → B"])
        expect(chains[0].every((edge, position) => toPathOf(edge) === fromPathOf(chains[0][(position + 1) % 3]))).toBe(true)
    })

    it("should tell a cycle once, though several of the declarations asked for lie on it", () => {
        // Arrange
        const index = indexOf([leafEdge("A", "B"), leafEdge("B", "A"), leafEdge("C", "D"), leafEdge("D", "C")])

        // Act
        const chains = findCycleChains(
            ["A", "B", "C"].map(name => `${FILE}/${name}`),
            index
        )

        // Assert
        expect(namesOf(chains)).toEqual(["A → B → A", "C → D → C"])
    })

    it("should tell a declaration that depends on itself as a cycle of one", () => {
        // Arrange
        const index = indexOf([leafEdge("A", "A")])

        // Act
        const chains = findCycleChains([`${FILE}/A`], index)

        // Assert
        expect(namesOf(chains)).toEqual(["A → A"])
    })

    it("should find nothing where a dependency marked cyclic has no way back, or the declaration is unknown", () => {
        // Arrange
        const index = indexOf([leafEdge("A", "B")])

        // Act
        const chains = findCycleChains([`${FILE}/A`, `${FILE}/Ghost`], index)

        // Assert
        expect(chains).toEqual([])
    })

    it("should stop at the number of cycles and at the number of walks it is given", () => {
        // Arrange
        const spokes = ["B", "C", "D", "E"].flatMap(name => [leafEdge("Hub", name), leafEdge(name, "Hub")])
        const index = indexOf(spokes)

        // Act
        const capped = findCycleChains([`${FILE}/Hub`], index, { maxChains: 2, maxWalks: 100 })
        const tired = findCycleChains([`${FILE}/Hub`], index, { maxChains: 100, maxWalks: 3 })

        // Assert
        expect(capped).toHaveLength(2)
        expect(tired).toHaveLength(3)
    })
})
