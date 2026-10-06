import { DependencyLeaf } from "../../../model/codeCharta.model"
import { LeveledNode } from "./leveledTree"
import { arrangedByPackages, Namespaces } from "./packageTree"

function leaf(namespace?: string, level?: number): DependencyLeaf {
    return { name: "Any", kind: "class", ...(namespace !== undefined && { namespace }), ...(level !== undefined && { level }) }
}

function leveledFile(path: string, level = 0): LeveledNode {
    return { path, name: path.split("/").pop(), level, kind: "file", children: [] }
}

function leveledFolder(path: string, children: LeveledNode[], level = 0): LeveledNode {
    return { path, name: path.split("/").pop(), level, kind: "folder", children }
}

const NAMESPACES: Namespaces = {
    com: { level: 0 },
    "com.game": { parent: "com", level: 2 },
    "com.game.model": { parent: "com.game", level: 1 },
    "com.game.ui": { parent: "com.game", level: 3 },
    "com.empty": { parent: "com", level: 0 }
}

describe("the package a file is placed in", () => {
    const FILE = "/root/file.ts"

    function holderOf(node: LeveledNode, path: string): LeveledNode | null {
        const isHeldHere = node.children.some(child => child.path === path)
        return isHeldHere ? node : (node.children.map(child => holderOf(child, path)).find(holder => holder !== null) ?? null)
    }

    function placementOf(leavesOfFile: Record<string, DependencyLeaf> | undefined) {
        const tree = leveledFolder("/root", [leveledFile(FILE)])
        const arranged = arrangedByPackages(tree, NAMESPACES, leavesOfFile ? { [FILE]: leavesOfFile } : {})
        const holder = holderOf(arranged, FILE)
        const level = holder.children.find(child => child.path === FILE).level
        return holder.kind === "package" ? { packagePath: holder.path, level } : null
    }

    it("should be the one most of its declarations declare, the file as high as the highest of them", () => {
        // Arrange
        const leaves = { A: leaf("com.game.model", 1), B: leaf("com.game.model", 4), C: leaf("com.game.ui", 9), D: leaf() }

        // Act
        const placement = placementOf(leaves)

        // Assert
        expect(placement).toEqual({ packagePath: "package:com.game.model", level: 4 })
    })

    it("should be the first package by name among equals, the file at level 0 where the declarations have none", () => {
        // Arrange
        const leaves = { A: leaf("com.game.ui"), B: leaf("com.game.model") }

        // Act
        const placement = placementOf(leaves)

        // Assert
        expect(placement).toEqual({ packagePath: "package:com.game.model", level: 0 })
    })

    it("should be none for a file declaring no package the map knows", () => {
        // Arrange
        const withoutKnownPackage = [{ A: leaf() }, { A: leaf("org.unknown") }, {}, undefined]

        // Act
        const placements = withoutKnownPackage.map(placementOf)

        // Assert
        expect(placements).toEqual([null, null, null, null])
    })
})

describe("arrangedByPackages", () => {
    const CREATURE = "/root/src/creature.java"
    const VIEW = "/root/src/view.java"
    const HELPER = "/root/src/helper.ts"
    const README = "/root/docs/notes.ts"
    const tree = leveledFolder("/root", [
        leveledFolder("/root/src", [leveledFile(CREATURE, 5), leveledFile(VIEW, 6), leveledFile(HELPER, 7)], 1),
        leveledFolder("/root/docs", [leveledFile(README)])
    ])
    const leaves = {
        [CREATURE]: { Creature: leaf("com.game.model", 2) },
        [VIEW]: { View: leaf("com.game.ui", 1) },
        [HELPER]: { helper: leaf() }
    }

    it("should nest the files in the packages their declarations declare, at their level there", () => {
        // Act
        const arranged = arrangedByPackages(tree, NAMESPACES, leaves)

        // Assert
        const [game] = arranged.children
        expect(game).toMatchObject({ path: "package:com.game", name: "com.game", kind: "package", level: 0, foldedPaths: ["package:com"] })
        expect(game.children.map(({ path, name, level, kind }) => ({ path, name, level, kind }))).toEqual([
            { path: "package:com.game.model", name: "model", level: 1, kind: "package" },
            { path: "package:com.game.ui", name: "ui", level: 3, kind: "package" }
        ])
        expect(game.children[0].children).toEqual([{ ...leveledFile(CREATURE), level: 2 }])
    })

    it("should keep the files without a package in their folders beside the packages, and drop a folder left empty", () => {
        // Arrange
        const everythingPackaged = { ...leaves, [README]: { Notes: leaf("com.game.model") } }

        // Act
        const mixed = arrangedByPackages(tree, NAMESPACES, leaves)
        const packagedDocs = arrangedByPackages(tree, NAMESPACES, everythingPackaged)

        // Assert
        expect(mixed.children.slice(1)).toEqual([
            leveledFolder("/root/src", [leveledFile(HELPER, 7)], 1),
            leveledFolder("/root/docs", [leveledFile(README)])
        ])
        expect(packagedDocs.children.map(child => child.path)).toEqual(["package:com.game", "/root/src"])
        expect(mixed).toMatchObject({ path: "/root", kind: "folder" })
    })

    it("should leave out a package holding no file of the tree, and keep the declarations of the files it places", () => {
        // Arrange
        const declaring = { ...leveledFile(CREATURE), children: [{ ...leveledFile(`${CREATURE}/Creature`), kind: "declaration" as const }] }

        // Act
        const arranged = arrangedByPackages(leveledFolder("/root", [declaring]), NAMESPACES, leaves)

        // Assert
        const [model] = arranged.children
        expect(model).toMatchObject({
            path: "package:com.game.model",
            name: "com.game.model",
            foldedPaths: ["package:com", "package:com.game"]
        })
        expect(model.children[0].children).toHaveLength(1)
        expect(arranged.children).toHaveLength(1)
    })

    it("should treat a package whose parent the map does not know, or which is its own parent some packages up, as a top-level one", () => {
        // Arrange
        const namespaces: Namespaces = {
            orphan: { parent: "missing", level: 0 },
            loopA: { parent: "loopB", level: 0 },
            loopB: { parent: "loopA", level: 0 }
        }
        const filed = { [CREATURE]: { A: leaf("orphan") }, [VIEW]: { B: leaf("loopA") } }

        // Act
        const arranged = arrangedByPackages(tree, namespaces, filed)

        // Assert
        expect(arranged.children.map(child => child.path)).toEqual(["package:orphan", "package:loopA", "/root/src", "/root/docs"])
        expect(arranged.children[1].children.map(child => child.path)).toEqual([VIEW])
    })

    it("should leave a tree that is a single file as it is", () => {
        // Arrange
        const file = leveledFile(CREATURE)

        // Act
        const arranged = arrangedByPackages(file, NAMESPACES, leaves)

        // Assert
        expect(arranged).toBe(file)
    })
})
