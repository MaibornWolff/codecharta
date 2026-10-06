import { LeveledNode } from "./leveledTree"
import { boxPathOf, containerPathsOf, indexTree, levelPathOf } from "./treeIndex"

function leveledFolder(path: string, children: LeveledNode[]): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, kind: "folder", children }
}

function leveledFile(path: string): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, kind: "file", children: [] }
}

describe("treeIndex", () => {
    describe("boxPathOf", () => {
        it("should find a folder's own box, the chain box it is folded into, and nothing for a folder the graph lacks", () => {
            // Arrange
            const chain = { ...leveledFolder("/root/lib/core", [leveledFile("/root/lib/core/io.ts")]), foldedPaths: ["/root/lib"] }
            const tree = leveledFolder("/root", [chain, leveledFolder("/root/ui", [leveledFile("/root/ui/view.ts")])])

            // Act
            const boxPaths = ["/root/ui", "/root/lib", "/root/docs"].map(path => boxPathOf(indexTree(tree), path))

            // Assert
            expect(boxPaths).toEqual(["/root/ui", "/root/lib/core", null])
        })
    })

    describe("levelPathOf", () => {
        it("should list the levels down to a folder's box, counting a folded chain once, and nothing for a folder the graph lacks", () => {
            // Arrange
            const core = { ...leveledFolder("/root/lib/core/io", [leveledFile("/root/lib/core/io/file.ts")]), level: 2 }
            const chain = { ...leveledFolder("/root/lib/core", [core]), level: 1, foldedPaths: ["/root/lib"] }
            const tree = leveledFolder("/root", [chain])

            // Act
            const levelPaths = ["/root", "/root/lib", "/root/lib/core/io", "/root/docs"].map(path => levelPathOf(indexTree(tree), path))

            // Assert
            expect(levelPaths).toEqual([[], [1], [1, 2], null])
        })
    })

    describe("containerPathsOf", () => {
        const chain = { ...leveledFolder("/root/src/main", [leveledFile("/root/src/main/a.ts")]), foldedPaths: ["/root/src"] }
        const tree = leveledFolder("/root", [chain, leveledFile("/root/b.ts")])

        it("should name the boxes around a node, outermost first, a chain box once", () => {
            // Arrange
            const fileInTheChainBox = "/root/src/main/a.ts"

            // Act
            const containers = containerPathsOf(indexTree(tree), fileInTheChainBox)

            // Assert
            expect(containers).toEqual(["/root", "/root/src/main"])
        })

        it("should name the boxes around a folder folded into a chain box, none around the root, and null for an unknown path", () => {
            // Arrange
            const foldedFolderRootAndUnknown = ["/root/src", "/root", "/root/unknown.ts"]

            // Act
            const containers = foldedFolderRootAndUnknown.map(path => containerPathsOf(indexTree(tree), path))

            // Assert
            expect(containers).toEqual([["/root"], [], null])
        })
    })
})
