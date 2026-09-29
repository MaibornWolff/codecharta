import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { countDependencyExplorer } from "./dependencyExplorerCounts"

function leaf(path: string, isExcluded = false): CodeMapNode {
    return { name: path.split("/").pop(), path, type: NodeType.FILE, attributes: {}, isExcluded }
}

const LEAVES = [leaf("/root/a.ts"), leaf("/root/b.ts", true), leaf("/root/README.md")]
const PATHS_WITH_LEVELS = new Set(["/root/a.ts", "/root/b.ts"])

describe("countDependencyExplorer", () => {
    it("should count the files the graph shows and the excluded ones, and nothing as flattened", () => {
        // Act
        const counts = countDependencyExplorer([], LEAVES, PATHS_WITH_LEVELS)

        // Assert
        expect(counts).toEqual({ shown: 1, flattened: 0, excluded: 1, noArea: 0 })
    })

    it("should count only the files a search found", () => {
        // Arrange
        const folder = { name: "root", path: "/root", type: NodeType.FOLDER, attributes: {}, children: [LEAVES[1]] } as CodeMapNode

        // Act
        const counts = countDependencyExplorer([folder, LEAVES[1]], LEAVES, PATHS_WITH_LEVELS)

        // Assert
        expect(counts).toEqual({ shown: 0, flattened: 0, excluded: 1, noArea: 0 })
    })
})
