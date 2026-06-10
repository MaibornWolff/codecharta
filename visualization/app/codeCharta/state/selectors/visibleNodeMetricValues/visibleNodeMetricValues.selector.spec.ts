import { CodeMapNode, NodeType } from "../../../codeCharta.model"
import { visibleNodeMetricValuesSelector } from "./visibleNodeMetricValues.selector"

function leaf(name: string, path: string, attributes: Record<string, number>, options: Partial<CodeMapNode> = {}): CodeMapNode {
    return { name, path, type: NodeType.FILE, attributes, ...options }
}

function folder(name: string, path: string, children: CodeMapNode[], options: Partial<CodeMapNode> = {}): CodeMapNode {
    return { name, path, type: NodeType.FOLDER, attributes: {}, children, ...options }
}

function run(
    unifiedMapNode: CodeMapNode | undefined,
    focusedNodePath: string[] = [],
    hoveredNode?: CodeMapNode,
    metrics: { area: string; height: string; color: string } = { area: "rloc", height: "rloc", color: "rloc" }
) {
    const hoveredFolderPath = hoveredNode?.children && hoveredNode.children.length > 0 && hoveredNode.path ? hoveredNode.path : null
    return visibleNodeMetricValuesSelector.projector(
        { unifiedMapNode, unifiedFileMeta: undefined },
        focusedNodePath,
        hoveredFolderPath,
        metrics.area,
        metrics.height,
        metrics.color
    )
}

