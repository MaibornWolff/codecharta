import { DependencyDeclarations } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeaf, DependencyLeafEdge, Edge } from "../../../model/codeCharta.model"
import { LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { findHierarchyDifferences, NO_HIERARCHY_DIFFERENCES } from "./hierarchyDifferences"

function leveledFile(path: string): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, kind: "file", children: [] }
}

function leveledFolder(path: string, level: number, children: LeveledNode[]): LeveledNode {
    return { path, name: path.split("/").pop(), level, kind: "folder", children }
}

function declaring(namespace?: string): Record<string, DependencyLeaf> {
    return { Any: { name: "Any", kind: "class", ...(namespace !== undefined && { namespace }) } }
}

function leafEdge(fromNodeName: string, toNodeName: string, flags: Partial<DependencyLeafEdge> = {}): DependencyLeafEdge {
    return { fromNodeName, fromLeaf: "Any", toNodeName, toLeaf: "Any", attributes: { dependencies: 1 }, usage: ["usage"], ...flags }
}

const MODEL = ["/root/model/creature.java", "/root/model/weapon.java"]
const UI = ["/root/ui/view.java", "/root/ui/menu.java"]
const MISPLACED = "/root/ui/armor.java"
const SCRIPT = "/root/ui/build.ts"

const TREE = leveledFolder("/root", 0, [
    leveledFolder("/root/model", 0, MODEL.map(leveledFile)),
    leveledFolder("/root/ui", 1, [...UI, MISPLACED, SCRIPT].map(leveledFile))
])

function declarations(overrides: Partial<DependencyDeclarations> = {}): DependencyDeclarations {
    return {
        namespaces: { "game.model": { level: 0 }, "game.ui": { level: 1 } },
        leaves: {
            ...Object.fromEntries(MODEL.map(path => [path, declaring("game.model")])),
            ...Object.fromEntries(UI.map(path => [path, declaring("game.ui")])),
            [MISPLACED]: declaring("game.model"),
            [SCRIPT]: declaring()
        },
        leafEdges: [],
        ...overrides
    }
}

describe("findHierarchyDifferences", () => {
    it("should mark the file lying apart from most files of its package, and the file without a package among files that declare one", () => {
        // Act
        const { files } = findHierarchyDifferences(TREE, declarations(), [])

        // Assert
        expect([...files].sort()).toEqual([MISPLACED, SCRIPT])
    })

    it("should mark nothing where the packages mirror the folders", () => {
        // Arrange
        const mirroring = declarations()
        mirroring.leaves[MISPLACED] = declaring("game.ui")
        mirroring.leaves[SCRIPT] = declaring("game.ui")

        // Act
        const differences = findHierarchyDifferences(TREE, mirroring, [])

        // Assert
        expect(differences).toEqual(NO_HIERARCHY_DIFFERENCES)
    })

    it("should leave a folder of files without packages alone", () => {
        // Arrange
        const scripts = leveledFolder("/root", 0, [leveledFolder("/root/scripts", 0, [leveledFile(SCRIPT)])])

        // Act
        const differences = findHierarchyDifferences(scripts, declarations(), [])

        // Assert
        expect(differences).toEqual(NO_HIERARCHY_DIFFERENCES)
    })

    it("should mark a package and the folder most of its files lie in when they stand on different levels", () => {
        // Arrange
        const lifted = declarations({ namespaces: { "game.model": { level: 2 }, "game.ui": { level: 1 } } })

        // Act
        const { folders, packages } = findHierarchyDifferences(TREE, lifted, [])

        // Assert
        expect([...folders]).toEqual(["/root/model"])
        expect([...packages]).toEqual(["game.model"])
    })

    it("should mark the pairs of files whose edge is of another type among the packages, and only those the declarations tell of", () => {
        // Arrange
        const [creature, weapon] = MODEL
        const [view] = UI
        const fileEdges: Edge[] = [
            { fromNodeName: creature, toNodeName: weapon, attributes: { dependencies: 2 }, isPointingUpwards: true },
            { fromNodeName: view, toNodeName: creature, attributes: { dependencies: 1 }, isCyclic: true },
            { fromNodeName: weapon, toNodeName: view, attributes: { dependencies: 1 }, isCyclic: true }
        ]
        const leafEdges = [
            leafEdge(creature, weapon),
            leafEdge(creature, weapon, { isCyclic: true }),
            leafEdge(view, creature, { isCyclic: true })
        ]

        // Act
        const { filePairs } = findHierarchyDifferences(TREE, declarations({ leafEdges }), fileEdges)

        // Assert
        expect([...filePairs]).toEqual([`${creature}|${weapon}`])
    })
})
