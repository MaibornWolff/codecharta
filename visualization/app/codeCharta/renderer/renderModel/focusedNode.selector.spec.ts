import { CodeMapNode, NodeType } from "../../model/codeCharta.model"
import { focusedNodeSelector } from "./focusedNode.selector"

describe("focusedNodeSelector", () => {
    const focusedFolder: CodeMapNode = { name: "app", path: "/root/app", type: NodeType.FOLDER, attributes: {} }
    const pathToNode = new Map([[focusedFolder.path, focusedFolder]])

    it("should resolve the focused path to its node", () => {
        // Arrange
        const focusedNodePath = "/root/app"

        // Act
        const focusedNode = focusedNodeSelector.projector(focusedNodePath, pathToNode)

        // Assert
        expect(focusedNode).toBe(focusedFolder)
    })

    it("should be undefined when nothing is focused", () => {
        // Arrange
        const focusedNodePath = undefined

        // Act
        const focusedNode = focusedNodeSelector.projector(focusedNodePath, pathToNode)

        // Assert
        expect(focusedNode).toBeUndefined()
    })

    it("should be undefined when the focused path is not in the map", () => {
        // Arrange
        const focusedNodePath = "/root/gone"

        // Act
        const focusedNode = focusedNodeSelector.projector(focusedNodePath, pathToNode)

        // Assert
        expect(focusedNode).toBeUndefined()
    })
})
