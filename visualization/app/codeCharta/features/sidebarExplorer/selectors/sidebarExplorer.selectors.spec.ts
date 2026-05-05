import { BlacklistItem, CodeMapNode, NodeType } from "../../../codeCharta.model"
import { _calculateExplorerCounts } from "./sidebarExplorer.selectors"

const makeLeaf = (path: string, attributes: Record<string, number> = { unary: 1, rloc: 1 }): CodeMapNode => ({
    name: path.split("/").pop() ?? path,
    path,
    type: NodeType.FILE,
    attributes
})

describe("sidebarExplorer.selectors", () => {
    describe("_calculateExplorerCounts", () => {
        const allLeaves: CodeMapNode[] = [
            makeLeaf("/root/src/alpha.kt"),
            makeLeaf("/root/src/beta.kt"),
            makeLeaf("/root/src/gamma.kt"),
            makeLeaf("/root/test/alpha.spec.ts"),
            makeLeaf("/root/test/beta.spec.ts")
        ]

        it("should return shown=all, flattened=0, hidden=0, noArea=0 with empty blacklist and valid metric", () => {
            // Arrange
            const blacklist: BlacklistItem[] = []
            const searchedNodes: CodeMapNode[] = []

            // Act
            const result = _calculateExplorerCounts(searchedNodes, blacklist, allLeaves, "rloc")

            // Assert
            expect(result).toEqual({ shown: 5, flattened: 0, hidden: 0, noArea: 0 })
        })

        it("should count flattened leaves only", () => {
            // Arrange
            const blacklist: BlacklistItem[] = [{ type: "flatten", path: "*.spec.ts*" }]

            // Act
            const result = _calculateExplorerCounts([], blacklist, allLeaves, "rloc")

            // Assert
            expect(result).toEqual({ shown: 3, flattened: 2, hidden: 0, noArea: 0 })
        })

        it("should count hidden leaves only", () => {
            // Arrange
            const blacklist: BlacklistItem[] = [{ type: "exclude", path: "*test*" }]

            // Act
            const result = _calculateExplorerCounts([], blacklist, allLeaves, "rloc")

            // Assert
            expect(result).toEqual({ shown: 3, flattened: 0, hidden: 2, noArea: 0 })
        })

        it("should count both flattened and hidden", () => {
            // Arrange
            const blacklist: BlacklistItem[] = [
                { type: "flatten", path: "*.spec.ts*" },
                { type: "exclude", path: "*gamma*" }
            ]

            // Act
            const result = _calculateExplorerCounts([], blacklist, allLeaves, "rloc")

            // Assert
            expect(result).toEqual({ shown: 2, flattened: 2, hidden: 1, noArea: 0 })
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
            const result = _calculateExplorerCounts([], [], leaves, "rloc")

            // Assert
            expect(result.shown).toBe(4)
            expect(result.noArea).toBe(2)
        })

        it("should not count blacklisted leaves toward noArea", () => {
            // Arrange
            const leaves = [makeLeaf("/a", { rloc: 0 }), makeLeaf("/b", { rloc: 0 })]
            const blacklist: BlacklistItem[] = [{ type: "exclude", path: "*a*" }]

            // Act
            const result = _calculateExplorerCounts([], blacklist, leaves, "rloc")

            // Assert
            expect(result.noArea).toBe(1)
        })

        it("should return zero counts for empty file set", () => {
            // Arrange & Act
            const result = _calculateExplorerCounts([], [], [], "rloc")

            // Assert
            expect(result).toEqual({ shown: 0, flattened: 0, hidden: 0, noArea: 0 })
        })

        it("should restrict counts when search pattern returns subset of leaves", () => {
            // Arrange
            const searched = [allLeaves[0], allLeaves[1]]
            const blacklist: BlacklistItem[] = [{ type: "flatten", path: "*alpha*" }]

            // Act
            const result = _calculateExplorerCounts(searched, blacklist, allLeaves, "rloc")

            // Assert
            expect(result.shown).toBe(1)
            expect(result.flattened).toBe(1)
            expect(result.hidden).toBe(0)
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
            const result = _calculateExplorerCounts(searched, [], allLeaves, "rloc")

            // Assert
            expect(result.shown).toBe(1)
        })
    })
})