describe("visibleNodeMetricValuesSelector", () => {
    it("should return an empty object when unifiedMapNode is undefined", () => {
        // Arrange / Act
        const result = run(undefined)

        // Assert
        expect(result).toEqual({})
    })

    it("should collect values from leaf attributes", () => {
        // Arrange
        const root = folder("root", "/root", [leaf("a.ts", "/root/a.ts", { rloc: 10 }), leaf("b.ts", "/root/b.ts", { rloc: 20 })])

        // Act
        const result = run(root)

        // Assert
        expect(result.rloc.values).toEqual([10, 20])
        expect(result.rloc.minValue).toBe(10)
        expect(result.rloc.maxValue).toBe(20)
    })

    it("should skip excluded leaf nodes", () => {
        // Arrange
        const root = folder("root", "/root", [
            leaf("a.ts", "/root/a.ts", { rloc: 10 }, { isExcluded: true }),
            leaf("b.ts", "/root/b.ts", { rloc: 20 })
        ])

        // Act
        const result = run(root)

        // Assert
        expect(result.rloc.values).toEqual([20])
    })

    it("should skip flattened leaf nodes", () => {
        // Arrange
        const root = folder("root", "/root", [
            leaf("a.ts", "/root/a.ts", { rloc: 10 }, { isFlattened: true }),
            leaf("b.ts", "/root/b.ts", { rloc: 20 })
        ])

        // Act
        const result = run(root)

        // Assert
        expect(result.rloc.values).toEqual([20])
    })

    it("should restrict values to the focused subtree", () => {
        // Arrange
        const root = folder("root", "/root", [
            folder("focused", "/root/focused", [
                leaf("a.ts", "/root/focused/a.ts", { rloc: 5 }),
                leaf("b.ts", "/root/focused/b.ts", { rloc: 7 })
            ]),
            folder("other", "/root/other", [leaf("c.ts", "/root/other/c.ts", { rloc: 99 })])
        ])

        // Act
        const result = run(root, ["/root/focused"])

        // Assert
        expect(result.rloc.values.sort()).toEqual([5, 7])
    })

    it("should restrict values to the hovered folder's subtree", () => {
        // Arrange
        const hoveredFolder = folder("nested", "/root/nested", [
            leaf("a.ts", "/root/nested/a.ts", { rloc: 1 }),
            leaf("b.ts", "/root/nested/b.ts", { rloc: 2 })
        ])
        const root = folder("root", "/root", [hoveredFolder, leaf("c.ts", "/root/c.ts", { rloc: 99 })])

        // Act
        const result = run(root, [], hoveredFolder)

        // Assert
        expect(result.rloc.values.sort()).toEqual([1, 2])
    })

    it("should prefer the hovered folder over the focused path", () => {
        // Arrange
        const hoveredFolder = folder("hovered", "/root/focused/inner", [leaf("a.ts", "/root/focused/inner/a.ts", { rloc: 42 })])
        const root = folder("root", "/root", [
            folder("focused", "/root/focused", [hoveredFolder, leaf("b.ts", "/root/focused/b.ts", { rloc: 7 })]),
            folder("other", "/root/other", [leaf("c.ts", "/root/other/c.ts", { rloc: 99 })])
        ])

        // Act
        const result = run(root, ["/root/focused"], hoveredFolder)

        // Assert
        expect(result.rloc.values).toEqual([42])
    })

    it("should keep the focused subtree when hovering a folder outside of it", () => {
        // Arrange: the file explorer shows the full tree, but only the focused part is rendered
        const hoveredOutside = folder("other", "/root/other", [leaf("c.ts", "/root/other/c.ts", { rloc: 99 })])
        const root = folder("root", "/root", [
            folder("focused", "/root/focused", [leaf("a.ts", "/root/focused/a.ts", { rloc: 5 })]),
            hoveredOutside
        ])

        // Act
        const result = run(root, ["/root/focused"], hoveredOutside)

        // Assert
        expect(result.rloc.values).toEqual([5])
    })

    it("should collect only the displayed area, height and color metrics", () => {
        // Arrange
        const root = folder("root", "/root", [leaf("a.ts", "/root/a.ts", { rloc: 1, mcc: 2, functions: 3, comment_lines: 9 })])

        // Act
        const result = run(root, [], undefined, { area: "rloc", height: "mcc", color: "functions" })

        // Assert
        expect(Object.keys(result).sort()).toEqual(["functions", "mcc", "rloc"])
    })

    it("should ignore hovered leaf nodes", () => {
        // Arrange
        const hoveredLeaf = leaf("a.ts", "/root/a.ts", { rloc: 5 })
        const root = folder("root", "/root", [hoveredLeaf, leaf("b.ts", "/root/b.ts", { rloc: 10 })])

        // Act
        const result = run(root, [], hoveredLeaf)

        // Assert
        expect(result.rloc.values.sort()).toEqual([10, 5])
    })

    it("should exclude sibling folders that share a path prefix with the focused subtree", () => {
        // Arrange
        const root = folder("root", "/root", [
            folder("components", "/root/components", [leaf("a.ts", "/root/components/a.ts", { rloc: 5 })]),
            folder("components-old", "/root/components-old", [leaf("b.ts", "/root/components-old/b.ts", { rloc: 99 })])
        ])

        // Act
        const result = run(root, ["/root/components"])

        // Assert
        expect(result.rloc.values).toEqual([5])
    })

    it("should ignore non-finite metric values", () => {
        // Arrange
        const root = folder("root", "/root", [leaf("a.ts", "/root/a.ts", { rloc: Number.NaN }), leaf("b.ts", "/root/b.ts", { rloc: 4 })])

        // Act
        const result = run(root)

        // Assert
        expect(result.rloc.values).toEqual([4])
    })

    it("should use only the top-of-stack focused path element for filtering when multiple are present", () => {
        // Arrange
        const root = folder("root", "/root", [
            folder("focused", "/root/focused", [leaf("a.ts", "/root/focused/a.ts", { rloc: 5 })]),
            folder("other", "/root/other", [leaf("c.ts", "/root/other/c.ts", { rloc: 99 })])
        ])

        // Act
        const result = run(root, ["/root/focused", "/root/other"])

        // Assert
        expect(result.rloc.values).toEqual([5])
    })

    it("should handle leaf nodes with empty attributes without contributing any values", () => {
        // Arrange
        const root = folder("root", "/root", [leaf("a.ts", "/root/a.ts", {}), leaf("b.ts", "/root/b.ts", { rloc: 8 })])

        // Act
        const result = run(root)

        // Assert
        expect(result.rloc.values).toEqual([8])
        expect(Object.keys(result)).toEqual(["rloc"])
    })

    it("should return an empty object when the focused path prefix matches no node", () => {
        // Arrange
        const root = folder("root", "/root", [leaf("a.ts", "/root/a.ts", { rloc: 5 }), leaf("b.ts", "/root/b.ts", { rloc: 7 })])

        // Act
        const result = run(root, ["/root/does-not-exist"])

        // Assert
        expect(result).toEqual({})
    })

    it("should not throw when a leaf node has no path", () => {
        // Arrange
        const root = folder("root", "/root", [
            leaf("a.ts", undefined as unknown as string, { rloc: 5 }),
            leaf("b.ts", "/root/b.ts", { rloc: 7 })
        ])

        // Act
        const act = () => run(root, ["/root"])

        // Assert
        expect(act).not.toThrow()
        expect(act().rloc.values.sort()).toEqual([5, 7])
    })
})
