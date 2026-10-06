import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { cyclesThrough, declarationsOn, findCycleChains } from "./cycleChains"
import { DeclarationIndex, fromPathOf, indexDeclarations, toPathOf } from "./declarationIndex"

const FILE = "/root/game.ts"

function declarationEdge(fromLeaf: string, toLeaf: string, isCyclic = true): DependencyLeafEdge {
    return { fromNodeName: FILE, fromLeaf, toNodeName: FILE, toLeaf, attributes: { dependencies: 1 }, usage: ["usage"], isCyclic }
}

function indexOf(declarationEdges: DependencyLeafEdge[]): DeclarationIndex {
    const names = new Set(declarationEdges.flatMap(edge => [edge.fromLeaf, edge.toLeaf]))
    const leaves = { [FILE]: Object.fromEntries([...names].map(name => [name, { name, kind: "class" }])) }
    return indexDeclarations({ leaves, leafEdges: declarationEdges })
}

function namesOf(chains: readonly (readonly DependencyLeafEdge[])[]): string[] {
    return chains.map(chain => [...chain.map(edge => edge.fromLeaf), chain.at(-1).toLeaf].join(" → "))
}

describe("findCycleChains", () => {
    it("should walk the shortest way back for each cyclic dependency, and tell each cycle once however often it is met", () => {
        // Arrange
        const index = indexOf([
            declarationEdge("A", "B"),
            declarationEdge("B", "A"),
            declarationEdge("B", "C"),
            declarationEdge("C", "A"),
            declarationEdge("A", "D", false)
        ])

        // Act
        const chains = findCycleChains(index)

        // Assert
        expect(namesOf(chains)).toEqual(["A → B → A", "B → C → A → B"])
    })

    it("should close each cycle: every dependency ends where the next one starts", () => {
        // Arrange
        const index = indexOf([declarationEdge("A", "B"), declarationEdge("B", "C"), declarationEdge("C", "A")])

        // Act
        const [chain] = findCycleChains(index)

        // Assert
        expect(chain.every((edge, position) => toPathOf(edge) === fromPathOf(chain[(position + 1) % 3]))).toBe(true)
        expect(declarationsOn(chain)).toEqual(["A", "B", "C"].map(name => `${FILE}/${name}`))
    })

    it("should tell a declaration that depends on itself as a cycle of one", () => {
        // Arrange
        const index = indexOf([declarationEdge("A", "A")])

        // Act
        const chains = findCycleChains(index)

        // Assert
        expect(namesOf(chains)).toEqual(["A → A"])
    })

    it("should find nothing where a dependency marked cyclic has no way back", () => {
        // Arrange
        const index = indexOf([declarationEdge("A", "B")])

        // Act
        const chains = findCycleChains(index)

        // Assert
        expect(chains).toEqual([])
    })
})

describe("cyclesThrough", () => {
    it("should keep the cycles running through one of the declarations asked for", () => {
        // Arrange
        const chains = findCycleChains(
            indexOf([declarationEdge("A", "B"), declarationEdge("B", "A"), declarationEdge("C", "D"), declarationEdge("D", "C")])
        )

        // Act
        const throughB = cyclesThrough(new Set([`${FILE}/B`, `${FILE}/Unrelated`]), chains)

        // Assert
        expect(namesOf(throughB)).toEqual(["A → B → A"])
    })
})
