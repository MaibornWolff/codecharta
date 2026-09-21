import { CodeMapNode, ExcludedNode, FlattenedNode, NodeType } from "../../../model/codeCharta.model"
import { createExcludeMatcher } from "../../../util/nodeRules/excludeMatcher"
import { createFlattenMatcher } from "../../../util/nodeRules/flattenMatcher"
import { _calculateExplorerCounts } from "./explorerCounts.selector"

const makeLeaf = (path: string, attributes: Record<string, number> = { unary: 1, rloc: 1 }): CodeMapNode => ({
    name: path.split("/").pop() ?? path,
    path,
    type: NodeType.FILE,
    attributes
})

const withExcludeFlags = (leaves: CodeMapNode[], excludedNodes: ExcludedNode[]): CodeMapNode[] => {
    const matcher = createExcludeMatcher(excludedNodes)
    return leaves.map(leaf => ({ ...leaf, isExcluded: matcher.isExcludedLeaf(leaf.path) }))
}

const flattenPredicateFor = (flattenedNodes: FlattenedNode[]) => {
    const matcher = createFlattenMatcher(flattenedNodes)
    return (node: CodeMapNode) => matcher.isFlattened(node.path)
}

describe("explorerCounts.selector", () => {
    describe("_calculateExplorerCounts", () => {
        const allLeaves: CodeMapNode[] = [
            makeLeaf("/root/src/alpha.kt"),
            makeLeaf("/root/src/beta.kt"),
            makeLeaf("/root/src/gamma.kt"),
            makeLeaf("/root/test/alpha.spec.ts"),
            makeLeaf("/root/test/beta.spec.ts")
        ]

        it("should return shown=all, flattened=0, excluded=0, noArea=0 with no rules and a valid metric", () => {
            // Arrange
            const excludedNodes: ExcludedNode[] = []
            const flattenedNodes: FlattenedNode[] = []
            const searchedNodes: CodeMapNode[] = []

            // Act
            const result = _calculateExplorerCounts(
                searchedNodes,
                withExcludeFlags(allLeaves, excludedNodes),
                "rloc",
                flattenPredicateFor(flattenedNodes)
            )

            // Assert
            expect(result).toEqual({ shown: 5, flattened: 0, excluded: 0, noArea: 0 })
        })

        it("should count flattened leaves only", () => {
            // Arrange
            const excludedNodes: ExcludedNode[] = []
            const flattenedNodes: FlattenedNode[] = [{ path: "*.spec.ts*" }]

            // Act
            const result = _calculateExplorerCounts(
                [],
                withExcludeFlags(allLeaves, excludedNodes),
                "rloc",
                flattenPredicateFor(flattenedNodes)
            )

            // Assert
            expect(result).toEqual({ shown: 3, flattened: 2, excluded: 0, noArea: 0 })
        })

        it("should count excluded leaves only", () => {
            // Arrange
            const excludedNodes: ExcludedNode[] = [{ path: "*test*" }]
            const flattenedNodes: FlattenedNode[] = []

            // Act
            const result = _calculateExplorerCounts(
                [],
                withExcludeFlags(allLeaves, excludedNodes),
                "rloc",
                flattenPredicateFor(flattenedNodes)
            )

            // Assert
            expect(result).toEqual({ shown: 3, flattened: 0, excluded: 2, noArea: 0 })
        })

        it("should count both flattened and excluded", () => {
            // Arrange
            const excludedNodes: ExcludedNode[] = [{ path: "*gamma*" }]
            const flattenedNodes: FlattenedNode[] = [{ path: "*.spec.ts*" }]

            // Act
            const result = _calculateExplorerCounts(
                [],
                withExcludeFlags(allLeaves, excludedNodes),
                "rloc",
                flattenPredicateFor(flattenedNodes)
            )

            // Assert
            expect(result).toEqual({ shown: 2, flattened: 2, excluded: 1, noArea: 0 })
        })

        it("should count leaves with no area metric among visible files", () => {
            // Arrange
            const leaves = [
                makeLeaf("/a", { rloc: 1 }),
                makeLeaf("/b", { rloc: 0 }),
                makeLeaf("/c", { rloc: 5 }),
                makeLeaf("/d", { unary: 1 })
            ]

            // Act
            const result = _calculateExplorerCounts([], withExcludeFlags(leaves, []), "rloc", flattenPredicateFor([]))

            // Assert
            expect(result.shown).toBe(4)
            expect(result.noArea).toBe(2)
        })

        it("should not count excluded leaves toward noArea", () => {
            // Arrange
            const leaves = [makeLeaf("/a", { rloc: 0 }), makeLeaf("/b", { rloc: 0 })]
            const excludedNodes: ExcludedNode[] = [{ path: "/a" }]

            // Act
            const result = _calculateExplorerCounts([], withExcludeFlags(leaves, excludedNodes), "rloc", flattenPredicateFor([]))

            // Assert
            expect(result.noArea).toBe(1)
        })

        it("should return zero counts for empty file set", () => {
            // Arrange & Act
            const result = _calculateExplorerCounts([], [], "rloc", flattenPredicateFor([]))

            // Assert
            expect(result).toEqual({ shown: 0, flattened: 0, excluded: 0, noArea: 0 })
        })

        it("should restrict counts when search pattern returns subset of leaves", () => {
            // Arrange
            const excludedNodes: ExcludedNode[] = []
            const flattenedNodes: FlattenedNode[] = [{ path: "*beta*" }]
            const flaggedLeaves = withExcludeFlags(allLeaves, excludedNodes)
            const searched = [flaggedLeaves[0], flaggedLeaves[1]]

            // Act
            const result = _calculateExplorerCounts(searched, flaggedLeaves, "rloc", flattenPredicateFor(flattenedNodes))

            // Assert
            expect(result.shown).toBe(1)
            expect(result.flattened).toBe(1)
            expect(result.excluded).toBe(0)
        })

        it("should ignore non-leaf nodes from searchedNodes", () => {
            // Arrange
            const folderNode: CodeMapNode = {
                name: "src",
                path: "/root/src",
                type: NodeType.FOLDER,
                attributes: { unary: 3, rloc: 3 },
                children: [allLeaves[0]]
            }
            const searched = [folderNode, allLeaves[0]]

            // Act
            const result = _calculateExplorerCounts(searched, allLeaves, "rloc", flattenPredicateFor([]))

            // Assert
            expect(result.shown).toBe(1)
        })

        it("should flatten every leaf that does not match a negated rule", () => {
            // Arrange: "!alpha" flattens everything except the two paths containing "alpha"
            const excludedNodes: ExcludedNode[] = []
            const flattenedNodes: FlattenedNode[] = [{ path: "!alpha" }]

            // Act
            const result = _calculateExplorerCounts(
                [],
                withExcludeFlags(allLeaves, excludedNodes),
                "rloc",
                flattenPredicateFor(flattenedNodes)
            )

            // Assert
            expect(result).toEqual({ shown: 2, flattened: 3, excluded: 0, noArea: 0 })
        })

        it("should match a bare rule as a substring, mirroring the decorator", () => {
            // Arrange: bare "beta" affects every path containing "beta", not only exact matches
            const excludedNodes: ExcludedNode[] = []
            const flattenedNodes: FlattenedNode[] = [{ path: "beta" }]

            // Act
            const result = _calculateExplorerCounts(
                [],
                withExcludeFlags(allLeaves, excludedNodes),
                "rloc",
                flattenPredicateFor(flattenedNodes)
            )

            // Assert
            expect(result.flattened).toBe(2)
        })
    })
})
