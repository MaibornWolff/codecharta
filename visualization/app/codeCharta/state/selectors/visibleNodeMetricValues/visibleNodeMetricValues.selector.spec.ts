import { CodeMapNode, NodeType } from "../../../codeCharta.model"
import { visibleNodeMetricValuesSelector } from "./visibleNodeMetricValues.selector"

function leaf(name: string, path: string, attributes: Record<string, number>, options: Partial<CodeMapNode> = {}): CodeMapNode {
    return { name, path, type: NodeType.FILE, attributes, ...options }
}

function folder(name: string, path: string, children: CodeMapNode[], options: Partial<CodeMapNode> = {}): CodeMapNode {
    return { name, path, type: NodeType.FOLDER, attributes: {}, children, ...options }
}

function run(unifiedMapNode: CodeMapNode | undefined, focusedNodePath: string[] = [], hoveredNode?: CodeMapNode) {
    return visibleNodeMetricValuesSelector.projector({ unifiedMapNode, unifiedFileMeta: undefined }, focusedNodePath, hoveredNode)
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
        expect(result.rloc.sum).toBe(30)
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
})
