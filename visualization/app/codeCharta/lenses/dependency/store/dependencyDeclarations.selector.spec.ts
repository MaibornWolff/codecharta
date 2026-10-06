import { TEST_FILE_DATA } from "../../../mocks/dataMocks"
import { CCFile, DependencyDeclarationData, FileSelectionState, FileState } from "../../../model/codeCharta.model"
import { clone } from "../../../util/clone"
import { dependencyDeclarationsSelector, hasDeclarationsSelector, hasNamespacesSelector } from "./dependencyDeclarations.selector"

const DECLARATIONS: DependencyDeclarationData = {
    namespaces: { com: { level: 0 }, "com.game": { parent: "com", level: 1 } },
    leaves: {
        "/root/Creature.java": { Creature: { name: "Creature", kind: "class", namespace: "com.game", level: 1 } },
        "/root/util.ts": { helper: { name: "helper", kind: "function" } }
    },
    leafEdges: [
        {
            fromNodeName: "/root/Creature.java",
            fromLeaf: "Creature",
            toNodeName: "/root/util.ts",
            toLeaf: "helper",
            attributes: { dependencies: 1 },
            usage: ["usage"]
        }
    ]
}

describe("dependency lens declarations", () => {
    function fileWith(name: string, dependencyDeclarations: DependencyDeclarationData): CCFile {
        const file = clone(TEST_FILE_DATA)
        file.fileMeta.fileName = name
        file.settings.fileSettings.dependencyDeclarations = dependencyDeclarations
        return file
    }

    function fileState(file: CCFile, selectedAs = FileSelectionState.Partial): FileState {
        return { file, selectedAs }
    }

    describe("dependencyDeclarationsSelector", () => {
        it("should return the single visible file's declarations", () => {
            // Arrange
            const files = [fileState(fileWith("single", DECLARATIONS))]

            // Act
            const derived = dependencyDeclarationsSelector.projector(files)

            // Assert
            expect(derived).toEqual(DECLARATIONS)
        })

        it("should read a file without the layer, or persisted before it existed, as declaring nothing", () => {
            // Arrange
            const persistedBefore = fileWith("old", {})
            delete persistedBefore.settings.fileSettings.dependencyDeclarations
            const files = [fileState(fileWith("empty", {})), fileState(persistedBefore)]

            // Act
            const derived = dependencyDeclarationsSelector.projector(files)

            // Assert
            expect(derived).toEqual({ namespaces: {}, leaves: {}, leafEdges: [] })
        })

        it("should put each file's name in front of its paths and packages when several maps are shown side by side", () => {
            // Arrange
            const files = [fileState(fileWith("first", DECLARATIONS)), fileState(fileWith("second", DECLARATIONS))]

            // Act
            const derived = dependencyDeclarationsSelector.projector(files)

            // Assert
            expect(Object.keys(derived.namespaces)).toEqual(["first.com", "first.com.game", "second.com", "second.com.game"])
            expect(derived.namespaces["second.com.game"]).toEqual({ parent: "second.com", level: 1 })
            expect(derived.leaves["/root/first/Creature.java"]["Creature"].namespace).toBe("first.com.game")
            expect(derived.leaves["/root/second/util.ts"]["helper"].namespace).toBeUndefined()
            expect(derived.leafEdges.map(edge => [edge.fromNodeName, edge.toNodeName])).toEqual([
                ["/root/first/Creature.java", "/root/first/util.ts"],
                ["/root/second/Creature.java", "/root/second/util.ts"]
            ])
        })

        it("should union the declarations unprefixed when the files are compared", () => {
            // Arrange
            const comparison: DependencyDeclarationData = {
                leaves: { "/root/Creature.java": { Monster: { name: "Monster", kind: "class" } } }
            }
            const files = [
                fileState(fileWith("reference", DECLARATIONS), FileSelectionState.Reference),
                fileState(fileWith("comparison", comparison), FileSelectionState.Comparison)
            ]

            // Act
            const derived = dependencyDeclarationsSelector.projector(files)

            // Assert
            expect(Object.keys(derived.leaves["/root/Creature.java"])).toEqual(["Creature", "Monster"])
            expect(Object.keys(derived.namespaces)).toEqual(["com", "com.game"])
        })
    })

    describe("hasDeclarationsSelector", () => {
        it.each([
            [DECLARATIONS.leaves, true],
            [{ "/root/empty.ts": {} }, false],
            [{}, false]
        ])("should tell whether the leaves %j hold a declaration: %s", (leaves, expected) => {
            // Arrange
            const merged = { namespaces: {}, leaves, leafEdges: [] }

            // Act
            const hasDeclarations = hasDeclarationsSelector.projector(merged)

            // Assert
            expect(hasDeclarations).toBe(expected)
        })
    })

    describe("hasNamespacesSelector", () => {
        it.each([
            [DECLARATIONS, true],
            [{ ...DECLARATIONS, namespaces: {} }, false]
        ])("should tell whether the declarations %j name a package: %s", (declarations, expected) => {
            // Arrange
            const merged = { namespaces: {}, leaves: {}, leafEdges: [], ...declarations }

            // Act
            const hasNamespaces = hasNamespacesSelector.projector(merged)

            // Assert
            expect(hasNamespaces).toBe(expected)
        })
    })
})
