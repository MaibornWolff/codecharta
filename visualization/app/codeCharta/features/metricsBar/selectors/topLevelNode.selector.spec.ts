import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { topLevelNodeSelector } from "./topLevelNode.selector"

describe("topLevelNodeSelector", () => {
    const folder = { name: "folder", path: "/root/folder", type: NodeType.FOLDER, attributes: { rloc: 30 }, children: [] } as CodeMapNode
    const root = { name: "root", path: "/root", type: NodeType.FOLDER, attributes: { rloc: 100 }, children: [folder] } as CodeMapNode
    const pathToNode = new Map([
        [root.path, root],
        [folder.path, folder]
    ])

    it("should return the map's root when no folder is focused", () => {
        // Arrange
        const accumulatedData = { unifiedMapNode: root, unifiedFileMeta: undefined }

        // Act
        const result = topLevelNodeSelector.projector(accumulatedData, pathToNode, undefined)

        // Assert
        expect(result).toBe(root)
    })

    it("should return the focused folder when a folder is focused", () => {
        // Arrange
        const accumulatedData = { unifiedMapNode: root, unifiedFileMeta: undefined }

        // Act
        const result = topLevelNodeSelector.projector(accumulatedData, pathToNode, folder.path)

        // Assert
        expect(result).toBe(folder)
    })

    it("should return the map's root when the focused folder is no longer in the map", () => {
        // Arrange
        const accumulatedData = { unifiedMapNode: root, unifiedFileMeta: undefined }

        // Act
        const result = topLevelNodeSelector.projector(accumulatedData, pathToNode, "/root/removed")

        // Assert
        expect(result).toBe(root)
    })

    it("should return undefined when no map is loaded", () => {
        // Arrange
        const accumulatedData = { unifiedMapNode: undefined, unifiedFileMeta: undefined }

        // Act
        const result = topLevelNodeSelector.projector(accumulatedData, new Map(), undefined)

        // Assert
        expect(result).toBeUndefined()
    })
})
