import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { buildSunburstFolders, colorValueRange, findClosestFolder, findFolder, isInside, parentPath } from "./sunburstFolders"

const METRICS = { areaMetric: "rloc", colorMetric: "mcc" }
const NOTHING_IS_FLAT = () => false

function file(path: string, attributes: Record<string, number>, overrides: Partial<CodeMapNode> = {}): CodeMapNode {
    return { name: path.split("/").at(-1), path, type: NodeType.FILE, attributes, ...overrides }
}

function folder(path: string, children: CodeMapNode[], attributes: Record<string, number> = {}): CodeMapNode {
    return { name: path.split("/").at(-1), path, type: NodeType.FOLDER, attributes, children }
}

describe("buildSunburstFolders", () => {
    it("should keep only folders and size each one by the area of all files below it", () => {
        // Arrange
        const root = folder("/root", [
            file("/root/a.ts", { rloc: 10, mcc: 1 }),
            folder("/root/src", [
                file("/root/src/b.ts", { rloc: 30, mcc: 1 }),
                folder("/root/src/deep", [file("/root/src/deep/c.ts", { rloc: 5, mcc: 1 })])
            ])
        ])

        // Act
        const result = buildSunburstFolders(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.area).toBe(45)
        expect(result.children.map(child => child.path)).toEqual(["/root/src"])
        expect(result.children[0].area).toBe(35)
        expect(result.children[0].children[0].area).toBe(5)
        expect(result.children[0].children[0].children).toEqual([])
    })

    it("should colour a folder by its own colour value, the one the inspector shows", () => {
        // Arrange
        const root = folder("/root", [folder("/root/src", [file("/root/src/a.ts", { rloc: 10, mcc: 40 })], { mcc: 40 })], { mcc: 55 })

        // Act
        const result = buildSunburstFolders(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.colorValue).toBe(55)
        expect(result.children[0].colorValue).toBe(40)
    })

    it("should leave excluded files out of the size", () => {
        // Arrange
        const root = folder("/root", [
            file("/root/a.ts", { rloc: 10, mcc: 2 }),
            file("/root/excluded.ts", { rloc: 90, mcc: 100 }, { isExcluded: true })
        ])

        // Act
        const result = buildSunburstFolders(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.area).toBe(10)
    })

    it("should drop folders without any area", () => {
        // Arrange
        const root = folder("/root", [
            file("/root/a.ts", { rloc: 10, mcc: 1 }),
            folder("/root/empty", [file("/root/empty/b.ts", { rloc: 0, mcc: 1 })])
        ])

        // Act
        const result = buildSunburstFolders(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.children).toEqual([])
    })

    it("should mark flattened folders", () => {
        // Arrange
        const root = folder("/root", [folder("/root/flatFolder", [file("/root/flatFolder/b.ts", { rloc: 5 })])])
        const isFlat = (node: CodeMapNode) => node.path === "/root/flatFolder"

        // Act
        const result = buildSunburstFolders(root, METRICS, isFlat)

        // Assert
        expect(result.isFlat).toBe(false)
        expect(result.children[0].isFlat).toBe(true)
    })

    it("should have no colour value for a folder without the colour metric", () => {
        // Arrange
        const root = folder("/root", [file("/root/a.ts", { rloc: 10 })])

        // Act
        const result = buildSunburstFolders(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.colorValue).toBeUndefined()
    })

    it("should treat a missing area metric as no area", () => {
        // Arrange
        const root = folder("/root", [file("/root/a.ts", { mcc: 3 }), file("/root/b.ts", { rloc: 4, mcc: 1 })])

        // Act
        const result = buildSunburstFolders(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result.area).toBe(4)
    })

    it("should return null for a map that is a single file", () => {
        // Arrange
        const root = file("/root", { rloc: 10 })

        // Act
        const result = buildSunburstFolders(root, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(result).toBeNull()
    })
})

describe("colorValueRange", () => {
    it("should span the colour values of every folder in the tree", () => {
        // Arrange
        const tree = buildSunburstFolders(
            folder(
                "/root",
                [
                    folder("/root/a", [file("/root/a/x.ts", { rloc: 1 })], { mcc: 3 }),
                    folder("/root/b", [file("/root/b/y.ts", { rloc: 1 })], { mcc: 9 })
                ],
                { mcc: 12 }
            ),
            METRICS,
            NOTHING_IS_FLAT
        )

        // Act
        const range = colorValueRange(tree)

        // Assert
        expect(range).toEqual({ minValue: 3, maxValue: 12 })
    })

    it("should have no range when no folder carries the colour metric", () => {
        // Arrange
        const tree = buildSunburstFolders(folder("/root", [file("/root/a.ts", { rloc: 1 })]), METRICS, NOTHING_IS_FLAT)

        // Act
        const range = colorValueRange(tree)

        // Assert
        expect(range).toBeNull()
    })
})

describe("folder lookup", () => {
    const tree = buildSunburstFolders(
        folder("/root", [
            folder("/root/src", [folder("/root/src/app", [file("/root/src/app/a.ts", { rloc: 1 })])]),
            folder("/root/srcOther", [file("/root/srcOther/b.ts", { rloc: 1 })])
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

    it("should find nothing for a path that is not a folder in the tree", () => {
        // Act
        const result = findFolder(tree, "/root/src/app/a.ts")

        // Assert
        expect(result).toBeUndefined()
    })

    it("should find the deepest folder containing a path", () => {
        // Act
        const result = findClosestFolder(tree, "/root/src/app/a.ts")

        // Assert
        expect(result.path).toBe("/root/src/app")
    })

    it("should stop looking deeper than the given number of levels", () => {
        // Act
        const result = findClosestFolder(tree, "/root/src/app/a.ts", 1)

        // Assert
        expect(result.path).toBe("/root/src")
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
