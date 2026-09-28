import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { buildLeveledTree, expandWithinBudget, LeveledNode } from "./leveledTree"

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

    describe("expandWithinBudget", () => {
        it("should open folders breadth first while the visible boxes fit the budget", () => {
            // Arrange
            const tree = leveledFolder("/root", [
                leveledFolder("/root/a", [leveledFile("/root/a/1"), leveledFile("/root/a/2")]),
                leveledFolder("/root/b", [leveledFile("/root/b/1"), leveledFile("/root/b/2"), leveledFile("/root/b/3")])
            ])

            // Act
            const expanded = expandWithinBudget(tree, 4)

            // Assert
            expect([...expanded]).toEqual(["/root", "/root/a"])
        })

        it("should open a chain of single-child folders for free", () => {
            // Arrange
            const tree = leveledFolder("/root", [
                leveledFolder("/root/src", [leveledFolder("/root/src/main", [leveledFile("/root/src/main/a")])])
            ])

            // Act
            const expanded = expandWithinBudget(tree, 1)

            // Assert
            expect([...expanded]).toEqual(["/root", "/root/src", "/root/src/main"])
        })
    })
})
