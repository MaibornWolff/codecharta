import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { buildLeveledTree, collapsedFirstLook, LeveledNode } from "./leveledTree"

function file(path: string): CodeMapNode {
    return { name: path.split("/").pop(), path, type: NodeType.FILE }
}

function folder(path: string, children: CodeMapNode[]): CodeMapNode {
    return { name: path.split("/").pop(), path, type: NodeType.FOLDER, children }
}

function leveledFolder(path: string, children: LeveledNode[]): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, isFolder: true, children }
}

function leveledFile(path: string): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, isFolder: false, children: [] }
}

describe("leveledTree", () => {
    describe("buildLeveledTree", () => {
        it("should keep files with a level and the folders holding them", () => {
            // Arrange
            const root = folder("/root", [folder("/root/app", [file("/root/app/a.ts"), file("/root/app/README.md")]), file("/root/b.ts")])
            const levels = { "/root/app": 1, "/root/app/a.ts": 2, "/root/b.ts": 0 }

            // Act
            const tree = buildLeveledTree(root, levels)

            // Assert
            expect(tree).toEqual({
                path: "/root",
                name: "root",
                level: 0,
                isFolder: true,
                children: [
                    {
                        path: "/root/app",
                        name: "app",
                        level: 1,
                        isFolder: true,
                        children: [{ path: "/root/app/a.ts", name: "a.ts", level: 2, isFolder: false, children: [] }]
                    },
                    { path: "/root/b.ts", name: "b.ts", level: 0, isFolder: false, children: [] }
                ]
            })
        })

        it("should fold a chain of single-folder folders into one box named by the chain", () => {
            // Arrange
            const root = folder("/root", [
                folder("/root/src", [folder("/root/src/main", [folder("/root/src/main/app", [file("/root/src/main/app/a.ts")])])]),
                file("/root/b.ts")
            ])
            const levels = { "/root/src": 3, "/root/src/main/app/a.ts": 0, "/root/b.ts": 0 }

            // Act
            const tree = buildLeveledTree(root, levels)

            // Assert
            expect(tree.children[0]).toMatchObject({ path: "/root/src/main/app", name: "src/main/app", level: 3, isFolder: true })
            expect(tree.children[0].children.map(child => child.path)).toEqual(["/root/src/main/app/a.ts"])
        })

        it("should keep the paths of the folders folded into a chain box, outermost first", () => {
            // Arrange
            const root = folder("/root", [
                folder("/root/src", [folder("/root/src/main", [file("/root/src/main/a.ts"), file("/root/src/main/b.ts")])])
            ])
            const levels = { "/root/src/main/a.ts": 0, "/root/src/main/b.ts": 1 }

            // Act
            const tree = buildLeveledTree(root, levels)

            // Assert
            expect(tree).toMatchObject({ path: "/root/src/main", name: "root/src/main", foldedPaths: ["/root", "/root/src"] })
        })

        it("should drop folders that hold no leveled file", () => {
            // Arrange
            const root = folder("/root", [folder("/root/docs", [file("/root/docs/guide.md")]), file("/root/a.ts")])
            const levels = { "/root/a.ts": 0 }

            // Act
            const tree = buildLeveledTree(root, levels)

            // Assert
            expect(tree.children.map(child => child.path)).toEqual(["/root/a.ts"])
        })

        it("should leave out excluded nodes", () => {
            // Arrange
            const excluded = { ...file("/root/b.ts"), isExcluded: true }
            const root = folder("/root", [file("/root/a.ts"), excluded])
            const levels = { "/root/a.ts": 0, "/root/b.ts": 0 }

            // Act
            const tree = buildLeveledTree(root, levels)

            // Assert
            expect(tree.children.map(child => child.path)).toEqual(["/root/a.ts"])
        })

        it("should return null when no file carries a level", () => {
            // Arrange
            const root = folder("/root", [file("/root/a.ts")])

            // Act
            const tree = buildLeveledTree(root, {})

            // Assert
            expect(tree).toBeNull()
        })
    })

    describe("collapsedFirstLook", () => {
        it("should open only the root, leaving every folder in it closed", () => {
            // Arrange
            const tree = leveledFolder("/root", [
                leveledFolder("/root/a", [leveledFolder("/root/a/deep", [leveledFile("/root/a/deep/1")])]),
                leveledFolder("/root/b", [leveledFile("/root/b/1")])
            ])

            // Act
            const opened = collapsedFirstLook(tree)

            // Assert
            expect([...opened]).toEqual(["/root"])
        })

        it("should open a chain of single folders below the root, so the first look is never one lone box", () => {
            // Arrange
            const tree = leveledFolder("/root", [
                leveledFolder("/root/src", [
                    leveledFolder("/root/src/main", [
                        leveledFolder("/root/src/main/a", [leveledFile("/root/src/main/a/1")]),
                        leveledFile("/root/src/main/b")
                    ])
                ])
            ])

            // Act
            const opened = collapsedFirstLook(tree)

            // Assert
            expect([...opened]).toEqual(["/root", "/root/src", "/root/src/main"])
        })
    })
})
