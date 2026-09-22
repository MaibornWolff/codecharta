import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { buildSunburstTree, findClosestFolder, findClosestNode, findFolder, isInside, parentPath } from "./sunburstTree"

const METRICS = { areaMetric: "rloc", colorMetric: "mcc" }
const NOTHING_IS_FLAT = () => false

function file(path: string, attributes: Record<string, number>, overrides: Partial<CodeMapNode> = {}): CodeMapNode {
    return { name: path.split("/").at(-1), path, type: NodeType.FILE, attributes, ...overrides }
}

function folder(path: string, children: CodeMapNode[], attributes: Record<string, number> = {}): CodeMapNode {
    return { name: path.split("/").at(-1), path, type: NodeType.FOLDER, attributes, children }
}

describe("buildSunburstTree", () => {
    it("should keep folders and files, sizing each folder by the area of all files below it", () => {
        // Arrange
        const root = folder("/root", [
            file("/root/a.ts", { rloc: 10 }),
            folder("/root/src", [
                file("/root/src/b.ts", { rloc: 30 }),
                folder("/root/src/deep", [file("/root/src/deep/c.ts", { rloc: 5 })])
            ])
        ])

        // Act
        const result = buildSunburstTree(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.area).toBe(45)
        expect(result.children.map(child => [child.path, child.isFile, child.area])).toEqual([
            ["/root/a.ts", true, 10],
            ["/root/src", false, 35]
        ])
        expect(result.children[1].children[1].children[0]).toEqual(expect.objectContaining({ path: "/root/src/deep/c.ts", isFile: true }))
    })

    it("should give a folder the summed colour value of its files and a file its own", () => {
        // Arrange
        const root = folder("/root", [folder("/root/src", [file("/root/src/a.ts", { rloc: 10, mcc: 40 })], { mcc: 40 })], { mcc: 55 })

        // Act
        const result = buildSunburstTree(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.colorValue).toBe(55)
        expect(result.children[0].colorValue).toBe(40)
        expect(result.children[0].children[0].colorValue).toBe(40)
    })

    it("should leave out excluded files", () => {
        // Arrange
        const root = folder("/root", [file("/root/a.ts", { rloc: 10 }), file("/root/excluded.ts", { rloc: 90 }, { isExcluded: true })])

        // Act
        const result = buildSunburstTree(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.area).toBe(10)
        expect(result.children.map(child => child.path)).toEqual(["/root/a.ts"])
    })

    it("should leave out files and folders without any area", () => {
        // Arrange
        const root = folder("/root", [
            file("/root/a.ts", { rloc: 10 }),
            file("/root/noArea.ts", { mcc: 3 }),
            folder("/root/empty", [file("/root/empty/b.ts", { rloc: 0 })])
        ])

        // Act
        const result = buildSunburstTree(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.children.map(child => child.path)).toEqual(["/root/a.ts"])
    })

    it("should mark flattened folders and files", () => {
        // Arrange
        const root = folder("/root", [
            folder("/root/flatFolder", [file("/root/flatFolder/b.ts", { rloc: 5 })]),
            file("/root/flat.ts", { rloc: 1 })
        ])
        const isFlat = (node: CodeMapNode) => node.path === "/root/flatFolder" || node.path === "/root/flat.ts"

        // Act
        const result = buildSunburstTree(root, METRICS, isFlat)

        // Assert
        expect(result.isFlat).toBe(false)
        expect(result.children.map(child => child.isFlat)).toEqual([true, true])
    })

    it("should have no colour value for a node without the colour metric", () => {
        // Arrange
        const root = folder("/root", [file("/root/a.ts", { rloc: 10 })])

        // Act
        const result = buildSunburstTree(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.colorValue).toBeUndefined()
        expect(result.children[0].colorValue).toBeUndefined()
    })

    it("should return null for a map that is a single file", () => {
        // Act
        const result = buildSunburstTree(file("/root", { rloc: 10 }), METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result).toBeNull()
    })

    it("should return null for a map without any area", () => {
        // Act
        const result = buildSunburstTree(folder("/root", [file("/root/a.ts", { rloc: 0 })]), METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result).toBeNull()
    })
})

describe("node lookup", () => {
    const tree = buildSunburstTree(
        folder("/root", [
            folder("/root/src", [folder("/root/src/app", [file("/root/src/app/a.ts", { rloc: 1 })])]),
            folder("/root/srcOther", [file("/root/srcOther/b.ts", { rloc: 1 })]),
            file("/root/src.ts", { rloc: 1 })
        ]),
        METRICS,
        NOTHING_IS_FLAT
    )

    it("should find a folder by its path", () => {
        // Act
        const result = findFolder(tree, "/root/src/app")

        // Assert
        expect(result.path).toBe("/root/src/app")
    })

    it("should not mistake a folder for another one that merely starts with the same name", () => {
        // Act
        const result = findFolder(tree, "/root/srcOther")

        // Assert
        expect(result.path).toBe("/root/srcOther")
    })

    it("should find no folder for a file's path", () => {
        // Act
        const result = findFolder(tree, "/root/src/app/a.ts")

        // Assert
        expect(result).toBeUndefined()
    })

    it("should find the deepest folder containing a path, never a file", () => {
        // Assert
        expect(findClosestFolder(tree, "/root/src/app/a.ts").path).toBe("/root/src/app")
        expect(findClosestFolder(tree, "/root/src.ts").path).toBe("/root")
    })

    it("should find the deepest node containing a path, files included", () => {
        // Assert
        expect(findClosestNode(tree, "/root/src/app/a.ts").path).toBe("/root/src/app/a.ts")
        expect(findClosestNode(tree, "/root/src/app/a.ts", 1).path).toBe("/root/src")
    })

    it("should fall back to the root for a path outside the tree", () => {
        // Act
        const result = findClosestFolder(tree, "/elsewhere/x")

        // Assert
        expect(result.path).toBe("/root")
    })

    it("should tell whether a path lies inside a folder", () => {
        // Assert
        expect(isInside("/root/src/a.ts", "/root/src")).toBe(true)
        expect(isInside("/root/src", "/root/src")).toBe(true)
        expect(isInside("/root/srcOther", "/root/src")).toBe(false)
    })

    it("should give the parent of a path", () => {
        // Assert
        expect(parentPath("/root/src/a.ts")).toBe("/root/src")
    })
})
